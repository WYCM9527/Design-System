<script setup>
import { computed, reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, Close, Plus } from '@icon-park/vue-next'
import { merchants } from '../mock/data'
import { can } from '../store'

const route = useRoute(); const router = useRouter()
const editing = computed(() => !!route.params.id)
const readonly = computed(() => !can('merchant.edit'))   // 审核员进入：全部只读，底部只剩返回（PRD §4.5）
const src = merchants.find((m) => m.id === route.params.id)
const form = reactive({
  name: src?.name || '', id: src?.id || '（提交后自动生成）', type: src?.type || '餐饮', cycle: src?.cycle || 'T+7',
  contact: src?.contact || '', phone: src ? '13800002211' : '', city: src?.city || '', address: src ? '望京 SOHO 塔 3 · 1 层 108' : '',
  radius: src?.radius || 5, minOrder: src?.minOrder || 20, tags: src?.tags ? [...src.tags] : ['川菜'], license: src ? [{ name: '营业执照.pdf' }] : [], note: ''
})
const rules = {
  name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择经营类型', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }, { pattern: /^1\d{10}$/, message: '手机号格式不正确，应为 11 位数字', trigger: 'blur' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  license: [{ type: 'array', required: true, min: 1, message: '请上传营业执照（JPG / PNG / PDF）', trigger: 'change' }]
}
const formRef = ref()
// ?state=invalid 一次演示三种错误：电话格式、必填缺失、执照未上传
if (new URLSearchParams(location.search).get('state') === 'invalid') {
  form.phone = '1380000'; form.contact = ''; form.license = []
  nextTick(() => setTimeout(() => formRef.value?.validate().catch(() => {}), 50))
}
const newTag = ref(''); const tagInput = ref(false)
function addTag() { if (newTag.value && !form.tags.includes(newTag.value)) form.tags.push(newTag.value); newTag.value = ''; tagInput.value = false }
async function submit(draft) {
  if (!draft) { const ok = await formRef.value.validate().then(() => true).catch(() => false); if (!ok) { ElMessage.error('请先修正表单中的错误'); return } }
  ElMessage.success(draft ? '草稿已保存' : editing.value ? '已保存，等待审核' : '已提交审核，预计 1 个工作日')
  router.push('/merchants')
}
</script>

<template>
  <div class="page-head">
    <div><h1>{{ editing ? '编辑商户' : '新建商户' }}</h1><p>{{ readonly ? '审核员只能查看，不能修改。' : '带 * 的为必填项；提交后进入审核，通过即上线。' }}</p></div>
  </div>
  <el-card class="flat form-page" shadow="always">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="right" :disabled="readonly" scroll-to-error class="form">
      <div class="form-grid">
        <el-form-item label="商户名称" prop="name"><el-input v-model="form.name" placeholder="与营业执照一致" maxlength="30" /></el-form-item>
        <el-form-item label="商户编号"><el-input :model-value="form.id" readonly class="ro" /></el-form-item>
        <el-form-item label="经营类型" prop="type"><el-radio-group v-model="form.type"><el-radio value="餐饮">餐饮</el-radio><el-radio value="生鲜">生鲜</el-radio><el-radio value="零售">零售</el-radio></el-radio-group></el-form-item>
        <el-form-item label="结算周期"><el-radio-group v-model="form.cycle"><el-radio-button value="T+1">T+1</el-radio-button><el-radio-button value="T+7">T+7</el-radio-button><el-radio-button value="月结">月结</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="联系人" prop="contact"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" placeholder="11 位手机号" /></el-form-item>
        <el-form-item label="城市" prop="city"><el-select v-model="form.city" placeholder="请选择" style="width: 100%"><el-option v-for="c in ['北京', '上海', '广州', '深圳', '杭州', '成都']" :key="c" :label="c" :value="c" /></el-select></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" placeholder="街道、楼层、门牌" /></el-form-item>
        <el-form-item label="配送半径"><div class="slider-row"><el-slider v-model="form.radius" :min="1" :max="10" :step="0.5" /><span class="num unit">{{ form.radius }} km</span></div></el-form-item>
        <el-form-item label="起送金额"><el-input-number v-model="form.minOrder" :min="0" :step="5" controls-position="" /> <span class="unit">元</span></el-form-item>
        <el-form-item label="经营标签" class="span2">
          <div class="tags">
            <el-tag v-for="t in form.tags" :key="t" closable type="info" @close="form.tags.splice(form.tags.indexOf(t), 1)">{{ t }}</el-tag>
            <el-input v-if="tagInput" v-model="newTag" size="small" class="tag-input" placeholder="回车添加" @keyup.enter="addTag" @blur="addTag" />
            <el-button v-else size="small" @click="tagInput = true"><Plus class="i-icon--xs" />添加</el-button>
          </div>
        </el-form-item>
        <el-form-item label="营业执照" prop="license" class="span2">
          <el-upload v-model:file-list="form.license" drag action="#" :auto-upload="false" accept=".jpg,.png,.pdf" class="upload">
            <Upload class="i-icon--xl i-icon--default" />
            <div class="up-text"><b>拖拽文件到这里</b>，或点击上传</div>
            <div class="up-hint">支持 JPG / PNG / PDF，单个不超过 10 MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" class="span2"><el-input v-model="form.note" type="textarea" :rows="3" placeholder="给审核同事的说明（选填）" maxlength="200" show-word-limit /><div class="help">审核通过后商户即可上线，预计 1 个工作日。</div></el-form-item>
      </div>
    </el-form>
    <div class="form-foot">
      <el-button @click="router.push('/merchants')">{{ readonly ? '返回' : '取消' }}</el-button>
      <template v-if="!readonly"><el-button text @click="submit(true)">保存草稿</el-button><el-button type="primary" @click="submit(false)">提交审核</el-button></template>
    </div>
  </el-card>
</template>

<style scoped>
.form { padding-top: var(--spacing-1); }
.ro :deep(.el-input__wrapper) { background: var(--color-bg-readonly); }
.ro :deep(.el-input__inner) { color: var(--color-text-secondary); }
.slider-row { display: flex; align-items: center; gap: var(--spacing-4); width: 100%; }
.slider-row .el-slider { flex: 1; }
.unit { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); white-space: nowrap; }
.tags { display: flex; flex-wrap: wrap; gap: var(--spacing-2); align-items: center; }
.tag-input { width: 120px; }
.upload { width: 100%; }
.upload :deep(.el-upload-dragger) { padding: var(--spacing-5); }
.up-text { margin-top: var(--spacing-1-5); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.up-text b { color: var(--color-text-primary); font-weight: var(--text-weight-label); }
.up-hint { color: var(--color-text-muted); font-size: var(--text-small-size); margin-top: var(--spacing-1); }
.help { font-size: var(--text-small-size); color: var(--color-text-muted); margin-top: var(--spacing-1); width: 100%; }
</style>
