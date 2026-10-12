// 线性图标合并上色。IconPark、lucide 的图标都由多段描边拼成，图标色又多是半透明（color.icon.default 65% 黑、color.icon.muted 45% 黑），
// 各段各自上色时，交叠处会叠出更深的一块。这里把每只单色图标的各段复制进同一个 <mask>，再用一块 currentColor 的矩形透过它画一次：
// 相当于把图标轮廓化、合并成一个形状再上色，整只图标只上一次色。原来的各段由 iconpark.css / shadcn.css 设为透明，仍留在原处。
// 描边粗细不在这里定：样式表让描边按屏幕上的 icon.stroke.width 画，蒙版里的副本同样适用。
//
// 用法：入口里调一次，之后新渲染、更新的图标自动处理；双色 / 多色、或样式表另给了填充 / 描边色的图标不处理。
//   import { mergeIcons } from '@wycm9527/morganite/icon-merge'
//   mergeIcons()          // Vue：main.js 里 app.mount() 之后；React：main.tsx 里 render() 之后
// 服务端渲染的项目在客户端水合完成后再调，免得改动 DOM 引起水合不一致。

const NS = 'http://www.w3.org/2000/svg';
const ICONS = '.i-icon > svg, svg.lucide';
const MARK = 'data-icon-merge';
const MERGED = 'data-icon-merged';
const NOT_PARTS = new Set(['defs', 'mask', 'clipPath', 'pattern', 'symbol', 'linearGradient', 'radialGradient', 'filter', 'title', 'desc', 'style', 'metadata']);
const NOT_PAINTED = 'defs, mask, clipPath, pattern, symbol, linearGradient, radialGradient, filter';
const WATCHED = ['d', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'transform', 'stroke', 'fill', 'viewBox'];
const snapshots = new WeakMap();
let seq = 0;

const parts = (svg) => [...svg.children].filter((el) => !el.hasAttribute(MARK) && !NOT_PARTS.has(el.localName));
const node = (name, attrs) => {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

// 单色：每一段（连同子元素）的填充、描边要么没有，要么就是文字色。读计算样式，样式表用类名另给的颜色也算在内
const isMono = (nodes) => nodes.every((n) => [n, ...n.querySelectorAll('*')].every((el) => {
  if (el.closest(NOT_PAINTED)) return true;
  const s = getComputedStyle(el);
  return [s.fill, s.stroke].every((v) => v === 'none' || v === s.color);
}));

// 只读不写：图标各段没变时返回 null，否则返回要做的事
function plan(svg) {
  const nodes = parts(svg);
  const snapshot = ['viewBox', 'stroke', 'fill'].map((a) => svg.getAttribute(a)).join('|') + nodes.map((n) => n.outerHTML).join('');
  if (snapshots.get(svg) === snapshot) return null;
  snapshots.set(svg, snapshot);
  const box = svg.viewBox.baseVal;
  return { svg, nodes, box, ok: nodes.length > 0 && !!box && box.width > 0 && isMono(nodes) };
}

function apply({ svg, nodes, box, ok }) {
  svg.querySelector(`:scope > [${MARK}]`)?.remove();
  if (!ok) { svg.removeAttribute(MERGED); return; }
  // 描边按屏幕粗细画，小图标上会伸出视框一点，蒙版四周留出余量
  const pad = Math.max(box.width, box.height) / 4;
  const area = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
  const id = `icon-merge-${++seq}`;
  const mask = node('mask', { id, maskUnits: 'userSpaceOnUse', ...area });
  // 副本里的 currentColor（写在各段上的、从 <svg> 继承的）都解析成白色：蒙版只管形状，颜色由下面的矩形一次给出
  const shape = node('g', { color: '#fff' });
  for (const n of nodes) {
    const copy = n.cloneNode(true);
    for (const el of [copy, ...copy.querySelectorAll('[id]')]) el.removeAttribute('id');
    shape.append(copy);
  }
  mask.append(shape);
  // 蒙版不影响命中测试，矩形会让整块视框都能点到；指针事件仍交给原来的各段
  const group = node('g', { [MARK]: '', 'pointer-events': 'none' });
  group.append(mask, node('rect', { ...area, fill: 'currentColor', mask: `url(#${id})` }));
  svg.append(group);
  svg.setAttribute(MERGED, '');
}

// 先把一批图标都读完再统一写，整批只触发一次样式计算
const run = (svgs) => svgs.map(plan).filter(Boolean).forEach(apply);

/** 合并一只图标；已合并且各段没变时什么都不做 */
export function mergeIcon(svg) {
  run([svg]);
}

/** 合并 root 里现有的图标，并持续处理之后加进来或被改动的图标；返回停止监听的函数 */
export function mergeIcons(root = document.body) {
  const queue = new Set();
  const flush = () => {
    const svgs = [...queue].filter((svg) => svg.isConnected);
    queue.clear();
    run(svgs);
  };
  const add = (svg) => {
    if (!queue.size) queueMicrotask(flush);
    queue.add(svg);
  };
  run([...root.querySelectorAll(ICONS)]);
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      const host = (r.target.nodeType === 1 ? r.target : r.target.parentElement)?.closest(ICONS);
      if (host) { add(host); continue; }
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        const svg = n.closest(ICONS);
        if (svg) add(svg);
        else n.querySelectorAll(ICONS).forEach(add);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: WATCHED });
  return () => observer.disconnect();
}
