// 页头（种子配方组件 · React 版，与 bridge/vue/PageHeader.vue 同形）：每个一级页面一个 H1，副标题可省；status 放标题旁的状态胶囊，actions 放页面级操作（主操作金底）。
// 样式来自 recipes.css 的 .page-head / .title-row / .actions。面包屑在壳层顶栏（.crumbs），表格、图表自己的筛选留在各自的卡片里，都不放这里。leading 放标题左侧的头像。
import * as React from 'react'

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  status?: React.ReactNode
  actions?: React.ReactNode
  leading?: React.ReactNode
}

export function PageHeader({ title, subtitle, status, actions, leading }: PageHeaderProps) {
  return (
    <div className="page-head">
      {leading}
      <div>
        {status ? <div className="title-row"><h1>{title}</h1>{status}</div> : <h1>{title}</h1>}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  )
}
