<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@icon-park/vue-next'
import PageHeader from '@wycm9527/morganite/vue/PageHeader.vue'
import EChart from '@wycm9527/morganite/vue/EChart.vue'
import StatCard from '@wycm9527/morganite/vue/StatCard.vue'
import { trendLine, barGradient } from '@wycm9527/morganite/echarts'
import { can, needPerm, demo } from '../store'
import { analytics, settlement, yen, int } from '../mock/data'

const tab = ref(demo('tab') === 'settlement' && can('finance.view') ? 'settlement' : 'sales')   // ?tab=settlement（无「查看结算」权限时不出现）
const range = ref(['2026-09-10', '2026-10-09'])
const grain = ref('day')
const wan = (v) => `${(v / 10000).toFixed(1)} 万`

const channelTrend = () => trendLine({ days: analytics.days, series: analytics.channels.map(([name, data]) => ({ name, data })) })
const categoryBars = (t) => ({
  grid: { left: 8, right: 8, top: 16, bottom: 0, containLabel: true },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => yen(v) },
  xAxis: { type: 'category', data: analytics.categories.map(([n]) => n) },
  yAxis: { type: 'value', min: 0, axisLabel: { formatter: wan } },
  series: [{ type: 'bar', data: analytics.categories.map(([, v]) => v), itemStyle: { color: barGradient(t.palette[0]) } }]
})
const weeks = ['第 37 周', '第 38 周', '第 39 周', '第 40 周', '第 41 周']
const customerMix = (t) => ({
  grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
  legend: { top: 0, right: 0 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: { type: 'category', data: weeks },
  yAxis: { type: 'value', min: 0 },
  series: [
    { name: '新客', type: 'bar', stack: 'c', data: [420, 512, 468, 601, 655], itemStyle: { color: barGradient(t.palette[0]) } },
    { name: '老客', type: 'bar', stack: 'c', data: [1380, 1422, 1510, 1602, 1720], itemStyle: { color: barGradient(t.palette[1]) } }
  ]
})
const hours = Array.from({ length: 24 }, (_, h) => `${h}`)
const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const heat = (t) => ({
  grid: { left: 8, right: 8, top: 8, bottom: 40, containLabel: true },
  tooltip: { position: 'top', formatter: (p) => `${days[p.value[1]]} ${p.value[0]}:00 · ${p.value[2]} 单` },
  xAxis: { type: 'category', data: hours, splitArea: { show: false } },
  yAxis: { type: 'category', data: days },
  visualMap: { min: 0, max: 24, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 10, itemHeight: 120, inRange: { color: t.sequential }, textStyle: { color: t.text } },
  series: [{ type: 'heatmap', data: analytics.heat.flatMap((row, d) => row.map((v, h) => [h, d, v])), itemStyle: { borderColor: t.surface, borderWidth: 2, borderRadius: 2 } }]
})
const payMix = (t) => ({
  tooltip: { trigger: 'item', valueFormatter: (v) => `${v}%` },
  legend: { orient: 'vertical', right: 0, top: 'middle' },
  series: [{ type: 'pie', radius: ['55%', '80%'], center: ['35%', '50%'], label: { show: false }, data: [['微信支付', 46], ['支付宝', 34], ['云闪付', 8], ['花呗分期', 12]].map(([name, value], i) => ({ name, value, itemStyle: { color: t.palette[i] } })) }]
})
const total = settlement.reduce((s, r) => ({ orders: s.orders + r.orders, gmv: s.gmv + r.gmv, refund: s.refund + r.refund, fee: s.fee + r.fee, net: s.net + r.net }), { orders: 0, gmv: 0, refund: 0, fee: 0, net: 0 })
const summary = ({ columns }) => columns.map((col, i) => (i === 0 ? '合计' : col.property === 'orders' ? int(total.orders) : col.property ? yen(total[col.property]) : ''))
</script>

<template>
  <!-- 统计区间、粒度、导出都作用于整页（两个标签共用），所以放在页头右侧；没有副标题 -->
  <PageHeader title="数据报表">
    <template #actions>
      <el-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始" end-placeholder="结束" aria-label="统计区间" class="w-date" />
      <el-segmented v-model="grain" :options="[{ label: '日', value: 'day' }, { label: '周', value: 'week' }, { label: '月', value: 'month' }]" aria-label="粒度" />
      <el-tooltip :disabled="can('report.export')" :content="needPerm('report.export')"><span><el-button :icon="Download" :disabled="!can('report.export')" @click="ElMessage.success('报表已开始导出')">导出</el-button></span></el-tooltip>
    </template>
  </PageHeader>

  <!-- 页面级标签只切换下方内容（pane 留空）；没有「查看结算」权限时只剩一个标签，整个标签栏不显示 -->
  <el-tabs v-if="can('finance.view')" v-model="tab">
    <el-tab-pane label="销售分析" name="sales" />
    <el-tab-pane label="渠道结算" name="settlement" />
  </el-tabs>

  <template v-if="tab === 'sales'">
    <div class="board">
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>渠道销售趋势</h2><span class="sub">元 · 近 30 天</span></div>
        <div class="card-body"><EChart :option="channelTrend" /></div>
      </el-card>
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>支付方式</h2><span class="sub">订单占比</span></div>
        <div class="card-body"><EChart :option="payMix" /></div>
      </el-card>
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>下单时段</h2><span class="sub">近 4 周平均单量</span></div>
        <div class="card-body"><EChart :option="heat" class="tall" /></div>
      </el-card>
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>类目销售额</h2></div>
        <div class="card-body"><EChart :option="categoryBars" /></div>
      </el-card>
    </div>
    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>新老客构成</h2><span class="sub">按周 · 下单人数</span></div>
      <div class="card-body"><EChart :option="customerMix" /></div>
    </el-card>
  </template>

  <template v-else>
    <div class="stats">
      <StatCard label="结算 GMV" :value="yen(total.gmv)" delta="+8.1%" note="较上期" />
      <StatCard label="退款" :value="yen(total.refund)" delta="-2.4%" :up="false" :positive="true" note="较上期" />
      <StatCard label="平台费" :value="yen(total.fee)" note="天猫 5%、抖音 5%、自营 1.5%" />
      <StatCard label="净收入" :value="yen(total.net)" delta="+9.0%" note="较上期" hint="GMV − 退款 − 平台费" />
    </div>
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>渠道结算明细</h2><span class="sub">2026-09-10 ~ 2026-10-09</span></div>
      <el-table :data="settlement" show-summary :summary-method="summary">
        <el-table-column prop="channel" label="渠道" min-width="120" />
        <el-table-column prop="orders" label="订单数" width="110" align="right" class-name="num"><template #default="{ row }">{{ int(row.orders) }}</template></el-table-column>
        <el-table-column prop="gmv" label="GMV" min-width="140" align="right" class-name="num"><template #default="{ row }">{{ yen(row.gmv) }}</template></el-table-column>
        <el-table-column prop="refund" label="退款" min-width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.refund) }}</template></el-table-column>
        <el-table-column prop="fee" label="平台费" min-width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.fee) }}</template></el-table-column>
        <el-table-column prop="net" label="净收入" min-width="140" align="right" class-name="num"><template #default="{ row }">{{ yen(row.net) }}</template></el-table-column>
      </el-table>
    </el-card>
  </template>
</template>

