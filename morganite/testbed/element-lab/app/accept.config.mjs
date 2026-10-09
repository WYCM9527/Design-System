// Element 实验场的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取）。
// 演示参数放在 # 之前（?theme=dark），页面用 location.search 读；名字 → 「?演示参数#路由」。
// 亮暗两遍：工具用 ?theme=light|dark 打开每个页面，main.js 把它落成 <html class="dark">；暗色那一遍核对 DARK_SELECTOR 是否命中。
export const DARK_SELECTOR = 'html.dark';
export const PAGES = [
  ['dashboard', '#/'],
  ['kitchen', '#/kitchen']
];
export const DEFAULT_QUERY = {};
export const KITCHEN = '#/kitchen';
// 三端：窄屏档按 layout.breakpoint.narrow（992）侧栏折叠；手机档侧栏离屏 + 汉堡可开合。走查页按桌面排版、含固定宽度的组件面板，不进手机档
export const NARROW = {
  widths: [{ name: 'narrow', width: 992, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas', pages: [['dashboard', '#/']] }],
  pages: [['dashboard', '#/'], ['kitchen', '#/kitchen']]
};
export const FOCUS = { pages: { dashboard: '#/' }, steps: 80 };
// 品牌黄审计：Morganite 的金（#B98D44，色相约 37°、饱和度 0.46）不落在工具判黄的范围里，这里不需要追加
export const YELLOW_ALLOW = [];
// 已批准的对比度例外：设计系统 AUDIT「对比度基线」已登记的例外的镜像，先在系统里登记，再写到这里
export const APPROVED_CONTRAST = [
  { fg: '#FFFFFF', bg: '#B98D44', why: '金底白字 3.02:1：主按钮、分页当前页、侧栏当前项、选中日、主色徽标、深色 / 勾选标签、当前步骤（用户指定金底放白字）' },
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' },
  { fg: '#B98D44', minRatio: 4.2, why: '暗色链接 / 文字按钮压在悬停行、气泡上约 4.3:1（用户 2026-10-09 决定保持暗色链接色）' }
];
