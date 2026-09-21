#!/usr/bin/env node
// 版本一致性（CI 门禁，防手改漏同步）：每个设计系统的版本号出现在六处，必须完全一致——
//   种子 design-system.json · 种子 package.json · 种子 CHANGELOG 最新条目 · 种子 README 版本行（「版本 x.y.z · 」）· <id>/README 版本行（「版本 **x.y.z**」）· 仓库根 README 表格里该系统的行
// 有 <id>/tools 的系统再查一处：文档里写死的工具直链 <scope>-<id>-tools-<ver>.tgz 必须与 tools/package.json 一致。
// 用法：node scripts/check-versions.mjs [--system <id>] [--expect x.y.z]   退出码：不一致为 1。
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listSystems, packName, ROOT } from './systems.mjs';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i === -1 ? null : argv[i + 1]; };
const R = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const rootReadme = R('README.md');

const systems = listSystems().filter((s) => !opt('system') || s.id === opt('system'));
if (!systems.length) { console.error(opt('system') ? `没有 id 为 ${opt('system')} 的系统` : '仓库里没有任何 <id>/seeds/*/design-system.json'); process.exit(1); }

let failed = false;
for (const s of systems) {
  const rootRow = rootReadme.split('\n').find((line) => line.startsWith('|') && line.includes(`](${s.dir}/)`));
  const found = {
    'design-system.json': s.version,
    'package.json': JSON.parse(R(`${s.seedRelative}/package.json`) || '{}').version,
    'CHANGELOG 最新条目': (R(`${s.seedRelative}/CHANGELOG.md`).match(/^## (\d+\.\d+\.\d+)/m) || [])[1],
    '种子 README 版本行': (R(`${s.seedRelative}/README.md`).match(/^版本 (\d+\.\d+\.\d+) · /m) || [])[1],
    [`${s.dir}/README 版本行`]: (R(`${s.dir}/README.md`).match(/^版本 \*\*(\d+\.\d+\.\d+)\*\*/m) || [])[1],
    '仓库根 README 表格': (rootRow?.match(/\| (\d+\.\d+\.\d+) \|\s*$/) || [])[1],
  };
  const expect = opt('expect') || found['design-system.json'];
  const bad = Object.entries(found).filter(([, v]) => v !== expect);
  console.log(`${s.name}（${s.id}）`);
  for (const [k, v] of Object.entries(found)) console.log(`  ${v === expect ? 'ok  ' : 'FAIL'} ${k.padEnd(24)} ${v ?? '（未找到）'}`);
  if (bad.length) { console.error(`  版本不一致：期望 ${expect}，${bad.length} 处不同。`); failed = true; }
  else console.log(`  通过：六处版本号一致（${expect}）。`);

  if (s.tools) {
    const base = packName({ name: s.tools.name, version: '' }).replace(/-\.tgz$/, '');
    const stale = [];
    for (const doc of ['docs/GUIDE.md', 'README.md', `${s.dir}/README.md`]) {
      for (const m of R(doc).matchAll(new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+\\.\\d+\\.\\d+)\\.tgz`, 'g'))) if (m[1] !== s.tools.version) stale.push(`${doc} → ${m[0]}`);
    }
    if (stale.length) { console.error(`  工具直链版本过期（${s.tools.name} 现为 ${s.tools.version}）：\n    ${stale.join('\n    ')}`); failed = true; }
    else console.log(`  通过：文档里的工具直链版本与 ${s.tools.relative}（${s.tools.version}）一致。`);
  }
}
process.exit(failed ? 1 : 0);
