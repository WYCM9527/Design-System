// 品牌色审计的口径（页面扫描「允许清单之外的品牌色」与组件走查「状态切换新引入的品牌色」共用）：
//   hue / saturation / lightness —— 判色范围（HSL；色相单位度，饱和度与明度 0–1，都写 [最小, 最大]）
//   allow —— 静息态允许出现品牌色的位置（CSS 选择器，元素在其内即放行）；可写成数组，或按技术栈分组的对象 { "element-plus": [...], "recipes": [...] }
//   focusRing —— 焦点指示本身就是品牌色时为 true：组件走查不把聚焦时出现的外环 / 环形阴影 / 聚焦边线算作新引入的品牌色
//   hoverAllow —— 悬停时允许新出现品牌色的元素（CSS 选择器，元素自身或祖先匹配即放行），如静息是正文色、悬停显出链接色的链接
//   name / note —— 报告里的称呼与允许位置的一句话概括
// 取值顺序：项目 accept.config.mjs 的 BRAND（逐字段覆盖；false 关闭审计）→ 项目所用设计系统身份文件 design-system.json 的 accept.brand
// → Citrine 项目（或读不到 design-system/.adopter.json 的老项目）用内置的品牌黄与 lib/yellow-allow.mjs；
// 别的设计系统没登记 accept.brand 时不审计（Citrine 的黄与选择器不适用）。项目追加的合法位置写在 BRAND_ALLOW（旧名 YELLOW_ALLOW 照认）。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { YELLOW_ALLOW } from './yellow-allow.mjs';

export const CITRINE_BRAND = {
  name: '品牌黄', hue: [40, 64], saturation: [0.55, 1], lightness: [0.28, 0.78], focusRing: false,
  allow: YELLOW_ALLOW, note: '主按钮 / 勾选开关选中 / 进度滑杆 / 当前页 / 数据卡描边 / Logo',
};

const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };

/** 项目所用设计系统 { id, brand }：brand 是快照里身份文件的 accept.brand（可能没有）；项目没有 design-system/.adopter.json 时为 null。 */
function systemOf(appDir) {
  const manifest = readJson(join(appDir, 'design-system/.adopter.json'));
  if (!manifest) return null;
  const identity = manifest.snapshot ? readJson(join(appDir, manifest.snapshot, 'design-system.json')) : null;
  return { id: manifest.system || identity?.id || null, brand: identity?.accept?.brand || null };
}

const selectors = (list) => (Array.isArray(list) ? list : list && typeof list === 'object' ? Object.values(list).flat() : []);

const range = (v, key) => {
  if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isFinite) || v[0] > v[1]) throw new Error(`品牌色口径的 ${key} 要写成 [最小, 最大]，现在是 ${JSON.stringify(v)}`);
  return v;
};

/** 实际生效的品牌色口径；null 表示不审计。 */
export function brandFor(cfg, appDir) {
  if (cfg?.BRAND === false || cfg?.BRAND === null) return null;
  const sys = systemOf(appDir);
  let base = sys?.brand || (!sys?.id || sys.id === 'citrine' ? CITRINE_BRAND : null);
  if (cfg?.BRAND) base = { ...base, ...cfg.BRAND };
  if (!base) return null;
  return {
    name: base.name || '品牌色',
    hue: range(base.hue, 'hue'), saturation: range(base.saturation, 'saturation'), lightness: range(base.lightness, 'lightness'),
    focusRing: base.focusRing === true,
    hoverAllow: selectors(base.hoverAllow),
    allow: [...selectors(base.allow), ...selectors(cfg?.BRAND_ALLOW), ...selectors(cfg?.YELLOW_ALLOW)],
    note: base.note || '',
  };
}

/** 一行说明当前口径（写在扫描输出开头，方便核对查的是哪种颜色）。 */
export function describeBrand(brand) {
  if (!brand) return '品牌色审计：未配置，跳过（设计系统身份文件没有 accept.brand；项目可在 accept.config.mjs 写 BRAND）';
  const r = ([a, b]) => `${a}–${b}`;
  return `品牌色审计：${brand.name}（色相 ${r(brand.hue)}° · 饱和度 ${r(brand.saturation)} · 明度 ${r(brand.lightness)}）· 允许清单 ${brand.allow.length} 条${brand.hoverAllow.length ? ` · 悬停放行 ${brand.hoverAllow.length} 条` : ''}${brand.focusRing ? ' · 焦点指示是品牌色' : ''}`;
}

/** 注入页面的判色范围：探针读 window.__ksBrand；null 表示不判。 */
export const brandJs = (brand) => `window.__ksBrand = ${JSON.stringify(brand && { hue: brand.hue, saturation: brand.saturation, lightness: brand.lightness })};`;
