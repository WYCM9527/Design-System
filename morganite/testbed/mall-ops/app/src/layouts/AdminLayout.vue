<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, ChartHistogram, Order, Return, Commodity, Box, Peoples, Coupon, Remind, PeopleSafe, SettingTwo, Components, Search, Moon, SunOne, Down, HamburgerButton } from '@icon-park/vue-next'
import { store, collapsed, roleInfo, canSee, setRole, toggleTheme, ROLES } from '../store'
import { version as dsVersion } from '../../design-system/.adopter.json'

// el-menu-item 不透传 attrs，折叠后只剩图标、没有可访问名称：用指令把 aria-label 写到根元素
const vAriaLabel = { mounted: (el, b) => el.setAttribute('aria-label', b.value), updated: (el, b) => el.setAttribute('aria-label', b.value) }

const route = useRoute()
const router = useRouter()

// 手机（≤ layout.breakpoint.mobile，字面镜像 768）：侧栏离屏抽屉，汉堡开、遮罩 / 选中菜单关；抽屉里永远是展开形态
const mqMobile = matchMedia('(max-width: 768px)')
const isMobile = ref(mqMobile.matches)
const navOpen = ref(false)
const onMq = (e) => { isMobile.value = e.matches; navOpen.value = false }
mqMobile.addEventListener('change', onMq)
onBeforeUnmount(() => mqMobile.removeEventListener('change', onMq))
router.afterEach(() => { navOpen.value = false })

const groups = [
  { title: '概览', items: [{ key: 'dashboard', label: '工作台', to: '/', icon: Home }, { key: 'analytics', label: '数据报表', to: '/analytics', icon: ChartHistogram }] },
  { title: '交易', items: [
    { key: 'orders', label: '订单管理', to: '/orders', icon: Order },
    { key: 'refunds', label: '售后退款', to: '/refunds', icon: Return },
    { key: 'products', label: '商品管理', to: '/products', icon: Commodity },
    { key: 'inventory', label: '库存盘点', to: '/inventory', icon: Box },
    { key: 'customers', label: '客户管理', to: '/customers', icon: Peoples },
    { key: 'campaigns', label: '营销中心', to: '/campaigns', icon: Coupon }
  ] },
  { title: '系统', items: [
    { key: 'notices', label: '消息中心', to: '/notices', icon: Remind },
    { key: 'members', label: '成员与角色', to: '/members', icon: PeopleSafe },
    { key: 'settings', label: '系统设置', to: '/settings', icon: SettingTwo },
    { key: 'kitchen', label: '组件走查', to: '/kitchen', icon: Components }
  ] }
]
const visibleGroups = computed(() => groups.map((g) => ({ ...g, items: g.items.filter((i) => canSee(i.key)) })).filter((g) => g.items.length))
const menuCollapsed = computed(() => collapsed.value && !isMobile.value)
const crumbs = computed(() => [...(route.meta.crumbs || []), [route.meta.crumb ? route.meta.crumb(route) : route.meta.title]])
const today = '2026 年 10 月 9 日 · 周五'

function onCommand(cmd) {
  if (cmd === 'logout') router.push('/login')
  else if (cmd === 'profile') router.push('/settings')
  else if (cmd.startsWith('role:')) {
    setRole(cmd.slice(5))
    if (route.meta.menu && !canSee(route.meta.menu)) router.push({ name: 'forbidden', query: { from: route.meta.title } })
  }
}
</script>

<template>
  <div class="app" :class="{ 'is-collapsed': menuCollapsed, 'is-nav-open': navOpen }">
    <aside id="sidebar" class="sidebar">
      <router-link class="app-brand" to="/"><span class="logo">拾</span><span v-if="!menuCollapsed">拾光商城</span></router-link>
      <el-menu :default-active="route.meta.menu || ''" :collapse="menuCollapsed" :collapse-transition="false" router aria-label="主导航">
        <el-menu-item-group v-for="g in visibleGroups" :key="g.title" :title="g.title">
          <el-menu-item v-for="item in g.items" :key="item.key" v-aria-label="item.label" :index="item.key" :route="item.to">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title><span class="menu-label">{{ item.label }}</span></template>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div class="sidebar-foot">{{ menuCollapsed ? dsVersion : `Morganite ${dsVersion} · 实测` }}</div>
    </aside>

    <button v-if="navOpen" class="sidebar-mask" type="button" aria-label="关闭导航" @click="navOpen = false" />

    <div class="main">
      <header class="topbar">
        <button class="iconbtn menu-btn" type="button" aria-label="打开导航" aria-controls="sidebar" :aria-expanded="navOpen" @click="navOpen = true"><HamburgerButton class="i-icon--lg" /></button>
        <div v-if="route.meta.greeting" class="greet"><span class="greet__hi">{{ today }}</span><b class="greet__name">欢迎回来，{{ store.user.name }}</b></div>
        <el-breadcrumb v-else separator="/" aria-label="面包屑">
          <el-breadcrumb-item v-for="([label, to], i) in crumbs" :key="i" :to="to">{{ label }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-input class="search" placeholder="搜索订单号 / 商品 / 客户" aria-label="全局搜索" clearable>
          <template #prefix><Search class="i-icon--sm i-icon--muted" /></template>
        </el-input>
        <button class="iconbtn" type="button" :aria-label="`消息中心，${store.unread} 条未读`" @click="router.push('/notices')">
          <Remind class="i-icon--lg" />
          <span v-if="store.unread" class="unread num">{{ store.unread > 99 ? '99+' : store.unread }}</span>
        </button>
        <button class="iconbtn" type="button" :aria-pressed="store.theme === 'dark'" :aria-label="store.theme === 'dark' ? '切换到亮色' : '切换到暗色'" @click="toggleTheme">
          <component :is="store.theme === 'dark' ? SunOne : Moon" class="i-icon--lg" />
        </button>
        <el-dropdown trigger="click" @command="onCommand">
          <button class="user" type="button" aria-label="账号菜单">
            <span class="avatar">{{ store.user.initial }}</span>
            <span class="user-name">{{ store.user.name }}<span class="user-role"> · {{ roleInfo.label }}</span></span>
            <Down class="i-icon--sm user-caret" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人设置</el-dropdown-item>
              <el-dropdown-item v-for="(r, k) in ROLES" :key="k" :command="`role:${k}`" :disabled="k === store.role">切换为{{ r.label }}（测试用）</el-dropdown-item>
              <el-dropdown-item divided command="logout" class="is-danger">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content"><router-view :key="route.fullPath" /></main>
    </div>
  </div>
</template>

<style scoped>
.menu-label { flex: 1; }
.user-role { color: var(--color-text-secondary); }
</style>
