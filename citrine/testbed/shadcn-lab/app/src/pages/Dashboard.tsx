// 工作台：统计卡 + 趋势 + 环形图 + 最近订单表——全部用配方层类与 React 版配方组件，页面本身零样式值。
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/styles/bridge/react/StatCard'
import { TrendChart } from '@/styles/bridge/react/TrendChart'
import { EChart } from '@/styles/bridge/react/EChart'
import { rankBars } from '@/styles/bridge/echarts.js'

const days = ['08/26', '08/27', '08/28', '08/29', '08/30', '08/31', '09/01', '09/02', '09/03', '09/04', '09/05', '09/06', '09/07', '09/08']
const thisWeek = [1180, 1260, 1210, 1340, 1420, 1390, 1510, 1480, 1560, 1620, 1580, 1710, 1690, 1760]
const lastWeek = [1120, 1190, 1150, 1230, 1310, 1290, 1380, 1360, 1410, 1470, 1440, 1520, 1500, 1570]
const rows = [['20260908-0412', '鲜果时光', '上海', '¥156.70', 'success', '已完成'], ['20260908-0411', '川味小馆（望京店）', '北京', '¥47.80', 'warning', '待接单'], ['20260908-0410', '晨曦烘焙', '成都', '¥1,225.90', 'info', '配送中'], ['20260908-0409', '轻食主义', '杭州', '¥1,117.00', 'error', '已取消']]

export function Dashboard() {
  return (
    <>
      <div className="page-head"><div><h1>工作台</h1><p>2026 年 9 月 8 日 星期二 · 下午好，王小明</p></div><div className="actions"><Button variant="outline">导出报表</Button><Button>发布配置</Button></div></div>
      <section className="stats">
        <StatCard label="今日订单" value="12,480" delta="+8.2%" note="较昨日" />
        <StatCard label="GMV（元）" value="¥386,210" delta="+12.4%" note="较昨日" />
        <StatCard label="待审核商户" value="47" delta="+3" note="较昨日" positive={false} />
        <StatCard label="骑手在线" value="1,032" delta="-2.1%" up={false} note="较昨日" hint="按当前在线状态统计，不含离线 5 分钟以内的骑手" />
      </section>
      <div className="two-col">
        <section className="card-block">
          <div className="card-head"><h2>订单趋势</h2><span className="sub">近 14 天 · 本周 / 上周</span></div>
          <div className="ks-body"><TrendChart days={days} series={[{ name: '本周', data: thisWeek }, { name: '上周', data: lastWeek }]} /></div>
        </section>
        <section className="card-block">
          <div className="card-head"><h2>城市 GMV 排行</h2><span className="sub">前三名纯黄，其余灰</span></div>
          <div className="ks-body"><EChart deps={[]} option={() => rankBars({ categories: ['上海', '北京', '成都', '杭州', '深圳'], values: [128400, 96500, 72300, 51800, 36900], formatter: (v: number) => `¥${v.toLocaleString('zh-CN')}` })} /></div>
        </section>
      </div>
      <section className="card-block">
        <div className="card-head"><h2>最近异常订单</h2><span className="right"><a className="go" href="#/orders">查看全部 <span aria-hidden="true">›</span></a></span></div>
        <Table>
          <TableHeader><TableRow><TableHead>订单号</TableHead><TableHead>商户</TableHead><TableHead>城市</TableHead><TableHead className="text-right">金额</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map(([no, m, c, amt, tone, st]) => <TableRow key={no}><TableCell><a className="link mono" href="#/orders">{no}</a></TableCell><TableCell>{m}</TableCell><TableCell>{c}</TableCell><TableCell className="text-right num">{amt}</TableCell><TableCell><span className={`status ${tone}`}>{st}</span></TableCell><TableCell><a className="act" href="#/orders">详情</a><button className="act" type="button">改派</button></TableCell></TableRow>)}</TableBody>
        </Table>
      </section>
    </>
  )
}
