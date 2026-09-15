<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Config, Check, Order as OrderIcon, Right } from '@icon-park/vue-next'
import { notices, announcements, NOTICE_TYPE } from '../mock/data'
import { store } from '../store'

const tab = ref('all')
const list = computed(() => notices.filter((n) => tab.value === 'all' || n.type === tab.value))
const icons = { system: Config, audit: Check, ops: OrderIcon }
function readAll() { notices.forEach((n) => (n.unread = false)); store.unread = 0; ElMessage.success('已全部标为已读') }
function read(n) { if (n.unread) { n.unread = false; store.unread = Math.max(0, store.unread - 1) } }
</script>

<template>
  <div class="page-head">
    <div><h1>通知中心</h1><p><b class="num">{{ notices.filter((n) => n.unread).length }}</b> 条未读</p></div>
    <div class="actions"><el-button @click="readAll">全部标为已读</el-button></div>
  </div>

  <div class="grid">
    <el-card class="flat" shadow="always">
      <el-tabs v-model="tab" class="tabs">
        <el-tab-pane label="全部" name="all" /><el-tab-pane label="系统" name="system" /><el-tab-pane label="审核" name="audit" /><el-tab-pane label="运营" name="ops" />
      </el-tabs>
      <ul class="list">
        <li v-for="n in list" :key="n.id" :class="{ unread: n.unread }" @click="read(n)">
          <span class="type" :class="n.type"><component :is="icons[n.type]" class="i-icon--md" /></span>
          <span class="main"><span class="title"><i v-if="n.unread" class="unread-dot"></i>{{ n.title }}</span><span class="summary">{{ n.summary }}</span></span>
          <span class="meta"><span class="badge neutral">{{ NOTICE_TYPE[n.type] }}</span><span class="time num">{{ n.time }}</span></span>
        </li>
      </ul>
    </el-card>

    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>公告</h2></div>
      <ul class="ann">
        <li v-for="a in announcements" :key="a.id">
          <router-link :to="`/notices/${a.id}`" class="ann-title">{{ a.title }}</router-link>
          <span class="ann-meta"><span class="badge neutral">{{ a.tag }}</span>{{ a.author }} · <span class="num">{{ a.time.slice(0, 10) }}</span></span>
          <router-link :to="`/notices/${a.id}`" class="go" aria-label="查看公告"><Right class="i-icon--sm" /></router-link>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-stack); align-items: start; }
.tabs { padding: 0 var(--space-card); }
.tabs :deep(.el-tabs__header) { margin-bottom: 0; }
.list { list-style: none; margin: 0; padding: 0; }
.list li { display: grid; grid-template-columns: auto 1fr auto; gap: var(--spacing-3); align-items: center; padding: var(--spacing-3) var(--space-card); border-bottom: var(--border-width-default) solid var(--color-border-default); cursor: pointer; }
.list li:last-child { border-bottom: 0; }
.list li:hover { background: var(--color-bg-hover); }
.type { width: var(--avatar-size-md); height: var(--avatar-size-md); border-radius: var(--radius-md); display: grid; place-items: center; background: var(--color-bg-subtle); color: var(--color-icon-default); }
.type.audit { color: var(--color-status-success); background: var(--color-status-success-bg); }
.type.ops { color: var(--color-status-info); background: var(--color-status-info-bg); }
.main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.title { display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--text-body-size); color: var(--color-text-primary); }
.unread .title { font-weight: var(--text-weight-strong); }
.unread-dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--color-action-danger); flex: none; }  /* 未读 = 需要注意：与顶栏未读计数同用 action.danger；不用品牌黄（黄不表达强调，2.11.0 页面级黄色审计抓出） */
.summary { font-size: var(--text-small-size); color: var(--color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; align-items: center; gap: var(--spacing-3); }
.time { font-size: var(--text-small-size); color: var(--color-text-muted); white-space: nowrap; }
.ann { list-style: none; margin: 0; padding: 0; }
.ann li { display: grid; grid-template-columns: 1fr auto; gap: var(--spacing-1) var(--spacing-3); padding: var(--spacing-3-5) var(--space-card); border-bottom: var(--border-width-default) solid var(--color-border-default); align-items: center; }
.ann li:last-child { border-bottom: 0; }
.ann-title { color: var(--color-text-primary); font-weight: var(--text-weight-label); }
.ann-title:hover { color: var(--color-text-link-hover); text-decoration: var(--text-link-decoration); }
.ann-meta { grid-column: 1; display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--text-small-size); color: var(--color-text-muted); }
.go { grid-column: 2; grid-row: 1 / span 2; color: var(--color-icon-muted); display: inline-grid; place-items: center; align-self: center; min-width: var(--control-hit-min); min-height: var(--control-hit-min); }
</style>
