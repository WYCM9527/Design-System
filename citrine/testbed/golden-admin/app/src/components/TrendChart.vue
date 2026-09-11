<script setup>
// 趋势折线（工作台「订单趋势」）：直接用桥接的 trendLine 配方——y 轴贴数据范围、平滑 0.3、不显示数据点、多序列不填面积。
import EChart from './EChart.vue'
import { trendLine, areaGradient } from '../styles/bridge/echarts.js'

const props = defineProps({ days: Array, series: Array })
const option = (t, echarts) => trendLine({ days: props.days, series: props.series, area: props.series.length === 1 ? areaGradient(echarts) : undefined })
</script>

<template><EChart :option="option" /></template>
