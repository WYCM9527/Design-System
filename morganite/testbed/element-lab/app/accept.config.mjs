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
export const FOCUS = { pages: { dashboard: '#/' }, steps: 80, inputBorder: true };   // 输入类控件只换边线（DESIGN），按边线认焦点
// 品牌色审计：允许出现品牌色的位置登记在设计系统身份文件 design-system.json 的 accept.brand（依据 DESIGN），判色范围跟着项目当前颜色；
// 本项目另有合法位置时追加在这里并写明理由，如 ['.welcome-banner']
export const BRAND_ALLOW = [];
// 已批准的对比度例外：设计系统 AUDIT「对比度基线」已登记的例外的镜像，先在系统里登记，再写到这里。
// 跟颜色走的例外（主色底白字、暗色链接压在悬停行上）登记在设计系统里，验收工具按当前颜色自动带上（citrine-tools ≥ 1.4.0）
export const APPROVED_CONTRAST = [
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' }
];
