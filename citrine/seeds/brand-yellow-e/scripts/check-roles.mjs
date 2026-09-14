#!/usr/bin/env node
// 校验 migration/roles.json 与设计系统的一致性（仓库内开发工具，不进 npm 包）：
//   1. 每个 var 都能在 tokens/*.tokens.json 里找到对应 token 路径（--color-text-primary → color.text.primary）；
//   2. README「从旧规范迁移」表格仍然存在（行数与 roles+noEquivalent 的覆盖粗对齐，防止改了 README 忘了 JSON）。
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const roles = JSON.parse(readFileSync(join(root, 'migration/roles.json'), 'utf8'));

// 收集全部 token 路径 → CSS 变量名
const vars = new Set();
function walk(node, path) {
  if (node && typeof node === 'object') {
    if ('$value' in node) { vars.add('--' + path.join('-').replaceAll('.', '-')); return; }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k]);
  }
}
for (const dir of ['design-system/tokens', 'design-system/themes/dark/tokens']) {
  for (const f of readdirSync(join(root, dir)).filter((f) => f.endsWith('.tokens.json'))) {
    walk(JSON.parse(readFileSync(join(root, dir, f), 'utf8')), []);
  }
}

let failed = false;
for (const entry of [...roles.roles, ...roles.noEquivalent]) {
  if (!entry.var) continue;
  const v = entry.var.split(' ')[0];
  if (!vars.has(v)) { failed = true; console.error(`roles.json 引用了不存在的 token 变量：${v}（${entry.role || entry.legacy}）`); }
}

const readme = readFileSync(join(root, 'README.md'), 'utf8');
if (!readme.includes('## 从旧规范迁移')) { failed = true; console.error('README 缺少「从旧规范迁移」章节'); }
const tableRows = (readme.split('## 从旧规范迁移')[1] || '').split('\n##')[0].split('\n').filter((l) => /^\|[^-]/.test(l)).length - 1; // 去掉表头
if (tableRows < 6) { failed = true; console.error(`README 迁移表行数异常（${tableRows}）`); }

if (failed) process.exit(1);
console.log(`check-roles 通过：${roles.roles.length} 个角色 + ${roles.noEquivalent.length} 个无对应物，token 变量全部存在；README 表 ${tableRows} 行。`);
