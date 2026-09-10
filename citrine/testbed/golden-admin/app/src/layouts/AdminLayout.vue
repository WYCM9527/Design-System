<script setup>
// el-menu-item 不透传 attrs，折叠时只剩图标、没有可访问名称：用指令把 aria-label 写到根元素（DESIGN.md 折叠侧栏配方）
const vAriaLabel = { mounted: (el, b) => el.setAttribute('aria-label', b.value), updated: (el, b) => el.setAttribute('aria-label', b.value) }
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, ChartHistogram, Order, Expenses, Shop, Coupon, Riding, Remind, Peoples, User, Search, Moon, Sunny, MenuFold, MenuUnfold, Down } from '@icon-park/vue-next'
import { store, roleInfo, canSee, setRole, toggleTheme, toggleDensity, ROLES } from '../store'

const route = useRoute(); const router = useRouter()
const groups = [
  { title: '概览', items: [{ key: 'dashboard', label: '工作台', to: '/', icon: Home }, { key: 'analytics', label: '数据看板', to: '/analytics', icon: ChartHistogram }] },
  { title: '业务', items: [
    { key: 'orders', label: '订单管理', to: '/orders', icon: Order },
    { key: 'refunds', label: '退款审核', to: '/refunds', icon: Expenses },
    { key: 'merchants', label: '商户管理', to: '/merchants', icon: Shop },
    { key: 'campaigns', label: '营销活动', to: '/campaigns', icon: Coupon },
    { key: 'riders', label: '骑手调度', to: '/riders', icon: Riding }
  ] },
  { title: '系统', items: [
    { key: 'notices', label: '通知中心', to: '/notices', icon: Remind },
    { key: 'members', label: '成员与角色', to: '/members', icon: Peoples },
    { key: 'profile', label: '个人中心', to: '/profile', icon: User }
  ] }
]
const visibleGroups = computed(() => groups.map((g) => ({ ...g, items: g.items.filter((i) => canSee(i.key)) })).filter((g) => g.items.length))
const activeKey = computed(() => route.meta.menu || '')
const crumbs = computed(() => [...(route.meta.crumbs || []), route.meta.title].filter(Boolean))
function onCommand(cmd) {
  if (cmd === 'logout') router.push('/login')
  else if (cmd.startsWith('role:')) { setRole(cmd.slice(5)); if (route.meta.menu && !canSee(route.meta.menu)) router.push('/') }
  else if (cmd === 'profile') router.push('/profile')
}
</script>

<template>
  <div class="app" :class="{ 'is-collapsed': store.collapsed }">
    <aside class="sidebar">
      <div class="app-brand"><span class="logo">Y</span><span v-if="!store.collapsed">黄金后台</span></div>
      <el-menu :default-active="activeKey" :collapse="store.collapsed" :collapse-transition="false" router>
        <el-menu-item-group v-for="g in visibleGroups" :key="g.title" :title="g.title">
          <el-menu-item v-for="item in g.items" :key="item.key" :index="item.key" :route="item.to" v-aria-label="item.label">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title><span class="menu-label">{{ item.label }}</span></template>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div class="sidebar-foot">{{ store.collapsed ? 'v2.4' : 'v2.4.0 · 设计系统实测' }}</div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button class="iconbtn" :title="store.collapsed ? '展开菜单' : '折叠菜单'" @click="store.collapsed = !store.collapsed">
          <component :is="store.collapsed ? MenuUnfold : MenuFold" class="i-icon--lg" />
        </button>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(c, i) in crumbs" :key="i">{{ c }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-input class="search" placeholder="搜索订单号 / 商户 / 骑手" clearable>
          <template #prefix><Search class="i-icon--sm i-icon--muted" /></template>
        </el-input>
        <button class="iconbtn" title="通知" @click="router.push('/notices')">
          <Remind class="i-icon--lg" />
          <span v-if="store.unread" class="unread num">{{ store.unread > 99 ? '99+' : store.unread }}</span>
        </button>
        <button class="iconbtn" :class="{ 'is-on': store.theme === 'dark' }" :title="store.theme === 'dark' ? '切换亮色' : '切换暗色'" @click="toggleTheme">
          <component :is="store.theme === 'dark' ? Sunny : Moon" class="i-icon--lg" />
        </button>
        <el-tooltip :content="store.density === 'compact' ? '紧凑密度（点击切回舒适）' : '舒适密度（点击切到紧凑）'" placement="bottom">
          <button class="iconbtn density" :class="{ 'is-on': store.density === 'compact' }" :aria-label="store.density === 'compact' ? '切换为舒适密度' : '切换为紧凑密度'" :aria-pressed="store.density === 'compact'" @click="toggleDensity"><span class="density-glyph"></span></button>
        </el-tooltip>
        <el-dropdown trigger="click" @command="onCommand">
          <span class="user"><span class="avatar">王</span><span class="user-name">王小明 · {{ roleInfo.label }}</span><Down class="i-icon--sm i-icon--muted" /></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item v-for="(r, k) in ROLES" :key="k" :command="`role:${k}`" :disabled="k === store.role">切换为{{ r.label }}（测试）</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content"><router-view /></main>
    </div>
  </div>
</template>

<style scoped>
.menu-label { flex: 1; }
/* 未读计数：贴在图标右上角、不越出按钮；底色用 action.danger（亮暗都是深红，白字 5.2:1），不用 status.error（暗色下变浅红，白字只有 3:1） */
.unread { position: absolute; top: 0; right: 0; transform: translate(25%, -15%); min-width: 16px; height: 16px; padding: 0 4px; border-radius: var(--radius-full); background: var(--color-action-danger); color: var(--color-text-on-danger); font-size: var(--text-caption-size); line-height: 16px; font-weight: var(--text-weight-strong); text-align: center; pointer-events: none; }
.user { display: inline-flex; align-items: center; gap: var(--spacing-2); cursor: pointer; padding: var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-1); border-radius: var(--radius-md); }
.user:hover { background: var(--color-bg-hover); }
.user-name { font-size: var(--text-body-sm-size); color: var(--color-text-primary); }
.density-glyph { display: block; width: var(--icon-size-md); height: var(--icon-size-md); border-radius: var(--radius-sm); background: repeating-linear-gradient(to bottom, currentColor 0 2px, transparent 2px 5px); opacity: var(--opacity-on-primary-muted); }
</style>
