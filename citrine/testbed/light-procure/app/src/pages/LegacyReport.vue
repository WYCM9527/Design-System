<script setup>
// 「未接入」的旧板块：模拟历史遗留页面——自己的旧布局、旧配色、Element 默认外观。
// 它存在的意义是证明范围根有效：这一页上 html 没有 class citrine，设计系统的 token / 桥接 / 配方一条都不生效。
import { ref } from 'vue'
const rows = ref([
  { month: '2026-06', amount: 128400, count: 42 },
  { month: '2026-07', amount: 96500, count: 31 },
  { month: '2026-08', amount: 152300, count: 55 }
])
</script>

<template>
  <div class="legacy">
    <header class="legacy-head">
      <h1>旧版报表（未接入设计系统）</h1>
      <a href="#/">← 返回新版工作台</a>
    </header>
    <div class="legacy-body">
      <el-alert title="这是历史板块：保持 Element Plus 默认蓝色与旧版布局，验证范围根不会波及它。" type="info" :closable="false" show-icon />
      <div class="legacy-tools">
        <el-button type="primary">导出 Excel</el-button>
        <el-button>刷新</el-button>
        <el-tag type="success">已对账</el-tag>
      </div>
      <el-table :data="rows" border stripe>
        <el-table-column prop="month" label="月份" width="140" />
        <el-table-column prop="count" label="单数" width="100" />
        <el-table-column prop="amount" label="金额（元）" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
/* 旧板块自己的硬编码样式（故意不引用 token）：它就是要保持原样 */
.legacy { min-height: 100vh; background: #f0f2f5; font-family: "Helvetica Neue", Arial, sans-serif; }
.legacy-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #001529; color: #fff; }
.legacy-head h1 { margin: 0; font-size: 18px; font-weight: 500; }
.legacy-head a { color: #40a9ff; }
.legacy-body { padding: 24px; display: grid; gap: 16px; }
.legacy-tools { display: flex; gap: 12px; align-items: center; }
</style>
