import { reactive, computed } from 'vue'

// 角色是唯一的权限维度（PRD §1）。菜单可见性与按钮权限都从这里推。
export const ROLES = {
  admin: { label: '管理员', menus: ['dashboard', 'analytics', 'orders', 'refunds', 'merchants', 'campaigns', 'riders', 'notices', 'members', 'profile'], perms: ['order.reassign', 'order.cancel', 'merchant.edit', 'merchant.audit', 'campaign.edit', 'member.edit', 'finance.view'] },
  ops: { label: '运营', menus: ['dashboard', 'orders', 'refunds', 'merchants', 'campaigns', 'riders', 'notices', 'profile'], perms: ['order.reassign', 'order.cancel', 'merchant.edit', 'campaign.edit'] },
  auditor: { label: '审核员', menus: ['dashboard', 'orders', 'merchants', 'notices', 'profile'], perms: ['merchant.audit'] },
  finance: { label: '财务', menus: ['dashboard', 'analytics', 'notices', 'profile'], perms: ['finance.view'] }
}

const saved = (k, d) => (typeof localStorage !== 'undefined' && localStorage.getItem(k)) || d

const query = new URLSearchParams(typeof location !== 'undefined' ? location.search : '')
export const store = reactive({
  role: ROLES[query.get('role')] ? query.get('role') : saved('ga-role', 'admin'),   // ?role=finance 供截图直达无权态
  collapsed: typeof matchMedia !== 'undefined' && matchMedia('(max-width: 1440px)').matches,   // PRD：≤1440 侧栏默认折叠
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  unread: 5
})

export const roleInfo = computed(() => ROLES[store.role])
export const can = (perm) => ROLES[store.role].perms.includes(perm)
export const canSee = (menu) => ROLES[store.role].menus.includes(menu)

export function setRole(role) { store.role = role; localStorage.setItem('ga-role', role) }
export function toggleTheme() {
  store.theme = store.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', store.theme === 'dark')
  localStorage.setItem('ga-theme', store.theme)
}
