// 表单页：.form-page / .form-grid / .form-foot.is-sticky 配方 + shadcn 控件；弹窗内的离开确认用原位确认条（React 版 ConfirmBar）。
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmBar, useInlineConfirm } from '@/styles/bridge/react/ConfirmBar'

export function FormPage() {
  const state = new URLSearchParams(location.search).get('state')
  const invalid = state === 'invalid'
  const [open, setOpen] = React.useState(false)
  const [note, setNote] = React.useState('')
  const leave = useInlineConfirm()
  const requestClose = async () => { if (note.trim() && !(await leave.ask({ message: '备注尚未保存，关闭后会丢失。', confirmText: '确定关闭', cancelText: '继续填写' }))) return; setOpen(false); setNote('') }
  return (
    <>
      <div className="page-head"><div><h1>新建商户</h1><p>带 * 的为必填项</p></div></div>
      <form className="form-page card-block" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="card-head"><h2>基本信息</h2></div>
        <div className="form-grid">
          <div className="field"><Label htmlFor="f-name">商户名称 <span className="req" aria-hidden="true">*</span></Label><Input id="f-name" aria-invalid={invalid || undefined} placeholder="2–50 字" />{invalid && <span className="help err">请输入商户名称</span>}</div>
          <div className="field"><Label htmlFor="f-city">城市 <span className="req" aria-hidden="true">*</span></Label><Select><SelectTrigger id="f-city" className="w-full" aria-invalid={invalid || undefined}><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectItem value="sh">上海</SelectItem><SelectItem value="bj">北京</SelectItem></SelectContent></Select>{invalid && <span className="help err">请选择城市</span>}</div>
          <div className="field"><Label htmlFor="f-phone">联系电话</Label><Input id="f-phone" placeholder="11 位手机号" /><span className="help">用于接收审核结果短信</span></div>
          <div className="field"><Label>结算周期</Label><RadioGroup defaultValue="t7" className="inline-radios"><label className="inline"><RadioGroupItem value="t1" /> T+1</label><label className="inline"><RadioGroupItem value="t7" /> T+7</label></RadioGroup></div>
          <div className="field span2"><Label htmlFor="f-addr">地址</Label><Textarea id="f-addr" placeholder="省市区 + 详细地址" /></div>
          <div className="field span2"><label className="inline"><Checkbox aria-label="同意入驻协议" /> 我已阅读并同意《商户入驻协议》</label></div>
          <div className="field span2">
            <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : requestClose())}>
              <DialogTrigger asChild><Button variant="outline" data-ks-modal="dialog">补充备注（弹窗内原位确认）</Button></DialogTrigger>
              <DialogContent showCloseButton={false} onEscapeKeyDown={(e) => { e.preventDefault(); requestClose() }} className="p-0 gap-0">
                <div className="dlg-body">
                  <DialogHeader><DialogTitle>补充备注</DialogTitle><DialogDescription>输入内容后尝试关闭，会在底部出现原位确认条，而不是再弹一层。</DialogDescription></DialogHeader>
                  <Textarea aria-label="备注" value={note} onChange={(e) => setNote(e.target.value)} placeholder="选填" className="mt-4" />
                </div>
                {leave.state.open
                  ? <ConfirmBar {...leave.state} onConfirm={leave.confirm} onCancel={leave.cancel} renderButton={({ variant, onClick, children, autoFocus }) => <Button variant={variant === 'secondary' ? 'outline' : variant === 'danger' ? 'destructive' : 'default'} onClick={onClick} autoFocus={autoFocus}>{children}</Button>} />
                  : <DialogFooter className="dlg-foot"><Button variant="ghost" onClick={requestClose}>取消</Button><Button onClick={() => { setOpen(false) }}>保存</Button></DialogFooter>}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="form-foot is-sticky"><Button variant="ghost" type="button">取消</Button><Button variant="outline" type="button">保存草稿</Button><Button type="submit">提交</Button></div>
      </form>
    </>
  )
}
