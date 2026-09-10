<script setup>
import { Lock } from '@icon-park/vue-next'
import { useRoute, useRouter } from 'vue-router'
import { roleInfo } from '../store'
const route = useRoute(); const router = useRouter()
</script>

<template>
  <div class="result">
    <div class="illu"><Lock class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
    <div class="code num">403</div>
    <h3>没有访问权限</h3>
    <p>当前角色「{{ roleInfo.label }}」无权查看{{ route.query.from ? `「${route.query.from}」` : '此页面' }}。你可以向管理员申请对应权限，通常在一个工作日内处理。</p>
    <div class="acts"><el-button type="primary">申请权限</el-button><el-button @click="router.push('/')">返回首页</el-button></div>
  </div>
</template>

