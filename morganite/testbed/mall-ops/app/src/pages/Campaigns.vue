<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, ViewList, AppStore } from '@icon-park/vue-next'
import PageHeader from '@wycm9527/morganite/vue/PageHeader.vue'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { can, needPerm, demo } from '../store'
import { campaigns, coupons, tone, yen, int } from '../mock/data'

const tab = ref(demo('tab') === 'coupons' ? 'coupons' : 'campaigns')   // ?tab=coupons
const view = ref(demo('view') === 'card' ? '卡片' : '列表')            // ?view=card
const keyword = ref('')
const status = ref('')
const rows = computed(() => campaigns.filter((c) => (!keyword.value || c.name.includes(keyword.value)) && (!status.value || c.status === status.value)))
const pct = (c) => (c.budget ? Math.round((c.used / c.budget) * 100) : 0)
const usage = (c) => (pct(c) >= 90 ? 'is-exception' : '')
function offline(c) {
  confirmDanger(`下线后活动立即停止，已领取未使用的优惠不受影响。`, `下线「${c.name}」？`, { confirmButtonText: '确认下线', cancelButtonText: '再想想' }).then(() => ElMessage.success('活动已下线')).catch(() => {})
}

// 新建活动弹窗：?dialog=1 直达
const open = ref(demo('dialog') === '1')
const form = reactive({ name: '', type: '满减', range: null, channels: ['小程序', 'App'], budget: 50000, threshold: 299, off: 30, stack: false })
const formRef = ref()
const rules = { name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }], range: [{ required: true, message: '请选择活动时间', trigger: 'change' }], channels: [{ type: 'array', min: 1, required: true, message: '至少选择一个渠道' }] }
async function create() {
  if (!(await formRef.value.validate().catch(() => false))) return
  open.value = false
  ElMessage.success('活动已提交审批')
}
</script>

<template>
  <PageHeader title="营销中心" subtitle="配置满减、折扣、秒杀与赠品活动，管理优惠券的发放与核销。">
    <template #actions>
      <el-tooltip :disabled="can('campaign.edit')" :content="needPerm('campaign.edit')"><span><el-button type="primary" :icon="Plus" :disabled="!can('campaign.edit')" @click="open = true">新建活动</el-button></span></el-tooltip>
    </template>
  </PageHeader>

  <el-card class="flat" shadow="always">
    <el-tabs v-model="tab">
      <el-tab-pane :label="`营销活动（${campaigns.length}）`" name="campaigns">
        <div class="filter">
          <div class="conds">
            <el-input v-model="keyword" class="w-search" placeholder="活动名称" aria-label="活动名称" clearable><template #prefix><Search /></template></el-input>
            <el-select v-model="status" class="w-select" placeholder="全部状态" aria-label="活动状态" clearable><el-option v-for="s in ['进行中', '即将开始', '待审核', '草稿', '已结束', '已下线']" :key="s" :label="s" :value="s" /></el-select>
          </div>
          <div class="acts">
            <el-radio-group v-model="view" aria-label="视图">
              <el-radio-button value="列表"><ViewList /> 列表</el-radio-button>
              <el-radio-button value="卡片"><AppStore /> 卡片</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div v-if="!rows.length" class="empty"><div class="illu" /><b>没有符合条件的活动</b></div>
        <el-table v-else-if="view === '列表'" :data="rows" row-key="id">
          <el-table-column label="活动" min-width="240"><template #default="{ row }"><span class="title-link">{{ row.name }}</span><span class="sub">{{ row.channels.join('、') }}</span></template></el-table-column>
          <el-table-column label="类型" width="80"><template #default="{ row }"><span class="tag">{{ row.type }}</span></template></el-table-column>
          <el-table-column prop="range" label="时间" width="130" class-name="num" />
          <el-table-column label="预算使用" min-width="200">
            <template #default="{ row }"><div class="usage"><el-progress :percentage="pct(row)" :show-text="false" :class="usage(row)" /><span class="sub num">{{ yen(row.used) }} / {{ yen(row.budget) }}</span></div></template>
          </el-table-column>
          <el-table-column label="状态" width="96"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <div class="act-group">
                <span :title="can('campaign.edit') ? '' : needPerm('campaign.edit')"><button class="act" type="button" :disabled="!can('campaign.edit') || row.status === '已结束'" @click="ElMessage.info('活动编辑页建设中')">编辑</button></span>
                <span v-if="row.status === '进行中'" :title="can('campaign.edit') ? '' : needPerm('campaign.edit')"><button class="act danger" type="button" :disabled="!can('campaign.edit')" @click="offline(row)">下线</button></span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="card-grid">
          <article v-for="c in rows" :key="c.id" class="ccard">
            <div class="ccard-top"><span class="tag">{{ c.type }}</span><span class="status" :class="tone(c.status)">{{ c.status }}</span></div>
            <b class="ccard-name">{{ c.name }}</b>
            <span class="sub">{{ c.range }} · {{ c.channels.join('、') }}</span>
            <el-progress :percentage="pct(c)" :class="usage(c)" />
            <span class="sub num">已用 {{ yen(c.used) }} / 预算 {{ yen(c.budget) }}</span>
          </article>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`优惠券（${coupons.length}）`" name="coupons">
        <div class="card-grid">
          <article v-for="cp in coupons" :key="cp.id" class="coupon" :class="{ 'is-off': ['已结束', '已过期', '草稿'].includes(cp.status) }">
            <div class="coupon-value"><b class="num">{{ cp.value }}</b><span>{{ cp.threshold }}</span></div>
            <div class="coupon-body">
              <div class="ccard-top"><b>{{ cp.name }}</b><span class="status" :class="tone(cp.status)">{{ cp.status }}</span></div>
              <span class="sub">{{ cp.type }} · {{ cp.validity }}</span>
              <el-progress :percentage="Math.round((cp.issued / cp.total) * 100)" />
              <div class="coupon-foot"><span class="sub num">已发 {{ int(cp.issued) }} / {{ int(cp.total) }}</span><span :title="can('coupon.issue') ? '' : needPerm('coupon.issue')"><button class="act" type="button" :disabled="!can('coupon.issue') || cp.status !== '进行中'" @click="ElMessage.success(`「${cp.name}」已加入发放队列`)">发放</button></span></div>
            </div>
          </article>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <el-dialog v-model="open" title="新建营销活动" class="is-md" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="form-grid dialog-grid">
        <el-form-item label="活动名称" prop="name" class="span2"><el-input v-model="form.name" maxlength="30" show-word-limit placeholder="如：双十一预热 · 满 999 减 120" /></el-form-item>
        <el-form-item label="活动类型" class="span2">
          <el-radio-group v-model="form.type"><el-radio-button v-for="t in ['满减', '折扣', '秒杀', '赠品']" :key="t" :value="t">{{ t }}</el-radio-button></el-radio-group>
        </el-form-item>
        <el-form-item label="活动时间" prop="range" class="span2"><el-date-picker v-model="form.range" type="datetimerange" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item label="投放渠道" prop="channels" class="span2"><el-checkbox-group v-model="form.channels"><el-checkbox v-for="c in ['小程序', 'App', '天猫', '抖音']" :key="c" :value="c">{{ c }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="门槛"><el-input-number v-model="form.threshold" :min="0" :step="50" controls-position="right" /><span class="help">满多少元可用</span></el-form-item>
        <el-form-item label="优惠"><el-input-number v-model="form.off" :min="1" controls-position="right" /><span class="help">减多少元</span></el-form-item>
        <el-form-item label="预算"><el-input v-model.number="form.budget"><template #prefix>¥</template></el-input></el-form-item>
        <el-form-item label="与店铺券叠加"><el-switch v-model="form.stack" aria-label="与店铺券叠加" /></el-form-item>
      </div>
    </el-form>
    <template #footer><el-button @click="open = false">取消</el-button><el-button @click="open = false; ElMessage.success('已存为草稿')">存为草稿</el-button><el-button type="primary" @click="create">提交审批</el-button></template>
  </el-dialog>
</template>

<style scoped>
.usage { display: grid; gap: var(--spacing-1); }
.ccard { display: grid; gap: var(--spacing-2); padding: var(--spacing-4); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-lg); }
.ccard-top { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); }
.ccard-name { font-weight: var(--text-weight-label); }
.coupon { display: grid; grid-template-columns: var(--illustration-size-md) minmax(0, 1fr); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-lg); overflow: hidden; }
.coupon-value { display: grid; place-content: center; gap: var(--spacing-1); text-align: center; padding: var(--spacing-3); background: var(--color-bg-brand); color: var(--color-text-on-brand); font-size: var(--text-small-size); }
.coupon-value b { font-family: var(--text-display-family); font-size: var(--text-heading-size); font-weight: var(--text-display-weight); line-height: var(--text-heading-line-height); }
.coupon.is-off .coupon-value { background: var(--color-bg-subtle); color: var(--color-text-muted); }
.coupon-body { display: grid; gap: var(--spacing-2); padding: var(--spacing-3) var(--spacing-4); min-width: 0; }
.coupon-foot { display: flex; align-items: center; justify-content: space-between; }
.dialog-grid { padding: 0; }
</style>
