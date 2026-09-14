// 识别：项目里哪些目录是「我们的设计系统」（带 design-system.json 身份文件且 upstream 完整），
// 哪些是用户自建的 design-system/（steward 布局，无身份文件），工作副本接的是哪套。
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readJson } from './util.mjs';

/** 校验身份文件的最小形状；不合格返回 null（视为用户自建 / 无标记）。 */
export function readIdentity(dir) {
  const f = join(dir, 'design-system.json');
  if (!existsSync(f)) return null;
  try {
    const id = readJson(f);
    if (id.id && id.version && id.upstream?.repo && id.upstream?.path && id.upstream?.tagPrefix && id.stacks) return id;
  } catch { /* 坏 JSON 一样视为无标记 */ }
  return null;
}

/** 在项目里找候选：design-systems/<id>/、node_modules 里装的种子包、以及浅层目录里散落的种子文件夹。 */
export function detect(project) {
  const systems = [];   // { dir(rel), identity, source: 'folder' | 'npm' }
  const seen = new Set();
  const push = (dirAbs, rel, source) => {
    const identity = readIdentity(dirAbs);
    if (identity && !seen.has(identity.id + '|' + source)) { seen.add(identity.id + '|' + source); systems.push({ dir: rel, identity, source }); }
  };

  const dsRoot = join(project, 'design-systems');
  if (existsSync(dsRoot)) for (const name of readdirSync(dsRoot)) {
    const p = join(dsRoot, name);
    try { if (statSync(p).isDirectory()) push(p, `design-systems/${name}`, 'folder'); } catch { /* 悬空链接跳过 */ }
  }

  const nm = join(project, 'node_modules');
  if (existsSync(nm)) {
    const dirs = [];
    for (const name of readdirSync(nm)) {
      if (name.startsWith('.')) continue;
      if (name.startsWith('@')) { const scope = join(nm, name); try { for (const sub of readdirSync(scope)) dirs.push([join(scope, sub), `node_modules/${name}/${sub}`]); } catch { } }
      else dirs.push([join(nm, name), `node_modules/${name}`]);
    }
    for (const [p, rel] of dirs) if (existsSync(join(p, 'design-system.json'))) push(p, rel, 'npm');
  }

  // 浅层扫描（深度 2）：用户把种子文件夹随手放在项目里的情况
  const skip = new Set(['node_modules', '.git', 'dist', 'design-systems', 'design-system', '.cursor', '.accept']);
  for (const a of readdirSync(project)) {
    if (skip.has(a) || a.startsWith('.')) continue;
    const pa = join(project, a);
    try { if (!statSync(pa).isDirectory()) continue; } catch { continue; }
    push(pa, a, 'folder');
    for (const b of (() => { try { return readdirSync(pa); } catch { return []; } })()) {
      if (skip.has(b) || b.startsWith('.')) continue;
      const pb = join(pa, b);
      try { if (statSync(pb).isDirectory()) push(pb, `${a}/${b}`, 'folder'); } catch { }
    }
  }

  // 工作副本状态
  const working = existsSync(join(project, 'design-system'))
    ? { exists: true, adopter: existsSync(join(project, 'design-system/.adopter.json')) ? readJson(join(project, 'design-system/.adopter.json')) : null, stewardLayout: existsSync(join(project, 'design-system/DESIGN.md')) || existsSync(join(project, 'design-system/tokens')) }
    : { exists: false, adopter: null, stewardLayout: false };
  const legacy = existsSync(join(project, 'design-system.legacy'));
  return { systems, working, legacy };
}
