<script setup>
// 操作日志（PRD P12）：只读查询表格 + 只读详情抽屉（含「操作前 → 操作后」）。不提供编辑、删除、导出。
// 列表页约定见 AGENTS.md；演示参数放在 # 之前：?state=loading|error|empty、?drawer=<logId>。
import { computed, reactive, ref, onMounted } from 'vue'
import { Refresh, Attention, Log as LogIcon, FileSearch, ArrowRight } from '@icon-park/vue-next'
import TableSkeleton from '@wycm9527/citrine/vue/TableSkeleton.vue'
import { db } from '../data/db'
import { session, rememberList, recallList, demoState, demoParam } from '../data/session'
import { listLogs, moduleLabel } from '../data/api'
import { PAGE_SIZES, LOG_MODULES } from '../data/constants'
import { timeOf, dash } from '../data/format'

// 操作人下拉列出全部成员（含已停用：历史日志仍可能由其产生），停用者加后缀说明
const memberOptions = computed(() => db.members.map((m) => ({ value: m.id, label: m.active ? m.name : `${m.name}（已停用）` })))

// ── 列表：筛选栏输入与已生效条件分开，点「查询」才生效；range 为 [from, to] ──
// 下拉的「全部…」是真实选项，值用 'all'（Element 把 '' 当作未选、只显示占位符）；查询时映射为空
const ALL = 'all'
const val = (v) => (v === ALL ? '' : v)
const blankFilters = () => ({ keyword: '', byId: ALL, module: ALL, range: [] })
const filters = reactive(blankFilters())
const applied = reactive(blankFilters())
const page = ref(1), pageSize = ref(db.settings.pageSize || 10)
const rows = ref([]), total = ref(0)
const state = ref('loading')   // loading | error | ready
const errorMsg = ref('')
const demo = demoState()
let demoEmptyOnce = demo === 'empty'
const SKEL_COLS = [160, 100, 100, 110, 220, 320, 90]

const query = () => ({ keyword: applied.keyword, byId: val(applied.byId), module: val(applied.module), from: applied.range?.[0] || '', to: applied.range?.[1] || '', page: page.value, pageSize: pageSize.value })
const hasConditions = computed(() => !!(applied.keyword || applied.byId !== ALL || applied.module !== ALL || applied.range?.length))

async function load() {
  if (demo === 'loading') return
  state.value = 'loading'
  try {
    const r = await listLogs(query())
    if (demoEmptyOnce) { demoEmptyOnce = false; r.rows = []; r.total = 0 }
    if (!r.rows.length && r.total && page.value > 1) { page.value = Math.max(1, Math.ceil(r.total / pageSize.value)); return load() }
    rows.value = r.rows; total.value = r.total; state.value = 'ready'
    rememberList('logs', { applied: { ...applied, range: [...(applied.range || [])] }, page: page.value, pageSize: pageSize.value })
  } catch (e) { errorMsg.value = e.message || '列表加载失败，请重试'; state.value = 'error' }
}
function search() { Object.assign(applied, { ...filters, range: [...(filters.range || [])] }); page.value = 1; load() }
function reset() { Object.assign(filters, blankFilters()); Object.assign(applied, blankFilters()); page.value = 1; load() }
function onSize() { page.value = 1; load() }

// ── 详情抽屉：全部字段 + 操作前 → 操作后（null 显示 —）──
const detail = reactive({ open: false, row: null, missing: false })
function openDetail(l) {
  const src = typeof l === 'string' ? db.logs.find((x) => x.id === l) : l
  detail.row = src || null; detail.missing = !src; detail.open = true
}
const hasDiff = computed(() => detail.row && (detail.row.before !== null || detail.row.after !== null))

onMounted(() => {
  const mem = recallList('logs')
  if (mem) { const m = { ...blankFilters(), ...(mem.applied || {}) }; Object.assign(applied, { ...m, range: [...(m.range || [])] }); Object.assign(filters, { ...m, range: [...(m.range || [])] }); page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value }
  if (demo === 'error') session.failNext.list = true
  load()
  const d = demoParam('drawer')
  if (d) openDetail(d)
})
</script>

<template>
  <div class="page-head">
    <div><h1>操作日志</h1><p>只读 · 按时间倒序</p></div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="对象编号 / 名称" aria-label="搜索操作对象编号或名称" clearable style="width: var(--layout-search-width)" @keyup.enter="search" />
        <el-select v-model="filters.byId" aria-label="操作人" filterable style="width: 150px"><el-option label="全部操作人" :value="ALL" /><el-option v-for="m in memberOptions" :key="m.value" :label="m.label" :value="m.value" /></el-select>
        <el-select v-model="filters.module" aria-label="模块" style="width: 140px"><el-option label="全部模块" :value="ALL" /><el-option v-for="(label, k) in LOG_MODULES" :key="k" :label="label" :value="k" /></el-select>
        <el-date-picker v-model="filters.range" type="daterange" range-separator="→" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" aria-label="操作日期范围" style="width: 260px" />
      </div>
      <div class="acts"><el-button type="primary" @click="search">查询</el-button><el-button text @click="reset">重置</el-button></div>
    </div>

    <TableSkeleton v-if="state === 'loading'" :rows="Math.min(pageSize, 10)" :cols="SKEL_COLS" />
    <div v-else-if="state === 'error'" class="error-box"><Attention class="i-icon--md" />{{ errorMsg }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length && !hasConditions" class="empty">
      <div class="illu"><LogIcon class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
      <b>还没有操作日志</b><span>申请、审批、资产、供应商、成员与设置的关键操作成功后会记录在这里</span>
    </div>
    <div v-else-if="!rows.length" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>未找到符合条件的数据</b><span>试试放宽或清空筛选条件</span>
      <el-button @click="reset">重置筛选</el-button>
    </div>
    <template v-else>
      <el-table :data="rows" style="width: 100%" class="clickable" @row-click="openDetail">
        <el-table-column label="操作时间" width="160"><template #default="{ row }"><span class="num">{{ timeOf(row.at) }}</span></template></el-table-column>
        <el-table-column prop="byName" label="操作人" width="100" />
        <el-table-column label="模块" width="100"><template #default="{ row }">{{ moduleLabel(row.module) }}</template></el-table-column>
        <el-table-column prop="action" label="操作类型" width="110" />
        <el-table-column label="操作对象" min-width="220"><template #default="{ row }"><span class="mono">{{ row.objectNo }}</span><span class="sub ellipsis" :title="row.objectName">{{ row.objectName }}</span></template></el-table-column>
        <el-table-column label="摘要" min-width="300"><template #default="{ row }"><span class="ellipsis" :title="row.summary">{{ row.summary }}</span></template></el-table-column>
        <el-table-column label="操作" width="90" fixed="right"><template #default="{ row }"><button type="button" class="act" @click.stop="openDetail(row)">详情</button></template></el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="load" @size-change="onSize" /></div>
    </template>
  </el-card>

  <!-- 只读详情抽屉：描述列表 + 操作前 → 操作后 -->
  <el-drawer v-model="detail.open" title="日志详情" size="var(--layout-drawer-width)" :close-on-click-modal="false">
    <div v-if="detail.missing" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>记录不存在或已被删除</b><span>该日志可能已随演示数据恢复被清除</span>
    </div>
    <template v-else-if="detail.row">
      <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
        <el-descriptions-item label="操作时间"><span class="num">{{ timeOf(detail.row.at) }}</span></el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detail.row.byName }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ moduleLabel(detail.row.module) }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ detail.row.action }}</el-descriptions-item>
        <el-descriptions-item label="操作对象"><span class="mono">{{ detail.row.objectNo }}</span><span class="sub">{{ detail.row.objectName }}</span></el-descriptions-item>
        <el-descriptions-item label="摘要">{{ detail.row.summary }}</el-descriptions-item>
        <el-descriptions-item label="日志编号"><span class="mono">{{ detail.row.id }}</span></el-descriptions-item>
      </el-descriptions>
      <h3 class="drawer-h">操作前 → 操作后</h3>
      <div class="diff" :class="{ 'is-empty': !hasDiff }">
        <div class="diff-cell"><span class="diff-label">操作前</span><span class="diff-val">{{ dash(detail.row.before) }}</span></div>
        <ArrowRight class="i-icon--md i-icon--muted diff-arrow" aria-hidden="true" />
        <div class="diff-cell"><span class="diff-label">操作后</span><span class="diff-val">{{ dash(detail.row.after) }}</span></div>
      </div>
      <p v-if="!hasDiff" class="help">该操作不涉及状态变化，因此没有记录前后值。</p>
    </template>
    <template #footer><el-button @click="detail.open = false">关闭</el-button></template>
  </el-drawer>
</template>

<style scoped>
/* 整行可点击打开详情：给行一个手形光标；键盘用户走操作列的「详情」胶囊 */
.clickable :deep(.el-table__body tr) { cursor: pointer; }
.ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 抽屉内分组小标题：首个不加上外边距 */
/* 操作前 / 操作后：两格并排、中间箭头；格子用 bg.subtle + 发丝线，圆角比抽屉（xl）低两档取 md */
.diff { display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-inline); align-items: stretch; }
.diff-cell { display: flex; flex-direction: column; gap: var(--spacing-1); padding: var(--spacing-2-5) var(--spacing-3); background: var(--color-bg-subtle); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); min-width: 0; }
.diff-label { font-size: var(--text-small-size); color: var(--color-text-muted); font-weight: var(--text-weight-label); }
.diff-val { color: var(--color-text-primary); font-size: var(--text-body-sm-size); line-height: var(--text-paragraph-line-height); word-break: break-all; }
.diff.is-empty .diff-val { color: var(--color-text-muted); }
.diff-arrow { align-self: center; }
.help { margin: var(--spacing-2) 0 0; line-height: var(--text-body-line-height); }
</style>
