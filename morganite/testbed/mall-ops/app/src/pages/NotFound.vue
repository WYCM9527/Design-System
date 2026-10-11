<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@icon-park/vue-next'
import { brandTwoToneProps } from '@wycm9527/morganite/iconpark.config'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <section class="result">
    <div class="illu"><Search class="i-icon--2xl" v-bind="brandTwoToneProps" /></div>
    <div class="code num">404</div>
    <h3>页面不存在</h3>
    <p>地址 <span class="mono">{{ route.fullPath }}</span> 没有对应的页面，可能链接已过期或输错了。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/')">返回工作台</el-button><el-button @click="router.push('/orders')">去订单管理</el-button></div>
  </section>
</template>
