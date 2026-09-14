<script setup>
// 首屏先确保演示数据就绪（首次进入或 localStorage 为空时生成种子与附件样本），再渲染路由
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ready, ensureReady } from './data/db'
const router = useRouter()
// 首次进入时数据未就绪，路由守卫先放行；就绪后 force 重进当前地址让权限守卫真正执行（同地址的普通 replace 会被当作重复导航跳过）
onMounted(async () => { const wasReady = ready.value; await ensureReady(); if (!wasReady) { const r = router.currentRoute.value; router.replace({ path: r.path, query: r.query, hash: r.hash, force: true }) } })
</script>

<template>
  <router-view v-if="ready.value" />
  <div v-else class="boot" role="status" aria-live="polite">正在准备演示数据…</div>
</template>

<style>
.boot { min-height: 100vh; display: grid; place-items: center; color: var(--color-text-secondary); }
</style>
