<script setup>
// 表格骨架：按目标表格的形状占位（表头 + 等高行 + 列宽），加载完成后不发生版面跳动。
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

<style scoped>
.tskel { overflow: hidden; }
.tskel-head, .tskel-row { display: flex; align-items: center; border-bottom: var(--border-width-default) solid var(--color-border-default); }
.tskel-head { background: var(--color-bg-subtle); height: calc(var(--table-cell-padding-y) * 2 + var(--text-body-line-height) * var(--text-small-size)); }
.tskel-row { height: calc(var(--table-cell-padding-y) * 2 + var(--text-body-line-height) * var(--text-body-size) + var(--text-body-line-height) * var(--text-small-size)); }
.cell { padding: 0 var(--table-cell-padding-x); min-width: 0; }
.bar { display: block; height: var(--text-small-size); border-radius: var(--radius-xs); width: 70%; background: linear-gradient(90deg, var(--color-bg-skeleton) 25%, var(--color-bg-skeleton-highlight) 50%, var(--color-bg-skeleton) 75%); background-size: 400% 100%; animation: shimmer 1.4s var(--motion-easing-standard) infinite; }
.bar.head { width: 45%; }
.bar.short { width: 40%; }
@keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
</style>
