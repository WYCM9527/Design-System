// 会话：当前演示身份、角色权限、主题、侧栏折叠、列表状态记忆、测试工具（失败注入）。
// 身份 = 一名启用成员（PRD §6.1 演示身份切换）；角色由成员决定，不能单独切换。
import { reactive, computed } from 'vue'
import { db, findMember, findDept } from './db'
import { ROLE_MENUS, ROLE_PERMS, ROLES } from './constants'

const query = new URLSearchParams(typeof location !== 'undefined' ? location.search : '')
const saved = (k, d) => (typeof localStorage !== 'undefined' && localStorage.getItem(k)) || d

// ?user=u04 / ?role=applicant|approver|admin 供截图与直达；否则用上次身份，默认管理员许岚
function initialUser() {
  const byQuery = query.get('user')
  if (byQuery) return byQuery
  const role = query.get('role')
  if (role) { const m = { applicant: 'u04', approver: 'u02', admin: 'u01' }[role]; if (m) return m }
  return saved('qc-user', 'u01')
}

export const session = reactive({
  userId: initialUser(),
  collapsed: typeof matchMedia !== 'undefined' && matchMedia('(max-width: 1366px)').matches,
  theme: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  // 测试工具（PRD §6.5）：只影响下一次对应操作
  failNext: { list: false, submit: false },
  notifyOpen: false
})

export const user = computed(() => findMember(session.userId) || db.members?.find((m) => m.active) || {})
export const role = computed(() => user.value.role || 'applicant')
export const roleLabel = computed(() => ROLES[role.value]?.label || '')
export const userDept = computed(() => findDept(user.value.deptId)?.name || '')
export const can = (perm) => (ROLE_PERMS[role.value] || []).includes(perm)
export const canSee = (menu) => (ROLE_MENUS[role.value] || []).includes(menu)
export const isSelf = (id) => id === session.userId

export function switchUser(id) {
  session.userId = id
  localStorage.setItem('qc-user', id)
  clearListMemory()   // 清除上个身份的页面筛选和临时选中（PRD §6.1）
}
export function toggleTheme() {
  session.theme = session.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', session.theme === 'dark')
  localStorage.setItem('qc-theme', session.theme)
}

// 列表状态记忆（筛选、页码、排序）：进入详情再回来时恢复（PRD §3）。sessionStorage，随标签页销毁。
const MEM = 'qc-list:'
export function rememberList(key, state) { sessionStorage.setItem(MEM + key, JSON.stringify(state)) }
export function recallList(key) { try { return JSON.parse(sessionStorage.getItem(MEM + key)) || null } catch { return null } }
export function clearListMemory() { for (const k of Object.keys(sessionStorage)) if (k.startsWith(MEM)) sessionStorage.removeItem(k) }

// 演示状态参数（?state=loading|error|empty…），放在 # 之前；页面用 demoState() 读取，只在首次加载生效
export const demoState = () => query.get('state') || ''
export const demoParam = (k) => query.get(k) || ''
