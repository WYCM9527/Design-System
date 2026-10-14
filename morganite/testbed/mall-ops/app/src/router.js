import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import { canSee } from './store'

// hash 路由：构建产物以 file:// 或静态服务打开都能直达任意页面（验收工具依赖这一点）
// meta.crumbs：面包屑前几级（[文字, 链接?]，分组不带链接、不可点），最后一级是页面标题或 crumb(route) 的返回值；所有页面（含工作台）顶栏左侧都是面包屑
const page = (name) => () => import(`./pages/${name}.vue`)
const routes = [
  { path: '/login', component: page('Login'), meta: { title: '登录', bare: true } },
  {
    path: '/', component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: page('Dashboard'), meta: { title: '工作台', menu: 'dashboard', crumbs: [['概览']] } },
      { path: 'analytics', component: page('Analytics'), meta: { title: '数据报表', menu: 'analytics', crumbs: [['概览']] } },
      { path: 'orders', component: page('Orders'), meta: { title: '订单管理', menu: 'orders', crumbs: [['交易']] } },
      { path: 'orders/:id', component: page('OrderDetail'), meta: { title: '订单详情', menu: 'orders', crumbs: [['交易'], ['订单管理', '/orders']], crumb: (r) => r.params.id } },
      { path: 'refunds', component: page('Refunds'), meta: { title: '售后退款', menu: 'refunds', crumbs: [['交易']] } },
      { path: 'products', component: page('Products'), meta: { title: '商品管理', menu: 'products', crumbs: [['交易']] } },
      { path: 'products/new', component: page('ProductForm'), meta: { title: '发布商品', menu: 'products', crumbs: [['交易'], ['商品管理', '/products']] } },
      { path: 'products/:id/edit', component: page('ProductForm'), meta: { title: '编辑商品', menu: 'products', crumbs: [['交易'], ['商品管理', '/products']] } },
      { path: 'inventory', component: page('Building'), meta: { title: '库存盘点', menu: 'inventory', crumbs: [['交易']] } },
      { path: 'customers', component: page('Customers'), meta: { title: '客户管理', menu: 'customers', crumbs: [['交易']] } },
      { path: 'customers/:id', component: page('CustomerDetail'), meta: { title: '客户详情', menu: 'customers', crumbs: [['交易'], ['客户管理', '/customers']], crumb: (r) => r.params.id } },
      { path: 'campaigns', component: page('Campaigns'), meta: { title: '营销中心', menu: 'campaigns', crumbs: [['交易']] } },
      { path: 'notices', component: page('Notices'), meta: { title: '消息中心', menu: 'notices', crumbs: [['系统']] } },
      { path: 'notices/:id', component: page('NoticeDetail'), meta: { title: '公告详情', menu: 'notices', crumbs: [['系统'], ['消息中心', '/notices']] } },
      { path: 'members', component: page('Members'), meta: { title: '成员与角色', menu: 'members', crumbs: [['系统']] } },
      { path: 'settings', component: page('Settings'), meta: { title: '系统设置', menu: 'settings', crumbs: [['系统']] } },
      { path: 'kitchen', component: () => import('@wycm9527/morganite/vue/KitchenSink.vue'), meta: { title: '组件走查', menu: 'kitchen', crumbs: [['系统']] } },
      { path: 'error/500', component: page('ServerError'), meta: { title: '服务异常', crumbs: [] } },
      { path: 'forbidden', name: 'forbidden', component: page('Forbidden'), meta: { title: '无权访问', crumbs: [] } },
      { path: ':pathMatch(.*)*', component: page('NotFound'), meta: { title: '页面不存在', crumbs: [] } }
    ]
  }
]

const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior: () => ({ top: 0 }) })

// 无权菜单直接进 403（PRD §3.2），面包屑与标题保留来源页
router.beforeEach((to) => {
  if (to.meta.menu && !canSee(to.meta.menu)) return { name: 'forbidden', query: { from: to.meta.title } }
  document.title = `${to.meta.title || ''} · 拾光商城`
  return true
})

export default router
