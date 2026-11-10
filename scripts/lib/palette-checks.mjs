// 调色盘体检口径：导入脚本按它决定改指向，体检脚本按它判定通过。
// 只看跟品牌色有关的配对（通用配对由 check-contrast.mjs 查）；和默认颜色同样不达标、颜色也一样的算「继承」，不归调色盘管。
import { applyToTrees, cloneDefaults, resolveColor } from '../../design-system-adopter/scripts/lib/palette.mjs';
import { composite, contrast, deltaE, parseHex, round, toHex } from './color.mjs';

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

export const MODES = ['light', 'dark'];

/** 在内存里套上调色盘，算全部品牌配对与撞色。 */
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
  return { trees, rows, collisions };
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
