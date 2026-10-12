<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@icon-park/vue-next'
import { demo } from '../store'
import { version as dsVersion } from '../../design-system/.adopter.json'

const router = useRouter()
const failed = demo('state') === 'error'   // ?state=error：密码错误态（PRD 4.1）
const tab = ref('pass')
const form = reactive({ user: 'linxia', pwd: failed ? 'wrong-pass' : 'shiguang2026', remember: true, phone: '', code: '' })
const formRef = ref()
const rules = {
  user: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }, { validator: (_r, v, cb) => (failed && v === 'wrong-pass' ? cb(new Error('账号或密码错误')) : cb()), trigger: 'submit' }]
}
const loading = ref(false)
async function submit() {
  if (tab.value === 'pass' && !(await formRef.value.validate().catch(() => false))) return
  loading.value = true
  setTimeout(() => { loading.value = false; router.push('/') }, 400)
}
if (failed) setTimeout(() => formRef.value?.validateField('pwd').catch(() => {}), 0)
</script>

<template>
  <div class="login">
    <section class="login-brand" aria-label="拾光商城">
      <div class="app-brand"><span class="logo">拾</span><span>拾光商城</span></div>
      <div>
        <div class="slogan">把每一份心意<br>准时送到</div>
        <p class="lead">订单、商品、客户与营销，一处打理。</p>
      </div>
      <p class="lead">运营后台 · Morganite 实测</p>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <h1>登录</h1>
        <p class="secondary">使用企业账号登录拾光商城运营后台</p>
        <el-alert v-if="failed" type="error" :closable="false" show-icon title="账号或密码错误，还可以再试 4 次" description="连续错误 5 次后账号锁定 15 分钟。" />
        <el-tabs v-model="tab">
          <el-tab-pane label="账号密码" name="pass" />
          <el-tab-pane label="手机验证码" name="sms" />
        </el-tabs>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <template v-if="tab === 'pass'">
            <el-form-item label="账号" prop="user"><el-input v-model="form.user" autocomplete="username"><template #prefix><User /></template></el-input></el-form-item>
            <el-form-item label="密码" prop="pwd"><el-input v-model="form.pwd" type="password" show-password autocomplete="current-password"><template #prefix><Lock /></template></el-input></el-form-item>
          </template>
          <template v-else>
            <el-form-item label="手机号"><el-input v-model="form.phone" placeholder="请输入手机号" inputmode="numeric"><template #prefix><Phone /></template></el-input></el-form-item>
            <el-form-item label="验证码">
              <div class="code-row"><el-input v-model="form.code" placeholder="6 位数字" inputmode="numeric" /><el-button @click="ElMessage.success('验证码已发送')">获取验证码</el-button></div>
            </el-form-item>
          </template>
          <div class="login-row">
            <el-checkbox v-model="form.remember">7 天内自动登录</el-checkbox>
            <button class="link" type="button" @click="ElMessage.success('已发送重置链接到绑定手机')">忘记密码</button>
          </div>
          <el-button type="primary" size="large" class="is-block" native-type="submit" :loading="loading">登录</el-button>
        </el-form>
        <div class="divider-text">其他方式</div>
        <div class="login-alt">
          <el-button @click="ElMessage.info('企业微信扫码登录建设中')">企业微信</el-button>
          <el-button @click="ElMessage.info('钉钉扫码登录建设中')">钉钉</el-button>
        </div>
        <p class="login-foot">登录即表示同意《服务协议》与《隐私政策》 · Morganite {{ dsVersion }}</p>
      </div>
    </section>
  </div>
</template>

