import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Dashboard, meta: { title: '工作台' } },
    { path: '/kitchen', component: () => import('@wycm9527/morganite/vue/KitchenSink.vue'), meta: { title: '组件走查' } }
  ]
})
