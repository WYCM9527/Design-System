<script setup>
// P03 新建 / 编辑采购申请（PRD §5 P03、§6.4）。新建与编辑共用：有 :id 时载入本人草稿，否则空表单。
// 结构：页头 → .form-page 单列（三张分区卡：基础信息 / 采购明细 / 附件与备注）→ 底部 sticky 操作条。
// 校验分两档：保存草稿只强制标题 + 已填字段格式；提交全量（strict）。演示参数 ?state=invalid|missing|loading（放在 # 之前）。
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, UploadOne, Pic, FilePdf, FileSearch } from '@icon-park/vue-next'
import { today, findSupplier } from '../data/db'
import { user, userDept, demoState } from '../data/session'
import { getApplication, saveDraft, submitApplication, activeSuppliers, canEditApp } from '../data/api'
import { CATEGORIES, LINE_LIMIT, FILE_LIMIT } from '../data/constants'
import { money, lineSubtotal, sumLines, fileSize, timeOf } from '../data/format'
import { putFile, deleteFile, fileUrl, validateFile, newFileId } from '../data/files'
import { useDirtyGuard, confirmLeave } from '../data/guard'

const route = useRoute(); const router = useRouter()
const FORM_ROUTES = ['application-new', 'application-edit']
const editing = computed(() => !!route.params.id)

const formRef = ref()
const loading = ref(false)
const missing = ref('')          // '' | 'gone'（不存在 / 非本人草稿）| 'submitted'（本人但已提交）
const saving = ref(false), submitting = ref(false)
const busy = computed(() => saving.value || submitting.value)
const strict = ref(false)        // true = 提交档校验（必填 + 格式）；false = 草稿档（标题 + 已填字段格式）

// ── 表单模型 ──
let keySeq = 0
const newLine = () => ({ _key: ++keySeq, name: '', category: '', spec: '', qty: 1, price: null })
const blank = () => ({ id: '', no: '', applicantName: user.value.name || '', deptName: userDept.value || '', updatedAt: '', title: '', priority: 'normal', expectDate: '', supplierId: '', purpose: '', note: '', lines: [newLine()], attachments: [] })
const form = reactive(blank())
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))
function fill(app) {
  Object.assign(form, {
    id: app.id, no: app.no, applicantName: app.applicantName, deptName: app.deptName, updatedAt: app.updatedAt,
    title: app.title || '', priority: app.priority || 'normal', expectDate: app.expectDate || '', supplierId: app.supplierId || '', purpose: app.purpose || '', note: app.note || '',
    lines: (app.lines?.length ? app.lines : [{}]).map((l) => ({ _key: ++keySeq, name: l.name || '', category: l.category || '', spec: l.spec || '', qty: num(l.qty), price: num(l.price) })),
    attachments: (app.attachments || []).map((a) => ({ ...a }))
  })
}
// 传给数据层的载荷：去掉行 key，附件只留元数据
const payload = () => ({ id: form.id || undefined, title: form.title, priority: form.priority, expectDate: form.expectDate, supplierId: form.supplierId, purpose: form.purpose, note: form.note, lines: form.lines.map(({ _key, ...l }) => ({ ...l })), attachments: form.attachments.map((a) => ({ ...a })) })

// ── 未保存修改：序列化与载入时快照比较 ──
const snapshot = ref('')
const serialize = () => JSON.stringify({ t: form.title, p: form.priority, d: form.expectDate, s: form.supplierId, u: form.purpose, n: form.note, l: form.lines.map(({ _key, ...l }) => l), a: form.attachments.map((a) => a.id) })
let bypass = false
const isDirty = () => !bypass && !missing.value && !loading.value && serialize() !== snapshot.value
useDirtyGuard(isDirty)
// ── 供应商：只列启用；编辑草稿时已停用的仍显示名称并在字段下报错（保存草稿允许，提交必须处理） ──
const currentSupplier = computed(() => (form.supplierId ? findSupplier(form.supplierId) : null))
const supplierInactive = computed(() => !!(currentSupplier.value && !currentSupplier.value.active))
const supplierError = computed(() => (supplierInactive.value ? '已停用，请重新选择或清空' : ''))
const supplierOptions = computed(() => { const list = activeSuppliers(); return supplierInactive.value ? [...list, currentSupplier.value] : list })

// ── 校验规则：required 只用于标星，实际由 validator 按 strict 决定是否强制 ──
const trimmed = (v) => (v === null || v === undefined ? '' : String(v)).trim()
const rules = {
  title: [{ required: true, trigger: 'blur', validator: (_, v, cb) => { const t = trimmed(v); if (!t) return cb(new Error('请输入申请标题')); if (t.length < 2 || t.length > 50) return cb(new Error('标题去除首尾空格后需为 2–50 字')); cb() } }],
  expectDate: [{ required: true, trigger: 'change', validator: (_, v, cb) => { if (!v) return strict.value ? cb(new Error('请选择期望到货日期')) : cb(); if (v < today()) return cb(new Error(`期望到货日期不能早于 ${today()}`)); cb() } }],
  purpose: [{ required: true, trigger: 'blur', validator: (_, v, cb) => { const t = trimmed(v); if (!t) return strict.value ? cb(new Error('请填写采购用途')) : cb(); if (t.length > 300) return cb(new Error('采购用途不超过 300 字')); if (strict.value && t.length < 10) return cb(new Error('采购用途需为 10–300 字')); cb() } }],
  note: [{ trigger: 'blur', validator: (_, v, cb) => (trimmed(v).length > 300 ? cb(new Error('补充备注不超过 300 字')) : cb()) }]
}
const lineRules = {
  name: [{ required: true, trigger: 'blur', validator: (_, v, cb) => { const t = trimmed(v); if (!t) return strict.value ? cb(new Error('请输入物品名称')) : cb(); if (t.length > 50) return cb(new Error('物品名称不超过 50 字')); cb() } }],
  category: [{ required: true, trigger: 'change', validator: (_, v, cb) => (!v && strict.value ? cb(new Error('请选择类别')) : cb()) }],
  spec: [{ trigger: 'blur', validator: (_, v, cb) => (trimmed(v).length > 100 ? cb(new Error('规格说明不超过 100 字')) : cb()) }],
  qty: [{ required: true, trigger: 'change', validator: (_, v, cb) => { if (v === null || v === undefined || v === '') return strict.value ? cb(new Error('请输入数量')) : cb(); const n = Number(v); if (!Number.isInteger(n) || n < LINE_LIMIT.qtyMin || n > LINE_LIMIT.qtyMax) return cb(new Error(`数量为 ${LINE_LIMIT.qtyMin}–${LINE_LIMIT.qtyMax} 的整数`)); cb() } }],
  price: [{ required: true, trigger: 'change', validator: (_, v, cb) => { if (v === null || v === undefined || v === '') return strict.value ? cb(new Error('请输入预估单价')) : cb(); const n = Number(v); if (!(n >= LINE_LIMIT.priceMin && n <= LINE_LIMIT.priceMax)) return cb(new Error('单价为 0.01–99,999.99 元')); if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return cb(new Error('单价最多两位小数')); cb() } }]
}
async function validateAll() {
  let ok = true
  try { await formRef.value.validate() } catch { ok = false }
  if (strict.value && supplierInactive.value) ok = false
  if (!ok) { await nextTick(); locateError() }
  return ok
}
// 定位到首个错误：滚到视野中央并把焦点交给该字段的输入控件
function locateError() {
  const el = formRef.value?.$el?.querySelector('.is-error')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.querySelector('input:not([type="hidden"]), textarea')?.focus({ preventScroll: true })
}

// ── 采购明细 ──
const sum = computed(() => sumLines(form.lines))
const subtotalOf = (line) => lineSubtotal(line)
const canAdd = computed(() => form.lines.length < LINE_LIMIT.max)
function addLine() { if (canAdd.value) form.lines.push(newLine()) }
function removeLine(i) { if (form.lines.length > LINE_LIMIT.min) form.lines.splice(i, 1) }

// ── 期望到货日期：不早于演示基准日 ──
const pad2 = (n) => String(n).padStart(2, '0')
const localDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const disabledDate = (d) => localDate(d) < today()
const baseDate = computed(() => new Date(`${today()}T00:00:00`))

// ── 附件：原生 <input type="file"> 包在可点击 / 可拖拽区域；内容写 IndexedDB，元数据进 form.attachments ──
const fileStatus = reactive({})          // id → 'writing' | 'failed'；不在表里即已就绪
const dragOver = ref(false)
const full = computed(() => form.attachments.length >= FILE_LIMIT.count)
const filesBusy = computed(() => form.attachments.some((a) => fileStatus[a.id]))
const sessionFiles = new Set()           // 本次会话新写入、尚未随草稿保存的文件：移除或离开时直接删
const pendingDeletes = new Set()         // 已随草稿保存的文件被移除：保存成功后再删，取消修改时仍能恢复
const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
const FILE_STATE = { writing: { label: '写入中', tone: 'info' }, failed: { label: '失败', tone: 'error' }, ready: { label: '已就绪', tone: 'success' } }
const fileState = (f) => FILE_STATE[fileStatus[f.id] || 'ready']
function onPick(e) { const files = Array.from(e.target.files || []); e.target.value = ''; addFiles(files) }
function onDragEnter() { if (!full.value) dragOver.value = true }
function onDragLeave(e) { if (!e.currentTarget.contains(e.relatedTarget)) dragOver.value = false }
function onDrop(e) { dragOver.value = false; if (!full.value) addFiles(Array.from(e.dataTransfer?.files || [])) }
function addFiles(files) {
  let count = form.attachments.length
  for (const file of files) {
    const err = validateFile(file, count)
    if (err) { ElMessage.error(`「${file.name}」${err}`); continue }
    const meta = { id: newFileId(), name: file.name, size: file.size, type: file.type || (isPdf(file) ? 'application/pdf' : 'image/*') }
    count += 1
    fileStatus[meta.id] = 'writing'; sessionFiles.add(meta.id)
    form.attachments.push(meta)
    putFile(meta.id, file).then(() => { delete fileStatus[meta.id] }).catch(() => { fileStatus[meta.id] = 'failed' })
  }
}
function removeFile(f) {
  const i = form.attachments.findIndex((a) => a.id === f.id)
  if (i >= 0) form.attachments.splice(i, 1)
  delete fileStatus[f.id]
  if (f.id.startsWith('f-seed')) return           // 种子样本不真删，只从列表移除
  if (sessionFiles.has(f.id)) { sessionFiles.delete(f.id); deleteFile(f.id).catch(() => {}) } else pendingDeletes.add(f.id)
}
function afterPersist() { sessionFiles.clear(); for (const id of pendingDeletes) deleteFile(id).catch(() => {}); pendingDeletes.clear() }
const preview = reactive({ open: false, name: '', url: '' })
async function previewFile(f) {
  if (isPdf(f)) {
    const win = window.open('', '_blank')                 // 先同步开窗，避免 await 后被拦截
    const url = await fileUrl(f.id)
    if (!url) { win?.close(); ElMessage.error('附件内容不存在，请删除后重新选择'); return }
    if (win) win.location.href = url; else window.open(url, '_blank')
    return
  }
  const url = await fileUrl(f.id)
  if (!url) { ElMessage.error('附件内容不存在，请删除后重新选择'); return }
  if (preview.url) URL.revokeObjectURL(preview.url)
  Object.assign(preview, { open: true, name: f.name, url })
}
function revokePreview() { if (preview.url) URL.revokeObjectURL(preview.url); preview.url = '' }

// ── 载入 / 重置 ──
async function init() {
  const id = route.params.id
  missing.value = ''; loading.value = !!id; strict.value = false; bypass = false
  for (const fid of sessionFiles) deleteFile(fid).catch(() => {})   // 上一条草稿未保存的新附件成了孤儿，顺手清掉
  sessionFiles.clear(); pendingDeletes.clear()
  Object.assign(form, blank()); formRef.value?.clearValidate()
  if (demoState() === 'missing') { missing.value = 'gone'; loading.value = false; return }
  if (id) {
    const app = await getApplication(id)
    if (route.params.id !== id) return
    if (!app || app.applicantId !== user.value.id) { missing.value = 'gone'; loading.value = false; return }
    if (!canEditApp(app)) { missing.value = 'submitted'; loading.value = false; return }
    fill(app)
    if (demoState() === 'loading') return          // 停留在骨架供截图
  }
  loading.value = false
  snapshot.value = serialize()
  await nextTick()
  if (demoState() === 'invalid') { strict.value = true; formRef.value?.validate().catch(() => {}) }
}
onMounted(init)
watch(() => route.params.id, (id) => { if (FORM_ROUTES.includes(route.name) && id !== form.id) init() })
onBeforeUnmount(() => { for (const id of sessionFiles) deleteFile(id).catch(() => {}); revokePreview() })

// ── 保存草稿 / 提交 / 取消 ──
async function save() {
  if (busy.value) return
  strict.value = false
  if (!(await validateAll())) return
  saving.value = true
  try {
    const app = await saveDraft(payload())
    afterPersist()
    Object.assign(form, { id: app.id, no: app.no, updatedAt: app.updatedAt })
    snapshot.value = serialize()
    ElMessage.success('草稿已保存')
    if (route.name === 'application-new') router.replace(`/applications/${app.id}/edit`)   // 新建保存后进入该草稿的编辑路由，避免再次保存重复建单（快照已更新，离开守卫不会拦）
  } catch (e) { ElMessage.error(e.message || '保存失败，请稍后重试') } finally { saving.value = false }
}
async function submit() {
  if (busy.value) return
  if (filesBusy.value) { ElMessage.error('有附件正在写入或写入失败，请稍候或移除后再提交'); return }
  strict.value = true
  if (!(await validateAll())) return
  submitting.value = true
  try {
    const app = await submitApplication(payload())
    afterPersist()
    snapshot.value = serialize()
    ElMessage.success('申请已提交')
    router.push(`/applications/${app.id}`)
  } catch (e) { ElMessage.error(e.message || '提交失败，请稍后重试') } finally { submitting.value = false }
}
async function cancel() {
  if (busy.value) return
  if (isDirty() && !(await confirmLeave())) return
  bypass = true; setTimeout(() => { bypass = false }, 800)
  const back = router.options.history.state?.back
  if (back) router.back(); else router.push('/applications')
}
</script>

<template>
  <!-- 记录不存在 / 非本人草稿：内容级不存在，muted 线性图标 + 返回列表主按钮 -->
  <div v-if="missing" class="result">
    <div class="illu"><FileSearch class="i-icon--2xl i-icon--muted" /></div>
    <h3>{{ missing === 'submitted' ? '该申请已提交，不能再编辑' : '记录不存在或已被删除' }}</h3>
    <p>{{ missing === 'submitted' ? '已提交的申请不允许修改；如需调整，请在详情页「复制为新申请」后重新提交。' : '这条草稿可能已被删除，或不属于当前身份。请返回采购申请列表重新选择。' }}</p>
    <div class="acts">
      <el-button type="primary" @click="router.push('/applications')">返回列表</el-button>
      <el-button v-if="missing === 'submitted'" @click="router.push(`/applications/${route.params.id}`)">查看详情</el-button>
    </div>
  </div>

  <template v-else>
    <div class="page-head">
      <div>
        <h1>{{ editing ? '编辑采购申请' : '新建采购申请' }}</h1>
        <p v-if="editing && form.no">草稿 <span class="mono">{{ form.no }}</span> · 上次保存 <span class="num">{{ timeOf(form.updatedAt) }}</span> · 带 * 的为提交时必填</p>
        <p v-else>带 * 的为提交时必填；只填申请标题即可保存草稿，提交前再补齐其余内容。</p>
      </div>
    </div>

    <!-- 首次加载骨架：按三张分区卡 + 标签 / 控件行占位 -->
    <div v-if="loading" class="form-page" role="status" aria-live="polite" aria-label="正在加载">
      <el-card v-for="(sec, i) in [['基础信息', 5], ['采购明细', 2], ['附件与备注', 2]]" :key="i" class="flat">
        <div class="card-head"><h2>{{ sec[0] }}</h2></div>
        <div class="fskel"><div v-for="r in sec[1]" :key="r" class="fs-row"><i class="fs-label" /><i class="fs-ctl" /></div></div>
      </el-card>
    </div>

    <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="right" class="form-page" @submit.prevent>
      <!-- 一、基础信息 -->
      <el-card class="flat">
        <div class="card-head"><h2>基础信息</h2></div>
        <div class="form-grid">
          <el-form-item label="申请标题" prop="title" class="span2">
            <el-input v-model="form.title" maxlength="50" show-word-limit placeholder="去除首尾空格后 2–50 字" />
          </el-form-item>
          <el-form-item label="申请人"><span class="ro">{{ form.applicantName }}</span></el-form-item>
          <el-form-item label="所属部门"><span class="ro">{{ form.deptName }}</span></el-form-item>
          <el-form-item label="优先级" prop="priority">
            <el-radio-group v-model="form.priority" aria-label="优先级">
              <el-radio value="normal">普通</el-radio>
              <el-radio value="urgent">紧急</el-radio>
            </el-radio-group>
            <div class="help block">紧急只影响展示，不改变审批流程</div>
          </el-form-item>
          <el-form-item label="期望到货日期" prop="expectDate">
            <el-date-picker v-model="form.expectDate" type="date" value-format="YYYY-MM-DD" :placeholder="`不早于 ${today()}`" :disabled-date="disabledDate" :default-value="baseDate" style="width: 100%" />
          </el-form-item>
          <el-form-item label="供应商" prop="supplierId" :error="supplierError">
            <el-select v-model="form.supplierId" filterable clearable placeholder="选填，仅可选择启用的供应商" style="width: 100%">
              <el-option v-for="s in supplierOptions" :key="s.id" :label="s.active ? s.name : `${s.name}（已停用）`" :value="s.id" :disabled="!s.active" />
            </el-select>
          </el-form-item>
          <el-form-item label="采购用途" prop="purpose" class="span2">
            <el-input v-model="form.purpose" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="提交时必填，10–300 字：说明采购原因、使用场景与预期效果" />
          </el-form-item>
        </div>
      </el-card>

      <!-- 二、采购明细：紧凑表，行内控件 small；名称与规格叠放在同一格以适配单列表单宽度 -->
      <el-card class="flat">
        <div class="card-head"><h2>采购明细</h2><div class="right"><span class="help">至少 {{ LINE_LIMIT.min }} 行，最多 {{ LINE_LIMIT.max }} 行 · 金额精确到分</span></div></div>
        <el-table :data="form.lines" row-key="_key" class="lines" style="width: 100%">
          <el-table-column min-width="190">
            <template #header><span class="req">物品名称</span><span class="hd-sub">/ 规格说明</span></template>
            <template #default="{ row, $index }">
              <div class="stack">
                <el-form-item :prop="`lines.${$index}.name`" :rules="lineRules.name" size="small" class="cell-item">
                  <el-input v-model="row.name" size="small" maxlength="50" placeholder="物品名称" :aria-label="`第 ${$index + 1} 行物品名称`" />
                  <template #error="{ error }"><span class="cell-err">{{ error }}</span></template>
                </el-form-item>
                <el-form-item :prop="`lines.${$index}.spec`" :rules="lineRules.spec" size="small" class="cell-item">
                  <el-input v-model="row.spec" size="small" maxlength="100" placeholder="规格说明（选填）" :aria-label="`第 ${$index + 1} 行规格说明`" />
                  <template #error="{ error }"><span class="cell-err">{{ error }}</span></template>
                </el-form-item>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="116">
            <template #header><span class="req">类别</span></template>
            <template #default="{ row, $index }">
              <el-form-item :prop="`lines.${$index}.category`" :rules="lineRules.category" size="small" class="cell-item">
                <el-select v-model="row.category" size="small" placeholder="选择" :aria-label="`第 ${$index + 1} 行类别`" style="width: 100%">
                  <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
                </el-select>
                <template #error="{ error }"><span class="cell-err">{{ error }}</span></template>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column width="96">
            <template #header><span class="req">数量</span></template>
            <template #default="{ row, $index }">
              <el-form-item :prop="`lines.${$index}.qty`" :rules="lineRules.qty" size="small" class="cell-item">
                <el-input-number v-model="row.qty" size="small" :min="LINE_LIMIT.qtyMin" :max="LINE_LIMIT.qtyMax" :step="1" step-strictly controls-position="right" :aria-label="`第 ${$index + 1} 行数量`" style="width: 100%" />
                <template #error="{ error }"><span class="cell-err">{{ error }}</span></template>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column width="128">
            <template #header><span class="req">预估单价</span></template>
            <template #default="{ row, $index }">
              <el-form-item :prop="`lines.${$index}.price`" :rules="lineRules.price" size="small" class="cell-item">
                <el-input-number v-model="row.price" size="small" :min="LINE_LIMIT.priceMin" :max="LINE_LIMIT.priceMax" :precision="2" :step="1" controls-position="right" placeholder="0.00" :aria-label="`第 ${$index + 1} 行预估单价`" style="width: 100%" />
                <template #error="{ error }"><span class="cell-err">{{ error }}</span></template>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="小计" width="112" align="right">
            <template #default="{ row }">
              <span v-if="subtotalOf(row) === null" class="subtotal dash" title="小计 —（该行未填完整）">—</span>
              <span v-else class="subtotal num">{{ money(subtotalOf(row)) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="68">
            <template #default="{ $index }">
              <button type="button" class="act danger" :disabled="form.lines.length <= LINE_LIMIT.min" :title="form.lines.length <= LINE_LIMIT.min ? '至少保留 1 行' : `删除第 ${$index + 1} 行`" @click="removeLine($index)">删除</button>
            </template>
          </el-table-column>
        </el-table>
        <div class="lines-foot">
          <el-button :disabled="!canAdd" @click="addLine"><Plus class="i-icon--sm" />添加明细</el-button>
          <span v-if="!canAdd" class="help">最多添加 {{ LINE_LIMIT.max }} 项</span>
          <div class="sum">
            总数量 <b class="num">{{ sum.qty }}</b> · 预估总金额 <b class="num">{{ money(sum.total) }}</b>
            <span v-if="sum.incomplete" class="status neutral" title="有未填完整的明细行，金额为暂计">暂计</span>
          </div>
        </div>
      </el-card>

      <!-- 三、附件与备注 -->
      <el-card class="flat">
        <div class="card-head"><h2>附件与备注</h2><div class="right"><span class="help num">附件 {{ form.attachments.length }} / {{ FILE_LIMIT.count }}</span></div></div>
        <div class="form-grid">
          <el-form-item label="附件" class="span2">
            <div class="upload">
              <label class="upload-zone" :class="{ 'is-over': dragOver, 'is-full': full }" @dragenter.prevent="onDragEnter" @dragover.prevent="onDragEnter" @dragleave="onDragLeave" @drop.prevent="onDrop">
                <input class="file-input" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" :disabled="full" aria-label="选择附件文件" @change="onPick" />
                <UploadOne class="i-icon--xl i-icon--muted" aria-hidden="true" />
                <span class="up-text"><template v-if="full"><b>已达到附件数量上限</b></template><template v-else><b>拖拽文件到这里</b>，或点击选择</template></span>
                <span class="up-hint">支持 JPG、PNG、PDF，单个不超过 5MB，最多 {{ FILE_LIMIT.count }} 个</span>
              </label>
              <ul v-if="form.attachments.length" class="files">
                <li v-for="f in form.attachments" :key="f.id" class="file">
                  <component :is="isPdf(f) ? FilePdf : Pic" class="i-icon--md i-icon--muted" aria-hidden="true" />
                  <span class="fname" :title="f.name">{{ f.name }}</span>
                  <span class="fsize num">{{ fileSize(f.size) }}</span>
                  <span class="status" :class="fileState(f).tone">{{ fileState(f).label }}</span>
                  <span class="facts">
                    <button type="button" class="act" :disabled="fileStatus[f.id] !== undefined" @click="previewFile(f)">预览</button>
                    <button type="button" class="act danger" @click="removeFile(f)">删除</button>
                  </span>
                </li>
              </ul>
              <div v-if="filesBusy" class="file-warn" role="status">有附件正在写入或写入失败，暂不能提交申请；写入失败的附件请删除后重新选择。</div>
            </div>
          </el-form-item>
          <el-form-item label="补充备注" prop="note" class="span2">
            <el-input v-model="form.note" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="选填，不超过 300 字" />
          </el-form-item>
        </div>
      </el-card>

      <!-- 底部固定操作条 -->
      <div class="form-foot">
        <el-button text :disabled="busy" @click="cancel">取消</el-button>
        <el-button :loading="saving" :disabled="submitting" @click="save">保存草稿</el-button>
        <el-button type="primary" :loading="submitting" :disabled="saving || filesBusy" @click="submit">提交申请</el-button>
      </div>
    </el-form>

    <!-- 图片预览 -->
    <el-dialog v-model="preview.open" :title="preview.name" :width="'var(--layout-modal-width-md)'" :close-on-click-modal="false" align-center @closed="revokePreview">
      <img v-if="preview.url" :src="preview.url" :alt="preview.name" class="preview-img" />
    </el-dialog>
  </template>
</template>

<style scoped>
.form-page { display: flex; flex-direction: column; gap: var(--space-stack); }

/* 只读文本：bg.readonly + text.secondary，不做成可聚焦的输入框 */
.ro { display: inline-flex; align-items: center; width: 100%; min-height: var(--control-height-md); padding: 0 var(--spacing-3); border-radius: var(--radius-md); background: var(--color-bg-readonly); color: var(--color-text-secondary); }
.help.block { width: 100%; line-height: var(--text-body-line-height); }

/* 明细表：行内控件 small；单元格顶部对齐，出错时错误文案在控件下方独占一行。
   例外：表单内可编辑表格把水平内边距从 table.cell.padding-x 收到 spacing.3——单列表单页（layout.form.max-width）放不下列表页的单元格密度（见报告） */
.lines :deep(.cell) { padding: 0 var(--spacing-3); }
.lines :deep(td.el-table__cell) { vertical-align: top; }
.lines :deep(.el-form-item--small .el-form-item__content) { display: block; }
.cell-item { margin-bottom: 0; width: 100%; }
.stack { display: flex; flex-direction: column; gap: var(--spacing-1); }
.cell-err { display: block; margin-top: var(--spacing-0-5); color: var(--color-text-danger); font-size: var(--text-small-size); line-height: var(--text-body-line-height); white-space: normal; }
.req::before { content: '*'; margin-right: var(--spacing-1); color: var(--color-status-error); }
.hd-sub { margin-left: var(--spacing-1); color: var(--color-text-muted); font-weight: var(--font-weight-regular); }
.subtotal { display: inline-block; line-height: var(--control-height-sm); }
.dash { color: var(--color-text-muted); }
.lines .act { margin-top: calc((var(--control-height-sm) - var(--control-height-xs)) / 2); }
.lines-foot { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-3); padding: var(--spacing-3) var(--space-card); border-top: var(--border-width-default) solid var(--color-border-default); }
.lines-foot .sum { margin-left: auto; display: inline-flex; align-items: center; gap: var(--space-inline); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.lines-foot .sum b { color: var(--color-text-primary); font-weight: var(--text-weight-strong); }

/* 上传区：虚线 border.strong + bg.subtle；hover bg.hover；拖入 border.focus + bg.selected；键盘聚焦在整块上画焦点环 */
.upload { width: 100%; display: flex; flex-direction: column; gap: var(--spacing-3); }
.upload-zone { position: relative; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-1); padding: var(--spacing-5); border: var(--border-width-default) dashed var(--color-border-strong); border-radius: var(--radius-md); background: var(--color-bg-subtle); cursor: pointer; text-align: center; line-height: var(--text-body-line-height); transition: background var(--motion-duration-fast) var(--motion-easing-standard), border-color var(--motion-duration-fast) var(--motion-easing-standard); }
.upload-zone:hover { background: var(--color-bg-hover); }
.upload-zone.is-over { border-color: var(--color-border-focus); background: var(--color-bg-selected); }
.upload-zone.is-full { opacity: var(--opacity-disabled); cursor: not-allowed; }
.upload-zone:has(.file-input:focus-visible) { outline: var(--border-width-active) solid var(--color-border-focus); outline-offset: var(--spacing-0-5); }
.file-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none; }
.up-text { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.up-text b { color: var(--color-text-primary); font-weight: var(--text-weight-label); }
.up-hint { color: var(--color-text-muted); font-size: var(--text-small-size); }
.files { list-style: none; margin: 0; padding: 0; border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); }
.file { display: flex; align-items: center; gap: var(--spacing-3); min-height: var(--control-height-lg); padding: var(--spacing-2) var(--spacing-3); line-height: var(--text-body-line-height); }
.file + .file { border-top: var(--border-width-default) solid var(--color-border-default); }
.fname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--text-body-sm-size); }
.fsize { color: var(--color-text-muted); font-size: var(--text-small-size); white-space: nowrap; }
.facts { display: inline-flex; flex: none; }
.file-warn { color: var(--color-text-danger); font-size: var(--text-small-size); line-height: var(--text-body-line-height); }

/* 底部固定操作条：吸底、surface 底、上边线（配方已带），加一圈发丝边与向上的软阴影以便浮在内容上 */
.form-foot { position: sticky; bottom: 0; z-index: var(--layer-sticky); background: var(--color-bg-surface); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-lg); box-shadow: 0 calc(-1 * var(--elevation-card-y)) var(--elevation-card-blur) var(--elevation-card-color); }

.preview-img { display: block; max-width: 100%; max-height: calc(var(--control-height-lg) * 15); margin: 0 auto; border-radius: var(--radius-sm); }

/* 表单骨架：标签列 + 控件条，与横向表单同形 */
.fskel { padding: var(--space-card); display: grid; gap: var(--spacing-4); }
.fs-row { display: grid; grid-template-columns: var(--layout-form-label-width) 1fr; gap: var(--spacing-3); align-items: center; }
.fs-label, .fs-ctl { display: block; border-radius: var(--radius-sm); background: linear-gradient(90deg, var(--color-bg-skeleton) 25%, var(--color-bg-skeleton-highlight) 50%, var(--color-bg-skeleton) 75%); background-size: 400% 100%; animation: shimmer 1.4s var(--motion-easing-standard) infinite; }
.fs-label { height: var(--text-small-size); width: 60%; justify-self: end; }
.fs-ctl { height: var(--control-height-md); }
@keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
</style>
