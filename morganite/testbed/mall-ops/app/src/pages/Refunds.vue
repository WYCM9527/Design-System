<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Filter, Picture } from '@icon-park/vue-next'
import ConfirmBar from '@wycm9527/morganite/vue/ConfirmBar.vue'
import { useInlineConfirm } from '@wycm9527/morganite/vue/inlineConfirm.js'
import { can, needPerm, demo } from '../store'
import { refunds, tone, yen } from '../mock/data'

const empty = demo('state') === 'empty'   // ?state=empty
const source = empty ? [] : refunds
const TABS = [['all', '全部'], ['待审核', '待审核'], ['处理中', '处理中'], ['done', '已结束']]
const tab = ref('all')
const count = (k) => (k === 'all' ? source.length : k === 'done' ? source.filter((r) => ['已退款', '已驳回', '已撤销'].includes(r.status)).length : source.filter((r) => r.status === k).length)
const draft = reactive({ keyword: '', type: '' })
const applied = ref({ ...draft })
const rows = computed(() => source.filter((r) =>
  (tab.value === 'all' || (tab.value === 'done' ? ['已退款', '已驳回', '已撤销'].includes(r.status) : r.status === tab.value)) &&
  (!applied.value.keyword || r.id.includes(applied.value.keyword) || r.orderId.includes(applied.value.keyword) || r.customer.includes(applied.value.keyword)) &&
  (!applied.value.type || r.type === applied.value.type)))
const page = ref(1)
const paged = computed(() => rows.value.slice((page.value - 1) * 10, page.value * 10))

// 审核弹窗：?audit=1 直达第一条待审核；驳回必须写原因；有填写内容时关闭走原位确认条
const pending = source.find((r) => r.status === '待审核')
const current = ref(demo('audit') === '1' ? pending : null)
const auditOpen = ref(Boolean(current.value))
const audit = reactive({ result: 'approve', reason: '' })
const auditRef = ref()
const auditRules = { reason: [{ validator: (_r, v, cb) => (audit.result === 'reject' && !v ? cb(new Error('驳回时请写明原因，客户会看到')) : cb()), trigger: 'blur' }] }
const leave = useInlineConfirm()
function openAudit(r) { current.value = r; Object.assign(audit, { result: 'approve', reason: '' }); auditOpen.value = true }
const beforeClose = async (done) => { if (audit.reason && !(await leave.ask({ message: '审核意见尚未提交，确定关闭？' }))) return; done() }
const isSwap = computed(() => current.value?.type === '换货')
const money = (r) => (r.type === '换货' ? '—' : yen(r.amount))
async function submitAudit() {
  if (!(await auditRef.value.validate().catch(() => false))) return
  auditOpen.value = false
  ElMessage.success(audit.result === 'reject' ? '已驳回，客户会收到通知' : isSwap.value ? '已同意换货，客户寄回后仓库发出新品' : `已同意退款 ${yen(current.value.amount)}，原路退回`)
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>售后退款</h1>
      <p>审核仅退款、退货退款与换货申请；超过 48 小时未处理的申请系统会自动同意。</p>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <el-tabs v-model="tab" @tab-change="page = 1">
      <el-tab-pane v-for="[k, label] in TABS" :key="k" :name="k" :label="`${label}（${count(k)}）`" />
    </el-tabs>
    <div class="filter">
      <div class="conds">
        <el-input v-model="draft.keyword" class="w-search" placeholder="售后单号 / 订单号 / 客户" aria-label="关键词" clearable><template #prefix><Search /></template></el-input>
        <el-select v-model="draft.type" class="w-select" placeholder="全部类型" aria-label="售后类型" clearable><el-option v-for="t in ['仅退款', '退货退款', '换货']" :key="t" :label="t" :value="t" /></el-select>
      </div>
      <div class="acts"><el-button text @click="Object.assign(draft, { keyword: '', type: '' }); applied = { ...draft }">重置</el-button><el-button :icon="Filter" @click="applied = { ...draft }; page = 1">查询</el-button></div>
    </div>

    <div v-if="!rows.length" class="empty">
      <div class="illu" />
      <b>{{ source.length ? '这个分类下没有售后单' : '暂无售后申请' }}</b>
      <span>{{ source.length ? '切换上方分类或清除筛选再看看' : '客户发起售后后会出现在这里，超过 48 小时未处理会自动同意' }}</span>
    </div>
    <template v-else>
      <el-table :data="paged" row-key="id">
        <el-table-column label="售后单号" width="150"><template #default="{ row }"><button class="link mono" type="button" @click="openAudit(row)">{{ row.id }}</button></template></el-table-column>
        <el-table-column label="订单号" width="170"><template #default="{ row }"><router-link class="link mono" :to="`/orders/${row.orderId}`">{{ row.orderId }}</router-link></template></el-table-column>
        <el-table-column label="商品 / 客户" min-width="200"><template #default="{ row }">{{ row.item }}<span class="sub">{{ row.customer }} · {{ row.phone }}</span></template></el-table-column>
        <el-table-column label="类型" width="96"><template #default="{ row }"><span class="tag">{{ row.type }}</span></template></el-table-column>
        <el-table-column label="退款金额" width="120" align="right" class-name="num"><template #default="{ row }">{{ money(row) }}</template></el-table-column>
        <el-table-column prop="reason" label="原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="time" label="申请时间" width="130" class-name="num" />
        <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <span v-if="row.status === '待审核'" :title="can('refund.audit') ? '' : needPerm('refund.audit')"><button class="act" type="button" :disabled="!can('refund.audit')" @click="openAudit(row)">审核</button></span>
            <button v-else class="act" type="button" @click="openAudit(row)">查看</button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next" :total="rows.length" :page-size="10" /></div>
    </template>
  </el-card>

  <el-dialog v-model="auditOpen" :title="current && current.status === '待审核' && can('refund.audit') ? `审核售后 ${current.id}` : `售后单 ${current?.id}`" class="is-md" :before-close="beforeClose" append-to-body>
    <template v-if="current">
      <el-descriptions :column="2">
        <el-descriptions-item label="订单号"><span class="mono">{{ current.orderId }}</span></el-descriptions-item>
        <el-descriptions-item label="类型">{{ current.type }}</el-descriptions-item>
        <el-descriptions-item label="退款金额"><span class="num">{{ money(current) }}</span></el-descriptions-item>
        <el-descriptions-item label="状态"><span class="status" :class="tone(current.status)">{{ current.status }}</span></el-descriptions-item>
        <el-descriptions-item label="申请原因" :span="2">{{ current.reason }}</el-descriptions-item>
      </el-descriptions>
      <h4 class="drawer-h">客户凭证（3）</h4>
      <div class="proofs"><span v-for="i in 3" :key="i" class="proof" aria-hidden="true"><Picture class="i-icon--xl i-icon--muted" /></span></div>
      <el-form v-if="current.status === '待审核' && can('refund.audit')" ref="auditRef" :model="audit" :rules="auditRules" label-position="top" class="audit-form">
        <el-form-item label="审核结果"><el-radio-group v-model="audit.result"><el-radio value="approve">{{ isSwap ? '同意换货' : '同意退款' }}</el-radio><el-radio value="reject">驳回</el-radio></el-radio-group></el-form-item>
        <el-form-item label="审核意见" prop="reason"><el-input v-model="audit.reason" type="textarea" :rows="3" maxlength="200" show-word-limit :placeholder="audit.result === 'reject' ? '必填，客户会看到' : '选填，仅内部可见'" /></el-form-item>
      </el-form>
    </template>
    <template #footer>
      <ConfirmBar v-if="leave.state.open" v-bind="leave.state" @confirm="leave.confirm" @cancel="leave.cancel" />
      <div v-else-if="current && current.status === '待审核' && can('refund.audit')"><el-button @click="beforeClose(() => (auditOpen = false))">取消</el-button><el-button :type="audit.result === 'reject' ? 'danger' : 'primary'" @click="submitAudit">{{ audit.result === 'reject' ? '确认驳回' : isSwap ? '同意换货' : '同意退款' }}</el-button></div>
      <div v-else><el-button @click="auditOpen = false">关闭</el-button></div>
    </template>
  </el-dialog>
</template>

<style scoped>
.proofs { display: flex; gap: var(--spacing-3); }
.proof { display: grid; place-items: center; width: var(--illustration-size-md); aspect-ratio: 1; border-radius: var(--radius-md); background: var(--color-bg-subtle); }
.audit-form { margin-top: var(--spacing-5); }
</style>
