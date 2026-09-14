// 黄金后台的验收清单（citrine/tools 读取）。页面状态：名字 → 「?演示参数#路由」，演示参数放在 # 之前，页面用 location.search 读。
// 新增页面时在这里登记，验收才会覆盖它。
export const PAGES = [
  ['login', '#/login'], ['login-error', '?state=error#/login'],
  ['dashboard', '#/'], ['dashboard-empty', '?state=empty#/'], ['dashboard-loading', '?state=loading#/'],
  ['orders', '#/orders'], ['orders-empty', '?state=empty#/orders'], ['orders-error', '?state=error#/orders'], ['orders-loading', '?state=loading#/orders'],
  ['order-detail', '#/orders/20260908-0412'], ['order-reassign', '#/orders/20260908-0412?reassign=1'],
  ['merchants', '#/merchants'], ['merchants-audit', '?audit=1#/merchants'],
  ['merchant-new', '#/merchants/new'], ['merchant-invalid', '?state=invalid#/merchants/new'], ['merchant-edit-auditor', '?role=auditor#/merchants/m1/edit'],
  ['merchant-detail', '#/merchants/M-2026-000400'], ['merchant-detail-quals', '?tab=quals#/merchants/M-2026-000400'], ['merchant-detail-logs', '?tab=logs#/merchants/M-2026-000400'], ['merchant-detail-settlement', '?tab=settlement#/merchants/M-2026-000400'], ['merchant-detail-disabled', '?state=disabled#/merchants/M-2026-000400'], ['merchant-detail-empty', '?state=empty&tab=logs#/merchants/M-2026-000400'], ['merchant-detail-missing', '?state=missing#/merchants/M-2026-000400'],
  ['apply', '#/merchants/apply'], ['apply-invalid', '?state=invalid#/merchants/apply'], ['apply-step2', '?step=2#/merchants/apply'], ['apply-step3', '?step=3#/merchants/apply'], ['apply-success', '?state=success#/merchants/apply'],
  ['campaigns', '#/campaigns'], ['campaigns-card', '?view=card#/campaigns'], ['campaigns-dialog', '?dialog=1#/campaigns'],
  ['members', '#/members'], ['analytics', '#/analytics'], ['analytics-settle', '?tab=settlement#/analytics'],
  ['riders', '#/riders'], ['riders-dialog', '?dialog=1#/riders'],
  ['notices', '#/notices'], ['notice-detail', '#/notices/a1'],
  ['profile', '#/profile'], ['profile-pwd', '?state=pwd#/profile'],
  ['refunds', '#/refunds'], ['refunds-empty', '?state=empty#/refunds'], ['refunds-loading', '?state=loading#/refunds'],
  ['forbidden', '?role=finance#/orders'], ['notfound', '#/nope'], ['error500', '#/error/500'],
  ['kitchen', '#/kitchen'],
];

/** 所有页面缺省带的参数（角色直达管理员） */
export const DEFAULT_QUERY = { role: 'admin' };
/** 全组件走查页（没有则设为 null，scan:components 会跳过） */
export const KITCHEN = '#/kitchen';
/** 窄屏检查：宽度与页面 */
export const NARROW = { width: 1366, pages: [['dashboard', '#/'], ['orders', '#/orders'], ['refunds', '#/refunds'], ['analytics', '#/analytics'], ['campaigns-card', '?view=card#/campaigns'], ['members', '#/members'], ['order-detail', '#/orders/20260908-0412'], ['apply', '#/merchants/apply'], ['kitchen', '#/kitchen']] };
/** Tab 焦点遍历：名字 → 页面 */
export const FOCUS = { pages: { orders: '#/orders', apply: '#/merchants/apply' }, steps: 80 };
