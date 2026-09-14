<script setup>
// 工作台（PRD P01）：欢迎区 → 四个指标卡（可点击进入带条件的列表）→ 两个图表 → 我的最近申请 → 待我审批（仅审批人）。
// 指标、图表、表格都由 api.js 的同一套数据算出，没有单独编写的展示数字。
// 演示参数：?state=empty 按空数据渲染，?state=loading 停留在骨架；api 的工作台函数是同步的，首屏用 200ms 模拟一次加载让骨架可见（PRD §6.5）。
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Right, Plus, ChartLine, PieOne, Order, Audit } from '@icon-park/vue-next'
import { today } from '../data/db'
import { user, userDept, roleLabel, can, demoState } from '../data/session'
import { money, timeOf, weekday } from '../data/format'
import { APP_STATUS, PRIORITY } from '../data/constants'
import { myStats, myWeeklyTrend, myStatusDistribution, myRecentApps, pendingForMe, pendingCount } from '../data/api'
import StatCard from '@wycm9527/citrine/vue/StatCard.vue'
import EChart from '@wycm9527/citrine/vue/EChart.vue'
import TrendChart from '@wycm9527/citrine/vue/TrendChart.vue'
import TableSkeleton from '@wycm9527/citrine/vue/TableSkeleton.vue'

const router = useRouter()
const state = demoState()
const isEmpty = state === 'empty'
const loading = ref(true)
const date = today()
const month = date.slice(0, 7)
const isApprover = can('approve')

// 指标卡：数据来自 myStats()；空态演示时全部为零值（PRD：无数据时显示零值和引导）
const stats = computed(() => (isEmpty ? { total: 0, pending: 0, approvedAmount: 0, assets: 0 } : myStats()))
const cards = computed(() => [
  { label: '我的申请总数', value: stats.value.total, to: { path: '/applications', query: { mine: 1 } }, hint: '含草稿。点击进入本人申请列表' },
  { label: '我的待审批申请', value: stats.value.pending, to: { path: '/applications', query: { mine: 1, status: 'pending' } }, hint: '点击进入本人待审批申请列表' },
  { label: '我的本月获批金额', value: money(stats.value.approvedAmount), to: { path: '/applications', query: { mine: 1, approvedMonth: month } }, hint: `按审批通过时间统计 ${month} 获批的申请（与报表按提交日期统计的口径不同）。点击进入本人本月获批列表` },
  { label: '我的在用资产', value: stats.value.assets, to: { path: '/assets', query: { mine: 1 } }, hint: '按当前使用人统计。点击进入本人在用资产列表' }
])

// 近 6 周提交趋势（按提交时间）与状态分布（含草稿）：全部为 0 时不画虚构趋势，显示空态 + 引导
const trend = computed(() => myWeeklyTrend())
const trendDays = computed(() => trend.value.map((w) => w.label))
const trendSeries = computed(() => [{ name: '提交数量', data: trend.value.map((w) => w.count) }])
const hasTrend = computed(() => !isEmpty && trend.value.some((w) => w.count > 0))
// 趋势直接用配方组件 TrendChart：计数型数据自动从 0 起、整数刻度（桥接 trendLine 的 count 判断）
const dist = computed(() => myStatusDistribution())
const hasDist = computed(() => !isEmpty && dist.value.some((d) => d.value > 0))
// 环形图只写数据与布局（图例在右侧竖排、每项带数量），颜色来自桥接主题
const pieOption = () => ({
  legend: { orient: 'vertical', right: 0, top: 'middle', formatter: (name) => `${name}  ${dist.value.find((d) => d.name === name)?.value ?? 0}` },
  tooltip: { trigger: 'item', formatter: '{b}：{c} 张（{d}%）' },
  series: [{ type: 'pie', radius: ['52%', '78%'], center: ['36%', '50%'], data: dist.value.map((d) => ({ name: d.name, value: d.value })), label: { show: false } }]
})

const recent = computed(() => (isEmpty ? [] : myRecentApps(5)))
const pending = computed(() => (isEmpty || !isApprover ? [] : pendingForMe(5)))
const pendingTotal = computed(() => (isEmpty ? 0 : pendingCount()))

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 200))
  if (state !== 'loading') loading.value = false
})
</script>

<template>
  <div class="page-head">
    <div>
      <h1>你好，{{ user.name }}</h1>
      <p>{{ userDept }} · {{ roleLabel }} · 演示基准日 <span class="num">{{ date }}</span>（星期{{ weekday(date) }}）</p>
    </div>
    <div class="actions"><el-button type="primary" @click="router.push('/applications/new')"><Plus class="i-icon--sm" />新建采购申请</el-button></div>
  </div>

  <!-- 指标卡：StatCard 本身不带点击，用 <a>（router-link）包裹——原生可聚焦、Enter 触发；焦点环与 hover 见样式 -->
  <section class="stats" aria-label="我的指标">
    <template v-if="loading">
      <el-card v-for="i in 4" :key="i" class="stat-skel" shadow="always" aria-hidden="true"><el-skeleton animated :rows="1" /></el-card>
    </template>
    <template v-else>
      <router-link v-for="c in cards" :key="c.label" class="stat-link" :to="c.to" :title="c.hint">
        <StatCard :label="c.label" :value="c.value" />
      </router-link>
    </template>
  </section>

  <div class="grid2">
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>近 6 周提交趋势</h2><span class="sub">按提交时间统计</span></div>
      <div class="chart-wrap">
        <el-skeleton v-if="loading" animated :rows="5" />
        <TrendChart v-else-if="hasTrend" :days="trendDays" :series="trendSeries" />
        <div v-else class="empty chart-empty">
          <div class="illu"><ChartLine class="illu-icon" /></div>
          <b>暂无提交记录</b><span>提交采购申请后，这里会显示近 6 周每周的提交数量</span>
          <router-link class="go" to="/applications/new">新建采购申请<Right class="i-icon--sm" /></router-link>
        </div>
      </div>
    </el-card>
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>申请状态分布</h2><span class="sub">本人全部申请，含草稿</span></div>
      <div class="chart-wrap">
        <el-skeleton v-if="loading" animated :rows="5" />
        <EChart v-else-if="hasDist" :option="pieOption" />
        <div v-else class="empty chart-empty">
          <div class="illu"><PieOne class="illu-icon" /></div>
          <b>暂无申请</b><span>创建申请后，这里会显示草稿、待审批、已通过、已驳回的数量分布</span>
        </div>
      </div>
    </el-card>
  </div>

  <el-card class="flat" shadow="always">
    <div class="card-head">
      <h2>我的最近申请</h2><span class="sub">最多 5 条，按更新时间排序</span>
      <div class="right"><router-link class="go" :to="{ path: '/applications', query: { mine: 1 } }">查看全部<Right class="i-icon--sm" /></router-link></div>
    </div>
    <TableSkeleton v-if="loading" :rows="5" :cols="[360, 150, 110, 180]" />
    <div v-else-if="!recent.length" class="empty">
      <div class="illu"><Order class="illu-icon" /></div>
      <b>还没有采购申请</b><span>创建第一张采购申请，提交后可以在这里跟踪进度</span>
      <el-button size="small" @click="router.push('/applications/new')"><Plus class="i-icon--sm" />新建采购申请</el-button>
    </div>
    <el-table v-else :data="recent" row-key="id">
      <el-table-column label="标题" min-width="360"><template #default="{ row }"><router-link class="title-link ellip" :to="`/applications/${row.id}`" :title="row.title">{{ row.title }}</router-link></template></el-table-column>
      <el-table-column label="金额" width="150" align="right"><template #default="{ row }"><span class="num">{{ money(row.total) }}</span></template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status" :class="APP_STATUS[row.status].tone">{{ APP_STATUS[row.status].label }}</span></template></el-table-column>
      <el-table-column label="更新时间" width="180"><template #default="{ row }"><span class="num">{{ timeOf(row.updatedAt) }}</span></template></el-table-column>
    </el-table>
  </el-card>

  <el-card v-if="isApprover" class="flat" shadow="always">
    <div class="card-head">
      <h2>待我审批</h2><span v-if="!loading && pendingTotal" class="badge warning num">{{ pendingTotal }}</span><span class="sub">排除本人申请，紧急优先，最多 5 条</span>
      <div class="right"><router-link class="go" to="/approvals">查看全部<Right class="i-icon--sm" /></router-link></div>
    </div>
    <TableSkeleton v-if="loading" :rows="5" :cols="[320, 160, 150, 100, 180]" />
    <div v-else-if="!pending.length" class="empty">
      <div class="illu"><Audit class="illu-icon" /></div>
      <b>暂无待审批的申请</b><span>其他成员提交采购申请后会出现在这里</span>
    </div>
    <el-table v-else :data="pending" row-key="id">
      <el-table-column label="标题" min-width="320"><template #default="{ row }"><router-link class="title-link ellip" :to="`/applications/${row.id}`" :title="row.title">{{ row.title }}</router-link></template></el-table-column>
      <el-table-column label="申请人 / 部门" width="160"><template #default="{ row }">{{ row.applicantName }}<span class="sub">{{ row.deptName }}</span></template></el-table-column>
      <el-table-column label="金额" width="150" align="right"><template #default="{ row }"><span class="num">{{ money(row.total) }}</span></template></el-table-column>
      <el-table-column label="优先级" width="100"><template #default="{ row }"><span v-if="row.priority === 'urgent'" class="status error">{{ PRIORITY.urgent.label }}</span><template v-else>{{ PRIORITY[row.priority]?.label || PRIORITY.normal.label }}</template></template></el-table-column>
      <el-table-column label="提交时间" width="180"><template #default="{ row }"><span class="num">{{ timeOf(row.submittedAt) }}</span></template></el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
/* 可点击的指标卡：包裹 <a> 撑满网格格子；hover 只把卡片边线加深一档（不换黄、不变文字色），焦点环 border.width.active × border.focus */
.stat-link { display: block; border-radius: var(--radius-lg); color: inherit; text-decoration: none; }
.stat-link :deep(.el-card) { height: 100%; transition: border-color var(--motion-duration-fast) var(--motion-easing-standard); }
.stat-link:hover :deep(.el-card) { --el-card-border-color: var(--color-border-strong); }
.stat-link:focus-visible { outline: var(--border-width-active) solid var(--color-border-focus); outline-offset: var(--spacing-0-5); }
/* 指标卡骨架：与 StatCard 同一内边距与左侧品牌描边，加载完成不跳版 */
.stat-skel { --el-card-padding: var(--spacing-5) var(--space-card); border-left: var(--border-width-indicator) solid var(--color-brand-indicator); }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-stack); align-items: start; }
.chart-wrap { padding: var(--spacing-4) var(--space-card) var(--spacing-3); }
/* 图表空态占住与图表同一高度（.chart = control.height.md × 7），两张卡并排时不错位 */
.chart-empty { min-height: calc(var(--control-height-md) * 7); justify-content: center; padding-top: 0; padding-bottom: 0; }
.illu-icon { font-size: var(--icon-size-2xl); color: var(--color-icon-muted); }

/* 标题型链接（DESIGN 链接四层）：近黑 + 500，hover 出下划线；表格里单行省略，完整标题放 title */
.ellip { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
