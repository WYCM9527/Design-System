// {{PROJECT}} 的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取；要 citrine-tools ≥ 1.4.0：品牌色审计与跟颜色走的对比度例外按项目当前颜色取）。
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
// 品牌色审计：允许出现品牌色的位置登记在设计系统身份文件 design-system.json 的 accept.brand（依据 DESIGN），判色范围跟着项目当前颜色
// （换过颜色时取调色盘文件的 accept.brand）；本项目另有合法位置时追加在这里并写明理由，如 ['.welcome-banner']
export const BRAND_ALLOW = [];
// 已批准的对比度例外：Morganite AUDIT「对比度基线」已登记例外的镜像（系统改了例外，这里跟着改；不要为了过验收在这里加新例外）。
// 跟颜色走的例外（主色底白字、暗色链接压在悬停行上）登记在设计系统里——默认颜色在身份文件 accept.approvedContrast，换过的颜色在调色盘文件里，
// 验收工具按 design-system/.adopter.json 记的颜色自动带上，这里不写品牌色值；citrine-tools 内置的 Citrine 例外只对 Citrine 项目生效，这里不用写 CITRINE_APPROVED
export const APPROVED_CONTRAST = [
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' }
];
