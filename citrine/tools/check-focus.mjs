#!/usr/bin/env node
// 键盘焦点：用真实 Tab 键遍历页面，每个停靠的元素都必须有可见焦点环（自身 outline、兄弟 / 父级的 outline 或 box-shadow）。
// 用法：node citrine/tools/check-focus.mjs [--project <appDir>] [--page orders,apply] [--steps 80]   页面名来自项目 accept.config.mjs 的 FOCUS.pages。退出码：出现 NO RING 为 1。
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { APP_DIST, requireDist, args, loadConfig, pageUrl } from './lib/paths.mjs';

requireDist();
const opt = args();
const cfg = await loadConfig();
const pages = String(opt.page || Object.keys(cfg.FOCUS.pages).join(',')).split(',').filter(Boolean);
const steps = Number(opt.steps || cfg.FOCUS.steps || 80);
const server = await serve(APP_DIST);
const browser = await launch({ width: 1600, height: 1000 });
const tab = async () => { for (const type of ['keyDown', 'keyUp']) await browser.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await sleep(60); };
const PROBE = `(() => { const a = document.activeElement; if (!a || a === document.body) return ''; const cs = getComputedStyle(a); const fv = a.matches(':focus-visible');
  let ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? 'outline ' + cs.outlineWidth + ' ' + cs.outlineColor : '';
  if (!ring && cs.boxShadow && cs.boxShadow !== 'none') ring = 'self-shadow';   /* textarea 等把焦点画在自身 inset 阴影上 */
  if (!ring) { const sib = a.nextElementSibling; if (sib) { const sc = getComputedStyle(sib); if (sc.outlineStyle !== 'none' && parseFloat(sc.outlineWidth) > 0) ring = 'sibling-outline ' + sc.outlineWidth; } }
  if (!ring && a.parentElement) { const ps = getComputedStyle(a.parentElement); if (ps.boxShadow && ps.boxShadow !== 'none') ring = 'parent-shadow'; }
  if (!ring && a.closest('.el-switch')) { const cc = getComputedStyle(a.closest('.el-switch').querySelector('.el-switch__core')); if (cc.outlineStyle !== 'none') ring = 'switch-core-outline ' + cc.outlineWidth; }
  if (!ring && a.closest('.el-input__wrapper, .el-select__wrapper, .el-range-editor')) { const w = getComputedStyle(a.closest('.el-input__wrapper, .el-select__wrapper, .el-range-editor')); if (w.boxShadow !== 'none') ring = 'input-wrapper-shadow'; }
  return (a.tagName + '.' + String(a.className || '').trim().split(/\\s+/).slice(0, 2).join('.')) + ' | fv=' + fv + ' | ' + (ring || 'NO RING'); })()`;
let failed = false;
try {
  for (const page of pages) {
    await browser.resetStorage(`${server.url}/index.html`);
    await browser.goto(pageUrl(server.url, cfg.FOCUS.pages[page] || `#/${page}`, '', cfg.DEFAULT_QUERY)); await sleep(1500);
    const seen = new Set(); const out = [];
    for (let i = 0; i < steps; i++) { await tab(); const info = await browser.evalJs(PROBE); if (info && !seen.has(info)) { seen.add(info); out.push(info); } }
    console.log(`\n== ${page}：${out.length} 类可聚焦元素`);
    for (const line of out) { if (line.endsWith('NO RING')) failed = true; console.log('  ' + line); }
  }
} finally { browser.close(); server.close(); }
if (failed) { console.log('\n未通过：存在没有可见焦点环的元素。'); process.exit(1); }
console.log('\n通过：Tab 停靠的每个元素都有可见焦点环。');
