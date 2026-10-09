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
