<script setup>
// 系统设置（PRD P11）：「基础设置 / 通知设置」两个页签各自独立表单与保存；某页签有未保存修改时切换页签先确认（before-leave），整页 useDirtyGuard。
// 底部独立危险区「恢复演示数据」：输入「恢复」才能确认，完成后切回管理员许岚并回到工作台。
// 演示参数（放在 # 之前）：?tab=basic|notify、?state=invalid（基础设置直接展示字段错误）。
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, Caution } from '@icon-park/vue-next'
import { db, resetDemo } from '../data/db'
import { saveSettings } from '../data/api'
import { switchUser, demoParam, demoState } from '../data/session'
import { PAGE_SIZES } from '../data/constants'
import { useDirtyGuard, confirmLeave } from '../data/guard'
import { fileSize } from '../data/format'

const router = useRouter()
const TABS = { basic: '基础设置', notify: '通知设置' }
const wanted = demoParam('tab')
const tab = ref(wanted in TABS ? wanted : 'basic')

// 两份表单各自对照 db.settings 判脏；保存成功 / 放弃修改后回到已保存值（PRD §6.4：取消修改时恢复上次已保存内容）
const pickBasic = () => ({ systemName: db.settings.systemName || '', companyName: db.settings.companyName || '', logo: db.settings.logo || '', pageSize: db.settings.pageSize || 10 })
const pickNotify = () => ({ notifyOnResult: !!db.settings.notifyOnResult })
const basic = reactive(pickBasic()), notify = reactive(pickNotify())
const basicDirty = computed(() => JSON.stringify(basic) !== JSON.stringify(pickBasic()))
const notifyDirty = computed(() => JSON.stringify(notify) !== JSON.stringify(pickNotify()))
useDirtyGuard(() => basicDirty.value || notifyDirty.value)

const basicRef = ref()
const lenRule = (min, max, what) => ({ validator: (_, v, cb) => { const n = String(v || '').trim().length; cb(n >= min && n <= max ? undefined : new Error(`${what}为 ${min}–${max} 字`)) }, trigger: 'blur' })
const basicRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }, lenRule(2, 20, '系统名称')],
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }, lenRule(2, 30, '企业名称')]
}

// 企业 Logo：原生 file input 读成 dataURL 存到 logo；类型 / 大小错误落到字段（el-form-item 的 error 属性）
const LOGO_TYPES = ['image/png', 'image/jpeg'], LOGO_MAX = 2 * 1024 * 1024
const fileRef = ref(), logoError = ref('')
function pickLogo() { fileRef.value?.click() }
function onLogo(e) {
  const f = e.target.files?.[0]; e.target.value = ''
  if (!f) return
  if (!LOGO_TYPES.includes(f.type)) { logoError.value = '仅支持 PNG / JPG 图片'; return }
  if (f.size > LOGO_MAX) { logoError.value = `文件 ${fileSize(f.size)}，超过 2MB 限制`; return }
  const r = new FileReader()
  r.onload = () => { basic.logo = String(r.result); logoError.value = '' }
  r.onerror = () => { logoError.value = '读取图片失败，请重新选择' }
  r.readAsDataURL(f)
}
function removeLogo() { basic.logo = ''; logoError.value = '' }
const brandInitial = computed(() => (basic.systemName.trim() || '轻').slice(0, 1))

const savingBasic = ref(false), savingNotify = ref(false)
async function saveBasic() {
  const ok = await basicRef.value.validate().catch(() => false)
  if (!ok) return
  savingBasic.value = true
  try {
    await saveSettings({ systemName: basic.systemName.trim(), companyName: basic.companyName.trim(), logo: basic.logo, pageSize: basic.pageSize })
    Object.assign(basic, pickBasic()); logoError.value = ''
    ElMessage.success('基础设置已保存')
  } catch (e) { ElMessage.error(e.message || '保存失败，请重试') }   // 失败保留修改
  finally { savingBasic.value = false }
}
async function saveNotify() {
  savingNotify.value = true
  try { await saveSettings({ notifyOnResult: notify.notifyOnResult }); Object.assign(notify, pickNotify()); ElMessage.success('通知设置已保存') }
  catch (e) { ElMessage.error(e.message || '保存失败，请重试') }
  finally { savingNotify.value = false }
}
function revertBasic() { Object.assign(basic, pickBasic()); logoError.value = ''; nextTick(() => basicRef.value?.clearValidate()) }
function revertNotify() { Object.assign(notify, pickNotify()) }

// 切换页签：离开的页签有未保存修改先确认；确认离开后放弃该页签的修改
async function beforeLeave(to, from) {
  const dirty = from === 'basic' ? basicDirty.value : notifyDirty.value
  if (!dirty) return true
  const ok = await confirmLeave(`「${TABS[from]}」有未保存的修改，切换页签后将丢失。确定切换？`)
  if (ok) (from === 'basic' ? revertBasic : revertNotify)()
  return ok
}

// 恢复演示数据：输入「恢复」两字才能确认
const resetDlg = reactive({ open: false, text: '', busy: false })
const canReset = computed(() => resetDlg.text.trim() === '恢复')
function openReset() { resetDlg.text = ''; resetDlg.open = true }
async function doReset() {
  if (!canReset.value || resetDlg.busy) return
  resetDlg.busy = true
  try {
    await resetDemo()
    revertBasic(); revertNotify()          // 表单同步为恢复后的设置，离开时不再触发未保存确认
    switchUser('u01')
    resetDlg.open = false
    await router.replace('/')
    ElMessage.success('演示数据已恢复')
  } catch (e) { ElMessage.error(e.message || '恢复失败，请重试') }
  finally { resetDlg.busy = false }
}

onMounted(() => {
  if (demoState() === 'invalid') { basic.systemName = '轻'; basic.companyName = ''; nextTick(() => setTimeout(() => basicRef.value?.validate().catch(() => {}), 50)) }
})
</script>

<template>
  <div class="page-head">
    <div><h1>系统设置</h1><p>基础设置与通知设置各自独立保存；保存后立即生效，效果见各字段下方说明</p></div>
  </div>

  <el-card class="flat form-page" shadow="always">
    <el-tabs v-model="tab" class="tabs" :before-leave="beforeLeave">
      <el-tab-pane name="basic">
        <template #label>基础设置<span v-if="basicDirty" class="unsaved">（未保存）</span></template>
        <el-form ref="basicRef" :model="basic" :rules="basicRules" label-position="right" scroll-to-error class="sform" @submit.prevent="saveBasic">
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="basic.systemName" maxlength="20" show-word-limit placeholder="2–20 字" />
            <div class="help">保存后更新侧栏品牌名称</div>
          </el-form-item>
          <el-form-item label="企业名称" prop="companyName">
            <el-input v-model="basic.companyName" maxlength="30" show-word-limit placeholder="2–30 字" />
            <div class="help">保存后更新「组织与成员」组织树的根节点名称</div>
          </el-form-item>
          <el-form-item label="企业 Logo" :error="logoError">
            <div class="logo-row">
              <span class="logo-preview" aria-hidden="true"><img v-if="basic.logo" :src="basic.logo" alt="" /><template v-else>{{ brandInitial }}</template></span>
              <el-button @click="pickLogo"><Upload class="i-icon--sm" />{{ basic.logo ? '更换图片' : '选择图片' }}</el-button>
              <el-button v-if="basic.logo" text @click="removeLogo">移除</el-button>
              <input ref="fileRef" type="file" accept="image/png,image/jpeg" hidden aria-label="选择企业 Logo 图片" @change="onLogo" />
            </div>
            <div class="help">选填，PNG / JPG，最大 2MB。保存后更新侧栏标识；移除后恢复文字标识（取系统名称首字）</div>
          </el-form-item>
          <el-form-item label="每页条数" prop="pageSize">
            <el-radio-group v-model="basic.pageSize" aria-label="列表每页条数"><el-radio v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }} 条</el-radio></el-radio-group>
            <div class="help">下一次打开完整列表页时采用新默认值；不影响工作台「最多 5 条」的摘要列表</div>
          </el-form-item>
        </el-form>
        <div class="form-foot">
          <el-button text :disabled="!basicDirty" @click="revertBasic">放弃修改</el-button>
          <el-button type="primary" :loading="savingBasic" @click="saveBasic">保存</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane name="notify">
        <template #label>通知设置<span v-if="notifyDirty" class="unsaved">（未保存）</span></template>
        <el-form :model="notify" label-position="right" class="sform" @submit.prevent="saveNotify">
          <el-form-item label="审批结果通知">
            <div class="switch-row"><el-switch v-model="notify.notifyOnResult" aria-label="审批结果站内通知" /><span class="switch-text">{{ notify.notifyOnResult ? '已开启：审批通过或驳回后为申请人创建站内通知' : '已关闭：之后的审批结果不再创建站内通知' }}</span></div>
            <div class="help">决定之后是否为申请人创建审批结果通知。关闭后不再为申请人创建审批结果通知，已有消息不受影响，也不影响申请的流转记录</div>
          </el-form-item>
        </el-form>
        <div class="form-foot">
          <el-button text :disabled="!notifyDirty" @click="revertNotify">放弃修改</el-button>
          <el-button type="primary" :loading="savingNotify" @click="saveNotify">保存</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <!-- 危险区：独立于表单保存 -->
  <el-card class="flat form-page" shadow="always">
    <div class="card-head"><h2>恢复演示数据</h2></div>
    <div class="danger-body">
      <p>将清空本次测试新增或修改的数据、附件、通知与日志，恢复初始数据和设置；完成后切换为管理员许岚并回到工作台。此操作不可撤销。</p>
      <el-button type="danger" @click="openReset"><Caution class="i-icon--sm" />恢复演示数据</el-button>
    </div>
  </el-card>

  <el-dialog v-model="resetDlg.open" title="恢复演示数据" :width="'var(--layout-modal-width-sm)'" :close-on-click-modal="false">
    <p class="dlg-text">将清空本次测试新增或修改的数据、附件、通知与日志，恢复初始数据和设置。此操作不可撤销。</p>
    <label class="dlg-label" for="reset-confirm">请输入「恢复」两字以确认</label>
    <el-input id="reset-confirm" v-model="resetDlg.text" placeholder="恢复" autocomplete="off" @keyup.enter="doReset" />
    <template #footer>
      <el-button @click="resetDlg.open = false">取消</el-button>
      <el-button type="danger" :disabled="!canReset" :loading="resetDlg.busy" @click="doReset">确认恢复</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 页签放在卡内：页签头与卡片同一水平内边距；每个页签 = 表单 + 页脚 */
.tabs :deep(.el-tabs__header) { margin: 0; padding: 0 var(--space-card); }
.unsaved { color: var(--color-text-muted); font-weight: var(--font-weight-regular); }
.sform { padding: var(--space-card) var(--space-card) var(--spacing-1); }
/* 字段说明在控件下方 spacing.1；出错时错误文案占同一位置，不叠加 */
.sform .help { display: block; width: 100%; margin-top: var(--spacing-1); line-height: var(--text-body-line-height); }
.sform .el-form-item.is-error .help { display: none; }

/* Logo 预览：复刻侧栏品牌方块（品牌黄底深字）放大一倍，让管理员在保存前看到效果 */
.logo-row { display: flex; align-items: center; gap: var(--spacing-3); }
.logo-preview { width: calc(var(--avatar-size-md) * 2); height: calc(var(--avatar-size-md) * 2); border-radius: var(--radius-md); background: var(--color-action-primary); color: var(--color-text-on-primary); display: grid; place-items: center; font-weight: var(--text-weight-logo); font-size: var(--text-heading-size); overflow: hidden; flex: none; }
.logo-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.logo-row .el-button + .el-button { margin-left: 0; }   /* 间距由 gap 统一 */

.switch-row { display: flex; align-items: center; gap: var(--spacing-3); }
.switch-text { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }

.danger-body { display: flex; align-items: center; justify-content: space-between; gap: var(--space-stack); padding: var(--space-card); }
.danger-body p { margin: 0; color: var(--color-text-secondary); line-height: var(--text-paragraph-line-height); }
.danger-body .el-button { flex: none; }

.dlg-text { margin: 0 0 var(--spacing-3); color: var(--color-text-secondary); line-height: var(--text-paragraph-line-height); }
.dlg-label { display: block; margin-bottom: var(--spacing-1-5); font-size: var(--text-body-sm-size); font-weight: var(--text-weight-label); }
</style>
