// 页面审计（在页面里执行）：小字号、无名称控件、横向溢出、nowrap 截断、低对比度、小命中区、重复 id、无 alt 图片。
// 阈值与例外与 DESIGN.md「验收基线」一致：正文 ≥ 4.5:1，大字 ≥ 3:1；已批准的品牌例外单列为 approvedExceptions 而不算失败。
// 由 scan-pages.mjs 以字符串注入（Runtime.evaluate），不要在这里用 import。
(() => {
  const out = { url: location.hash, small: [], noName: [], overflowX: [], truncated: [], lowContrast: [], tinyTargets: [], dupIds: [], imgNoAlt: 0 };
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
  const __cv = document.createElement('canvas'); __cv.width = __cv.height = 1; const __cx = __cv.getContext('2d', { willReadFrequently: true }); const parseAny = (s) => { if (!s || s === 'transparent' || s === 'none') return null; __cx.clearRect(0, 0, 1, 1); __cx.fillStyle = '#000'; __cx.fillStyle = s; if (__cx.fillStyle === '#000000' && !/black|#000|rgb\(0, 0, 0\)/.test(s)) { /* 未识别的字符串会保持上一个值 */ } __cx.fillRect(0, 0, 1, 1); const d = __cx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: Math.round((d[3] / 255) * 1000) / 1000 }; };
  const parse = (c) => { const m = (c || '').match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; } return /^(oklab|oklch|lab|lch|color|hsl|hwb)\(/.test(String(c || '').trim()) ? parseAny(c) : null; };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => { let bg = { r: 255, g: 255, b: 255, a: 1 }; const chain = []; let n = el; const seg = el.closest('.el-segmented__item.is-selected'); if (seg) { const slider = seg.closest('.el-segmented')?.querySelector('.el-segmented__item-selected'); const c = slider && parse(getComputedStyle(slider).backgroundColor); if (c && c.a > 0) chain.push(c); } /* 分段选择器的选中底是绝对定位的滑块，不在祖先链里 */ while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) chain.push(c); n = n.parentElement; } const root = parse(getComputedStyle(document.body).backgroundColor); if (root && root.a > 0) chain.push(root); for (let i = chain.length - 1; i >= 0; i--) bg = blend(chain[i], bg); return bg; };
  const desc = (el) => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '')).slice(0, 70);
  const ids = {}; document.querySelectorAll('[id]').forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; }); out.dupIds = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
  out.imgNoAlt = [...document.querySelectorAll('img:not([alt])')].length;
  const seenSmall = new Map(), seenLow = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim(); if (!t) continue; const el = node.parentElement; if (!el || !vis(el)) continue;
    const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize);
    if (fs < 12) { const k = desc(el) + '|' + fs; if (!seenSmall.has(k)) seenSmall.set(k, { el: desc(el), fs, text: t.slice(0, 20) }); }
    const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const f = fg.a < 1 ? blend(fg, bg) : fg;
    const cr = (Math.max(lum(f), lum(bg)) + 0.05) / (Math.min(lum(f), lum(bg)) + 0.05);
    const bold = parseInt(cs.fontWeight) >= 700; const large = fs >= 24 || (fs >= 18.66 && bold); const need = large ? 3 : 4.5;
    if (cr < need) { const k = desc(el) + '|' + cs.color + '|' + Math.round(cr * 10); if (!seenLow.has(k)) seenLow.set(k, { el: desc(el), text: t.slice(0, 18), fs, cr: +cr.toFixed(2), fg: cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, disabled: !!el.closest('[disabled],.is-disabled,[aria-disabled="true"]') }); }
  }
  // 已批准的品牌例外（DESIGN「验收基线」）：success / warning / error 文字色，危险按钮白字；占位符（亮 neutral.400 / 暗 neutral.500）
  const APPROVED_FG = new Set(['rgb(11, 158, 116)', 'rgb(215, 103, 18)', 'rgb(238, 72, 75)', 'rgb(156, 163, 175)', 'rgb(102, 109, 123)']);
  const isApproved = (x) => APPROVED_FG.has(x.fg) || (x.fg === 'rgb(255, 255, 255)' && x.bg === 'rgb(238,72,75)');
  const low = [...seenLow.values()].filter((x) => !x.disabled);
  out.small = [...seenSmall.values()]; out.lowContrast = low.filter((x) => !isApproved(x)); out.approvedExceptions = low.filter(isApproved).length;
  document.querySelectorAll('button, a, [role="button"], [role="menuitem"], [role="tab"], input, select, textarea').forEach((el) => {
    if (!vis(el)) return; const r = el.getBoundingClientRect();
    const name = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent.trim() || (el.labels && el.labels.length ? el.labels[0].textContent : '') || el.getAttribute('placeholder') || el.getAttribute('aria-labelledby') || '').trim();
    if (!name && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button')) out.noName.push({ el: desc(el), w: Math.round(r.width), h: Math.round(r.height), html: el.outerHTML.slice(0, 90) });
    if ((el.tagName === 'BUTTON' || el.tagName === 'A') && (r.width < 24 || r.height < 24) && r.width > 0) out.tinyTargets.push({ el: desc(el), w: Math.round(r.width), h: Math.round(r.height), text: el.textContent.trim().slice(0, 12) });
  });
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.overflowX.push({ el: 'document', sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth });
  document.querySelectorAll('main *').forEach((el) => {
    if (!vis(el)) return; const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && cs.whiteSpace === 'nowrap' && el.children.length === 0 && el.textContent.trim()) out.truncated.push({ el: desc(el), text: el.textContent.trim().slice(0, 30), sw: el.scrollWidth, cw: el.clientWidth });
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && el.clientWidth > 0 && el.tagName !== 'TABLE') { const r = el.getBoundingClientRect(); if (r.right > document.documentElement.clientWidth + 1) out.overflowX.push({ el: desc(el), sw: el.scrollWidth, cw: el.clientWidth }); }
  });
  out.overflowX = out.overflowX.slice(0, 8); out.truncated = out.truncated.slice(0, 12); out.tinyTargets = out.tinyTargets.slice(0, 12); out.lowContrast = out.lowContrast.slice(0, 20); out.small = out.small.slice(0, 12);
  return out;
})()
