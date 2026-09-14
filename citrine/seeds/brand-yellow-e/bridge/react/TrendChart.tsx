// 趋势折线（种子配方组件 · React 版）：桥接 trendLine 配方——计数型自动整数刻度、单序列渐变面积、多序列不填面积。
import * as React from 'react'
import { EChart } from './EChart'
import { trendLine, areaGradient } from '../echarts.js'

export function TrendChart({ days, series, count }: { days: string[]; series: { name: string; data: number[] }[]; count?: boolean }) {
  return <EChart deps={[days, series, count]} option={(t, ec) => trendLine({ days, series, count, area: series.length === 1 ? areaGradient(ec) : undefined })} />
}
