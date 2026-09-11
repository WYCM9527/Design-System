<script setup>
// 统计卡（DESIGN 页面骨架「统计卡 vs 状态条」）：数据大字 + 涨跌。工作台与看板共用这一个组件，样式只在这里写一遍。
// up 是箭头方向，positive 是颜色（好坏）——取消率下降是"向下箭头 + 绿色"，两个维度分开（DESIGN 财务涨跌规则）。
// hi 只加左侧品牌指示条：数据色卡禁止大面积黄色。
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: String,
  up: { type: Boolean, default: true },
  positive: { type: Boolean, default: undefined },
  note: String,
  hi: Boolean
})
const good = () => (props.positive === undefined ? props.up : props.positive)
</script>

<template>
  <el-card class="stat" :class="{ hi }" shadow="always">
    <div class="label">{{ label }}</div>
    <div class="value num">{{ value }}</div>
    <div v-if="delta" class="delta num" :class="good() ? 'up' : 'down'">{{ up ? '▲' : '▼' }} {{ delta }}<span v-if="note" class="note"> · {{ note }}</span></div>
  </el-card>
</template>

<style scoped>
.stat { --el-card-padding: var(--spacing-5) var(--space-card); }
.stat .label { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.stat .value { font-size: var(--text-display-size); font-weight: var(--text-display-weight); line-height: var(--text-display-line-height); margin: var(--spacing-1-5) 0 var(--spacing-1); letter-spacing: var(--text-display-tracking); }
.stat .delta { font-size: var(--text-small-size); }   /* 颜色交给全局 .up / .down（data.increase / decrease） */
.stat .note { color: var(--color-text-muted); }
.stat.hi { border-left: var(--border-width-indicator) solid var(--color-brand-indicator); }
</style>
