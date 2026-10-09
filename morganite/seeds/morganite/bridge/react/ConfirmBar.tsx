// 浮层内原位确认条（种子配方组件 · React 版，与 bridge/vue/ConfirmBar.vue 同形）：替换 Dialog / Sheet 页脚，不叠第二层弹窗。
// useInlineConfirm() 返回 { state, ask, confirm, cancel }，ask() 返回 Promise<boolean>。按钮用项目自己的 Button 组件传入（保持 shadcn 形态）。
import * as React from 'react'

export interface ConfirmBarProps {
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  renderButton?: (props: { variant: 'primary' | 'danger' | 'secondary'; onClick: () => void; children: React.ReactNode; autoFocus?: boolean }) => React.ReactNode
}

export function ConfirmBar({ message, confirmText = '确定离开', cancelText = '留下', danger = false, onConfirm, onCancel, renderButton }: ConfirmBarProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => { cancelRef.current?.focus() }, [])
  const btn = renderButton ?? (({ variant, onClick, children, autoFocus }) => (
    <button ref={autoFocus ? cancelRef : undefined} type="button" className={`confirm-bar__btn is-${variant}`} onClick={onClick}>{children}</button>
  ))
  return (
    <div className="confirm-bar" role="alertdialog" aria-live="assertive" aria-label={message} onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); onCancel() } }}>
      <span className="msg">{message}</span>
      {btn({ variant: 'secondary', onClick: onCancel, children: cancelText, autoFocus: true })}
      {btn({ variant: danger ? 'danger' : 'primary', onClick: onConfirm, children: confirmText })}
    </div>
  )
}

export function useInlineConfirm() {
  const [state, setState] = React.useState({ open: false, message: '', confirmText: '确定离开', cancelText: '留下', danger: false })
  const pending = React.useRef<{ resolve: (ok: boolean) => void; promise: Promise<boolean> } | null>(null)
  const ask = React.useCallback((opts: { message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => {
    if (pending.current) return pending.current.promise
    let resolve!: (ok: boolean) => void
    const promise = new Promise<boolean>((r) => { resolve = r })
    pending.current = { promise, resolve }
    setState({ open: true, message: opts.message, confirmText: opts.confirmText ?? '确定离开', cancelText: opts.cancelText ?? '留下', danger: opts.danger ?? false })
    return promise
  }, [])
  const settle = React.useCallback((ok: boolean) => { setState((s) => ({ ...s, open: false })); const p = pending.current; pending.current = null; p?.resolve(ok) }, [])
  return { state, ask, confirm: () => settle(true), cancel: () => settle(false) }
}
