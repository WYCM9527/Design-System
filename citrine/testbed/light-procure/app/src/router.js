import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import { canSee } from './data/session'
import { db, ready } from './data/db'

// hash 路由：构建产物以 file:// 打开也能直达任意页面（截图脚本依赖）。meta.menu = 侧栏项 key，也是权限维度。
const routes = [
  {
    path: '/', component: AppLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('./pages/Dashboard.vue'), meta: { title: '工作台', menu: 'dashboard', crumbs: [] } },
      { path: 'applications', name: 'applications', component: () => import('./pages/Applications.vue'), meta: { title: '采购申请', menu: 'applications', crumbs: ['业务管理'] } },
      { path: 'applications/new', name: 'application-new', component: () => import('./pages/ApplicationForm.vue'), meta: { title: '新建采购申请', menu: 'applications', crumbs: ['业务管理', '采购申请'] } },
      { path: 'applications/:id/edit', name: 'application-edit', component: () => import('./pages/ApplicationForm.vue'), meta: { title: '编辑采购申请', menu: 'applications', crumbs: ['业务管理', '采购申请'] } },
      { path: 'applications/:id', name: 'application-detail', component: () => import('./pages/ApplicationDetail.vue'), meta: { title: '采购申请详情', menu: 'applications', crumbs: ['业务管理', '采购申请'] } },
      { path: 'approvals', name: 'approvals', component: () => import('./pages/Approvals.vue'), meta: { title: '审批中心', menu: 'approvals', crumbs: ['业务管理'] } },
      { path: 'assets', name: 'assets', component: () => import('./pages/Assets.vue'), meta: { title: '资产台账', menu: 'assets', crumbs: ['业务管理'] } },
      { path: 'suppliers', name: 'suppliers', component: () => import('./pages/Suppliers.vue'), meta: { title: '供应商管理', menu: 'suppliers', crumbs: ['业务管理'] } },
      { path: 'report', name: 'report', component: () => import('./pages/Report.vue'), meta: { title: '数据报表', menu: 'report', crumbs: ['数据分析'] } },
      { path: 'org', name: 'org', component: () => import('./pages/Org.vue'), meta: { title: '组织与成员', menu: 'org', crumbs: ['系统管理'] } },
      { path: 'roles', name: 'roles', component: () => import('./pages/Roles.vue'), meta: { title: '角色权限', menu: 'roles', crumbs: ['系统管理'] } },
      { path: 'settings', name: 'settings', component: () => import('./pages/Settings.vue'), meta: { title: '系统设置', menu: 'settings', crumbs: ['系统管理'] } },
      { path: 'logs', name: 'logs', component: () => import('./pages/Logs.vue'), meta: { title: '操作日志', menu: 'logs', crumbs: ['系统管理'] } },
      { path: 'kitchen', name: 'kitchen', component: () => import('@wycm9527/citrine/vue/KitchenSink.vue'), meta: { title: '组件走查', crumbs: ['系统管理'] } },   // 种子配方组件：桥接覆盖率走查页，不进侧栏
      { path: 'forbidden', name: 'forbidden', component: () => import('./pages/Forbidden.vue'), meta: { title: '暂无访问权限', crumbs: [] } },
      { path: ':pathMatch(.*)*', name: 'notfound', component: () => import('./pages/NotFound.vue'), meta: { title: '页面不存在', crumbs: [] } }
    ]
  },
  // 未接入设计系统的旧板块（范围根狗食）：自带旧布局，路由 meta.legacy 让守卫移除 html.citrine，Element 保持默认外观
  { path: '/legacy-report', name: 'legacy-report', component: () => import('./pages/LegacyReport.vue'), meta: { title: '旧版报表（未接入）', legacy: true } }
]

const router = createRouter({ history: createWebHashHistory(), routes })

// 直接访问无权限页面 → 「暂无访问权限」（PRD §2）；记录级权限由页面自己判断
router.beforeEach((to) => {
  document.documentElement.classList.toggle('citrine', !to.meta.legacy)   // 范围根：未接入板块下整套设计系统样式不存在
  if (!ready.value) return true   // 数据未就绪时先放行，App.vue 就绪后会重新进入当前路由再判权限
  if (to.meta.menu && !canSee(to.meta.menu)) return { name: 'forbidden', query: { from: to.meta.title } }
  document.title = `${to.meta.title || ''} · ${db.settings?.systemName || '轻采'}`
  return true
})

export default router
