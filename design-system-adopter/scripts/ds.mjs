#!/usr/bin/env node
// design-system-adopter 的通用 CLI（零依赖，Node ≥ 22）：识别 / 接入 / 状态 / 升级（三方合并）/ 恢复 / 项目规则 / steward 查装 / 自更新。
// 与具体设计系统无关：一切信息来自设计系统包根的 design-system.json（id、upstream、栈、模板、验收、迁移对照、owned 清单）。
//
//   node ds.mjs detect   [--project <dir>] [--json]
//   node ds.mjs init     --system <id|路径|npm包名> --stack <栈> [--project <dir>] [--legacy-rename]
//   node ds.mjs adopt    [--system <id>] [--stack <栈>] [--project <dir>]        # 已有快照 + 工作副本的项目补 .adopter.json
//   node ds.mjs status   [--project <dir>] [--offline]
//   node ds.mjs upgrade  [--project <dir>] [--dry-run] [--ref <tag>] [--from <dir|tgz>]
//                        [--resolve <decisions.json>] [--keep-local-all] [--take-upstream-all] [--json]
//   node ds.mjs restore  [--project <dir>] [--files a,b] [--all] [--from <dir>]  # 快照被改时恢复
//   node ds.mjs export   --to <dir> [--system <id|路径|npm包名>] [--with element-plus,shadcn] [--dry-run] [--force]   # 纯 CSS 交付（非 Node 项目）
//   node ds.mjs scope    --root <class> --to <dir> [--with element-plus] [--system …]                             # 范围根：只覆盖部分路由板块（@scope 包裹）
//   node ds.mjs propose  --title "…" [--layer token|bridge|recipes|component|docs|tools] [--scene …] [--expect …] [--tokens a,b] [--write]   # 提案草稿 + 预填 issue 链接
//   node ds.mjs agents   [--project <dir>] [--stack <栈>] [--write]              # 默认只打印；--write 新建或追加
//   node ds.mjs steward  locate|install [--project <dir>]
//   node ds.mjs self-update
//
// 布局：design-systems/<id>/ = 上游只读快照（三方合并的 base；npm 只是下载渠道）；design-system/ = 工作副本（steward 治理）。
// 状态文件 design-system/.adopter.json；冲突清单 .adopter-conflicts.json（项目根）。退出码：0 成功 · 1 失败 · 2 用法/前置 · 3 有待决冲突。
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs, sha, walk, matchesAny, copyDir, isSymlink, readJson, semverCompare, fail } from './lib/util.mjs';
import { detect, readIdentity } from './lib/detect.mjs';
import { latestTag, downloadSubdir } from './lib/fetch.mjs';
import { classify, classifyByHash, conflictMarkers, resolveJsonConflict } from './lib/merge.mjs';
import { shaText } from './lib/util.mjs';
import { locateSteward, installSteward, stewardInstallHint, stewardInfo, MIN_STEWARD } from './lib/steward.mjs';
import { renderAgents, resolvePlaceholders, writeAgents } from './lib/agents.mjs';
import { scopeWrap, guardSnippet } from './lib/scope.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = parseArgs();
const cmd = args._[0] || 'help';
const project = resolve(args.project || process.cwd());
const MANIFEST = 'design-system/.adopter.json';
const CONFLICTS = '.adopter-conflicts.json';
const today = () => new Date().toISOString().slice(0, 10);

// ---------- 公共 ----------
const manifestPath = () => join(project, MANIFEST);
const readManifest = () => (existsSync(manifestPath()) ? readJson(manifestPath()) : null);
const writeManifest = (m) => writeFileSync(manifestPath(), JSON.stringify(m, null, 2) + '\n');
const snapshotDirOf = (m) => join(project, m.snapshot);

function hashDir(dir) {
  const out = {};
  for (const f of walk(dir).sort()) out[f] = sha(join(dir, f));
  return out;
}
/** owned 文件全集（seed 相对路径）：三棵树（base / local / remote）的并集。localRoot 下的 owned 路径以 design-system/ 开头，与 seed 布局一致。 */
function ownedFiles(identity, roots) {
  const set = new Set();
  for (const root of roots.filter(Boolean)) {
    if (!existsSync(root)) continue;
    for (const f of walk(root)) if (matchesAny(identity.owned, f)) set.add(f);
  }
  return [...set].sort();
}
/** 项目工作副本视角的 owned 文件（把 walk 限制在 design-system/，避免扫全项目）。 */
function localOwnedRoot() { const d = join(project, 'design-system'); return existsSync(d) ? d : null; }
function localOwned(identity) {
  const root = localOwnedRoot();
  if (!root) return [];
  return walk(root, root, { skip: ['node_modules', '.git', '.DS_Store', 'dist'] }).map((f) => 'design-system/' + f).filter((f) => matchesAny(identity.owned, f)).sort();
}
function extractFrom(fromArg) {
  const p = resolve(fromArg);
  if (statSync(p).isDirectory()) return p;
  const tmp = mkdtempSync(join(tmpdir(), 'ds-from-'));
  const r = spawnSync('tar', ['-xzf', p, '-C', tmp], { encoding: 'utf8' });
  if (r.status !== 0) fail(`解包失败：${r.stderr}`);
  for (const cand of [tmp, join(tmp, 'package'), ...readdirSync(tmp).map((n) => join(tmp, n))]) {
    try { if (existsSync(join(cand, 'design-system.json'))) return cand; } catch { }
  }
  fail(`${fromArg} 里没找到 design-system.json`);
}
function printWiring(identity, stackId, source) {
  const stack = identity.stacks[stackId];
  const snippet = resolvePlaceholders(readFileSync(join(project, readManifest().snapshot, stack.snippet), 'utf8'), identity);
  const lines = [`\n接线（${identity.name} · ${stack.label || stackId}）：`];
  if (source === 'folder') lines.push(`  1. 让 import 路径生效（folder 来源用 file: 链接，与 npm 同一套路径）：\n     npm i file:./${readManifest().snapshot}\n     Vite 配 optimizeDeps.exclude: ['${identity.upstream.npm}'] 与 resolve.preserveSymlinks: true（file: 是符号链接）`);
  else lines.push(`  1. Vite 配 optimizeDeps.exclude: ['${identity.upstream.npm}']（包里是源码组件）`);
  lines.push(`  2. 样式入口（建议 src/styles/globals.css；${stack.snippet} 模板已按来源解析）：\n${snippet.split('\n').map((l) => '     ' + l).join('\n')}`);
  lines.push(`  3. 构建 token 与校验（steward）：\n     npm i -D ${identity.build?.tool || 'style-dictionary'}\n     node <steward>/scripts/build-tokens.mjs --project "${project}"\n     node <steward>/scripts/guard.mjs --project "${project}"    # 应为 current`);
  if (identity.accept?.npm) lines.push(`  4. 验收：npm i -D ${identity.accept.npm} → 按快照里的 ${identity.accept.configTemplate} 建 accept.config.mjs → npx ${identity.accept.command}`);
  lines.push(`  5. 项目规则：node <adopter>/scripts/ds.mjs agents --stack ${stackId}（展示给用户确认后加 --write）`);
  const sw = stewardInfo(project);
  lines.push(sw.dir ? `\nsteward 已找到：${sw.dir}（${sw.version || '版本未知'}${sw.ok ? '' : '，过旧'}）${sw.ok ? '' : '\n' + sw.hint}` : `\n${sw.hint}`);
  console.log(lines.join('\n'));
}

// ---------- 命令 ----------
const commands = {
  detect() {
    const d = detect(project);
    if (args.json) { console.log(JSON.stringify(d, null, 2)); return; }
    console.log(`项目 ${project}`);
    if (!d.systems.length) console.log('  未发现带 design-system.json 身份文件的设计系统（node_modules 与浅层目录都扫过）。');
    for (const s of d.systems) console.log(`  [${s.source}] ${s.identity.id}@${s.identity.version} · ${s.identity.name} · ${s.dir}`);
    if (d.working.exists) {
      if (d.working.adopter) console.log(`  工作副本 design-system/ ← ${d.working.adopter.system}@${d.working.adopter.version}（.adopter.json）`);
      else console.log(`  工作副本 design-system/ 存在但无 .adopter.json：${d.working.stewardLayout ? '像是 steward 布局（用户自建或旧接法）——接我们的系统走「换规范」，已是我们的用 adopt 补清单' : '布局未知'}`);
    } else console.log('  没有 design-system/ 工作副本（可从 0 接入）。');
    if (d.legacy) console.log('  存在 design-system.legacy/（迁移证据）。');
  },

  init() {
    const stackId = args.stack || fail('缺 --stack（可用栈见该系统 design-system.json 的 stacks）');
    const sysArg = args.system || fail('缺 --system <id|路径|npm包名>');
    const wc = join(project, 'design-system');
    if (existsSync(wc)) {
      if (!args['legacy-rename']) fail(`已存在 ${wc}：这是「更换现有规范」场景——经用户确认后加 --legacy-rename（会把它改名为 design-system.legacy/ 当迁移证据），或先手工处理。`);
      renameSync(wc, join(project, 'design-system.legacy'));
      console.log('已把原 design-system/ 改名为 design-system.legacy/（迁移证据，audit 时会用到）。');
    }
    // 解析来源
    let srcDir = null, source = 'folder';
    const asPath = resolve(project, sysArg);
    if (existsSync(asPath) && readIdentity(asPath)) { srcDir = asPath; source = asPath.includes('node_modules') ? 'npm' : 'folder'; }
    else if (existsSync(join(project, 'node_modules', sysArg)) && readIdentity(join(project, 'node_modules', sysArg))) { srcDir = join(project, 'node_modules', sysArg); source = 'npm'; }
    else {
      const d = detect(project);
      const hit = d.systems.find((s) => s.identity.id === sysArg) || d.systems.find((s) => s.identity.upstream.npm === sysArg);
      if (hit) { srcDir = join(project, hit.dir); source = hit.source; }
    }
    if (!srcDir) fail(`找不到设计系统「${sysArg}」。先 npm i 它的包，或把种子文件夹放进项目（任意位置，detect 能认出来），再重跑。`);
    const identity = readIdentity(srcDir);
    if (!identity.stacks[stackId]) fail(`${identity.id} 没有栈 ${stackId}；可用：${Object.keys(identity.stacks).join(' / ')}`);
    // 快照落位
    const snapRel = `design-systems/${identity.id}`;
    const snapDir = join(project, snapRel);
    if (resolve(srcDir) !== resolve(snapDir)) {
      if (existsSync(snapDir) && !isSymlink(snapDir)) rmSync(snapDir, { recursive: true });
      if (!isSymlink(snapDir)) copyDir(srcDir, snapDir);
      console.log(`快照：${srcDir} → ${snapRel}/（只读，upgrade 的比较基线）`);
    }
    // 工作副本
    mkdirSync(wc, { recursive: true });
    copyDir(join(snapDir, 'design-system'), wc, { exclude: ['dist'] });
    mkdirSync(join(wc, 'dist'), { recursive: true });
    writeManifest({ system: identity.id, name: identity.name, version: identity.version, source, snapshot: snapRel, npm: identity.upstream.npm, stack: stackId, updatedAt: today(), snapshotHashes: hashDir(snapDir) });
    console.log(`已接入 ${identity.name}（${identity.id}@${identity.version}，来源 ${source}）：工作副本 design-system/ + 清单 ${MANIFEST}`);
    printWiring(identity, stackId, source);
  },

  adopt() {
    const d = detect(project);
    const hit = args.system ? d.systems.find((s) => s.identity.id === args.system) : (d.systems.length === 1 ? d.systems[0] : null);
    if (!hit) fail(d.systems.length ? `多个候选（${d.systems.map((s) => s.identity.id).join(' / ')}），用 --system 指定` : '项目里没有可识别的设计系统');
    if (!localOwnedRoot()) fail('没有 design-system/ 工作副本；从 0 接入用 init');
    const identity = hit.identity;
    const snapDir = join(project, hit.dir);
    let snapRel = hit.dir;
    if (hit.source === 'npm') {   // npm 来源也要有实体快照（node_modules 会被 npm update 冲掉）
      snapRel = `design-systems/${identity.id}`;
      const dest = join(project, snapRel);
      if (!existsSync(dest)) { copyDir(snapDir, dest); console.log(`已从 ${hit.dir} 建快照 ${snapRel}/`); }
    }
    const stackId = args.stack || readManifest()?.stack || Object.keys(identity.stacks)[0];
    writeManifest({ system: identity.id, name: identity.name, version: identity.version, source: hit.source, snapshot: snapRel, npm: identity.upstream.npm, stack: stackId, updatedAt: today(), snapshotHashes: hashDir(join(project, snapRel)) });
    const diff = ownedFiles(identity, [join(project, snapRel)]).filter((f) => {
      const l = join(project, f), s = join(project, snapRel, f);
      return existsSync(l) && existsSync(s) && sha(l) !== sha(s);
    });
    console.log(`已写 ${MANIFEST}：${identity.id}@${identity.version} · 快照 ${snapRel} · 栈 ${stackId}`);
    if (diff.length) console.log(`工作副本与快照有差异（本地改过，upgrade 时会做三方合并）：\n  ${diff.join('\n  ')}`);
  },

  async status() {
    const m = readManifest() || fail(`没有 ${MANIFEST}；先 init（从 0）或 adopt（已有快照 + 工作副本）`);
    const snapDir = snapshotDirOf(m);
    if (!existsSync(snapDir)) fail(`快照目录不存在：${m.snapshot}`);
    const identity = readIdentity(snapDir) || fail(`快照缺 design-system.json：${m.snapshot}`);
    console.log(`${m.name}（${m.system}）：清单 ${m.version}（${m.updatedAt}）· 快照里是 ${identity.version} · 来源 ${m.source} · 栈 ${m.stack}${m.scopeRoot ? ` · 范围根 html.${m.scopeRoot} → ${m.scopeDir}` : ''}`);
    // 快照完整性
    if (identity.version !== m.version) console.log(`  快照已是 ${identity.version}（清单记录 ${m.version}）：上游内容就位，跑 upgrade 把工作副本合并上来。`);
    else {
      const now = hashDir(snapDir);
      const changed = Object.keys({ ...m.snapshotHashes, ...now }).filter((f) => m.snapshotHashes[f] !== now[f]);
      if (changed.length) console.log(`  ⚠ 快照被本地改动（快照应只读，改动会让三方合并失去基线）：\n    ${changed.slice(0, 20).join('\n    ')}${changed.length > 20 ? `\n    …共 ${changed.length} 个` : ''}\n    用 restore 恢复，需要的差异改在工作副本 / app.css，公共诉求向上游提。`);
      else console.log('  快照完整（hash 与清单一致）。');
    }
    // 工作副本 vs 快照
    const modified = ownedFiles(identity, [snapDir]).filter((f) => existsSync(join(project, f)) && existsSync(join(snapDir, f)) && sha(join(project, f)) !== sha(join(snapDir, f)));
    console.log(modified.length ? `  工作副本相对快照的本地修改（升级时三方合并保留）：\n    ${modified.join('\n    ')}` : '  工作副本与快照一致（无本地修改）。');
    { const sw = stewardInfo(project); console.log(sw.dir ? `  steward：${sw.version || '版本未知'}${sw.ok ? '' : `（过旧，需 ≥ ${MIN_STEWARD}）`} · ${sw.dir}` : `  steward：未找到（${sw.hint.split('：')[0]}）`); }
    // 上游最新
    if (!args.offline) {
      const latest = await latestTag(identity.upstream.repo, identity.upstream.tagPrefix);
      if (!latest) console.log('  上游：查询失败（离线或无权限）；--offline 可静音。');
      else if (semverCompare(latest.version, identity.version) > 0) console.log(`  上游有新版本：${latest.tag}（快照 ${identity.version}）→ 跑 upgrade [--dry-run] 升级。`);
      else console.log(`  已是上游最新（${latest.tag}）。`);
    }
  },

  async upgrade() {
    const m = readManifest() || fail(`没有 ${MANIFEST}；先 init 或 adopt`);
    const snapDir = snapshotDirOf(m);
    const identity = readIdentity(snapDir) || fail(`快照缺 design-system.json`);
    // 新上游
    let remoteDir;
    if (args.from) remoteDir = extractFrom(args.from);
    else if (identity.version !== m.version) remoteDir = snapDir;   // 快照已被外部更新（如仓库内符号链接指向新种子）：快照即新上游
    else if (m.source === 'npm' && !args.ref) {
      const nm = join(project, 'node_modules', m.npm);
      const nmId = readIdentity(nm);
      if (nmId && semverCompare(nmId.version, m.version) > 0) remoteDir = nm;
    }
    if (!remoteDir) {
      const ref = args.ref || (await latestTag(identity.upstream.repo, identity.upstream.tagPrefix))?.tag;
      if (!ref) fail('查不到上游 tag（离线？）。可用 --from <目录|tgz> 或 --ref <tag> 指定来源。');
      const version = ref.startsWith(identity.upstream.tagPrefix) ? ref.slice(identity.upstream.tagPrefix.length) : ref;
      if (semverCompare(version, m.version) <= 0 && !args.ref) { console.log(`已是最新（${m.version}，上游 ${ref}）。`); return; }
      console.log(`下载 ${identity.upstream.repo}@${ref} 的 ${identity.upstream.path} …`);
      remoteDir = await downloadSubdir(identity.upstream.repo, ref, identity.upstream.path);
    }
    const remoteIdentity = readIdentity(remoteDir) || fail(`新上游缺 design-system.json：${remoteDir}`);
    if (remoteIdentity.id !== m.system) fail(`身份不符：项目接的是 ${m.system}，来源是 ${remoteIdentity.id}`);
    const base = identity.version !== m.version ? null : snapDir;   // 快照被就地更新（如仓库内符号链接）时没有旧基线内容，用清单里的旧 hash 退化分类
    if (!base) console.log('注意：快照已被就地更新，旧基线只剩 hash——「谁没动」仍可判定，两边都改的文件无法键级合并（记为文件级冲突）。');

    const files = ownedFiles(remoteIdentity, [snapDir, remoteDir]).concat(localOwned(remoteIdentity)).filter((v, i, a) => a.indexOf(v) === i).sort();
    const report = base ? classify(base, project, remoteDir, files) : classifyByHash(m.snapshotHashes, project, remoteDir, files, shaText);
    const dry = !!args['dry-run'];
    const label = `${m.version} → ${remoteIdentity.version}`;
    console.log(`${dry ? '[dry-run] ' : ''}${m.name} 升级 ${label}`);
    const show = (k, list, fmt = (x) => x) => { if (list.length) console.log(`  ${k}（${list.length}）：\n    ` + list.map(fmt).join('\n    ')); };
    show('直接更新（本地未改）', report.updated);
    show('上游新增', report.added);
    show('保留本地（上游未变）', report.keptLocal);
    show('JSON 键级自动合并（两边都改、键不冲突）', report.jsonMerges, (x) => x.file);
    show('上游已删除（保守保留，确认后可手工删）', report.removedUpstream);
    console.log(`  未变 ${report.unchanged.length} 个`);
    // 冲突决议
    const decisions = args.resolve ? readJson(resolve(args.resolve)) : args['take-upstream-all'] ? '__upstream__' : args['keep-local-all'] ? '__local__' : null;
    if (report.conflicts.length) {
      console.log(`  冲突（${report.conflicts.length}）：`);
      for (const c of report.conflicts) {
        if (c.kind === 'json-keys') console.log(`    ${c.file} · 键级冲突 ${c.keys.length} 处：\n` + c.keys.map((k) => `      ${k.path}\n        base    ${JSON.stringify(k.base)}\n        local   ${JSON.stringify(k.local)}\n        upstream ${JSON.stringify(k.remote)}`).join('\n'));
        else console.log(`    ${c.file} · 文件级${c.note ? `（${c.note}）` : ''}：选 local / upstream / markers`);
      }
    }
    if (dry) { console.log('\n[dry-run] 未写任何文件。'); return; }

    // 写入自动部分
    const writeLocal = (f, text) => { const p = join(project, f); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
    for (const f of [...report.updated, ...report.added]) writeLocal(f, readFileSync(join(remoteDir, f), 'utf8'));
    for (const jm of report.jsonMerges) writeLocal(jm.file, jm.mergedText);
    // 冲突
    const unresolved = [];
    for (const c of report.conflicts) {
      const localText = existsSync(join(project, c.file)) ? readFileSync(join(project, c.file), 'utf8') : '';
      const remoteText = existsSync(join(remoteDir, c.file)) ? readFileSync(join(remoteDir, c.file), 'utf8') : '';
      let d = decisions === '__upstream__' ? 'upstream' : decisions === '__local__' ? 'local' : decisions?.[c.file];
      if (c.kind === 'json-keys') {
        if (d === 'upstream' || d === 'local') {
          const keyDecisions = Object.fromEntries(c.keys.map((k) => [k.path, d]));
          const { text } = resolveJsonConflict(readFileSync(join(base, c.file), 'utf8'), localText, remoteText, keyDecisions);
          writeLocal(c.file, text);
        } else if (d && typeof d === 'object') {
          const { text, unresolved: u } = resolveJsonConflict(readFileSync(join(base, c.file), 'utf8'), localText, remoteText, d);
          if (u.length) { unresolved.push({ ...c, keys: c.keys.filter((k) => u.includes(k.path)) }); continue; }
          writeLocal(c.file, text);
        } else unresolved.push(c);
      } else {
        if (d === 'local') { /* 不动 */ }
        else if (d === 'upstream') writeLocal(c.file, remoteText);
        else if (d === 'markers') writeLocal(c.file, conflictMarkers(localText, remoteText, `local（${m.version} 基础上的本地修改）`, `upstream ${remoteIdentity.version}`));
        else { unresolved.push(c); continue; }
      }
    }
    if (unresolved.length) {
      writeFileSync(join(project, CONFLICTS), JSON.stringify({ system: m.system, from: m.version, to: remoteIdentity.version, generatedAt: today(), howTo: '逐项决定后写 decisions.json（file → "local"|"upstream"|"markers"，JSON 键级冲突 file → { keyPath: "local"|"upstream"|字面值 }），重跑 upgrade --resolve decisions.json；或用 --keep-local-all / --take-upstream-all', conflicts: unresolved }, null, 2) + '\n');
      console.log(`\n${unresolved.length} 处冲突待决 → 已写 ${CONFLICTS}。自动可并的部分已写入工作副本；解决冲突后重跑 upgrade --resolve <decisions.json>（升级尚未记账，快照未动）。`);
      process.exit(3);
    }
    // 快照推进 + 记账
    if (isSymlink(join(project, m.snapshot))) console.log('快照是符号链接（仓库内开发模式）：跳过快照替换。');
    else if (resolve(remoteDir) !== resolve(snapDir)) { rmSync(snapDir, { recursive: true }); copyDir(remoteDir, snapDir); }
    writeManifest({ ...m, version: remoteIdentity.version, updatedAt: today(), snapshotHashes: hashDir(snapshotDirOf(m)) });
    if (existsSync(join(project, CONFLICTS))) rmSync(join(project, CONFLICTS));
    // CHANGELOG 摘要
    const cl = join(remoteDir, remoteIdentity.docs?.changelog || 'CHANGELOG.md');
    if (existsSync(cl)) {
      const heads = readFileSync(cl, 'utf8').split('\n').filter((l) => /^## \d/.test(l));
      const idx = heads.findIndex((h) => h.includes(` ${m.version} `) || h.includes(`## ${m.version}`) || h.includes(` ${m.version}（`));
      const delta = idx === -1 ? heads.slice(0, 5) : heads.slice(0, idx);
      if (delta.length) console.log(`\n${m.version} 以来的版本：\n  ` + delta.map((h) => h.replace(/^## /, '')).join('\n  '));
    }
    if (m.scopeRoot && m.scopeDir) {
      // 范围根项目消费的是 @scope 包裹的生成物，不重生成的话桥接 / recipes 的更新到不了应用（2.11.1 轻采：桥接修了、走查仍复现旧 bug）。
      // 桥接 / recipes 部分取自刚刷新的快照，token 部分取项目 dist 现状——token 源有变时 build-tokens 之后再跑一次 scope。
      console.log(`\n范围根模式（html.${m.scopeRoot} → ${m.scopeDir}）：用新快照重生成范围包…`);
      try { commands.scope(); } catch (e) { console.log(`  重生成失败（${e.message}）——手工跑 ds.mjs scope。`); }
      console.log(`  token 源有变时：build-tokens → 再跑一次 ds.mjs scope。`);
    }
    console.log(`\n完成 ${label}。接下来：build-tokens → guard → ${remoteIdentity.accept?.command || '验收'}（token 变化会带来像素变化，属预期，对照 CHANGELOG）。`);
  },

  async restore() {
    const m = readManifest() || fail(`没有 ${MANIFEST}`);
    const snapDir = snapshotDirOf(m);
    if (isSymlink(join(project, m.snapshot))) fail('快照是符号链接（开发模式），不需要 restore');
    let srcDir;
    if (args.from) srcDir = extractFrom(args.from);
    else if (m.source === 'npm' && readIdentity(join(project, 'node_modules', m.npm))?.version === m.version) srcDir = join(project, 'node_modules', m.npm);
    else {
      const identity = readIdentity(snapDir) || readJson(join(snapDir, 'design-system.json'));
      srcDir = await downloadSubdir(identity.upstream.repo, `${identity.upstream.tagPrefix}${m.version}`, identity.upstream.path);
    }
    const files = args.all ? Object.keys(m.snapshotHashes) : String(args.files || '').split(',').filter(Boolean);
    if (!files.length) fail('用 --files a,b 或 --all 指定要恢复的快照文件');
    for (const f of files) { const src = join(srcDir, f); if (!existsSync(src)) { console.log(`  跳过（来源没有）：${f}`); continue; } cpSync(src, join(snapDir, f)); console.log(`  已恢复 ${f}`); }
    writeManifest({ ...m, snapshotHashes: hashDir(snapDir) });
  },

  /** 纯 CSS 交付：给 Flask / Django / PHP 模板这类非 Node 项目。来源 = --system（路径 / id / npm 名）或本项目的快照；目标目录里的导出文件视为只读，改过要 --force。 */
  export() {
    const to = args.to || fail('缺 --to <目录>（如 Flask 的 static/citrine）');
    // 来源
    let srcDir = null;
    if (args.system) {
      const asPath = resolve(args.system);
      if (existsSync(asPath) && readIdentity(asPath)) srcDir = asPath;
      else if (existsSync(join(project, 'node_modules', args.system)) && readIdentity(join(project, 'node_modules', args.system))) srcDir = join(project, 'node_modules', args.system);
      else { const hit = detect(project).systems.find((s) => s.identity.id === args.system || s.identity.upstream.npm === args.system); if (hit) srcDir = join(project, hit.dir); }
    } else if (readManifest()) srcDir = snapshotDirOf(readManifest());
    if (!srcDir) fail('找不到来源：用 --system <种子目录|id|npm 包名>，或在已接入的项目里运行（用它的快照）');
    const identity = readIdentity(srcDir);
    const spec = identity.export || fail(`${identity.id} 的 design-system.json 没有 export 字段（未声明纯 CSS 交付）`);
    const withGroups = String(args.with || '').split(',').filter(Boolean);
    for (const g of withGroups) if (!spec.optional?.[g]) fail(`--with ${g} 不在可选组里；可用：${Object.keys(spec.optional || {}).join(' / ') || '（无）'}`);
    const files = [...spec.core, ...withGroups.flatMap((g) => spec.optional[g])];
    for (const f of files) if (!existsSync(join(srcDir, f))) fail(`来源缺 ${f}${f.includes('/dist/') ? '（token 产物未构建：在种子目录 build-tokens 后再导出）' : ''}`);
    // 目标现状
    const dest = resolve(to);
    const manifestFile = join(dest, 'design-system.export.json');
    const prev = existsSync(manifestFile) ? readJson(manifestFile) : null;
    if (prev && !args.force) {
      const edited = Object.entries(prev.files).filter(([name, h]) => existsSync(join(dest, name)) && sha(join(dest, name)) !== h).map(([n]) => n);
      if (edited.length) fail(`目标里的导出文件被本地改过：${edited.join(', ')}。导出文件是只读的——项目差异请写在自己的样式文件里；确认要覆盖就加 --force。`, 3);
    }
    // 写入（带版本头）
    const dry = !!args['dry-run'];
    const header = (name) => `/* ${identity.name}（${identity.id}）${identity.version} · ${name} · design-system-adopter export ${today()}\n   只读：升级用 ds.mjs export 再导出一次覆盖；项目差异写在自己的样式文件里，只引用这里的变量。 */\n`;
    const outFiles = {}; const report = { added: [], updated: [], unchanged: [] };
    if (!dry) mkdirSync(dest, { recursive: true });
    for (const f of files) {
      const name = basename(f);
      const text = header(name) + readFileSync(join(srcDir, f), 'utf8');
      const h = shaText(text);
      outFiles[name] = h;
      if (!prev?.files?.[name]) report.added.push(name); else if (prev.files[name] !== h) report.updated.push(name); else report.unchanged.push(name);
      if (!dry) writeFileSync(join(dest, name), text);
    }
    if (!dry) writeFileSync(manifestFile, JSON.stringify({ system: identity.id, name: identity.name, version: identity.version, exportedAt: today(), source: relative(process.cwd(), srcDir) || '.', groups: withGroups, files: outFiles }, null, 2) + '\n');
    console.log(`${dry ? '[dry-run] ' : ''}${identity.name} ${prev ? `${prev.version} → ` : ''}${identity.version} 导出到 ${dest}`);
    for (const k of ['added', 'updated', 'unchanged']) if (report[k].length) console.log(`  ${{ added: '新增', updated: '更新', unchanged: '未变' }[k]}：${report[k].join(', ')}`);
    if (prev) { const gone = Object.keys(prev.files).filter((n) => !outFiles[n]); if (gone.length) console.log(`  上次导出有、这次没选：${gone.join(', ')}（未删除，确认无引用后手工删）`); }
    if (spec.usage && !prev) console.log(`\n接线（按顺序 <link>）：\n${spec.usage.split('\n').map((l) => '  ' + l).join('\n')}`);
    if (!prev) console.log(`\n${spec.note || ''}\n验收：服务器跑起来后 npx citrine-accept pages --url http://127.0.0.1:<port> --tokens ${dest}（页面清单写服务器路径，如 ['orders', '/admin/orders']）。`);
  },

  /**
   * 范围根：只覆盖同一应用里的部分路由板块。把 token（优先项目工作副本的 dist）+ recipes（+ 可选桥接组）各自包进 @scope (html.<root>) 写到目标目录，
   * 项目样式入口改引这些文件，路由守卫按板块给 <html> 加减类。未接入板块的路由下整套样式不存在。记录到 .adopter.json，upgrade / build 后重跑本命令即可再生成。
   */
  scope() {
    const m = readManifest();
    const root = args.root || m?.scopeRoot || m?.system || fail('缺 --root <class>（<html class="…">，通常用系统 id）');
    const to = args.to || m?.scopeDir || fail('缺 --to <目录>（如 src/styles/citrine-scoped）');
    let srcDir = null;
    if (args.system) { const p = resolve(args.system); srcDir = existsSync(p) && readIdentity(p) ? p : null; if (!srcDir) { const hit = detect(project).systems.find((s) => s.identity.id === args.system || s.identity.upstream.npm === args.system); if (hit) srcDir = join(project, hit.dir); } }
    else if (m) srcDir = snapshotDirOf(m);
    if (!srcDir) fail('找不到来源：--system <种子目录|id|npm 包名>，或在已接入项目里运行');
    const identity = readIdentity(srcDir);
    const spec = identity.export || fail(`${identity.id} 未声明 export（纯 CSS 交付）字段，无法生成范围包`);
    const withGroups = String(args.with || (m?.scopeWith || []).join(',')).split(',').filter(Boolean);
    for (const g of withGroups) if (!spec.optional?.[g]) fail(`--with ${g} 不在可选组里；可用：${Object.keys(spec.optional || {}).join(' / ')}`);
    // token：优先项目工作副本的构建产物（含 scope / 本地 token），否则来源 dist
    const localDist = join(project, 'design-system/dist/index.css');
    const files = [...spec.core, ...withGroups.flatMap((g) => spec.optional[g])].map((f) => ({ rel: f, from: f.endsWith('/dist/index.css') && existsSync(localDist) ? localDist : join(srcDir, f) }));
    for (const f of files) if (!existsSync(f.from)) fail(`来源缺 ${f.rel}（token 产物需先 build-tokens）`);
    const dest = resolve(project, to);
    const dry = !!args['dry-run'];
    if (!dry) mkdirSync(dest, { recursive: true });
    const outFiles = {}; const hoistedAll = new Set();
    for (const f of files) {
      const name = basename(f.rel);
      const { text, hoisted } = scopeWrap(readFileSync(f.from, 'utf8'), root);
      hoisted.forEach((h) => hoistedAll.add(h));
      const out = `/* ${identity.name}（${identity.id}）${identity.version} · ${name} · 范围根 html.${root} · design-system-adopter scope ${today()}\n   生成物，只读：token / 桥接变化后重跑 ds.mjs scope 再生成；项目差异写在自己的样式文件里。 */\n` + text;
      outFiles[name] = shaText(out);
      if (!dry) writeFileSync(join(dest, name), out);
    }
    if (!dry) {
      writeFileSync(join(dest, 'scope.manifest.json'), JSON.stringify({ system: identity.id, version: identity.version, root, generatedAt: today(), groups: withGroups, tokensFrom: files[0].from === localDist ? 'design-system/dist（项目工作副本）' : '来源 dist', files: outFiles }, null, 2) + '\n');
      if (m) writeManifest({ ...m, scopeRoot: root, scopeDir: relative(project, dest).split('\\').join('/'), scopeWith: withGroups });
    }
    console.log(`${dry ? '[dry-run] ' : ''}范围包 @scope (html.${root}) → ${dest}：${Object.keys(outFiles).join(', ')}${hoistedAll.size ? `（提升到顶层的 at-rule：${[...hoistedAll].join(' / ')}）` : ''}`);
    console.log(`\n样式入口改引这些文件（替换原来的 dist / 桥接 / recipes import），例如：\n  ${Object.keys(outFiles).map((n) => `@import "./${relative(join(project, 'src/styles'), dest).split('\\').join('/') || '.'}/${n}";`).join('\n  ')}\n首屏 index.html 的 <html> 默认带 class="${root}"（多数路由覆盖时），未接入板块由路由守卫移除：\n${guardSnippet(root, m?.stack || args.stack || 'element-plus').split('\n').map((l) => '  ' + l).join('\n')}`);
    console.log(`\n注意：生成物含字面量，steward status 会计为债——在 exemptions.json 登记 ${relative(project, dest).split('\\').join('/')}/**（理由：范围根生成物）。浏览器下限：@scope 需 Chrome/Edge 118+、Safari 17.4+、Firefox 128+。同屏新旧混排不支持（按路由分板块）。`);
  },

  /**
   * 提案回流：配方不够用 / 桥接漏了 / 文档说不清时，生成格式统一的提案草稿（含系统版本、栈），打印预填好的 GitHub issue 链接；
   * --write 存到 design-system/proposals/<日期>-<slug>.md（项目自有目录，升级不触碰）。不在页面上先糊样式再提。
   */
  propose() {
    const m = readManifest();
    const snapId = m ? readIdentity(snapshotDirOf(m)) : null;
    const title = args.title || fail('缺 --title "一句话标题"');
    const LAYERS = { token: 'token（新增 / 修改设计决定）', bridge: '桥接（组件库某状态没接管）', recipes: '配方 recipes.css（页面骨架公共类）', component: '配方组件（bridge/vue、bridge/react）', docs: 'DESIGN 文档（规则说不清 / 缺对照）', tools: '验收工具 / adopter skill', unknown: '不确定' };
    const STACKS = { 'element-plus': 'Vue 3 + Element Plus', shadcn: 'React + shadcn/ui', css: '纯 CSS（非 Node 项目）' };
    const layer = LAYERS[args.layer || 'unknown'] || fail(`--layer 取值：${Object.keys(LAYERS).join(' / ')}`);
    const stack = STACKS[args.stack || m?.stack] || '其他（在场景里说明）';
    const system = m && snapId ? `${m.system} ${snapId.version}` : (args.system || '（未接入项目，填系统与版本）');
    const scene = args.scene || '（哪个页面 / 组件 / 交互，遇到了什么；现在怎么顶住的）';
    const expected = args.expect || '（想要它长什么样、遵守哪些既有规则）';
    const tokens = args.tokens || '';
    const evidence = args.evidence || '';
    const proj = basename(project);
    const md = `# [提案] ${title}\n\n- 设计系统与版本：${system}\n- 技术栈：${stack}\n- 建议进哪一层：${layer}\n- 涉及的既有 token：${tokens || '—'}\n- 项目：${proj}\n\n## 场景\n\n${scene}\n\n## 期望形态\n\n${expected}\n\n## 证据\n\n${evidence || '（截图 / 验收输出 / 复现路由）'}\n`;
    console.log(md);
    const repo = snapId?.upstream?.repo || 'WYCM9527/Design-System';
    const q = new URLSearchParams({ template: 'design-system-proposal.yml', title: `[提案] ${title}`, labels: 'proposal', system, stack, scene, expected, layer, tokens, evidence, project: proj });
    console.log(`GitHub 预填链接（打开即可提交）：\nhttps://github.com/${repo}/issues/new?${q}`);
    if (args.write) {
      const dir = join(project, 'design-system/proposals'); mkdirSync(dir, { recursive: true });
      const slug = title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'proposal';
      const file = join(dir, `${today()}-${slug}.md`); writeFileSync(file, md);
      console.log(`\n草稿已存：${relative(project, file)}（项目自有目录，升级不触碰；提交 issue 后可删或保留作记录）`);
    }
  },

  agents() {
    const m = readManifest() || fail(`没有 ${MANIFEST}；先 init / adopt`);
    const identity = readIdentity(snapshotDirOf(m)) || fail('快照缺 design-system.json');
    const content = renderAgents(project, identity, snapshotDirOf(m), args.stack || m.stack);
    if (!args.write) { console.log(content); console.log('\n（未写入。给用户看过、确认后加 --write：新建或追加，不覆盖。）'); return; }
    const how = writeAgents(project, content);
    console.log(how === 'created' ? '已新建 AGENTS.md' : '已把设计系统区块追加到既有 AGENTS.md 末尾');
  },

  async steward() {
    const sub = args._[1];
    if (sub === 'locate') { const sw = stewardInfo(project); if (!sw.dir) { console.log(sw.hint); process.exit(1); } console.log(sw.dir); console.log(`版本 ${sw.version || '未知'} · adopter 要求 ≥ ${MIN_STEWARD}${sw.ok ? ' · ok' : ' · 过旧'}`); if (!sw.ok) { console.log(sw.hint); process.exit(1); } }
    else if (sub === 'install') { const p = await installSteward(project); console.log(`steward 已安装：${p}`); }
    else fail('用法：steward locate | steward install');
  },

  async 'self-update'() {
    const skillDir = resolve(HERE, '..');
    const src = await downloadSubdir('WYCM9527/Design-System', 'main', 'design-system-adopter', 'adopter');
    copyDir(src, skillDir);
    const fm = readFileSync(join(skillDir, 'SKILL.md'), 'utf8').match(/version:\s*"?([\d.]+)/);
    console.log(`design-system-adopter 已更新${fm ? `到 ${fm[1]}` : ''}：${skillDir}`);
  },

  help() {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(1, 23).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  }
};

const fn = commands[cmd] || (() => fail(`未知命令 ${cmd}；ds.mjs help 看用法`));
await fn();
