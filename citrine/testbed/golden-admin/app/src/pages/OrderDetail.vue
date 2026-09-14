<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { Printer } from '@icon-park/vue-next'
import { orders, riders, tone, yen } from '../mock/data'
import { can } from '../store'

const route = useRoute()
const order = computed(() => orders.find((o) => o.id === route.params.id) || orders[0])
const stepIndex = computed(() => ({ '草稿': 0, '待接单': 1, '配送中': 2, '已完成': 4, '已取消': 1 }[order.value.status] ?? 1))
const drawer = ref(route.query.reassign === '1')
const picked = ref(riders[1].id)
const nearby = riders.filter((r) => r.status !== '离线').slice(0, 6)
const tab = ref('items')

function confirmReassign() {
  const r = riders.find((x) => x.id === picked.value)
  order.value.rider = r.name; drawer.value = false
  ElMessage.success(`已改派给 ${r.name}`)
}
function doPrint() { window.print() }
function cancel() {
  confirmBox('已派单的订单会通知骑手返回，退款将在 1–3 个工作日内原路返回。', `取消订单 ${order.value.id}？`, { confirmButtonText: '确认取消', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger' })
    .then(() => { order.value.status = '已取消'; ElMessage.success('订单已取消') }).catch(() => {})
}
const timeline = [
  { text: '骑手已取餐，正在配送', time: '14:20 · 李明', type: 'primary' },
  { text: '商户接单，预计 15 分钟出餐', time: '14:05 · 川味小馆', tone: 'success' },
  { text: '用户修改了收货地址', time: '14:03 · 用户', tone: 'warning' },
  { text: '订单创建，在线支付成功', time: '14:02 · 系统', tone: 'info' }
]
</script>

<template>
  <div class="page-head">
    <div><h1>订单 <span class="mono">{{ order.id }}</span> <span class="badge" :class="tone(order.status)">{{ order.status }}</span></h1><p>{{ order.merchant }} · {{ order.city }} · 下单于 <span class="num">{{ order.time }}</span></p></div>
    <div class="actions">
      <el-button @click="doPrint"><Printer class="i-icon--sm" />打印</el-button>
      <el-button v-if="can('order.reassign')" @click="drawer = true">改派骑手</el-button>
      <el-tooltip :disabled="can('order.cancel')" content="需要「取消订单」权限"><span><el-button type="danger" :disabled="!can('order.cancel') || order.status === '已取消'" @click="cancel">取消订单</el-button></span></el-tooltip>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="steps"><el-steps :active="stepIndex" finish-status="finish" :process-status="order.status === '已取消' ? 'error' : 'process'" align-center><el-step title="已下单" description="14:02" /><el-step :title="order.status === '已取消' ? '已取消' : '商户接单'" :description="order.status === '已取消' ? '14:59 · 用户取消' : '14:05'" /><el-step title="配送中" description="预计 14:35" /><el-step title="已送达" /></el-steps></div>
    <div class="two">
      <el-descriptions :column="2" border size="default" label-width="112">
        <el-descriptions-item label="商户">{{ order.merchant }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ order.city }} · 朝阳</el-descriptions-item>
        <el-descriptions-item label="金额"><span class="num">{{ yen(order.amount) }}</span></el-descriptions-item>
        <el-descriptions-item label="较上单"><span class="num up">▲ 12.4%</span></el-descriptions-item>
        <el-descriptions-item label="骑手">{{ order.rider || '—' }} <span v-if="order.rider" class="sub-inline">· 138****2211</span></el-descriptions-item>
        <el-descriptions-item label="预计送达"><span class="num">14:35</span></el-descriptions-item>
        <el-descriptions-item label="用户备注" :span="2">不要辣，放门口即可，谢谢。这是一条比较长的备注，用来看多行时描述列表的对齐与行高是否舒服。</el-descriptions-item>
      </el-descriptions>
      <el-timeline>
        <el-timeline-item v-for="t in timeline" :key="t.text" :type="t.type" :color="t.tone ? `var(--color-status-${t.tone})` : undefined" :timestamp="t.time">{{ t.text }}</el-timeline-item>
      </el-timeline>
    </div>
    <el-tabs v-model="tab" class="tabs">
      <el-tab-pane label="商品明细" name="items">
        <el-table :data="order.items.map(([name, qty, price]) => ({ name, qty, price }))" size="default" style="width: 100%">
          <el-table-column prop="name" label="商品" min-width="240" /><el-table-column prop="qty" label="数量" width="100" align="right" />
          <el-table-column label="单价" width="140" align="right"><template #default="{ row }"><span class="num">{{ yen(row.price) }}</span></template></el-table-column>
          <el-table-column label="小计" width="140" align="right"><template #default="{ row }"><span class="num">{{ yen(row.price * row.qty) }}</span></template></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="支付信息" name="pay">
        <el-descriptions :column="3" class="pad"><el-descriptions-item label="支付方式">微信支付</el-descriptions-item><el-descriptions-item label="支付时间"><span class="num">2026-09-08 14:02:11</span></el-descriptions-item><el-descriptions-item label="流水号"><span class="mono">4200002190202609081234567890</span></el-descriptions-item></el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="log"><div class="pad muted">暂无人工操作记录。</div></el-tab-pane>
    </el-tabs>
  </el-card>

  <el-drawer v-model="drawer" title="改派骑手" :size="'var(--layout-drawer-width)'" class="reassign">
    <p class="hint">附近 {{ nearby.length }} 位骑手，系统已按距离与评分排序；忙碌骑手接单后会顺路配送。</p>
    <el-radio-group v-model="picked" class="riders">
      <label v-for="r in nearby" :key="r.id" class="rider" :class="{ on: picked === r.id }">
        <el-radio :value="r.id"><span class="rname">{{ r.name }}</span></el-radio>
        <span class="rmeta num">{{ r.distance }} km · 评分 {{ r.rating }} · 当前 {{ r.current }} 单</span>
        <span class="status" :class="tone(r.status)">{{ r.status }}</span>
      </label>
    </el-radio-group>
    <template #footer><el-button @click="drawer = false">取消</el-button><el-button type="primary" @click="confirmReassign">确认改派</el-button></template>
  </el-drawer>
</template>

<style scoped>
.page-head h1 .badge { vertical-align: middle; margin-left: var(--spacing-2); }
.steps { padding: var(--space-card) var(--space-card) var(--spacing-2); }
.two { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-gutter); padding: var(--spacing-3) var(--space-card) var(--spacing-4); align-items: start; }
.sub-inline { color: var(--color-text-muted); }
.tabs { padding: 0 var(--space-card) var(--spacing-3); }
.pad { padding: var(--spacing-3) 0; }
.muted { color: var(--color-text-muted); font-size: var(--text-body-sm-size); }
.hint { margin: 0 0 var(--spacing-4); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.riders { display: flex; flex-direction: column; gap: var(--spacing-2); width: 100%; }
.rider { display: grid; grid-template-columns: 1fr auto; grid-template-areas: "radio status" "meta status"; align-items: center; gap: var(--spacing-1) var(--spacing-3); padding: var(--spacing-2-5) var(--spacing-3); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); cursor: pointer; width: 100%; }
.rider > .el-radio { grid-area: radio; margin: 0; height: auto; }
.rider:hover { background: var(--color-bg-hover); }
.rider.on { border-color: var(--color-border-focus); background: var(--color-bg-selected-subtle); }
.rname { font-weight: var(--text-weight-label); }
.rmeta { grid-area: meta; color: var(--color-text-muted); font-size: var(--text-small-size); padding-left: var(--spacing-6); }
.rider .status { grid-area: status; }
</style>
