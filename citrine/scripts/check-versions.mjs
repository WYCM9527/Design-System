#!/usr/bin/env node
// 版本一致性：Citrine 的版本号出现在六处，必须完全一致（CI 门禁，防手改漏同步）。
//   种子 design-system.json · 种子 package.json · 种子 CHANGELOG 最新条目 · citrine/README 版本行 · 种子 README 版本行 · 仓库根 README 表格
// 用法：node citrine/scripts/check-versions.mjs [--expect 2.10.0]   退出码：不一致为 1。
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const R = (p) => readFileSync(resolve(ROOT, p), 'utf8');
const seed = 'citrine/seeds/brand-yellow-e';
const found = {
  'design-system.json': JSON.parse(R(`${seed}/design-system.json`)).version,
  'package.json': JSON.parse(R(`${seed}/package.json`)).version,
  'CHANGELOG 最新条目': (R(`${seed}/CHANGELOG.md`).match(/^## (\d+\.\d+\.\d+)/m) || [])[1],
  'citrine/README 版本行': (R('citrine/README.md').match(/^版本 \*\*(\d+\.\d+\.\d+)\*\*/m) || [])[1],
  '种子 README 版本行': (R(`${seed}/README.md`).match(/^版本 (\d+\.\d+\.\d+) · /m) || [])[1],
  '仓库根 README 表格': (R('README.md').match(/Citrine · 黄晶[^\n]*\| (\d+\.\d+\.\d+) \|/) || [])[1],
};
const expect = process.argv.includes('--expect') ? process.argv[process.argv.indexOf('--expect') + 1] : found['design-system.json'];
const bad = Object.entries(found).filter(([, v]) => v !== expect);
for (const [k, v] of Object.entries(found)) console.log(`${v === expect ? 'ok  ' : 'FAIL'} ${k.padEnd(22)} ${v ?? '（未找到）'}`);
if (bad.length) { console.error(`\n版本不一致：期望 ${expect}，${bad.length} 处不同。`); process.exit(1); }
console.log(`\n通过：六处版本号一致（${expect}）。`);

// 工具包：文档里写死的 Releases 直链 wycm9527-citrine-tools-<ver>.tgz 必须与 citrine/tools/package.json 一致（GUIDE §2 方式 B、仓库根 README）。
const toolsVer = JSON.parse(R('citrine/tools/package.json')).version;
const stale = [];
for (const doc of ['docs/GUIDE.md', 'README.md']) {
  for (const m of R(doc).matchAll(/wycm9527-citrine-tools-(\d+\.\d+\.\d+)\.tgz/g)) if (m[1] !== toolsVer) stale.push(`${doc} → ${m[0]}`);
}
if (stale.length) { console.error(`\n工具直链版本过期（tools 现为 ${toolsVer}）：\n  ${stale.join('\n  ')}`); process.exit(1); }
console.log(`通过：文档里的工具直链版本与 citrine/tools（${toolsVer}）一致。`);
