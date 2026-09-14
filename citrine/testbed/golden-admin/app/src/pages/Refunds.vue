<script setup>
// 退款审核：筛选 + 多选表格 + 批量条 + 通过 / 拒绝 + 详情抽屉。视觉全部走 DESIGN.md 配方与 app.css 公共类
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { confirmBox } from '../styles/bridge/vue/confirm.js'
import { Inbox, Search } from '@icon-park/vue-next'
import { refunds, REFUND_STATUS, yen } from '../mock/data'

const PAGE_SIZE = 20
const LOAD_DELAY = 600            // 进入页面先展示约 600ms 的表格骨架
const CURRENT_USER = '王小明'      // 顶栏当前登录人（store 里没有用户名字段，先写死）

// 列定义在骨架表与真表之间共用：骨架按目标列宽占位，加载完成不跳版（DESIGN.md 空状态 / 骨架屏配方）
const SELECTION_WIDTH = 48
const COLS = [
  { key: 'id', label: '退款单号', width: 175, skw: 'skw-80' },
  { key: 'orderId', label: '订单号', width: 150, skw: 'skw-80' },
  { key: 'merchant', label: '商户', minWidth: 100, skw: 'skw-70' },
  { key: 'amount', label: '金额', width: 125, align: 'right', skw: 'skw-60' },
  { key: 'reason', label: '申请原因', minWidth: 110, skw: 'skw-90' },
  { key: 'status', label: '状态', width: 110, skw: 'skw-60' },
  { key: 'appliedAt', label: '申请时间', width: 180, skw: 'skw-80' },
  { key: 'ops', label: '操作', width: 150, skw: 'skw-60' }
]
const SKELETON_ROWS = Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: `sk-${i}` }))

// ?state=empty / ?state=loading：截图脚本用它强制空态 / 加载态（项目约定：参数放在 # 之前，读 location.search）
const forced = computed(() => new URLSearchParams(location.search).get('state'))

const rows = reactive(refunds)   // 直接代理演示数据：本次会话内的审核结果在页面之间保留
const loading = ref(true)
let timer = null
function load() {
  clearTimeout(timer)
  loading.value = true
  if (forced.value === 'loading') return
  timer = setTimeout(() => { loading.value = false }, LOAD_DELAY)
}
onMounted(load)
watch(forced, load)
onBeforeUnmount(() => clearTimeout(timer))

// 筛选：表单草稿与已应用条件分开，点「查询」才生效
const blank = () => ({ status: 'all', range: null, keyword: '' })
const draft = reactive(blank())
const applied = reactive(blank())
const page = ref(1)
function search() {
  Object.assign(applied, { status: draft.status, keyword: draft.keyword, range: draft.range ? [...draft.range] : null })
  page.value = 1
}
function reset() { Object.assign(draft, blank()); search() }

const filtered = computed(() => {
  if (forced.value === 'empty') return []
  const kw = applied.keyword.trim()
  return rows.filter((r) =>
    (applied.status === 'all' || r.status === applied.status) &&
    (!applied.range || (r.appliedAt.slice(0, 10) >= applied.range[0] && r.appliedAt.slice(0, 10) <= applied.range[1])) &&
    (!kw || [r.id, r.orderId, r.merchant, r.reason].some((s) => s.includes(kw))))
})
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const hasFilter = computed(() => applied.status !== 'all' || !!applied.range || !!applied.keyword.trim())

// 多选：只有待审核的单子可勾选，批量动作只对它们有意义
const table = ref()
const selected = ref([])
const isPending = (row) => row.status === 'pending'
const clearSelection = () => table.value?.clearSelection()

const now = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 通过：二次确认
function approve(list) {
  const targets = [...list]
  const msg = targets.length === 1
    ? `确定通过退款单 ${targets[0].id}（${yen(targets[0].amount)}）？通过后金额将原路退回用户。`
    : `确定通过已选的 ${targets.length} 笔退款申请？通过后金额将原路退回用户。`
  confirmBox(msg, '通过退款', { confirmButtonText: '确认通过', cancelButtonText: '取消' })
    .then(() => {
      targets.forEach((r) => Object.assign(r, { status: 'approved', handler: CURRENT_USER, handledAt: now(), rejectReason: null }))
      clearSelection()
      ElMessage.success(`已通过 ${targets.length} 笔退款`)
    })
    .catch(() => {})
}

// 拒绝：对话框填写原因（必填）
const reject = reactive({ visible: false, targets: [], reason: '' })
const rejectForm = ref()
const rejectRules = { reason: [{ required: true, message: '请填写拒绝原因', trigger: 'blur' }] }
function openReject(list) { reject.targets = [...list]; reject.reason = ''; reject.visible = true }
async function confirmReject() {
  const ok = await rejectForm.value.validate().catch(() => false)
  if (!ok) return
  reject.targets.forEach((r) => Object.assign(r, { status: 'rejected', handler: CURRENT_USER, handledAt: now(), rejectReason: reject.reason.trim() }))
  reject.visible = false
  clearSelection()
  ElMessage.success(`已拒绝 ${reject.targets.length} 笔退款`)
}

// 详情抽屉：描述列表 + 处理时间线（申请 → 审核 → 完成 / 拒绝）
const drawer = reactive({ visible: false, row: null })
function openDetail(row) { drawer.row = row; drawer.visible = true }
const timeline = computed(() => {
  const r = drawer.row
  if (!r) return []
  const items = [{ title: '用户提交退款申请', desc: r.reason, time: r.appliedAt, color: 'var(--color-status-info)' }]
  if (r.status === 'pending') {
    items.push({ title: '等待审核', desc: '运营处理中', time: '', color: 'var(--color-action-primary)' })
    items.push({ title: '完成退款', desc: '审核通过后金额原路退回', time: '', color: 'var(--color-border-strong)', hollow: true })
  } else if (r.status === 'approved') {
    items.push({ title: '审核通过', desc: `处理人：${r.handler}`, time: r.handledAt, color: 'var(--color-status-success)' })
    items.push({ title: '退款完成', desc: `${yen(r.amount)} 已原路退回用户`, time: r.handledAt, color: 'var(--color-status-success)' })
  } else {
    items.push({ title: '审核拒绝', desc: `处理人：${r.handler}`, time: r.handledAt, color: 'var(--color-status-error)' })
    items.push({ title: '已拒绝', desc: `拒绝原因：${r.rejectReason}`, time: r.handledAt, color: 'var(--color-status-error)' })
  }
  return items
})
</script>

<template>
  <div class="page-head">
    <div>
      <h1>退款审核</h1>
      <p>处理用户发起的退款申请：通过后金额原路退回，拒绝需填写原因并同步给用户。</p>
    </div>
  </div>

  <el-card class="flat">
    <!-- 筛选栏（DESIGN 配方）：紧凑形态，控件靠 aria-label 命名、下拉默认值是真实选项；动作区「查询」主按钮 +「重置」quiet -->
    <div class="filter">
      <div class="conds">
        <el-input v-model="draft.keyword" class="f-keyword" clearable placeholder="退款单号 / 订单号 / 商户 / 原因" aria-label="搜索退款单号、订单号、商户或原因" @keyup.enter="search">
          <template #prefix><Search class="i-icon--sm i-icon--muted" /></template>
        </el-input>
        <el-select v-model="draft.status" class="f-status" aria-label="退款状态">
          <el-option value="all" label="全部状态" />
          <el-option v-for="(s, k) in REFUND_STATUS" :key="k" :value="k" :label="s.label" />
        </el-select>
        <el-date-picker v-model="draft.range" type="daterange" value-format="YYYY-MM-DD" range-separator="→" start-placeholder="开始" end-placeholder="结束" unlink-panels aria-label="申请日期范围" class="f-range" />
      </div>
      <div class="acts">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button text @click="reset">重置</el-button>
      </div>
    </div>

    <!-- 批量操作条：勾选后出现 -->
    <div v-if="selected.length" class="batch">
      <span>已选 <b class="num">{{ selected.length }}</b> 项</span>
      <a class="act" href="#" @click.prevent="clearSelection">取消选择</a>
      <div class="right">
        <el-button size="small" @click="approve(selected)">批量通过</el-button>
        <el-button size="small" type="danger" @click="openReject(selected)">批量拒绝</el-button>
      </div>
    </div>

    <!-- 加载态：按目标表格形状占位的骨架（表头 + 等高行 + 目标列宽） -->
    <el-skeleton v-if="loading" animated>
      <template #template>
        <el-table :data="SKELETON_ROWS" row-key="id" aria-busy="true" aria-label="正在加载退款单">
          <el-table-column :width="SELECTION_WIDTH" />
          <el-table-column v-for="c in COLS" :key="c.key" :label="c.label" :width="c.width" :min-width="c.minWidth" :align="c.align">
            <template #default><span class="skel-cell" :class="c.align === 'right' ? 'is-right' : ''"><el-skeleton-item variant="text" :class="c.skw" /></span></template>
          </el-table-column>
        </el-table>
        <div class="pager"><el-skeleton-item variant="text" class="skel-pager" /></div>
      </template>
    </el-skeleton>

    <!-- 空态：筛选无结果 -->
    <div v-else-if="!filtered.length" class="empty">
      <div class="illu"><Inbox theme="two-tone" :fill="['var(--color-icon-brand)', 'var(--color-icon-two-tone)']" class="illu-icon" /></div>
      <b>没有符合条件的退款单</b>
      <span>换个状态或申请日期范围再试试。</span>
      <a v-if="hasFilter" class="act" href="#" @click.prevent="reset">清空筛选条件</a>
    </div>

    <template v-else>
      <el-table ref="table" :data="pageRows" row-key="id" @selection-change="selected = $event">
        <el-table-column type="selection" :width="SELECTION_WIDTH" :selectable="isPending" />
        <el-table-column v-for="c in COLS" :key="c.key" :label="c.label" :width="c.width" :min-width="c.minWidth" :align="c.align">
          <template #default="{ row }">
            <a v-if="c.key === 'id'" class="link mono" href="#" @click.prevent="openDetail(row)">{{ row.id }}</a>
            <span v-else-if="c.key === 'orderId'" class="mono">{{ row.orderId }}</span>
            <span v-else-if="c.key === 'amount'" class="num">{{ yen(row.amount) }}</span>
            <span v-else-if="c.key === 'status'" class="status" :class="REFUND_STATUS[row.status].tone">{{ REFUND_STATUS[row.status].label }}</span>
            <span v-else-if="c.key === 'appliedAt'" class="num">{{ row.appliedAt }}</span>
            <template v-else-if="c.key === 'ops'">
              <template v-if="isPending(row)">
                <el-button text size="small" @click="approve([row])">通过</el-button>
                <el-button text size="small" type="danger" @click="openReject([row])">拒绝</el-button>
              </template>
              <span v-else class="muted">—</span>
            </template>
            <template v-else>{{ row[c.key] }}</template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination v-model:current-page="page" :page-size="PAGE_SIZE" :total="filtered.length" layout="total, prev, pager, next" background />
      </div>
    </template>
  </el-card>

  <!-- 拒绝：填写原因（必填） -->
  <el-dialog v-model="reject.visible" title="拒绝退款" width="var(--layout-modal-width-md)" @opened="rejectForm?.clearValidate()">
    <p class="dialog-note">
      <template v-if="reject.targets.length === 1">将拒绝退款单 <span class="mono">{{ reject.targets[0].id }}</span>（{{ yen(reject.targets[0].amount) }}），拒绝原因会同步给申请用户。</template>
      <template v-else>将拒绝已选的 {{ reject.targets.length }} 笔退款申请，拒绝原因会同步给申请用户。</template>
    </p>
    <el-form ref="rejectForm" :model="reject" :rules="rejectRules" @submit.prevent="confirmReject">
      <el-form-item label="拒绝原因" prop="reason">
        <el-input v-model="reject.reason" type="textarea" :rows="4" maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="reject.visible = false">取消</el-button>
      <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
    </template>
  </el-dialog>

  <!-- 详情抽屉 -->
  <el-drawer v-model="drawer.visible" :title="drawer.row ? `退款单 ${drawer.row.id}` : '退款单详情'" size="var(--layout-drawer-width)">
    <template v-if="drawer.row">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="退款单号"><span class="mono">{{ drawer.row.id }}</span></el-descriptions-item>
        <el-descriptions-item label="订单号"><span class="mono">{{ drawer.row.orderId }}</span></el-descriptions-item>
        <el-descriptions-item label="商户">{{ drawer.row.merchant }}</el-descriptions-item>
        <el-descriptions-item label="金额"><span class="num">{{ yen(drawer.row.amount) }}</span></el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ drawer.row.reason }}</el-descriptions-item>
        <el-descriptions-item label="申请时间"><span class="num">{{ drawer.row.appliedAt }}</span></el-descriptions-item>
        <el-descriptions-item label="状态"><span class="status" :class="REFUND_STATUS[drawer.row.status].tone">{{ REFUND_STATUS[drawer.row.status].label }}</span></el-descriptions-item>
        <el-descriptions-item label="处理信息">
          <span v-if="drawer.row.status === 'pending'" class="muted">待处理</span>
          <template v-else>
            {{ drawer.row.handler }} 于 <span class="num">{{ drawer.row.handledAt }}</span> {{ drawer.row.status === 'approved' ? '通过' : '拒绝' }}
            <span v-if="drawer.row.rejectReason" class="sub">拒绝原因：{{ drawer.row.rejectReason }}</span>
          </template>
        </el-descriptions-item>
      </el-descriptions>

      <h3 class="drawer-sub">处理时间线</h3>
      <el-timeline>
        <el-timeline-item v-for="n in timeline" :key="n.title" :timestamp="n.time || undefined" :color="n.color" :hollow="n.hollow">
          <div class="tl-title">{{ n.title }}</div>
          <div v-if="n.desc" class="tl-desc">{{ n.desc }}</div>
        </el-timeline-item>
      </el-timeline>
    </template>
  </el-drawer>
</template>

<style scoped>
.f-status { width: calc(var(--layout-search-width) * 0.6); }
.f-keyword { width: var(--layout-search-width); }
.f-range { width: var(--layout-search-width); }

.batch b { font-weight: var(--text-weight-strong); }
.muted { color: var(--color-text-muted); }

/* 骨架条按单元格内容高度占位：真表每行最高的内容是操作列的小按钮（命中区 control.hit-min），行高因此与真表一致 */
.skel-cell { display: flex; align-items: center; height: var(--control-hit-min); }
.skel-cell.is-right { justify-content: flex-end; }
.skw-60 { width: 60%; } .skw-70 { width: 70%; } .skw-80 { width: 80%; } .skw-90 { width: 90%; }
.skel-pager { width: var(--layout-search-width); height: var(--control-height-sm); }

.illu-icon { font-size: var(--icon-size-2xl); }

.dialog-note { margin: 0 0 var(--spacing-4); color: var(--color-text-secondary); line-height: var(--text-paragraph-line-height); }

.drawer-sub { margin: var(--space-card) 0 var(--spacing-4); font-size: var(--text-title-sm-size); font-weight: var(--text-weight-strong); }
.tl-title { font-size: var(--text-body-sm-size); color: var(--color-text-primary); }
.tl-desc { margin-top: var(--spacing-1); font-size: var(--text-body-sm-size); color: var(--color-text-secondary); }
</style>
