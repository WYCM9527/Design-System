<script setup>
// 页头（DESIGN「页面骨架」：顶栏 → 页头 → 可选标签 / 筛选 → 业务内容）：每个一级页面一个 H1，副标题可省（没必要就不写）。
// 种子配方组件（bridge/vue），样式来自 recipes.css 的 .page-head / .title-row / .actions（与 React 版共用），不依赖 Element。
// #status 放标题旁的状态胶囊（详情页「处理中」），#actions 放页面级操作（主操作金底），与标题顶部对齐。
// 面包屑不在这里——它在壳层顶栏（el-breadcrumb / .crumbs）；表格、图表自己的筛选也不放这里，留在各自的卡片里。
// 标题要带行内标记（单号包 .mono）时用 #title 插槽，副标题同理用 #subtitle；#leading 放标题左侧的头像（客户详情），与 H1 行顶对齐。
defineProps({
  title: String,
  subtitle: String
})
</script>

<template>
  <div class="page-head">
    <slot name="leading" />
    <div>
      <div v-if="$slots.status" class="title-row"><h1><slot name="title">{{ title }}</slot></h1><slot name="status" /></div>
      <h1 v-else><slot name="title">{{ title }}</slot></h1>
      <p v-if="subtitle || $slots.subtitle"><slot name="subtitle">{{ subtitle }}</slot></p>
    </div>
    <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
  </div>
</template>
