<script setup>
import { useRouter } from 'vue-router'
import { Box } from '@icon-park/vue-next'
import { brandTwoToneProps } from '@wycm9527/morganite/iconpark.config'

const router = useRouter()
</script>

<template>
  <section class="result">
    <div class="illu"><Box class="i-icon--2xl" v-bind="brandTwoToneProps" /></div>
    <h3>库存盘点正在建设中</h3>
    <p>盘点任务、差异审核与库位管理将在 11 月上线。现在可以先在商品管理里查看每个规格的库存，告急商品会标出来。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/')">返回工作台</el-button><el-button @click="router.push('/products')">查看商品库存</el-button></div>
  </section>
</template>
