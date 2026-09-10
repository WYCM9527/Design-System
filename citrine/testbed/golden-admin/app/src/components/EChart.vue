<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { store } from '../store'

echarts.use([LineChart, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer])

// 通用图表容器：option 是一个函数，参数是 token 读取器与主题色板。
// ECharts 画在 canvas 上不读 CSS 变量，所以渲染前从 :root 取 token 计算值；主题 / 密度切换时重绘。
// 高度不写像素：由外层 .chart 类用 token 表达（见 app.css），紧凑模式下自动变矮。
const props = defineProps({ option: { type: Function, required: true } })
const el = ref(); let chart

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
function themeBase(cssVar) {
  return {
    palette: [1, 2, 3, 4, 5, 6].map((i) => cssVar(`--color-chart-${i}`)),
    sequential: [1, 2, 3, 4, 5].map((i) => cssVar(`--color-chart-sequential-${i}`)),
    text: cssVar('--color-text-secondary'), muted: cssVar('--color-text-muted'), line: cssVar('--color-border-default'),
    inverseBg: cssVar('--color-bg-inverse'), inverseText: cssVar('--color-text-inverse'), surface: cssVar('--color-bg-surface'),
    font: 12
  }
}
function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  const t = themeBase(cssVar)
  const base = {
    color: t.palette,
    textStyle: { fontFamily: cssVar('--font-family-body') },
    tooltip: { backgroundColor: t.inverseBg, borderWidth: 0, textStyle: { color: t.inverseText, fontSize: t.font }, padding: [6, 10] },
    legend: { icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: t.text, fontSize: t.font } }
  }
  const opt = props.option(t, cssVar)
  chart.setOption({ ...base, ...opt, tooltip: { ...base.tooltip, ...(opt.tooltip || {}) }, legend: opt.legend === false ? { show: false } : { ...base.legend, ...(opt.legend || {}) } }, true)
  chart.resize()
}
let ro
onMounted(() => { render(); ro = new ResizeObserver(() => chart && chart.resize()); ro.observe(el.value) })
watch(() => [store.theme, store.density], () => requestAnimationFrame(render))
onBeforeUnmount(() => { ro && ro.disconnect(); chart && chart.dispose() })
</script>

<template><div ref="el" class="chart"></div></template>
