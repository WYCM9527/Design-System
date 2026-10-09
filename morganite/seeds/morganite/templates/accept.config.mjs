// {{PROJECT}} 的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取；APPROVED_CONTRAST 要 citrine-tools ≥ 1.2.0）。
// 演示参数放在 # 之前（?theme=dark、?state=empty），页面用 location.search 读；名字 → 「?演示参数#路由」。
// 亮暗两遍：工具用 ?theme=light|dark 打开每个页面——项目要在首屏把它落成 <html class="dark">（先读 URL 再读 localStorage，避免闪烁）。
export const DARK_SELECTOR = 'html.dark';
export const PAGES = [
  ['dashboard', '#/'],
  // ['orders', '#/orders'], ['orders-empty', '?state=empty#/orders'], …
];
export const DEFAULT_QUERY = {};              // 每个页面缺省带的参数（如 { role: 'admin' }）
export const KITCHEN = '#/kitchen';            // 全组件走查页：Element 项目挂种子的 @wycm9527/morganite/vue/KitchenSink.vue，shadcn 项目拷 templates/KitchenSink.tsx；null 会跳过 components 走查
// 三端：窄屏档按 layout.breakpoint.narrow（992）侧栏折叠，手机档侧栏离屏 + 汉堡可开合；各档都不允许文档级横向溢出。
// 走查页含固定宽度的组件面板，不属于「手机可用」目标，可用档位自己的 pages 把它剔出手机档
export const NARROW = {
  widths: [{ name: 'narrow', width: 992, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas' }],
  pages: [['dashboard', '#/']]
};
export const FOCUS = { pages: { dashboard: '#/' }, steps: 80, inputBorder: true };        // Tab 焦点遍历；输入类控件按 DESIGN 只把边线换成 border.focus、不加外环，焦点检查按边线认
// 品牌黄审计：Morganite 的金（#B98D44，色相约 37°、饱和度 0.46）不落在工具判黄的范围（色相 40–64°、饱和度 ≥ 0.55），这里一般不用追加
export const YELLOW_ALLOW = [];
// 已批准的对比度例外：Morganite AUDIT「对比度基线」已登记例外的镜像（系统改了例外，这里跟着改；不要为了过验收在这里加新例外）
export const APPROVED_CONTRAST = [
  { fg: '#FFFFFF', bg: '#B98D44', why: '金底白字 3.02:1：主按钮、分页当前页、侧栏当前项、选中日、主色徽标、深色 / 勾选标签、当前步骤' },
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' },
  { fg: '#B98D44', minRatio: 4.2, why: '暗色链接 / 文字按钮压在悬停行、气泡上约 4.3:1' }
];
