// 轻采的验收清单（citrine/tools 读取）。页面状态：名字 → 「?演示参数#路由」；演示参数放在 # 之前，页面用 location.search 读。
// 身份参数：role=admin|approver|applicant（许岚 / 陈予 / 林晓）或 user=uXX；缺省管理员。
export const PAGES = [
  // P01 工作台
  ['dashboard', '#/'], ['dashboard-approver', '?role=approver#/'], ['dashboard-applicant', '?role=applicant#/'], ['dashboard-empty', '?user=u05#/'], ['dashboard-loading', '?state=loading#/'],
  // P02 采购申请
  ['applications', '#/applications'], ['applications-applicant', '?role=applicant#/applications'], ['applications-chips', '?role=applicant#/applications?mine=1&status=pending'],
  ['applications-empty', '?state=empty#/applications'], ['applications-error', '?state=error#/applications'], ['applications-loading', '?state=loading#/applications'],
  // P03 表单
  ['application-new', '?role=applicant#/applications/new'], ['application-invalid', '?role=applicant&state=invalid#/applications/new'],
  ['application-edit', '?role=applicant#/applications/dr1/edit'], ['application-edit-disabled-supplier', '?role=applicant#/applications/dr2/edit'],
  // P04 详情
  ['application-detail', '#/applications/pd1'], ['application-detail-approver', '?role=approver#/applications/pd1'], ['application-detail-history', '?tab=history#/applications/pd1'],
  ['application-detail-rejected', '?role=applicant#/applications/rj1'], ['application-detail-approved', '#/applications/ap3'], ['application-detail-draft', '?role=applicant#/applications/dr1'],
  ['application-detail-missing', '?state=missing#/applications/none'], ['application-detail-forbidden', '?role=applicant#/applications/pd3'],
  // P05 审批中心
  ['approvals', '?role=approver#/approvals'], ['approvals-done', '?role=approver&tab=done#/approvals'], ['approvals-drawer', '?role=approver&drawer=pd1#/approvals'], ['approvals-empty', '?role=approver&state=empty#/approvals'],
  // P06 资产
  ['assets', '#/assets'], ['assets-applicant', '?role=applicant#/assets?mine=1'], ['assets-drawer', '?drawer=z01#/assets'], ['assets-edit', '?edit=z05#/assets'], ['assets-assign', '?assign=z05#/assets'], ['assets-error', '?state=error#/assets'],
  // P07 供应商
  ['suppliers', '#/suppliers'], ['suppliers-new', '?edit=new#/suppliers'], ['suppliers-drawer', '?drawer=s7#/suppliers'],
  // P08 报表
  ['report', '#/report'], ['report-empty', '?state=empty#/report'],
  // P09–P12
  ['org', '#/org'], ['org-dialog', '?dialog=new#/org'], ['roles', '#/roles'], ['roles-approver', '?tab=approver#/roles'],
  ['settings', '#/settings'], ['settings-notify', '?tab=notify#/settings'], ['logs', '#/logs'],
  // 结果页
  ['forbidden', '?role=applicant#/org'], ['notfound', '#/nope'],
];

export const DEFAULT_QUERY = { role: 'admin' };
export const KITCHEN = '#/kitchen';   // 种子的 KitchenSink.vue 挂在 /kitchen（2.11.0 起独立项目也能跑组件走查）
export const NARROW = {   // 三端：narrow 档侧栏折叠，mobile 档侧栏离屏 + 汉堡可开合（DESIGN「三端」）
  widths: [{ name: 'narrow', width: 1280, expect: 'collapsed' }, { name: 'mobile', width: 390, expect: 'offcanvas' }],
  pages: [['dashboard', '#/'], ['applications', '#/applications'], ['application-new', '?role=applicant#/applications/new'], ['application-detail', '#/applications/pd1'], ['approvals', '?role=approver#/approvals'], ['assets', '#/assets'], ['report', '#/report'], ['org', '#/org'], ['roles', '#/roles'], ['settings', '#/settings'], ['logs', '#/logs']]
};
export const FOCUS = { pages: { applications: '#/applications', 'application-new': '?role=applicant#/applications/new', approvals: '?role=approver#/approvals', settings: '#/settings' }, steps: 80 };
// 页面级静息黄色的项目合法位置（默认清单见 tools/lib/yellow-allow.mjs）：统计卡骨架保留数据卡的品牌指示条；设置页的企业 Logo 预览块本身就是 Logo
export const YELLOW_ALLOW = ['.stat-skel', '.logo-preview'];
