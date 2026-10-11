<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Right } from '@icon-park/vue-next'
import { store, demo } from '../store'
import { notices, announcements } from '../mock/data'

const KINDS = [['all', '全部'], ['order', '订单'], ['audit', '审核'], ['system', '系统']]
const KIND_LABEL = { order: '订单', audit: '审核', system: '系统' }
const tab = ref('all')
const empty = demo('state') === 'empty'   // ?state=empty：没有任何消息
const read = reactive(Object.fromEntries(notices.map((n) => [n.id, !n.unread])))
const list = computed(() => (empty ? [] : notices.filter((n) => tab.value === 'all' || n.kind === tab.value)))
const unread = computed(() => notices.filter((n) => !read[n.id]).length)
const page = ref(1)
const paged = computed(() => list.value.slice((page.value - 1) * 8, page.value * 8))
function readAll() { notices.forEach((n) => { read[n.id] = true }); store.unread = 0; ElMessage.success('已全部标为已读') }
function open(n) { if (!read[n.id]) { read[n.id] = true; store.unread = Math.max(0, store.unread - 1) } }
</script>

<template>
  <div class="page-head">
    <div>
      <h1>消息中心</h1>
      <p>订单异常、待审核事项与系统通知；公告由运营中心发布。</p>
    </div>
    <div class="actions"><el-button :disabled="!unread || empty" @click="readAll">全部标为已读</el-button></div>
  </div>

  <el-card class="flat panel" shadow="always">
    <div class="card-head"><h2>公告</h2></div>
    <div class="card-body">
      <ul class="ann">
        <li v-for="a in announcements" :key="a.id"><span v-if="a.id === 'a1'" class="badge brand">置顶</span><router-link class="title-link" :to="`/notices/${a.id}`">{{ a.title }}</router-link><span class="sub">{{ a.author }} · <span class="num">{{ a.time }}</span></span></li>
      </ul>
    </div>
  </el-card>

  <el-card class="flat" shadow="always">
    <el-tabs v-model="tab" @tab-change="page = 1">
      <el-tab-pane v-for="[k, label] in KINDS" :key="k" :name="k">
        <template #label>{{ label }}<el-badge v-if="k === 'all' && unread && !empty" :value="unread" class="tab-badge" /></template>
      </el-tab-pane>
    </el-tabs>
    <div v-if="!list.length" class="empty"><div class="illu" /><b>没有消息</b><span>{{ empty ? '有新的订单异常或待审核事项时会通知你' : '这个分类下暂时没有消息' }}</span></div>
    <template v-else>
      <ul class="msgs">
        <li v-for="n in paged" :key="n.id" :class="{ 'is-unread': !read[n.id] }" @click="open(n)">
          <span class="dot" :aria-label="read[n.id] ? '已读' : '未读'" />
          <div class="msg-text">
            <div class="msg-title"><span class="tag">{{ KIND_LABEL[n.kind] }}</span><button class="title-link" type="button">{{ n.title }}</button></div>
            <span class="sub">{{ n.summary }}</span>
          </div>
          <span class="time num">{{ n.time }}</span>
        </li>
      </ul>
      <div class="pager"><el-pagination v-model:current-page="page" layout="total, prev, pager, next" :total="list.length" :page-size="8" /></div>
    </template>
  </el-card>
  <router-link class="go" to="/settings">通知设置<Right class="i-icon--sm" /></router-link>
</template>

<style scoped>
.ann { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--spacing-3); }
.ann li { display: flex; align-items: center; gap: var(--spacing-2-5); flex-wrap: wrap; }
.ann .sub { display: inline; margin-left: auto; }
.tab-badge { margin-left: var(--spacing-1-5); }
.msgs { list-style: none; margin: 0; padding: 0; }
.msgs li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--spacing-3); align-items: start; padding: var(--spacing-3-5) var(--space-card); border-bottom: var(--border-width-default) solid var(--color-border-default); cursor: pointer; }
.msgs li:hover { background: var(--color-bg-hover); }
.dot { width: var(--spacing-2); height: var(--spacing-2); margin-top: var(--spacing-2); border-radius: var(--radius-full); background: transparent; }
.is-unread .dot { background: var(--color-action-danger); }
.msg-title { display: flex; align-items: center; gap: var(--spacing-2); }
.is-unread .title-link { font-weight: var(--text-weight-strong); }
.msg-text .sub { margin-top: var(--spacing-1); }
.time { color: var(--color-text-muted); font-size: var(--text-small-size); white-space: nowrap; }
</style>
