<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Copy, Edit, Down, Printer, Return, Delete, Truck } from '@icon-park/vue-next'
import PageHeader from '@wycm9527/morganite/vue/PageHeader.vue'
import ConfirmBar from '@wycm9527/morganite/vue/ConfirmBar.vue'
import { useInlineConfirm } from '@wycm9527/morganite/vue/inlineConfirm.js'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { can, needPerm, demo } from '../store'
import { orders, tone, yen } from '../mock/data'

const route = useRoute()
const router = useRouter()
const found = orders.find((o) => o.id === route.params.id)
// ?state=closed：已关闭订单（步骤条出错态、操作收起）
const o = found && (demo('state') === 'closed' ? { ...found, status: '已关闭' } : found)
const STEP_OF = { 待付款: 0, 待发货: 1, 已发货: 2, 物流异常: 2, 已完成: 4, 已关闭: 1 }
const steps = computed(() => [
  { title: '提交订单', desc: o.time },
  { title: '付款成功', desc: o.status === '待付款' ? '等待付款，30 分钟后自动关闭' : `${o.time.slice(0, 14)}${String(Number(o.time.slice(14)) + 1).padStart(2, '0')} · ${o.pay}` },
  { title: '商家发货', desc: o.carrier ? `${o.carrier} ${o.waybill}` : o.status === '已关闭' ? '订单已关闭' : '18:00 截单，今日发出' },
  { title: '确认收货', desc: o.status === '已完成' ? '客户已签收' : '签收后 7 天自动完成' }
])
const canShip = o && (o.status === '待发货' || o.status === '物流异常')
const canClose = o && (o.status === '待付款' || o.status === '待发货')
const track = o && (o.status === '物流异常'
  ? [{ t: '包裹超过 48 小时未揽收，已提醒仓库', at: '10-09 10:42 · 系统', type: 'danger' }, { t: '已打印面单，等待快递员揽收', at: '10-07 17:20 · 华东仓' }, { t: '商家已发货', at: '10-07 17:02 · 何若溪' }]
  : o.carrier
    ? [{ t: o.status === '已完成' ? '已签收，签收人：本人' : '派送中，快递员 王师傅 138****2210', at: '10-09 09:15 · 上海静安营业部', type: 'primary' }, { t: '到达上海转运中心', at: '10-08 22:40' }, { t: '已揽收', at: '10-08 18:05 · 杭州余杭营业部' }, { t: '商家已发货', at: '10-08 17:02 · 何若溪' }]
    : [])
const logs = o && [
  { who: '系统', what: '订单创建', at: o.time },
  { who: '系统', what: o.status === '待付款' ? '等待支付' : `支付成功（${o.pay}）`, at: o.time },
  ...(o.note ? [{ who: '何若溪', what: '添加备注：已安排礼袋与手写卡片', at: '10-09 09:12' }] : []),
  ...(o.status === '已关闭' ? [{ who: '周一诺', what: '关闭订单：客户要求取消', at: '10-09 10:30' }] : [])
]
const tab = ref('items')

const copy = () => { navigator.clipboard?.writeText(o.id).catch(() => {}); ElMessage.success('订单号已复制') }
function onMore(cmd) {
  if (cmd === 'print') ElMessage.success('发货单已发送到打印机')
  else if (cmd === 'refund') router.push('/refunds')
  else if (cmd === 'close') confirmDanger('关闭后客户将无法继续支付，占用的库存会立即释放。此操作不能撤销。', `关闭订单 ${o.id}？`, { confirmButtonText: '确认关闭', cancelButtonText: '再想想' }).then(() => ElMessage.success('订单已关闭')).catch(() => {})
}

// 备注弹窗
const noteOpen = ref(false)
const noteText = ref(o?.note || '')

// 发货抽屉：?drawer=ship 或从列表点「发货」（?ship=1）直达；有未提交内容时关闭走原位确认条，不叠第二层弹窗
const shipOpen = ref(Boolean(o && canShip && (demo('drawer') === 'ship' || route.query.ship)))
const ship = reactive({ carrier: '顺丰速运', waybill: '', warehouse: 'hz', notify: true })
const shipRef = ref()
const shipRules = { carrier: [{ required: true, message: '请选择物流公司' }], waybill: [{ required: true, message: '请输入运单号', trigger: 'blur' }, { pattern: /^[A-Z0-9]{10,15}$/, message: '运单号为 10–15 位字母或数字', trigger: 'blur' }] }
const leave = useInlineConfirm()
const beforeClose = async (done) => { if (ship.waybill && !(await leave.ask({ message: '运单号尚未提交，确定关闭？' }))) return; done() }
async function submitShip() {
  if (!(await shipRef.value.validate().catch(() => false))) return
  shipOpen.value = false
  ElMessage.success(`已发货：${ship.carrier} ${ship.waybill}`)
}
</script>

<template>
  <el-card v-if="!o" class="flat" shadow="always">
    <div class="empty">
      <div class="illu" />
      <b>没有找到订单 {{ route.params.id }}</b>
      <span>订单号可能输错了，或者订单已超过 90 天被归档</span>
      <el-button @click="router.push('/orders')">返回订单列表</el-button>
    </div>
  </el-card>

  <template v-else>
    <PageHeader>
      <template #title>{{ o.items[0].name }}{{ o.items.length > 1 ? ` 等 ${o.items.length} 件` : '' }}</template>
      <template #status><span class="status" :class="tone(o.status)">{{ o.status }}</span></template>
      <template #subtitle>订单号 <span class="mono">{{ o.id }}</span> · 下单于 {{ o.time }} · {{ o.channel }}</template>
      <template #actions>
        <el-button :icon="Copy" @click="copy">复制订单号</el-button>
        <el-tooltip :disabled="can('order.note')" :content="needPerm('order.note')"><span><el-button :icon="Edit" :disabled="!can('order.note')" @click="noteOpen = true">修改备注</el-button></span></el-tooltip>
        <el-dropdown trigger="click" @command="onMore">
          <el-button>更多<Down class="i-icon--sm more-caret" /></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="print" :icon="Printer">打印发货单</el-dropdown-item>
              <el-dropdown-item command="refund" :icon="Return" :disabled="!can('refund.create') || o.status === '待付款'">发起售后</el-dropdown-item>
              <el-dropdown-item v-if="canClose" command="close" :icon="Delete" divided class="is-danger" :disabled="!can('order.close')">关闭订单</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip v-if="canShip" :disabled="can('order.ship')" :content="needPerm('order.ship')"><span><el-button type="primary" :icon="Truck" :disabled="!can('order.ship')" @click="shipOpen = true">发货</el-button></span></el-tooltip>
      </template>
    </PageHeader>

    <el-card class="flat panel" shadow="always">
      <div class="card-head"><h2>订单进度</h2></div>
      <div class="card-body">
        <el-steps :active="STEP_OF[o.status]" :process-status="o.status === '已关闭' ? 'error' : o.status === '物流异常' ? 'wait' : 'process'" finish-status="success">
          <el-step v-for="s in steps" :key="s.title" :title="s.title" :description="s.desc" />
        </el-steps>
      </div>
    </el-card>

    <div class="two-col">
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>订单信息</h2></div>
        <div class="card-body">
          <el-descriptions :column="2" direction="vertical">
            <el-descriptions-item label="客户"><router-link class="link" :to="`/customers/${o.customerId}`">{{ o.customer }}</router-link></el-descriptions-item>
            <el-descriptions-item label="手机号"><span class="num">{{ o.phone }}</span></el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ o.pay }}</el-descriptions-item>
            <el-descriptions-item label="实付金额"><span class="num">{{ yen(o.amount) }}</span></el-descriptions-item>
            <el-descriptions-item label="物流公司">{{ o.carrier || '—' }}</el-descriptions-item>
            <el-descriptions-item label="运单号"><span class="mono">{{ o.waybill || '—' }}</span></el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">{{ o.customer }}，{{ o.phone }}，{{ o.address }}</el-descriptions-item>
            <el-descriptions-item label="买家备注" :span="2">{{ o.note || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
      <el-card class="flat panel" shadow="always">
        <div class="card-head"><h2>物流动态</h2></div>
        <div class="card-body">
          <el-timeline v-if="track.length">
            <el-timeline-item v-for="(t, i) in track" :key="i" :timestamp="t.at" :type="t.type">{{ t.t }}</el-timeline-item>
          </el-timeline>
          <div v-else class="empty"><b>暂无物流信息</b><span>{{ o.status === '已关闭' ? '订单已关闭，不会发货' : '发货后这里会显示快递轨迹' }}</span></div>
        </div>
      </el-card>
    </div>

    <el-card class="flat" shadow="always">
      <el-tabs v-model="tab">
        <el-tab-pane label="商品明细" name="items">
          <el-table :data="o.items" row-key="id">
            <el-table-column label="商品" min-width="220"><template #default="{ row }"><span class="title-link">{{ row.name }}</span><span class="sub mono">{{ row.sku }}</span></template></el-table-column>
            <el-table-column prop="material" label="材质" min-width="120" />
            <el-table-column label="单价" width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.price) }}</template></el-table-column>
            <el-table-column label="数量" width="80" align="right" class-name="num"><template #default="{ row }">{{ row.qty }}</template></el-table-column>
            <el-table-column label="小计" width="130" align="right" class-name="num"><template #default="{ row }">{{ yen(row.price * row.qty) }}</template></el-table-column>
          </el-table>
          <dl class="sum">
            <div><dt>商品合计</dt><dd class="num">{{ yen(o.goods) }}</dd></div>
            <div><dt>优惠</dt><dd class="num">{{ o.discount ? yen(-o.discount) : '¥0.00' }}</dd></div>
            <div><dt>运费</dt><dd class="num">{{ yen(o.freight) }}</dd></div>
            <div class="total"><dt>实付</dt><dd class="num">{{ yen(o.amount) }}</dd></div>
          </dl>
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="logs">
          <el-table :data="logs">
            <el-table-column prop="at" label="时间" width="150" class-name="num" />
            <el-table-column prop="who" label="操作人" width="120" />
            <el-table-column prop="what" label="内容" min-width="240" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="`附件（${o.note ? 2 : 0}）`" name="files">
          <div v-if="o.note" class="card-body">
            <div class="file-row"><span class="tag">PDF</span><div class="text"><span class="title-link">发票申请单.pdf</span><span class="sub">128 KB · 何若溪 上传于 10-09 09:12</span></div><button class="act" type="button" @click="ElMessage.success('开始下载')">下载</button></div>
            <div class="file-row"><span class="tag">JPG</span><div class="text"><span class="title-link">手写卡片内容.jpg</span><span class="sub">640 KB · 客户上传于 {{ o.time }}</span></div><button class="act" type="button" @click="ElMessage.success('开始下载')">下载</button></div>
          </div>
          <div v-else class="empty"><b>没有附件</b></div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="noteOpen" title="修改备注" class="is-sm" append-to-body>
      <el-form label-position="top">
        <el-form-item label="内部备注"><el-input v-model="noteText" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="仅内部可见，客户看不到" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="noteOpen = false">取消</el-button><el-button type="primary" @click="noteOpen = false; ElMessage.success('备注已保存')">保存</el-button></template>
    </el-dialog>

    <el-drawer v-model="shipOpen" title="订单发货" size="var(--layout-drawer-width)" :before-close="beforeClose" append-to-body>
      <h4 class="drawer-h">收货信息</h4>
      <div class="ro">{{ o.customer }}，{{ o.phone }}，{{ o.address }}</div>
      <h4 class="drawer-h">物流</h4>
      <el-form ref="shipRef" :model="ship" :rules="shipRules" label-position="top">
        <el-form-item label="物流公司" prop="carrier"><el-select v-model="ship.carrier"><el-option v-for="c in ['顺丰速运', '京东物流', '中通快递', '圆通速递']" :key="c" :label="c" :value="c" /></el-select></el-form-item>
        <el-form-item label="运单号" prop="waybill"><el-input v-model="ship.waybill" placeholder="扫码枪扫描或手动输入" /><span class="help">10–15 位字母或数字，提交后客户会收到物流通知</span></el-form-item>
        <el-form-item label="发货仓">
          <el-radio-group v-model="ship.warehouse"><el-radio value="hz">杭州余杭仓</el-radio><el-radio value="sh">上海嘉定仓</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="通知"><el-switch v-model="ship.notify" /><span class="switch-label">发货后短信通知客户</span></el-form-item>
      </el-form>
      <template #footer>
        <ConfirmBar v-if="leave.state.open" v-bind="leave.state" @confirm="leave.confirm" @cancel="leave.cancel" />
        <div v-else><el-button @click="beforeClose(() => (shipOpen = false))">取消</el-button><el-button type="primary" @click="submitShip">确认发货</el-button></div>
      </template>
    </el-drawer>
  </template>
</template>

<style scoped>
.more-caret { margin-left: var(--spacing-1); }
.sum { display: grid; justify-content: end; gap: var(--spacing-2); margin: 0; padding: var(--spacing-4) var(--space-card); border-top: var(--border-width-default) solid var(--color-border-default); }
.sum > div { display: grid; grid-template-columns: auto var(--layout-form-label-width); gap: var(--spacing-6); text-align: right; font-size: var(--text-body-sm-size); }
.sum dt { color: var(--color-text-secondary); }
.sum dd { margin: 0; }
.sum .total dd { font-size: var(--text-title-size); font-weight: var(--text-weight-strong); }
.switch-label { margin-left: var(--spacing-2); color: var(--color-text-secondary); }
</style>
