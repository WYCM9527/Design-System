#!/usr/bin/env node
// 迁移角色表与 token 源一致：每个带 migration/roles.json 的种子，roles / noEquivalent 里引用的 CSS 变量（var）和 token 路径（to）
// 都要在 design-system/tokens 与 themes/*/tokens 里找得到——改名或删 token 时忘了改对照表，adopter「更换现有规范」会把旧变量映射到不存在的名字上。
// 用法：node scripts/check-roles.mjs [--system <id>]   退出码：有引用不到的为 1。
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listSystems } from './systems.mjs';

const only = process.argv.includes('--system') ? process.argv[process.argv.indexOf('--system') + 1] : null;
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

function tokenPaths(seedDir) {
  const paths = new Set();
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return;
    if ('$value' in node) { paths.add(path.join('.')); return; }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
  };
  const themes = join(seedDir, 'design-system/themes');
  const dirs = [join(seedDir, 'design-system/tokens'), ...(existsSync(themes) ? readdirSync(themes).map((t) => join(themes, t, 'tokens')) : [])];
  for (const dir of dirs.filter((d) => existsSync(d))) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.tokens.json'))) walk(readJson(join(dir, f)), []);
  }
  return paths;
}

let failed = false;
for (const s of listSystems().filter((x) => !only || x.id === only)) {
  const file = join(s.seedDir, 'migration/roles.json');
  if (!existsSync(file)) { console.log(`${s.name}（${s.id}）：没有 migration/roles.json，跳过`); continue; }
  const roles = readJson(file);
  const paths = tokenPaths(s.seedDir);
  const vars = new Set([...paths].map((p) => `--${p.replaceAll('.', '-')}`));
  const missing = [];
  for (const entry of [...(roles.roles || []), ...(roles.noEquivalent || [])]) {
    const label = entry.role || entry.legacy || '?';
    const v = entry.var?.split(' ')[0];
    if (v && !vars.has(v)) missing.push(`var ${v}（${label}）`);
    if (entry.to && !paths.has(entry.to)) missing.push(`to ${entry.to}（${label}）`);
  }
  if (missing.length) { failed = true; console.error(`${s.name}（${s.id}）：roles.json 引用了不存在的 token：\n  ${missing.join('\n  ')}`); }
  else console.log(`${s.name}（${s.id}）：通过，${(roles.roles || []).length} 个角色 + ${(roles.noEquivalent || []).length} 个无对应物，引用的 token 全部存在。`);
}
if (failed) process.exit(1);
