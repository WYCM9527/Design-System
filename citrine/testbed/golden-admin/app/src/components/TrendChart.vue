<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { store } from '../store'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
const props = defineProps({ days: Array, series: Array, height: { type: Number, default: 220 } })
const el = ref(); let chart

// ECharts 不读 CSS 变量：渲染前从 :root 取 token 的计算值，主题切换时重取
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
function render() {
  if (!chart) chart = echarts.init(el.value)
  const palette = ['--color-chart-1', '--color-chart-2', '--color-chart-3'].map(cssVar)
  chart.setOption({
    color: palette,
    grid: { left: 8, right: 8, top: 32, bottom: 0, containLabel: true },
    legend: { top: 0, right: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: cssVar('--color-text-secondary'), fontSize: 12 } },
    tooltip: { trigger: 'axis', backgroundColor: cssVar('--color-bg-inverse'), borderWidth: 0, textStyle: { color: cssVar('--color-text-inverse'), fontSize: 12 } },
    xAxis: { type: 'category', data: props.days, boundaryGap: false, axisLine: { lineStyle: { color: cssVar('--color-border-default') } }, axisTick: { show: false }, axisLabel: { color: cssVar('--color-text-muted'), fontSize: 12 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: cssVar('--color-border-default') } }, axisLabel: { color: cssVar('--color-text-muted'), fontSize: 12 } },
    series: props.series.map((s, i) => ({ name: s.name, type: 'line', data: s.data, smooth: true, symbol: 'none', lineStyle: { width: i === 0 ? 3 : 2 }, areaStyle: i === 0 ? { color: cssVar('--color-chart-area') } : undefined }))
  }, true)
}
onMounted(() => { render(); window.addEventListener('resize', () => chart && chart.resize()) })
watch(() => [store.theme, store.density], () => requestAnimationFrame(render))
onBeforeUnmount(() => chart && chart.dispose())
</script>

<template><div ref="el" :style="{ height: height + 'px' }"></div></template>
