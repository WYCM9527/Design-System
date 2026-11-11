// 调色盘体检口径：导入脚本按它决定改指向、算图表浅品牌色、修色相，体检脚本按它判定通过。
// 只看跟品牌色有关的配对（通用配对由 check-contrast.mjs 查）；和默认颜色同样不达标、颜色也一样的算「继承」，不归调色盘管。
import { applyToTrees, cloneDefaults, getNode, resolveColor } from '../../design-system-adopter/scripts/lib/palette.mjs';
import { composite, contrast, deltaE, fitGamut, oklchToRgb, parseHex, rgbToOklch, round, toHex } from './color.mjs';

/** 角色在某个模式下的颜色；写成「上层@下层」表示半透明的上层叠在下层上（如卡片上的悬停行 color.bg.hover@color.bg.surface），最底下垫页面底。 */
export function colorOf(trees, path, mode) {
  const [top, under] = path.split('@');
  const hex = resolveColor(trees, top, mode);
  if (!hex) return null;
  if (!under) return parseHex(hex);
  const base = colorOf(trees, under, mode);
  return base ? composite(parseHex(hex), composite(base, parseHex(resolveColor(trees, 'color.bg.page', mode)))) : null;
}
const hexOf = (trees, path, mode) => (path.includes('@') ? toHex(colorOf(trees, path, mode)) : resolveColor(trees, path, mode));

/** [前景, 底色, 底线, 说明]，亮暗两种模式都查。 */
export const BRAND_PAIRS = [
  ['color.text.on-primary', 'color.action.primary', 4.5, '主按钮文字 / 填充'],
  ['color.text.on-primary', 'color.action.primary-hover', 4.5, '主按钮文字 / 悬停'],
  ['color.text.on-primary', 'color.action.primary-active', 4.5, '主按钮文字 / 按下'],
  ['color.text.on-brand', 'color.bg.brand', 4.5, '品牌底上的字'],
  ['color.text.sidebar-selected', 'color.bg.sidebar-selected', 4.5, '侧栏当前项文字 / 底'],
  ['color.text.link', 'color.bg.surface', 4.5, '链接 / 卡片'],
  ['color.text.link', 'color.bg.page', 4.5, '链接 / 页面底'],
  ['color.text.link', 'color.bg.elevated', 4.5, '链接 / 浮层（弹窗、抽屉、下拉）'],
  ['color.text.link', 'color.bg.hover@color.bg.surface', 4.5, '链接 / 卡片上的悬停行'],
  ['color.text.link-hover', 'color.bg.surface', 4.5, '链接悬停 / 卡片'],
  ['color.text.selected', 'color.bg.surface', 4.5, '选中文字 / 卡片'],
  ['color.text.selected', 'color.bg.elevated', 4.5, '选中文字 / 浮层（下拉当前项）'],
  ['color.text.selected', 'color.bg.selected-subtle', 4.5, '选中文字 / 选中浅底'],
  ['color.text.selected', 'color.bg.chip', 4.5, '筹码文字 / 筹码底'],
  ['color.text.brand', 'color.bg.surface', 3, '品牌大字 / 卡片'],
  ['color.icon.brand', 'color.bg.surface', 3, '品牌图标 / 卡片'],
  ['color.border.current', 'color.bg.surface', 3, '当前项边线 / 卡片'],
  ['color.border.focus', 'color.bg.surface', 3, '焦点边线 / 卡片'],
  ['color.focus.ring', 'color.bg.surface', 3, '焦点环 / 卡片'],
  ['color.brand.indicator', 'color.bg.surface', 3, '品牌指示条 / 卡片（图形 3:1）'],
  ['color.action.primary', 'color.bg.surface', 3, '主按钮填充 / 卡片（UI 组件 3:1）']
];

/** 撞色：主色和这些颜色太近，用户分不清「这是品牌」还是「这是状态 / 另一组数据」。 */
export const COLLISION_ROLES = [
  ['color.status.error', '错误红', 'severe'],
  ['color.action.danger', '危险按钮', 'severe'],
  ['color.status.warning', '警示橙', 'warn'],
  ['color.status.success', '成功绿', 'warn'],
  ['color.status.info', '信息蓝', 'warn'],
  ['color.data.increase', '上涨', 'warn'],
  ['color.data.decrease', '下跌', 'warn'],
  ['color.chart.6', '图表第 6 色', 'warn']
];
/** ΔE_OK 低于这个算撞色（0.02 是肉眼刚能分辨；状态色之间通常 > 0.15）。 */
export const COLLISION_DELTA = 0.1;

/**
 * 协调：一起出现的两个品牌色要是同一个色相——像默认颜色那样，色阶深浅两头色相不变。
 * Tailwind 的黄、琥珀、橙色阶两头色相不一样（黄的深档偏红棕、琥珀的浅档偏黄），黄底配红棕字、深红底配黄字就显得突兀。
 * 查品牌配对的字和底，再加双色图标的两色、图表品牌色和浅品牌色、渐变两端。
 */
export const HARMONY_PAIRS = [
  ...BRAND_PAIRS.map(([fg, bg, , label]) => [fg, bg, label]),
  ['color.icon.brand', 'color.icon.two-tone', '双色图标两色'],
  ['color.chart.1', 'color.chart.3', '图表品牌色 / 浅品牌色'],
  ['color.chart.gradient.start', 'color.chart.gradient.end', '渐变两端']
];
/** 色相差上限（度）。默认颜色在 1° 以内，官方颜色最大 17°。 */
export const HARMONY_HUE = 20;
/** 两色鲜艳度（OKLCH C）都超过这个才比色相：很淡的浅底、近乎中性的深色看不出色相。 */
export const HARMONY_CHROMA = 0.05;

/** 图表浅品牌色（color.chart.3）和图表品牌色（color.chart.1）：前者按后者算，两者的关系照默认颜色。 */
export const TINT_ROLE = 'color.chart.3';
export const TINT_BASE = 'color.chart.1';
/** 体检的范围：明度差（绝对值）在这个区间里、鲜艳度不超过品牌色的这个倍数。玫瑰金是 0.126、0.84 倍；荧光绿、淡蓝那种明度差在 0.3 以上，或者比品牌色还鲜艳。 */
export const TINT_LIGHTNESS = [0.08, 0.18];
export const TINT_CHROMA = 1;
/** 品牌色本身浅到再加一档就超过这个明度时（贴近白底，看不出是哪种颜色），浅品牌色改成往深取同样的差。 */
export const TINT_MAX_LIGHTNESS = 0.88;
/** 图表浅品牌色和这些图表色 ΔE_OK 低于 CHART_NEAR_DELTA 只提示（环形图里挨着放会分不太清）；玫瑰金自己和暗色深灰是 0.089。 */
export const CHART_SIBLINGS = [
  ['color.chart.2', '图表深灰（第 2 色）'],
  ['color.chart.4', '图表中灰（第 4 色）'],
  ['color.chart.5', '图表浅灰（第 5 色）'],
  ['color.chart.6', '图表绿（第 6 色）']
];
export const CHART_NEAR_DELTA = 0.06;

export const MODES = ['light', 'dark'];

/** 两个色相差几度（0–180）。 */
export const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const pointsTo = (ctx, role) => getNode(ctx.defaults.semantic, role).get('$value').slice(1, -1);
/** 图表浅品牌色落在品牌色原语的哪一档（种子里是 color.brand.200，只有 color.chart.3 用这一档）。 */
export const tintSlot = (ctx) => pointsTo(ctx, TINT_ROLE);

/** 默认颜色里图表浅品牌色和品牌色的关系：明度差、鲜艳度比例（玫瑰金 #B98D44 → #DDB67B 是 +0.126、0.84 倍）。 */
export function tintRelation(ctx) {
  const trees = applyToTrees(ctx, cloneDefaults(ctx), null);
  const [base, tint] = [TINT_BASE, TINT_ROLE].map((role) => rgbToOklch(parseHex(resolveColor(trees, role))));
  return { lightness: tint[0] - base[0], chroma: tint[1] / base[1] };
}

/**
 * 按一套色阶算图表浅品牌色（导入脚本拿它生成 tintSlot 那一档）：明度 = 品牌色 + 关系里的明度差（超过 TINT_MAX_LIGHTNESS 就改成往深取），
 * 色相、鲜艳度在这套色阶的其他档之间按明度插值，鲜艳度不超过 品牌色 × 关系里的比例，最后收进 sRGB 色域。
 * primitives：{ 'color.brand.500': '#…', … }，tintSlot 那一档可以缺。默认颜色按这条算出来是 #DBB77A，和它自己的 #DDB67B 差 ΔE 0.004，肉眼看不出。
 */
export function chartTint(ctx, primitives, relation = tintRelation(ctx)) {
  const tint = tintSlot(ctx);
  const lch = (key) => rgbToOklch(parseHex(primitives[key].slice(0, 7)));
  const [L, C] = lch(pointsTo(ctx, TINT_BASE));
  const target = L + relation.lightness <= TINT_MAX_LIGHTNESS ? L + relation.lightness : L - relation.lightness;
  const opaque = (key) => getNode(ctx.defaults.primitives, key).get('$value').get('alpha') === 1;
  const steps = ctx.brand.filter((key) => key !== tint && opaque(key)).map(lch).sort((a, b) => a[0] - b[0]);
  const above = steps.findIndex((s) => s[0] >= target);
  const i = Math.max(above === -1 ? steps.length - 1 : above, 1);
  const [lo, hi] = [steps[i - 1], steps[i]];
  const t = Math.min(1, Math.max(0, (target - lo[0]) / (hi[0] - lo[0] || 1)));
  const dh = ((hi[2] - lo[2] + 540) % 360) - 180;
  const chroma = Math.min(lo[1] + (hi[1] - lo[1]) * t, C * relation.chroma);
  return toHex(oklchToRgb(fitGamut([target, chroma, (lo[2] + dh * t + 360) % 360])));
}

/** 协调不过的：色相差超限的配对、和品牌色关系不对的图表浅品牌色。 */
export const harmonyFailures = (harmony) => [...harmony.pairs.filter((r) => !r.pass), ...harmony.tint.filter((r) => !r.pass)];

/** 在内存里套上调色盘，算全部品牌配对、撞色与协调（harmony：pairs 色相差 / tint 图表浅品牌色和品牌色的关系 / near 图表浅品牌色太近的图表色）。 */
export function evaluatePalette(ctx, palette) {
  const trees = applyToTrees(ctx, cloneDefaults(ctx), palette);
  const color = (path, mode) => colorOf(trees, path, mode);
  const rows = [];
  for (const mode of MODES) {
    if (mode === 'dark' && !trees.dark) continue;
    const page = color('color.bg.page', mode);
    for (const [fg, bg, min, label] of BRAND_PAIRS) {
      const f = color(fg, mode);
      const b = color(bg, mode);
      if (!f || !b) continue;
      const ratio = round(contrast(f, b, page));
      rows.push({ mode, fg, bg, min, label, fgHex: resolveColor(trees, fg, mode), bgHex: hexOf(trees, bg, mode), ratio, pass: ratio >= min });
    }
  }
  const collisions = [];
  for (const mode of MODES) {
    if (mode === 'dark' && !trees.dark) continue;
    const brand = color('color.action.primary', mode);
    for (const [role, label, severity] of COLLISION_ROLES) {
      const c = color(role, mode);
      if (!c) continue;
      const d = round(deltaE(brand, c), 3);
      if (d < COLLISION_DELTA) collisions.push({ mode, role, label, severity, delta: d, brandHex: resolveColor(trees, 'color.action.primary', mode), hex: resolveColor(trees, role, mode) });
    }
  }
  const harmony = { pairs: [], tint: [], near: [] };
  for (const mode of MODES) {
    if (mode === 'dark' && !trees.dark) continue;
    const page = color('color.bg.page', mode);
    const solid = (path) => {
      const c = color(path, mode);
      return c && (c.a < 1 ? composite(c, page) : c);
    };
    for (const [fg, bg, label] of HARMONY_PAIRS) {
      const f = solid(fg);
      const b = solid(bg);
      if (!f || !b) continue;
      const [x, y] = [rgbToOklch(f), rgbToOklch(b)];
      if (x[1] <= HARMONY_CHROMA || y[1] <= HARMONY_CHROMA) continue;
      const hue = round(hueGap(x[2], y[2]), 1);
      harmony.pairs.push({ mode, fg, bg, label, fgHex: toHex(f), bgHex: toHex(b), hue, pass: hue <= HARMONY_HUE });
    }
    const base = solid(TINT_BASE);
    const tint = solid(TINT_ROLE);
    if (!base || !tint) continue;
    const [x, y] = [rgbToOklch(base), rgbToOklch(tint)];
    const lightness = round(Math.abs(y[0] - x[0]), 3);
    const chroma = round(y[1] / x[1], 2);
    harmony.tint.push({ mode, hex: toHex(tint), baseHex: toHex(base), lightness, chroma, pass: lightness >= TINT_LIGHTNESS[0] && lightness <= TINT_LIGHTNESS[1] && chroma <= TINT_CHROMA });
    for (const [role, label] of CHART_SIBLINGS) {
      const c = solid(role);
      if (!c) continue;
      const d = round(deltaE(tint, c), 3);
      if (d < CHART_NEAR_DELTA) harmony.near.push({ mode, role, label, delta: d, hex: toHex(tint), otherHex: toHex(c) });
    }
  }
  return { trees, rows, collisions, harmony };
}

const pairKey = (r) => `${r.mode}|${r.fg}|${r.bg}`;

/**
 * 给不达标的配对定性：inherited（默认颜色同样不达标且颜色相同）/ exception（调色盘登记过，approved 区分已批与待批）/ fail。
 * baseline 是默认颜色的 evaluatePalette 结果。
 */
export function classify(rows, baselineRows, exceptions = []) {
  const base = new Map(baselineRows.map((r) => [pairKey(r), r]));
  return rows.filter((r) => !r.pass).map((r) => {
    const b = base.get(pairKey(r));
    if (b && !b.pass && b.fgHex === r.fgHex && b.bgHex === r.bgHex) return { ...r, status: 'inherited' };
    const ex = exceptions.find((e) => e.fg === r.fg && e.bg === r.bg && (e.mode || 'light') === r.mode);
    if (ex && r.ratio >= ex.min - 0.005) return { ...r, status: 'exception', approved: ex.approved === true, why: ex.why };
    return { ...r, status: 'fail', ...(ex ? { why: `登记的例外底线是 ${ex.min}:1，现在只有 ${r.ratio}:1` } : {}) };
  });
}
