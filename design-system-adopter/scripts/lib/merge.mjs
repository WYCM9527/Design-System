// 三方合并：base = 上游快照（上次接入 / 升级时的上游），local = 项目工作副本，remote = 新上游。
// JSON（tokens / scope-map / theme-map）做键级合并：不同键各取各的，同一键两边都改且不同才算冲突；
// markdown 等其他文件只到文件级：两边都改 = 冲突，交给用户选（保留本地 / 取上游 / 写冲突标记）。
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (dir, f) => { const p = join(dir, f); return existsSync(p) ? readFileSync(p, 'utf8') : null; };
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** 键级三方合并。返回 { merged, conflicts: [{ path, base, local, remote }] }。TOMBSTONE 表示删除。 */
const TOMBSTONE = Symbol('deleted');
export function mergeJson(base, local, remote) {
  const conflicts = [];
  function rec(b, l, r, path) {
    const bU = b === undefined, lU = l === undefined, rU = r === undefined;
    if (eq(l, r)) return lU ? TOMBSTONE : l;                    // 两边一致（含两边都删）
    if (eq(b, l)) return rU ? TOMBSTONE : r;                    // 本地没动 → 取上游（含上游删除）
    if (eq(b, r)) return lU ? TOMBSTONE : l;                    // 上游没动 → 留本地（含本地删除）
    if (isObj(b ?? {}) && isObj(l ?? {}) && isObj(r ?? {}) && (isObj(l) || isObj(r))) {
      // 对象：逐键下钻（任一侧是对象就尝试；标量对不上会在叶子层记冲突）
      const keys = new Set([...Object.keys(isObj(b) ? b : {}), ...Object.keys(isObj(l) ? l : {}), ...Object.keys(isObj(r) ? r : {})]);
      const out = {};
      for (const k of keys) {
        const v = rec(isObj(b) ? b[k] : undefined, isObj(l) ? l[k] : undefined, isObj(r) ? r[k] : undefined, [...path, k]);
        if (v !== TOMBSTONE) out[k] = v;
      }
      return out;
    }
    conflicts.push({ path: path.join('.'), base: b, local: l, remote: r });
    return lU ? TOMBSTONE : l;   // 冲突位先保持本地，等决议
  }
  const merged = rec(base, local, remote, []);
  return { merged: merged === TOMBSTONE ? {} : merged, conflicts };
}

/**
 * 对一组 owned 文件做三方分类。
 * 返回 { unchanged, updated, keptLocal, added, addedConflicts, removedUpstream, jsonMerges, conflicts }
 *   jsonMerges: [{ file, mergedText, conflicts }]（conflicts 为空则可直接写）
 *   conflicts:  [{ file, kind: 'file' | 'json-keys', keys? }]（需要用户决定）
 */
export function classify(baseDir, localDir, remoteDir, files) {
  const out = { unchanged: [], updated: [], keptLocal: [], added: [], addedConflicts: [], removedUpstream: [], jsonMerges: [], conflicts: [] };
  for (const f of files) {
    const b = read(baseDir, f), l = read(localDir, f), r = read(remoteDir, f);
    if (r === null && b === null) continue;                       // 上游从未有过（不该出现在清单里）
    if (b !== null && r === null) { out.removedUpstream.push(f); continue; }   // 上游删除：保守保留，报告
    if (l === null && b === null && r !== null) { out.added.push(f); continue; } // 上游新增
    if (l === null && b !== null) {                                // 本地删除了上游文件
      if (b === r) { out.keptLocal.push(f + '（本地已删除，上游未变）'); continue; }
      out.conflicts.push({ file: f, kind: 'file', note: '本地删除了此文件，但上游有更新' }); continue;
    }
    if (l === r) { out.unchanged.push(f); continue; }
    if (b === l) { out.updated.push(f); continue; }
    if (b === r) { out.keptLocal.push(f); continue; }
    // 两边都改
    if (f.endsWith('.json')) {
      try {
        const { merged, conflicts } = mergeJson(JSON.parse(b), JSON.parse(l), JSON.parse(r));
        const mergedText = JSON.stringify(merged, null, 2) + '\n';
        if (conflicts.length) out.conflicts.push({ file: f, kind: 'json-keys', keys: conflicts, mergedText });
        else out.jsonMerges.push({ file: f, mergedText });
        continue;
      } catch { /* JSON 解析失败退化为文件级 */ }
    }
    out.conflicts.push({ file: f, kind: 'file' });
  }
  return out;
}

/**
 * 没有旧基线内容、只有旧 hash 时的退化分类（快照被就地更新的场景，如仓库内符号链接）：
 * hash 能判「谁没动」，但两边都改时无法做 JSON 键级合并——一律记文件级冲突。
 */
export function classifyByHash(baseHashes, localDir, remoteDir, files, shaText) {
  const out = { unchanged: [], updated: [], keptLocal: [], added: [], addedConflicts: [], removedUpstream: [], jsonMerges: [], conflicts: [] };
  for (const f of files) {
    const bh = baseHashes[f];
    const l = read(localDir, f), r = read(remoteDir, f);
    if (r === null && bh === undefined) continue;
    if (bh !== undefined && r === null) { out.removedUpstream.push(f); continue; }
    if (l === null && bh === undefined && r !== null) { out.added.push(f); continue; }
    if (l === null && bh !== undefined) { out.conflicts.push({ file: f, kind: 'file', note: '本地删除了此文件' }); continue; }
    if (l === r) { out.unchanged.push(f); continue; }
    const lh = shaText(l), rh = shaText(r);
    if (bh === lh) { out.updated.push(f); continue; }
    if (bh === rh) { out.keptLocal.push(f); continue; }
    out.conflicts.push({ file: f, kind: 'file', note: '两边都改（无旧基线内容，无法键级合并）' });
  }
  return out;
}

/** 文件级冲突写 git 风格标记。 */
export function conflictMarkers(localText, remoteText, localLabel = '本地', remoteLabel = '上游') {
  return `<<<<<<< ${localLabel}\n${localText.replace(/\n$/, '')}\n=======\n${remoteText.replace(/\n$/, '')}\n>>>>>>> ${remoteLabel}\n`;
}

/** 按决议把 JSON 键级冲突落成最终文本。decisions: { [keyPath]: 'local' | 'upstream' | 任意 JSON 值 } */
export function resolveJsonConflict(baseText, localText, remoteText, decisions) {
  const base = JSON.parse(baseText), local = JSON.parse(localText), remote = JSON.parse(remoteText);
  const { merged, conflicts } = mergeJson(base, local, remote);
  const unresolved = [];
  for (const c of conflicts) {
    const d = decisions[c.path];
    if (d === undefined) { unresolved.push(c.path); continue; }
    const value = d === 'local' ? c.local : d === 'upstream' ? c.remote : d;
    const segs = c.path.split('.');
    let node = merged;
    for (let i = 0; i < segs.length - 1; i++) { if (!isObj(node[segs[i]])) node[segs[i]] = {}; node = node[segs[i]]; }
    if (value === undefined) delete node[segs.at(-1)]; else node[segs.at(-1)] = value;
  }
  return { text: JSON.stringify(merged, null, 2) + '\n', unresolved };
}
