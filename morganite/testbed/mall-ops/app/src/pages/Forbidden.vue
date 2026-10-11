<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Lock } from '@icon-park/vue-next'
import { brandTwoToneProps } from '@wycm9527/morganite/iconpark.config'
import { roleInfo } from '../store'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <section class="result">
    <div class="illu"><Lock class="i-icon--2xl" v-bind="brandTwoToneProps" /></div>
    <div class="code num">403</div>
    <h3>没有访问「{{ route.query.from || '这个页面' }}」的权限</h3>
    <p>你当前的角色是「{{ roleInfo.label }}」。如需开通，请联系管理员在「成员与角色」里调整。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/')">返回工作台</el-button><el-button @click="router.back()">返回上一页</el-button></div>
  </section>
</template>
