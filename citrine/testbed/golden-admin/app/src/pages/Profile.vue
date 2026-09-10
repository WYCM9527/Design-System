<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@icon-park/vue-next'
import { roleInfo } from '../store'

const form = reactive({ name: '王小明', account: 'wangxm', phone: '13800002211', email: 'wangxm@company.com', notify: { audit: true, order: true, weekly: false } })
const pwd = reactive({ old: '', next: '', confirm: '' })
const pwdRef = ref()
const strength = computed(() => {
  const p = pwd.next; if (!p) return 0
  return [p.length >= 8, /[a-z]/.test(p) && /[A-Z]/.test(p), /\d/.test(p), /[^\w]/.test(p)].filter(Boolean).length
})
const strengthLabel = computed(() => ['', '弱', '一般', '较强', '强'][strength.value] ?? '')
const rules = {
  old: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  next: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 8, message: '至少 8 位，需包含大小写字母与数字', trigger: 'blur' }],
  confirm: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }, { validator: (_, v, cb) => (v === pwd.next ? cb() : cb(new Error('两次输入不一致'))), trigger: 'blur' }]
}
if (new URLSearchParams(location.search).get('state') === 'pwd') { pwd.old = '••••••••'; pwd.next = 'Golden2026!'; pwd.confirm = 'Golden2025' ; setTimeout(() => pwdRef.value?.validate().catch(() => {}), 80) }
function save() { ElMessage.success('个人信息已保存') }
async function changePwd() { const ok = await pwdRef.value.validate().then(() => true).catch(() => false); if (!ok) return; ElMessage.success('密码已更新，下次登录生效'); pwd.old = pwd.next = pwd.confirm = '' }
</script>

<template>
  <div class="page-head"><div><h1>个人中心</h1><p>{{ form.name }} · {{ roleInfo.label }} · 最近登录 <span class="num">2026-09-08 09:12</span></p></div></div>
  <div class="grid">
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>基本信息</h2><div class="right"><el-button type="primary" size="small" @click="save">保存</el-button></div></div>
      <div class="body">
        <div class="avatar-row">
          <span class="avatar big">王</span>
          <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".jpg,.png"><el-button size="small"><Upload class="i-icon--sm" />更换头像</el-button></el-upload>
          <span class="hint">JPG / PNG，不超过 2 MB</span>
        </div>
        <el-form :model="form" label-position="right" class="form">
          <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="账号"><el-input :model-value="form.account" readonly class="ro" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        </el-form>
      </div>
    </el-card>
    <div class="col">
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>通知偏好</h2></div>
        <ul class="prefs">
          <li><span><b>审核结果</b><span class="sub">商户审核通过或驳回时通知我</span></span><el-switch v-model="form.notify.audit" /></li>
          <li><span><b>订单异常</b><span class="sub">待接单超时、连续超时等</span></span><el-switch v-model="form.notify.order" /></li>
          <li><span><b>每周经营周报</b><span class="sub">每周一 9:00 发送到邮箱</span></span><el-switch v-model="form.notify.weekly" /></li>
        </ul>
      </el-card>
      <el-card class="flat" shadow="always">
        <div class="card-head"><h2>修改密码</h2></div>
        <el-form ref="pwdRef" :model="pwd" :rules="rules" label-position="right" class="form body">
          <el-form-item label="当前密码" prop="old"><el-input v-model="pwd.old" type="password" show-password /></el-form-item>
          <el-form-item label="新密码" prop="next">
            <el-input v-model="pwd.next" type="password" show-password placeholder="至少 8 位，含大小写字母与数字" />
            <div class="strength" :data-level="strength"><i v-for="n in 4" :key="n" :class="{ on: n <= strength }"></i><span class="hint">{{ strengthLabel }}</span></div>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirm"><el-input v-model="pwd.confirm" type="password" show-password /></el-form-item>
          <el-form-item label=" "><el-button type="primary" @click="changePwd">更新密码</el-button></el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-stack); align-items: start; }
.col { display: flex; flex-direction: column; gap: var(--space-stack); }
.body { padding: var(--space-card); }
.avatar-row { display: flex; align-items: center; gap: var(--spacing-4); margin-bottom: var(--space-card); }
.avatar.big { width: calc(var(--avatar-size-md) * 2); height: calc(var(--avatar-size-md) * 2); font-size: var(--text-heading-size); cursor: default; }
.hint { color: var(--color-text-muted); font-size: var(--text-small-size); }
.ro :deep(.el-input__wrapper) { background: var(--color-bg-readonly); }
.ro :deep(.el-input__inner) { color: var(--color-text-secondary); }
.prefs { list-style: none; margin: 0; padding: var(--spacing-2) 0; }
.prefs li { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-4); padding: var(--spacing-3) var(--space-card); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.prefs li:last-child { border-bottom: 0; }
.prefs b { font-weight: var(--text-weight-label); }
.strength { display: flex; align-items: center; gap: var(--spacing-1); margin-top: var(--spacing-2); width: 100%; }
.strength i { flex: 1; height: 4px; border-radius: var(--radius-full); background: var(--color-bg-selected); max-width: 48px; }
.strength[data-level="1"] i.on { background: var(--color-status-error); }
.strength[data-level="2"] i.on { background: var(--color-status-warning); }
.strength[data-level="3"] i.on, .strength[data-level="4"] i.on { background: var(--color-status-success); }
.strength .hint { margin-left: var(--spacing-1); }
</style>
