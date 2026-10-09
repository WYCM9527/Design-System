// Morganite × shadcn 实验室的验收清单（citrine-accept 读取）。演示参数放在 # 之前：theme=dark、state=invalid。
export const DARK_SELECTOR = 'html.dark';
export const PAGES = [
  ['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['form-invalid', '?state=invalid#/form'], ['kitchen', '#/kitchen']
];
export const DEFAULT_QUERY = {};
export const KITCHEN = '#/kitchen';
// 三端：窄屏档按 layout.breakpoint.narrow（992）侧栏折叠；手机档侧栏离屏 + 汉堡可开合。走查页含固定宽度的组件面板，不进手机档
export const NARROW = {
  widths: [{ name: 'narrow', width: 992, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas', pages: [['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form']] }],
  pages: [['dashboard', '#/'], ['orders', '#/orders'], ['form', '#/form'], ['kitchen', '#/kitchen']]
};
export const FOCUS = { pages: { orders: '#/orders', form: '#/form', kitchen: '#/kitchen' }, steps: 80 };
export const YELLOW_ALLOW = [];
// 已批准的对比度例外：与种子 templates/accept.config.mjs 一致（AUDIT「对比度基线」已登记例外的镜像）
export const APPROVED_CONTRAST = [
  { fg: '#FFFFFF', bg: '#B98D44', why: '金底白字 3.02:1：主按钮、分页当前页、侧栏当前项、选中日、主色徽标、深色 / 勾选标签、当前步骤' },
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' },
  { fg: '#B98D44', minRatio: 4.2, why: '暗色链接 / 文字按钮压在悬停行、气泡上约 4.3:1' }
];
