<script setup>
// 趋势折线（种子配方组件）：直接用桥接的 trendLine 配方——y 轴贴数据范围、平滑、不显示数据点、多序列不填面积、单序列渐变面积。
import EChart from './EChart.vue'
import { trendLine, areaGradient } from '../echarts.js'

// count：计数型趋势（整数）y 轴从 0 起、整数刻度；不传时按数据自动判断
const props = defineProps({ days: Array, series: Array, count: { type: Boolean, default: undefined } })
const option = (t, echarts) => trendLine({ days: props.days, series: props.series, count: props.count, area: props.series.length === 1 ? areaGradient(echarts) : undefined })
</script>

<template><EChart :option="option" /></template>
