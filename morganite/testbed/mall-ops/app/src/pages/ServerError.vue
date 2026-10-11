<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Caution } from '@icon-park/vue-next'
import { brandTwoToneProps } from '@wycm9527/morganite/iconpark.config'

const router = useRouter()
</script>

<template>
  <section class="result">
    <div class="illu"><Caution class="i-icon--2xl" v-bind="brandTwoToneProps" /></div>
    <div class="code num">500</div>
    <h3>服务暂时不可用</h3>
    <p>订单服务正在恢复，你的操作没有丢失。请稍后刷新；如果持续出现，把错误编号 <span class="mono">REQ-20261009-7F3A</span> 发给技术支持。</p>
    <div class="acts"><el-button type="primary" @click="router.go(0)">刷新</el-button><el-button @click="ElMessage.success('错误编号已复制')">复制错误编号</el-button></div>
  </section>
</template>
