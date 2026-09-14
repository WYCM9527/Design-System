#!/usr/bin/env node
// 全组件走查：#/kitchen 页铺开 Element Plus 全部组件，亮 / 暗两种模式下对每个交互元素（连同祖先链）强制 :hover 与 :focus-visible，
// 只报三类硬问题：状态切换新引入的品牌黄、悬停后文字对比掉档、页面上不来自 token 的颜色（外来颜色）。浮层（data-ks-open）与弹层（data-ks-modal）逐个打开扫描。
// 用法：node citrine/tools/scan-components.mjs [--project <appDir>] [--modes light,dark|all]   退出码：有发现为 1。项目未登记 KITCHEN 时跳过。
import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { APP_DIST, TOKENS_DIST, requireDist, outDir, args, parseModes, modeQuery, loadConfig, pageUrl } from './lib/paths.mjs';

const opt = args(); requireDist();
const cfg = await loadConfig();
if (!cfg.KITCHEN) { console.log('项目未登记全组件走查页（accept.config.mjs 的 KITCHEN），跳过 scan:components。'); process.exit(0); }
const modes = parseModes(opt.modes || opt._[0]);
const OUT = outDir('components');
const PROBE = readFileSync(resolve(import.meta.dirname, 'lib/component-probe.js'), 'utf8');
// 验收基线里已批准的状态色文字（亮 / 暗），悬停对比检查对它们放行
const APPROVED_FG = new Set(['rgb(11, 158, 116)', 'rgb(215, 103, 18)', 'rgb(238, 72, 75)', 'rgb(0, 165, 110)', 'rgb(203, 126, 0)', 'rgb(235, 99, 120)']);
// token 颜色集合（rgb 三元组），取自构建产物：不在集合里的可见颜色就是"外来颜色"
const tokenRgbs = (() => { const set = new Set(); const files = [resolve(TOKENS_DIST, 'tokens.css'), ...readdirSync(resolve(TOKENS_DIST, 'themes')).map((f) => resolve(TOKENS_DIST, 'themes', f))]; for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?\b/g)) set.add([0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(',')); return [...set]; })();
const TARGET_SEL = 'button, a, input, textarea, label, li, [role], [tabindex], .el-radio, .el-checkbox, .el-switch, .el-tag, .el-select__wrapper, .el-input__wrapper, .el-textarea__inner, .el-table__row, .el-table__cell, .el-pager li, .el-step, .el-tree-node__content, .el-collapse-item__header, .el-tabs__item, .el-menu-item, .el-sub-menu__title, .el-dropdown-menu__item, .el-select-dropdown__item, .el-cascader-node, .el-date-table td, .el-date-table-cell, .el-time-spinner__item, .el-transfer-panel__item, .el-upload-list__item, .el-upload-dragger, .el-segmented__item, .el-slider__button, .el-rate__item, .el-card, .el-link, .el-breadcrumb__inner, .el-page-header__back, .el-anchor__link, .el-timeline-item__node, .el-calendar-day, .el-check-tag, .el-input-number__increase, .el-input-number__decrease, .el-icon, .el-tag__close, .el-select__caret, .el-input__clear, .el-input__password, .el-month-table td, .el-year-table td, .el-picker-panel__shortcut, .el-picker-panel__icon-btn, .el-time-panel__btn, .el-dialog__headerbtn, .el-drawer__close-btn, .el-message-box__headerbtn, .el-message__closeBtn, .el-notification__closeBtn, .el-alert__close-btn, .el-color-dropdown__btns button, .el-carousel__arrow, .el-collapse-item__arrow, .el-table__expand-icon, .caret-wrapper, .el-table-filter__list-item, .el-upload';
const key = (y) => `${y.section}|${y.path}|${y.prop}`;
// 浮层容器：Element 的 .el-popper，以及 Radix / shadcn 的 popper 内容与角色（页面里以字符串内联进 evalJs）
const POPPER_SEL = JSON.stringify('.el-popper, [data-radix-popper-content-wrapper] > *, [data-radix-menu-content], [role="menu"], [role="listbox"], [role="tooltip"]');

const server = await serve(APP_DIST);
const browser = await launch({ width: 1600, height: 1000 });
const { send, evalJs, callOn } = browser;
await send('DOM.enable'); await send('CSS.enable');
const consoleErrors = [];
browser.onEvent((m) => { if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 200) || 'exception'); else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push('error: ' + m.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200)); });

async function docTree() { const d = await send('DOM.getDocument', { depth: -1, pierce: false }); const parent = new Map(), info = new Map(); const walk = (n, p) => { parent.set(n.nodeId, p); const cls = (n.attributes || []).reduce((a, v, i, arr) => (arr[i - 1] === 'class' ? v : a), ''); info.set(n.nodeId, { name: n.localName, cls }); for (const c of n.children || []) walk(c, n.nodeId); }; walk(d.result.root, 0); return { parent, info }; }
function chainOf(tree, nodeId) { const chain = []; let n = nodeId; for (let i = 0; n && i < 12; i++) { const inf = tree.info.get(n); if (!inf || inf.name === 'body' || inf.name === 'html') break; chain.push(n); if (/\bks\b|el-overlay|el-popper|el-message\b|el-notification\b/.test(inf.cls || '')) break; n = tree.parent.get(n); } return chain; }

async function probeNodes(tree, nodeIds, findings, budget) {
  const seen = new Map(); let n = 0;
  for (const nodeId of nodeIds) {
    let obj; try { obj = await send('DOM.resolveNode', { nodeId }); } catch { continue; }
    const objectId = obj.result?.object?.objectId; if (!objectId) continue;
    const tag = await callOn(objectId, 'function(){ return __ks.visible(this) ? __ks.path(this) + "||" + __ks.section(this) : null }'); if (!tag) continue;
    const cnt = seen.get(tag) || 0; if (cnt >= budget) continue; seen.set(tag, cnt + 1);
    const rest = await callOn(objectId, 'function(){ return __ks.probe(this) }'); if (!rest) continue;
    const chain = chainOf(tree, nodeId);
    for (const state of [['hover'], ['focus', 'focus-visible']]) {
      for (const c of chain) await send('CSS.forcePseudoState', { nodeId: c, forcedPseudoClasses: state });
      const st = await callOn(objectId, 'function(){ return __ks.probe(this) }');
      for (const c of chain) await send('CSS.forcePseudoState', { nodeId: c, forcedPseudoClasses: [] });
      if (!st) continue;
      const restKeys = new Set(rest.yellow.map(key));
      for (const y of st.yellow) if (!restKeys.has(key(y))) findings.push({ kind: state[0] + '-yellow', section: y.section, target: rest.sig, path: y.path, prop: y.prop, value: y.value });
      if (state[0] === 'hover') for (const t of st.texts) { if (APPROVED_FG.has(t.fg)) continue; const r0 = rest.texts.find((x) => x.path === t.path); const need = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700) ? 3 : 4.5; if (t.ratio < need && (!r0 || r0.ratio >= need || t.ratio < r0.ratio - 0.5)) findings.push({ kind: 'hover-contrast', section: rest.section, target: rest.sig, path: t.path, ratio: t.ratio, was: r0?.ratio, fg: t.fg, bg: t.bg }); }
    }
    n++;
  }
  return n;
}

async function scanRoot(rootExpr, findings, label, budget = 2) {
  const tree = await docTree();
  const rootObj = await evalJs(rootExpr, { byValue: false }); if (!rootObj?.objectId) return { rest: [], probed: 0 };
  const rq = await send('DOM.requestNode', { objectId: rootObj.objectId }); const rootId = rq.result?.nodeId; if (!rootId) return { rest: [], probed: 0 };
  const rest = (await callOn(rootObj.objectId, 'function(){ return __ks.snapshot(this) }')) || [];
  const foreign = (await callOn(rootObj.objectId, 'function(){ return __ks.foreign(this) }')) || [];
  for (const f of foreign) findings.push({ kind: 'foreign-color', section: f.section, target: f.path, path: f.path, prop: f.prop, value: f.value });
  const q = await send('DOM.querySelectorAll', { nodeId: rootId, selector: TARGET_SEL });
  const probed = await probeNodes(tree, q.result?.nodeIds || [], findings, budget);
  return { rest: rest.map((y) => ({ ...y, where: label })), probed };
}
const esc = async () => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); };

const report = {}; let failed = false;
try {
  for (const mode of modes) {
    await browser.resetStorage(`${server.url}/index.html`); consoleErrors.length = 0;
    await browser.goto(pageUrl(server.url, cfg.KITCHEN, modeQuery(mode), cfg.DEFAULT_QUERY), "document.readyState === 'complete' && document.querySelectorAll('.ks').length >= 10");
    await sleep(1500);
    await evalJs(`window.__ksTokens = ${JSON.stringify(tokenRgbs)}; 'ok'`); await evalJs(PROBE + "; 'ok'");
    const findings = [], rest = []; let probed = 0;
    const h = await evalJs('document.documentElement.scrollHeight');
    await browser.setViewport(1600, Math.min(h, 16000)); await sleep(300);
    writeFileSync(`${OUT}/${mode}-kitchen.png`, await browser.screenshot({ captureBeyondViewport: true }));
    await browser.setViewport(1600, 1000);
    { const r = await scanRoot('document.body', findings, 'page', 3); rest.push(...r.rest); probed += r.probed; }
    const openers = await evalJs('document.querySelectorAll("[data-ks-open]").length');
    for (let i = 0; i < openers; i++) {
      const before = await evalJs(`[...document.querySelectorAll(${POPPER_SEL})].filter((p) => __ks.visible(p)).length`);
      const info = await evalJs(`(() => { const o = document.querySelectorAll("[data-ks-open]")[${i}]; const type = o.getAttribute("data-ks-type") || ""; const t = type === "dropdown" ? (o.querySelector(".el-dropdown__caret-button") || o.querySelector(".el-tooltip__trigger") || o.querySelector(".el-button") || o) : (o.matches("button, .el-button") ? o : (o.querySelector("input, .el-select__wrapper, .el-button") || o)); t.scrollIntoView({ block: "center" }); const r = t.getBoundingClientRect(); return { label: __ks.path(o), type, x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`);
      for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: info.x, y: info.y, button: 'left', clickCount: 1 });
      if (info.type === 'autocomplete') { await sleep(200); await send('Input.insertText', { text: '鲜' }); }
      await sleep(600);
      const cnt = await evalJs(`[...document.querySelectorAll(${POPPER_SEL})].filter((p) => __ks.visible(p)).length`);
      if (cnt <= before) { findings.push({ kind: 'popper-not-opened', target: info.label }); continue; }
      const r = await scanRoot(`[...document.querySelectorAll(${POPPER_SEL})].filter((p) => __ks.visible(p)).at(-1)`, findings, 'popper:' + info.label, 2); rest.push(...r.rest); probed += r.probed;
      await esc(); await evalJs('document.body.click(); document.activeElement && document.activeElement.blur(); "ok"'); await sleep(300);
    }
    const modals = await evalJs('[...document.querySelectorAll("[data-ks-modal]")].map((b) => b.getAttribute("data-ks-modal"))');
    for (let i = 0; i < modals.length; i++) {
      await evalJs(`(() => { const b = document.querySelectorAll("[data-ks-modal]")[${i}]; b.scrollIntoView({ block: "center" }); b.click(); return 1 })()`); await sleep(600);
      const sel = modals[i] === 'message' ? '[...document.querySelectorAll(".el-message")].at(-1)' : modals[i] === 'notification' ? '[...document.querySelectorAll(".el-notification")].at(-1)' : '[...document.querySelectorAll(".el-overlay, [role=\\"dialog\\"], [role=\\"alertdialog\\"]")].filter((p) => __ks.visible(p)).at(-1)';
      const r = await scanRoot(sel, findings, 'modal:' + modals[i], 2); rest.push(...r.rest); probed += r.probed;
      if (!r.probed) findings.push({ kind: 'modal-not-opened', target: modals[i] });
      if (modals[i] === 'message' || modals[i] === 'notification') await evalJs('document.querySelectorAll(".el-message, .el-notification").forEach((e) => e.remove()); "ok"');
      else { await esc(); await sleep(400); await evalJs('document.querySelectorAll(".el-overlay").forEach((o) => { if (__ks.visible(o)) { const b = o.querySelector(".el-dialog__headerbtn, .el-drawer__close-btn, .el-message-box__headerbtn, .el-message-box__btns .el-button"); b && b.click(); } }); "ok"'); await sleep(400); }
    }
    const group = (list, keyFn) => { const m = new Map(); for (const x of list) { const k = keyFn(x); const g = m.get(k) || { ...x, count: 0 }; g.count++; m.set(k, g); } return [...m.values()]; };
    const restGroups = group(rest, (y) => `${y.where === 'page' ? y.section : y.where}|${y.path}|${y.prop}`);
    const fGroups = group(findings, (f) => `${f.kind}|${f.section || ''}|${f.target}|${f.path || ''}|${f.prop || ''}`);
    report[mode] = { probed, resting: restGroups, findings: fGroups, consoleErrors: [...new Set(consoleErrors)].slice(0, 20) };
    console.log(`\n===== ${mode}: 探测 ${probed} 个交互元素 · 静息黄色 ${restGroups.length} 组（应只含主按钮 / 进度 / 滑杆 / 勾选开关选中 / 当前步骤 / 时间线主节点 / 加载转圈）· 状态发现 ${fGroups.length} 组 =====`);
    for (const g of fGroups) { failed = true; console.log(`  ${g.kind} [${g.section || ''}] ${g.target}${g.path && g.path !== g.target ? ' → ' + g.path : ''} ${g.prop ? g.prop + ' ' + g.value : ''}${g.ratio ? `ratio ${g.ratio} (was ${g.was}) ${g.fg} on ${g.bg}` : ''} ×${g.count}`); }
    if (report[mode].consoleErrors.length) console.log('  console:', report[mode].consoleErrors);
  }
} finally { browser.close(); server.close(); }
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(`\n报告与整页截图 → ${OUT}`);
if (failed) process.exit(1); console.log('通过：hover / focus 未新引入品牌黄，悬停对比无掉档，无外来颜色。');
