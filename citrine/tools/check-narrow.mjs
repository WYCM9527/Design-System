#!/usr/bin/env node
// 窄屏：侧栏应默认折叠，页面与内容区无横向溢出（表格自身横向滚动允许）。宽度与页面来自项目 accept.config.mjs 的 NARROW。
// 用法：node citrine/tools/check-narrow.mjs [--project <appDir>]   退出码：任一页未折叠或有溢出为 1。
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { APP_DIST, requireDist, outDir, loadConfig, pageUrl } from './lib/paths.mjs';

requireDist();
const OUT = outDir('narrow');
const cfg = await loadConfig();
const PAGES = cfg.NARROW.pages;
const server = await serve(APP_DIST);
const browser = await launch({ width: cfg.NARROW.width, height: 900 });
let failed = false;
try {
  await browser.resetStorage(`${server.url}/index.html`);
  for (const [name, h] of PAGES) {
    await browser.goto(pageUrl(server.url, h, '', cfg.DEFAULT_QUERY)); await sleep(1500);
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
if (failed) process.exit(1); console.log(`通过：${cfg.NARROW.width}px 下侧栏折叠、无横向溢出。`);
