<script setup>
// 统计卡（DESIGN 页面骨架「统计卡 vs 状态条」）：数据大字 + 涨跌。种子配方组件（bridge/vue），样式来自 recipes.css 的 .stat-card（与 React 版共用），不依赖 el-card。
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
  <div class="stat-card">
    <div class="stat-card__label">
      <span>{{ label }}</span>
      <el-tooltip v-if="hint" :content="hint" placement="top">
        <button type="button" class="stat-card__hint" :aria-label="`${label}的统计口径说明`"><Info class="i-icon--sm" /></button>
      </el-tooltip>
      <slot name="label-extra" />
    </div>
    <div class="stat-card__value num">{{ value }}</div>
    <div v-if="delta" class="stat-card__delta num" :class="good() ? 'up' : 'down'">{{ up ? '▲' : '▼' }} {{ delta }}<span v-if="note" class="stat-card__note"> · {{ note }}</span></div>
    <div v-else-if="note" class="stat-card__note">{{ note }}</div>
  </div>
</template>
