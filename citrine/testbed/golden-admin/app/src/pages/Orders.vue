<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Export, Close, Refresh, Order as OrderIcon, MoreOne } from '@icon-park/vue-next'
import { orders, tone, yen } from '../mock/data'
import { can } from '../store'

const router = useRouter()
import TableSkeleton from '../components/TableSkeleton.vue'
const q = new URLSearchParams(location.search)
// 演示状态：normal / loading / empty / error（PRD §4.3 四态在此页完整实现）
const state = ref(['loading', 'empty', 'error'].includes(q.get('state')) ? q.get('state') : 'normal')
const filters = reactive({ keyword: '', status: 'all', city: 'all', range: ['2026-09-01', '2026-09-08'], mine: 'all' })
const chips = computed(() => [
  !isAll(filters.status) && { key: 'status', label: `状态：${filters.status}` },
  !isAll(filters.city) && { key: 'city', label: `城市：${filters.city}` },
  filters.range?.length === 2 && { key: 'range', label: `下单时间：${filters.range[0]} ~ ${filters.range[1]}` }
].filter(Boolean))
function clearChip(key) { if (key === 'range') filters.range = []; else filters[key] = '' }
function reset() { filters.keyword = ''; filters.status = 'all'; filters.city = 'all'; filters.range = []; filters.mine = 'all' }
const isAll = (v) => !v || v === 'all'

const page = ref(1), size = ref(20)
const filtered = computed(() => state.value === 'empty' ? [] : orders.filter((o) => (isAll(filters.status) || o.status === filters.status) && (isAll(filters.city) || o.city === filters.city) && (!filters.keyword || o.id.includes(filters.keyword) || o.merchant.includes(filters.keyword))))
const rows = computed(() => filtered.value.slice((page.value - 1) * size.value, page.value * size.value))
const selected = ref([])
const tableRef = ref()
const preselect = (row) => rows.value.indexOf(row) < 3 && !q.get('state') // 默认选中前三行，方便截批量条
function onReady() { setTimeout(() => rows.value.filter(preselect).forEach((r) => tableRef.value?.toggleRowSelection(r, true)), 150) }

function cancelOrder(row) {
  ElMessageBox.confirm(`已派单的订单会通知骑手返回，退款将在 1–3 个工作日内原路返回。`, `取消订单 ${row.id}？`, { confirmButtonText: '确认取消', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger' })
    .then(() => { row.status = '已取消'; ElMessage.success('订单已取消') }).catch(() => {})
}
function batchCancel() {
  ElMessageBox.confirm(`将取消 ${selected.value.length} 个订单，此操作不可撤销。`, '批量取消', { confirmButtonText: '确认取消', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger' })
    .then(() => { selected.value.forEach((r) => (r.status = '已取消')); ElMessage.success(`已取消 ${selected.value.length} 个订单`); tableRef.value.clearSelection() }).catch(() => {})
}
const rowClass = ({ row }) => (selected.value.includes(row) ? 'is-selected' : '')
</script>

<template>
  <div class="page-head">
    <div><h1>订单管理</h1><p>共 <b class="num">{{ filtered.length }}</b> 条 · 今日新增 <b class="num">1,286</b></p></div>
    <div class="actions">
      <el-radio-group v-model="state" size="small" class="no-print"><el-radio-button value="normal">正常</el-radio-button><el-radio-button value="loading">加载中</el-radio-button><el-radio-button value="empty">空</el-radio-button><el-radio-button value="error">出错</el-radio-button></el-radio-group>
      <el-button><Export class="i-icon--sm" />导出</el-button>
      <el-button type="primary"><Plus class="i-icon--sm" />新建订单</el-button>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="订单号 / 商户 / 手机号" aria-label="搜索订单号、商户或手机号" clearable style="width: 220px" />
        <el-select v-model="filters.status" aria-label="订单状态" style="width: 140px"><el-option label="全部状态" value="all" /><el-option v-for="s in ['待接单', '配送中', '已完成', '已取消', '草稿']" :key="s" :label="s" :value="s" /></el-select>
        <el-select v-model="filters.city" aria-label="城市" style="width: 140px"><el-option label="全部城市" value="all" /><el-option v-for="c in ['北京', '上海', '广州', '深圳', '杭州', '成都']" :key="c" :label="c" :value="c" /></el-select>
        <el-date-picker v-model="filters.range" type="daterange" range-separator="→" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 260px" />
      </div>
      <div class="acts">
        <el-radio-group v-model="filters.mine"><el-radio-button value="all">全部</el-radio-button><el-radio-button value="mine">我负责的</el-radio-button><el-radio-button value="star">已收藏</el-radio-button></el-radio-group>
        <el-button type="primary">查询</el-button><el-button text @click="reset">重置</el-button>
      </div>
    </div>
    <div v-if="chips.length" class="chips">
      <span v-for="c in chips" :key="c.key" class="chip">{{ c.label }}<span class="x" @click="clearChip(c.key)"><Close class="i-icon--xs" /></span></span>
    </div>

    <div v-if="selected.length && state === 'normal'" class="batch">
      已选 <b class="num">{{ selected.length }}</b> 项<a class="link" @click="tableRef.clearSelection()">取消选择</a>
      <div class="right">
        <el-button size="small" :disabled="!can('order.reassign')">批量改派</el-button>
        <el-button size="small">导出所选</el-button>
        <el-tooltip :disabled="can('order.cancel')" content="需要「取消订单」权限"><span><el-button size="small" type="danger" :disabled="!can('order.cancel')" @click="batchCancel">批量取消</el-button></span></el-tooltip>
      </div>
    </div>

    <TableSkeleton v-if="state === 'loading'" :rows="8" :cols="[48, 200, 190, 90, 130, 170, 110, 100]" />
    <div v-else-if="state === 'error'" class="error-box"><Close class="i-icon--md" />订单列表加载失败：网关超时（504）。<el-button size="small" @click="state = 'normal'"><Refresh class="i-icon--sm" />重试</el-button></div>
    <div v-else-if="!rows.length" class="empty"><div class="illu"><OrderIcon class="i-icon--2xl" theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" /></div><b>还没有符合条件的订单</b><span>试试放宽筛选条件，或 <a class="link" @click="reset(); state = 'normal'">清空筛选</a></span></div>

    <template v-else>
      <el-table ref="tableRef" :data="rows" :row-class-name="rowClass" style="width: 100%" @selection-change="(v) => (selected = v)" @vue:mounted="onReady">
        <el-table-column type="selection" width="48" fixed="left" />
        <el-table-column label="订单号" min-width="200" fixed="left"><template #default="{ row }"><router-link class="mono link" :to="`/orders/${row.id}`">{{ row.id }}</router-link><span class="sub">{{ row.time.slice(11) }} · {{ row.rider ? `骑手 ${row.rider}` : row.status }}</span></template></el-table-column>
        <el-table-column prop="merchant" label="商户" min-width="190" />
        <el-table-column prop="city" label="城市" width="90" />
        <el-table-column label="金额" width="130" align="right" sortable :sort-method="(a, b) => a.amount - b.amount"><template #default="{ row }"><span class="num">{{ yen(row.amount) }}</span></template></el-table-column>
        <el-table-column label="下单时间" width="170" sortable prop="time"><template #default="{ row }"><span class="num">{{ row.time }}</span></template></el-table-column>
        <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="骑手" width="100"><template #default="{ row }">{{ row.rider || '—' }}</template></el-table-column>
        <el-table-column label="配送时长" width="110"><template #default="{ row }"><span class="num">{{ row.duration ? `${row.duration} min` : '—' }}</span></template></el-table-column>
        <el-table-column label="评分" width="80"><template #default="{ row }"><span class="num">{{ row.rating || '—' }}</span></template></el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <router-link class="link" :to="`/orders/${row.id}`">详情</router-link>
            <template v-if="can('order.reassign')"> · <a class="link" @click="router.push(`/orders/${row.id}?reassign=1`)">改派</a></template>
            <el-dropdown trigger="click" class="more" @command="(c) => c === 'cancel' && cancelOrder(row)">
              <a class="link more-link" role="button" aria-label="更多操作" tabindex="0"><MoreOne class="i-icon--sm" /></a>
              <template #dropdown><el-dropdown-menu><el-dropdown-item command="remind">催单</el-dropdown-item><el-dropdown-item command="cancel" :disabled="!can('order.cancel')" class="is-danger">取消订单</el-dropdown-item></el-dropdown-menu></template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" v-model:page-size="size" :total="filtered.length" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" background /></div>
    </template>
  </el-card>
</template>

<style scoped>
.more { margin-left: var(--spacing-1-5); vertical-align: middle; }
.more-link { text-decoration: none; font-style: normal; color: var(--color-icon-default); }
</style>
