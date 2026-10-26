#!/usr/bin/env node
// 页面验收扫描：全部页面状态 × 亮 / 暗，检查对比度、可访问名称、命中区、溢出、截断、重复 id、允许清单之外的品牌色，并逐页截图。
// 用法：node citrine/tools/scan-pages.mjs [--project <appDir>] [--modes light,dark|all] [--only kitchen,apply-*] [--no-shots]
// 退出码：有未批准的低对比 / 无名称 / 溢出 / 重复 id / 允许清单之外的品牌色时为 1（截断与小命中区只提示：句中链接与伪元素外扩的图标按基线允许）。
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { launch, sleep } from './lib/cdp.mjs';
import { APP, PROJECT, requireDist, outDir, args, parseModes, modeQuery, loadConfig, pageUrl, startServer, READY, resetUrl } from './lib/paths.mjs';
import { brandFor, brandJs, describeBrand } from './lib/brand.mjs';
import { approvedFor } from './lib/approved.mjs';

const opt = args();
requireDist();
const cfg = await loadConfig();
const PAGES = cfg.PAGES;
const modes = parseModes(opt.modes || opt._[0]);
const only = opt.only ? String(opt.only).split(',') : null;
const match = (name) => !only || only.some((p) => p.endsWith('*') ? name.startsWith(p.slice(0, -1)) : name === p);
const pages = PAGES.filter(([n]) => match(n));
const OUT = outDir('pages');
const audit = readFileSync(resolve(import.meta.dirname, 'lib/page-audit.js'), 'utf8');
const PROBE = readFileSync(resolve(import.meta.dirname, 'lib/component-probe.js'), 'utf8');
const BRAND = brandFor(cfg, APP);   // 品牌色口径：判色范围 + 静息态允许清单（设计系统身份文件的 accept.brand，Citrine 用内置的黄；项目 BRAND / BRAND_ALLOW 覆盖与追加）
const allowSel = BRAND ? BRAND.allow.join(', ') : '';
const probeJs = `${brandJs(BRAND)}\n${PROBE}; 'ok'`;
const approvedJs = `window.__ACCEPT_APPROVED__ = ${JSON.stringify(approvedFor('pages', cfg, APP))}; 1`;   // 已批准的对比度例外（Citrine 内置按项目所用系统开关 + 项目 APPROVED_CONTRAST），页面审计据此把对应低对比计入 approved

console.log(describeBrand(BRAND));
const server = await startServer();
const browser = await launch({ width: 1600, height: 1000 });
const report = {}; const totals = { small: 0, noName: 0, overflowX: 0, truncated: 0, lowContrast: 0, tinyTargets: 0, dupIds: 0, brand: 0, approved: 0 };
try {
  for (const mode of modes) {
    for (const [name, spec] of pages) {
      await browser.resetStorage(resetUrl(server.url));
      await browser.goto(pageUrl(server.url, spec, modeQuery(mode), cfg.DEFAULT_QUERY), READY);
      await sleep(1000);
      await browser.noMotion();   // 懒加载的路由在慢机器（CI）上挂载晚，1 秒时状态切换的过渡可能还没走完，读到中间色会误报低对比
      let res; try { await browser.evalJs(approvedJs); res = await browser.evalJs(audit); } catch (e) { res = { error: String(e).slice(0, 200) }; }
      res.brand = [];
      if (BRAND) try { await browser.evalJs(probeJs); res.brand = await browser.evalJs(`__ks.brandAudit(${JSON.stringify(allowSel)})`); } catch (e) { res.brandError = String(e).slice(0, 160); }
      res.mode = mode; res.title = await browser.evalJs('document.title');
      // 暗色那一遍要确认页面真的切了主题（?theme=dark → <html class="dark">，见 accept.config 模板）；否则等于把亮色扫两遍还报「通过」
      if (mode === 'dark') res.darkApplied = await browser.evalJs(`!!document.querySelector(${JSON.stringify(cfg.DARK_SELECTOR || 'html.dark')})`);
      report[`${mode}/${name}`] = res;
      if (!opt['no-shots']) writeFileSync(`${OUT}/${mode}-${name}.png`, await browser.screenshot());
      const counts = Object.fromEntries(['small', 'noName', 'overflowX', 'truncated', 'lowContrast', 'tinyTargets', 'dupIds', 'brand'].map((k) => [k, (res[k] || []).length]));
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
  for (const it of res.brand || []) fail.push(`${page} ${BRAND.name}出现在允许清单之外 ${it.path} ${it.prop} ${it.value}（${BRAND.note ? `允许：${BRAND.note}；` : ''}项目合法位置加进 accept.config 的 BRAND_ALLOW）`);
  if (res.brandError) fail.push(`${page} ${BRAND.name}审计出错（允许清单里的选择器写错时也会这样）${res.brandError}`);
  if (res.error) fail.push(`${page} 扫描出错 ${res.error}`);
  if (res.mode === 'dark' && res.darkApplied === false) fail.push(`${page} 暗色未生效：页面没把 ?theme=dark 落成 ${cfg.DARK_SELECTOR || 'html.dark'}（index.html 首屏读 URL 再读 localStorage，见 accept.config 模板）；项目确实没有暗色就用 --modes light`);
}
console.log(`\n[${PROJECT}] ${Object.keys(report).length} 个页面状态 · ${JSON.stringify(totals)}\n报告与截图 → ${OUT}`);
if (fail.length) { console.log('\n未通过：'); fail.slice(0, 40).forEach((f) => console.log('  ' + f)); process.exit(1); }
console.log(`通过：无未批准的低对比、无名称、溢出与重复 id；${BRAND ? `${BRAND.name}只出现在允许清单内` : '品牌色审计未配置'}。`);
