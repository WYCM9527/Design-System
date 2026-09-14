<script setup>
// 统计卡（DESIGN 页面骨架「统计卡 vs 状态条」）：数据大字 + 涨跌。种子配方组件（bridge/vue），项目复制即用，样式只在这里写一遍。
// 依赖 Element Plus 的 el-card / el-tooltip；不依赖项目状态。
// up 是箭头方向，positive 是颜色（好坏）——取消率下降是"向下箭头 + 绿色"，两个维度分开（DESIGN 财务涨跌规则）。
// 左侧品牌指示条是数据卡的固定特征（用户规则）：所有同类数据卡都带，不是高亮；数据色卡禁止大面积黄色，黄只出现在这一条描边上。
// hint：口径说明（报表「已通过金额」与工作台「本月获批」口径不同这类），标签右侧一个带 aria-label 的信息图标按钮，悬停 / 聚焦出 tooltip；
// note：没有 delta 时也能单独显示的副文案。#label-extra 插槽可放自定义内容。
import { Info } from '@icon-park/vue-next'
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: String,
  up: { type: Boolean, default: true },
  positive: { type: Boolean, default: undefined },
  note: String,
  hint: String
})
const good = () => (props.positive === undefined ? props.up : props.positive)
</script>

<template>
  <el-card class="stat" shadow="always">
    <div class="label">
      <span>{{ label }}</span>
      <el-tooltip v-if="hint" :content="hint" placement="top">
        <button type="button" class="hint" :aria-label="`${label}的统计口径说明`"><Info class="i-icon--sm" /></button>
      </el-tooltip>
      <slot name="label-extra" />
    </div>
    <div class="value num">{{ value }}</div>
    <div v-if="delta" class="delta num" :class="good() ? 'up' : 'down'">{{ up ? '▲' : '▼' }} {{ delta }}<span v-if="note" class="note"> · {{ note }}</span></div>
    <div v-else-if="note" class="note-only">{{ note }}</div>
  </el-card>
</template>

<style scoped>
.stat { --el-card-padding: var(--spacing-5) var(--space-card); }
.stat .label { display: flex; align-items: center; gap: var(--spacing-1); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.stat .hint { display: inline-grid; place-items: center; width: var(--control-hit-min); height: var(--control-hit-min); margin: calc((var(--control-hit-min) - var(--size-icon-sm)) / -2) 0; padding: 0; border: 0; border-radius: var(--radius-full); background: transparent; color: var(--color-icon-muted); cursor: help; }
.stat .hint:hover { color: var(--color-text-primary); background: var(--color-bg-hover); }
.stat .value { font-size: var(--text-display-size); font-weight: var(--text-display-weight); line-height: var(--text-display-line-height); margin: var(--spacing-1-5) 0 var(--spacing-1); letter-spacing: var(--text-display-tracking); }
.stat .delta { font-size: var(--text-small-size); }   /* 颜色交给全局 .up / .down（data.increase / decrease） */
.stat .note, .stat .note-only { color: var(--color-text-muted); font-size: var(--text-small-size); }
.stat { border-left: var(--border-width-indicator) solid var(--color-brand-indicator); }
</style>
