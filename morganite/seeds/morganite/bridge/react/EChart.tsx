// 通用图表容器（种子配方组件 · React 版）：option 是一个函数，参数是图表 token 与 echarts 实例；亮暗切换靠监听 <html class> 重建；
// option 变化（依赖数组）时重新 setOption。柱子端头统一套 withBarEnds，图例开关后重算——页面不写 borderRadius。
// 高度由外层 .chart / .chart.tall 类（recipes.css）用 token 表达。
import * as React from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { registerTheme, chartTokens, withBarEnds } from '../echarts.js'

echarts.use([LineChart, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer])

type Tokens = ReturnType<typeof chartTokens>
export type OptionFactory = (t: Tokens, ec: typeof echarts) => Record<string, unknown>

export function EChart({ option, deps = [], className = 'chart' }: { option: OptionFactory; deps?: React.DependencyList; className?: string }) {
  const el = React.useRef<HTMLDivElement>(null)
  const chart = React.useRef<echarts.ECharts | null>(null)
  const factory = React.useRef(option)
  factory.current = option
  const build = React.useCallback((selected?: Record<string, boolean>) => withBarEnds(factory.current(chartTokens(), echarts), { selected }), [])

  const render = React.useCallback(() => {
    if (!el.current) return
    const name = registerTheme(echarts)
    chart.current?.dispose()
    const instance = echarts.init(el.current, name)
    chart.current = instance
    // 图例关掉一个堆叠序列后，最外一段换了序列；只合并 series，图例的开关状态不动
    const relegend = (params: unknown) => { const { series } = build((params as { selected: Record<string, boolean> }).selected); if (series) instance.setOption({ series }) }
    for (const type of ['legendselectchanged', 'legendselectall', 'legendinverseselect']) instance.on(type, relegend)
    instance.setOption(build(), true)
  }, [build])

  React.useEffect(() => {
    render()
    const ro = new ResizeObserver(() => chart.current?.resize()); if (el.current) ro.observe(el.current)
    const mo = new MutationObserver(() => requestAnimationFrame(render)); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { ro.disconnect(); mo.disconnect(); chart.current?.dispose(); chart.current = null }
  }, [render])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { chart.current?.setOption(build(), true) }, deps)

  return <div ref={el} className={className} />
}
