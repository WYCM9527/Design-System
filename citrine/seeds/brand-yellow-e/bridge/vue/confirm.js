// 确认弹窗（种子配方）：ElMessageBox 关闭后不会把焦点还给触发元素（PRD / DESIGN 交互规则：浮层关闭后焦点回到触发按钮）。
// 这里包一层，记住打开前的焦点元素，关闭后还回去。用法与 ElMessageBox.confirm 完全一致（取消时 reject）。
//   import { confirmBox, confirmDanger } from '<bridge>/vue/confirm.js'
//   await confirmBox('确认删除这 3 张草稿？', '删除草稿', { type: 'warning' })
//   await confirmDanger('停用后不可用于新申请…', '停用供应商', { confirmButtonText: '确认停用' })   // 危险确认：红底白字确认按钮
import { ElMessageBox } from 'element-plus'

function restoreTo(el) { requestAnimationFrame(() => { if (el && el.isConnected && typeof el.focus === 'function') el.focus() }) }

export function confirmBox(message, title, options = {}) {
  const prev = document.activeElement
  const p = ElMessageBox.confirm(message, title, options)
  p.then(() => restoreTo(prev), () => restoreTo(prev))
  return p
}
export function confirmDanger(message, title, options = {}) {
  return confirmBox(message, title, { type: 'warning', confirmButtonClass: 'el-button--danger', ...options })
}
