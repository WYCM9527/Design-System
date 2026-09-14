<script setup>
// 供应商管理（PRD P07）：列表 → 只读资料抽屉 → 新增 / 编辑抽屉 → 启用 / 停用（停用二次确认）。不提供删除与批量。
// 列表页约定见 AGENTS.md；演示参数放在 # 之前：?state=loading|error|empty、?drawer=<id>、?edit=<id>|new。
import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import {ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { Plus, Refresh, Attention, Shop, FileSearch } from '@icon-park/vue-next'
import TableSkeleton from '../styles/bridge/vue/TableSkeleton.vue'
import { db } from '../data/db'
import { session, can, rememberList, recallList, demoState, demoParam } from '../data/session'
import { listSuppliers, saveSupplier, toggleSupplier } from '../data/api'
import { PAGE_SIZES } from '../data/constants'
import { timeOf, dash } from '../data/format'
import { useDirtyGuard } from '../data/guard'
import ConfirmBar from '../styles/bridge/vue/ConfirmBar.vue'
import { useInlineConfirm } from '../styles/bridge/vue/inlineConfirm.js'

const manage = computed(() => can('supplier.manage'))
const totalCount = computed(() => db.suppliers.length)   // 页头「共 N 家」= 全部供应商数，不随筛选变化
// 启用 / 停用只有两态：启用 success、停用 neutral（无倾向状态）
const STATUS = { true: { label: '启用', tone: 'success' }, false: { label: '停用', tone: 'neutral' } }
const statusOf = (s) => STATUS[String(!!s.active)]

// ── 列表：筛选栏输入与已生效条件分开，点「查询」才生效；active 为 'all' | true | false（'all' 是真实选项「全部状态」，Element 把 '' 当作未选） ──
const ALL = 'all'
const blankFilters = () => ({ keyword: '', active: ALL })
const filters = reactive(blankFilters())
const applied = reactive(blankFilters())
const page = ref(1), pageSize = ref(db.settings.pageSize || 10)
const rows = ref([]), total = ref(0)
const state = ref('loading')   // loading | error | ready
const errorMsg = ref('')
const demo = demoState()
let demoEmptyOnce = demo === 'empty'
const SKEL_COLS = [200, 100, 160, 220, 90, 160, 190]

const query = () => ({ keyword: applied.keyword, active: applied.active === ALL ? '' : applied.active, page: page.value, pageSize: pageSize.value })
const hasConditions = computed(() => applied.keyword !== '' || applied.active !== ALL)

async function load() {
  if (demo === 'loading') return
  state.value = 'loading'
  try {
    const r = await listSuppliers(query())
    if (demoEmptyOnce) { demoEmptyOnce = false; r.rows = []; r.total = 0 }
    if (!r.rows.length && r.total && page.value > 1) { page.value = Math.max(1, Math.ceil(r.total / pageSize.value)); return load() }
    rows.value = r.rows; total.value = r.total; state.value = 'ready'
    rememberList('suppliers', { applied: { ...applied }, page: page.value, pageSize: pageSize.value })
  } catch (e) { errorMsg.value = e.message || '列表加载失败，请重试'; state.value = 'error' }
}
function search() { Object.assign(applied, filters); page.value = 1; load() }
function reset() { Object.assign(filters, blankFilters()); Object.assign(applied, blankFilters()); page.value = 1; load() }
function onSize() { page.value = 1; load() }

// ── 查看抽屉：只读资料 ──
const view = reactive({ open: false, row: null, missing: false })
function openView(s) {
  const src = typeof s === 'string' ? db.suppliers.find((x) => x.id === s) : s
  view.row = src || null; view.missing = !src; view.open = true
}
function editFromView() { const s = view.row; view.open = false; openEdit(s) }

// ── 新增 / 编辑抽屉 ──
const blankForm = () => ({ name: '', contact: '', phone: '', email: '', address: '', note: '' })
const editor = reactive({ open: false, id: '', saving: false, form: blankForm(), snapshot: '' })
const editorRef = ref()
const fieldErrors = reactive({ name: '' })   // 服务端错误（重名）落到字段
const lengthRule = (label, min, max) => ({ validator: (r, v, cb) => { const n = (v || '').trim().length; cb(n >= min && n <= max ? undefined : new Error(`${label}去除首尾空格后需 ${min}–${max} 字`)) }, trigger: 'blur' })
const rules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }, lengthRule('名称', 2, 50)],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }, lengthRule('联系人', 1, 20)],
  phone: [{ validator: (r, v, cb) => cb(!v || /^[0-9+\-() ]{7,20}$/.test(v) ? undefined : new Error('电话为 7–20 位，只能包含数字及 + - ( ) 空格')), trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  address: [{ max: 200, message: '地址不超过 200 字', trigger: 'blur' }],
  note: [{ max: 200, message: '备注不超过 200 字', trigger: 'blur' }]
}
const isEditorDirty = () => editor.open && JSON.stringify(editor.form) !== editor.snapshot
function openEditor(src) {
  editor.id = src?.id || ''
  editor.form = src ? { name: src.name, contact: src.contact, phone: src.phone || '', email: src.email || '', address: src.address || '', note: src.note || '' } : blankForm()
  editor.snapshot = JSON.stringify(editor.form); fieldErrors.name = ''; editor.open = true
  nextTick(() => editorRef.value?.clearValidate())
}
const openCreate = () => openEditor(null)
function openEdit(s) { const src = typeof s === 'string' ? db.suppliers.find((x) => x.id === s) : s; if (!src) return ElMessage.error('记录不存在或已被删除'); openEditor(src) }
const leaveEditor = useInlineConfirm()   // 浮层内原位确认，不叠弹窗
async function closeEditor(done) { if (isEditorDirty() && !(await leaveEditor.ask({ message: '供应商资料有未保存的修改，关闭后会丢失。', confirmText: '放弃修改', cancelText: '继续编辑', danger: true }))) return; done ? done() : (editor.open = false) }
async function save() {
  fieldErrors.name = ''
  const ok = await editorRef.value.validate().catch(() => false)
  if (!ok) return
  editor.saving = true
  try {
    await saveSupplier({ id: editor.id || undefined, ...editor.form })
    ElMessage.success('供应商已保存')
    editor.snapshot = JSON.stringify(editor.form); editor.open = false
    load()
  } catch (e) {
    if (e.code === 'duplicate') { fieldErrors.name = e.message; nextTick(() => editorRef.value?.scrollToField('name')) }   // 重名落到字段
    else ElMessage.error(e.message || '保存失败，请重试')
  } finally { editor.saving = false }   // 失败保留输入
}

// ── 启用 / 停用：停用需确认（原位处理中），启用直接执行 ──
async function activate(s) {
  try { await toggleSupplier(s.id, true); ElMessage.success(`已启用「${s.name}」`); load() }
  catch (e) { ElMessage.error(e.message || '操作失败，请重试') }
}
function deactivate(s) {
  confirmBox(`停用后不可用于新申请，历史申请不受影响。确认停用「${s.name}」？`, '停用供应商', {
    confirmButtonText: '确认停用', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger',
    beforeClose: async (action, instance, done) => {
      if (action !== 'confirm') return done()
      instance.confirmButtonLoading = true
      try { await toggleSupplier(s.id, false); ElMessage.success(`已停用「${s.name}」`); done(); load() }
      catch (e) { ElMessage.error(e.message || '操作失败，请重试') }
      finally { instance.confirmButtonLoading = false }
    }
  }).catch(() => {})
}

useDirtyGuard(isEditorDirty)

onMounted(() => {
  const mem = recallList('suppliers')
  if (mem) { const m = { ...blankFilters(), ...(mem.applied || {}) }; Object.assign(applied, m); Object.assign(filters, m); page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value }
  if (demo === 'error') session.failNext.list = true
  load()
  const d = demoParam('drawer'), e = demoParam('edit')
  if (d) openView(d)
  else if (e && manage.value) (e === 'new' ? openCreate() : openEdit(e))
})
</script>

<template>
  <div class="page-head">
    <div><h1>供应商管理</h1><p>共 <b class="num">{{ totalCount }}</b> 家 · 停用后不可用于新申请，历史申请不受影响</p></div>
    <div class="actions"><el-button v-if="manage" type="primary" @click="openCreate"><Plus class="i-icon--sm" />新增供应商</el-button></div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="供应商名称 / 联系人" aria-label="搜索供应商名称或联系人" clearable style="width: var(--layout-search-width)" @keyup.enter="search" />
        <el-select v-model="filters.active" aria-label="状态" style="width: 130px"><el-option label="全部状态" :value="ALL" /><el-option label="启用" :value="true" /><el-option label="停用" :value="false" /></el-select>
      </div>
      <div class="acts"><el-button type="primary" @click="search">查询</el-button><el-button text @click="reset">重置</el-button></div>
    </div>

    <TableSkeleton v-if="state === 'loading'" :rows="Math.min(pageSize, 10)" :cols="SKEL_COLS" />
    <div v-else-if="state === 'error'" class="error-box"><Attention class="i-icon--md" />{{ errorMsg }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length && !hasConditions" class="empty">
      <div class="illu"><Shop class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
      <b>还没有供应商</b><span>新增后即可在采购申请中选择</span>
      <el-button v-if="manage" type="primary" @click="openCreate"><Plus class="i-icon--sm" />新增供应商</el-button>
    </div>
    <div v-else-if="!rows.length" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>未找到符合条件的数据</b><span>试试放宽或清空筛选条件</span>
      <el-button @click="reset">重置筛选</el-button>
    </div>
    <template v-else>
      <el-table :data="rows" style="width: 100%">
        <el-table-column label="供应商名称" min-width="200"><template #default="{ row }"><button type="button" class="title" @click="openView(row)">{{ row.name }}</button></template></el-table-column>
        <el-table-column prop="contact" label="联系人" width="110" />
        <el-table-column label="联系电话" width="170"><template #default="{ row }"><span class="num">{{ dash(row.phone) }}</span></template></el-table-column>
        <el-table-column label="联系邮箱" min-width="220" show-overflow-tooltip><template #default="{ row }">{{ dash(row.email) }}</template></el-table-column>
        <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="statusOf(row).tone">{{ statusOf(row).label }}</span></template></el-table-column>
        <el-table-column label="更新时间" width="160"><template #default="{ row }"><span class="num">{{ timeOf(row.updatedAt) }}</span></template></el-table-column>
        <el-table-column label="操作" :width="manage ? 190 : 90" fixed="right">
          <template #default="{ row }">
            <button type="button" class="act" @click="openView(row)">查看</button>
            <template v-if="manage">
              <button type="button" class="act" @click="openEdit(row)">编辑</button>
              <button v-if="row.active" type="button" class="act danger" @click="deactivate(row)">停用</button>
              <button v-else type="button" class="act" @click="activate(row)">启用</button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="load" @size-change="onSize" /></div>
    </template>
  </el-card>

  <!-- 查看抽屉：只读资料 + 更新时间 -->
  <el-drawer v-model="view.open" title="供应商资料" size="var(--layout-drawer-width)" :close-on-click-modal="false">
    <div v-if="view.missing" class="empty">
      <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
      <b>记录不存在或已被删除</b><span>该供应商可能已被移除，请返回列表重新选择</span>
    </div>
    <el-descriptions v-else-if="view.row" :column="1" border label-width="var(--layout-form-label-width)">
      <el-descriptions-item label="供应商名称">{{ view.row.name }}</el-descriptions-item>
      <el-descriptions-item label="状态"><span class="status" :class="statusOf(view.row).tone">{{ statusOf(view.row).label }}</span></el-descriptions-item>
      <el-descriptions-item label="联系人">{{ view.row.contact }}</el-descriptions-item>
      <el-descriptions-item label="联系电话"><span class="num">{{ dash(view.row.phone) }}</span></el-descriptions-item>
      <el-descriptions-item label="联系邮箱">{{ dash(view.row.email) }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ dash(view.row.address) }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ dash(view.row.note) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间"><span class="num">{{ timeOf(view.row.updatedAt) }}</span></el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="view.open = false">关闭</el-button>
      <el-button v-if="manage && view.row" type="primary" @click="editFromView">编辑</el-button>
    </template>
  </el-drawer>

  <!-- 新增 / 编辑抽屉：名称唯一（重名由服务端返回，落到字段）；新建默认启用 -->
  <el-drawer v-model="editor.open" :title="editor.id ? '编辑供应商' : '新增供应商'" size="var(--layout-drawer-width)" :close-on-click-modal="false" :before-close="closeEditor">
    <el-form ref="editorRef" :model="editor.form" :rules="rules" label-position="right" scroll-to-error @submit.prevent="save">
      <el-form-item label="供应商名称" prop="name" :error="fieldErrors.name || undefined"><el-input v-model="editor.form.name" maxlength="50" show-word-limit placeholder="2–50 字，需唯一" @input="fieldErrors.name = ''" /></el-form-item>
      <el-form-item label="联系人" prop="contact"><el-input v-model="editor.form.contact" maxlength="20" show-word-limit /></el-form-item>
      <el-form-item label="联系电话" prop="phone"><el-input v-model="editor.form.phone" maxlength="20" placeholder="选填，如 021-6688 1200" /></el-form-item>
      <el-form-item label="联系邮箱" prop="email"><el-input v-model="editor.form.email" placeholder="选填，如 sales@example.com" /></el-form-item>
      <el-form-item label="地址" prop="address"><el-input v-model="editor.form.address" maxlength="200" show-word-limit placeholder="选填" /></el-form-item>
      <el-form-item label="备注" prop="note"><el-input v-model="editor.form.note" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" /></el-form-item>
      <div v-if="!editor.id" class="help">新建的供应商默认启用，保存后即可在采购申请中选择。</div>
    </el-form>
    <template #footer>
      <ConfirmBar v-if="leaveEditor.state.open" v-bind="leaveEditor.state" @confirm="leaveEditor.confirm" @cancel="leaveEditor.cancel" />
      <template v-else>
        <el-button @click="closeEditor()">取消</el-button>
        <el-button type="primary" :loading="editor.saving" @click="save">保存</el-button>
      </template>
    </template>
  </el-drawer>
</template>

<style scoped>
/* 标题型链接（DESIGN 链接四层）：近黑 + 500，hover 出下划线并加深；recipes 没有现成类，这里按配方落地 */
.title { background: transparent; border: 0; padding: 0; font-size: inherit; line-height: inherit; text-align: left; color: var(--color-text-primary); font-weight: var(--text-weight-label); cursor: pointer; display: inline-flex; align-items: center; min-height: var(--control-hit-min); }
.title:hover { color: var(--color-text-link-hover); text-decoration: var(--text-link-decoration); }
.help { line-height: var(--text-body-line-height); }
</style>
