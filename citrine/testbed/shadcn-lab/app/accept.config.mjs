// Citrine × shadcn 实验室的验收清单（citrine/tools 读取）。演示参数放在 # 之前：theme=dark、state=invalid。
export const PAGES = [
  ['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['form-invalid', '?state=invalid#/form'], ['kitchen', '#/kitchen']
];
export const DEFAULT_QUERY = {};
export const KITCHEN = '#/kitchen';
export const NARROW = { width: 1366, pages: [['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['kitchen', '#/kitchen']] };
export const FOCUS = { pages: { orders: '#/orders', form: '#/form', kitchen: '#/kitchen' }, steps: 80 };
