// 板块标题（种子配方组件 · React 版，与 bridge/vue/SectionHeader.vue 同形）：看板页在 H1 下分板块的二级标题，actions 放只作用于这一板块的筛选与操作。
// 样式来自 recipes.css 的 .section-head。页面级操作放 PageHeader 的 actions；不值一个标题的次要分组用配方类 .section-label。
import * as React from 'react'

export interface SectionHeaderProps {
  title: React.ReactNode
  actions?: React.ReactNode
}

export function SectionHeader({ title, actions }: SectionHeaderProps) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {actions ? <div className="right">{actions}</div> : null}
    </div>
  )
}
