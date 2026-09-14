<script setup>
// 数据报表（PRD P08）：筛选卡 → 四个指标卡 → 申请趋势 / 部门金额排行 → 部门汇总表。
// 指标、图表、表格都来自同一次 report() 结果（PRD：本页内使用同一筛选结果）。草稿不进入报表。
// 演示参数（放在 # 之前）：?state=loading|error|empty。error = 首次加载失败一次（复用 session.failNext 测试工具）；empty = 默认范围改为没有数据的上上月。
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Refresh, Export, ChartHistogram } from '@icon-park/vue-next'
import StatCard from '../styles/bridge/vue/StatCard.vue'
import EChart from '../styles/bridge/vue/EChart.vue'
import TrendChart from '../styles/bridge/vue/TrendChart.vue'
import TableSkeleton from '../styles/bridge/vue/TableSkeleton.vue'
import { db, today } from '../data/db'
import { report } from '../data/api'
import { rankBars } from '../styles/bridge/echarts.js'
import { session, can, demoState } from '../data/session'
import { money, monthStart, diffDays, addDays, downloadCsv } from '../data/format'

const MAX_DAYS = 90
const state = demoState()
// 默认本月；state=empty 时取上上月（种子数据从 8 月开始，上上月没有已提交申请），走真实数据路径
function defaultRange() {
  if (state !== 'empty') return [monthStart(today()), today()]
  const end = addDays(monthStart(addDays(monthStart(today()), -1)), -1)
  return [monthStart(end), end]
}
// 部门下拉的「全部部门」是真实选项：Element 的 el-select 把 '' 当作空值显示占位符，所以用 'all' 作值，调用时再换成 ''
const ALL = 'all'
const filters = reactive({ range: defaultRange(), deptId: ALL })
// 日期范围必填、最多 90 个自然日（含首尾）；错误落到字段（el-form-item 的 error 属性，不需要整张 el-form）
const rangeError = computed(() => {
  const r = filters.range
  if (!Array.isArray(r) || r.length !== 2 || !r[0] || !r[1]) return '请选择提交日期范围'
  if (diffDays(r[0], r[1]) + 1 > MAX_DAYS) return `最多选择 ${MAX_DAYS} 天`
  return ''
})

const loading = ref(true), error = ref('')
const data = ref(null)       // report() 结果
const applied = ref(null)    // 已生效的筛选（图表卡头显示统计范围）
if (state === 'error') session.failNext.list = true

async function load() {
  if (rangeError.value) return
  loading.value = true; error.value = ''
  try {
    const [from, to] = filters.range
    const deptId = filters.deptId === ALL ? '' : filters.deptId
    data.value = await report({ from, to, deptId })
    applied.value = { from, to, deptId }
  } catch (e) { error.value = e.message || '报表加载失败，请重试' }
  finally { loading.value = false }
}
function reset() { filters.range = [monthStart(today()), today()]; filters.deptId = ALL; load() }
onMounted(() => { if (state !== 'loading') load() })

const ind = computed(() => data.value?.indicators)
const isEmpty = computed(() => !!data.value && ind.value.count === 0)
const pct = (r) => (r === null || r === undefined ? '—' : `${(r * 100).toFixed(1)}%`)
const deptName = computed(() => (applied.value?.deptId ? db.departments.find((d) => d.id === applied.value.deptId)?.name : '全部部门'))

// 申请趋势：x 轴 MM-DD，单序列（TrendChart 自动带渐变面积）
const days = computed(() => data.value.trend.map((d) => d.date.slice(5)))
const counts = computed(() => data.value.trend.map((d) => d.count))
// 部门金额排行：桥接的 rankBars 配方（前三名纯黄、其余中性灰；金额为 0 不着黄）
const rankOption = () => rankBars({ categories: data.value.byDept.map((d) => d.dept), values: data.value.byDept.map((d) => d.approvedAmount), formatter: (v) => money(v) })

// 汇总表合计行：show-summary + summary-method 直接返回 report().total
const summary = () => { const t = data.value.total; return ['合计', t.count, money(t.amount), t.approvedCount, money(t.approvedAmount), pct(t.rate)] }

// 导出：汇总表字段 + 合计行；金额用两位小数纯数字（Excel 可直接求和），文件名带页面名与基准日
const CSV_COLS = [
  { key: 'dept', label: '部门' },
  { key: 'count', label: '申请数' },
  { key: 'amount', label: '申请金额', get: (r) => r.amount.toFixed(2) },
  { key: 'approvedCount', label: '已通过数' },
  { key: 'approvedAmount', label: '已通过金额', get: (r) => r.approvedAmount.toFixed(2) },
  { key: 'rate', label: '通过率', get: (r) => pct(r.rate) }
]
const canExport = computed(() => !!data.value && !isEmpty.value && !loading.value)
function exportCsv() {
  if (!canExport.value) return
  downloadCsv(`采购报表_${today()}.csv`, CSV_COLS, [...data.value.byDept, data.value.total])
  ElMessage.success(`已导出 ${data.value.byDept.length} 个部门的汇总与合计行`)
}
</script>

<template>
  <div class="page-head">
    <div><h1>数据报表</h1><p>统计所选提交日期范围内已提交的申请，草稿不计入 · 演示基准日 <span class="num">{{ today() }}</span></p></div>
  </div>

  <!-- 筛选卡：条件区 + 动作区；日期范围的必填 / 90 天错误落在字段下方 -->
  <el-card class="flat filter-card" shadow="always">
    <div class="filter" :class="{ 'has-error': !!rangeError }">
      <div class="conds">
        <el-form-item :error="rangeError" class="cond">
          <el-date-picker v-model="filters.range" type="daterange" range-separator="→" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" aria-label="提交日期范围" style="width: 260px" />
        </el-form-item>
        <el-select v-model="filters.deptId" aria-label="所属部门" style="width: 140px">
          <el-option label="全部部门" :value="ALL" />
          <el-option v-for="d in db.departments" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
      </div>
      <div class="acts">
        <span v-if="can('export')" :title="canExport ? '导出汇总表与合计行（CSV）' : '暂无可导出数据'"><el-button :disabled="!canExport" @click="exportCsv"><Export class="i-icon--sm" />导出汇总</el-button></span>
        <el-button type="primary" :loading="loading && !!data" @click="load">查询</el-button>
        <el-button text @click="reset">重置</el-button>
      </div>
    </div>
  </el-card>

  <el-card v-if="error" class="flat" shadow="always">
    <div class="error-box"><Close class="i-icon--md" />{{ error }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
  </el-card>

  <template v-else>
    <!-- 四个指标：不带涨跌；「其中已通过金额」旁给口径说明（与工作台「本月获批金额」口径不同） -->
    <section class="stats" :aria-busy="loading">
      <template v-if="loading || !data">
        <el-card v-for="n in 4" :key="n" class="stat-skel" shadow="always">
          <el-skeleton animated><template #template><el-skeleton-item variant="text" class="sk-label" /><el-skeleton-item variant="h3" class="sk-value" /></template></el-skeleton>
        </el-card>
      </template>
      <template v-else>
        <StatCard label="提交申请数" :value="ind.count" />
        <StatCard label="申请总金额" :value="money(ind.amount)" />
        <StatCard label="其中已通过金额" :value="money(ind.approvedAmount)" hint="报表按所选提交日期范围内、当前为已通过的申请统计；工作台「本月获批金额」按通过时间统计，两者口径不同。" />
        <StatCard label="通过率" :value="pct(ind.rate)" />
      </template>
    </section>

    <div class="grid2">
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>申请趋势</h2><span class="sub">按提交日统计申请数量</span><div v-if="applied && !loading" class="right"><span class="badge neutral num">{{ applied.from }} ~ {{ applied.to }} · {{ deptName }}</span></div></div>
        <div class="body">
          <el-skeleton v-if="loading || !data" animated :rows="5" />
          <div v-else-if="isEmpty" class="empty chart-empty"><ChartHistogram class="i-icon--2xl i-icon--muted" /><b>所选范围内没有已提交的申请</b><span>调整提交日期范围或部门后重新查询，或 <button type="button" class="act" @click="reset">恢复默认范围</button></span></div>
          <TrendChart v-else :days="days" :series="[{ name: '申请数量', data: counts }]" />
        </div>
      </el-card>
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>部门金额排行</h2><span class="sub">已通过金额，按金额倒序</span></div>
        <div class="body">
          <el-skeleton v-if="loading || !data" animated :rows="5" />
          <div v-else-if="isEmpty" class="empty chart-empty"><ChartHistogram class="i-icon--2xl i-icon--muted" /><b>所选范围内没有已提交的申请</b><span>没有可排行的部门金额</span></div>
          <EChart v-else :option="rankOption" />
        </div>
      </el-card>
    </div>

    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>部门汇总</h2><div class="right"><span class="sub">通过率 = 已通过数 ÷（已通过数 + 已驳回数），分母为零显示「—」；金额为申请中的预估总金额</span></div></div>
      <TableSkeleton v-if="loading || !data" :rows="4" :cols="[160, 110, 160, 110, 160, 110]" />
      <div v-else-if="isEmpty" class="empty"><div class="illu"><ChartHistogram class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div><b>所选范围内没有已提交的申请</b><span>汇总表与导出在有数据时可用</span></div>
      <el-table v-else :data="data.byDept" show-summary :summary-method="summary" class="sum-table" style="width: 100%">
        <el-table-column prop="dept" label="部门" min-width="160" />
        <el-table-column label="申请数" width="110" align="right"><template #default="{ row }"><span class="num">{{ row.count }}</span></template></el-table-column>
        <el-table-column label="申请金额" width="160" align="right"><template #default="{ row }"><span class="num">{{ money(row.amount) }}</span></template></el-table-column>
        <el-table-column label="已通过数" width="110" align="right"><template #default="{ row }"><span class="num">{{ row.approvedCount }}</span></template></el-table-column>
        <el-table-column label="已通过金额" width="160" align="right"><template #default="{ row }"><span class="num">{{ money(row.approvedAmount) }}</span></template></el-table-column>
        <el-table-column label="通过率" width="110" align="right"><template #default="{ row }"><span class="num">{{ pct(row.rate) }}</span></template></el-table-column>
      </el-table>
    </el-card>
  </template>
</template>

<style scoped>
/* 筛选卡只有筛选栏一行：去掉配方的底部发丝线，避免与卡片边线叠成双线 */
.filter-card .filter { border-bottom: 0; }
.filter .cond { margin-bottom: 0; }
/* 字段错误文案由 Element 绝对定位在控件下方，出错时给筛选栏补一行高度 */
.filter.has-error { padding-bottom: var(--spacing-8); }

/* 指标卡骨架：与 StatCard 同高（上下内边距 + 标签行 + 数字行 + 间距），加载完成不跳版 */
.stat-skel { --el-card-padding: var(--spacing-5) var(--space-card); min-height: calc(var(--spacing-5) * 2 + var(--text-body-sm-size) * var(--text-body-line-height) + var(--text-display-size) * var(--text-display-line-height) + var(--spacing-1-5) + var(--spacing-1)); }
.sk-label, .sk-value { display: block; }   /* Element 的骨架条是 inline-block，两条要上下排 */
.sk-label { width: calc(var(--spacing-10) * 2); height: var(--text-body-sm-size); }
.sk-value { width: calc(var(--spacing-10) * 3); height: var(--text-display-size); margin-top: var(--spacing-3); }

/* StatCard 没有标签插槽：口径说明图标以绝对定位挂在卡片右上角，与标签行同高；命中区 control.hit-min */

.grid2 { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-stack); align-items: start; }
.body { padding: var(--spacing-4) var(--space-card) var(--spacing-3); }
/* 图表卡内的空态：与图表容器同高，内容居中，不画空图 */
.chart-empty { height: calc(var(--control-height-md) * 7); justify-content: center; padding: 0; }

/* 合计行：加重一档并用等宽数字，与正文行区分（Element 表尾默认与正文同重） */
.sum-table :deep(.el-table__footer-wrapper td.el-table__cell) { font-weight: var(--text-weight-label); font-variant-numeric: var(--text-numeric-variant); color: var(--color-text-primary); }
</style>
