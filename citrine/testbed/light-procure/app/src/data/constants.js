// 业务常量（PRD §2 / §4 / §5 / §7）。文案与状态 → 胶囊语义色的映射集中在这里，页面不自己配色。

export const BASE_DATE = '2026-09-08'          // 演示基准日（PRD §7）
export const BASE_TIME = '2026-09-08 09:00'    // 本次会话新操作从这一刻起按分钟递增

export const CATEGORIES = ['电脑设备', '办公设备', '办公家具', '其他']

// 采购申请状态：label 给文字，tone 给 recipes 里的 .status 语义类（success / warning / error / info / neutral）
export const APP_STATUS = {
  draft: { label: '草稿', tone: 'neutral' },
  pending: { label: '待审批', tone: 'warning' },
  approved: { label: '已通过', tone: 'success' },
  rejected: { label: '已驳回', tone: 'error' }
}
export const APP_STATUS_LIST = Object.entries(APP_STATUS).map(([value, v]) => ({ value, label: v.label }))

export const PRIORITY = {
  normal: { label: '普通', tone: 'neutral' },
  urgent: { label: '紧急', tone: 'error' }
}

export const ASSET_STATUS = {
  idle: { label: '闲置', tone: 'neutral' },
  inuse: { label: '在用', tone: 'success' }
}

// 启用 / 停用（供应商、成员）：无倾向状态用 neutral
export const ACTIVE_STATUS = { true: { label: '启用', tone: 'success' }, false: { label: '停用', tone: 'neutral' } }
// 附件写入状态
export const FILE_STATE = { pending: { label: '写入中', tone: 'info' }, ready: { label: '已就绪', tone: 'success' }, failed: { label: '失败', tone: 'error' } }

export const ROLES = {
  applicant: { label: '申请人', desc: '提交采购申请，查看进度和自己领用的资产。' },
  approver: { label: '审批人', desc: '集中处理采购申请，查看采购统计。' },
  admin: { label: '管理员', desc: '维护资产、供应商、成员和系统配置；不参与审批。' }
}

// 角色 → 菜单与能力（PRD §2 表）。菜单 key 对应路由 meta.menu
export const ROLE_MENUS = {
  applicant: ['dashboard', 'applications', 'assets'],
  approver: ['dashboard', 'applications', 'approvals', 'assets', 'report'],
  admin: ['dashboard', 'applications', 'assets', 'suppliers', 'report', 'org', 'roles', 'settings', 'logs']
}
export const ROLE_PERMS = {
  applicant: [],
  approver: ['app.viewAll', 'approve', 'asset.viewAll', 'report.view', 'export'],
  admin: ['app.viewAll', 'asset.viewAll', 'asset.manage', 'supplier.manage', 'report.view', 'org.manage', 'settings.manage', 'logs.view', 'export']
}

export const PAGE_SIZES = [10, 20, 50]

export const LOG_MODULES = {
  application: '采购申请',
  asset: '资产',
  supplier: '供应商',
  member: '成员',
  settings: '系统设置'
}

// 附件限制（PRD P03）
export const FILE_LIMIT = { count: 3, size: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'application/pdf'], exts: ['jpg', 'jpeg', 'png', 'pdf'] }

// 明细限制
export const LINE_LIMIT = { min: 1, max: 5, qtyMin: 1, qtyMax: 99, priceMin: 0.01, priceMax: 99999.99 }
