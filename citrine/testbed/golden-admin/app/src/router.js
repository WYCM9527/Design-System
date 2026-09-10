import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import { canSee } from './store'

// hash 路由：构建产物以 file:// 打开也能直达任意页面（截图脚本依赖这一点）
const routes = [
  { path: '/login', component: () => import('./pages/Login.vue'), meta: { title: '登录', bare: true } },
  {
    path: '/', component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('./pages/Dashboard.vue'), meta: { title: '工作台', menu: 'dashboard', crumbs: ['概览'] } },
      { path: 'orders', name: 'orders', component: () => import('./pages/Orders.vue'), meta: { title: '订单管理', menu: 'orders', crumbs: ['业务'] } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('./pages/OrderDetail.vue'), meta: { title: '订单详情', menu: 'orders', crumbs: ['业务', '订单管理'] } },
      { path: 'refunds', name: 'refunds', component: () => import('./pages/Refunds.vue'), meta: { title: '退款审核', menu: 'refunds', crumbs: ['业务'] } },
      { path: 'merchants', name: 'merchants', component: () => import('./pages/Merchants.vue'), meta: { title: '商户管理', menu: 'merchants', crumbs: ['业务'] } },
      { path: 'merchants/new', name: 'merchant-new', component: () => import('./pages/MerchantForm.vue'), meta: { title: '新建商户', menu: 'merchants', crumbs: ['业务', '商户管理'] } },
      { path: 'merchants/apply', name: 'merchant-apply', component: () => import('./pages/MerchantApply.vue'), meta: { title: '入驻申请', menu: 'merchants', crumbs: ['业务', '商户管理'] } },
      { path: 'merchants/:id/edit', name: 'merchant-edit', component: () => import('./pages/MerchantForm.vue'), meta: { title: '编辑商户', menu: 'merchants', crumbs: ['业务', '商户管理'] } },
      { path: 'campaigns', name: 'campaigns', component: () => import('./pages/Campaigns.vue'), meta: { title: '营销活动', menu: 'campaigns', crumbs: ['业务'] } },
      { path: 'members', name: 'members', component: () => import('./pages/Members.vue'), meta: { title: '成员与角色', menu: 'members', crumbs: ['系统'] } },
      { path: 'analytics', name: 'analytics', component: () => import('./pages/Analytics.vue'), meta: { title: '数据看板', menu: 'analytics', crumbs: ['概览'] } },
      { path: 'riders', name: 'riders', component: () => import('./pages/Riders.vue'), meta: { title: '骑手调度', menu: 'riders', crumbs: ['业务'] } },
      { path: 'notices', name: 'notices', component: () => import('./pages/Notices.vue'), meta: { title: '通知中心', menu: 'notices', crumbs: ['系统'] } },
      { path: 'notices/:id', name: 'notice-detail', component: () => import('./pages/NoticeDetail.vue'), meta: { title: '公告详情', menu: 'notices', crumbs: ['系统', '通知中心'] } },
      { path: 'profile', name: 'profile', component: () => import('./pages/Profile.vue'), meta: { title: '个人中心', menu: 'profile', crumbs: ['系统'] } },
      { path: 'kitchen', name: 'kitchen', component: () => import('./pages/KitchenSink.vue'), meta: { title: '组件走查', crumbs: ['系统'] } },
      { path: 'error/500', name: 'server-error', component: () => import('./pages/ServerError.vue'), meta: { title: '服务异常', crumbs: [] } },
      { path: 'forbidden', name: 'forbidden', component: () => import('./pages/Forbidden.vue'), meta: { title: '无权访问', crumbs: [] } },
      { path: ':pathMatch(.*)*', component: () => import('./pages/NotFound.vue'), meta: { title: '页面不存在', crumbs: [] } }
    ]
  }
]

const router = createRouter({ history: createWebHashHistory(), routes })

// 无权菜单直接进 403（PRD §3.2）
router.beforeEach((to) => {
  if (to.meta.menu && !canSee(to.meta.menu)) return { name: 'forbidden', query: { from: to.meta.title } }
  document.title = `${to.meta.title || ''} · 黄金后台`
  return true
})

export default router
