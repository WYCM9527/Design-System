// ECharts 桥接：ECharts 画在 canvas 上，不读 CSS 变量。这里在运行时从 :root 读取 token 的计算值，生成 ECharts 主题与几条图表配方。
// 用法：
//   import * as echarts from 'echarts/core'
//   import { registerTheme, trendLine, areaGradient } from '<seed>/bridge/echarts.js'
//   const name = registerTheme(echarts)              // 每次亮 / 暗切换后重新调用，再 dispose + init(el, name)
//   const chart = echarts.init(el, name)
//   chart.setOption(trendLine({ days, series: [{ name: '本周', data }, { name: '上周', data }] }))
// 规则见 DESIGN.md「数据可视化」：趋势折线 y 轴贴数据（不强制从 0）、平滑 ≤ 0.3、不显示数据点、多序列不填面积；柱状图必须从 0 开始。

const read = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();

/** 读出图表要用的 token 计算值（亮 / 暗切换后重新读） */
export function chartTokens(el = document.documentElement) {
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  return {
    palette: [1, 2, 3, 4, 5, 6].map((i) => read(`--color-chart-${i}`, el)),
    sequential: [1, 2, 3, 4, 5].map((i) => read(`--color-chart-sequential-${i}`, el)),
    area: read('--color-chart-area', el),
    text: read('--color-text-secondary', el), muted: read('--color-text-muted', el), primary: read('--color-text-primary', el),
    line: read('--color-border-default', el), strong: read('--color-border-strong', el),
    surface: read('--color-bg-surface', el), inverseBg: read('--color-bg-inverse', el), inverseText: read('--color-text-inverse', el),
    fontFamily: read('--font-family-body', el), font: num(read('--text-small-size', el), 12),
    radius: num(read('--radius-xs', el), 2),
  };
}

/** ECharts 主题对象：轴、网格、图例、提示框、折线 / 柱 / 饼的默认形态 */
export function theme(el = document.documentElement) {
  const t = chartTokens(el);
  return {
    color: t.palette,
    backgroundColor: 'transparent',
    textStyle: { fontFamily: t.fontFamily, color: t.text, fontSize: t.font },
    legend: { icon: 'roundRect', itemWidth: 10, itemHeight: 10, itemGap: 16, textStyle: { color: t.text, fontSize: t.font } },
    tooltip: { backgroundColor: t.inverseBg, borderWidth: 0, padding: [6, 10], textStyle: { color: t.inverseText, fontSize: t.font }, axisPointer: { lineStyle: { color: t.strong }, shadowStyle: { color: t.area } } },
    categoryAxis: { axisLine: { lineStyle: { color: t.line } }, axisTick: { show: false }, axisLabel: { color: t.muted, fontSize: t.font }, splitLine: { show: false } },
    valueAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: t.muted, fontSize: t.font }, splitLine: { lineStyle: { color: t.line } } },
    line: { smooth: 0.3, symbol: 'circle', symbolSize: 6, showSymbol: false, lineStyle: { width: 2 }, emphasis: { focus: 'series' } },
    bar: { barMaxWidth: 24, itemStyle: { borderRadius: t.radius } },
    pie: { itemStyle: { borderColor: t.surface, borderWidth: 2 }, label: { color: t.text } },
  };
}

/** 注册主题并返回主题名。亮 / 暗切换后再调用一次，然后 dispose 旧实例、用同名主题重新 init。 */
export function registerTheme(echarts, name = 'citrine', el = document.documentElement) {
  echarts.registerTheme(name, theme(el));
  return name;
}

/** 单序列折线的面积：从 chart.area 到透明的纵向渐变；多序列对比不要用面积 */
export function areaGradient(echarts, el = document.documentElement) {
  const t = chartTokens(el);
  return { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: t.area }, { offset: 1, color: 'transparent' }]) };
}

/**
 * 趋势折线配方：类目 x 轴无留白，y 轴贴数据范围（scale），主序列 3px、其余 2px，无面积；图例右上。
 * @param {{ days: string[], series: { name: string, data: number[] }[], area?: object }} p  area 只在单序列时传 areaGradient(echarts)
 */
export function trendLine({ days, series, area }) {
  return {
    grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
    legend: { top: 0, right: 0 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days, boundaryGap: false },
    yAxis: { type: 'value', scale: true, splitNumber: 4 },
    series: series.map((s, i) => ({ name: s.name, type: 'line', data: s.data, lineStyle: { width: i === 0 ? 3 : 2 }, areaStyle: area && series.length === 1 ? area : undefined })),
  };
}
