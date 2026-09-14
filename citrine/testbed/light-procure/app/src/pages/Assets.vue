<script setup>
// 资产台账（PRD P06 / §4.2）：列表 → 详情抽屉（资产信息 / 使用记录）→ 新增 / 编辑抽屉（管理员）→ 分配小弹窗 → 归还确认。
// 列表页约定见 AGENTS.md（分页初值、列表记忆、骨架 / 失败 / 两种空态）；演示参数放在 # 之前：
// ?state=loading|error|empty、?drawer=<id>（+ ?tab=history）、?edit=<id>|new、?assign=<id>；工作台带入 #/assets?mine=1。
import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { Plus, Export, Close, Refresh, Attention, Box, FileSearch } from '@icon-park/vue-next'
import TableSkeleton from '../styles/bridge/vue/TableSkeleton.vue'
import { db, today } from '../data/db'
import { session, can, rememberList, recallList, demoState, demoParam } from '../data/session'
import { listAssets, getAsset, saveAsset, assignAsset, returnAsset, approvedAppsForLink, activeMembers, visibleAssets } from '../data/api'
import { CATEGORIES, ASSET_STATUS, PAGE_SIZES, LINE_LIMIT } from '../data/constants'
import { money, dateOf, timeOf, dash, downloadCsv } from '../data/format'
import { useDirtyGuard, confirmLeave } from '../data/guard'

const route = useRoute(); const router = useRouter()
const viewAll = computed(() => can('asset.viewAll'))     // 审批人 / 管理员看全部；申请人只看本人在用
const manage = computed(() => can('asset.manage'))       // 管理员：新增 / 编辑 / 分配 / 归还
const canExport = computed(() => can('export'))
const deptName = (id) => db.departments.find((d) => d.id === id)?.name || ''
const meName = computed(() => db.members.find((m) => m.id === session.userId)?.name || '本人')
const visibleCount = computed(() => visibleAssets().length)   // 页头「共 N 件」= 当前身份可见总数，不随筛选变化

// ── 列表：筛选栏输入（filters）与已生效条件（applied）分开，点「查询」才生效 ──
// 下拉的「全部…」是真实选项，值用 'all'（Element 把 '' 当作未选、只显示占位符）；查询时映射为空
const ALL = 'all'
const val = (v) => (v === ALL ? '' : v)
const blankFilters = () => ({ keyword: '', category: ALL, status: ALL, deptId: ALL })
const filters = reactive(blankFilters())
const applied = reactive(blankFilters())
const mine = ref(false)   // 工作台带入「使用人＝当前用户」：筛选栏没有使用人控件，用 chip 表达
const page = ref(1), pageSize = ref(db.settings.pageSize || 10)
const rows = ref([]), total = ref(0)
const state = ref('loading')   // loading | error | ready
const errorMsg = ref('')
const demo = demoState()
let demoEmptyOnce = demo === 'empty'   // 只影响首次加载：演示「没有任何数据」空态

const query = () => ({ keyword: applied.keyword, category: val(applied.category), status: val(applied.status), deptId: val(applied.deptId), ...(mine.value ? { userId: session.userId } : {}), page: page.value, pageSize: pageSize.value })
const hasConditions = computed(() => mine.value || !!applied.keyword || [applied.category, applied.status, applied.deptId].some((v) => v !== ALL))
const skelCols = computed(() => [170, 220, 110, 130, 90, 150, 120, manage.value ? 190 : 90])

async function load() {
  if (demo === 'loading') return   // 演示：停留在骨架
  state.value = 'loading'
  try {
    const r = await listAssets(query())
    if (demoEmptyOnce) { demoEmptyOnce = false; r.rows = []; r.total = 0 }
    if (!r.rows.length && r.total && page.value > 1) { page.value = Math.max(1, Math.ceil(r.total / pageSize.value)); return load() }   // 当前页空了退到最后一页
    rows.value = r.rows; total.value = r.total; state.value = 'ready'
    rememberList('assets', { applied: { ...applied }, mine: mine.value, page: page.value, pageSize: pageSize.value })
  } catch (e) { errorMsg.value = e.message || '列表加载失败，请重试'; state.value = 'error' }
}
function search() { Object.assign(applied, filters); page.value = 1; load() }
function reset() { Object.assign(filters, blankFilters()); Object.assign(applied, blankFilters()); if (viewAll.value) clearMineQuery(); page.value = 1; load() }
function onSize() { page.value = 1; load() }

// 工作台带入的条件 → 两枚 chip；审批人 / 管理员移除任一枚都回到全部（只留「在用」而没有使用人不成立）；申请人的本人范围不可解除
const chips = computed(() => (mine.value ? [{ key: 'user', label: `使用人：${meName.value}` }, { key: 'status', label: `状态：${ASSET_STATUS.inuse.label}` }] : []))
function clearMineQuery() { mine.value = false; if (route.query.mine) router.replace({ path: route.path }) }
function clearMine() { if (!viewAll.value) return; clearMineQuery(); filters.status = applied.status = ALL; page.value = 1; load() }

// ── 详情抽屉：资产信息 / 使用记录 ──
const detail = reactive({ open: false, loading: false, asset: null, missing: false, tab: 'info' })
async function openDetail(id) {
  detail.open = true; detail.loading = true; detail.asset = null; detail.missing = false
  detail.tab = demoParam('tab') === 'history' && demoParam('drawer') === id ? 'history' : 'info'
  const a = await getAsset(id)
  const visible = a && (viewAll.value || (a.status === 'inuse' && a.userId === session.userId))   // 记录级权限：无权记录按不存在处理，不泄露内容
  detail.asset = visible ? a : null; detail.missing = !visible; detail.loading = false
}
const sourceApp = computed(() => (detail.asset?.sourceAppId ? db.applications.find((x) => x.id === detail.asset.sourceAppId) || null : null))
const canOpenSource = computed(() => !!sourceApp.value && (can('app.viewAll') || sourceApp.value.applicantId === session.userId))
function goSource() { const id = sourceApp.value.id; detail.open = false; router.push(`/applications/${id}`) }
const history = computed(() => (detail.asset?.history || []).slice().reverse())   // 倒序：最近一次在最上
const HISTORY_TITLE = { registered: () => '登记入库', assigned: (h) => `分配给 ${h.userName}`, returned: (h) => `${h.userName} 归还` }
const historyTitle = (h) => (HISTORY_TITLE[h.type] || (() => h.type))(h)
const historyMeta = (h) => [h.deptName, h.byName ? `操作人 ${h.byName}` : ''].filter(Boolean).join(' · ')
function editFromDetail() { const a = detail.asset; detail.open = false; openEdit(a) }

// ── 新增 / 编辑抽屉（管理员）──
const blankForm = () => ({ name: '', category: '', spec: '', price: undefined, purchaseDate: '', location: '', sourceAppId: '', note: '' })
const editor = reactive({ open: false, id: '', no: '', saving: false, form: blankForm(), snapshot: '' })
const editorRef = ref()
const approvedApps = computed(() => approvedAppsForLink())
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const afterToday = (d) => isoDate(d) > today()   // 购入日期不晚于演示基准日
const lengthRule = (label, min, max) => ({ validator: (r, v, cb) => { const n = (v || '').trim().length; cb(n >= min && n <= max ? undefined : new Error(`${label}需 ${min}–${max} 字`)) }, trigger: 'blur' })
const rules = {
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }, lengthRule('名称', 1, 50)],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  spec: [{ max: 100, message: '规格不超过 100 字', trigger: 'blur' }],
  price: [{ required: true, type: 'number', message: '请输入购入金额', trigger: 'change' }, { validator: (r, v, cb) => cb(v >= LINE_LIMIT.priceMin && v <= LINE_LIMIT.priceMax ? undefined : new Error('金额需在 0.01–99,999.99 之间')), trigger: 'change' }],
  purchaseDate: [{ required: true, message: '请选择购入日期', trigger: 'change' }, { validator: (r, v, cb) => cb(!v || v <= today() ? undefined : new Error(`购入日期不能晚于 ${today()}`)), trigger: 'change' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }, lengthRule('存放位置', 1, 50)],
  note: [{ max: 300, message: '备注不超过 300 字', trigger: 'blur' }]
}
const isEditorDirty = () => editor.open && JSON.stringify(editor.form) !== editor.snapshot
function openEditor(src) {
  editor.id = src?.id || ''; editor.no = src?.no || ''
  editor.form = src ? { name: src.name, category: src.category, spec: src.spec || '', price: src.price, purchaseDate: src.purchaseDate, location: src.location, sourceAppId: src.sourceAppId || '', note: src.note || '' } : blankForm()
  editor.snapshot = JSON.stringify(editor.form); editor.open = true
  nextTick(() => editorRef.value?.clearValidate())
}
const openCreate = () => openEditor(null)
function openEdit(a) { const src = typeof a === 'string' ? db.assets.find((x) => x.id === a) : a; if (!src) return ElMessage.error('记录不存在或已被删除'); openEditor(src) }
async function closeEditor(done) { if (isEditorDirty() && !(await confirmLeave())) return; done ? done() : (editor.open = false) }
async function save() {
  const ok = await editorRef.value.validate().catch(() => false)
  if (!ok) return   // scroll-to-error 已定位到首个错误
  editor.saving = true
  try {
    const a = await saveAsset({ id: editor.id || undefined, ...editor.form })
    ElMessage.success(editor.id ? '资产已更新' : `资产已登记 ${a.no}`)
    editor.snapshot = JSON.stringify(editor.form); editor.open = false
    load()
  } catch (e) { ElMessage.error(e.message || '保存失败，请重试') } finally { editor.saving = false }   // 失败保留输入
}

// ── 分配小弹窗：启用成员选择器、只读部门、备注 ──
const assign = reactive({ open: false, asset: null, userId: '', note: '', saving: false })
const assignRef = ref()
const members = computed(() => activeMembers().map((m) => ({ ...m, deptName: deptName(m.deptId) })))
const assignDept = computed(() => members.value.find((m) => m.id === assign.userId)?.deptName || '')
const assignRules = { userId: [{ required: true, message: '请选择使用人', trigger: 'change' }], note: [{ max: 200, message: '备注不超过 200 字', trigger: 'blur' }] }
function openAssign(a) {
  const src = typeof a === 'string' ? db.assets.find((x) => x.id === a) : a
  if (!src) return ElMessage.error('记录不存在或已被删除')
  if (src.status !== 'idle') return ElMessage.warning('该资产不是闲置状态，请刷新列表')
  assign.asset = src; assign.userId = ''; assign.note = ''; assign.open = true
  nextTick(() => assignRef.value?.clearValidate())
}
const isAssignDirty = () => assign.open && !!(assign.userId || assign.note)
async function closeAssign(done) { if (isAssignDirty() && !(await confirmLeave())) return; done ? done() : (assign.open = false) }
async function confirmAssign() {
  const ok = await assignRef.value.validate().catch(() => false); if (!ok) return
  assign.saving = true
  try {
    const m = members.value.find((x) => x.id === assign.userId)
    await assignAsset(assign.asset.id, assign.userId, assign.note.trim())
    ElMessage.success(`资产已分配给 ${m.name}`)
    assign.userId = ''; assign.note = ''; assign.open = false
    load()
  } catch (e) { ElMessage.error(e.message || '分配失败，请重试'); if (e.code === 'stale') load() } finally { assign.saving = false }
}

// ── 归还：确认弹窗内原位处理，确认按钮处理中防重复 ──
function doReturn(a) {
  confirmBox(`确认 ${a.userName} 归还「${a.name}」？归还后资产变为闲置。`, '归还资产', {
    confirmButtonText: '确认归还', cancelButtonText: '取消', type: 'warning',
    beforeClose: async (action, instance, done) => {
      if (action !== 'confirm') return done()
      instance.confirmButtonLoading = true
      try { await returnAsset(a.id); ElMessage.success('资产已归还'); done(); load() }
      catch (e) { ElMessage.error(e.message || '归还失败，请重试'); if (e.code === 'stale') { done(); load() } }
      finally { instance.confirmButtonLoading = false }
    }
  }).catch(() => {})
}

// ── 导出：当前权限与筛选下的全部结果（不限当前页），业务列不含操作列 ──
const exporting = ref(false)
const CSV_COLUMNS = [
  { label: '资产编号', key: 'no' }, { label: '名称', key: 'name' }, { label: '规格', key: 'spec' }, { label: '类别', key: 'category' },
  { label: '购入金额', get: (r) => Number(r.price).toFixed(2) }, { label: '状态', get: (r) => ASSET_STATUS[r.status]?.label || r.status },
  { label: '使用人', get: (r) => r.userName || '' }, { label: '使用部门', get: (r) => r.deptName || '' }, { label: '登记日期', get: (r) => dateOf(r.registeredAt) }
]
async function exportCsv() {
  exporting.value = true
  try {
    const r = await listAssets({ ...query(), page: 1, pageSize: 100000 })
    downloadCsv(`资产台账_${today()}.csv`, CSV_COLUMNS, r.rows)
    ElMessage.success(`已导出 ${r.rows.length} 条资产`)
  } catch (e) { ElMessage.error(e.message || '导出失败，请重试') } finally { exporting.value = false }
}

// 抽屉 / 弹窗里有未保存修改时，路由离开与身份切换共用同一条确认规则
useDirtyGuard(() => isEditorDirty() || isAssignDirty())

onMounted(() => {
  const fromDash = route.query.mine === '1' || demoParam('mine') === '1'
  const mem = recallList('assets')
  if (fromDash) { mine.value = true; filters.status = applied.status = 'inuse' }   // 工作台带入优先于列表记忆
  else if (mem) { const m = { ...blankFilters(), ...(mem.applied || {}) }; Object.assign(applied, m); Object.assign(filters, m); mine.value = !!mem.mine; page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value }
  if (demo === 'error') session.failNext.list = true   // 演示：首次加载失败一次，重试即成功
  load()
  const d = demoParam('drawer'), e = demoParam('edit'), a = demoParam('assign')
  if (d) openDetail(d)
  else if (e && manage.value) (e === 'new' ? openCreate() : openEdit(e))
  else if (a && manage.value) openAssign(a)
})
</script>

<template>
  <div class="page-head">
    <div><h1>资产台账</h1><p>共 <b class="num">{{ visibleCount }}</b> 件<template v-if="!viewAll"> · 仅显示本人在用资产</template></p></div>
    <div class="actions">
      <el-button v-if="canExport" :disabled="state !== 'ready' || !total" :title="state === 'ready' && !total ? '暂无可导出数据' : undefined" :loading="exporting" @click="exportCsv"><Export class="i-icon--sm" />导出</el-button>
      <el-button v-if="manage" type="primary" @click="openCreate"><Plus class="i-icon--sm" />新增资产</el-button>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="资产编号 / 名称" aria-label="搜索资产编号或名称" clearable style="width: var(--layout-search-width)" @keyup.enter="search" />
        <el-select v-model="filters.category" aria-label="类别" style="width: 140px"><el-option label="全部类别" :value="ALL" /><el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" /></el-select>
        <template v-if="viewAll">
          <el-select v-model="filters.status" aria-label="状态" style="width: 130px"><el-option label="全部状态" :value="ALL" /><el-option v-for="(v, k) in ASSET_STATUS" :key="k" :label="v.label" :value="k" /></el-select>
          <el-select v-model="filters.deptId" aria-label="使用部门" style="width: 150px"><el-option label="全部部门" :value="ALL" /><el-option v-for="d in db.departments" :key="d.id" :label="d.name" :value="d.id" /></el-select>
        </template>
      </div>
      <div class="acts"><el-button type="primary" @click="search">查询</el-button><el-button text @click="reset">重置</el-button></div>
    </div>
    <div v-if="chips.length" class="chips">
      <span v-for="c in chips" :key="c.key" class="chip" :title="viewAll ? undefined : '申请人仅可查看本人在用资产，此范围不可解除'">
        {{ c.label }}<button v-if="viewAll" type="button" class="x" :aria-label="`移除条件：${c.label}`" @click="clearMine"><Close class="i-icon--xs" /></button>
      </span>
      <span v-if="!viewAll" class="chips-note">本人范围不可解除</span>
    </div>

    <TableSkeleton v-if="state === 'loading'" :rows="Math.min(pageSize, 10)" :cols="skelCols" />
    <div v-else-if="state === 'error'" class="error-box"><Attention class="i-icon--md" />{{ errorMsg }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length && !hasConditions" class="empty">
      <div class="illu"><Box class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
      <b>{{ viewAll ? '还没有登记任何资产' : '你目前没有在用资产' }}</b>
      <span>{{ viewAll ? '管理员登记资产后会显示在这里' : '管理员把资产分配给你之后会显示在这里' }}</span>
      <el-button v-if="manage" type="primary" @click="openCreate"><Plus class="i-icon--sm" />新增资产</el-button>
    </div>
    <div v-else-if="!rows.length" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>未找到符合条件的数据</b><span>试试放宽或清空筛选条件</span>
      <el-button @click="reset">重置筛选</el-button>
    </div>
    <template v-else>
      <el-table :data="rows" style="width: 100%">
        <el-table-column label="资产编号" min-width="170"><template #default="{ row }"><button type="button" class="link mono" @click="openDetail(row.id)">{{ row.no }}</button></template></el-table-column>
        <el-table-column label="名称 / 规格" min-width="220"><template #default="{ row }">{{ row.name }}<span class="sub">{{ dash(row.spec) }}</span></template></el-table-column>
        <el-table-column prop="category" label="类别" width="110" />
        <el-table-column label="购入金额" width="130" align="right"><template #default="{ row }"><span class="num">{{ money(row.price) }}</span></template></el-table-column>
        <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="ASSET_STATUS[row.status]?.tone">{{ ASSET_STATUS[row.status]?.label || row.status }}</span></template></el-table-column>
        <el-table-column label="使用人 / 部门" min-width="150">
          <template #default="{ row }"><template v-if="row.status === 'inuse'">{{ row.userName }}<span class="sub">{{ row.deptName }}</span></template><span v-else class="muted">—</span></template>
        </el-table-column>
        <el-table-column label="登记日期" width="120"><template #default="{ row }"><span class="num">{{ dateOf(row.registeredAt) }}</span></template></el-table-column>
        <el-table-column label="操作" :width="manage ? 190 : 90" fixed="right">
          <template #default="{ row }">
            <button type="button" class="act" @click="openDetail(row.id)">查看</button>
            <template v-if="manage">
              <button type="button" class="act" @click="openEdit(row)">编辑</button>
              <button v-if="row.status === 'idle'" type="button" class="act" @click="openAssign(row)">分配</button>
              <button v-else type="button" class="act" @click="doReturn(row)">归还</button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="load" @size-change="onSize" /></div>
    </template>
  </el-card>

  <!-- 详情抽屉：资产信息（描述列表）/ 使用记录（时间线）；来源申请按记录级权限决定是否给出链接 -->
  <el-drawer v-model="detail.open" title="资产详情" size="var(--layout-drawer-width)" :close-on-click-modal="false">
    <el-skeleton v-if="detail.loading" :rows="8" animated />
    <div v-else-if="detail.missing" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>记录不存在或已被删除</b><span>该资产可能已被移除，或不在你的可见范围内</span>
    </div>
    <el-tabs v-else-if="detail.asset" v-model="detail.tab" class="dtabs">
      <el-tab-pane label="资产信息" name="info">
        <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
          <el-descriptions-item label="资产编号"><span class="mono">{{ detail.asset.no }}</span></el-descriptions-item>
          <el-descriptions-item label="名称">{{ detail.asset.name }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ dash(detail.asset.spec) }}</el-descriptions-item>
          <el-descriptions-item label="类别">{{ detail.asset.category }}</el-descriptions-item>
          <el-descriptions-item label="购入金额"><span class="num">{{ money(detail.asset.price) }}</span></el-descriptions-item>
          <el-descriptions-item label="购入日期"><span class="num">{{ dateOf(detail.asset.purchaseDate) }}</span></el-descriptions-item>
          <el-descriptions-item label="存放位置">{{ dash(detail.asset.location) }}</el-descriptions-item>
          <el-descriptions-item label="状态"><span class="status" :class="ASSET_STATUS[detail.asset.status]?.tone">{{ ASSET_STATUS[detail.asset.status]?.label }}</span></el-descriptions-item>
          <el-descriptions-item label="使用人 / 部门">{{ detail.asset.status === 'inuse' ? `${detail.asset.userName} · ${detail.asset.deptName}` : '—' }}</el-descriptions-item>
          <el-descriptions-item label="来源申请">
            <template v-if="!detail.asset.sourceAppId">—</template>
            <template v-else-if="!sourceApp"><span class="muted">已关联采购申请（记录不存在或已被删除）</span></template>
            <template v-else-if="canOpenSource"><button type="button" class="link mono" @click="goSource">{{ sourceApp.no }}</button><span class="sub">{{ sourceApp.title }}</span></template>
            <template v-else><span class="muted">已关联采购申请</span></template>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ dash(detail.asset.note) }}</el-descriptions-item>
          <el-descriptions-item label="登记时间"><span class="num">{{ timeOf(detail.asset.registeredAt) }}</span></el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="使用记录" name="history">
        <el-timeline v-if="history.length">
          <el-timeline-item v-for="(h, i) in history" :key="i" :timestamp="timeOf(h.at)" placement="top" :type="h.type === 'assigned' ? 'success' : undefined">
            <div class="tl-title">{{ historyTitle(h) }}</div>
            <span v-if="historyMeta(h)" class="tl-meta">{{ historyMeta(h) }}</span>
            <span v-if="h.note" class="tl-meta">备注：{{ h.note }}</span>
          </el-timeline-item>
        </el-timeline>
        <div v-else class="empty"><b>暂无使用记录</b></div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="detail.open = false">关闭</el-button>
      <el-button v-if="manage && detail.asset" type="primary" @click="editFromDetail">编辑</el-button>
    </template>
  </el-drawer>

  <!-- 新增 / 编辑抽屉（管理员）：编号系统生成；在用资产编辑基础资料不改变使用人与状态 -->
  <el-drawer v-model="editor.open" :title="editor.id ? '编辑资产' : '新增资产'" size="var(--layout-drawer-width)" :close-on-click-modal="false" :before-close="closeEditor">
    <el-form ref="editorRef" :model="editor.form" :rules="rules" label-position="right" scroll-to-error @submit.prevent="save">
      <el-form-item label="资产编号"><el-input :model-value="editor.no || '系统生成'" readonly class="ro" aria-label="资产编号，由系统生成" /></el-form-item>
      <el-form-item label="名称" prop="name"><el-input v-model="editor.form.name" maxlength="50" show-word-limit placeholder="如：27 英寸 4K 校色显示器" /></el-form-item>
      <el-form-item label="类别" prop="category"><el-select v-model="editor.form.category" placeholder="请选择类别" style="width: 100%"><el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" /></el-select></el-form-item>
      <el-form-item label="规格" prop="spec"><el-input v-model="editor.form.spec" maxlength="100" show-word-limit placeholder="选填，如：32G / 1T" /></el-form-item>
      <el-form-item label="购入金额" prop="price">
        <div class="unit-row"><el-input-number v-model="editor.form.price" :min="0.01" :max="99999.99" :precision="2" :step="100" controls-position="right" aria-label="购入金额，元" /><span class="unit">元</span></div>
      </el-form-item>
      <el-form-item label="购入日期" prop="purchaseDate"><el-date-picker v-model="editor.form.purchaseDate" type="date" value-format="YYYY-MM-DD" placeholder="不晚于基准日" :disabled-date="afterToday" style="width: 100%" /></el-form-item>
      <el-form-item label="存放位置" prop="location"><el-input v-model="editor.form.location" maxlength="50" show-word-limit placeholder="如：产品设计区 A-03" /></el-form-item>
      <el-form-item label="来源申请" prop="sourceAppId">
        <el-select v-model="editor.form.sourceAppId" filterable clearable placeholder="选填，仅可选择已通过的申请" style="width: 100%">
          <el-option v-for="a in approvedApps" :key="a.id" :label="`${a.no} · ${a.title}`" :value="a.id" />
        </el-select>
        <div class="help">仅用于追溯，一单可关联多件资产，不回写采购单</div>
      </el-form-item>
      <el-form-item label="备注" prop="note"><el-input v-model="editor.form.note" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="选填" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeEditor()">取消</el-button>
      <el-button type="primary" :loading="editor.saving" @click="save">{{ editor.id ? '保存' : '登记' }}</el-button>
    </template>
  </el-drawer>

  <!-- 分配小弹窗：启用成员选择器 + 只读部门 + 备注 -->
  <el-dialog v-model="assign.open" title="分配资产" :width="'var(--layout-modal-width-sm)'" :close-on-click-modal="false" :before-close="closeAssign">
    <p v-if="assign.asset" class="hint">将「{{ assign.asset.name }}」<span class="mono">{{ assign.asset.no }}</span> 分配给一名启用成员，确认后资产变为在用。</p>
    <el-form ref="assignRef" :model="assign" :rules="assignRules" label-position="right" @submit.prevent="confirmAssign">
      <el-form-item label="使用人" prop="userId">
        <el-select v-model="assign.userId" filterable placeholder="搜索姓名或部门" style="width: 100%">
          <el-option v-for="m in members" :key="m.id" :label="`${m.name} · ${m.deptName}`" :value="m.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="使用部门"><el-input :model-value="assignDept || '—'" readonly class="ro" aria-label="使用部门，随使用人自动带出" /></el-form-item>
      <el-form-item label="备注" prop="note"><el-input v-model="assign.note" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="选填" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeAssign()">取消</el-button>
      <el-button type="primary" :loading="assign.saving" @click="confirmAssign">确认分配</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.muted { color: var(--color-text-muted); }
/* 单号用 <button> 承载（不导航的动作）：只清掉浏览器给按钮的底、边、内边距，字体三项交给 .link / .mono */
button.link { background: transparent; border: 0; padding: 0; font-size: inherit; line-height: inherit; text-align: left; }
/* chip 的 × 用 <button>（可聚焦、有 aria-label），命中区补到 control.hit-min，视觉不变 */
.chip .x { background: transparent; border: 0; padding: 0; color: inherit; display: inline-grid; place-items: center; min-width: var(--control-hit-min); min-height: var(--control-hit-min); margin-right: calc(-1 * var(--spacing-1-5)); }
.chips-note { align-self: center; font-size: var(--text-small-size); color: var(--color-text-muted); }
/* 抽屉内页签：与卡内页签同形，头部与内容间距一档 */
.dtabs :deep(.el-tabs__header) { margin-bottom: var(--spacing-4); }
.tl-title { font-size: var(--text-body-sm-size); color: var(--color-text-primary); }
.tl-meta { display: block; font-size: var(--text-small-size); color: var(--color-text-muted); margin-top: var(--spacing-0-5); }
/* 只读输入：bg.readonly + text.secondary（可读可复制，不可改） */
.ro :deep(.el-input__wrapper) { background: var(--color-bg-readonly); }
.ro :deep(.el-input__inner) { color: var(--color-text-secondary); }
.unit-row { display: flex; align-items: center; gap: var(--space-inline); width: 100%; }
.unit-row .el-input-number { flex: 1; }
.unit { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); white-space: nowrap; }
.help { margin-top: var(--spacing-1); width: 100%; line-height: var(--text-body-line-height); }
.hint { margin: 0 0 var(--spacing-4); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
</style>
