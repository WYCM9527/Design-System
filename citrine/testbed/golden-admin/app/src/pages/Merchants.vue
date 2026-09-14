<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { confirmBox } from '@wycm9527/citrine/vue/confirm.js'
import { Plus } from '@icon-park/vue-next'
import { merchants, tone } from '../mock/data'
import { can } from '../store'

const router = useRouter()
const q = new URLSearchParams(location.search)
const filters = reactive({ keyword: '', status: 'all', type: 'all' })
const page = ref(1), size = ref(10)
const filtered = computed(() => merchants.filter((m) => (!filters.status || filters.status === 'all' || m.status === filters.status) && (!filters.type || filters.type === 'all' || m.type === filters.type) && (!filters.keyword || m.name.includes(filters.keyword) || m.id.includes(filters.keyword))))
const rows = computed(() => filtered.value.slice((page.value - 1) * size.value, page.value * size.value))

// 审核弹窗（PRD §4.5）：?audit=1 直接打开，方便截图
const audit = reactive({ open: q.get('audit') === '1', row: merchants.find((m) => m.status === '待审核'), result: q.get('audit') === '1' ? 'reject' : 'pass', reason: '' })
const auditRef = ref()
const auditRules = { reason: [{ required: true, message: '驳回时必须填写原因，商户会看到这段文字', trigger: 'blur' }] }
function openAudit(row) { audit.row = row; audit.result = 'pass'; audit.reason = ''; audit.open = true }
async function submitAudit() {
  if (audit.result === 'reject') { const ok = await auditRef.value.validate().then(() => true).catch(() => false); if (!ok) return }
  audit.row.status = audit.result === 'pass' ? '已上线' : '已驳回'
  ElMessage.success(audit.result === 'pass' ? `「${audit.row.name}」已通过审核并上线` : '已驳回，商户将收到通知')
  audit.open = false
}
function toggleActive(row) {
  const off = row.status !== '已停用'
  confirmBox(off ? '停用后商户将从 App 下架，进行中的订单不受影响。' : '恢复后商户立即重新上架。', off ? `停用「${row.name}」？` : `恢复「${row.name}」？`, { confirmButtonText: off ? '确认停用' : '恢复', cancelButtonText: '取消', type: 'warning', confirmButtonClass: off ? 'el-button--danger' : '' })
    .then(() => { row.status = off ? '已停用' : '已上线'; ElMessage.success(off ? '已停用' : '已恢复') }).catch(() => {})
}
</script>

<template>
  <div class="page-head">
    <div><h1>商户管理</h1><p>共 <b class="num">{{ filtered.length }}</b> 家 · 待审核 <b class="num">{{ merchants.filter((m) => m.status === '待审核').length }}</b></p></div>
    <div class="actions"><el-button type="primary" :disabled="!can('merchant.edit')" @click="router.push('/merchants/new')"><Plus class="i-icon--sm" />新建商户</el-button></div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="filters.keyword" placeholder="商户名 / 编号" aria-label="搜索商户名或编号" clearable style="width: 220px" />
        <el-select v-model="filters.status" aria-label="商户状态" style="width: 140px"><el-option label="全部状态" value="all" /><el-option v-for="s in ['待审核', '已上线', '已驳回', '已停用']" :key="s" :label="s" :value="s" /></el-select>
        <el-select v-model="filters.type" aria-label="经营类型" style="width: 140px"><el-option label="全部类型" value="all" /><el-option v-for="s in ['餐饮', '生鲜', '零售']" :key="s" :label="s" :value="s" /></el-select>
      </div>
      <div class="acts"><el-button type="primary">查询</el-button></div>
    </div>
    <el-table :data="rows" style="width: 100%">
      <el-table-column label="商户" min-width="240"><template #default="{ row }"><router-link class="link" :to="`/merchants/${row.id}/edit`">{{ row.name }}</router-link><span class="sub mono">{{ row.id }}</span></template></el-table-column>
      <el-table-column label="经营类型" width="110"><template #default="{ row }"><el-tag size="small" type="info">{{ row.type }}</el-tag></template></el-table-column>
      <el-table-column prop="city" label="城市" width="90" />
      <el-table-column label="联系人" width="160"><template #default="{ row }">{{ row.contact }} <span class="sub-inline num">{{ row.phone }}</span></template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="入驻时间" width="130"><template #default="{ row }"><span class="num">{{ row.joined }}</span></template></el-table-column>
      <el-table-column label="操作" width="210" fixed="right">
        <template #default="{ row }">
          <router-link class="act" :to="`/merchants/${row.id}/edit`">{{ can('merchant.edit') ? '编辑' : '查看' }}</router-link>
          <template v-if="can('merchant.audit') && row.status === '待审核'"><a class="act" @click="openAudit(row)">审核</a></template>
          <template v-if="can('merchant.edit')"><a class="act" @click="toggleActive(row)">{{ row.status === '已停用' ? '恢复' : '停用' }}</a></template>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager"><el-pagination v-model:current-page="page" v-model:page-size="size" :total="filtered.length" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" background /></div>
  </el-card>

  <el-dialog v-model="audit.open" title="商户审核" :width="'var(--layout-modal-width-md)'" class="audit">
    <el-descriptions v-if="audit.row" :column="2" border size="small" class="summary">
      <el-descriptions-item label="商户">{{ audit.row.name }}</el-descriptions-item><el-descriptions-item label="编号"><span class="mono">{{ audit.row.id }}</span></el-descriptions-item>
      <el-descriptions-item label="类型">{{ audit.row.type }}</el-descriptions-item><el-descriptions-item label="城市">{{ audit.row.city }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ audit.row.contact }} <span class="num">{{ audit.row.phone }}</span></el-descriptions-item><el-descriptions-item label="营业执照"><a class="act">查看附件</a></el-descriptions-item>
    </el-descriptions>
    <el-form ref="auditRef" :model="audit" :rules="auditRules" label-position="right" class="audit-form">
      <el-form-item label="审核结论" required><el-radio-group v-model="audit.result"><el-radio value="pass">通过</el-radio><el-radio value="reject">驳回</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="audit.result === 'reject'" label="驳回原因" prop="reason"><el-input v-model="audit.reason" type="textarea" :rows="3" placeholder="商户会看到这段文字，请写明需要补充或修改的材料" maxlength="200" show-word-limit /></el-form-item>
    </el-form>
    <template #footer><el-button @click="audit.open = false">取消</el-button><el-button :type="audit.result === 'reject' ? 'danger' : 'primary'" @click="submitAudit">{{ audit.result === 'reject' ? '确认驳回' : '通过并上线' }}</el-button></template>
  </el-dialog>
</template>

<style scoped>
.sub-inline { color: var(--color-text-muted); font-size: var(--text-small-size); }
.summary { margin-bottom: var(--spacing-5); }
.audit-form :deep(.el-form-item__label) { width: var(--layout-form-label-width); }
</style>
