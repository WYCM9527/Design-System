// 组件走查探针（在页面里执行，由 scan-components.mjs 以字符串注入）：
// __ks.snapshot(root) 列出可见的黄色属性；__ks.probe(el) 返回元素及其后代的黄色属性与文字对比；__ks.foreign(root) 找不来自 token 的颜色。
// 判黄：色相 40–64°、饱和度 ≥ 0.55、明度 0.28–0.78（品牌黄 50°；暗色 warning 的橙 37° 不算）。token 颜色集合由外部注入到 window.__ksTokens。
window.__ks = (() => {
  const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const colorsIn = (s) => (s || '').match(/rgba?\([^)]+\)/g) || [];
  const hsl = (c) => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2; if (max === min) return { h: 0, s: 0, l }; const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min); let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; return { h: h * 60, s, l }; };
  const isYellow = (c) => { if (!c || c.a < 0.15) return false; const { h, s, l } = hsl(c); return h >= 40 && h <= 64 && s >= 0.55 && l >= 0.28 && l <= 0.78; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const visible = (el) => { if (el.closest('[data-ks-ignore]')) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const sig = (el) => { const cls = [...el.classList].filter((c) => !/^(is-|el-)?(hover|focus|active|focusing)$/.test(c)).slice(0, 4).join('.'); return el.tagName.toLowerCase() + (cls ? '.' + cls : ''); };
  const section = (el) => { const s = el.closest('[data-ks]'); if (s) return s.getAttribute('data-ks'); if (el.closest('.el-overlay, .el-dialog, .el-drawer, .el-message-box')) return 'modal'; if (el.closest('.el-message')) return 'message'; if (el.closest('.el-notification')) return 'notification'; if (el.closest('.el-popper')) return 'popper:' + (el.closest('.el-popper').className.split(' ').find((c) => /__popper|dropdown|picker/.test(c)) || 'popper'); return el.closest('.sidebar, aside') ? 'sidebar' : el.closest('header, .topbar') ? 'topbar' : 'page'; };
  const path = (el) => { const parts = []; let e = el; for (let i = 0; e && i < 3 && e !== document.body; i++, e = e.parentElement) parts.unshift(sig(e)); return parts.join(' > '); };
  const bgOf = (el) => { let e = el; let acc = null; while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { acc = acc ? blend(acc, c) : c; if (acc.a >= 0.99) return acc; } e = e.parentElement; } const body = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }; return acc ? blend(acc, body) : body; };
  const yellowProps = (el, out) => { const cs = getComputedStyle(el); const push = (prop, val) => out.push({ path: path(el), prop, value: val, section: section(el) });
    if (hasText(el) && isYellow(parse(cs.color))) push('color', cs.color);
    if (isYellow(parse(cs.backgroundColor))) push('background-color', cs.backgroundColor);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) { if (parseFloat(cs['border' + side + 'Width']) > 0 && cs['border' + side + 'Style'] !== 'none' && isYellow(parse(cs['border' + side + 'Color']))) { push('border-color', cs['border' + side + 'Color']); break; } }
    if (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none' && isYellow(parse(cs.outlineColor))) push('outline-color', cs.outlineColor);
    if (cs.textDecorationLine !== 'none' && hasText(el) && isYellow(parse(cs.textDecorationColor))) push('text-decoration-color', cs.textDecorationColor);
    for (const c of colorsIn(cs.boxShadow)) if (isYellow(parse(c))) { push('box-shadow', c); break; }
    for (const c of colorsIn(cs.backgroundImage)) if (isYellow(parse(c))) { push('background-image', c); break; }
    if (el instanceof SVGElement) { if (isYellow(parse(cs.fill))) push('fill', cs.fill); if (parseFloat(cs.strokeWidth) > 0 && isYellow(parse(cs.stroke))) push('stroke', cs.stroke); } };
  const snapshot = (root) => { const out = []; const walk = (el) => { if (!(el instanceof Element) || !visible(el)) return; yellowProps(el, out); for (const c of el.children) walk(c); }; walk(root); return out; };
  const textInfo = (el) => { const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg || !hasText(el)) return null; const bg = bgOf(el); const f = fg.a < 1 ? blend(fg, bg) : fg; return { fg: cs.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')', ratio: +contrast(f, bg).toFixed(2), size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) }; };
  const probe = (el) => { const yellow = snapshot(el); const texts = []; const walk = (e, d) => { if (!(e instanceof Element) || d > 4 || !visible(e)) return; const t = textInfo(e); if (t) texts.push({ path: path(e), ...t }); for (const c of e.children) walk(c, d + 1); }; walk(el, 0); return { yellow, texts, section: section(el), sig: path(el) }; };
  const TOKENS = new Set(window.__ksTokens || []);
  const norm = (c) => c ? (Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b)) : null;
  const foreign = (root) => { const out = []; const seen = new Set(); const check = (el, prop, val, cond = true) => { const c = parse(val); if (!c || c.a < 0.05 || !cond) return; const k = norm(c); if (TOKENS.has(k) || k === '255,255,255' || k === '0,0,0') return; const key = section(el) + '|' + path(el) + '|' + prop; if (seen.has(key)) return; seen.add(key); out.push({ section: section(el), path: path(el), prop, value: 'rgb(' + k + ')' + (c.a < 1 ? ' @' + c.a.toFixed(2) : '') }); };
    const walk = (el) => { if (!(el instanceof Element) || !visible(el)) return; const cs = getComputedStyle(el);
      check(el, 'color', cs.color, hasText(el)); check(el, 'background-color', cs.backgroundColor);
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) check(el, 'border-color', cs['border' + side + 'Color'], parseFloat(cs['border' + side + 'Width']) > 0 && cs['border' + side + 'Style'] !== 'none');
      check(el, 'outline-color', cs.outlineColor, parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none');
      for (const c of colorsIn(cs.boxShadow)) check(el, 'box-shadow', c); for (const c of colorsIn(cs.backgroundImage)) check(el, 'background-image', c);
      if (el instanceof SVGElement) { check(el, 'fill', cs.fill, cs.fill !== 'none'); check(el, 'stroke', cs.stroke, parseFloat(cs.strokeWidth) > 0); }
      for (const c of el.children) walk(c); }; walk(root); return out; };
  return { snapshot, probe, visible, sig, section, path, foreign };
})();
