// ECharts 桥接：ECharts 画在 canvas 上，不读 CSS 变量。这里在运行时从 :root 读取 token 的计算值，生成 ECharts 主题与几条图表配方。
// 用法：
//   import * as echarts from 'echarts/core'
//   import { registerTheme, trendLine, areaGradient, rankBars, barGradient } from '<seed>/bridge/echarts.js'
//   const name = registerTheme(echarts)              // 每次亮 / 暗切换后重新调用，再 dispose + init(el, name)
//   const chart = echarts.init(el, name)
//   chart.setOption(trendLine({ days, series: [{ name: '本周', data }, { name: '上周', data }] }))
//   series: [{ type: 'bar', data, itemStyle: { color: barGradient(chartTokens().palette[0]) } }]   // 自己写的柱状图也用柱子渐变
// 规则见 DESIGN.md「组件原则」图表条：轴线与网格线是 border.width.default 发丝线；趋势折线 y 轴贴数据（不强制从 0）、底线虚线、平滑 0.5 + smoothMonotone、单序列显示空心点并填渐隐面积、多序列不显示点也不填面积；柱状图必须从 0 开始，柱子渐变起点深、末端浅（竖柱下深上浅），品牌金用 chart.gradient.start → end，其他颜色同色饱和度渐变；提示气泡是白底浮层（color.chart.tooltip 底、正文色字、细边、elevation.tooltip 大投影）；悬停时浅金竖条（color.chart.area）盖住悬停的那一格，不画竖线。

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
    lineWidth: num(read('--border-width-default', el), 0.6), baselineDash: num(read('--chart-baseline-dash', el), 4),
    surface: read('--color-bg-surface', el), inverseBg: read('--color-bg-inverse', el), inverseText: read('--color-text-inverse', el),
    tooltipBg: read('--color-chart-tooltip', el) || read('--color-bg-elevated', el),
    tooltipShadowY: num(read('--elevation-tooltip-y', el), 12), tooltipShadowBlur: num(read('--elevation-tooltip-blur', el), 32), tooltipShadowColor: read('--elevation-tooltip-color', el) || 'rgba(0, 0, 0, 0.12)',
    tooltipRadius: num(read('--radius-md', el), 8), tooltipPadding: [num(read('--spacing-2', el), 8), num(read('--spacing-3', el), 12)],
    fontFamily: read('--font-family-body', el), font: num(read('--text-small-size', el), 12),
    numericFamily: read('--text-numeric-family', el) || read('--font-family-body', el),
    radius: num(read('--radius-xs', el), 2),
    gradientSaturation: num(read('--chart-gradient-saturation', el), 0.4),
    gradientStart: read('--color-chart-gradient-start', el), gradientEnd: read('--color-chart-gradient-end', el),
  };
}

/** HSB 明度不变、饱和度乘 k：每个通道向最大通道收拢（c → max − (max − c) × k）；灰色饱和度为 0，原样返回 */
function desaturate(color, k) {
  const c = color.trim();
  let rgb, a = 1;
  if (c.startsWith('#')) {
    const h = c.length <= 5 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1);
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
  } else {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return c;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    rgb = p.slice(0, 3);
    if (p.length > 3) a = p[3];
  }
  const max = Math.max(...rgb);
  const out = rgb.map((v) => Math.round(max - (max - v) * k));
  return a < 1 ? `rgba(${out.join(', ')}, ${a})` : `rgb(${out.join(', ')})`;
}

/** 一根柱子的渐变，起点深、末端浅：竖柱底端深、顶端浅；横柱基线端（左）深、数值端（右）浅。
    品牌金（chart.1 / 顺序色封顶）用指定两色 chart.gradient.start → end；其他颜色同色饱和度渐变，深端是原色、浅端饱和度 × gradientSaturation */
function linearFill(color, t, horizontal) {
  const gold = [t.palette[0], t.sequential[t.sequential.length - 1]].some((g) => g && g.toLowerCase() === color.trim().toLowerCase());
  const [deep, light] = gold && t.gradientStart && t.gradientEnd ? [t.gradientStart, t.gradientEnd] : [color, desaturate(color, t.gradientSaturation)];
  return horizontal
    ? { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: deep }, { offset: 1, color: light }] }
    : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: light }, { offset: 1, color: deep }] };
}

/**
 * 柱状图的柱子渐变（DESIGN 图表条：起点深、末端浅，竖柱下深上浅、横柱左深右浅；品牌金用 chart.gradient.start → end，
 * 其他颜色同色饱和度渐变——HSB 明度不变，浅端饱和度 × chart.gradient.saturation）。
 * 返回 ECharts 线性渐变对象，series 级与数据项级的 itemStyle.color 都能用。
 * @param {string} color  token 读出的实色（如 chartTokens().palette[0]；品牌金按这个值认出来）
 * @param {{ horizontal?: boolean, el?: Element }} [opts]  horizontal：横向柱
 */
export function barGradient(color, { horizontal = false, el = document.documentElement } = {}) {
  return linearFill(color, chartTokens(el), horizontal);
}

/** ECharts 主题对象：轴、网格、图例、提示框、折线 / 柱 / 饼的默认形态 */
export function theme(el = document.documentElement) {
  const t = chartTokens(el);
  return {
    color: t.palette,
    backgroundColor: 'transparent',
    textStyle: { fontFamily: t.fontFamily, color: t.text, fontSize: t.font },
    legend: { icon: 'roundRect', itemWidth: 10, itemHeight: 10, itemGap: 16, textStyle: { color: t.text, fontSize: t.font } },
    // 大投影走 elevation.tooltip：ECharts 把 shadow* 拼成 box-shadow，没有扩散半径，token 也只给 y / blur / color。
    // 挂到 body（同 Element 浮层）：el-card 是 overflow: hidden，靠边的气泡和投影会被卡片裁掉
    // 悬停指示默认是浅金竖条（shadow）：竖条宽度取类目间距，时间轴 / 数值轴上会缩成 1px，这类图自己设 axisPointer.type: 'line'
    tooltip: { appendTo: 'body', backgroundColor: t.tooltipBg, borderColor: t.line, borderWidth: t.lineWidth, borderRadius: t.tooltipRadius, padding: t.tooltipPadding, shadowOffsetX: 0, shadowOffsetY: t.tooltipShadowY, shadowBlur: t.tooltipShadowBlur, shadowColor: t.tooltipShadowColor, textStyle: { color: t.primary, fontSize: t.font }, axisPointer: { type: 'shadow', lineStyle: { color: t.strong }, shadowStyle: { color: t.area } } },
    categoryAxis: { axisLine: { lineStyle: { color: t.line, width: t.lineWidth } }, axisTick: { show: false }, axisLabel: { color: t.muted, fontSize: t.font }, splitLine: { show: false } },
    valueAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: t.muted, fontSize: t.font, fontFamily: t.numericFamily }, splitLine: { lineStyle: { color: t.line, width: t.lineWidth } } },   // 数值刻度用数字字体，类目轴多是中文，保持正文字体
    // 平滑 0.5 + smoothMonotone 'x'：曲线丝滑但不越过数据点（只用 0.3 会在数据点处显硬；不加 monotone 则会在点之间鼓包）；线端与拐角圆头
    line: { smooth: 0.5, smoothMonotone: 'x', symbol: 'emptyCircle', symbolSize: 6, showSymbol: false, lineStyle: { width: 2, cap: 'round', join: 'round' }, emphasis: { focus: 'series' } },
    bar: { barMaxWidth: 24, itemStyle: { borderRadius: t.radius } },
    pie: { itemStyle: { borderColor: t.surface, borderWidth: 2 }, label: { color: t.text } },
  };
}

/** 注册主题并返回主题名。亮 / 暗切换后再调用一次，然后 dispose 旧实例、用同名主题重新 init。 */
export function registerTheme(echarts, name = 'morganite', el = document.documentElement) {
  echarts.registerTheme(name, theme(el));
  return name;
}

/** 单序列折线的面积：从 chart.area 到透明的纵向渐变；多序列对比不要用面积 */
export function areaGradient(echarts, el = document.documentElement) {
  const t = chartTokens(el);
  return { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: t.area }, { offset: 1, color: 'transparent' }]) };
}

/**
 * 趋势折线配方：类目 x 轴无留白，y 轴贴数据范围（scale），所有序列统一 2px 细线（主序列靠品牌金区分，不靠粗细）；单序列显示空心点、可传渐隐面积；图例右上。
 * 底线（x 轴线）是发丝细的虚线（chart.baseline.dash），其余网格线实线。
 * 计数型趋势（申请数、订单数这类整数）：y 轴从 0 起、刻度只取整数（minInterval 1）——否则会出现 0.5、1.5 这种"半张申请"的刻度；默认按数据自动判断（全是整数且最大值 ≤ 20），也可显式传 count。
 * @param {{ days: string[], series: { name: string, data: number[] }[], area?: object, count?: boolean, el?: Element }} p  area 只在单序列时传 areaGradient(echarts)
 */
export function trendLine({ days, series, area, count, el = document.documentElement }) {
  const t = chartTokens(el);
  const values = series.flatMap((s) => s.data).filter((v) => v !== null && v !== undefined);
  const isCount = count ?? (values.length > 0 && values.every((v) => Number.isInteger(v)) && Math.max(...values) <= 20);
  const splitLine = { showMinLine: false };   // 最底那条网格线和 x 轴线重合，留着会在虚线下面垫一条实线
  return {
    grid: { left: 8, right: 8, top: 36, bottom: 0, containLabel: true },
    legend: { top: 0, right: 0 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days, boundaryGap: false, axisLine: { lineStyle: { type: [t.baselineDash, t.baselineDash] } } },
    yAxis: isCount ? { type: 'value', min: 0, minInterval: 1, splitNumber: 4, splitLine } : { type: 'value', scale: true, splitNumber: 4, splitLine },
    series: series.map((s) => ({ name: s.name, type: 'line', data: s.data, showSymbol: series.length === 1, areaStyle: area && series.length === 1 ? area : undefined })),   // 线宽走主题（2px），不按序列加粗
  };
}

/**
 * 排行横向柱状配方（DESIGN「数据可视化」：排行榜前三名品牌金、其余中性灰——单序列强度按离散分段，不在灰与金之间插值）。
 * categories 与 values 已按大小排好序（第一项是第一名）；value 为 0 的项不着色为金。
 * @param {{ categories: string[], values: number[], top?: number, formatter?: (v: number) => string, el?: Element }} p
 */
export function rankBars({ categories, values, top = 3, formatter, el = document.documentElement }) {
  const t = chartTokens(el);
  const hi = t.sequential[t.sequential.length - 1], lo = t.sequential[1];   // 封顶的品牌金 / 灰阶第二档
  return {
    grid: { left: 8, right: 96, top: 8, bottom: 8, containLabel: true },   // 右侧留出金额标签（¥12,345.00）的宽度
    tooltip: { trigger: 'axis', axisPointer: { type: 'none' }, valueFormatter: formatter },
    xAxis: { type: 'value', min: 0, axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', data: categories.slice().reverse(), axisLine: { show: false } },   // 第一名在最上
    series: [{ type: 'bar', data: values.slice().reverse().map((v, i, arr) => ({ value: v, itemStyle: { color: linearFill(arr.length - 1 - i < top && v > 0 ? hi : lo, t, true) } })), barMaxWidth: 16, label: { show: true, position: 'right', color: t.text, fontSize: t.font, fontFamily: t.numericFamily, formatter: formatter ? (p) => formatter(p.value) : undefined } }],
  };
}
