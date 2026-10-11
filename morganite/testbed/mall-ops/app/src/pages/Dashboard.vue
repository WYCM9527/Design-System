<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Plus, Right } from '@icon-park/vue-next'
import StatCard from '@wycm9527/morganite/vue/StatCard.vue'
import TrendChart from '@wycm9527/morganite/vue/TrendChart.vue'
import EChart from '@wycm9527/morganite/vue/EChart.vue'
import TableSkeleton from '@wycm9527/morganite/vue/TableSkeleton.vue'
import { rankBars } from '@wycm9527/morganite/echarts'
import { can, needPerm, demo } from '../store'
import { trend, channelShare, topProducts, todos, goals, orders, tone, yen } from '../mock/data'

const router = useRouter()
const state = demo('state')          // ?state=loading | empty（PRD 4.2）
const loading = state === 'loading'
const empty = state === 'empty'
const period = ref('week')

const series = [{ name: '本期', data: trend.current }, { name: '上期', data: trend.previous }]
const rank = () => rankBars({ categories: topProducts.map((p) => p.name), values: topProducts.map((p) => p.sales), formatter: (v) => `${v} 件` })
const donut = (t) => ({
  tooltip: { trigger: 'item', valueFormatter: (v) => `${v}%` },
  series: [{ type: 'pie', radius: ['62%', '86%'], label: { show: false }, data: channelShare.map(([name, value], i) => ({ name, value, itemStyle: { color: t.palette[i] } })) }]
})
const recent = orders.slice(0, 6)
</script>

<template>
  <div class="page-bar">
    <span class="section-label">经营概览</span>
    <div class="right">
      <el-radio-group v-model="period" aria-label="统计周期">
        <el-radio-button value="today">今日</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
      </el-radio-group>
      <el-tooltip :disabled="can('report.export')" :content="needPerm('report.export')" placement="bottom">
        <span><el-button :icon="Download" :disabled="!can('report.export')" @click="ElMessage.success('日报已开始生成，完成后在消息中心下载')">导出日报</el-button></span>
      </el-tooltip>
      <el-tooltip :disabled="can('product.edit')" :content="needPerm('product.edit')" placement="bottom">
        <span><el-button type="primary" :icon="Plus" :disabled="!can('product.edit')" @click="router.push('/products/new')">发布商品</el-button></span>
      </el-tooltip>
    </div>
  </div>

  <div class="stats">
    <template v-if="loading"><div v-for="i in 4" :key="i" class="stat-card"><el-skeleton :rows="2" animated /></div></template>
    <template v-else-if="empty">
      <StatCard label="今日销售额" value="¥0.00" note="店铺尚未产生订单" />
      <StatCard label="订单数" value="0" note="—" />
      <StatCard label="客单价" value="—" note="有订单后计算" />
      <StatCard label="退款率" value="—" note="有订单后计算" />
    </template>
    <template v-else>
      <StatCard label="今日销售额" value="¥386,420.00" delta="+6.6%" note="较昨日" hint="已支付订单金额，含运费、不含退款" />
      <StatCard label="订单数" value="1,286" delta="+4.2%" note="较昨日" />
      <StatCard label="客单价" value="¥300.48" delta="-1.3%" :up="false" note="较昨日" />
      <StatCard label="退款率" value="2.18%" delta="-0.4%" :up="false" :positive="true" note="较上周" hint="近 7 天退款订单数 ÷ 已支付订单数" />
    </template>
  </div>

  <div class="board">
    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>销售趋势</h2><span class="sub">近 14 天 · 元</span></div>
      <div class="card-body">
        <el-skeleton v-if="loading" :rows="6" animated />
        <div v-else-if="empty" class="empty"><div class="illu" /><b>还没有销售数据</b><span>第一笔订单支付后，这里会画出每日销售额</span></div>
        <TrendChart v-else :days="trend.days" :series="series" />
      </div>
    </el-card>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>待办事项</h2><span v-if="!loading && !empty" class="badge warning num">{{ todos.length }}</span></div>
      <div class="card-body">
        <el-skeleton v-if="loading" :rows="5" animated />
        <div v-else-if="empty" class="empty"><b>暂无待办</b><span>新订单、售后与审批会出现在这里</span></div>
        <ul v-else class="todos">
          <li v-for="t in todos" :key="t.text">
            <span class="status" :class="tone(t.status)">{{ t.status }}</span>
            <router-link class="title-link" :to="t.to">{{ t.text }}</router-link>
            <span class="time num">{{ t.time }}</span>
          </li>
        </ul>
      </div>
    </el-card>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>热销商品 TOP 8</h2><span class="sub">近 30 天销量</span><div class="right"><router-link class="go" to="/products">商品管理<Right class="i-icon--sm" /></router-link></div></div>
      <div class="card-body">
        <el-skeleton v-if="loading" :rows="6" animated />
        <div v-else-if="empty" class="empty"><b>暂无销量</b></div>
        <EChart v-else :option="rank" />
      </div>
    </el-card>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>渠道占比</h2><span class="sub">本周订单</span></div>
      <div class="card-body">
        <el-skeleton v-if="loading" :rows="6" animated />
        <div v-else-if="empty" class="empty"><b>暂无订单</b></div>
        <div v-else class="alloc">
          <div class="donut"><EChart :option="donut" /><div class="donut__center"><span class="sub">本周订单</span><b class="num">8,912</b></div></div>
          <ul class="alloc-list">
            <li v-for="([name, v], i) in channelShare" :key="name"><i :class="`c${i + 1}`" /><span>{{ name }}</span><span class="pct num">{{ v }}%</span></li>
          </ul>
        </div>
      </div>
    </el-card>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>最近订单</h2><div class="right"><router-link class="go" to="/orders">查看全部<Right class="i-icon--sm" /></router-link></div></div>
      <TableSkeleton v-if="loading" :rows="6" :cols="[160, 120, 120, 100, 120]" />
      <div v-else-if="empty" class="empty"><div class="illu" /><b>还没有订单</b><span>分享店铺链接，等第一位客人下单吧</span></div>
      <el-table v-else :data="recent" row-key="id">
        <el-table-column label="订单号" min-width="170"><template #default="{ row }"><router-link class="link mono" :to="`/orders/${row.id}`">{{ row.id }}</router-link></template></el-table-column>
        <el-table-column prop="customer" label="客户" min-width="90" />
        <el-table-column label="渠道" width="80"><template #default="{ row }"><span class="tag">{{ row.channel }}</span></template></el-table-column>
        <el-table-column label="实付" min-width="110" align="right" class-name="num"><template #default="{ row }">{{ yen(row.amount) }}</template></el-table-column>
        <el-table-column label="状态" width="96"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      </el-table>
    </el-card>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>本月目标</h2></div>
      <div class="card-body">
        <el-skeleton v-if="loading" :rows="4" animated />
        <ul v-else class="goals">
          <li v-for="g in goals" :key="g.label">
            <div class="top"><span>{{ g.label }}</span><b class="num">{{ empty ? 0 : g.value }}%</b></div>
            <el-progress :percentage="empty ? 0 : g.value" :show-text="false" :class="{ 'is-muted': g.neutral }" />
            <span class="sub">{{ empty ? '本月尚无数据' : g.note }}</span>
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 工作台自有的组合（只用 token）：待办列表、环形图与图例的排布。占比列表、目标列表、分类色 .c1–.c6 来自配方 */
.todos { list-style: none; margin: 0; padding: 0; display: grid; }
.todos li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--spacing-3); padding: var(--spacing-2-5) 0; border-top: var(--border-width-default) solid var(--color-border-default); font-size: var(--text-body-sm-size); }
.todos li:first-child { border-top: 0; padding-top: 0; }
.todos .title-link { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.todos .time { color: var(--color-text-muted); font-size: var(--text-small-size); }
.alloc { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--spacing-6); align-items: center; }
.donut { position: relative; }
.donut__center { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; pointer-events: none; }
.donut__center b { font-family: var(--text-display-family); font-size: var(--text-title-size); font-weight: var(--text-weight-strong); }
@media (max-width: 768px) {
  .alloc { grid-template-columns: minmax(0, 1fr); }
}
</style>
