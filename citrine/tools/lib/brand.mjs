// 品牌色审计的口径（页面扫描「允许清单之外的品牌色」与组件走查「状态切换新引入的品牌色」共用）：
//   hue / saturation / lightness —— 判色范围（HSL；色相单位度，饱和度与明度 0–1，都写 [最小, 最大]）
//   allow —— 静息态允许出现品牌色的位置（CSS 选择器，元素在其内即放行）；可写成数组，或按技术栈分组的对象 { "element-plus": [...], "recipes": [...] }
//   focusRing —— 焦点指示本身就是品牌色时为 true：组件走查不把聚焦时出现的外环 / 环形阴影 / 聚焦边线算作新引入的品牌色
//   hoverAllow —— 悬停时允许新出现品牌色的元素（CSS 选择器，元素自身或祖先匹配即放行），如静息是正文色、悬停显出链接色的链接
//   name / note —— 报告里的称呼与允许位置的一句话概括
// 取值顺序（前面的逐字段覆盖后面的）：项目 accept.config.mjs 的 BRAND（false 关闭审计）→ 项目当前颜色的调色盘 palettes/<id>.json 的 accept.brand
// （只换判色范围与称呼）→ 项目所用设计系统身份文件 design-system.json 的 accept.brand → Citrine 项目（或读不到清单的老项目）用内置的品牌黄与 lib/yellow-allow.mjs；
// 别的设计系统没登记 accept.brand 时不审计（Citrine 的黄与选择器不适用）。项目追加的合法位置写在 BRAND_ALLOW（旧名 YELLOW_ALLOW 照认）。
// 色相范围可以跨 0°：[最小, 最大] 里最小大于最大表示绕一圈（如红色 [351, 4] = 351–360° 与 0–4°）。
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { YELLOW_ALLOW } from './yellow-allow.mjs';
import { systemOf } from './system.mjs';

export const CITRINE_BRAND = {
  name: '品牌黄', hue: [40, 64], saturation: [0.55, 1], lightness: [0.28, 0.78], focusRing: false,
  allow: YELLOW_ALLOW, note: '主按钮 / 勾选开关选中 / 进度滑杆 / 当前页 / 数据卡描边 / Logo',
};

const selectors = (list) => (Array.isArray(list) ? list : list && typeof list === 'object' ? Object.values(list).flat() : []);

const range = (v, key, { wrap = false, max = 1 } = {}) => {
  const ok = Array.isArray(v) && v.length === 2 && v.every((x) => Number.isFinite(x) && x >= 0 && x <= max) && (wrap || v[0] <= v[1]);
  if (!ok) throw new Error(`品牌色口径的 ${key} 要写成 [最小, 最大]（0–${max}${wrap ? '，最小大于最大表示跨 0°' : ''}），现在是 ${JSON.stringify(v)}`);
  return v;
};

/** 实际生效的品牌色口径；null 表示不审计。tokensDir：非 Node 项目 export 出来的 CSS 目录（读里面的 design-system.export.json）。 */
export function brandFor(cfg, appDir, tokensDir) {
  if (cfg?.BRAND === false || cfg?.BRAND === null) return null;
  const sys = systemOf(appDir, tokensDir);
  let base = sys?.brand || (!sys?.id || sys.id === 'citrine' ? CITRINE_BRAND : null);
  if (base && sys?.palette?.brand) base = { ...base, ...sys.palette.brand };
  if (cfg?.BRAND) base = { ...base, ...cfg.BRAND };
  if (!base) return null;
  return {
    name: base.name || '品牌色',
    palette: sys?.palette ? `「${sys.palette.name}」${sys.palette.found ? '' : '（快照里找不到这个调色盘，判色范围按默认颜色）'}` : null,
    hue: range(base.hue, 'hue', { wrap: true, max: 360 }), saturation: range(base.saturation, 'saturation'), lightness: range(base.lightness, 'lightness'),
    focusRing: base.focusRing === true,
    hoverAllow: selectors(base.hoverAllow),
    allow: [...selectors(base.allow), ...selectors(cfg?.BRAND_ALLOW), ...selectors(cfg?.YELLOW_ALLOW)],
    notBrand: notBrandColors(base.notBrand, tokensDir),
    note: base.note || '',
  };
}

const cssFiles = (dir) => (dir && existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? cssFiles(join(dir, e.name)) : e.name.endsWith('.css') ? [join(dir, e.name)] : [])) : []);

/**
 * 不算品牌色的颜色：accept.brand.notBrand 登记的 token（路径前缀，如 color.status）在 token 产物里的色值，亮暗各取一遍，[r, g, b] 列表。
 * 换了颜色以后，状态色、涨跌色可能和品牌色同色相（蓝 × 信息蓝、绿 × 成功绿），它们出现在状态胶囊、提示条里不算品牌色泄漏。
 */
export function notBrandColors(prefixes, tokensDir) {
  const wanted = (Array.isArray(prefixes) ? prefixes : []).map((p) => `--${String(p).replace(/\.$/, '').replace(/\./g, '-')}`);
  if (!wanted.length) return [];
  const base = new Map(); const layers = [];
  for (const f of cssFiles(tokensDir)) {
    for (const [, selector, body] of readFileSync(f, 'utf8').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const decls = new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
      if (selector.trim() === ':root') for (const [k, v] of decls) base.set(k, v); else layers.push(decls);
    }
  }
  const resolve = (name, layer, depth = 0) => { const v = layer?.get(name) ?? base.get(name); const ref = v && /^var\((--[\w-]+)\)$/.exec(v); return !v || depth > 20 ? null : ref ? resolve(ref[1], layer, depth + 1) : v; };
  const out = new Map();
  for (const layer of [null, ...layers]) {
    for (const name of new Set([...base.keys(), ...(layer?.keys() || [])])) {
      if (!wanted.some((p) => name === p || name.startsWith(`${p}-`))) continue;
      const hex = /^#([0-9a-f]{6})(ff)?$/i.exec(resolve(name, layer) || '');   // 只取不透明的（半透明的中性色本来就不会被判成品牌色）
      if (hex) out.set(hex[1].toLowerCase(), [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)));
    }
  }
  return [...out.values()];
}

/** 一行说明当前口径（写在扫描输出开头，方便核对查的是哪种颜色）。 */
export function describeBrand(brand) {
  if (!brand) return '品牌色审计：未配置，跳过（设计系统身份文件没有 accept.brand；项目可在 accept.config.mjs 写 BRAND）';
  const r = ([a, b]) => `${a}–${b}`;
  return `品牌色审计：${brand.name}（色相 ${r(brand.hue)}° · 饱和度 ${r(brand.saturation)} · 明度 ${r(brand.lightness)}）${brand.palette ? ` · 颜色${brand.palette}` : ''} · 允许清单 ${brand.allow.length} 条${brand.hoverAllow.length ? ` · 悬停放行 ${brand.hoverAllow.length} 条` : ''}${brand.focusRing ? ' · 焦点指示是品牌色' : ''}`;
}

/** 注入页面的判色范围：探针读 window.__ksBrand；null 表示不判。 */
export const brandJs = (brand) => `window.__ksBrand = ${JSON.stringify(brand && { hue: brand.hue, saturation: brand.saturation, lightness: brand.lightness, notBrand: brand.notBrand })};`;
