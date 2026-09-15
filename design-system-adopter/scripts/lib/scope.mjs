// 范围根：把一份 CSS 包进 @scope (html.<root>) { … }，让整套设计系统只在 <html class="<root>"> 时生效——
// 用于同一应用里只覆盖部分路由板块。挂在 html 而不是容器上：Element / Radix 的浮层 teleport 到 body，仍在 html 之下。
// 不能进 @scope 的顶层 at-rule 提升到外面：@charset / @import（必须顶层）、@theme（Tailwind 构建期，只映射工具类名到变量，本身无视觉）、
// @layer 语句形式（`@layer a, b;`）、@keyframes / @font-face（全局命名，无视觉副作用）。其余（含 @media / @supports / @layer 块）整体包裹。

/** 把 CSS 切成顶层语句（考虑字符串与注释），返回 [{ text, name }]，name 是 at-rule 名或 null。 */
export function splitTopLevel(css) {
  const out = [];
  let i = 0, start = 0, depth = 0, quote = null;
  const n = css.length;
  const push = (end) => { const text = css.slice(start, end); if (text.trim()) out.push({ text, name: (text.trim().match(/^@([\w-]+)/) || [])[1] || null }); start = end; };
  while (i < n) {
    const c = css[i], next = css[i + 1];
    if (quote) { if (c === '\\') { i += 2; continue; } if (c === quote) quote = null; i++; continue; }
    if (c === '/' && next === '*') { const j = css.indexOf('*/', i + 2); i = j === -1 ? n : j + 2; continue; }
    if (c === '"' || c === "'") { quote = c; i++; continue; }
    if (c === '{') { depth++; i++; continue; }
    if (c === '}') { depth--; i++; if (depth === 0) push(i); continue; }
    if (c === ';' && depth === 0) { i++; push(i); continue; }
    i++;
  }
  push(n);
  return out;
}

const HOIST = new Set(['charset', 'import', 'theme', 'keyframes', 'font-face', 'property']);

/**
 * @scope 内的选择器语义（Chrome 153 实测）：后代与 body 正常命中，但 `:root` / `html` 不命中范围根本身，只有 `:scope` 命中。
 * token 都挂在 :root、暗色是 :root.dark、基线 reset 用 html——全部改写成 :scope，让它们落在 <html class="<root>"> 上。
 */
export function rewriteRootSelectors(css) {
  return css
    .replace(/:root\b/g, ':scope')
    .replace(/(^|[\s,}{;])html(?=[\s.:,[>{])/g, '$1:scope');
}

/** 返回 { text, hoisted: string[] }：hoisted 是被提到顶层的 at-rule 名（给报告用）。 */
export function scopeWrap(css, root) {
  const parts = splitTopLevel(css);
  const top = [], inner = [], hoisted = new Set();
  for (const p of parts) {
    const isLayerStatement = p.name === 'layer' && !p.text.includes('{');
    if ((p.name && HOIST.has(p.name)) || isLayerStatement) { top.push(p.text.trim()); hoisted.add(p.name); }
    else inner.push(rewriteRootSelectors(p.text.trim()));
  }
  const body = inner.join('\n').split('\n').map((l) => (l ? '  ' + l : l)).join('\n');
  return { text: `${top.length ? top.join('\n') + '\n\n' : ''}@scope (html.${root}) {\n${body}\n}\n`, hoisted: [...hoisted] };
}

/** 路由守卫片段：按栈打印。 */
export function guardSnippet(root, stack) {
  if (stack === 'shadcn') return `// React（hash 路由示例）：进入覆盖板块加类，离开移除；浮层 teleport 到 body 仍在 html 之下
const COVERED = [/^\\/$/, /^\\/orders/];   // 覆盖板块的路由前缀，按项目填
function applyScope() { const path = location.hash.replace(/^#/, '') || '/'; document.documentElement.classList.toggle('${root}', COVERED.some((re) => re.test(path))); }
applyScope(); window.addEventListener('hashchange', applyScope);`;
  return `// Vue Router：未接入的板块在路由 meta 上标 legacy: true；beforeEach 在渲染前切类（首屏 index.html 默认带 class="${root}"，legacy 路由进入时移除）
router.beforeEach((to) => { document.documentElement.classList.toggle('${root}', !to.meta.legacy) })`;
}
