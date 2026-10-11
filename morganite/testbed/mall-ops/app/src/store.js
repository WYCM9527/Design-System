import { reactive, computed } from 'vue'

// 角色是唯一的权限维度（PRD §1）。菜单可见性与按钮权限都从这里推。
const ALL_MENUS = ['dashboard', 'analytics', 'orders', 'refunds', 'products', 'inventory', 'customers', 'campaigns', 'notices', 'members', 'settings', 'kitchen']
export const PERM_LABELS = {
  'order.ship': '订单发货', 'order.close': '关闭订单', 'order.note': '订单备注',
  'refund.audit': '退款审核', 'refund.create': '发起售后',
  'product.edit': '商品编辑', 'product.shelf': '商品上下架', 'product.cost': '查看成本价',
  'customer.edit': '客户管理', 'campaign.edit': '营销配置', 'coupon.issue': '发放优惠券',
  'finance.view': '查看结算', 'report.export': '导出报表', 'member.edit': '成员管理'
}
export const ROLES = {
  admin: { label: '管理员', menus: ALL_MENUS, perms: Object.keys(PERM_LABELS) },
  ops: { label: '运营', menus: ALL_MENUS.filter((m) => m !== 'members'), perms: ['order.ship', 'order.close', 'order.note', 'refund.create', 'product.edit', 'product.shelf', 'customer.edit', 'campaign.edit', 'coupon.issue', 'report.export'] },
  service: { label: '客服', menus: ['dashboard', 'orders', 'refunds', 'products', 'customers', 'notices', 'settings', 'kitchen'], perms: ['order.note', 'refund.create'] },
  finance: { label: '财务', menus: ['dashboard', 'analytics', 'refunds', 'notices', 'settings', 'kitchen'], perms: ['refund.audit', 'finance.view', 'report.export'] }
}

const saved = (k, d) => { try { return localStorage.getItem(k) || d } catch { return d } }
const query = new URLSearchParams(location.search)
// 三端：≤ layout.breakpoint.narrow（字面镜像 992）侧栏默认折叠；外观设置里的「默认折叠侧栏」也会让桌面折叠
const narrow = matchMedia('(max-width: 992px)')

export const store = reactive({
  role: ROLES[query.get('role')] ? query.get('role') : saved('mall-ops-role', 'admin'),   // ?role=finance 供截图直达无权态
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  preferCollapsed: saved('mall-ops-collapsed', '0') === '1',
  narrow: narrow.matches,
  unread: 4,
  user: { name: '林夏', initial: '林' }
})
narrow.addEventListener('change', (e) => { store.narrow = e.matches })

export const collapsed = computed(() => store.narrow || store.preferCollapsed)
export const roleInfo = computed(() => ROLES[store.role])
export const can = (perm) => ROLES[store.role].perms.includes(perm)
export const canSee = (menu) => ROLES[store.role].menus.includes(menu)
export const needPerm = (perm) => `需要「${PERM_LABELS[perm]}」权限`

export function setRole(role) { store.role = role; try { localStorage.setItem('mall-ops-role', role) } catch { /* 隐私模式不持久化 */ } }
export function setTheme(theme) {
  store.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try { localStorage.setItem('mall-ops-theme', theme) } catch { /* 同上 */ }
}
export const toggleTheme = () => setTheme(store.theme === 'dark' ? 'light' : 'dark')
export function setPreferCollapsed(v) { store.preferCollapsed = v; try { localStorage.setItem('mall-ops-collapsed', v ? '1' : '0') } catch { /* 同上 */ } }

// 演示参数：放在 # 之前，页面用 location.search 读（验收工具靠它直达各状态）
export const demo = (key) => query.get(key)
