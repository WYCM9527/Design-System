<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { confirmBox } from '@wycm9527/citrine/vue/confirm.js'
import { riders, orders, tone } from '../mock/data'
import { can } from '../store'

const q = new URLSearchParams(location.search)
const status = ref('')
const rows = computed(() => riders.filter((r) => !status.value || r.status === status.value))
const counts = computed(() => ({ 在线: riders.filter((r) => r.status === '在线').length, 忙碌: riders.filter((r) => r.status === '忙碌').length, 离线: riders.filter((r) => r.status === '离线').length }))
const pending = orders.filter((o) => o.status === '待接单').slice(0, 5)
const dispatch = reactive({ open: q.get('dialog') === '1', rider: riders[0], order: pending[0]?.id })
function openDispatch(r) { dispatch.rider = r; dispatch.order = pending[0]?.id; dispatch.open = true }
function confirmDispatch() {
  const o = orders.find((x) => x.id === dispatch.order); if (o) { o.status = '配送中'; o.rider = dispatch.rider.name }
  dispatch.rider.status = '忙碌'; dispatch.rider.current += 1; dispatch.open = false
  ElMessage.success(`已把 ${dispatch.order} 派给 ${dispatch.rider.name}`)
}
function forceOffline(r) {
  confirmBox(`${r.name} 当前有 ${r.current} 单在配送，强制下线后这些订单需要重新派单。`, `强制下线「${r.name}」？`, { confirmButtonText: '确认下线', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' })
    .then(() => { r.status = '离线'; ElMessage.success('已下线') }).catch(() => {})
}
const initials = (n) => n.slice(0, 1)
</script>

<template>
  <div class="page-head">
    <div><h1>骑手调度</h1><p>{{ riders.length }} 名骑手 · 在线率 <b class="num">{{ Math.round((counts['在线'] + counts['忙碌']) / riders.length * 100) }}%</b></p></div>
    <div class="actions"><el-radio-group v-model="status"><el-radio-button value="">全部</el-radio-button><el-radio-button value="在线">在线</el-radio-button><el-radio-button value="忙碌">忙碌</el-radio-button><el-radio-button value="离线">离线</el-radio-button></el-radio-group></div>
  </div>

  <div class="stat-strip" role="group" aria-label="按状态筛选">
    <button v-for="(n, k) in counts" :key="k" type="button" class="cell is-clickable" :class="{ 'is-active': status === k }" :aria-pressed="status === k" @click="status = status === k ? '' : k">
      <span class="dot" :class="tone(k)"></span>{{ k }}<span class="value">{{ n }}</span>
    </button>
  </div>

  <el-card class="flat" shadow="always">
    <el-table :data="rows" style="width: 100%">
      <el-table-column label="骑手" min-width="200"><template #default="{ row }"><span class="member"><span class="avatar sm">{{ initials(row.name) }}</span><span>{{ row.name }}<span class="sub mono">{{ row.id }}</span></span></span></template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="当前单量" width="110" align="right"><template #default="{ row }"><span class="num">{{ row.current }}</span></template></el-table-column>
      <el-table-column label="今日完成" width="110" align="right"><template #default="{ row }"><span class="num">{{ row.done }}</span></template></el-table-column>
      <el-table-column label="评分" width="90" align="right"><template #default="{ row }"><span class="num">{{ row.rating }}</span></template></el-table-column>
      <el-table-column label="最近活跃" width="120"><template #default="{ row }"><span class="num">{{ row.active }}</span></template></el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <a class="act">查看</a>
          <template v-if="can('order.reassign') && row.status !== '离线'"><a class="act" @click="openDispatch(row)">派单</a></template>
          <template v-if="can('order.reassign') && row.status !== '离线'"><a class="act danger" @click="forceOffline(row)">强制下线</a></template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="dispatch.open" title="派单" :width="'var(--layout-modal-width-sm)'">
    <p class="hint">给 <b>{{ dispatch.rider.name }}</b>（{{ dispatch.rider.distance }} km · 当前 {{ dispatch.rider.current }} 单）选择一个待接单订单。</p>
    <el-radio-group v-model="dispatch.order" class="orders">
      <label v-for="o in pending" :key="o.id" class="order" :class="{ on: dispatch.order === o.id }"><el-radio :value="o.id"><span class="mono">{{ o.id }}</span></el-radio><span class="ometa">{{ o.merchant }} · {{ o.city }}</span></label>
    </el-radio-group>
    <template #footer><el-button @click="dispatch.open = false">取消</el-button><el-button type="primary" @click="confirmDispatch">确认派单</el-button></template>
  </el-dialog>
</template>

<style scoped>
/* 指示灯语义：骑手在线状态允许用圆点（见 DESIGN.md 状态一节） */
.dot { width: 8px; height: 8px; border-radius: var(--radius-full); display: inline-block; }
.dot.success { background: var(--color-status-success); } .dot.warning { background: var(--color-status-warning); } .dot.neutral { background: var(--color-status-neutral); }
.member { display: inline-flex; align-items: center; gap: var(--spacing-2-5); }
.avatar.sm { width: var(--avatar-size-sm); height: var(--avatar-size-sm); font-size: var(--text-small-size); background: var(--color-bg-selected); color: var(--color-text-selected); cursor: default; }
.hint { margin: 0 0 var(--spacing-3); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.orders { display: flex; flex-direction: column; align-items: stretch; gap: var(--spacing-2); width: 100%; }   /* Element 的 radio-group 默认 align-items:center，纵向排列时会把选项卡挤成内容宽 */
.order { display: grid; grid-template-columns: 1fr; gap: var(--spacing-1); width: 100%; padding: var(--spacing-2-5) var(--spacing-3); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; }
.order:hover { background: var(--color-bg-hover); }
.order.on { border-color: var(--color-border-focus); background: var(--color-bg-selected-subtle); }
.order > .el-radio { margin: 0; height: auto; }
.ometa { color: var(--color-text-muted); font-size: var(--text-small-size); padding-left: var(--spacing-6); }
</style>
