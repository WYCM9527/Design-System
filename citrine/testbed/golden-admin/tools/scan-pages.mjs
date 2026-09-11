#!/usr/bin/env node
// 页面验收扫描：全部页面状态 × 亮 / 暗，检查对比度、可访问名称、命中区、溢出、截断、重复 id，并逐页截图。
// 用法：node tools/scan-pages.mjs [--modes light,dark|all] [--only kitchen,apply-*] [--no-shots]
// 退出码：有未批准的低对比 / 无名称 / 溢出 / 重复 id 时为 1（截断与小命中区只提示：句中链接与伪元素外扩的图标按基线允许）。
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { APP_DIST, requireDist, outDir, args, parseModes, modeQuery } from './lib/paths.mjs';
import { PAGES, pageUrl } from './lib/pages.mjs';

const opt = args();
requireDist();
const modes = parseModes(opt.modes || opt._[0]);
const only = opt.only ? String(opt.only).split(',') : null;
const match = (name) => !only || only.some((p) => p.endsWith('*') ? name.startsWith(p.slice(0, -1)) : name === p);
const pages = PAGES.filter(([n]) => match(n));
const OUT = outDir('pages');
const audit = readFileSync(resolve(import.meta.dirname, 'lib/page-audit.js'), 'utf8');

const server = await serve(APP_DIST);
const browser = await launch({ width: 1600, height: 1000 });
const report = {}; const totals = { small: 0, noName: 0, overflowX: 0, truncated: 0, lowContrast: 0, tinyTargets: 0, dupIds: 0, approved: 0 };
try {
  for (const mode of modes) {
    for (const [name, spec] of pages) {
      await browser.resetStorage(`${server.url}/index.html`);
      await browser.goto(pageUrl(server.url, spec, modeQuery(mode)), "document.readyState === 'complete' && document.querySelector('#app') && document.querySelector('#app').children.length > 0 && document.body.innerText.trim().length > 20");
      await sleep(1000);
      let res; try { res = await browser.evalJs(audit); } catch (e) { res = { error: String(e).slice(0, 200) }; }
      res.mode = mode; res.title = await browser.evalJs('document.title');
      report[`${mode}/${name}`] = res;
      if (!opt['no-shots']) writeFileSync(`${OUT}/${mode}-${name}.png`, await browser.screenshot());
      const counts = Object.fromEntries(['small', 'noName', 'overflowX', 'truncated', 'lowContrast', 'tinyTargets', 'dupIds'].map((k) => [k, (res[k] || []).length]));
      for (const k in counts) totals[k] += counts[k]; totals.approved += res.approvedExceptions || 0;
      console.log(`${mode.padEnd(7)} ${name.padEnd(22)} ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')} approved:${res.approvedExceptions || 0}${res.imgNoAlt ? ' imgNoAlt:' + res.imgNoAlt : ''}${res.error ? ' ERR ' + res.error : ''}`);
    }
  }
} finally { browser.close(); server.close(); }
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));

// 汇总
const fail = [];
for (const [page, res] of Object.entries(report)) {
  for (const it of res.lowContrast || []) fail.push(`${page} 低对比 ${it.el} "${it.text}" ${it.cr}:1 ${it.fg} on ${it.bg}`);
  for (const it of res.noName || []) fail.push(`${page} 无名称 ${it.el} ${it.w}×${it.h}`);
  for (const it of res.overflowX || []) fail.push(`${page} 横向溢出 ${it.el} ${it.sw}>${it.cw}`);
  for (const id of res.dupIds || []) fail.push(`${page} 重复 id #${id}`);
  if (res.error) fail.push(`${page} 扫描出错 ${res.error}`);
}
console.log(`\n${Object.keys(report).length} 个页面状态 · ${JSON.stringify(totals)}\n报告与截图 → ${OUT}`);
if (fail.length) { console.log('\n未通过：'); fail.slice(0, 40).forEach((f) => console.log('  ' + f)); process.exit(1); }
console.log('通过：无未批准的低对比、无名称、溢出与重复 id。');
