<script setup>
// 采购申请列表（PRD P02 / §6.2）：页头 → 筛选卡（条件区 / 动作区、「展开筛选」、已生效条件标签）→ 表格卡（批量条、表格、分页）。
// 四态由 ?state=loading|error|empty 演示（error = 首次加载失败一次，重试即成功）。
// 筛选 / 页码 / 排序在查询后 rememberList，进详情返回后恢复；工作台带入的 query（mine / status / approvedMonth）以 query 为准并写入记忆。
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage } from 'element-plus'
import { confirmBox } from '@wycm9527/citrine/vue/confirm.js'
import { Plus, Export, Close, CloseOne, Refresh, Down, Up, MoreOne, Order, Search } from '@icon-park/vue-next'
import { db, today } from '../data/db'
import { session, can, demoState, rememberList, recallList } from '../data/session'
import { listApplications, submitApplication, deleteDrafts, copyApplication, canEditApp, ApiError } from '../data/api'
import { money, dateOf, timeOf, downloadCsv } from '../data/format'
import { APP_STATUS, APP_STATUS_LIST, PRIORITY, PAGE_SIZES } from '../data/constants'
import TableSkeleton from '@wycm9527/citrine/vue/TableSkeleton.vue'

const route = useRoute(); const router = useRouter()
const MEM_KEY = 'applications'
const state = demoState()
const viewAll = can('app.viewAll')     // 申请人为 false：数据固定为本人，看不到部门 / 申请人筛选，mine 条件无意义
const canExport = can('export')

// 下拉的"全部…"是真实选项（值 all），不用占位符当默认值（DESIGN 筛选栏规则）
const ALL = 'all'
const isAll = (v) => !v || v === ALL
const blank = () => ({ keyword: '', status: ALL, deptId: ALL, applicantId: ALL, submitted: [], approved: [], mine: false, approvedMonth: '' })
const snapshot = (f) => ({ ...f, submitted: [...(f.submitted || [])], approved: [...(f.approved || [])] })
const filters = reactive(blank())      // 编辑中的条件：点「查询」后才生效
const applied = ref(blank())           // 已生效的条件：决定表格数据与条件标签
const expanded = ref(false)
const page = ref(1), pageSize = ref(db.settings.pageSize || PAGE_SIZES[0])
const sort = reactive({ by: 'updatedAt', dir: 'desc' })   // 默认更新时间倒序；金额列 sortable="custom"
const rows = ref([]), total = ref(0)
const loading = ref(true), loaded = ref(false), error = ref('')
const selected = ref([]), tableRef = ref()
const busy = reactive({ row: '', batch: false, export: false })

const deptName = (id) => db.departments.find((d) => d.id === id)?.name || id
const memberName = (id) => db.members.find((m) => m.id === id)?.name || id
const members = computed(() => db.members.map((m) => ({ id: m.id, label: m.active ? m.name : `${m.name}（已停用）` })))   // 申请人筛选含停用成员：历史申请仍可查

// 折叠时，隐藏筛选项（申请人、通过日期）已填的数量——在展开按钮旁提示（PRD：隐藏筛选项的已选值也必须可见）
const hiddenCount = computed(() => (viewAll && !isAll(filters.applicantId) ? 1 : 0) + (filters.approved?.length === 2 ? 1 : 0))

// 已生效条件的可移除标签：包含工作台带入的 mine / status / approvedMonth 与折叠时看不见的条件
const chips = computed(() => {
  const f = applied.value
  return [
    f.keyword && { key: 'keyword', label: `关键词：${f.keyword}` },
    !isAll(f.status) && { key: 'status', label: `状态：${APP_STATUS[f.status]?.label || f.status}` },
    viewAll && !isAll(f.deptId) && { key: 'deptId', label: `部门：${deptName(f.deptId)}` },
    viewAll && !isAll(f.applicantId) && { key: 'applicantId', label: `申请人：${memberName(f.applicantId)}` },
    f.submitted?.length === 2 && { key: 'submitted', label: `提交日期：${f.submitted[0]} ~ ${f.submitted[1]}` },
    f.approved?.length === 2 && { key: 'approved', label: `通过日期：${f.approved[0]} ~ ${f.approved[1]}` },
    viewAll && f.mine && { key: 'mine', label: '仅本人的申请' },
    f.approvedMonth && { key: 'approvedMonth', label: `获批月份：${f.approvedMonth}` }
  ].filter(Boolean)
})
const hasConditions = computed(() => chips.value.length > 0)   // 区分「没有任何数据」与「筛选无结果」

// 工作台 query → 条件；签名用于判断"返回列表时 URL 仍带 query"与"新的 query 到达"
function fromQuery(q) {
  const f = blank()
  if (q.mine) f.mine = true
  if (q.status && APP_STATUS[q.status]) f.status = q.status
  if (/^\d{4}-\d{2}$/.test(q.approvedMonth || '')) f.approvedMonth = q.approvedMonth
  return f
}
const querySig = (q) => ['mine', 'status', 'approvedMonth'].filter((k) => q[k]).map((k) => `${k}=${q[k]}`).join('&')

function params() {
  const f = applied.value
  return {
    keyword: f.keyword.trim(), status: isAll(f.status) ? '' : f.status,
    deptId: viewAll && !isAll(f.deptId) ? f.deptId : '', applicantId: viewAll && !isAll(f.applicantId) ? f.applicantId : '',
    submittedFrom: f.submitted?.[0] || '', submittedTo: f.submitted?.[1] || '', approvedFrom: f.approved?.[0] || '', approvedTo: f.approved?.[1] || '',
    mine: viewAll && f.mine, approvedMonth: f.approvedMonth,
    sortBy: sort.by === 'total' ? 'total' : '', sortDir: sort.dir
  }
}
function remember() { rememberList(MEM_KEY, { filters: applied.value, page: page.value, pageSize: pageSize.value, sort: { ...sort }, expanded: expanded.value, sig: querySig(route.query) }) }

let seq = 0
async function load() {
  if (state === 'loading') return   // 演示：停留在骨架
  const my = ++seq
  loading.value = true; error.value = ''
  tableRef.value?.clearSelection()
  try {
    const res = await listApplications({ ...params(), page: page.value, pageSize: pageSize.value })
    if (my !== seq) return
    // 删除后当前页为空 → 退到最后一个有数据的页
    if (!res.rows.length && page.value > 1) { page.value = Math.max(1, Math.ceil(res.total / pageSize.value)); return load() }
    rows.value = state === 'empty' ? [] : res.rows
    total.value = state === 'empty' ? 0 : res.total
    loaded.value = true
    remember()
  } catch (e) {
    if (my !== seq) return
    error.value = e instanceof ApiError ? e.message : '列表加载失败，请重试'
  } finally { if (my === seq) loading.value = false }
}

function init() {
  const sig = querySig(route.query)
  const mem = recallList(MEM_KEY)
  if (sig && (!mem || mem.sig !== sig)) {
    applied.value = fromQuery(route.query); page.value = 1
  } else if (mem) {
    applied.value = { ...blank(), ...(mem.filters || {}) }; page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value
    Object.assign(sort, mem.sort || {}); expanded.value = !!mem.expanded
  }
  Object.assign(filters, snapshot(applied.value))
  if (state === 'error') session.failNext.list = true   // 演示：首次加载失败一次（PRD §6.5 测试工具），重试即成功
  load()
}
onMounted(init)
// 同一组件内 query 变化（浏览器前进 / 后退带不同工作台条件）：以新 query 为准
watch(() => querySig(route.query), (sig, old) => { if (sig && sig !== old && route.name === 'applications') { applied.value = fromQuery(route.query); Object.assign(filters, snapshot(applied.value)); page.value = 1; load() } })

function query() { applied.value = snapshot(filters); page.value = 1; load() }
function reset() { Object.assign(filters, blank()); applied.value = blank(); page.value = 1; load() }
function removeChip(key) {
  const v = key === 'submitted' || key === 'approved' ? [] : key === 'mine' ? false : key === 'keyword' || key === 'approvedMonth' ? '' : ALL
  filters[key] = v; applied.value = { ...applied.value, [key]: v }; page.value = 1; load()
}
function onSort({ prop, order }) {
  if (prop === 'total' && order) { sort.by = 'total'; sort.dir = order === 'ascending' ? 'asc' : 'desc' } else { sort.by = 'updatedAt'; sort.dir = 'desc' }
  page.value = 1; load()
}
const defaultSort = computed(() => (sort.by === 'total' ? { prop: 'total', order: sort.dir === 'asc' ? 'ascending' : 'descending' } : undefined))
function onPage(p) { page.value = p; load() }
function onSize(s) { pageSize.value = s; page.value = 1; load() }

const confirm = (message, title, options) => confirmBox(message, title, { cancelButtonText: '取消', type: 'warning', ...options }).then(() => true, () => false)
const errMsg = (e, fallback) => (e instanceof ApiError ? e.message : fallback)
// 草稿完整性：用途 ≥ 10 字、期望到货日期、明细物品名称——不完整的提交由表单页处理，这里只提示并跳编辑页
const incomplete = (row) => (row.purpose || '').trim().length < 10 || !row.expectDate || row.lines.some((l) => !l.name)

async function submitRow(row) {
  if (incomplete(row)) { ElMessage.warning('草稿信息不完整，请进入编辑页补齐后提交'); router.push(`/applications/${row.id}/edit`); return }
  if (!(await confirm('提交后进入审批，不能再编辑或撤回。', `提交「${row.title}」？`, { confirmButtonText: '提交申请' }))) return
  busy.row = row.id
  try { await submitApplication({ ...row }); ElMessage.success(`「${row.title}」已提交，等待审批`); load() }
  catch (e) { ElMessage.error(errMsg(e, '提交失败，请稍后重试')) }
  finally { busy.row = '' }
}
async function removeRow(row) {
  if (!(await confirm('删除后不可恢复。', `确认删除草稿「${row.title}」？`, { confirmButtonText: '删除', confirmButtonClass: 'el-button--danger' }))) return
  busy.row = row.id
  try { await deleteDrafts([row.id]); ElMessage.success(`已删除草稿「${row.title}」`); load() }
  catch (e) { ElMessage.error(errMsg(e, '删除失败，请重试')) }
  finally { busy.row = '' }
}
async function removeSelected() {
  const n = selected.value.length
  if (!(await confirm('删除后不可恢复。', `确认删除这 ${n} 张草稿？`, { confirmButtonText: '删除', confirmButtonClass: 'el-button--danger' }))) return
  busy.batch = true
  try { const c = await deleteDrafts(selected.value.map((r) => r.id)); ElMessage.success(`已删除 ${c} 张草稿`); load() }
  catch (e) { ElMessage.error(errMsg(e, '删除失败，请重试')) }
  finally { busy.batch = false }
}
async function copyRow(row) {
  busy.row = row.id
  try { const app = await copyApplication(row.id); ElMessage.success(`已复制为新草稿 ${app.no}`); router.push(`/applications/${app.id}/edit`) }
  catch (e) { ElMessage.error(errMsg(e, '复制失败，请重试')) }
  finally { busy.row = '' }
}
function onMore(command, row) { if (command === 'copy') copyRow(row); else if (command === 'remove') removeRow(row) }

// 导出：当前权限与筛选下的全部结果、按当前排序，业务列（无复选框与操作列）；文件名含页面名与基准日（PRD §6.2）
const EXPORT_COLS = [
  { key: 'no', label: '申请单号' }, { key: 'title', label: '标题' }, { key: 'applicantName', label: '申请人' }, { key: 'deptName', label: '部门' },
  { key: 'total', label: '总金额（元）', get: (r) => Number(r.total).toFixed(2) }, { key: 'priority', label: '优先级', get: (r) => PRIORITY[r.priority]?.label || r.priority },
  { key: 'status', label: '状态', get: (r) => APP_STATUS[r.status]?.label || r.status }, { key: 'submittedAt', label: '提交时间', get: (r) => (r.submittedAt ? timeOf(r.submittedAt) : '未提交') },
  { key: 'updatedAt', label: '更新时间', get: (r) => timeOf(r.updatedAt) }
]
async function exportCsv() {
  busy.export = true
  try {
    const res = await listApplications({ ...params(), page: 1, pageSize: Math.max(total.value, 1) })
    downloadCsv(`采购申请_${today()}.csv`, EXPORT_COLS, res.rows)
    ElMessage.success(`已导出 ${res.rows.length} 条采购申请`)
  } catch (e) { ElMessage.error(errMsg(e, '导出失败，请重试')) }
  finally { busy.export = false }
}
</script>

<template>
  <div class="page-head">
    <div><h1>采购申请</h1><p>共 <b class="num">{{ loaded ? total : '—' }}</b> 条<template v-if="loaded && hasConditions">（当前筛选）</template></p></div>
    <div class="actions">
      <el-button v-if="canExport" :disabled="!loaded || !total" :title="loaded && total ? '导出当前筛选下的全部结果（CSV）' : '暂无可导出数据'" :loading="busy.export" @click="exportCsv"><Export class="i-icon--sm" />导出</el-button>
      <el-button type="primary" @click="router.push('/applications/new')"><Plus class="i-icon--sm" />新建采购申请</el-button>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" class="kw" placeholder="搜索单号 / 标题" aria-label="搜索采购单号或标题" clearable @keyup.enter="query">
          <template #prefix><Search class="i-icon--sm i-icon--muted" /></template>
        </el-input>
        <el-select v-model="filters.status" class="w-sm" aria-label="状态">
          <el-option label="全部状态" :value="ALL" /><el-option v-for="s in APP_STATUS_LIST" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-if="viewAll" v-model="filters.deptId" class="w-sm" aria-label="所属部门">
          <el-option label="全部部门" :value="ALL" /><el-option v-for="d in db.departments" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
        <el-date-picker v-model="filters.submitted" class="w-range" type="daterange" range-separator="→" start-placeholder="提交开始" end-placeholder="提交结束" value-format="YYYY-MM-DD" aria-label="提交日期范围" />
        <template v-if="expanded">
          <el-select v-if="viewAll" v-model="filters.applicantId" class="w-md" aria-label="申请人" filterable>
            <el-option label="全部申请人" :value="ALL" /><el-option v-for="m in members" :key="m.id" :label="m.label" :value="m.id" />
          </el-select>
          <el-date-picker v-model="filters.approved" class="w-range" type="daterange" range-separator="→" start-placeholder="通过开始" end-placeholder="通过结束" value-format="YYYY-MM-DD" aria-label="通过日期范围" />
        </template>
      </div>
      <div class="acts">
        <span v-if="!expanded && hiddenCount" class="hidden-hint">已启用 <b class="num">{{ hiddenCount }}</b> 项隐藏条件</span>
        <el-button text :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? '收起筛选' : '展开筛选' }}<component :is="expanded ? Up : Down" class="i-icon--sm" /></el-button>
        <el-button type="primary" @click="query">查询</el-button>
        <el-button text @click="reset">重置</el-button>
      </div>
    </div>
    <div v-if="chips.length" class="chips">
      <span v-for="c in chips" :key="c.key" class="chip">{{ c.label }}<button type="button" class="x" :aria-label="`移除条件：${c.label}`" @click="removeChip(c.key)"><Close class="i-icon--xs" /></button></span>
    </div>

    <div v-if="selected.length" class="batch">
      已选 <b class="num">{{ selected.length }}</b> 张草稿<button type="button" class="act" @click="tableRef.clearSelection()">取消选择</button>
      <div class="right"><el-button size="small" type="danger" :loading="busy.batch" @click="removeSelected">删除我的草稿</el-button></div>
    </div>

    <TableSkeleton v-if="loading && !loaded" :rows="Math.min(pageSize, 10)" :cols="[48, 180, 196, 118, 130, 84, 92, 130, 224]" />
    <div v-else-if="error" class="error-box"><CloseOne class="i-icon--md" />{{ error }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length && !hasConditions" class="empty">
      <div class="illu"><Order class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
      <b>还没有采购申请</b><span>{{ viewAll ? '成员创建采购申请后会出现在这里' : '创建第一张采购申请，提交后可以在这里跟踪进度' }}</span>
      <el-button size="small" @click="router.push('/applications/new')"><Plus class="i-icon--sm" />新建采购申请</el-button>
    </div>
    <div v-else-if="!rows.length" class="empty">
      <div class="illu"><Search class="illu-icon" /></div>
      <b>未找到符合条件的数据</b><span>试试放宽筛选条件，或 <button type="button" class="act" @click="reset">重置筛选</button></span>
    </div>
    <div v-else v-loading="loading" element-loading-text="正在加载">
      <el-table ref="tableRef" :data="rows" row-key="id" :default-sort="defaultSort" @selection-change="(v) => (selected = v)" @sort-change="onSort">
        <el-table-column type="selection" width="48" :selectable="(row) => canEditApp(row)" />
        <el-table-column label="申请单号" width="180"><template #default="{ row }"><router-link class="link mono" :to="`/applications/${row.id}`">{{ row.no }}</router-link></template></el-table-column>
        <el-table-column label="标题" min-width="196"><template #default="{ row }"><span class="ellip" :title="row.title">{{ row.title }}</span></template></el-table-column>
        <el-table-column label="申请人 / 部门" width="118"><template #default="{ row }">{{ row.applicantName }}<span class="sub">{{ row.deptName }}</span></template></el-table-column>
        <el-table-column label="总金额" prop="total" width="130" align="right" sortable="custom"><template #default="{ row }"><span class="num">{{ money(row.total) }}</span></template></el-table-column>
        <el-table-column label="优先级" width="84"><template #default="{ row }"><span v-if="row.priority === 'urgent'" class="status error">{{ PRIORITY.urgent.label }}</span><template v-else>{{ PRIORITY[row.priority]?.label || PRIORITY.normal.label }}</template></template></el-table-column>
        <el-table-column label="状态" width="92"><template #default="{ row }"><span class="status" :class="APP_STATUS[row.status].tone">{{ APP_STATUS[row.status].label }}</span></template></el-table-column>
        <!-- 提交时间拆成日期主行 + 时分副行：行高本来就是两行（申请人 / 部门），列宽从 170 收到 130，整表才能在 1440 内不横向滚动 -->
        <el-table-column label="提交时间" width="130"><template #default="{ row }"><template v-if="row.submittedAt"><span class="num">{{ dateOf(row.submittedAt) }}</span><span class="sub num">{{ row.submittedAt.slice(11, 16) }}</span></template><span v-else class="muted">未提交</span></template></el-table-column>
        <!-- 操作列：一行最多 3 个胶囊（查看 / 编辑 / 提交），复制与删除收进「⋯」（DESIGN 表格配方）；列宽合计 1202 ≤ 1440 展开侧栏时的 1206 -->
        <el-table-column label="操作" width="224" fixed="right">
          <template #default="{ row }">
            <router-link class="act" :to="`/applications/${row.id}`">查看</router-link>
            <template v-if="canEditApp(row)">
              <router-link class="act" :to="`/applications/${row.id}/edit`">编辑</router-link>
              <button type="button" class="act" :disabled="busy.row === row.id" @click="submitRow(row)">提交</button>
            </template>
            <el-dropdown trigger="click" class="more" @command="(c) => onMore(c, row)">
              <a class="act more-link" role="button" aria-label="更多操作" tabindex="0"><MoreOne class="i-icon--sm" /></a>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy" :disabled="busy.row === row.id">复制为新申请</el-dropdown-item>
                  <el-dropdown-item v-if="canEditApp(row)" command="remove" divided class="is-danger" :disabled="busy.row === row.id">删除草稿</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager"><el-pagination :current-page="page" :page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="onPage" @size-change="onSize" /></div>
    </div>
  </el-card>
</template>

<style scoped>
/* 筛选控件宽度不是 token（DESIGN：按内容定）：关键词框用 layout.search-width，其余用它的比例表达，避免像素字面量 */
.filter .kw { width: var(--layout-search-width); }
.filter .w-sm { width: calc(var(--layout-search-width) * 0.6); }
.filter .w-md { width: calc(var(--layout-search-width) * 0.75); }
/* el-date-picker 的根是 fragment（tooltip 触发层 + 传送的面板），拿不到 scoped 属性，要用 :deep 才能命中传下去的 class */
.filter :deep(.w-range) { --el-date-editor-daterange-width: calc(var(--layout-search-width) * 1.1); width: var(--el-date-editor-daterange-width); flex: none; }
.hidden-hint { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
/* 条件标签区在没有批量条时会直接贴到表头：补一档下内边距；有批量条时由它接管 */
.chips { padding-bottom: var(--spacing-3); }
.chips + .batch { margin-top: 0; }
/* 标签上的移除按钮用 <button>（键盘可达）：重置按钮外观、命中区补到 control.hit-min */
.chip .x { border: 0; background: transparent; color: inherit; padding: 0; min-width: var(--control-hit-min); min-height: var(--control-hit-min); border-radius: var(--radius-full); display: inline-flex; align-items: center; justify-content: center; }
.chip .x:hover { opacity: 1; }
.ellip { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.muted { color: var(--color-text-muted); }
.illu-icon { font-size: var(--icon-size-2xl); color: var(--color-icon-muted); }
/* 「⋯」图标胶囊：与相邻操作胶囊同一间距；内边距收窄成近方形（同 golden-admin Orders.vue） */
.more { margin-left: var(--space-inline); vertical-align: middle; }
.more-link { text-decoration: none; font-style: normal; color: var(--color-icon-default); padding: 0 var(--spacing-1-5); }
</style>
