// 组件走查页模板（shadcn/ui 项目）：核心组件的静息 / 选中 / 禁用 / 出错状态铺在一页，配方层公共类同页对照，供 citrine-accept components 做 hover / focus 走查。
// 用法：拷进项目（如 src/pages/KitchenSink.tsx），挂到 /kitchen 路由，accept.config.mjs 的 KITCHEN 填 '#/kitchen'。它 import 项目里的 shadcn 组件（默认别名 @/components/ui/*，
// 按项目实际调整）与包里的配方组件。浮层触发器带 data-ks-open（走查脚本逐个点开），弹层触发器带 data-ks-modal；每个 <section class="ks" data-ks="…"> 是一组（≥ 10 组走查脚本才认为页面就绪）。
import * as React from 'react'
import { Info, MoreHorizontal, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { StatCard } from '@wycm9527/citrine/react/StatCard'
import { TableSkeleton } from '@wycm9527/citrine/react/TableSkeleton'

function Sec({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="ks card-block" data-ks={id}>
      <div className="card-head"><h2>{title}</h2></div>
      <div className="ks-body">{children}</div>
    </section>
  )
}

export function KitchenSink() {
  const [checked, setChecked] = React.useState(true)
  return (
    <>
      <div className="page-head"><div><h1>组件走查</h1><p>shadcn/ui 核心组件 × Citrine 桥接 · 亮 / 暗两种模式下强制 hover / focus 扫描</p></div></div>

      <Sec id="buttons" title="按钮">
        <div className="row">
          <Button>主操作</Button><Button variant="secondary">次要</Button><Button variant="outline">描边</Button><Button variant="ghost">quiet</Button><Button variant="destructive">删除</Button>
          <Button disabled>禁用</Button><Button size="sm">小号</Button><Button size="lg">大号</Button><Button size="icon" aria-label="更多"><MoreHorizontal /></Button><Button><Plus />带图标</Button>
        </div>
      </Sec>

      <Sec id="badges" title="徽标与状态胶囊">
        <div className="row">
          <Badge variant="secondary">次要</Badge><Badge variant="outline">描边</Badge><Badge variant="destructive">危险</Badge>
          <span className="status success">已完成</span><span className="status warning">待审批</span><span className="status error">已取消</span><span className="status info">采购中</span><span className="status neutral">草稿</span><span className="badge brand">管理员</span>
        </div>
      </Sec>

      <Sec id="inputs" title="输入">
        <div className="grid2">
          <div className="field"><Label htmlFor="k-name">名称</Label><Input id="k-name" placeholder="请输入供应商名称" /></div>
          <div className="field"><Label htmlFor="k-search">搜索</Label><div className="with-icon"><Search className="i-icon--sm i-icon--muted" aria-hidden="true" /><Input id="k-search" placeholder="申请编号 / 供应商 / 申请人" /></div></div>
          <div className="field"><Label htmlFor="k-disabled">禁用</Label><Input id="k-disabled" disabled value="不可编辑" readOnly /></div>
          <div className="field"><Label htmlFor="k-invalid">出错</Label><Input id="k-invalid" aria-invalid defaultValue="abc" /><span className="help err">请输入 11 位手机号</span></div>
          <div className="field span2"><Label htmlFor="k-textarea">备注</Label><Textarea id="k-textarea" placeholder="选填，最多 300 字" /></div>
        </div>
      </Sec>

      <Sec id="choices" title="勾选 / 开关 / 单选">
        <div className="row">
          <label className="inline"><Checkbox defaultChecked aria-label="已勾选" /> 已勾选</label>
          <label className="inline"><Checkbox aria-label="未勾选" /> 未勾选</label>
          <label className="inline"><Checkbox disabled aria-label="禁用" /> 禁用</label>
          <label className="inline"><Switch checked={checked} onCheckedChange={setChecked} aria-label="开关" /> 开关</label>
          <label className="inline"><Switch disabled aria-label="禁用开关" /> 禁用</label>
          <RadioGroup defaultValue="a" className="inline-radios" aria-label="优先级">
            <label className="inline"><RadioGroupItem value="a" id="r-a" /> 普通</label>
            <label className="inline"><RadioGroupItem value="b" id="r-b" /> 紧急</label>
          </RadioGroup>
        </div>
      </Sec>

      <Sec id="select" title="下拉选择">
        <div className="row">
          <Select defaultValue="all">
            <SelectTrigger className="w-44" aria-label="申请状态" data-ks-open data-ks-type="select"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="pending">待审批</SelectItem><SelectItem value="done">已完成</SelectItem><SelectItem value="cancel" disabled>已取消</SelectItem></SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" data-ks-open data-ks-type="dropdown">更多操作</Button></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuLabel>申请</DropdownMenuLabel><DropdownMenuItem>转交</DropdownMenuItem><DropdownMenuItem>催办</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">撤回申请</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" data-ks-open data-ks-type="popover">口径说明</Button></PopoverTrigger>
            <PopoverContent><p className="text-sm">报表按提交日期范围统计；工作台按通过时间统计，两者口径不同。</p></PopoverContent>
          </Popover>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="说明"><Info /></Button></TooltipTrigger><TooltipContent>悬停提示</TooltipContent></Tooltip>
        </div>
      </Sec>

      <Sec id="tabs" title="标签页">
        <Tabs defaultValue="overview">
          <TabsList><TabsTrigger value="overview">概览</TabsTrigger><TabsTrigger value="logs">日志</TabsTrigger><TabsTrigger value="settle" disabled>结算</TabsTrigger></TabsList>
          <TabsContent value="overview"><p className="muted">概览内容</p></TabsContent>
          <TabsContent value="logs"><p className="muted">日志内容</p></TabsContent>
        </Tabs>
      </Sec>

      <Sec id="table" title="表格（shadcn Table + 配方层胶囊）">
        <Table>
          <TableHeader><TableRow><TableHead>申请编号</TableHead><TableHead>供应商</TableHead><TableHead className="text-right">金额</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
          <TableBody>
            {[['CG-20260908-0412', '蓝海电子', '¥156.70', 'success', '已完成'], ['CG-20260908-0411', '云帆物流', '¥47.80', 'warning', '待审批'], ['CG-20260908-0410', '恒信办公', '¥1,225.90', 'error', '已取消']].map(([no, m, amt, tone, st]) => (
              <TableRow key={no}><TableCell><a className="link mono" href="#/orders">{no}</a></TableCell><TableCell>{m}</TableCell><TableCell className="text-right num">{amt}</TableCell><TableCell><span className={`status ${tone}`}>{st}</span></TableCell><TableCell><a className="act" href="#/orders">详情</a><button className="act" type="button">转交</button><button className="act danger" type="button">取消</button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Sec>

      <Sec id="overlays" title="弹窗 / 确认">
        <div className="row">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" data-ks-modal="dialog">打开弹窗</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>转交申请</DialogTitle><DialogDescription>选择一名审批人接手该申请。</DialogDescription></DialogHeader>
              <div className="field"><Label htmlFor="d-rider">审批人</Label><Input id="d-rider" placeholder="搜索成员" /></div>
              <DialogFooter><DialogClose asChild><Button variant="outline">取消</Button></DialogClose><Button>确认转交</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" data-ks-modal="alert">删除供应商</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>确认删除「恒信办公」？</AlertDialogTitle><AlertDialogDescription>删除后不可恢复，历史申请仍会保留。</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Sec>

      <Sec id="feedback" title="提示 / 进度 / 骨架">
        <div className="stack">
          <Alert><Info /><AlertTitle>今日有 7 家供应商资质即将过期</AlertTitle><AlertDescription>请在到期前完成复审。</AlertDescription></Alert>
          <Alert variant="destructive"><Info /><AlertTitle>提交失败</AlertTitle><AlertDescription>网络超时，请重试。</AlertDescription></Alert>
          <Progress value={62} aria-label="进度 62%" />
          <div className="row"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="size-9 rounded-full" /></div>
          <TableSkeleton rows={2} cols={[160, 120, 100]} />
        </div>
      </Sec>

      <Sec id="cards" title="卡片与统计卡">
        <div className="stats">
          <StatCard label="本月申请" value="12,480" delta="+8.2%" note="较昨日" />
          <StatCard label="取消率" value="1.8%" delta="-0.4%" up={false} positive hint="按下单时间统计" />
          <StatCard label="GMV（元）" value="¥386,210" />
          <Card><CardHeader><CardTitle>shadcn Card</CardTitle><CardDescription>卡片描述文字</CardDescription></CardHeader><CardContent><p className="text-sm">卡片内容。</p></CardContent></Card>
        </div>
        <Separator className="my-4" />
        <div className="row">
          <span className="chip">状态：待审批 <button type="button" className="x" aria-label="移除条件 状态">×</button></span>
          <a className="go" href="#/orders">查看全部 <span aria-hidden="true">›</span></a>
        </div>
      </Sec>

      <Sec id="recipes-form" title="配方层表单页脚">
        <div className="form-foot"><Button variant="ghost">取消</Button><Button variant="outline">保存草稿</Button><Button>提交申请</Button></div>
      </Sec>
    </>
  )
}
