// Citrine × shadcn 实验室的验收清单（citrine/tools 读取）。演示参数放在 # 之前：theme=dark、state=invalid。
export const PAGES = [
  ['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['form-invalid', '?state=invalid#/form'], ['kitchen', '#/kitchen']
];
export const DEFAULT_QUERY = {};
export const KITCHEN = '#/kitchen';
export const NARROW = {   // 三端：narrow 档侧栏折叠，mobile 档侧栏离屏 + 汉堡可开合（DESIGN「三端」）
  widths: [{ name: 'narrow', width: 1366, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas', pages: [['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['kitchen', '#/kitchen']].filter(([n]) => n !== 'kitchen') }],
  pages: [['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['kitchen', '#/kitchen']]
};
export const FOCUS = { pages: { orders: '#/orders', form: '#/form', kitchen: '#/kitchen' }, steps: 80 };
