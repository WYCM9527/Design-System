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
  surface: string
  inverseBg: string
  inverseText: string
  fontFamily: string
  font: number
  radius: number
}
export interface TrendSeries { name: string; data: (number | null)[] }
export interface TrendLineOptions { days: string[]; series: TrendSeries[]; area?: Record<string, unknown>; count?: boolean }
export interface RankBarsOptions { categories: string[]; values: number[]; top?: number; formatter?: (value: number) => string; el?: Element }

export function chartTokens(el?: Element): ChartTokens
export function theme(el?: Element): Record<string, unknown>
export function registerTheme(echarts: { registerTheme(name: string, theme: Record<string, unknown>): void }, name?: string, el?: Element): string
export function areaGradient(echarts: unknown, el?: Element): Record<string, unknown>
export function trendLine(options: TrendLineOptions): Record<string, unknown>
export function rankBars(options: RankBarsOptions): Record<string, unknown>
