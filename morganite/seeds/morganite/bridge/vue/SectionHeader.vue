<script setup>
// 板块标题（DESIGN「页面骨架」）：看板页在 H1 下分板块的二级标题（工作台「经营概览」），右侧 #actions 放只作用于这一板块的筛选与操作（周期切换、导出日报）。
// 种子配方组件（bridge/vue），样式来自 recipes.css 的 .section-head（与 React 版共用），不依赖 Element。
// 页面级操作放 PageHeader 的 #actions，不放这里；不值一个标题的次要分组用配方类 .section-label。
defineProps({
  title: String
})
</script>

<template>
  <div class="section-head">
    <h2><slot name="title">{{ title }}</slot></h2>
    <div v-if="$slots.actions" class="right"><slot name="actions" /></div>
  </div>
</template>
