<script setup>
// 通用图表容器（种子配方组件）：option 是一个函数，参数是图表 token（见桥接 chartTokens）与 echarts 实例（供 areaGradient 等配方使用）。
// 轴、网格、图例、提示框、折线 / 柱 / 饼的默认形态来自桥接主题（运行时读 token），页面只写数据与布局，不写颜色、线型。
// 亮 / 暗切换靠监听 <html class="dark"> 的变化重新注册主题并重建实例（ECharts 的主题在 init 时定格）——不依赖项目的状态管理。
// 数据变化：option 函数在 watchEffect 里执行，函数体内读到的响应式数据（ref / reactive）自动成为依赖，变了就重新 setOption——页面不需要 key 重建。
// 高度由外层 .chart / .chart.tall 类（recipes.css）用 token 表达。
import { onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { registerTheme, chartTokens } from '../echarts.js'

echarts.use([LineChart, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps({ option: { type: Function, required: true } })
const el = ref(); let chart

const apply = () => { if (chart) chart.setOption(props.option(chartTokens(), echarts), true) }
function render() {
  if (!el.value) return
  const name = registerTheme(echarts)
  if (chart) chart.dispose()
  chart = echarts.init(el.value, name)
  apply()
}
let ro, mo, stop
onMounted(() => {
  render()
  stop = watchEffect(apply)   // 追踪 option 函数里读到的响应式数据
  ro = new ResizeObserver(() => chart && chart.resize()); ro.observe(el.value)
  mo = new MutationObserver(() => requestAnimationFrame(render)); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => { stop && stop(); ro && ro.disconnect(); mo && mo.disconnect(); chart && chart.dispose() })
defineExpose({ render })
</script>

<template><div ref="el" class="chart"></div></template>
