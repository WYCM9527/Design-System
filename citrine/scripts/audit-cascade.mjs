#!/usr/bin/env node
// 级联倒置审计（维护者工具）：在真实页面上，对每个元素的每个属性，找出「种子规则里位置更后、却因特异性更低而输给前面规则」的声明。
// 这是 2.11.7 汉堡 / 折叠按钮事故的模式（.topbar .iconbtn 的 display: grid 压过后面的 .menu-btn { display: none }），
// pages / narrow / focus 都看不出来，只能从级联本身查。输出需要人判断：变体 / 状态规则压过基类是有意的，显隐 / 三端 / 覆盖失败才是 bug。
//
// 用法：node citrine/scripts/audit-cascade.mjs --dist <app/dist> [--pages "?theme=light#/kitchen,#/orders"] [--widths 1600,1366,390] [--root '#app, #root']
//   「我们的规则」= 选择器出自种子 bridge/*.css（element-plus / shadcn / recipes / iconpark）；打包后按选择器文本归属，不依赖文件。
//   报两类：A. 我们的规则之间的倒置（重点看）；B. 我们的非 reset 规则输给组件库 / Tailwind 的非状态规则（多为组件库变体规则，抽查即可）。
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from '../tools/lib/cdp.mjs';
import { serve } from '../tools/lib/serve.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter(Boolean));
if (!args.dist) { console.error('缺 --dist <app/dist>'); process.exit(2); }
const pages = String(args.pages || '?theme=light#/kitchen,#/').split(',').filter(Boolean);
const widths = String(args.widths || '1600,1366,390').split(',').map(Number);
const rootSel = args.root || '#app, #root';

// 种子桥接文件的顶层选择器集合
function selectorsOf(css) {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, ''); const out = new Set(); let depth = 0, buf = '';
  for (const c of s) { if (c === '{') { const sel = buf.trim(); if (sel && !sel.startsWith('@')) for (const p of sel.split(',')) out.add(norm(p)); depth++; buf = ''; } else if (c === '}') { depth--; buf = ''; } else buf += c; }
  return out;
}
const norm = (t) => t.replace(/\s+/g, ' ').replace(/\s*([>+~])\s*/g, ' $1 ').replace(/\s+/g, ' ').trim();
const ours = new Set();
for (const f of ['element-plus.css', 'shadcn.css', 'recipes.css', 'iconpark.css']) for (const s of selectorsOf(readFileSync(resolve(ROOT, 'seeds/brand-yellow-e/bridge', f), 'utf8'))) ours.add(s);
const isReset = (sel) => /^(\*|[a-z][a-z0-9]*(\s*,\s*[a-z][a-z0-9]*)*|html|body)$/.test(sel.trim());
const isState = (sel) => /\.is-|:hover|:focus|:active|:disabled|:checked|\[data-state|\[data-disabled|\[aria-|\[disabled|--(primary|success|warning|danger|info|small|large|default)\b|\.el-[a-z-]+--|data-\[/.test(sel);
const spec = (sel) => { const s = sel.replace(/::[a-z-]+/g, '').replace(/:(not|where|is)\(([^)]*)\)/g, '$2'); const ids = (s.match(/#[\w-]+/g) || []).length; const cls = (s.match(/\.[\w-]+|\[[^\]]+\]|:[a-z-]+/g) || []).length; const els = (s.match(/(^|[\s>+~(,])[a-z][\w-]*/g) || []).length; return ids * 10000 + cls * 100 + els; };

const server = await serve(resolve(args.dist));
const b = await launch({ width: widths[0], height: 1000 });
const send = async (m, p) => { const r = await b.send(m, p); if (r.error) throw new Error(r.error.message); return r.result; };
await send('DOM.enable'); await send('CSS.enable');
const same = new Map(), cross = new Map();
try {
  for (const w of widths) {
    await b.setViewport(w, 1000);
    for (const page of pages) {
      await b.goto(`${server.url}/index.html${page}`, `!!document.querySelector(${JSON.stringify(rootSel)}) && document.querySelector(${JSON.stringify(rootSel)}).children.length > 0`); await sleep(1200);
      const { root } = await send('DOM.getDocument', { depth: -1 });
      const { nodeIds } = await send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'body *' });
      for (const nodeId of nodeIds.slice(0, 1500)) {
        let m; try { m = await send('CSS.getMatchedStylesForNode', { nodeId }); } catch { continue; }
        const infos = [];
        for (const r of (m.matchedCSSRules || []).filter((r) => r.rule.origin === 'regular')) {
          const sels = r.matchingSelectors.map((i) => r.rule.selectorList.selectors[i].text);
          const props = new Map(); for (const p of r.rule.style.cssProperties) if (!p.disabled && p.text && !p.implicit) props.set(p.name, { value: p.value, important: !!p.important });
          infos.push({ mine: sels.some((t) => ours.has(norm(t))), sel: sels.join(', '), sp: Math.max(...sels.map(spec)), start: r.rule.style.range ? r.rule.style.range.startLine * 100000 + r.rule.style.range.startColumn : -1, props, media: (r.rule.media || []).filter((x) => x.source === 'mediaRule').map((x) => x.text).join(' & ') });
        }
        const byProp = new Map();
        for (const info of infos) for (const [name, d] of info.props) { if (!byProp.has(name)) byProp.set(name, []); byProp.get(name).push({ info, d }); }
        for (const [name, list] of byProp) {
          if (list.length < 2) continue; const win = list[list.length - 1];
          for (const c of list.slice(0, -1)) {
            const a = c.info, wn = win.info; if (!a.mine || c.d.important || win.d.important || c.d.value === win.d.value) continue;
            if (wn.mine && a.start > wn.start && a.sp < wn.sp) { const k = `${wn.sel}  ⟶ 压住 ⟶  ${a.sel}${a.media ? ' @' + a.media : ''}  · ${name}`; if (!same.has(k)) same.set(k, `赢 ${win.d.value} ｜ 输 ${c.d.value} ｜ ${page}@${w}`); }
            else if (!wn.mine && !isState(wn.sel) && !isReset(a.sel)) { const k = `${wn.sel.slice(0, 100)}  ⟶  ${a.sel}  · ${name}`; if (!cross.has(k)) cross.set(k, `赢 ${win.d.value} ｜ 输 ${c.d.value} ｜ ${page}@${w}`); }
          }
        }
      }
    }
  }
} finally { b.close(); server.close(); }
console.log(`\nA. 种子规则之间的级联倒置（前者位置更前、特异性更高，压住后者）：${same.size} 组`);
for (const [k, v] of same) console.log(`- ${k}\n    ${v}`);
console.log(`\nB. 种子非 reset 规则输给组件库 / Tailwind 的非状态规则：${cross.size} 组`);
for (const [k, v] of cross) console.log(`- ${k}\n    ${v}`);
console.log('\n判断口径：变体 / 状态 / 尺寸规则压过基类是有意的；显隐、三端、桥接接管失效才是 bug。已知良性：.act 与 .more-link 的 min-height（.act 有显式 height）。');
