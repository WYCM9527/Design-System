// bridge/echarts.js 的类型声明（给 TypeScript / React 项目）。实现见 echarts.js。
export interface ChartTokens {
  palette: string[]
  sequential: string[]
  area: string
  text: string
  muted: string
  primary: string
  line: string
  strong: string
  lineWidth: number
  baselineDash: number
  surface: string
  inverseBg: string
  inverseText: string
  tooltipBg: string
  tooltipShadowY: number
  tooltipShadowBlur: number
  tooltipShadowColor: string
  tooltipRadius: number
  tooltipPadding: [number, number]
  fontFamily: string
  font: number
  numericFamily: string
  radius: number
  gradientSaturation: number
  gradientStart: string
  gradientEnd: string
}
export interface BarGradientOptions { horizontal?: boolean; el?: Element }
export interface BarEndsOptions { horizontal?: boolean; selected?: Record<string, boolean>; el?: Element }
export interface TrendSeries { name: string; data: (number | null)[] }
export interface TrendLineOptions { days: string[]; series: TrendSeries[]; area?: Record<string, unknown>; count?: boolean; el?: Element }
export interface RankBarsOptions { categories: string[]; values: number[]; top?: number; formatter?: (value: number) => string; el?: Element }

export function chartTokens(el?: Element): ChartTokens
export function theme(el?: Element): Record<string, unknown>
export function registerTheme(echarts: { registerTheme(name: string, theme: Record<string, unknown>): void }, name?: string, el?: Element): string
export function areaGradient(echarts: unknown, el?: Element): Record<string, unknown>
export function trendLine(options: TrendLineOptions): Record<string, unknown>
export function rankBars(options: RankBarsOptions): Record<string, unknown>
export function barGradient(color: string, options?: BarGradientOptions): Record<string, unknown>
export function barEnds<T extends Record<string, unknown>>(series: T[], options?: BarEndsOptions): T[]
export function withBarEnds<T extends Record<string, unknown>>(option: T, options?: Omit<BarEndsOptions, 'horizontal'>): T
