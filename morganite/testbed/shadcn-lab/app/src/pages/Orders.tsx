// 列表页：页头 / 筛选栏 / 条件标签 / 批量条 / 表格 / 分页——骨架全部来自 recipes.css，控件是 shadcn。
import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

const ALL = [
  ['20260908-0412', '鲜果时光', '上海', '¥156.70', 'success', '已完成', '2026-09-08 14:59'], ['20260908-0411', '川味小馆（望京店）', '北京', '¥47.80', 'warning', '待接单', '2026-09-08 14:58'],
  ['20260908-0410', '晨曦烘焙', '成都', '¥1,225.90', 'info', '配送中', '2026-09-08 14:57'], ['20260908-0409', '轻食主义', '杭州', '¥1,117.00', 'error', '已取消', '2026-09-08 14:56'],
  ['20260908-0408', '深夜食堂', '深圳', '¥1,008.10', 'success', '已完成', '2026-09-08 14:55'], ['20260908-0407', '鲜蔬到家', '广州', '¥899.20', 'warning', '待接单', '2026-09-08 14:54'],
  ['20260908-0406', '老北京炸酱面', '北京', '¥790.30', 'info', '配送中', '2026-09-08 14:53'], ['20260908-0405', '云南米线', '上海', '¥681.40', 'neutral', '草稿', '2026-09-08 14:52']
]

export function Orders() {
  const [status, setStatus] = React.useState('all')
  const [kw, setKw] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])
  const rows = ALL.filter((r) => (status === 'all' || r[4] === status) && (!kw || r[0].includes(kw) || r[1].includes(kw)))
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  return (
    <>
      <div className="page-head"><div><h1>单据管理</h1><p>共 128 条 · 今日新增 1,286</p></div><div className="actions"><Button variant="outline">导出</Button><Button>新建订单</Button></div></div>
      <section className="card-block">
        <div className="filter">
          <div className="conds">
            <div className="with-icon w-search"><Search className="i-icon--sm i-icon--muted" aria-hidden="true" /><Input aria-label="搜索订单号、商户或手机号" placeholder="订单号 / 商户 / 手机号" value={kw} onChange={(e) => setKw(e.target.value)} /></div>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-36" aria-label="订单状态"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="warning">待接单</SelectItem><SelectItem value="info">配送中</SelectItem><SelectItem value="success">已完成</SelectItem><SelectItem value="error">已取消</SelectItem></SelectContent></Select>
            <Select defaultValue="all"><SelectTrigger className="w-32" aria-label="城市"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部城市</SelectItem><SelectItem value="sh">上海</SelectItem><SelectItem value="bj">北京</SelectItem></SelectContent></Select>
          </div>
          <div className="acts"><Button>查询</Button><Button variant="ghost" onClick={() => { setStatus('all'); setKw('') }}>重置</Button></div>
        </div>
        {status !== 'all' && <div className="chips"><span className="chip">状态：{ALL.find((r) => r[4] === status)?.[5]} <button type="button" className="x" aria-label="移除条件 状态" onClick={() => setStatus('all')}>×</button></span></div>}
        {selected.length > 0 && <div className="batch">已选 {selected.length} 项<button className="act" type="button" onClick={() => setSelected([])}>取消选择</button><div className="right"><Button variant="outline" size="sm">批量改派</Button><Button variant="destructive" size="sm">批量取消</Button></div></div>}
        <Table>
          <TableHeader><TableRow><TableHead className="w-10"><Checkbox aria-label="选择所有行" checked={selected.length === rows.length && rows.length > 0} onCheckedChange={(v) => setSelected(v ? rows.map((r) => r[0]) : [])} /></TableHead><TableHead>订单号</TableHead><TableHead>商户</TableHead><TableHead>城市</TableHead><TableHead className="text-right">金额</TableHead><TableHead>状态</TableHead><TableHead>下单时间</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map(([no, m, c, amt, tone, st, t]) => (
              <TableRow key={no} data-state={selected.includes(no) ? 'selected' : undefined}>
                <TableCell><Checkbox aria-label="选择当前行" checked={selected.includes(no)} onCheckedChange={() => toggle(no)} /></TableCell>
                <TableCell><a className="link mono" href="#/orders">{no}</a></TableCell><TableCell>{m}</TableCell><TableCell>{c}</TableCell><TableCell className="text-right num">{amt}</TableCell><TableCell><span className={`status ${tone}`}>{st}</span></TableCell><TableCell className="num">{t}</TableCell>
                <TableCell><a className="act" href="#/orders">详情</a><button className="act" type="button">改派</button>
                  <DropdownMenu><DropdownMenuTrigger asChild><button className="act more-link" type="button" aria-label="更多操作"><MoreHorizontal className="i-icon--sm" /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>催单</DropdownMenuItem><DropdownMenuItem variant="destructive">取消订单</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <div className="empty"><b>未找到符合条件的数据</b><span>换个条件试试</span><button className="act" type="button" onClick={() => { setStatus('all'); setKw('') }}>重置筛选</button></div>}
        <div className="pager"><nav aria-label="分页" className="pages"><Button variant="ghost" size="sm" disabled>上一页</Button><span className="page is-current num" aria-current="page">1</span><button type="button" className="page num">2</button><button type="button" className="page num">3</button><Button variant="ghost" size="sm">下一页</Button></nav></div>
      </section>
    </>
  )
}
