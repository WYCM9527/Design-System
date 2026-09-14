<script setup>
// 表格骨架（种子配方组件）：按目标表格的形状占位（表头 + 等高行 + 列宽），加载完成后不发生版面跳动。样式来自 recipes.css 的 .tskel（与 React 版共用）。
// 见 DESIGN.md「组件配方 · 空状态 / 骨架屏」：骨架要按目标形状，不用通用段落骨架顶替表格。
defineProps({ rows: { type: Number, default: 6 }, cols: { type: Array, default: () => [200, 160, 120, 120, 100] } })
</script>

<template>
  <div class="tskel" role="status" aria-live="polite" aria-label="正在加载">
    <div class="tskel-head"><span v-for="(w, i) in cols" :key="i" class="cell" :style="{ flex: `0 0 ${w}px` }"><i class="bar head" /></span></div>
    <div v-for="r in rows" :key="r" class="tskel-row">
      <span v-for="(w, i) in cols" :key="i" class="cell" :style="{ flex: `0 0 ${w}px` }"><i class="bar" :class="{ short: (r + i) % 3 === 0 }" /></span>
    </div>
  </div>
</template>
