<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { store } from '../store'
import { registerTheme, chartTokens } from '../styles/bridge/echarts.js'

echarts.use([LineChart, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer])

// 通用图表容器：option 是一个函数，参数是图表 token（见桥接 chartTokens）与 echarts 实例（供 areaGradient 等配方使用）。
// 轴、网格、图例、提示框、折线 / 柱 / 饼的默认形态来自桥接主题（运行时读 token），页面只写数据与布局。
// 亮 / 暗切换后主题要重新注册并重建实例（ECharts 的主题在 init 时定格）。高度由外层 .chart 类用 token 表达。
const props = defineProps({ option: { type: Function, required: true } })
const el = ref(); let chart

function render() {
  if (!el.value) return
  const name = registerTheme(echarts)
  if (chart) chart.dispose()
  chart = echarts.init(el.value, name)
  chart.setOption(props.option(chartTokens(), echarts), true)
}
let ro
onMounted(() => { render(); ro = new ResizeObserver(() => chart && chart.resize()); ro.observe(el.value) })
watch(() => store.theme, () => requestAnimationFrame(render))
onBeforeUnmount(() => { ro && ro.disconnect(); chart && chart.dispose() })
</script>

<template><div ref="el" class="chart"></div></template>
