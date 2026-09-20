#!/usr/bin/env node
// 三端响应：按项目登记的多档宽度检查。窄屏档（expect: collapsed）侧栏应默认折叠；手机档（expect: offcanvas）侧栏应离屏、
// 汉堡（.menu-btn）可唤出抽屉、点遮罩（.sidebar-mask）可关闭；所有档位文档级无横向溢出（表格容器内部滚动允许）。
// 显隐互斥：窄屏 / 桌面档 .menu-btn 必须隐藏，手机档 .collapse-btn 必须隐藏（两者都在页面上时才断言；2.11.7 之前 recipes 的 .topbar .iconbtn 特异性压过显隐规则，pages / narrow / focus 三绿仍漏过）。
// 配置：accept.config.mjs 的 NARROW —— 旧形态 { width, pages } 仍支持（视为单一 collapsed 档）；
// 新形态 { widths: [{ name, width, expect: 'collapsed' | 'offcanvas', pages? }], pages }——档位可用自己的 pages 覆盖全局（如把组件走查页从手机档剔除：内部工具页含 390 放不下的固宽组件面板，不属于「手机可用」目标）。
// 用法：node citrine/tools/check-narrow.mjs [--project <appDir>]   退出码：任一档任一页不达标为 1。
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './lib/cdp.mjs';
import { requireDist, outDir, loadConfig, pageUrl, startServer, resetUrl } from './lib/paths.mjs';

requireDist();
const OUT = outDir('narrow');
const cfg = await loadConfig();
const GLOBAL_PAGES = cfg.NARROW.pages;
const TIERS = cfg.NARROW.widths || [{ name: 'narrow', width: cfg.NARROW.width || 1366, expect: 'collapsed' }];
const server = await startServer();
const browser = await launch({ width: TIERS[0].width, height: 900 });
let failed = false;
try {
  for (const tier of TIERS) {
    await browser.setViewport(tier.width, 900);
    await browser.resetStorage(resetUrl(server.url));
    console.log(`\n== ${tier.name}（${tier.width}px · 期望 ${tier.expect}）==`);
    for (const [name, h] of tier.pages || GLOBAL_PAGES) {
      await browser.goto(pageUrl(server.url, h, '', cfg.DEFAULT_QUERY)); await sleep(1500);
      const base = await browser.evalJs(`(() => {
        const sb = document.querySelector('.sidebar');
        const r = sb ? sb.getBoundingClientRect() : null;
        return {
          collapsed: document.querySelector('.app')?.classList.contains('is-collapsed') || false,
          sidebarVisible: !!r && r.right > 0 && r.width > 0,
          sidebarW: r ? Math.round(r.width) : 0,
          menuBtn: !!document.querySelector('.menu-btn') && getComputedStyle(document.querySelector('.menu-btn')).display !== 'none',
          collapseBtn: !!document.querySelector('.collapse-btn') && getComputedStyle(document.querySelector('.collapse-btn')).display !== 'none',
          docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          mainOverflow: [...document.querySelectorAll('main *')].filter((e) => { const cs = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 1 && !['hidden', 'auto', 'scroll'].includes(cs.overflowX) && e.getBoundingClientRect().right > document.documentElement.clientWidth; }).slice(0, 5).map((e) => e.tagName + '.' + String(e.className || '').slice(0, 40)),
        };
      })()`);
      let ok, extra = {}; const why = [];
      if (tier.expect === 'offcanvas') {
        // 手机：初始侧栏离屏 + 汉堡可见 → 点开抽屉 → 点遮罩关闭
        const drawer = await browser.evalJs(`(async () => {
          const out = {};
          const btn = document.querySelector('.menu-btn');
          if (!btn) return { opened: false, closed: false };
          btn.click(); await new Promise((r) => setTimeout(r, 450));
          const sb = document.querySelector('.sidebar').getBoundingClientRect();
          out.opened = document.querySelector('.app').classList.contains('is-nav-open') && sb.left >= 0 && sb.width > 0;
          const mask = document.querySelector('.sidebar-mask');
          if (mask) { mask.click(); await new Promise((r) => setTimeout(r, 450)); }
          out.closed = !document.querySelector('.app').classList.contains('is-nav-open');
          return out;
        })()`);
        extra = drawer;
        if (base.sidebarVisible) why.push('侧栏未离屏');
        if (!base.menuBtn) why.push('汉堡 .menu-btn 不存在或不可见');
        if (base.collapseBtn) why.push('折叠按钮 .collapse-btn 在手机档仍可见');
        if (!drawer.opened) why.push('点汉堡后抽屉未打开');
        if (!drawer.closed) why.push('点遮罩后抽屉未关闭');
      } else {
        if (!base.collapsed) why.push('侧栏未折叠（.app 无 is-collapsed）');
        if (base.menuBtn) why.push('汉堡 .menu-btn 在非手机档仍可见');
      }
      if (base.docOverflow > 0) why.push(`文档横向溢出 ${base.docOverflow}px`);
      if (base.mainOverflow.length) why.push(`元素溢出 ${base.mainOverflow.join(', ')}`);
      ok = why.length === 0;
      if (!ok) failed = true;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(16)} ${JSON.stringify({ ...base, ...extra })}${why.length ? '\n     ↳ ' + why.join('；') : ''}`);
      writeFileSync(`${OUT}/${tier.name}-${name}.png`, await browser.screenshot());
    }
  }
} finally { browser.close(); server.close(); }
console.log(`\n截图 → ${OUT}`);
if (failed) process.exit(1); console.log(`通过：${TIERS.map((t) => `${t.width}px ${t.expect === 'offcanvas' ? '侧栏离屏、抽屉可开合、折叠按钮隐藏' : '侧栏折叠、汉堡隐藏'}`).join('；')}；均无横向溢出。`);
