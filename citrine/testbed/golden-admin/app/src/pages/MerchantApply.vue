<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CheckOne, UploadOne } from '@icon-park/vue-next'
import { tone } from '../mock/data'

const router = useRouter()

// 演示用选项直接写在页面里（需求约定）
const CATEGORIES = ['餐饮', '生鲜', '甜品饮品', '便利店']
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都']
const STEPS = [
  { title: '基本信息', description: '填写商户与门店信息' },
  { title: '资质上传', description: '上传营业执照与门头照' },
  { title: '确认提交', description: '核对信息并提交审核' }
]
const APPLY_ID = 'MA-20260910-0001'
const APPLY_STATUS = '待审核'

// 文件限制：jpg / png，单个 ≤ 5MB
const ACCEPT = 'image/jpeg,image/png'
const MAX_SIZE = 5 * 1024 * 1024
const FILE_HELP = '支持 jpg / png 格式，单个文件不超过 5MB'

const phase = ref('form')   // form（填写）→ result（提交成功）→ detail（查看申请）
const step = ref(1)
const submitting = ref(false)

const formRef = ref()
const fileFormRef = ref()
const agreeFormRef = ref()

const form = reactive({ name: '', category: '', contact: '', phone: '', city: '', address: '', hours: null, radius: 3, intro: '' })
const files = reactive({ license: [], storefront: [], permit: [] })
const agree = reactive({ agreed: false })

const rules = {
  name: [
    { required: true, message: '请输入商户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '商户名称为 2–20 个字', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择经营类目', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入门店地址', trigger: 'blur' }]
}
const fileRules = {
  license: [{ required: true, type: 'array', message: '请上传营业执照', trigger: 'change' }],
  storefront: [{ required: true, type: 'array', message: '请上传门头照', trigger: 'change' }]
}
const agreeRules = {
  agreed: [{ validator: (_rule, value, callback) => callback(value ? undefined : new Error('请先阅读并同意《商户入驻协议》')), trigger: 'change' }]
}

const hoursText = computed(() => (form.hours ? `${form.hours[0]} 至 ${form.hours[1]}` : '—'))
const fileNames = (list) => list.map((f) => f.name).join('、')

// 不真的上传（auto-upload=false），格式与大小在 change 时校验，不合规的从列表移除
function checkFile(raw) {
  if (!raw) return ''
  const okType = ['image/jpeg', 'image/png'].includes(raw.type) || /\.(jpe?g|png)$/i.test(raw.name)
  if (!okType) return '仅支持 jpg / png 格式的图片'
  if (raw.size > MAX_SIZE) return '单个文件不能超过 5MB'
  return ''
}
function revalidate(key) {
  nextTick(() => fileFormRef.value?.validateField(key).catch(() => {}))
}
function onFileChange(key, file, list) {
  const error = checkFile(file.raw)
  if (error) {
    ElMessage.error(error)
    files[key] = list.filter((f) => f.uid !== file.uid)
  }
  revalidate(key)
}
function onExceed(limit) {
  ElMessage.warning(`最多上传 ${limit} 张，请先删除已有文件`)
}

async function next() {
  const target = step.value === 1 ? formRef : fileFormRef
  try { await target.value.validate() } catch { return }   // 校验不过不能进入下一步
  step.value += 1
}
function prev() { step.value = Math.max(1, step.value - 1) }
function saveDraft() { ElMessage.success('草稿已保存，可稍后继续提交') }
async function submit() {
  try { await agreeFormRef.value.validate() } catch { return }
  submitting.value = true
  setTimeout(() => {   // 演示：模拟提交耗时
    submitting.value = false
    phase.value = 'result'
    window.scrollTo({ top: 0 })
  }, 600)
}
function goList() { router.push({ name: 'merchants' }) }

// 演示数据：?step=2 / ?step=3 / ?state=success 直达时填满前面的步骤
function fillDemo(upTo) {
  Object.assign(form, {
    name: '川味小馆（望京店）', category: '餐饮', contact: '李明', phone: '13800001234', city: '北京',
    address: '朝阳区望京西路 8 号院 1 号楼 102', hours: ['09:00', '22:00'], radius: 3,
    intro: '主打川味家常菜，提供午晚餐配送，支持提前预订。'
  })
  if (upTo >= 3) {
    files.license = [{ name: '营业执照.jpg', status: 'success' }]
    files.storefront = [{ name: '门头照-正面.jpg', status: 'success' }, { name: '门头照-侧面.jpg', status: 'success' }]
    files.permit = [{ name: '食品经营许可证.png', status: 'success' }]
  }
}

onMounted(async () => {
  const q = new URLSearchParams(location.search)   // 项目约定：演示状态参数放在 # 之前
  const s = q.get('step'), state = q.get('state')
  if (state === 'success') { fillDemo(3); phase.value = 'result'; return }
  const n = Number(s)
  if (n === 2 || n === 3) { fillDemo(n); step.value = n }
  if (state === 'invalid') {   // 第一步触发全部校验错误
    await nextTick()
    formRef.value?.validate().catch(() => {})
  }
})
</script>

<template>
  <div class="apply-page">
    <div v-if="phase !== 'result'" class="page-head">
      <div>
        <h1>入驻申请</h1>
        <p v-if="phase === 'detail'">申请编号 <span class="mono">{{ APPLY_ID }}</span>，审核将在 1 个工作日内完成</p>
        <p v-else>分三步完成入驻申请：填写基本信息、上传资质材料、确认后提交审核</p>
      </div>
      <div v-if="phase === 'detail'" class="actions"><span :class="['status', tone(APPLY_STATUS)]">{{ APPLY_STATUS }}</span></div>
    </div>

    <!-- 提交成功：结果页 -->
    <div v-if="phase === 'result'" class="result">
      <div class="illu"><check-one class="result-icon" /></div>
      <h3>申请已提交</h3>
      <p>审核将在 1 个工作日内完成，结果会通过站内通知与短信告知</p>
      <div class="acts">
        <el-button type="primary" @click="goList">返回商户列表</el-button>
        <el-button @click="phase = 'detail'">查看申请</el-button>
      </div>
    </div>

    <el-card v-else class="flat form-page">
      <div class="apply-steps">
        <el-steps :active="phase === 'detail' ? STEPS.length : step - 1" finish-status="success" align-center>
          <el-step v-for="s in STEPS" :key="s.title" :title="s.title" :description="s.description" />
        </el-steps>
      </div>

      <!-- 第一步：基本信息 -->
      <el-form v-show="phase === 'form' && step === 1" ref="formRef" :model="form" :rules="rules" label-position="right" scroll-to-error>
        <div class="form-grid">
          <el-form-item label="商户名称" prop="name">
            <el-input v-model="form.name" maxlength="20" placeholder="2–20 个字" />
          </el-form-item>
          <el-form-item label="经营类目" prop="category">
            <el-select v-model="form.category" class="w-full" placeholder="请选择类目">
              <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="form.contact" placeholder="门店负责人姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" class="num" maxlength="11" inputmode="numeric" placeholder="11 位手机号" />
          </el-form-item>
          <el-form-item label="所在城市" prop="city">
            <el-select v-model="form.city" class="w-full" placeholder="请选择城市" clearable>
              <el-option v-for="c in CITIES" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="配送范围" prop="radius">
            <el-input-number v-model="form.radius" :min="1" :max="10" :step="1" aria-label="配送范围（公里）" />
            <span class="unit">km</span>
          </el-form-item>
          <el-form-item label="门店地址" prop="address" class="span2">
            <el-input v-model="form.address" placeholder="区县、街道与门牌号" />
          </el-form-item>
          <el-form-item label="营业时间" prop="hours" class="span2">
            <el-time-picker v-model="form.hours" is-range format="HH:mm" value-format="HH:mm" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
          </el-form-item>
          <el-form-item label="店铺简介" prop="intro" class="span2">
            <el-input v-model="form.intro" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填，向顾客介绍你的店铺" />
          </el-form-item>
        </div>
      </el-form>

      <!-- 第二步：资质上传 -->
      <el-form v-show="phase === 'form' && step === 2" ref="fileFormRef" :model="files" :rules="fileRules" label-position="right">
        <div class="form-grid">
          <el-form-item label="营业执照" prop="license" class="span2">
            <el-upload v-model:file-list="files.license" :class="{ 'upload-full': files.license.length >= 1 }" list-type="picture-card" :accept="ACCEPT" :auto-upload="false" :limit="1" :on-change="(file, list) => onFileChange('license', file, list)" :on-remove="() => revalidate('license')" :on-exceed="() => onExceed(1)">
              <div class="upload-trigger"><upload-one class="upload-icon" /><span>上传营业执照</span></div>
              <template #tip><span class="help">{{ FILE_HELP }}，需清晰完整、四角可见</span></template>
            </el-upload>
          </el-form-item>
          <el-form-item label="门头照" prop="storefront" class="span2">
            <el-upload v-model:file-list="files.storefront" :class="{ 'upload-full': files.storefront.length >= 3 }" list-type="picture-card" :accept="ACCEPT" :auto-upload="false" :limit="3" multiple :on-change="(file, list) => onFileChange('storefront', file, list)" :on-remove="() => revalidate('storefront')" :on-exceed="() => onExceed(3)">
              <div class="upload-trigger"><upload-one class="upload-icon" /><span>上传门头照</span></div>
              <template #tip><span class="help">{{ FILE_HELP }}，最多 3 张，需包含完整招牌</span></template>
            </el-upload>
          </el-form-item>
          <!-- 标签不超过 6 个汉字（DESIGN.md），全称放进上传区说明 -->
          <el-form-item label="经营许可证" prop="permit" class="span2">
            <el-upload v-model:file-list="files.permit" class="w-full" drag :accept="ACCEPT" :auto-upload="false" :limit="1" :on-change="(file, list) => onFileChange('permit', file, list)" :on-exceed="() => onExceed(1)">
              <div class="dropzone">
                <upload-one class="dropzone-icon" />
                <span>将食品经营许可证拖到此处，或点击上传</span>
                <small>选填，仅餐饮 / 生鲜类目需要</small>
              </div>
              <template #tip><span class="help">{{ FILE_HELP }}</span></template>
            </el-upload>
          </el-form-item>
        </div>
      </el-form>

      <!-- 第三步：确认提交（提交后的「查看申请」复用这份只读汇总） -->
      <div v-if="phase === 'detail' || step === 3" class="summary">
        <section>
          <h3>基本信息</h3>
          <el-descriptions :column="2" border label-width="var(--layout-form-label-width)">
            <el-descriptions-item label="商户名称">{{ form.name }}</el-descriptions-item>
            <el-descriptions-item label="经营类目">{{ form.category }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ form.contact }}</el-descriptions-item>
            <el-descriptions-item label="手机号"><span class="num">{{ form.phone }}</span></el-descriptions-item>
            <el-descriptions-item label="所在城市"><span :class="{ none: !form.city }">{{ form.city || '—' }}</span></el-descriptions-item>
            <el-descriptions-item label="配送范围"><span class="num">{{ form.radius }} km</span></el-descriptions-item>
            <el-descriptions-item label="门店地址" :span="2">{{ form.address }}</el-descriptions-item>
            <el-descriptions-item label="营业时间" :span="2"><span :class="['num', { none: !form.hours }]">{{ hoursText }}</span></el-descriptions-item>
            <el-descriptions-item label="店铺简介" :span="2"><span :class="{ none: !form.intro }">{{ form.intro || '—' }}</span></el-descriptions-item>
          </el-descriptions>
        </section>
        <section>
          <h3>资质文件</h3>
          <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
            <el-descriptions-item label="营业执照">{{ fileNames(files.license) }}</el-descriptions-item>
            <el-descriptions-item label="门头照">{{ fileNames(files.storefront) }}</el-descriptions-item>
            <el-descriptions-item label="经营许可证"><span :class="{ none: !files.permit.length }">{{ fileNames(files.permit) || '—' }}</span></el-descriptions-item>
          </el-descriptions>
        </section>
        <el-form v-if="phase === 'form'" ref="agreeFormRef" :model="agree" :rules="agreeRules" class="agree">
          <el-form-item prop="agreed">
            <el-checkbox v-model="agree.agreed">我已阅读并同意《商户入驻协议》</el-checkbox>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-foot">
        <template v-if="phase === 'detail'">
          <el-button type="primary" @click="goList">返回商户列表</el-button>
        </template>
        <template v-else>
          <el-button :disabled="step === 1" @click="prev">上一步</el-button>
          <el-button v-if="step === 3" text @click="saveDraft">保存草稿</el-button>
          <el-button v-if="step < 3" type="primary" @click="next">下一步</el-button>
          <el-button v-else type="primary" :loading="submitting" @click="submit">提交申请</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.apply-page { display: flex; flex-direction: column; gap: var(--space-stack); }
.apply-steps { padding: var(--space-card) var(--space-card) var(--spacing-4); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.w-full { width: 100%; }
.unit { margin-left: var(--space-inline); color: var(--color-text-secondary); }
/* 帮助文字：小字 + 弱化色，占满一行落在控件下方 */
.help { display: block; width: 100%; margin-top: var(--spacing-1); font-size: var(--text-small-size); line-height: var(--text-body-line-height); color: var(--color-text-muted); }
.upload-trigger { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-1); font-size: var(--text-small-size); color: var(--color-text-secondary); }
.upload-icon { font-size: var(--icon-size-xl); color: var(--color-icon-muted); }
/* 达到数量上限后隐藏「+」触发块，避免超出后还能继续选择 */
.upload-full :deep(.el-upload--picture-card) { display: none; }
.dropzone { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-1); color: var(--color-text-secondary); }
.dropzone-icon { font-size: var(--icon-size-2xl); color: var(--color-icon-muted); }
.dropzone small { font-size: var(--text-small-size); color: var(--color-text-muted); }
.summary { display: flex; flex-direction: column; gap: var(--space-stack); padding: var(--space-card); }
.summary h3 { margin: 0 0 var(--spacing-3); font-size: var(--text-title-sm-size); font-weight: var(--text-weight-label); }
.summary .none { color: var(--color-text-muted); }
.agree :deep(.el-form-item) { margin-bottom: 0; }
.result-icon { font-size: var(--icon-size-2xl); color: var(--color-status-success); }
</style>
