<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ApplicationTwo, Search } from '@icon-park/vue-next'

const route = useRoute()
const nav = [
  { group: '概览', items: [{ to: '/', label: '工作台', icon: Home }] },
  { group: '实测', items: [{ to: '/kitchen', label: '组件走查', icon: ApplicationTwo }] }
]
const title = computed(() => route.meta.title)
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <div class="app-brand"><span class="logo">M</span>玫瑰金后台</div>
      <nav class="nav" aria-label="主导航">
        <template v-for="g in nav" :key="g.group">
          <div class="nav-group">{{ g.group }}</div>
          <router-link v-for="i in g.items" :key="i.to" :to="i.to" :class="{ active: route.path === i.to }">
            <component :is="i.icon" class="i-icon--md" />{{ i.label }}
          </router-link>
        </template>
      </nav>
      <div class="sidebar-foot">Morganite 0.1.0 · 实测</div>
    </aside>
    <div class="main">
      <header class="topbar">
        <el-breadcrumb separator="/"><el-breadcrumb-item>实测</el-breadcrumb-item><el-breadcrumb-item>{{ title }}</el-breadcrumb-item></el-breadcrumb>
        <el-input class="search" placeholder="搜索资产、交易、报表…" :prefix-icon="Search" />
      </header>
      <main class="content"><router-view /></main>
    </div>
  </div>
</template>
