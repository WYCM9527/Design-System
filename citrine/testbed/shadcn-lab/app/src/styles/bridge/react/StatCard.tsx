// 统计卡（种子配方组件 · React 版，与 bridge/vue/StatCard.vue 同形）：数据大字 + 涨跌 + 口径说明。样式来自 recipes.css 的 .stat-card。
// up 是箭头方向，positive 是颜色（好坏）；左侧品牌指示条是数据卡的固定特征。
import * as React from 'react'

export interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  up?: boolean
  positive?: boolean
  note?: string
  hint?: string
  labelExtra?: React.ReactNode
}

export function StatCard({ label, value, delta, up = true, positive, note, hint, labelExtra }: StatCardProps) {
  const good = positive === undefined ? up : positive
  return (
    <div className="stat-card">
      <div className="stat-card__label">
        <span>{label}</span>
        {hint && <button type="button" className="stat-card__hint" title={hint} aria-label={`${label}的统计口径说明`}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        </button>}
        {labelExtra}
      </div>
      <div className="stat-card__value num">{value}</div>
      {delta ? (
        <div className={`stat-card__delta num ${good ? 'up' : 'down'}`}>{up ? '▲' : '▼'} {delta}{note && <span className="stat-card__note"> · {note}</span>}</div>
      ) : note ? <div className="stat-card__note">{note}</div> : null}
    </div>
  )
}
