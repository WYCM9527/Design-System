<script setup>
// P05 审批中心（PRD §5 P05）：「待我审批 / 我已处理」两个页签 + 筛选 + 队列表格 + 右侧处理抽屉。
// 列表页约定见 AGENTS.md（pageSize 取设置、rememberList/recallList、骨架 / 失败重试 / 空态区分）。
// 演示参数（放在 # 之前）：?tab=pending|done、?state=loading|error|empty、?drawer=<appId>。
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Audit, Search, Attention, Refresh, Right, Pic, FilePdf } from '@icon-park/vue-next'
import TableSkeleton from '../styles/bridge/vue/TableSkeleton.vue'
import { db } from '../data/db'
import { session, rememberList, recallList, demoState, demoParam } from '../data/session'
import { listApprovals, decideApplication, pendingCount, getApplication } from '../data/api'
import { APP_STATUS, PAGE_SIZES } from '../data/constants'
import { money, dateOf, timeOf, dash, lineSubtotal, fileSize } from '../data/format'
import ConfirmBar from '../styles/bridge/vue/ConfirmBar.vue'
import { useInlineConfirm } from '../styles/bridge/vue/inlineConfirm.js'

const router = useRouter()
const KEY = 'approvals'
const cardRef = ref()

// ── 页签 / 筛选 / 分页 ──
const tab = ref('pending')
const isDone = computed(() => tab.value === 'done')
const EMPTY_FILTER = { keyword: '', deptId: 'all', result: 'all' }
const filters = reactive({ ...EMPTY_FILTER })   // 输入中的条件
const applied = reactive({ ...EMPTY_FILTER })   // 点「查询」后生效的条件
const page = ref(1), pageSize = ref(db.settings.pageSize || 10), total = ref(0)
const rows = ref([]), loading = ref(true), error = ref('')
const depts = computed(() => db.departments)
const pendingTotal = computed(() => pendingCount())
const hasFilter = computed(() => !!applied.keyword || applied.deptId !== 'all' || (isDone.value && applied.result !== 'all'))
const skelCols = computed(() => (isDone.value ? [190, 160, 130, 120, 80, 170, 92, 170, 84] : [190, 340, 130, 120, 80, 170, 84]))

let seq = 0
let demoOnce = demoState()   // 演示状态只影响首次加载
async function load() {
  const my = ++seq
  const demo = demoOnce; demoOnce = ''
  if (demo === 'loading') { loading.value = true; return }
  loading.value = true; error.value = ''
  try {
    const f = { keyword: applied.keyword, deptId: applied.deptId === 'all' ? '' : applied.deptId, result: isDone.value && applied.result !== 'all' ? applied.result : '', page: page.value, pageSize: pageSize.value }
    const res = demo === 'empty' ? { rows: [], total: 0 } : await listApprovals(tab.value, f)
    if (my !== seq) return
    if (!res.rows.length && res.total > 0 && page.value > 1) { page.value = Math.max(1, Math.ceil(res.total / pageSize.value)); return load() }   // 当前页空了退到上一页
    rows.value = res.rows; total.value = res.total
    rememberList(KEY, { tab: tab.value, applied: { ...applied }, page: page.value, pageSize: pageSize.value })
  } catch (e) {
    if (my === seq) error.value = e.message || '列表加载失败，请重试'
  } finally {
    if (my === seq) loading.value = false
  }
}
function search() { Object.assign(applied, filters); page.value = 1; load() }
function reset() { Object.assign(filters, EMPTY_FILTER); search() }
function onTab() { filters.result = 'all'; applied.result = 'all'; page.value = 1; load() }
function onSize() { page.value = 1; load() }

onMounted(async () => {
  const mem = recallList(KEY)
  if (mem) {
    tab.value = mem.tab === 'done' ? 'done' : 'pending'
    Object.assign(applied, EMPTY_FILTER, mem.applied || {}); Object.assign(filters, applied)
    page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value
  }
  const t = demoParam('tab'); if (t === 'pending' || t === 'done') tab.value = t
  if (demoState() === 'error') session.failNext.list = true   // 首次加载失败一次，重试即恢复
  await load()
  const d = demoParam('drawer'); if (d) openById(d)
})

// ── 处理抽屉 ──
const drawer = reactive({ open: false, app: null, opinion: '', error: '', acting: '' })
const opinionRef = ref()
let trigger = null   // 打开抽屉的「处理」按钮，关闭后把焦点还回去
function openDrawer(row, ev) { trigger = ev?.currentTarget || null; drawer.app = row; drawer.opinion = ''; drawer.error = ''; drawer.open = true }
async function openById(id) {
  const app = await getApplication(id)
  if (!app) { ElMessage.error('记录不存在或已被删除'); return }
  if (app.status !== 'pending') { ElMessage.warning('该申请已处理，请刷新列表'); return }
  openDrawer(app)
}
function onOpened() { opinionRef.value?.focus() }
function onClosed() {
  const t = trigger; trigger = null; drawer.app = null; drawer.error = ''
  const focusBack = () => {
    if (t && t.isConnected) { t.focus(); return }
    const el = cardRef.value?.$el
    const next = el?.querySelector('.el-table .act') || el?.querySelector('.el-tabs__item.is-active')
    next?.focus()
  }
  if (loading.value) { const stop = watch(loading, (v) => { if (!v) { stop(); nextTick(focusBack) } }) } else nextTick(focusBack)
}
// Esc / 右上角 × / 底部「取消」共用：处理中不允许关；已输入意见先确认
const leave = useInlineConfirm()   // 浮层内不叠第二层弹窗：确认条替换抽屉页脚（PRD §1.1 原位确认）
async function beforeClose(done) {
  if (drawer.acting) return
  if (drawer.opinion.trim() && !(await leave.ask({ message: '审批意见尚未提交，关闭后会丢失。', confirmText: '确定关闭', cancelText: '继续填写' }))) return
  done()
}
function requestClose() { beforeClose(() => { drawer.open = false }) }
async function goDetail() {
  if (drawer.opinion.trim() && !(await leave.ask({ message: '审批意见尚未提交，离开后会丢失。', confirmText: '确定离开', cancelText: '继续填写' }))) return
  router.push(`/applications/${drawer.app.id}`)
}
async function decide(result) {
  if (drawer.acting || !drawer.app) return
  const op = drawer.opinion.trim()
  if (result === 'rejected' && !op) { drawer.error = '驳回时必须填写审批意见'; opinionRef.value?.focus(); return }
  if (op && (op.length < 2 || op.length > 200)) { drawer.error = '审批意见需为 2–200 字'; opinionRef.value?.focus(); return }
  drawer.error = ''; drawer.acting = result
  try {
    const app = await decideApplication(drawer.app.id, result, op)
    drawer.opinion = ''; drawer.open = false
    ElMessage.success(result === 'approved' ? `已通过「${app.title}」` : `已驳回「${app.title}」`)
    load()
  } catch (e) {
    if (e.code === 'stale') { ElMessage.warning('该申请已处理，请刷新列表'); drawer.opinion = ''; drawer.open = false; load() }
    else ElMessage.error(e.message || '提交失败，请稍后重试')   // 保留意见，可重试
  } finally { drawer.acting = '' }
}
const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
</script>

<template>
  <div class="page-head">
    <div><h1>审批中心</h1><p>待我审批 <b class="num">{{ pendingTotal }}</b> 条 · 已排除你本人提交的申请；「我已处理」只显示由你完成的审批</p></div>
  </div>

  <el-card ref="cardRef" class="flat">
    <el-tabs v-model="tab" class="tabs" @tab-change="onTab">
      <el-tab-pane name="pending"><template #label>待我审批<span class="badge neutral num tab-count">{{ pendingTotal }}</span></template></el-tab-pane>
      <el-tab-pane name="done" label="我已处理" />
    </el-tabs>

    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="单号 / 标题" aria-label="搜索单号或标题" clearable class="kw" @keyup.enter="search" />
        <el-select v-model="filters.deptId" aria-label="所属部门" class="sel">
          <el-option label="全部部门" value="all" />
          <el-option v-for="d in depts" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
        <el-select v-if="isDone" v-model="filters.result" aria-label="审批结果" class="sel">
          <el-option label="全部结果" value="all" />
          <el-option label="通过" value="approved" />
          <el-option label="驳回" value="rejected" />
        </el-select>
      </div>
      <div class="acts"><el-button type="primary" @click="search">查询</el-button><el-button text @click="reset">重置</el-button></div>
    </div>

    <TableSkeleton v-if="loading" :rows="Math.min(pageSize, 10)" :cols="skelCols" />
    <div v-else-if="error" class="error-box"><Attention class="i-icon--md" />{{ error }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length" class="empty">
      <div v-if="hasFilter" class="illu"><Search class="i-icon--2xl i-icon--muted" /></div>
      <div v-else class="illu"><Audit class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
      <b>{{ hasFilter ? '未找到符合条件的申请' : isDone ? '暂无已处理记录' : '暂无待审批申请' }}</b>
      <span v-if="hasFilter">试试放宽条件，或 <button type="button" class="act" @click="reset">重置筛选</button></span>
      <span v-else>{{ isDone ? '你通过或驳回的申请会记录在这里' : '其他成员提交采购申请后，会在这里等待你处理' }}</span>
    </div>

    <template v-else>
      <el-table :key="tab" :data="rows" row-key="id" style="width: 100%">
        <el-table-column label="单号" width="190">
          <template #default="{ row }"><router-link class="link mono" :to="`/applications/${row.id}`">{{ row.no }}</router-link></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="申请人 / 部门" width="130">
          <template #default="{ row }">{{ row.applicantName }}<span class="sub">{{ row.deptName }}</span></template>
        </el-table-column>
        <el-table-column label="总金额" width="120" align="right">
          <template #default="{ row }"><span class="num">{{ money(row.total) }}</span></template>
        </el-table-column>
        <el-table-column label="优先级" width="80">
          <template #default="{ row }"><span v-if="row.priority === 'urgent'" class="status error">紧急</span><span v-else class="plain">普通</span></template>
        </el-table-column>
        <el-table-column label="提交时间" width="170">
          <template #default="{ row }"><span class="num nowrap">{{ timeOf(row.submittedAt) }}</span></template>
        </el-table-column>
        <template v-if="isDone">
          <el-table-column label="结果" width="92">
            <template #default="{ row }"><span class="status" :class="APP_STATUS[row.status].tone">{{ APP_STATUS[row.status].label }}</span></template>
          </el-table-column>
          <el-table-column label="处理时间" width="170">
            <template #default="{ row }"><span class="num nowrap">{{ timeOf(row.decidedAt) }}</span></template>
          </el-table-column>
        </template>
        <el-table-column label="操作" width="84">
          <template #default="{ row }">
            <button v-if="!isDone" type="button" class="act" @click="openDrawer(row, $event)">处理</button>
            <router-link v-else class="act" :to="`/applications/${row.id}`">查看</router-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="load" @size-change="onSize" />
      </div>
    </template>
  </el-card>

  <!-- 处理抽屉：只读展示 + 底部审批意见与决定 -->
  <el-drawer v-model="drawer.open" :size="'var(--layout-drawer-width)'" :close-on-click-modal="false" :before-close="beforeClose" @opened="onOpened" @closed="onClosed">
    <template #header="{ titleId, titleClass }">
      <h3 :id="titleId" :class="titleClass" class="drawer-title">处理申请 · <span class="mono">{{ drawer.app?.no }}</span></h3>
    </template>
    <template v-if="drawer.app">
      <h4 class="drawer-h">基础信息</h4>
      <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
        <el-descriptions-item label="标题">{{ drawer.app.title }}</el-descriptions-item>
        <el-descriptions-item label="申请人 / 部门">{{ drawer.app.applicantName }} · {{ drawer.app.deptName }}</el-descriptions-item>
        <el-descriptions-item label="优先级"><span v-if="drawer.app.priority === 'urgent'" class="status error">紧急</span><template v-else>普通</template></el-descriptions-item>
        <el-descriptions-item label="期望到货"><span class="num">{{ dateOf(drawer.app.expectDate) }}</span></el-descriptions-item>
        <el-descriptions-item label="供应商">{{ dash(drawer.app.supplierName) }}</el-descriptions-item>
        <el-descriptions-item label="提交时间"><span class="num">{{ timeOf(drawer.app.submittedAt) }}</span></el-descriptions-item>
      </el-descriptions>

      <h4 class="drawer-h">采购用途</h4>
      <p class="purpose">{{ dash(drawer.app.purpose) }}</p>

      <h4 class="drawer-h">采购明细</h4>
      <el-table :data="drawer.app.lines" size="small" class="dlines">
        <el-table-column label="物品" min-width="116">
          <template #default="{ row }">{{ row.name }}<span class="sub">{{ [row.category, row.spec].filter(Boolean).join(' · ') || '—' }}</span></template>
        </el-table-column>
        <el-table-column label="数量" width="64" align="right"><template #default="{ row }"><span class="num">{{ row.qty }}</span></template></el-table-column>
        <el-table-column label="单价" width="120" align="right"><template #default="{ row }"><span class="num nowrap">{{ money(row.price) }}</span></template></el-table-column>
        <el-table-column label="小计" width="128" align="right"><template #default="{ row }"><span class="num nowrap">{{ money(lineSubtotal(row)) }}</span></template></el-table-column>
      </el-table>
      <div class="dsum">总数量 <b class="num">{{ drawer.app.qty }}</b> · 预估总金额 <b class="num">{{ money(drawer.app.total) }}</b></div>

      <h4 class="drawer-h">附件</h4>
      <ul v-if="drawer.app.attachments?.length" class="dfiles">
        <li v-for="f in drawer.app.attachments" :key="f.id"><component :is="isPdf(f) ? FilePdf : Pic" class="i-icon--md i-icon--muted" aria-hidden="true" /><span class="fname" :title="f.name">{{ f.name }}</span><span class="fsize num">{{ fileSize(f.size) }}</span></li>
      </ul>
      <p v-else class="muted">无附件</p>
      <p class="dgo"><a class="go" :href="`#/applications/${drawer.app.id}`" @click.prevent="goDetail">查看完整详情<Right class="i-icon--sm" /></a><span class="help">预览附件、查看流转记录请进入详情页</span></p>
    </template>
    <template #footer>
      <ConfirmBar v-if="leave.state.open" v-bind="leave.state" @confirm="leave.confirm" @cancel="leave.cancel" />
      <el-form v-else-if="drawer.app" label-position="top" class="decide" @submit.prevent>
        <el-form-item :error="drawer.error">
          <template #label>审批意见<span class="help">通过时选填，驳回时必填；填写时 2–200 字</span></template>
          <el-input ref="opinionRef" v-model="drawer.opinion" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="填写审批意见" @input="drawer.error = ''" />
        </el-form-item>
        <div class="decide-acts">
          <el-button text :disabled="!!drawer.acting" @click="requestClose">取消</el-button>
          <el-button type="danger" text :loading="drawer.acting === 'rejected'" :disabled="drawer.acting === 'approved'" @click="decide('rejected')">驳回</el-button>
          <el-button type="primary" :loading="drawer.acting === 'approved'" :disabled="drawer.acting === 'rejected'" @click="decide('approved')">通过</el-button>
        </div>
      </el-form>
    </template>
  </el-drawer>
</template>

<style scoped>
/* 页签放卡内、与筛选栏共用水平内边距；页签本身不承载内容（内容区在下方共用），隐藏空的 content */
.tabs :deep(.el-tabs__header) { margin: 0; padding: 0 var(--space-card); }
.tabs :deep(.el-tabs__content) { display: none; }
.tab-count { margin-left: var(--spacing-1-5); }
/* 筛选控件宽度按内容定（不是 token）：关键词框用 layout.search-width，下拉取其 0.6 */
.kw { width: var(--layout-search-width); }
.sel { width: calc(var(--layout-search-width) * 0.6); }
.plain { color: var(--color-text-secondary); }

/* 抽屉：分组小标题 title-sm + label 字重，首个不加上外边距 */
.drawer-title { margin: 0; flex: 1; font-size: var(--text-title-size); font-weight: var(--text-weight-strong); }
.purpose { margin: 0; line-height: var(--text-paragraph-line-height); white-space: pre-wrap; word-break: break-word; }
.dsum { margin-top: var(--spacing-3); text-align: right; color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.dsum b { color: var(--color-text-primary); font-weight: var(--text-weight-strong); }
.dfiles { list-style: none; margin: 0; padding: 0; border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); }
.dfiles li { display: flex; align-items: center; gap: var(--spacing-2-5); min-height: var(--control-height-md); padding: var(--spacing-1-5) var(--spacing-3); font-size: var(--text-body-sm-size); }
.dfiles li + li { border-top: var(--border-width-default) solid var(--color-border-default); }
.fname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fsize { color: var(--color-text-muted); font-size: var(--text-small-size); white-space: nowrap; }
.muted { margin: 0; color: var(--color-text-muted); }
.dgo { display: flex; align-items: center; gap: var(--spacing-3); margin: var(--space-stack) 0 0; flex-wrap: wrap; }

/* 底部固定区：意见 + 决定。驳回用危险文字按钮（红字浅红底），与主按钮「通过」拉开层级；实底红只留给二次确认 */
.decide :deep(.el-form-item) { margin-bottom: var(--spacing-3); }
.decide :deep(.el-form-item__label) { display: flex; align-items: baseline; gap: var(--spacing-2); }
.decide-acts { display: flex; justify-content: flex-end; align-items: center; }
</style>
