<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, ApplicationTwo, Search, MenuFold, MenuUnfold, HamburgerButton } from '@icon-park/vue-next'

const route = useRoute()
const router = useRouter()
// 三端（layout.breakpoint.narrow / mobile 的字面镜像 992 / 768）：窄屏侧栏默认折叠；手机侧栏是离屏抽屉，汉堡开、遮罩 / 换页关
const mqNarrow = matchMedia('(max-width: 992px)')
const mqMobile = matchMedia('(max-width: 768px)')
const collapsed = ref(mqNarrow.matches)
const isMobile = ref(mqMobile.matches)
const navOpen = ref(false)
const onNarrow = (e) => { collapsed.value = e.matches }
const onMobile = (e) => { isMobile.value = e.matches; navOpen.value = false }
mqNarrow.addEventListener('change', onNarrow)
mqMobile.addEventListener('change', onMobile)
onBeforeUnmount(() => { mqNarrow.removeEventListener('change', onNarrow); mqMobile.removeEventListener('change', onMobile) })
router.afterEach(() => { navOpen.value = false })

const nav = [
  { group: '概览', items: [{ to: '/', label: '工作台', icon: Home }] },
  { group: '实测', items: [{ to: '/kitchen', label: '组件走查', icon: ApplicationTwo }] }
]
const title = computed(() => route.meta.title)
</script>

<template>
  <div class="app" :class="{ 'is-collapsed': collapsed, 'is-nav-open': navOpen }">
    <aside class="sidebar">
      <div class="app-brand"><span class="logo">M</span><span>玫瑰金后台</span></div>
      <nav class="nav" aria-label="主导航">
        <template v-for="g in nav" :key="g.group">
          <div class="nav-group">{{ g.group }}</div>
          <router-link v-for="i in g.items" :key="i.to" :to="i.to" :class="{ active: route.path === i.to }" :aria-label="i.label">
            <component :is="i.icon" class="i-icon--md" /><span class="nav-label">{{ i.label }}</span>
          </router-link>
        </template>
      </nav>
      <div class="sidebar-foot">{{ collapsed && !isMobile ? '0.1' : 'Morganite 0.1 · 实测' }}</div>
    </aside>

    <button v-if="navOpen" class="sidebar-mask" aria-label="关闭菜单" @click="navOpen = false" />

    <div class="main">
      <header class="topbar">
        <button class="iconbtn menu-btn" type="button" aria-label="打开菜单" @click="navOpen = true"><HamburgerButton class="i-icon--lg" /></button>
        <button class="iconbtn collapse-btn" type="button" :aria-label="collapsed ? '展开菜单' : '折叠菜单'" @click="collapsed = !collapsed">
          <component :is="collapsed ? MenuUnfold : MenuFold" class="i-icon--lg" />
        </button>
        <el-breadcrumb separator="/"><el-breadcrumb-item>实测</el-breadcrumb-item><el-breadcrumb-item>{{ title }}</el-breadcrumb-item></el-breadcrumb>
        <el-input class="search" placeholder="搜索资产、交易、报表…" :prefix-icon="Search" aria-label="全局搜索" />
      </header>
      <main class="content"><router-view /></main>
    </div>
  </div>
</template>
