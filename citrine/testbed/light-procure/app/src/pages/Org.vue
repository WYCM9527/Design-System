<script setup>
// 组织与成员（PRD P09）：左侧固定组织树（公司 → 四个部门，不可增删改排），右侧选中范围的成员列表；新增 / 编辑用小弹窗，停用需确认。
// 列表页约定：pageSize 取 db.settings.pageSize，筛选 / 页码在查询后 rememberList('org')，onMounted 先 recallList。
// 演示参数（放在 # 之前）：?state=loading|error|empty、?dialog=new、?dialog=<memberId>（配合 ?state=invalid 直接展示字段错误）。
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import {ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { AddUser, Close, Refresh, Peoples } from '@icon-park/vue-next'
import TableSkeleton from '../styles/bridge/vue/TableSkeleton.vue'
import { db, findDept } from '../data/db'
import { listMembers, saveMember, toggleMember, ApiError } from '../data/api'
import { session, isSelf, can, demoState, demoParam, rememberList, recallList } from '../data/session'
import { ROLES, PAGE_SIZES } from '../data/constants'
import { dateOf } from '../data/format'
import ConfirmBar from '../styles/bridge/vue/ConfirmBar.vue'
import { useInlineConfirm } from '../styles/bridge/vue/inlineConfirm.js'

const COMPANY = 'company'
// constants.js 没有成员启停用的状态映射（供应商同样），这里按 PRD 语义就地定义：启用 success、停用 neutral（无倾向状态）
const MEMBER_STATE = { true: { label: '启用', tone: 'success' }, false: { label: '停用', tone: 'neutral' } }

// ── 组织树：根 = 企业名称（跟随系统设置），子 = 四个部门；节点显示成员数（含停用） ──
const tree = computed(() => [{
  id: COMPANY, label: db.settings.companyName, count: db.members.length,
  children: db.departments.map((d) => ({ id: d.id, label: d.name, count: db.members.filter((m) => m.deptId === d.id).length }))
}])
const treeRef = ref()
const node = ref(COMPANY)
const nodeLabel = computed(() => (node.value === COMPANY ? '全部成员' : `${findDept(node.value)?.name || ''} · 成员`))
const activeCount = computed(() => db.members.filter((m) => m.active).length)
// 数据变化（新增成员后计数变化）会让 el-tree 重建节点，选中态要重新指回当前节点
watch(tree, () => nextTick(() => treeRef.value?.setCurrentKey(node.value)))

// ── 列表 ──
const state = demoState()
// 状态下拉的「全部状态」是真实选项：el-select 把 '' 当空值显示占位符，所以用 'all' 作值，调用 API 时换成 ''
const ALL = 'all'
const filters = reactive({ keyword: '', active: ALL })
const page = ref(1), pageSize = ref(db.settings.pageSize || 10), total = ref(0), rows = ref([])
const loading = ref(true), error = ref(''), busy = ref('')
const filtered = computed(() => !!filters.keyword || filters.active !== ALL)
let forceEmpty = state === 'empty'
if (state === 'error') session.failNext.list = true   // 首次加载失败一次，与顶栏测试工具同一机制

async function load() {
  loading.value = true; error.value = ''
  try {
    const res = await listMembers({ deptId: node.value === COMPANY ? '' : node.value, keyword: filters.keyword, active: filters.active === ALL ? '' : filters.active, page: page.value, pageSize: pageSize.value })
    if (forceEmpty) { forceEmpty = false; res.rows = []; res.total = 0 }
    if (!res.rows.length && res.total && page.value > 1) { page.value -= 1; return load() }   // 当前页空了（停用后被筛掉）退到上一页
    rows.value = res.rows; total.value = res.total
    rememberList('org', { node: node.value, keyword: filters.keyword, active: filters.active, page: page.value, pageSize: pageSize.value })
  } catch (e) { error.value = e.message || '成员列表加载失败，请重试' }
  finally { loading.value = false }
}
function query() { page.value = 1; load() }
function reset() { filters.keyword = ''; filters.active = ALL; query() }
function onNode(data) { if (node.value === data.id) return; node.value = data.id; query() }
function onPage(p) { if (p === page.value) return; page.value = p; load() }
function onSize(s) { pageSize.value = s; query() }

onMounted(async () => {
  const mem = recallList('org')
  if (mem) { node.value = mem.node || COMPANY; filters.keyword = mem.keyword || ''; filters.active = mem.active ?? ALL; page.value = mem.page || 1; pageSize.value = mem.pageSize || pageSize.value }
  await nextTick(); treeRef.value?.setCurrentKey(node.value)
  const dlg = demoParam('dialog')
  if (dlg === 'new') openNew()
  else if (dlg) { const m = db.members.find((x) => x.id === dlg); if (m) openEdit(m) }
  if (state !== 'loading') load()
})

// ── 新增 / 编辑弹窗 ──
const formRef = ref()
const dialog = reactive({ open: false, id: '', saving: false })
const blank = () => ({ name: '', email: '', deptId: '', role: 'applicant' })
const form = reactive(blank())
let snapshot = ''
const emailError = ref('')
const isSelfEdit = computed(() => !!dialog.id && isSelf(dialog.id))
const dirty = () => JSON.stringify(form) !== snapshot
const lenRule = (min, max, what) => ({ validator: (_, v, cb) => { const n = String(v || '').trim().length; cb(n >= min && n <= max ? undefined : new Error(`${what}为 ${min}–${max} 字`)) }, trigger: 'blur' })
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }, lenRule(2, 20, '姓名')],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
    // 忽略大小写唯一：本地先查一遍给即时反馈；服务层的 duplicate 错误同样落到这个字段
    { validator: (_, v, cb) => { const e = String(v || '').trim().toLowerCase(); cb(db.members.some((m) => m.id !== dialog.id && m.email.toLowerCase() === e) ? new Error('邮箱已被使用') : undefined) }, trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}
function show() {
  snapshot = JSON.stringify(form); emailError.value = ''; dialog.open = true
  nextTick(() => { formRef.value?.clearValidate(); if (demoState() === 'invalid') setTimeout(() => formRef.value?.validate().catch(() => {}), 50) })
}
function openNew() { dialog.id = ''; Object.assign(form, blank()); if (node.value !== COMPANY) form.deptId = node.value; show() }
function openEdit(m) { dialog.id = m.id; Object.assign(form, { name: m.name, email: m.email, deptId: m.deptId, role: m.role }); show() }
const leave = useInlineConfirm()   // 浮层内原位确认，不叠弹窗
const askLeave = () => leave.ask({ message: '成员资料有未保存的修改，关闭后会丢失。', confirmText: '放弃修改', cancelText: '继续编辑', danger: true })
async function tryClose() { if (dirty() && !(await askLeave())) return; dialog.open = false }
const beforeClose = async (done) => { if (!dirty() || (await askLeave())) done() }   // 关闭按钮与 Esc 走同一条确认规则
async function save() {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  dialog.saving = true
  try {
    await saveMember({ id: dialog.id || undefined, name: form.name, email: form.email, deptId: form.deptId, role: form.role })
    ElMessage.success('成员已保存'); dialog.open = false; load()
  } catch (e) {
    if (e instanceof ApiError && e.code === 'duplicate') emailError.value = e.message
    else ElMessage.error(e.message || '保存失败，请重试')
  } finally { dialog.saving = false }
}

// ── 启用 / 停用：停用需确认；当前账号 / 最后一名管理员由服务层拦截并提示 ──
async function toggle(m) {
  const wasActive = m.active
  if (wasActive) {
    const ok = await confirmBox(`停用后不能切换为该身份，也不能被分配资产；历史申请与资产归属保留。确认停用 ${m.name}？`, '停用成员', { confirmButtonText: '确认停用', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' }).then(() => true, () => false)
    if (!ok) return
  }
  busy.value = m.id
  try { await toggleMember(m.id, !wasActive); ElMessage.success(`${wasActive ? '已停用' : '已启用'} ${m.name}`); await load() }
  catch (e) { ElMessage.error(e.message || '操作失败，请重试') }
  finally { busy.value = '' }
}
</script>

<template>
  <div class="page-head">
    <div><h1>组织与成员</h1><p>{{ db.settings.companyName }} · 共 <b class="num">{{ db.members.length }}</b> 人，启用 <b class="num">{{ activeCount }}</b> 人 · 部门结构固定，成员的部门、角色与状态在此维护</p></div>
    <div class="actions"><el-button v-if="can('org.manage')" type="primary" @click="openNew"><AddUser class="i-icon--sm" />新增成员</el-button></div>
  </div>

  <div class="split">
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>组织架构</h2></div>
      <el-tree ref="treeRef" class="org-tree" :data="tree" node-key="id" :current-node-key="node" highlight-current default-expand-all :expand-on-click-node="false" @node-click="onNode">
        <template #default="{ data }"><span class="node"><span class="node-name">{{ data.label }}</span><span class="node-cnt num">{{ data.count }}</span></span></template>
      </el-tree>
    </el-card>

    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>{{ nodeLabel }}</h2><div v-if="!loading && !error" class="right"><span class="sub">共 <span class="num">{{ total }}</span> 人</span></div></div>
      <div class="filter">
        <div class="conds">
          <el-input v-model="filters.keyword" placeholder="姓名 / 邮箱" aria-label="搜索姓名或邮箱" clearable class="kw" @keyup.enter="query" @clear="query" />
          <el-select v-model="filters.active" aria-label="状态" style="width: 120px"><el-option label="全部状态" :value="ALL" /><el-option label="启用" :value="true" /><el-option label="停用" :value="false" /></el-select>
        </div>
        <div class="acts"><el-button type="primary" @click="query">查询</el-button><el-button text @click="reset">重置</el-button></div>
      </div>

      <TableSkeleton v-if="loading" :rows="Math.min(pageSize, 10)" :cols="[150, 200, 100, 100, 90, 130, 140]" />
      <div v-else-if="error" class="error-box"><Close class="i-icon--md" />{{ error }}<el-button size="small" @click="load"><Refresh class="i-icon--sm" />重试</el-button></div>
      <div v-else-if="!rows.length" class="empty">
        <div class="illu"><Peoples class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
        <template v-if="filtered"><b>未找到符合条件的成员</b><span>换个关键词或状态试试，或 <button type="button" class="act" @click="reset">重置筛选</button></span></template>
        <template v-else>
          <b>{{ node === COMPANY ? '还没有成员' : '该部门还没有成员' }}</b><span>新增成员后会出现在这里，也会加入顶栏的演示身份切换</span>
          <el-button v-if="can('org.manage')" type="primary" size="small" @click="openNew"><AddUser class="i-icon--sm" />新增成员</el-button>
        </template>
      </div>
      <template v-else>
        <el-table :data="rows" style="width: 100%">
          <el-table-column label="姓名" min-width="150"><template #default="{ row }"><span class="name">{{ row.name }}</span><span v-if="isSelf(row.id)" class="sub">当前登录账号</span></template></el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
          <el-table-column label="部门" width="100"><template #default="{ row }">{{ findDept(row.deptId)?.name || '—' }}</template></el-table-column>
          <el-table-column label="角色" width="100"><template #default="{ row }"><span class="badge" :class="row.role === 'admin' ? 'brand' : 'neutral'">{{ ROLES[row.role]?.label || row.role }}</span></template></el-table-column>
          <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="MEMBER_STATE[row.active].tone">{{ MEMBER_STATE[row.active].label }}</span></template></el-table-column>
          <el-table-column label="加入日期" width="130"><template #default="{ row }"><span class="num">{{ dateOf(row.joinedAt) }}</span></template></el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <button type="button" class="act" :disabled="busy === row.id" @click="openEdit(row)">编辑</button>
              <!-- 当前操作账号：停用不可用，保留位置压淡；禁用元素不响应 hover，原因写在外层 span 的 title 上 -->
              <span v-if="isSelf(row.id)" class="act-lock" title="不能停用当前操作账号"><button type="button" class="act danger" disabled aria-disabled="true">停用</button></span>
              <button v-else type="button" class="act" :class="{ danger: row.active }" :disabled="busy === row.id" @click="toggle(row)">{{ row.active ? '停用' : '启用' }}</button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pager"><el-pagination :current-page="page" :page-size="pageSize" :total="total" :page-sizes="PAGE_SIZES" layout="total, sizes, prev, pager, next" background @current-change="onPage" @size-change="onSize" /></div>
      </template>
    </el-card>
  </div>

  <!-- 新增 / 编辑成员：小弹窗；脏状态下关闭（× / Esc / 取消）先确认 -->
  <el-dialog v-model="dialog.open" :title="dialog.id ? '编辑成员' : '新增成员'" :width="'var(--layout-modal-width-sm)'" :close-on-click-modal="false" :before-close="beforeClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="right" scroll-to-error class="dlg-form" @submit.prevent="save">
      <el-form-item label="姓名" prop="name"><el-input v-model="form.name" maxlength="20" placeholder="2–20 字" /></el-form-item>
      <el-form-item label="邮箱" prop="email" :error="emailError"><el-input v-model="form.email" placeholder="name@example.com" @input="emailError = ''" /></el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="form.deptId" placeholder="请选择部门" style="width: 100%"><el-option v-for="d in db.departments" :key="d.id" :label="d.name" :value="d.id" /></el-select>
        <div v-if="dialog.id" class="help">调换部门后，其在用资产的当前使用部门同步更新；历史申请与资产使用记录中的部门快照保持原值</div>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <template v-if="isSelfEdit">
          <el-input :model-value="ROLES[form.role].label" readonly class="ro" aria-label="角色（只读）" />
          <div class="help">不能修改当前操作账号的角色</div>
        </template>
        <template v-else>
          <el-radio-group v-model="form.role" aria-label="角色"><el-radio v-for="(r, k) in ROLES" :key="k" :value="k">{{ r.label }}</el-radio></el-radio-group>
          <div class="help">{{ ROLES[form.role]?.desc }}{{ dialog.id ? ' 角色调整保存后，下一次切换为该成员时采用新角色。' : ' 新成员默认启用，保存后可在顶栏身份切换里看到。' }}</div>
        </template>
      </el-form-item>
    </el-form>
    <template #footer>
      <ConfirmBar v-if="leave.state.open" v-bind="leave.state" @confirm="leave.confirm" @cancel="leave.cancel" />
      <template v-else><el-button @click="tryClose">取消</el-button><el-button type="primary" :loading="dialog.saving" @click="save">保存</el-button></template>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 左窄右宽 1 : 5（DESIGN 没有树 + 表格的分栏规则，见报告）：1280 宽度下右栏足够放下成员表 7 列、不出现横向滚动；两栏顶对齐 */
.split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 5fr); gap: var(--space-stack); align-items: start; }

/* 组织树：行高走控件 md 档，行圆角 md；当前节点 = 深黑反转块（Element 默认的 current 底色是 primary-light-9 → 桥接映射成 bg.selected-subtle，与 hover 几乎同色，不够清晰） */
.org-tree { padding: var(--spacing-2); --el-tree-node-content-height: var(--control-height-md); --el-tree-expand-icon-color: var(--color-icon-muted); }
.org-tree :deep(.el-tree-node__content) { border-radius: var(--radius-md); margin: var(--spacing-0-5) 0; }
.org-tree :deep(.el-tree-node__content:hover), .org-tree :deep(.el-tree-node:focus > .el-tree-node__content) { background: var(--color-bg-hover); }
.org-tree :deep(.el-tree-node.is-current > .el-tree-node__content) { background: var(--color-action-selected); color: var(--color-text-on-selected); font-weight: var(--font-weight-medium); }
.org-tree :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__expand-icon) { color: var(--color-text-on-selected); }
.node { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); flex: 1; min-width: 0; padding-right: var(--spacing-3); }
.node-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node-cnt { font-size: var(--text-small-size); color: var(--color-text-muted); }
.org-tree :deep(.el-tree-node.is-current > .el-tree-node__content) .node-cnt { color: inherit; }

.kw { width: var(--layout-search-width); }
/* 姓名：标题型（近黑 + 500），不是链接——本页没有成员详情页 */
.name { color: var(--color-text-primary); font-weight: var(--text-weight-label); }
/* 禁用的操作胶囊不响应指针事件，说明原因的 title 挂在外层；与相邻胶囊保持 space.inline */
.act-lock { display: inline-flex; margin-left: var(--space-inline); cursor: not-allowed; }

.dlg-form { padding-top: var(--spacing-1); }
.dlg-form .help { display: block; width: 100%; margin-top: var(--spacing-1); line-height: var(--text-body-line-height); }
.dlg-form .el-form-item.is-error .help { display: none; }   /* 出错时错误文案占同一位置，不叠加 */
.ro :deep(.el-input__wrapper) { background: var(--color-bg-readonly); }
.ro :deep(.el-input__inner) { color: var(--color-text-secondary); }
</style>
