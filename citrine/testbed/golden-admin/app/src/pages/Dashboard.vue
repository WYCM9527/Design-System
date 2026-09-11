<script setup>
import { ref } from 'vue'
import { Right, Attention } from '@icon-park/vue-next'
import { orders, todos, trend, tone, yen } from '../mock/data'
import TrendChart from '../components/TrendChart.vue'
import StatCard from '../components/StatCard.vue'

const q = new URLSearchParams(location.search)
const loading = ref(q.get('state') === 'loading')   // ?state=loading 截图表骨架
const emptyTodos = q.get('state') === 'empty'        // ?state=empty 截待办空态
const showTip = ref(true)
const stats = [
  { label: '今日订单', value: '12,480', delta: '+8.2%', up: true },
  { label: 'GMV（元）', value: '¥ 386,210', delta: '+12.4%', up: true },
  { label: '待审核商户', value: '47', delta: '-3 家', up: false, note: '需在 24h 内处理' },
  { label: '骑手在线', value: '1,032', delta: '+2.1%', up: true, note: '高峰期覆盖率 96%' }
]
const recent = orders.filter((o) => o.status === '待接单' || o.status === '已取消').slice(0, 5)
</script>

<template>
  <div class="page-head">
    <div><h1>工作台</h1><p>2026 年 9 月 8 日 星期二 · 下午好，王小明</p></div>
    <div class="actions"><el-button>导出报表</el-button><el-button type="primary">发布配置</el-button></div>
  </div>

  <div v-if="showTip" class="tip">
    <Attention class="i-icon--md" />
    <span><b>3 个商户资质将在 7 天内过期</b>，请及时通知商户更新证照。</span>
    <router-link class="link" to="/merchants">查看列表 →</router-link>
    <button class="tip-x" @click="showTip = false" aria-label="关闭">×</button>
  </div>

  <section class="stats">
    <StatCard v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" :delta="s.delta" :up="s.up" :note="s.note || '较昨日'" />
  </section>

  <div class="grid2">
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>订单趋势</h2><el-tag size="small" type="info">近 14 天</el-tag><div class="right"><span class="badge success">实时</span></div></div>
      <div class="chart-wrap">
        <el-skeleton v-if="loading" animated :rows="5" />
        <TrendChart v-else :days="trend.days" :series="[{ name: '本周', data: trend.thisWeek }, { name: '上周', data: trend.lastWeek }]" />
      </div>
    </el-card>
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>待办</h2><span class="badge warning">{{ emptyTodos ? 0 : todos.length }}</span></div>
      <div v-if="emptyTodos" class="empty"><div class="illu"><span class="illu-mark"></span></div><b>今天没有待办</b><span>新的审核与异常会出现在这里</span></div>
      <ul v-else class="todos">
        <li v-for="t in todos" :key="t.text">
          <span class="status" :class="tone(t.status)">{{ t.status }}</span>
          <router-link class="todo-text" :to="t.to">{{ t.text }}</router-link>
          <span class="time num">{{ t.time }}</span>
          <router-link :to="t.to" class="go" aria-label="查看"><Right class="i-icon--sm" /></router-link>
        </li>
      </ul>
    </el-card>
  </div>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>最近异常订单</h2><div class="right"><router-link class="link" to="/orders">查看全部</router-link></div></div>
    <el-table :data="recent" style="width: 100%">
      <el-table-column label="订单号" min-width="200"><template #default="{ row }"><router-link class="mono link" :to="`/orders/${row.id}`">{{ row.id }}</router-link><span class="sub">{{ row.time }}</span></template></el-table-column>
      <el-table-column prop="merchant" label="商户" min-width="180" />
      <el-table-column label="状态" width="120"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="金额" width="140" align="right"><template #default="{ row }"><span class="num">{{ yen(row.amount) }}</span></template></el-table-column>
      <el-table-column label="操作" width="140"><template #default="{ row }"><router-link class="link" :to="`/orders/${row.id}`">详情</router-link> · <a class="link">催单</a></template></el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.tip { display: flex; align-items: center; gap: var(--spacing-2-5); padding: var(--spacing-2-5) var(--spacing-3-5); border-radius: var(--radius-md); background: var(--color-status-warning-bg); color: var(--color-status-warning); font-size: var(--text-body-sm-size); }
.tip .link { margin-left: auto; white-space: nowrap; }
.tip-x { border: 0; background: transparent; color: inherit; cursor: pointer; font-size: var(--text-title-size); line-height: 1; padding: 0; min-width: var(--control-hit-min); min-height: var(--control-hit-min); display: inline-grid; place-items: center; border-radius: var(--radius-sm); opacity: var(--opacity-on-primary-muted); }
.grid2 { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-stack); align-items: start; }
.chart-wrap { padding: var(--spacing-4) var(--space-card) var(--spacing-3); }
.todos { list-style: none; margin: 0; padding: var(--spacing-2) 0; }
.todos li { display: flex; align-items: center; gap: var(--spacing-3); padding: var(--spacing-3) var(--space-card); border-bottom: var(--border-width-default) solid var(--color-border-default); font-size: var(--text-body-sm-size); }
.todos li:last-child { border-bottom: 0; }
.todos .status { flex: none; }
.todo-text { flex: 1; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.todo-text:hover { color: var(--color-text-link-hover); text-decoration: var(--text-link-decoration); }
.todos .time { color: var(--color-text-muted); font-size: var(--text-small-size); }
.todos .go { color: var(--color-icon-muted); display: inline-grid; place-items: center; min-width: var(--control-hit-min); min-height: var(--control-hit-min); }
.illu-mark { width: var(--icon-size-2xl); height: var(--icon-size-2xl); border-radius: var(--radius-sm); background: var(--color-bg-selected); display: block; }
</style>
