<script setup>
import { ref } from 'vue'
import { Export } from '@icon-park/vue-next'
import { analytics, yen } from '../mock/data'
import { can } from '../store'
import EChart from '../components/EChart.vue'
import StatCard from '../components/StatCard.vue'

const range = ref('7d'); const city = ref('all'); const tab = ref(new URLSearchParams(location.search).get('tab') === 'settlement' && can('finance.view') ? 'settlement' : 'overview')
// up 决定箭头方向，positive 决定颜色：取消率下降是好事，箭头向下但用"涨"的绿色
const stats = [
  { label: '订单量', value: '38,214', delta: '+6.8%', up: true, positive: true },
  { label: 'GMV（元）', value: '¥ 4,081,600', delta: '+9.1%', up: true, positive: true },
  { label: '客单价', value: '¥ 106.8', delta: '-1.2%', up: false, positive: false },
  { label: '取消率', value: '2.4%', delta: '-0.3 pt', up: false, positive: true }
]
const axis = (t) => ({ axisLine: { lineStyle: { color: t.line } }, axisTick: { show: false }, axisLabel: { color: t.muted, fontSize: t.font }, splitLine: { lineStyle: { color: t.line } } })

const lineOption = (t) => ({
  grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
  legend: { top: 0, right: 0 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: analytics.days, boundaryGap: false, ...axis(t), splitLine: { show: false } },
  yAxis: { type: 'value', scale: true, splitNumber: 4, ...axis(t), axisLine: { show: false } },   /* 趋势对比：y 轴贴数据范围，不强制从 0 */
  series: analytics.cityLines.map((s) => ({ ...s, type: 'line' }))   /* 平滑、数据点、线宽走桥接主题 */
})
const pieOption = (t) => ({
  legend: { orient: 'vertical', right: 0, top: 'middle' },
  tooltip: { trigger: 'item', formatter: '{b}：{c}%' },
  series: [{ type: 'pie', radius: ['52%', '78%'], center: ['36%', '50%'], data: analytics.categories, label: { show: false }, itemStyle: { borderColor: t.surface, borderWidth: 2 } }]
})
const barOption = (t) => ({
  grid: { left: 8, right: 48, top: 8, bottom: 0, containLabel: true },
  legend: false,
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => yen(v) },
  xAxis: { type: 'value', ...axis(t), axisLine: { show: false }, axisLabel: { show: false }, splitLine: { show: false } },
  yAxis: { type: 'category', inverse: true, data: analytics.ranking.map((r) => r.name), ...axis(t), axisLine: { show: false }, axisLabel: { color: t.text, width: 120, overflow: 'truncate' } },
  series: [{ type: 'bar', data: analytics.ranking.map((r, i) => ({ value: r.gmv, itemStyle: { color: i < 3 ? t.sequential[4] : t.sequential[1] } })),  /* 前三名纯黄，其余暖灰 */ barWidth: 12, itemStyle: { borderRadius: 3 }, label: { show: true, position: 'right', color: t.text, fontSize: t.font, formatter: (p) => yen(p.value) } }]
})
const heatOption = (t) => ({
  grid: { left: 8, right: 8, top: 8, bottom: 0, containLabel: true },
  legend: false,
  tooltip: { formatter: (p) => `周${'一二三四五六日'[p.value[1]]} ${p.value[0]}:00 · ${p.value[2]} 单` },
  xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, h) => `${h}`), ...axis(t), axisLine: { show: false }, splitLine: { show: false } },
  yAxis: { type: 'category', data: ['一', '二', '三', '四', '五', '六', '日'], ...axis(t), axisLine: { show: false }, splitLine: { show: false } },
  // 离散分段：灰阶四档 + 纯黄封顶。不能用连续插值——灰到黄的中间值是橄榄色
  visualMap: { show: false, type: 'piecewise', min: 0, max: 130, splitNumber: 5, inRange: { color: t.sequential } },
  series: [{ type: 'heatmap', data: analytics.heat.flatMap((row, d) => row.map((v, h) => [h, d, v])), itemStyle: { borderColor: t.surface, borderWidth: 2, borderRadius: 2 } }]
})
const total = analytics.settlement.reduce((a, r) => ({ orders: a.orders + r.orders, gmv: a.gmv + r.gmv, fee: a.fee + r.fee, refund: a.refund + r.refund }), { orders: 0, gmv: 0, fee: 0, refund: 0 })
const summary = ({ columns }) => columns.map((c, i) => i === 0 ? '合计' : c.property === 'orders' ? total.orders.toLocaleString('zh-CN') : c.property ? yen(total[c.property]) : '')
</script>

<template>
  <div class="page-head">
    <div><h1>数据看板</h1><p>近 7 天 · 全部城市 · 数据截至 <span class="num">2026-09-08 14:00</span></p></div>
    <div class="actions">
      <el-radio-group v-model="range"><el-radio-button value="7d">近 7 天</el-radio-button><el-radio-button value="30d">近 30 天</el-radio-button><el-radio-button value="custom">自定义</el-radio-button></el-radio-group>
      <el-date-picker v-if="range === 'custom'" type="daterange" range-separator="→" style="width: 240px" />
      <el-select v-model="city" aria-label="城市" style="width: 130px"><el-option label="全部城市" value="all" /><el-option v-for="c in ['北京', '上海', '广州', '深圳', '杭州', '成都']" :key="c" :label="c" :value="c" /></el-select>
      <el-button><Export class="i-icon--sm" />导出</el-button>
    </div>
  </div>

  <el-tabs v-model="tab" class="board-tabs">
    <el-tab-pane label="经营" name="overview">
      <section class="stats">
        <StatCard v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" :delta="s.delta" :up="s.up" :positive="s.positive" note="较上周" />
      </section>
      <div class="grid2">
        <el-card class="flat" shadow="always"><div class="card-head"><h2>订单量 · 按城市</h2><span class="badge neutral">chart.1–3</span></div><div class="body"><EChart :option="lineOption" /></div></el-card>
        <el-card class="flat" shadow="always"><div class="card-head"><h2>品类占比</h2><span class="badge neutral">chart.1–6</span></div><div class="body"><EChart :option="pieOption" /></div></el-card>
      </div>
      <div class="grid2 even">
        <el-card class="flat" shadow="always"><div class="card-head"><h2>商户 GMV 排行 · 前 10</h2><span class="badge neutral">sequential</span></div><div class="body"><EChart :option="barOption" class="tall" /></div></el-card>
        <el-card class="flat" shadow="always"><div class="card-head"><h2>下单时段热力 · 7 天 × 24 小时</h2><span class="badge neutral">sequential 1–5</span></div><div class="body"><EChart :option="heatOption" class="tall" /></div></el-card>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="can('finance.view')" label="结算" name="settlement">
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>城市结算 · 9 月 1 日至 8 日</h2><div class="right"><el-button size="small"><Export class="i-icon--sm" />导出结算单</el-button></div></div>
        <el-table :data="analytics.settlement" show-summary :summary-method="summary" style="width: 100%">
          <el-table-column prop="city" label="城市" width="120" />
          <el-table-column prop="orders" label="订单数" align="right"><template #default="{ row }"><span class="num">{{ row.orders.toLocaleString('zh-CN') }}</span></template></el-table-column>
          <el-table-column prop="gmv" label="GMV" align="right"><template #default="{ row }"><span class="num">{{ yen(row.gmv) }}</span></template></el-table-column>
          <el-table-column prop="fee" label="平台服务费" align="right"><template #default="{ row }"><span class="num">{{ yen(row.fee) }}</span></template></el-table-column>
          <el-table-column prop="refund" label="退款" align="right"><template #default="{ row }"><span class="num">{{ yen(row.refund) }}</span></template></el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
/* 板块间距挂在 tab-pane 上：el-tabs__content 的直接子元素是 pane，不是板块，挂在 content 上 gap 不会落到板块之间 */
.board-tabs :deep(.el-tab-pane) { display: flex; flex-direction: column; gap: var(--space-stack); }
.grid2 { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-stack); align-items: start; }
.grid2.even { grid-template-columns: 1fr 1fr; }
.body { padding: var(--spacing-4) var(--space-card) var(--spacing-3); }
</style>
