<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, Download, Close, Refresh } from '@icon-park/vue-next'
import TableSkeleton from '@wycm9527/morganite/vue/TableSkeleton.vue'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { can, needPerm, demo } from '../store'
import { orders, tone, yen } from '../mock/data'

const router = useRouter()
// ?state=loading | empty | error；?preset=1 预置筛选条件与两行勾选（对照效果预览的交易记录页）
const state = ref(demo('state') || 'ready')
const preset = demo('preset') === '1'

const STATUSES = ['待付款', '待发货', '已发货', '已完成', '已关闭', '物流异常']
const CHANNELS = ['小程序', 'App', '天猫', '抖音']
const blank = () => ({ keyword: '', channel: '', status: '', range: null })
const draft = reactive(preset ? { ...blank(), channel: '小程序', status: '待发货' } : blank())
const applied = ref({ ...draft })
const quick = ref('')

const source = computed(() => (state.value === 'empty' ? [] : orders))
const counts = computed(() => Object.fromEntries(['待发货', '物流异常', '待付款'].map((s) => [s, source.value.filter((o) => o.status === s).length])))
const rows = computed(() => {
  const f = applied.value
  return source.value.filter((o) =>
    (!f.keyword || o.id.includes(f.keyword) || o.customer.includes(f.keyword) || o.items.some((i) => i.name.includes(f.keyword))) &&
    (!f.channel || o.channel === f.channel) &&
    (!(quick.value || f.status) || o.status === (quick.value || f.status)) &&
    (!f.range || (o.time.slice(0, 10) >= f.range[0] && o.time.slice(0, 10) <= f.range[1])))
})
const chips = computed(() => {
  const f = applied.value
  return [
    f.keyword && { key: 'keyword', label: `关键词：${f.keyword}` },
    f.channel && { key: 'channel', label: `渠道：${f.channel}` },
    f.status && { key: 'status', label: `状态：${f.status}` },
    f.range && { key: 'range', label: `下单：${f.range[0]} ~ ${f.range[1]}` }
  ].filter(Boolean)
})
function search() { applied.value = { ...draft }; page.value = 1 }
function reset() { Object.assign(draft, blank()); quick.value = ''; search() }
function removeChip(key) { draft[key] = key === 'range' ? null : ''; search() }

const page = ref(1)
const size = ref(10)
const paged = computed(() => rows.value.slice((page.value - 1) * size.value, page.value * size.value))

const tableRef = ref()
const selected = ref([])
onMounted(async () => {
  if (!preset) return
  await nextTick()
  paged.value.slice(0, 2).forEach((r) => tableRef.value?.toggleRowSelection(r, true))
})

const canShip = (o) => o.status === '待发货' || o.status === '物流异常'
const canClose = (o) => o.status === '待付款' || o.status === '待发货'
function closeOrder(o) {
  confirmDanger('关闭后客户将无法继续支付，占用的库存会立即释放；已付款订单需要先发起退款。此操作不能撤销。', `关闭订单 ${o.id}？`, { confirmButtonText: '确认关闭', cancelButtonText: '再想想' })
    .then(() => ElMessage.success(`订单 ${o.id} 已关闭`)).catch(() => {})
}
function batchClose() {
  confirmDanger(`将关闭所选的 ${selected.value.length} 个订单，此操作不能撤销。`, '批量关闭订单', { confirmButtonText: '确认关闭', cancelButtonText: '再想想' })
    .then(() => { ElMessage.success(`已关闭 ${selected.value.length} 个订单`); tableRef.value?.clearSelection() }).catch(() => {})
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>订单管理</h1>
      <p>查询、筛选与批量处理近 90 天的订单，点订单号进入详情。</p>
    </div>
    <div class="actions">
      <el-tooltip :disabled="can('report.export')" :content="needPerm('report.export')">
        <span><el-button :icon="Download" :disabled="!can('report.export')" @click="ElMessage.success(`已按当前条件导出 ${rows.length} 条`)">导出</el-button></span>
      </el-tooltip>
    </div>
  </div>

  <div class="stat-strip" role="group" aria-label="按状态快速筛选">
    <button class="cell is-clickable" :class="{ 'is-active': !quick }" type="button" @click="quick = ''; page = 1">全部<span class="value">{{ source.length }}</span></button>
    <button v-for="(n, s) in counts" :key="s" class="cell is-clickable" :class="{ 'is-active': quick === s }" type="button" @click="quick = s; page = 1">{{ s }}<span class="value">{{ n }}</span></button>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="draft.keyword" class="w-search" placeholder="订单号 / 商品 / 客户" aria-label="关键词" clearable @keyup.enter="search"><template #prefix><Search /></template></el-input>
        <el-select v-model="draft.channel" class="w-select" placeholder="全部渠道" aria-label="渠道" clearable><el-option v-for="c in CHANNELS" :key="c" :label="c" :value="c" /></el-select>
        <el-select v-model="draft.status" class="w-select" placeholder="全部状态" aria-label="订单状态" clearable><el-option v-for="s in STATUSES" :key="s" :label="s" :value="s" /></el-select>
        <el-date-picker v-model="draft.range" class="w-date" type="daterange" value-format="YYYY-MM-DD" start-placeholder="下单开始" end-placeholder="下单结束" aria-label="下单日期" />
      </div>
      <div class="acts">
        <el-button text @click="reset">重置</el-button>
        <el-button :icon="Filter" @click="search">查询</el-button>
      </div>
    </div>

    <div v-if="chips.length" class="chips" aria-label="已选条件">
      <span v-for="c in chips" :key="c.key" class="chip">{{ c.label }}<button class="x" type="button" :aria-label="`移除条件 ${c.label}`" @click="removeChip(c.key)"><Close class="i-icon--sm" /></button></span>
      <button class="link" type="button" @click="reset">清除全部</button>
    </div>

    <div v-if="selected.length" class="batch">
      <span>已选 <b class="num">{{ selected.length }}</b> 项</span>
      <div class="right">
        <span :title="can('order.ship') ? '' : needPerm('order.ship')"><button class="act" type="button" :disabled="!can('order.ship')" @click="ElMessage.success(`已为 ${selected.length} 个订单生成发货单`)">批量发货</button></span>
        <button class="act" type="button" @click="ElMessage.success('已导出所选订单')">导出所选</button>
        <span :title="can('order.close') ? '' : needPerm('order.close')"><button class="act danger" type="button" :disabled="!can('order.close')" @click="batchClose">关闭订单</button></span>
      </div>
    </div>

    <TableSkeleton v-if="state === 'loading'" :rows="8" :cols="[48, 170, 240, 120, 80, 130, 110, 90, 140]" />
    <div v-else-if="state === 'error'" class="error-box" role="alert"><Close class="i-icon--md" />订单列表加载失败：网关超时（504），已自动重试 2 次。<el-button size="small" :icon="Refresh" @click="state = 'ready'">重试</el-button></div>
    <div v-else-if="!rows.length" class="empty">
      <div class="illu" />
      <b>{{ source.length ? '没有符合条件的订单' : '还没有订单' }}</b>
      <span>{{ source.length ? '换个关键词，或清除部分筛选条件再试' : '店铺上线后，新订单会出现在这里' }}</span>
      <el-button v-if="source.length" @click="reset">清除筛选</el-button>
    </div>
    <template v-else>
      <el-table ref="tableRef" :data="paged" row-key="id" @selection-change="(v) => (selected = v)">
        <el-table-column type="selection" width="48" fixed="left" />
        <el-table-column label="订单号" width="170" fixed="left"><template #default="{ row }"><router-link class="link mono" :to="`/orders/${row.id}`">{{ row.id }}</router-link></template></el-table-column>
        <el-table-column label="商品" min-width="240">
          <template #default="{ row }"><router-link class="title-link" :to="`/orders/${row.id}`">{{ row.items[0].name }}{{ row.items.length > 1 ? ` 等 ${row.items.length} 件` : '' }}</router-link><span class="sub">{{ row.items[0].material }} · {{ row.pay }}</span></template>
        </el-table-column>
        <el-table-column label="客户" width="120"><template #default="{ row }">{{ row.customer }}<span class="sub num">{{ row.phone }}</span></template></el-table-column>
        <el-table-column label="渠道" width="80"><template #default="{ row }"><span class="tag">{{ row.channel }}</span></template></el-table-column>
        <el-table-column prop="time" label="下单时间" width="130" class-name="num" />
        <el-table-column label="实付" width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.amount) }}</template></el-table-column>
        <el-table-column label="状态" width="96"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="act-group">
              <router-link class="act" :to="`/orders/${row.id}`">详情</router-link>
              <span v-if="canShip(row)" :title="can('order.ship') ? '' : needPerm('order.ship')"><button class="act" type="button" :disabled="!can('order.ship')" @click="router.push(`/orders/${row.id}?ship=1`)">发货</button></span>
              <span v-else-if="canClose(row)" :title="can('order.close') ? '' : needPerm('order.close')"><button class="act danger" type="button" :disabled="!can('order.close')" @click="closeOrder(row)">关闭</button></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination v-model:current-page="page" v-model:page-size="size" background layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50]" :total="rows.length" />
      </div>
    </template>
  </el-card>
</template>

