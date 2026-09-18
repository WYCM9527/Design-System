// Citrine × shadcn/ui 实验室：验证 bridge/shadcn-globals.css 在真实 React + Tailwind v4 + Radix 组件上的渲染结果，
// 同时验证与组件库无关的配方层（recipes.css）和 React 版配方组件（bridge/react）能否直接复用。
// 壳层用 recipes.css 的 .app / .sidebar / .nav / .topbar / .content；没有路由库，hash 路由手写。
import * as React from 'react'
import { LayoutDashboard, ListOrdered, FilePenLine, Boxes, Menu, Moon, Sun, PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react'
import { Kitchen } from './pages/Kitchen'
import { Orders } from './pages/Orders'
import { Dashboard } from './pages/Dashboard'
import { FormPage } from './pages/FormPage'

const ROUTES: Record<string, { title: string; group: string; icon: React.ComponentType<{ className?: string }>; page: React.ComponentType }> = {
  '/': { title: '工作台', group: '概览', icon: LayoutDashboard, page: Dashboard },
  '/orders': { title: '单据管理', group: '业务', icon: ListOrdered, page: Orders },
  '/form': { title: '新建供应商', group: '业务', icon: FilePenLine, page: FormPage },
  '/kitchen': { title: '组件走查', group: '系统', icon: Boxes, page: Kitchen }
}

function useHash() {
  const [hash, setHash] = React.useState(() => location.hash.replace(/^#/, '') || '/')
  React.useEffect(() => { const on = () => setHash(location.hash.replace(/^#/, '').split('?')[0] || '/'); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on) }, [])
  return hash.split('?')[0]
}

export default function App() {
  const path = useHash()
  const route = ROUTES[path] ?? ROUTES['/']
  const [collapsed, setCollapsed] = React.useState(() => matchMedia('(max-width: 1366px)').matches)   // layout.breakpoint.narrow 字面镜像
  const [navOpen, setNavOpen] = React.useState(false)   // 手机抽屉（≤ 768，layout.breakpoint.mobile 字面镜像）
  React.useEffect(() => { setNavOpen(false) }, [path])
  React.useEffect(() => { const mq = matchMedia('(max-width: 768px)'); const on = () => setNavOpen(false); mq.addEventListener('change', on); return () => mq.removeEventListener('change', on) }, [])
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'))
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('sl-theme', next ? 'dark' : 'light') }
  React.useEffect(() => { document.title = `${route.title} · Citrine × shadcn 实验室` }, [route])
  const groups = [...new Set(Object.values(ROUTES).map((r) => r.group))]
  const Page = route.page
  return (
    <div className={`app${collapsed ? ' is-collapsed' : ''}${navOpen ? ' is-nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="app-brand"><span className="logo">C</span>{!collapsed && <span>shadcn 实验室</span>}</div>
        <nav className="nav" aria-label="主导航">
          {groups.map((g) => (
            <React.Fragment key={g}>
              <div className="nav-group">{g}</div>
              {Object.entries(ROUTES).filter(([, r]) => r.group === g).map(([p, r]) => (
                <a key={p} href={`#${p}`} className={p === path ? 'active' : undefined} aria-label={r.title} aria-current={p === path ? 'page' : undefined}>
                  <r.icon className="i-icon--lg" /><span className="nav-label">{r.title}</span>
                </a>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-foot">{collapsed ? 'v2.5' : 'v2.5.0 · React + shadcn/ui'}</div>
      </aside>
      {navOpen && <button className="sidebar-mask" aria-label="关闭菜单" onClick={() => setNavOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="iconbtn menu-btn" title="打开菜单" onClick={() => setNavOpen(true)}><Menu className="i-icon--lg" /></button>
          <button className="iconbtn collapse-btn" title={collapsed ? '展开菜单' : '折叠菜单'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen className="i-icon--lg" /> : <PanelLeftClose className="i-icon--lg" />}</button>
          <nav aria-label="面包屑" className="crumbs"><span>{route.group}</span><span className="sep" aria-hidden="true">/</span><span>{route.title}</span></nav>
          <span className="spacer" />
          <button className="iconbtn" title="通知（3 条未读）" aria-label="通知，3 条未读"><Bell className="i-icon--lg" /><span className="unread num">3</span></button>
          <button className={`iconbtn${dark ? ' is-on' : ''}`} title={dark ? '切换亮色' : '切换暗色'} onClick={toggleTheme}>{dark ? <Sun className="i-icon--lg" /> : <Moon className="i-icon--lg" />}</button>
          <span className="user" role="button" tabIndex={0} aria-haspopup="menu"><span className="avatar" aria-hidden="true">王</span><span className="user-name">王小明 · 管理员</span></span>
        </header>
        <main className="content"><Page /></main>
      </div>
    </div>
  )
}
