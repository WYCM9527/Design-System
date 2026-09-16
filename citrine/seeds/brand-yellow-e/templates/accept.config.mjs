// {{PROJECT}} 的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取）。
// 演示参数放在 # 之前（?theme=dark、?state=empty），页面用 location.search 读；名字 → 「?演示参数#路由」。
// 亮暗两遍：工具用 ?theme=light|dark 打开每个页面——项目要在首屏把它落成 <html class="dark">（index.html 里先读 URL 再读 localStorage，避免闪烁）。
// 暗色那一遍工具会核对 DARK_SELECTOR 是否命中，没命中算失败（否则等于把亮色扫两遍）；项目确实没有暗色就跑 citrine-accept … --modes light。
export const DARK_SELECTOR = 'html.dark';
export const PAGES = [
  ['dashboard', '#/'],
  // ['orders', '#/orders'], ['orders-empty', '?state=empty#/orders'], ['form-invalid', '?state=invalid#/form'], …
];
export const DEFAULT_QUERY = {};              // 每个页面缺省带的参数（如 { role: 'admin' }）
export const KITCHEN = '#/kitchen';            // 全组件走查页：Element 项目挂种子的 @wycm9527/citrine/vue/KitchenSink.vue，shadcn 项目拷 templates/KitchenSink.tsx；null 会跳过 components 走查
export const NARROW = {   // 三端响应检查（DESIGN「三端」）：narrow 档侧栏折叠，mobile 档侧栏离屏 + 汉堡可开合；各档均不允许文档级横向溢出
  widths: [{ name: 'narrow', width: 1366, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas' }],
  pages: [['dashboard', '#/']]
};
export const FOCUS = { pages: { dashboard: '#/' }, steps: 80 };        // Tab 焦点遍历
// 页面级静息黄色审计：品牌黄只允许出现在默认清单（主按钮 / 勾选开关选中 / 进度滑杆 / 当前页 / 数据卡描边 / Logo / 空态插图 / 结果页大号码，见 tools/lib/yellow-allow.mjs）；
// 项目自己的合法位置在这里追加选择器并写明理由（如登录页品牌区 '.auth-brand'），其余黄色一律算失败。
export const YELLOW_ALLOW = [];
