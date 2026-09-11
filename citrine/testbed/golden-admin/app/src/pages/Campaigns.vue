<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ViewList, ViewGridList } from '@icon-park/vue-next'
import { campaigns, tone } from '../mock/data'
import { can } from '../store'

const q = new URLSearchParams(location.search)
const view = ref(q.get('view') === 'card' ? 'card' : 'list')
const dialog = ref(q.get('dialog') === '1')
const formRef = ref()
const form = reactive({ name: q.get('dialog') === '1' ? '国庆满 99 减 20' : '', type: '满减', threshold: 99, discount: 20, budget: q.get('dialog') === '1' ? -500 : 50000, cities: ['北京', '上海'], range: ['2026-10-01', '2026-10-07'], banner: true, autoOff: true })
const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入预算上限', trigger: 'blur' }, { validator: (_, v, cb) => (v > 0 ? cb() : cb(new Error('预算必须为正数'))), trigger: 'blur' }],
  range: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
}
if (q.get('dialog') === '1') setTimeout(() => formRef.value?.validate().catch(() => {}), 80)
const pct = (c) => Math.round((c.used / c.budget) * 100)
const yuan = (n) => `¥ ${n.toLocaleString('zh-CN')}`
async function save() {
  const ok = await formRef.value.validate().then(() => true).catch(() => false); if (!ok) return
  campaigns.unshift({ id: 'C013', name: form.name, type: form.type, scope: form.cities, budget: form.budget, used: 0, range: form.range.join(' ~ '), status: '待审核', banner: form.banner, autoOff: form.autoOff })
  dialog.value = false; ElMessage.success('活动已创建，等待审核')
}
function toggle(c) {
  const online = c.status === '进行中'
  ElMessageBox.confirm(online ? '下线后用户端立即不可见，已领取的优惠仍可使用。' : '上线后立即对投放城市的用户可见。', online ? `下线「${c.name}」？` : `上线「${c.name}」？`, { confirmButtonText: online ? '确认下线' : '确认上线', cancelButtonText: '取消', type: 'warning', confirmButtonClass: online ? 'el-button--danger' : '' })
    .then(() => { c.status = online ? '已下线' : '进行中'; ElMessage.success(online ? '已下线' : '已上线') }).catch(() => {})
}
</script>

<template>
  <div class="page-head">
    <div><h1>营销活动</h1><p>进行中 <b class="num">{{ campaigns.filter((c) => c.status === '进行中').length }}</b> 个 · 本月预算已用 <b class="num">62%</b></p></div>
    <div class="actions">
      <el-radio-group v-model="view" size="default"><el-radio-button value="list"><ViewList class="i-icon--sm" /></el-radio-button><el-radio-button value="card"><ViewGridList class="i-icon--sm" /></el-radio-button></el-radio-group>
      <el-button type="primary" :disabled="!can('campaign.edit')" @click="dialog = true"><Plus class="i-icon--sm" />新建活动</el-button>
    </div>
  </div>

  <el-card v-if="view === 'list'" class="flat" shadow="always">
    <el-table :data="campaigns" style="width: 100%">
      <el-table-column label="活动" min-width="240"><template #default="{ row }"><a class="link">{{ row.name }}</a><span class="sub">{{ row.type }} · {{ row.scope.join('、') }}</span></template></el-table-column>
      <el-table-column label="预算 / 已用" min-width="220"><template #default="{ row }"><div class="budget"><el-progress :percentage="pct(row)" :show-text="false" :stroke-width="6" :class="{ 'is-muted': row.status !== '进行中' }" /><span class="num sub-inline">{{ yuan(row.used) }} / {{ yuan(row.budget) }}</span></div></template></el-table-column>
      <el-table-column label="活动时间" width="230"><template #default="{ row }"><span class="num">{{ row.range }}</span></template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="首页 Banner" width="110"><template #default="{ row }"><el-switch v-model="row.banner" size="small" :disabled="!can('campaign.edit')" /></template></el-table-column>
      <el-table-column label="操作" width="170" fixed="right"><template #default="{ row }"><a class="act">编辑</a><template v-if="can('campaign.edit') && ['进行中', '待审核', '已下线'].includes(row.status)"> · <a class="act" @click="toggle(row)">{{ row.status === '进行中' ? '下线' : '上线' }}</a></template> · <a class="act">复制</a></template></el-table-column>
    </el-table>
  </el-card>

  <div v-else class="cards">
    <el-card v-for="c in campaigns" :key="c.id" class="camp" shadow="always">
      <div class="camp-head"><span class="badge" :class="tone(c.status)">{{ c.status }}</span><el-tag size="small" type="info">{{ c.type }}</el-tag></div>
      <h3>{{ c.name }}</h3>
      <div class="camp-meta">{{ c.scope.join('、') }} · <span class="num">{{ c.range }}</span></div>
      <el-progress :percentage="pct(c)" :stroke-width="6" :format="(p) => `${p}%`" :class="{ 'is-muted': c.status !== '进行中' }" />
      <div class="camp-foot"><span class="num sub-inline">{{ yuan(c.used) }} / {{ yuan(c.budget) }}</span><span><a class="act">编辑</a> · <a class="act">复制</a></span></div>
    </el-card>
  </div>

  <el-dialog v-model="dialog" title="新建活动" :width="'var(--layout-modal-width-md)'">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="right" class="camp-form">
      <el-form-item label="活动名称" prop="name"><el-input v-model="form.name" placeholder="用户端可见" maxlength="30" show-word-limit /></el-form-item>
      <el-form-item label="活动类型" prop="type"><el-radio-group v-model="form.type"><el-radio-button value="满减">满减</el-radio-button><el-radio-button value="折扣">折扣</el-radio-button><el-radio-button value="赠品">赠品</el-radio-button></el-radio-group></el-form-item>
      <el-form-item v-if="form.type === '满减'" label="满减规则"><div class="rule">满 <el-input-number v-model="form.threshold" :min="1" controls-position="right" style="width: 120px" /> 元减 <el-input-number v-model="form.discount" :min="1" controls-position="right" style="width: 120px" /> 元</div></el-form-item>
      <el-form-item label="预算上限" prop="budget"><el-input-number v-model="form.budget" :step="1000" controls-position="right" style="width: 200px" /> <span class="unit">元</span></el-form-item>
      <el-form-item label="投放城市"><el-select v-model="form.cities" multiple collapse-tags collapse-tags-tooltip placeholder="不选即全部城市" style="width: 100%"><el-option v-for="c in ['北京', '上海', '广州', '深圳', '杭州', '成都']" :key="c" :label="c" :value="c" /></el-select></el-form-item>
      <el-form-item label="活动时间" prop="range"><el-date-picker v-model="form.range" type="daterange" range-separator="→" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>
      <el-form-item label="首页 Banner"><el-switch v-model="form.banner" /></el-form-item>
      <el-form-item label="自动下线"><el-switch v-model="form.autoOff" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="save">提交审核</el-button></template>
  </el-dialog>
</template>

<style scoped>
.sub-inline { color: var(--color-text-muted); font-size: var(--text-small-size); }
.budget { display: flex; flex-direction: column; gap: var(--spacing-1); }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-stack); }
.camp h3 { margin: var(--spacing-2-5) 0 var(--spacing-1); font-size: var(--text-title-sm-size); font-weight: var(--text-weight-strong); }
.camp-head { display: flex; gap: var(--spacing-2); align-items: center; }
.camp-meta { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); margin-bottom: var(--spacing-3); }
.camp-foot { display: flex; justify-content: space-between; margin-top: var(--spacing-3); font-size: var(--text-body-sm-size); }
.camp-form :deep(.el-form-item__label) { width: calc(var(--layout-form-label-width) + var(--spacing-8)); }
.rule { display: flex; align-items: center; gap: var(--spacing-2); }
.unit { color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
</style>
