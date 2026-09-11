// 实测项目的页面状态清单：名字 → 「?查询串#路由」。查询串里的 state / step / view / dialog 等是演示参数（放在 # 之前，页面用 location.search 读）。
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

/** 组合出完整 URL：默认 role=admin，模式参数放在 # 之前 */
export function pageUrl(base, spec, modeQuery) {
  const [q, h] = spec.split('#');
  const params = new URLSearchParams(q.replace(/^\?/, ''));
  if (!params.has('role')) params.set('role', 'admin');
  for (const [k, v] of new URLSearchParams(modeQuery)) if (!params.has(k)) params.set(k, v);
  return `${base}/index.html?${params}#${h}`;
}
