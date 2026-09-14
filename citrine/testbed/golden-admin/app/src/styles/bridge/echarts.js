// ECharts 桥接：ECharts 画在 canvas 上，不读 CSS 变量。这里在运行时从 :root 读取 token 的计算值，生成 ECharts 主题与几条图表配方。
// 用法：
//   import * as echarts from 'echarts/core'
//   import { registerTheme, trendLine, areaGradient, rankBars } from '<seed>/bridge/echarts.js'
//   const name = registerTheme(echarts)              // 每次亮 / 暗切换后重新调用，再 dispose + init(el, name)
//   const chart = echarts.init(el, name)
//   chart.setOption(trendLine({ days, series: [{ name: '本周', data }, { name: '上周', data }] }))
// 规则见 DESIGN.md「数据可视化」：趋势折线 y 轴贴数据（不强制从 0）、平滑 0.5 + smoothMonotone、不常显数据点、多序列不填面积；柱状图必须从 0 开始。

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
    // 平滑 0.5 + smoothMonotone 'x'：曲线丝滑但不越过数据点（只用 0.3 会在数据点处显硬；不加 monotone 则会在点之间鼓包）；线端与拐角圆头
    line: { smooth: 0.5, smoothMonotone: 'x', symbol: 'circle', symbolSize: 6, showSymbol: false, lineStyle: { width: 2, cap: 'round', join: 'round' }, emphasis: { focus: 'series' } },
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
 * 趋势折线配方：类目 x 轴无留白，y 轴贴数据范围（scale），所有序列统一 2px 细线（主序列靠品牌黄区分，不靠粗细——浅色下粗黄条突兀），无面积；图例右上。
 * 计数型趋势（申请数、订单数这类整数）：y 轴从 0 起、刻度只取整数（minInterval 1）——否则会出现 0.5、1.5 这种"半张申请"的刻度；默认按数据自动判断（全是整数且最大值 ≤ 20），也可显式传 count。
 * @param {{ days: string[], series: { name: string, data: number[] }[], area?: object, count?: boolean }} p  area 只在单序列时传 areaGradient(echarts)
 */
export function trendLine({ days, series, area, count }) {
  const values = series.flatMap((s) => s.data).filter((v) => v !== null && v !== undefined);
  const isCount = count ?? (values.length > 0 && values.every((v) => Number.isInteger(v)) && Math.max(...values) <= 20);
  return {
    grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
    legend: { top: 0, right: 0 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days, boundaryGap: false },
    yAxis: isCount ? { type: 'value', min: 0, minInterval: 1, splitNumber: 4 } : { type: 'value', scale: true, splitNumber: 4 },
    series: series.map((s) => ({ name: s.name, type: 'line', data: s.data, areaStyle: area && series.length === 1 ? area : undefined })),   // 线宽走主题（2px），不按序列加粗
  };
}

/**
 * 排行横向柱状配方（DESIGN「数据可视化」：排行榜前三名纯黄、其余中性灰——单序列强度按离散分段，不在灰黄之间插值）。
 * categories 与 values 已按大小排好序（第一项是第一名）；value 为 0 的项不着色为黄。
 * @param {{ categories: string[], values: number[], top?: number, formatter?: (v: number) => string, el?: Element }} p
 */
export function rankBars({ categories, values, top = 3, formatter, el = document.documentElement }) {
  const t = chartTokens(el);
  const hi = t.sequential[t.sequential.length - 1], lo = t.sequential[1];   // 封顶的纯黄 / 灰阶第二档
  return {
    grid: { left: 8, right: 96, top: 8, bottom: 8, containLabel: true },   // 右侧留出金额标签（¥12,345.00）的宽度
    tooltip: { trigger: 'axis', axisPointer: { type: 'none' }, valueFormatter: formatter },
    xAxis: { type: 'value', min: 0, axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', data: categories.slice().reverse(), axisLine: { show: false } },   // 第一名在最上
    series: [{ type: 'bar', data: values.slice().reverse().map((v, i, arr) => ({ value: v, itemStyle: { color: arr.length - 1 - i < top && v > 0 ? hi : lo } })), barMaxWidth: 16, label: { show: true, position: 'right', color: t.text, fontSize: t.font, formatter: formatter ? (p) => formatter(p.value) : undefined } }],
  };
}
