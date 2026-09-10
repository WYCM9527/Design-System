<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, ErrorComputer } from '@icon-park/vue-next'
const router = useRouter(); const retrying = ref(false)
function retry() { retrying.value = true; setTimeout(() => { retrying.value = false; router.push('/') }, 800) }
</script>

<template>
  <div class="result">
    <div class="illu"><ErrorComputer class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
    <div class="code num">500</div>
    <h3>服务暂时不可用</h3>
    <p>网关在 30 秒内没有收到响应（trace: <span class="mono">a3f9-20260908-1402</span>）。通常是短暂抖动，重试一次即可；若持续出现请联系值班同学。</p>
    <div class="acts"><el-button type="primary" :loading="retrying" @click="retry"><Refresh v-if="!retrying" class="i-icon--sm" />重试</el-button><el-button @click="router.push('/')">返回首页</el-button></div>
  </div>
</template>

