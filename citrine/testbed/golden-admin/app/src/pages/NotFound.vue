<script setup>
import { FileSearch } from '@icon-park/vue-next'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="result">
    <div class="illu"><FileSearch class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
    <div class="code num">404</div>
    <h3>页面不存在</h3>
    <p>你访问的地址可能已被移动或删除。检查一下链接，或从首页重新进入。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/')">返回首页</el-button></div>
  </div>
</template>

