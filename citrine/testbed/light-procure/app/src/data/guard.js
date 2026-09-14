// 未保存修改的离开确认（PRD P03 / P11 / §6.6）：页面调用 useDirtyGuard(() => isDirty)。
// 路由离开、刷新关闭、顶栏身份切换共用同一条规则；Esc 与取消由弹窗 / 抽屉自己调用 confirmLeave。
import { useRouter } from 'vue-router'
import { onBeforeUnmount } from 'vue'
import { confirmBox } from '@wycm9527/citrine/vue/confirm.js'
import { session } from './session'

export async function confirmLeave(message = '有未保存的修改，离开后将丢失。确定离开？') {
  try { await confirmBox(message, '未保存的修改', { confirmButtonText: '离开', cancelButtonText: '留在本页', type: 'warning' }); return true } catch { return false }
}

export function useDirtyGuard(isDirty) {
  session.dirtyCheck = isDirty
  const router = useRouter()
  const onUnload = (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = '' } }
  window.addEventListener('beforeunload', onUnload)
  // 用全局守卫而不是 onBeforeRouteLeave：新建保存后 replace 到编辑路由时 RouterView 复用同一实例，组件级守卫不再触发
  let bypass = false
  const stop = router.beforeEach(async (to, from) => {
    if (bypass || !isDirty() || to.name === from.name) return true
    const ok = await confirmLeave(); if (ok) bypass = true; return ok
  })
  onBeforeUnmount(() => { stop(); window.removeEventListener('beforeunload', onUnload); if (session.dirtyCheck === isDirty) session.dirtyCheck = null })
}

/** 顶栏等处在切换身份 / 跳转前调用：没有脏页面直接放行 */
export async function leaveIfClean() { return !session.dirtyCheck || !session.dirtyCheck() || (await confirmLeave()) }
