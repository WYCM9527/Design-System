// 拾光商城 · 运营后台的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取；APPROVED_CONTRAST 要 citrine-tools ≥ 1.2.0，品牌金审计要 ≥ 1.3.0）。
// 演示参数放在 # 之前（?theme=dark、?state=empty、?role=finance），页面用 location.search 读；名字 → 「?演示参数#路由」。
// 亮暗两遍：工具用 ?theme=light|dark 打开每个页面，index.html 首屏把它落成 <html class="dark">（先读 URL 再读 localStorage）。
// 页面状态覆盖 PRD §9 的验证矩阵：每个列表页的加载 / 空 / 出错，表单的校验失败与只读，无权限角色的 403，详情的抽屉 / 弹窗直达。
export const DARK_SELECTOR = 'html.dark';
export const PAGES = [
  ['login', '#/login'],
  ['login-error', '?state=error#/login'],
  ['dashboard', '#/'],
  ['dashboard-loading', '?state=loading#/'],
  ['dashboard-empty', '?state=empty#/'],
  ['analytics', '#/analytics'],
  ['analytics-settlement', '?tab=settlement#/analytics'],
  ['analytics-ops', '?role=ops#/analytics'],
  ['orders', '#/orders'],
  ['orders-preset', '?preset=1#/orders'],
  ['orders-loading', '?state=loading#/orders'],
  ['orders-empty', '?state=empty#/orders'],
  ['orders-error', '?state=error#/orders'],
  ['orders-finance-403', '?role=finance#/orders'],
  ['order-detail', '#/orders/SO202610094102'],
  ['order-ship', '?drawer=ship#/orders/SO202610094111'],
  ['order-done', '#/orders/SO202610094105'],
  ['order-closed', '?state=closed#/orders/SO202610094111'],
  ['order-missing', '#/orders/SO000000'],
  ['refunds', '#/refunds'],
  ['refunds-audit', '?audit=1#/refunds'],
  ['refunds-ops', '?role=ops#/refunds'],
  ['refunds-empty', '?state=empty#/refunds'],
  ['products', '#/products'],
  ['products-card', '?view=card#/products'],
  ['products-loading', '?state=loading#/products'],
  ['product-new', '#/products/new'],
  ['product-invalid', '?state=invalid#/products/new'],
  ['product-readonly', '?role=service#/products/SG2612/edit'],
  ['customers', '#/customers'],
  ['customer-detail', '#/customers/C010177'],
  ['customer-refunds', '?tab=refunds#/customers/C010177'],
  ['customer-profile', '?tab=profile#/customers/C010177'],
  ['campaigns', '#/campaigns'],
  ['campaigns-card', '?view=card#/campaigns'],
  ['coupons', '?tab=coupons#/campaigns'],
  ['campaign-dialog', '?dialog=1#/campaigns'],
  ['notices', '#/notices'],
  ['notices-empty', '?state=empty#/notices'],
  ['notice-detail', '#/notices/a1'],
  ['members', '#/members'],
  ['members-ops-403', '?role=ops#/members'],
  ['settings', '#/settings'],
  ['settings-profile', '?tab=profile#/settings'],
  ['settings-security', '?tab=security#/settings'],
  ['settings-look', '?tab=look#/settings'],
  ['inventory', '#/inventory'],
  ['not-found', '#/no-such-page'],
  ['server-error', '#/error/500'],
  ['kitchen', '#/kitchen']
];
export const DEFAULT_QUERY = { role: 'admin' };   // 每次打开前清空存储；不带 ?role= 的页面一律按管理员看
export const KITCHEN = '#/kitchen';
// 三端：窄屏档按 layout.breakpoint.narrow（992）侧栏折叠，手机档侧栏离屏 + 汉堡可开合；各档都不允许文档级横向溢出。
// 走查页按桌面排版、含固定宽度的组件面板，不进手机档
const NARROW_PAGES = [
  ['dashboard', '#/'], ['analytics', '#/analytics'], ['orders', '?preset=1#/orders'], ['order-detail', '#/orders/SO202610094102'],
  ['products', '#/products'], ['product-new', '#/products/new'], ['customers', '#/customers'], ['customer-detail', '#/customers/C010177'],
  ['campaigns', '#/campaigns'], ['coupons', '?tab=coupons#/campaigns'], ['refunds', '#/refunds'], ['notices', '#/notices'],
  ['members', '#/members'], ['settings', '#/settings'], ['settings-profile', '?tab=profile#/settings'], ['inventory', '#/inventory']
];
export const NARROW = {
  widths: [{ name: 'narrow', width: 992, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas', pages: NARROW_PAGES }],
  pages: [...NARROW_PAGES, ['kitchen', '#/kitchen']]
};
// Tab 焦点遍历；输入类控件按 DESIGN 只把边线换成 border.focus、不加外环，焦点检查按边线认
export const FOCUS = { pages: { dashboard: '#/', orders: '?preset=1#/orders', 'product-new': '#/products/new', settings: '?tab=profile#/settings' }, steps: 80, inputBorder: true };
// 品牌金审计：判色范围与允许出现金色的位置登记在设计系统身份文件 design-system.json 的 accept.brand（依据 DESIGN；要 citrine-tools ≥ 1.3.0）；
// 本项目另有合法位置时追加在这里并写明理由，如 ['.welcome-banner']
export const BRAND_ALLOW = [];
// 已批准的对比度例外：Morganite AUDIT「对比度基线」已登记例外的镜像（照抄种子模板，不为过验收新增）
export const APPROVED_CONTRAST = [
  { fg: '#FFFFFF', bg: '#B98D44', why: '金底白字 3.02:1：主按钮、分页当前页、侧栏当前项、选中日、主色徽标、深色 / 勾选标签、当前步骤' },
  { fg: 'rgba(0, 0, 0, 0.45)', why: '亮色占位符（占位符底线 3:1）' },
  { fg: 'rgba(255, 255, 255, 0.45)', why: '暗色占位符（占位符底线 3:1）' },
  { fg: '#B98D44', minRatio: 4.2, why: '暗色链接 / 文字按钮压在悬停行、气泡上约 4.3:1' }
];
