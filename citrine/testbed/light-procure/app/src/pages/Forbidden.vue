<script setup>
// 无权限（PRD §2 / §6.5）：说明 + 返回工作台入口；不出现无实际功能的按钮
import { Lock } from '@icon-park/vue-next'
import { useRoute, useRouter } from 'vue-router'
import { roleLabel } from '../data/session'
const route = useRoute(); const router = useRouter()
</script>

<template>
  <div class="result">
    <div class="illu"><Lock class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div>
    <div class="code num">403</div>
    <h3>暂无访问权限</h3>
    <p>当前身份「{{ roleLabel }}」无权访问{{ route.query.from ? `「${route.query.from}」` : '此页面' }}。权限由系统预置角色决定，如需调整请联系管理员更换你的角色。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/')">返回工作台</el-button></div>
  </div>
</template>
