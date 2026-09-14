#!/usr/bin/env node
// citrine-accept <pages|components|narrow|focus|previews|all> [--project <appDir>] [--modes all|light|dark] [--no-shots] [--out <dir>] [--previews <dir>] [--with-previews]
// 依次运行对应脚本；all = pages → components → narrow → focus，加 --with-previews 才跑 E/S 像素对照（只有黄金后台有预览页）。任一步失败即退出非零。
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const TOOLS = resolve(here, '..');
const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith('--')) || 'all';
const rest = argv.filter((a) => a !== cmd && a !== '--with-previews');
const SCRIPTS = { pages: 'scan-pages.mjs', components: 'scan-components.mjs', narrow: 'check-narrow.mjs', focus: 'check-focus.mjs', previews: 'diff-previews.mjs' };
const steps = cmd === 'all' ? ['pages', 'components', 'narrow', 'focus', ...(argv.includes('--with-previews') ? ['previews'] : [])] : [cmd];
if (!steps.every((s) => SCRIPTS[s])) { console.error(`未知步骤 ${cmd}；可用：${Object.keys(SCRIPTS).join(' | ')} | all`); process.exit(2); }
const withModes = (s) => (['pages', 'components'].includes(s) && !rest.some((a) => a.startsWith('--modes')) ? ['--modes', 'all'] : []);
for (const s of steps) {
  console.log(`\n▶ citrine-accept ${s}`);
  const r = spawnSync(process.execPath, [resolve(TOOLS, SCRIPTS[s]), ...withModes(s), ...rest], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
