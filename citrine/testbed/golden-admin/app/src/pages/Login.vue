<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Wechat } from '@icon-park/vue-next'
import { store, toggleTheme } from '../store'

const router = useRouter()
const form = reactive({ account: 'wangxm@company.com', password: '' , remember: true })
const rules = {
  account: [{ required: true, message: '请输入企业账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少 6 位', trigger: 'blur' }]
}
const formRef = ref(); const loading = ref(false); const topError = ref('')
// ?state=error 用来截"密码错误"态；?state=loading 截"登录中"态
const q = new URLSearchParams(location.search)
if (q.get('state') === 'error') { topError.value = '账号或密码不正确，请重试。连续 5 次错误将锁定 15 分钟。'; form.password = '123456' }
if (q.get('state') === 'loading') { loading.value = true; form.password = '••••••••' }

async function submit() {
  const ok = await formRef.value.validate().then(() => true).catch(() => false)
  if (!ok) return
  loading.value = true; topError.value = ''
  setTimeout(() => { loading.value = false; router.push('/') }, 600)
}
</script>

<template>
  <div class="auth">
    <section class="auth-brand">
      <div class="brand-top"><span class="logo">Y</span>黄金后台</div>
      <div>
        <h1>让每一单<br>都被看见</h1>
        <p>商户、订单、骑手与营销的统一运营平台。品牌黄在这里可以大面积出现——这是整个系统里唯一允许的一次。</p>
      </div>
      <span class="ver num">v2.4.0 · © 2026 黄金后台</span>
    </section>
    <section class="auth-card">
      <h2>登录</h2>
      <p class="sub">使用企业账号登录，或通过企业微信扫码。</p>
      <el-alert v-if="topError" type="error" :title="topError" show-icon :closable="false" class="top-error" />
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
        <el-form-item label="账号" prop="account"><el-input v-model="form.account" placeholder="name@company.com" /></el-form-item>
        <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" /></el-form-item>
        <el-button type="primary" size="large" class="submit" :loading="loading" native-type="submit">{{ loading ? '登录中…' : '登 录' }}</el-button>
        <el-button size="large" class="submit secondary"><Wechat class="i-icon--md" />企业微信登录</el-button>
      </el-form>
      <div class="auth-foot"><el-checkbox v-model="form.remember">记住我</el-checkbox><a class="act" href="#">忘记密码</a></div>
      <div class="auth-tools"><a class="act" @click="toggleTheme">{{ store.theme === 'dark' ? '切到亮色' : '切到暗色' }}</a></div>
    </section>
  </div>
</template>

<style scoped>
.auth { display: grid; grid-template-columns: 1fr var(--layout-auth-card-width); min-height: 100vh; }
.auth-brand { background: var(--color-bg-brand); color: var(--color-text-on-brand); padding: var(--spacing-10); display: flex; flex-direction: column; justify-content: space-between; }
.brand-top { display: flex; align-items: center; gap: var(--spacing-2-5); font-weight: var(--text-weight-brand); font-size: var(--text-title-size); }
.logo { width: var(--avatar-size-md); height: var(--avatar-size-md); border-radius: var(--radius-md); background: var(--color-text-on-brand); color: var(--color-bg-brand); display: grid; place-items: center; font-weight: var(--text-weight-logo); }
h1 { margin: 0; font-size: var(--text-hero-size); line-height: var(--text-hero-line-height); font-weight: var(--text-weight-brand); }
.auth-brand p { margin: var(--spacing-4) 0 0; max-width: 30em; opacity: var(--opacity-on-primary-muted); line-height: var(--text-paragraph-line-height); }
.ver { font-size: var(--text-small-size); opacity: var(--opacity-on-primary-muted); }
.auth-card { background: var(--color-bg-surface); padding: var(--spacing-10) var(--spacing-8); display: flex; flex-direction: column; gap: var(--spacing-3); justify-content: center; }
h2 { margin: 0; font-size: var(--text-heading-size); line-height: var(--text-heading-line-height); font-weight: var(--text-weight-strong); }
.sub { margin: 0 0 var(--spacing-2); color: var(--color-text-secondary); }
.top-error { margin-bottom: var(--spacing-2); }
.submit { width: 100%; margin-top: var(--spacing-1); }
.submit.secondary { margin-left: 0; margin-top: var(--spacing-2); gap: var(--spacing-2); }
.auth-foot { display: flex; justify-content: space-between; align-items: center; font-size: var(--text-body-sm-size); }
.auth-tools { margin-top: var(--spacing-6); font-size: var(--text-small-size); color: var(--color-text-muted); }
</style>
