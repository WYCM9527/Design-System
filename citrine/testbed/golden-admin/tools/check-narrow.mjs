#!/usr/bin/env node
// 窄屏（1366px）：侧栏应默认折叠，页面与内容区无横向溢出（表格自身横向滚动允许）。
// 用法：node tools/check-narrow.mjs   退出码：任一页未折叠或有溢出为 1。
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { APP_DIST, requireDist, outDir } from './lib/paths.mjs';

requireDist();
const OUT = outDir('narrow');
const PAGES = [['dashboard', '#/'], ['orders', '#/orders'], ['refunds', '#/refunds'], ['analytics', '#/analytics'], ['campaigns-card', '&view=card#/campaigns'], ['members', '#/members'], ['order-detail', '#/orders/20260908-0412'], ['apply', '#/merchants/apply'], ['kitchen', '#/kitchen']];
const server = await serve(APP_DIST);
const browser = await launch({ width: 1366, height: 900 });
let failed = false;
try {
  await browser.resetStorage(`${server.url}/index.html`);
  for (const [name, h] of PAGES) {
    await browser.goto(`${server.url}/index.html?role=admin${h}`); await sleep(1500);
    const info = await browser.evalJs(`(() => ({
      collapsed: document.querySelector('.app').classList.contains('is-collapsed'),
      sidebarW: Math.round(document.querySelector('.sidebar').getBoundingClientRect().width),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mainOverflow: [...document.querySelectorAll('main *')].filter((e) => { const cs = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 1 && !['hidden', 'auto', 'scroll'].includes(cs.overflowX) && e.getBoundingClientRect().right > document.documentElement.clientWidth; }).slice(0, 5).map((e) => e.tagName + '.' + String(e.className || '').slice(0, 40)),
    }))()`);
    const ok = info.collapsed && info.docOverflow <= 0 && info.mainOverflow.length === 0;
    if (!ok) failed = true;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(16)} ${JSON.stringify(info)}`);
    writeFileSync(`${OUT}/${name}.png`, await browser.screenshot());
  }
} finally { browser.close(); server.close(); }
console.log(`\n截图 → ${OUT}`);
if (failed) process.exit(1); console.log('通过：1366px 下侧栏折叠、无横向溢出。');
