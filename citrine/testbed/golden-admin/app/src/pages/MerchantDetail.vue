<script setup>
// 商户详情（DESIGN 页面骨架「详情页」：页头 → 描述列表卡 → 时间线 / 关联列表，次级详情用右侧抽屉）。
// 演示参数放在 # 之前（AGENTS.md 约定，不用 useRoute().query）：?state=disabled|empty|missing、?tab=quals|logs|settlement。
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Right, Down, Pic, Shop, Time } from '@icon-park/vue-next'
import StatCard from '../components/StatCard.vue'
import { merchants, merchantDetails, MERCHANT_STATE, merchantState, LOG_TYPE, QUAL_STATUS, SETTLEMENT_STATUS, URGE_REASONS, tone, yen } from '../mock/data'

const route = useRoute()
const router = useRouter()
const params = new URLSearchParams(location.search)
const demoState = params.get('state')
const isEmpty = demoState === 'empty'
const TABS = ['overview', 'quals', 'logs', 'settlement']
const wantedTab = params.get('tab') || route.query.tab
const tab = ref(TABS.includes(wantedTab) ? wantedTab : 'overview')

const id = computed(() => String(route.params.id))
const merchant = computed(() => (demoState === 'missing' ? null : merchants.find((m) => m.id === id.value) || null))
const detail = computed(() => (merchant.value ? merchantDetails[merchant.value.id] : null))
const stats = computed(() => detail.value.stats)
const count = (n) => n.toLocaleString('zh-CN')

// 商户状态在页内可变（停用 / 恢复），初值来自数据或 ?state=disabled；徽标、按钮文案、履约进度都从它推
const stateKey = ref(demoState === 'disabled' ? 'disabled' : merchant.value ? merchantState(merchant.value.status) : 'open')
const state = computed(() => MERCHANT_STATE[stateKey.value])
const isDisabled = computed(() => stateKey.value === 'disabled')

// 合同履约：只有"进行中"才是黄色进度；到期或商户停用都退为 data.inactive 灰（桥接约定类 is-muted）
const contract = computed(() => {
  const c = detail.value.contract
  const expired = c.fulfilled >= c.months
  const active = !expired && !isDisabled.value
  return { ...c, percent: Math.round((c.fulfilled / c.months) * 100), active, label: expired ? '已到期' : isDisabled.value ? '已暂停' : '进行中', tone: active ? 'success' : 'neutral' }
})

const recentOrders = computed(() => (isEmpty ? [] : detail.value.orders))
const canUrge = (o) => o.status === '待接单' || o.status === '配送中'

const logType = ref('all')
const logTypeOptions = [{ label: '全部', value: 'all' }, ...Object.entries(LOG_TYPE).map(([value, label]) => ({ label, value }))]
const logs = computed(() => {
  const all = isEmpty ? [] : detail.value.logs
  return logType.value === 'all' ? all : all.filter((l) => l.type === logType.value)
})
// 时间线节点按事件语义取状态色：完成 success、失败 / 驳回 error、告警 warning、其余 info
const NODE_TYPE = { success: 'success', error: 'danger', warning: 'warning', info: 'info' }

const settlements = computed(() => (isEmpty ? [] : detail.value.settlements))

const confirm = (message, title, options) => ElMessageBox.confirm(message, title, { cancelButtonText: '取消', type: 'warning', ...options }).then(() => true, () => false)

function edit() { router.push({ name: 'merchant-edit', params: { id: id.value } }) }
async function toggleStatus() {
  const name = merchant.value.name
  if (isDisabled.value) {
    if (!(await confirm(`恢复后「${name}」将重新在用户端展示并开始接单。`, '恢复营业', { confirmButtonText: '恢复营业' }))) return
    stateKey.value = 'open'
    ElMessage.success('商户已恢复营业')
  } else {
    if (!(await confirm(`停用后「${name}」将从用户端下线，进行中的订单不受影响。`, '停用商户', { confirmButtonText: '停用' }))) return
    stateKey.value = 'disabled'
    ElMessage.success('商户已停用')
  }
}
async function onMore(command) {
  if (command === 'export') ElMessage.success('资料导出已开始，完成后可在通知中心下载')
  if (command === 'copy') {
    try { await navigator.clipboard.writeText(id.value); ElMessage.success(`已复制商户 ID ${id.value}`) }
    catch { ElMessage.warning(`当前环境无法访问剪贴板，请手动复制：${id.value}`) }
  }
  if (command === 'delete') {
    if (!(await confirm(`删除后「${merchant.value.name}」的资料、资质与结算记录将不可恢复。`, '删除商户', { confirmButtonText: '删除', confirmButtonType: 'danger' }))) return
    ElMessage.success('商户已删除')
    router.replace('/merchants')
  }
}
function download(q) { ElMessage.success(`开始下载 ${q.file}`) }

// 催单抽屉：订单摘要 + 单选原因 + 提交
const urge = reactive({ open: false, order: null, reason: '' })
function openUrge(order) { urge.order = order; urge.reason = ''; urge.open = true }
function submitUrge() { urge.open = false; ElMessage.success(`已对订单 ${urge.order.id} 催单`) }

// 结算明细抽屉；申诉仅"有争议"可用
const settle = reactive({ open: false, row: null })
function openSettlement(row) { settle.row = row; settle.open = true }
async function appeal(row) {
  if (!(await confirm(`将对结算周期 ${row.period} 发起申诉，财务会在 3 个工作日内复核。`, '发起申诉', { confirmButtonText: '提交申诉' }))) return
  settle.open = false
  ElMessage.success('申诉已提交')
}
</script>

<template>
  <!-- 商户不存在：结果态，操作居中 -->
  <div v-if="!merchant" class="result">
    <div class="illu"><Shop class="illu-icon" /></div>
    <h3>商户不存在</h3>
    <p>找不到 ID 为 <span class="mono">{{ id }}</span> 的商户，它可能已被删除，或链接有误。</p>
    <div class="acts"><el-button type="primary" @click="router.push('/merchants')">返回商户列表</el-button></div>
  </div>

  <div v-else class="detail">
    <header class="page-head">
      <div>
        <div class="title"><h1>{{ merchant.name }}</h1><span class="status" :class="state.tone">{{ state.label }}</span></div>
        <p>{{ merchant.type }} · {{ merchant.city }} · {{ merchant.joined }} 入驻</p>
      </div>
      <div class="actions">
        <el-button type="primary" @click="edit">编辑资料</el-button>
        <el-button @click="toggleStatus">{{ isDisabled ? '恢复营业' : '停用商户' }}</el-button>
        <el-dropdown trigger="click" @command="onMore">
          <el-button class="more">更多<Down class="i-icon--sm" /></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export">导出资料</el-dropdown-item>
              <el-dropdown-item command="copy">复制商户 ID</el-dropdown-item>
              <el-dropdown-item command="delete" divided class="is-danger">删除商户</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 取消率"下降是好事"：箭头向下（up=false）但颜色为好（positive） -->
    <div class="stats">
      <StatCard label="近 30 天订单量" :value="count(stats.orders)" :delta="stats.ordersDelta" :up="stats.ordersUp" note="较上月" />
      <StatCard label="近 30 天 GMV" :value="yen(stats.gmv)" :delta="stats.gmvDelta" :up="stats.gmvUp" note="较上月" />
      <StatCard label="客单价" :value="yen(stats.avg)" :delta="stats.avgDelta" :up="stats.avgUp" note="较上月" />
      <StatCard label="取消率" :value="stats.cancelRate" :delta="stats.cancelDelta" :up="stats.cancelUp" :positive="!stats.cancelUp" note="较上月" />
    </div>

    <el-card class="flat">
      <el-tabs v-model="tab" class="tabs">
        <el-tab-pane label="概览" name="overview">
          <section class="sec">
            <div class="card-head"><h2>基本信息</h2></div>
            <div class="sec-body">
              <el-descriptions :column="2" border label-width="var(--layout-form-label-width)">
                <el-descriptions-item label="联系人">{{ merchant.contact }}</el-descriptions-item>
                <el-descriptions-item label="电话"><span class="num">{{ merchant.phone }}</span></el-descriptions-item>
                <el-descriptions-item label="地址">{{ detail.address }}</el-descriptions-item>
                <el-descriptions-item label="营业时间"><span class="num">{{ detail.hours }}</span></el-descriptions-item>
                <el-descriptions-item label="配送范围"><span class="num">{{ merchant.radius }} km</span></el-descriptions-item>
                <el-descriptions-item label="结算周期">{{ merchant.cycle }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>合同履约进度</h2><div class="right"><span class="status" :class="contract.tone">{{ contract.label }}</span></div></div>
            <div class="sec-body">
              <div class="contract-meta">
                <span class="contract-text num">已履约 {{ contract.fulfilled }} / {{ contract.months }} 个月</span>
                <span class="sub num">合同期 {{ contract.start }} ~ {{ contract.end }}</span>
              </div>
              <el-progress :percentage="contract.percent" :show-text="false" :class="{ 'is-muted': !contract.active }" :aria-label="`合同履约进度 ${contract.percent}%`" />
            </div>
          </section>

          <section class="sec">
            <div class="card-head"><h2>最近订单</h2><div class="right"><router-link to="/orders" class="go">查看全部<Right class="i-icon--sm" /></router-link></div></div>
            <el-table :data="recentOrders">
              <el-table-column label="订单号" min-width="180">
                <template #default="{ row }"><router-link :to="`/orders/${row.id}`" class="link mono">{{ row.id }}</router-link></template>
              </el-table-column>
              <el-table-column label="金额" width="140">
                <template #default="{ row }"><span class="num">{{ yen(row.amount) }}</span></template>
              </el-table-column>
              <el-table-column label="状态" width="110">
                <template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template>
              </el-table-column>
              <el-table-column label="时间" width="170">
                <template #default="{ row }"><span class="num">{{ row.time }}</span></template>
              </el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <router-link :to="`/orders/${row.id}`" class="act">查看</router-link>
                  <button v-if="canUrge(row)" type="button" class="act" @click="openUrge(row)">催单</button>
                </template>
              </el-table-column>
              <template #empty>
                <div class="empty"><b>暂无订单</b><span>该商户近 30 天还没有订单</span></div>
              </template>
            </el-table>
          </section>
        </el-tab-pane>

        <el-tab-pane label="资质" name="quals">
          <section class="sec">
            <div class="card-head"><h2>资质文件</h2></div>
            <div class="sec-body quals">
              <article v-for="q in detail.quals" :key="q.key" class="qual">
                <div class="thumb" :class="{ 'is-missing': !q.file }" aria-hidden="true"><Pic /></div>
                <div class="qual-body">
                  <div class="qual-title">{{ q.name }}<span class="status" :class="q.file ? QUAL_STATUS[q.status].tone : 'neutral'">{{ q.file ? QUAL_STATUS[q.status].label : '未上传' }}</span></div>
                  <template v-if="q.file">
                    <div class="qual-file">{{ q.file }}</div>
                    <span class="sub num">上传于 {{ q.uploadedAt }}</span>
                  </template>
                  <div v-else class="qual-file is-muted">商户尚未上传该资质</div>
                </div>
                <div class="qual-foot">
                  <button v-if="q.file" type="button" class="act" @click="download(q)">下载</button>
                  <span v-else class="dash">—</span>
                </div>
              </article>
            </div>
          </section>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <section class="sec">
            <div class="card-head"><h2>操作日志</h2><div class="right"><el-segmented v-model="logType" :options="logTypeOptions" aria-label="按类型筛选日志" /></div></div>
            <div v-if="logs.length" class="sec-body">
              <el-timeline>
                <el-timeline-item v-for="log in logs" :key="log.id" :timestamp="log.time" placement="top" :type="NODE_TYPE[log.tone]">
                  <div class="log-title"><b>{{ log.operator }}</b> {{ log.action }}<span class="log-type">{{ LOG_TYPE[log.type] }}</span></div>
                  <span class="sub">{{ log.note }}</span>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div v-else class="empty">
              <div class="illu"><Time class="illu-icon" /></div>
              <b>{{ logType === 'all' ? '暂无操作日志' : '没有符合条件的日志' }}</b>
              <span>{{ logType === 'all' ? '该商户还没有任何操作记录' : '换一个类型试试，或清除筛选查看全部' }}</span>
              <button v-if="logType !== 'all'" type="button" class="act" @click="logType = 'all'">清除筛选</button>
            </div>
          </section>
        </el-tab-pane>

        <el-tab-pane label="结算" name="settlement">
          <section class="sec">
            <div class="card-head"><h2>近 6 期结算</h2></div>
            <el-table :data="settlements">
              <el-table-column label="周期" min-width="220">
                <template #default="{ row }"><span class="num">{{ row.period }}</span></template>
              </el-table-column>
              <el-table-column label="订单数" width="120">
                <template #default="{ row }"><span class="num">{{ count(row.orders) }}</span></template>
              </el-table-column>
              <el-table-column label="金额" width="150">
                <template #default="{ row }"><span class="num">{{ yen(row.amount) }}</span></template>
              </el-table-column>
              <el-table-column label="状态" width="110">
                <template #default="{ row }"><span class="status" :class="SETTLEMENT_STATUS[row.status].tone">{{ SETTLEMENT_STATUS[row.status].label }}</span></template>
              </el-table-column>
              <el-table-column label="操作" width="190">
                <template #default="{ row }">
                  <button type="button" class="act" @click="openSettlement(row)">查看明细</button>
                  <button type="button" class="act" :disabled="row.status !== 'disputed'" @click="appeal(row)">申诉</button>
                </template>
              </el-table-column>
              <template #empty>
                <div class="empty"><b>暂无结算记录</b><span>该商户还没有进入结算周期</span></div>
              </template>
            </el-table>
          </section>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 催单抽屉：描述列表 + 单选原因，不放第二层弹窗 -->
    <el-drawer v-model="urge.open" title="催单" size="var(--layout-drawer-width)">
      <template v-if="urge.order">
        <h3 class="drawer-h">订单摘要</h3>
        <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
          <el-descriptions-item label="订单号"><router-link :to="`/orders/${urge.order.id}`" class="link mono">{{ urge.order.id }}</router-link></el-descriptions-item>
          <el-descriptions-item label="金额"><span class="num">{{ yen(urge.order.amount) }}</span></el-descriptions-item>
          <el-descriptions-item label="状态"><span class="status" :class="tone(urge.order.status)">{{ urge.order.status }}</span></el-descriptions-item>
          <el-descriptions-item label="下单时间"><span class="num">{{ urge.order.time }}</span></el-descriptions-item>
          <el-descriptions-item label="骑手">{{ urge.order.rider || '—' }}</el-descriptions-item>
        </el-descriptions>
        <h3 class="drawer-h">催单原因</h3>
        <el-radio-group v-model="urge.reason" class="reasons" aria-label="催单原因">
          <el-radio v-for="r in URGE_REASONS" :key="r" :value="r">{{ r }}</el-radio>
        </el-radio-group>
      </template>
      <template #footer>
        <el-button @click="urge.open = false">取消</el-button>
        <el-button type="primary" :disabled="!urge.reason" @click="submitUrge">提交催单</el-button>
      </template>
    </el-drawer>

    <!-- 结算明细抽屉 -->
    <el-drawer v-model="settle.open" title="结算明细" size="var(--layout-drawer-width)">
      <template v-if="settle.row">
        <h3 class="drawer-h">本期结算</h3>
        <el-descriptions :column="1" border label-width="var(--layout-form-label-width)">
          <el-descriptions-item label="结算周期"><span class="num">{{ settle.row.period }}</span></el-descriptions-item>
          <el-descriptions-item label="订单数"><span class="num">{{ count(settle.row.orders) }}</span></el-descriptions-item>
          <el-descriptions-item label="结算金额"><span class="num">{{ yen(settle.row.amount) }}</span></el-descriptions-item>
          <el-descriptions-item label="平台服务费"><span class="num">{{ yen(settle.row.fee) }}</span></el-descriptions-item>
          <el-descriptions-item label="实际到账"><span class="num">{{ yen(settle.row.amount - settle.row.fee) }}</span></el-descriptions-item>
          <el-descriptions-item label="状态"><span class="status" :class="SETTLEMENT_STATUS[settle.row.status].tone">{{ SETTLEMENT_STATUS[settle.row.status].label }}</span></el-descriptions-item>
          <el-descriptions-item label="打款时间"><span class="num">{{ settle.row.settledAt || '—' }}</span></el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="settle.open = false">关闭</el-button>
        <el-button v-if="settle.row && settle.row.status === 'disputed'" @click="appeal(settle.row)">发起申诉</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.detail { display: flex; flex-direction: column; gap: var(--space-stack); }
.title { display: flex; align-items: center; gap: var(--space-inline); margin-bottom: var(--spacing-1); }
.title h1 { margin: 0; }
.more .i-icon { margin-left: var(--spacing-1); }

/* 页签放在卡片内：页签头与卡片同一水平内边距；各分区自带标题条，分区之间用发丝线分隔 */
.tabs :deep(.el-tabs__header) { margin: 0; padding: 0 var(--space-card); }
.sec + .sec { border-top: var(--border-width-default) solid var(--color-border-default); }
.sec-body { padding: var(--space-card); }

.contract-meta { display: flex; align-items: baseline; gap: var(--spacing-3); margin-bottom: var(--spacing-3); }
.contract-text { font-weight: var(--text-weight-label); }

/* 资质项：卡片(lg) 内的次级容器用 md，缩略图占位再降一档 sm（圆角按容器层级递减） */
.quals { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-4); }
.qual { display: flex; flex-direction: column; gap: var(--spacing-3); padding: var(--spacing-4); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); }
.thumb { height: var(--illustration-size-md); border-radius: var(--radius-sm); background: var(--color-bg-subtle); border: var(--border-width-default) dashed var(--color-border-strong); display: grid; place-items: center; color: var(--color-icon-muted); }
.thumb .i-icon { font-size: var(--icon-size-2xl); }
.thumb.is-missing { opacity: var(--opacity-icon-placeholder); }
.qual-title { display: flex; align-items: center; gap: var(--space-inline); font-weight: var(--text-weight-label); }
.qual-file { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); word-break: break-all; }
.qual-file.is-muted { color: var(--color-text-muted); }
.qual-foot { margin-top: auto; }
.dash { color: var(--color-text-muted); }

.log-title { font-size: var(--text-body-sm-size); color: var(--color-text-primary); }
.log-title b { font-weight: var(--text-weight-label); }
.log-type { margin-left: var(--space-inline); color: var(--color-text-muted); font-size: var(--text-small-size); }

/* 抽屉内分组小标题：首个不加上外边距 */
.drawer-h { margin: var(--space-stack) 0 var(--spacing-3); font-size: var(--text-title-sm-size); font-weight: var(--text-weight-label); }
.drawer-h:first-child { margin-top: 0; }
.reasons { display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-2); }
.reasons :deep(.el-radio) { margin-right: 0; }

/* 操作胶囊用 <button> 承载不导航的动作：外观重置与禁用态由公共类 .act 承担（app.css），这里不再重复 */

.illu-icon { font-size: var(--icon-size-2xl); color: var(--color-icon-muted); }
</style>
