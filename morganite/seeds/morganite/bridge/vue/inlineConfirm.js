// 原位确认的状态机（种子配方）：与 ConfirmBar.vue 配套。
//   const leave = useInlineConfirm()
//   const beforeClose = async (done) => { if (dirty() && !(await leave.ask({ message: '意见尚未提交，确定关闭？' }))) return; done() }
//   <template #footer><ConfirmBar v-if="leave.state.open" v-bind="leave.state" @confirm="leave.confirm" @cancel="leave.cancel" /><div v-else>…原来的页脚…</div></template>
// 已经在问的时候再次 ask（比如用户又按了 Esc）复用同一个 Promise，不会叠两条。
import { reactive } from 'vue'

export function useInlineConfirm() {
  const state = reactive({ open: false, message: '', confirmText: '确定离开', cancelText: '留下', danger: false })
  let pending = null
  function ask({ message, confirmText = '确定离开', cancelText = '留下', danger = false } = {}) {
    if (pending) return pending.promise
    Object.assign(state, { open: true, message, confirmText, cancelText, danger })
    let resolve
    const promise = new Promise((r) => { resolve = r })
    pending = { promise, resolve }
    return promise
  }
  function settle(ok) { state.open = false; const current = pending; pending = null; current?.resolve(ok) }
  return { state, ask, confirm: () => settle(true), cancel: () => settle(false) }
}
