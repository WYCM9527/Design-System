<script setup>
// 采购申请详情（PRD P04）：页头（返回、标题 + 状态胶囊、元信息、按身份 / 状态给出的操作）→ 审批结果提示条 → 一张卡内的两个页签（申请信息 / 流转记录）。
// 记录不存在，或申请人查看他人申请 → 结果页「记录不存在或已被删除」，不泄露内容；?state=missing 直达该分支，?tab=history 直达页签。
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { Left, Pic, FilePdf, FileFailed } from '@icon-park/vue-next'
import { db } from '../data/db'
import { session, can, demoState, demoParam } from '../data/session'
import { getApplication, submitApplication, deleteDrafts, copyApplication, decideApplication, canEditApp, ApiError } from '../data/api'
import { money, dateOf, timeOf, dash, fileSize, lineSubtotal, sumLines } from '../data/format'
import { fileUrl } from '../data/files'
import { APP_STATUS, PRIORITY } from '../data/constants'
import { confirmLeave } from '../data/guard'

const route = useRoute(); const router = useRouter()
const id = computed(() => String(route.params.id))
const app = ref(null); const loading = ref(true); const missing = ref(false)
const TABS = ['info', 'history']
const tab = ref(TABS.includes(demoParam('tab')) ? demoParam('tab') : 'info')

async function load() {
  loading.value = true
  const a = demoState() === 'missing' ? null : await getApplication(id.value)
  // 申请人只能看本人申请：无权记录与不存在记录走同一出口，不泄露内容（PRD §6.5）
  missing.value = !a || (!can('app.viewAll') && a.applicantId !== session.userId)
  app.value = missing.value ? null : a
  loading.value = false
  if (app.value) loadFiles()
}
watch(id, load, { immediate: true })

const st = computed(() => APP_STATUS[app.value?.status] || APP_STATUS.draft)
const isOwnDraft = computed(() => !!app.value && canEditApp(app.value))
const canDecide = computed(() => !!app.value && can('approve') && app.value.status === 'pending' && app.value.applicantId !== session.userId)
// 供应商：已提交用申请内的快照 supplierName；草稿用当前所选供应商，已停用要标出（提交前必须处理）
const supplier = computed(() => {
  const a = app.value; if (!a) return null
  if (a.status !== 'draft') return a.supplierName ? { name: a.supplierName, active: true } : null
  const s = db.suppliers.find((x) => x.id === a.supplierId)
  return s ? { name: s.name, active: s.active } : null
})
const totals = computed(() => (app.value ? sumLines(app.value.lines) : { total: 0, qty: 0, incomplete: false }))
const EVENT = { created: { label: '创建申请' }, submitted: { label: '提交申请' }, approved: { label: '审批通过', type: 'success' }, rejected: { label: '审批驳回', type: 'danger' } }
const events = computed(() => (app.value ? app.value.events.map((e, i) => ({ ...e, i })).sort((x, y) => y.at.localeCompare(x.at) || y.i - x.i) : []))

// 附件：内容在 IndexedDB，读出后生成 objectURL；图片用 el-image-viewer 预览，PDF / 图片可在新标签打开；卸载时 revoke
const urls = reactive({}); const brokenFiles = reactive({})
async function loadFiles() {
  for (const f of app.value.attachments || []) {
    if (urls[f.id]) continue
    try { const u = await fileUrl(f.id); if (u) urls[f.id] = u; else brokenFiles[f.id] = true } catch { brokenFiles[f.id] = true }
  }
}
onBeforeUnmount(() => { for (const u of Object.values(urls)) URL.revokeObjectURL(u) })
const isImage = (f) => (f.type || '').startsWith('image/')
const preview = ref('')
function openFile(f) { const u = urls[f.id]; if (u) window.open(u, '_blank') }

function back() { if (window.history.state?.back) router.back(); else router.push('/applications') }

// 操作：本人草稿的提交 / 编辑 / 删除；所有可见申请的复制；审批人的通过 / 驳回（弹窗）
const busy = ref('')
const confirm = (message, title, options) => confirmBox(message, title, { cancelButtonText: '取消', type: 'warning', ...options }).then(() => true, () => false)
const errMsg = (e, fallback) => (e instanceof ApiError ? e.message : fallback)
const incomplete = (a) => (a.purpose || '').trim().length < 10 || !a.expectDate || a.lines.some((l) => !l.name)

async function submit() {
  const a = app.value
  if (incomplete(a)) { ElMessage.warning('草稿信息不完整，请进入编辑页补齐后提交'); router.push(`/applications/${a.id}/edit`); return }
  if (!(await confirm('提交后进入审批，不能再编辑或撤回。', `提交「${a.title}」？`, { confirmButtonText: '提交申请' }))) return
  busy.value = 'submit'
  try { await submitApplication({ ...a }); ElMessage.success('申请已提交，等待审批'); await load() }
  catch (e) { ElMessage.error(errMsg(e, '提交失败，请稍后重试')) }
  finally { busy.value = '' }
}
async function remove() {
  const a = app.value
  if (!(await confirm('删除后不可恢复。', `确认删除草稿「${a.title}」？`, { confirmButtonText: '删除', confirmButtonClass: 'el-button--danger' }))) return
  busy.value = 'delete'
  try { await deleteDrafts([a.id]); ElMessage.success(`已删除草稿「${a.title}」`); router.replace('/applications') }
  catch (e) { ElMessage.error(errMsg(e, '删除失败，请重试')) }
  finally { busy.value = '' }
}
async function copy() {
  busy.value = 'copy'
  try { const n = await copyApplication(app.value.id); ElMessage.success(`已复制为新草稿 ${n.no}`); router.push(`/applications/${n.id}/edit`) }
  catch (e) { ElMessage.error(errMsg(e, '复制失败，请重试')) }
  finally { busy.value = '' }
}

// 审批处理弹窗：通过意见选填、驳回必填，填写时 2–200 字（与审批中心一致）；stale 时提示刷新
const decide = reactive({ open: false, result: 'approved', opinion: '', loading: false })
const formRef = ref()
const rules = computed(() => ({ opinion: [{ trigger: 'blur', validator: (_, v, cb) => {
  const s = (v || '').trim()
  if (decide.result === 'rejected' && !s) return cb(new Error('驳回时必须填写审批意见'))
  if (s && (s.length < 2 || s.length > 200)) return cb(new Error('审批意见需为 2–200 字'))
  cb()
} }] }))
function openDecide(result) { decide.result = result; decide.opinion = ''; decide.open = true }
async function beforeClose(done) {
  if (decide.loading) return
  if (decide.opinion.trim() && !(await confirmLeave('审批意见尚未提交，关闭后将丢失。确定关闭？'))) return
  done()
}
const closeDecide = () => beforeClose(() => { decide.open = false })
async function confirmDecide() {
  try { await formRef.value.validate() } catch { return }
  decide.loading = true
  try {
    const a = await decideApplication(app.value.id, decide.result, decide.opinion)
    decide.open = false
    ElMessage.success(decide.result === 'approved' ? `已通过「${a.title}」` : `已驳回「${a.title}」`)
    await load()
  } catch (e) {
    if (e instanceof ApiError && e.code === 'stale') { ElMessage.warning('该申请已处理，请刷新列表'); decide.open = false; await load() }
    else ElMessage.error(errMsg(e, '提交失败，请稍后重试'))
  } finally { decide.loading = false }
}
</script>

<template>
  <!-- 加载中：页头与卡片骨架，不闪现零值 -->
  <template v-if="loading">
    <div class="page-head"><div class="head-skel"><el-skeleton animated :rows="1" /></div></div>
    <el-card class="flat" shadow="always"><div class="sec-body"><el-skeleton animated :rows="8" /></div></el-card>
  </template>

  <!-- 记录不存在 / 无权查看：内容级结果页——icon.muted 线性图标 + 说明 + 返回列表主按钮 -->
  <div v-else-if="missing" class="result">
    <div class="illu"><FileFailed class="illu-icon" /></div>
    <h3>记录不存在或已被删除</h3>
    <p>找不到这条采购申请：它可能已被删除、链接有误，或当前身份没有查看权限。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/applications')">返回采购申请</el-button></div>
  </div>

  <template v-else>
    <div class="page-head">
      <div class="head-left">
        <el-button text size="small" class="back" @click="back"><Left class="i-icon--sm" />返回</el-button>
        <div class="title">
          <h1>{{ app.title }}</h1>
          <span class="status" :class="st.tone">{{ st.label }}</span>
          <span v-if="app.priority === 'urgent'" class="status error">{{ PRIORITY.urgent.label }}</span>
        </div>
        <p class="meta">
          <span class="mono">{{ app.no }}</span><span aria-hidden="true">·</span>
          <span>总金额 <b class="num">{{ money(app.total) }}</b></span><span aria-hidden="true">·</span>
          <span>{{ app.applicantName }} / {{ app.deptName }}</span><span aria-hidden="true">·</span>
          <span>提交时间 <span v-if="app.submittedAt" class="num">{{ timeOf(app.submittedAt) }}</span><span v-else class="muted">未提交</span></span>
        </p>
      </div>
      <div class="actions">
        <template v-if="isOwnDraft">
          <el-button type="danger" text :loading="busy === 'delete'" :disabled="!!busy && busy !== 'delete'" @click="remove">删除</el-button>
          <el-button :loading="busy === 'copy'" :disabled="!!busy && busy !== 'copy'" @click="copy">复制为新申请</el-button>
          <el-button :disabled="!!busy" @click="router.push(`/applications/${app.id}/edit`)">编辑</el-button>
          <el-button type="primary" :loading="busy === 'submit'" :disabled="!!busy && busy !== 'submit'" @click="submit">提交申请</el-button>
        </template>
        <template v-else-if="canDecide">
          <el-button :loading="busy === 'copy'" @click="copy">复制为新申请</el-button>
          <el-button @click="openDecide('rejected')">驳回</el-button>
          <el-button type="primary" @click="openDecide('approved')">通过</el-button>
        </template>
        <el-button v-else :loading="busy === 'copy'" @click="copy">复制为新申请</el-button>
      </div>
    </div>

    <!-- 审批结果：驳回原因突出显示（不可关闭）；通过显示审批人与时间，有意见则一并显示 -->
    <el-alert v-if="app.status === 'rejected'" type="error" :closable="false" show-icon class="decision">
      <template #title>驳回原因：{{ app.opinion || '—' }}</template>
      审批人 {{ app.approverName }} · <span class="num">{{ timeOf(app.decidedAt) }}</span> 驳回。需要修改时请使用「复制为新申请」重新提交。
    </el-alert>
    <el-alert v-else-if="app.status === 'approved'" type="success" :closable="false" show-icon class="decision">
      <template #title>已通过 · 审批人 {{ app.approverName }} · <span class="num">{{ timeOf(app.decidedAt) }}</span></template>
      <template v-if="app.opinion">审批意见：{{ app.opinion }}</template>
    </el-alert>

    <el-card class="flat" shadow="always">
      <el-tabs v-model="tab" class="tabs">
        <el-tab-pane label="申请信息" name="info">
          <section class="sec">
            <div class="card-head"><h2>基础信息</h2></div>
            <div class="sec-body">
              <el-descriptions :column="3" border label-width="var(--layout-form-label-width)">
                <el-descriptions-item label="申请人">{{ app.applicantName }}</el-descriptions-item>
                <el-descriptions-item label="所属部门">{{ app.deptName }}</el-descriptions-item>
                <el-descriptions-item label="优先级"><span v-if="app.priority === 'urgent'" class="status error">{{ PRIORITY.urgent.label }}</span><template v-else>{{ PRIORITY[app.priority]?.label || PRIORITY.normal.label }}</template></el-descriptions-item>
                <el-descriptions-item label="期望到货日期"><span class="num">{{ dateOf(app.expectDate) }}</span></el-descriptions-item>
                <el-descriptions-item label="供应商"><template v-if="supplier">{{ supplier.name }}<span v-if="!supplier.active" class="status neutral tag-gap">已停用</span></template><template v-else>—</template></el-descriptions-item>
                <el-descriptions-item label="申请单号"><span class="mono">{{ app.no }}</span></el-descriptions-item>
                <el-descriptions-item label="创建时间"><span class="num">{{ timeOf(app.createdAt) }}</span></el-descriptions-item>
                <el-descriptions-item label="更新时间"><span class="num">{{ timeOf(app.updatedAt) }}</span></el-descriptions-item>
                <el-descriptions-item label="提交时间"><span v-if="app.submittedAt" class="num">{{ timeOf(app.submittedAt) }}</span><span v-else class="muted">未提交</span></el-descriptions-item>
              </el-descriptions>
            </div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>采购明细</h2><span class="sub">共 {{ app.lines.length }} 项</span></div>
            <el-table :data="app.lines">
              <el-table-column label="物品" min-width="220"><template #default="{ row }">{{ dash(row.name) }}</template></el-table-column>
              <el-table-column label="类别" width="120"><template #default="{ row }">{{ dash(row.category) }}</template></el-table-column>
              <el-table-column label="规格" min-width="200"><template #default="{ row }">{{ dash(row.spec) }}</template></el-table-column>
              <el-table-column label="数量" width="90" align="right"><template #default="{ row }"><span class="num">{{ dash(row.qty) }}</span></template></el-table-column>
              <el-table-column label="预估单价" width="140" align="right"><template #default="{ row }"><span class="num">{{ money(row.price) }}</span></template></el-table-column>
              <el-table-column label="小计" width="150" align="right"><template #default="{ row }"><span class="num">{{ lineSubtotal(row) === null ? '—' : money(lineSubtotal(row)) }}</span></template></el-table-column>
            </el-table>
            <div class="totals">
              <span>总数量 <b class="num">{{ totals.qty }}</b></span>
              <span>预估总金额 <b class="num amount">{{ money(totals.total) }}</b><span v-if="totals.incomplete" class="status neutral tag-gap" title="有明细未填写完整，金额为暂计">暂计</span></span>
            </div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>采购用途</h2></div>
            <div class="sec-body"><p class="para" :class="{ muted: !app.purpose }">{{ app.purpose || '—' }}</p></div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>附件</h2><span v-if="app.attachments.length" class="sub">共 {{ app.attachments.length }} 个</span></div>
            <div class="sec-body">
              <div v-if="app.attachments.length" class="files">
                <article v-for="f in app.attachments" :key="f.id" class="file">
                  <button v-if="isImage(f) && urls[f.id]" type="button" class="thumb is-img" :aria-label="`预览 ${f.name}`" @click="preview = urls[f.id]"><img :src="urls[f.id]" :alt="f.name" /></button>
                  <div v-else class="thumb" aria-hidden="true"><component :is="isImage(f) ? Pic : FilePdf" /></div>
                  <div class="file-body">
                    <div class="file-name" :title="f.name">{{ f.name }}</div>
                    <span class="sub">{{ fileSize(f.size || 0) }}<template v-if="brokenFiles[f.id]"> · 文件不可用</template></span>
                  </div>
                  <div class="file-acts">
                    <button v-if="isImage(f)" type="button" class="act" :disabled="!urls[f.id]" @click="preview = urls[f.id]">预览</button>
                    <button type="button" class="act" :disabled="!urls[f.id]" @click="openFile(f)">新标签打开</button>
                  </div>
                </article>
              </div>
              <p v-else class="para muted">—</p>
            </div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>备注</h2></div>
            <div class="sec-body"><p class="para" :class="{ muted: !app.note }">{{ app.note || '—' }}</p></div>
          </section>
        </el-tab-pane>

        <el-tab-pane label="流转记录" name="history">
          <section class="sec">
            <div class="card-head"><h2>流转记录</h2><span class="sub">按时间倒序</span></div>
            <div class="sec-body">
              <!-- 节点按事件语义取色：通过 success、驳回 danger；创建 / 提交是中性事件，不传 type（默认灰点） -->
              <el-timeline>
                <el-timeline-item v-for="e in events" :key="e.i" :timestamp="timeOf(e.at)" placement="top" :type="EVENT[e.type]?.type">
                  <div class="ev-title"><b>{{ e.byName }}</b> {{ EVENT[e.type]?.label || e.type }}</div>
                  <span v-if="e.opinion" class="sub">审批意见：{{ e.opinion }}</span>
                  <span v-if="e.note" class="sub">{{ e.note }}</span>
                </el-timeline-item>
              </el-timeline>
            </div>
          </section>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 审批处理弹窗：确认类宽度 layout.modal.width.sm；脏状态（已填意见）关闭前确认，Esc 与取消同一规则 -->
    <el-dialog v-model="decide.open" :title="decide.result === 'approved' ? '通过申请' : '驳回申请'" :width="'var(--layout-modal-width-sm)'" :close-on-click-modal="false" :before-close="beforeClose" destroy-on-close>
      <p class="hint">「{{ app.title }}」 · <span class="mono">{{ app.no }}</span> · 预估总金额 <b class="num">{{ money(app.total) }}</b></p>
      <el-form ref="formRef" :model="decide" :rules="rules" label-position="top" @submit.prevent="confirmDecide">
        <el-form-item label="审批意见" prop="opinion" :required="decide.result === 'rejected'">
          <el-input v-model="decide.opinion" type="textarea" :rows="4" maxlength="200" show-word-limit :placeholder="decide.result === 'rejected' ? '必填，2–200 字，说明驳回原因' : '选填，2–200 字'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="decide.loading" @click="closeDecide">取消</el-button>
        <el-button :type="decide.result === 'approved' ? 'primary' : 'danger'" :loading="decide.loading" @click="confirmDecide">{{ decide.result === 'approved' ? '确认通过' : '确认驳回' }}</el-button>
      </template>
    </el-dialog>

    <el-image-viewer v-if="preview" :url-list="[preview]" hide-on-click-modal teleported @close="preview = ''" />
  </template>
</template>

<style scoped>
.head-skel { flex: 1; }
.head-left { min-width: 0; }
.back { margin-bottom: var(--spacing-2); }
.title { display: flex; align-items: center; gap: var(--space-inline); flex-wrap: wrap; margin-bottom: var(--spacing-1); }
.title h1 { margin: 0; overflow-wrap: anywhere; }
.meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 var(--space-inline); }
.muted { color: var(--color-text-muted); }
.tag-gap { margin-left: var(--space-inline); }
.decision :deep(.el-alert__title) { font-size: var(--text-body-size); }

/* 页签放在卡片内：页签头与卡片同一水平内边距；各分区自带标题条，分区之间用发丝线分隔（同 golden-admin MerchantDetail） */
.tabs :deep(.el-tabs__header) { margin: 0; padding: 0 var(--space-card); }
.sec + .sec { border-top: var(--border-width-default) solid var(--color-border-default); }
.sec-body { padding: var(--space-card); }

/* 金额汇总：明细表下方右对齐，总金额升一档字号 */
.totals { display: flex; justify-content: flex-end; align-items: baseline; gap: var(--spacing-6); padding: var(--spacing-3) var(--space-card); border-top: var(--border-width-default) solid var(--color-border-default); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.totals b { color: var(--color-text-primary); font-weight: var(--text-weight-strong); }
.totals .amount { font-size: var(--text-title-sm-size); }
.para { margin: 0; line-height: var(--text-paragraph-line-height); white-space: pre-wrap; overflow-wrap: anywhere; }

/* 附件卡（DESIGN 附件配方）：缩略图 4:3、bg.subtle + 虚线 + icon.muted；卡片(lg) 内的次级容器 md、缩略图 sm */
.files { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-4); }
.file { display: flex; flex-direction: column; gap: var(--spacing-3); padding: var(--spacing-4); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); min-width: 0; }
.thumb { aspect-ratio: 4 / 3; width: 100%; border-radius: var(--radius-sm); background: var(--color-bg-subtle); border: var(--border-width-default) dashed var(--color-border-strong); display: grid; place-items: center; color: var(--color-icon-muted); overflow: hidden; padding: 0; }
.thumb .i-icon { font-size: var(--icon-size-2xl); }
.thumb.is-img { cursor: zoom-in; border-style: solid; }
.thumb.is-img:focus-visible { outline: var(--border-width-active) solid var(--color-border-focus); outline-offset: var(--spacing-0-5); }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.file-name { font-size: var(--text-body-sm-size); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-acts { margin-top: auto; display: flex; }

.ev-title { font-size: var(--text-body-sm-size); color: var(--color-text-primary); }
.ev-title b { font-weight: var(--text-weight-label); }
.hint { margin: 0 0 var(--spacing-3); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.illu-icon { font-size: var(--icon-size-2xl); color: var(--color-icon-muted); }
</style>
