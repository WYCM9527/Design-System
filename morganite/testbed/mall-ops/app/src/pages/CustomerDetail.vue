<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Ticket, Tag, Lock } from '@icon-park/vue-next'
import PageHeader from '@wycm9527/morganite/vue/PageHeader.vue'
import StatCard from '@wycm9527/morganite/vue/StatCard.vue'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { can, needPerm, demo } from '../store'
import { customers, orders, refunds, coupons, tone, yen, int } from '../mock/data'

const route = useRoute()
const router = useRouter()
const c = customers.find((x) => x.id === route.params.id)
const tab = ref(['orders', 'refunds', 'profile'].includes(demo('tab')) ? demo('tab') : 'orders')   // ?tab=
const myOrders = c ? orders.filter((o) => o.customerId === c.id) : []
const myRefunds = c ? refunds.filter((r) => myOrders.some((o) => o.id === r.orderId)) : []
const tags = ref(c ? [...c.tags] : [])
const tagInput = ref('')
const addTag = () => { const t = tagInput.value.trim(); if (t && !tags.value.includes(t)) tags.value.push(t); tagInput.value = '' }

const couponOpen = ref(false)
const pick = ref('CP001')
function freeze() {
  confirmDanger(`冻结后 ${c.name} 无法下单与使用优惠券，进行中的订单不受影响；可随时解冻。`, `冻结客户 ${c.name}？`, { confirmButtonText: '确认冻结', cancelButtonText: '再想想' })
    .then(() => ElMessage.success('已冻结')).catch(() => {})
}
</script>

<template>
  <el-card v-if="!c" class="flat" shadow="always">
    <div class="empty"><div class="illu" /><b>没有找到客户 {{ route.params.id }}</b><span>客户可能已注销，或 ID 输错了</span><el-button @click="router.push('/customers')">返回客户列表</el-button></div>
  </el-card>

  <template v-else>
    <PageHeader :title="c.name">
      <template #leading><span class="avatar">{{ c.name[0] }}</span></template>
      <template #status><span class="badge" :class="c.levelIx === 3 ? 'brand' : 'neutral'">{{ c.level }}</span><span class="status" :class="tone(c.status)">{{ c.status }}</span></template>
      <template #subtitle>客户 ID <span class="mono">{{ c.id }}</span> · {{ c.channel }}注册于 {{ c.joined }} · 生日 {{ c.birthday }}</template>
      <template #actions>
        <el-tooltip :disabled="can('coupon.issue')" :content="needPerm('coupon.issue')"><span><el-button :icon="Ticket" :disabled="!can('coupon.issue') || c.status === '已冻结'" @click="couponOpen = true">发优惠券</el-button></span></el-tooltip>
        <el-tooltip :disabled="can('customer.edit')" :content="needPerm('customer.edit')"><span><el-button type="danger" plain :icon="Lock" :disabled="!can('customer.edit') || c.status === '已冻结'" @click="freeze">冻结</el-button></span></el-tooltip>
      </template>
    </PageHeader>

    <div class="stats">
      <StatCard label="累计消费" :value="yen(c.spent)" note="近 3 年" />
      <StatCard label="订单数" :value="int(c.orders)" note="含已关闭" />
      <StatCard label="客单价" :value="yen(Math.round((c.spent / c.orders) * 100) / 100)" />
      <StatCard label="可用积分" :value="int(c.points)" note="100 积分抵 ¥1" />
    </div>

    <el-card class="flat" shadow="always">
      <el-tabs v-model="tab">
        <el-tab-pane :label="`订单记录（${myOrders.length}）`" name="orders">
          <el-table v-if="myOrders.length" :data="myOrders" row-key="id">
            <el-table-column label="订单号" width="180"><template #default="{ row }"><router-link class="link mono" :to="`/orders/${row.id}`">{{ row.id }}</router-link></template></el-table-column>
            <el-table-column label="商品" min-width="200"><template #default="{ row }">{{ row.items[0].name }}{{ row.items.length > 1 ? ` 等 ${row.items.length} 件` : '' }}</template></el-table-column>
            <el-table-column prop="time" label="下单时间" width="140" class-name="num" />
            <el-table-column label="实付" width="120" align="right" class-name="num"><template #default="{ row }">{{ yen(row.amount) }}</template></el-table-column>
            <el-table-column label="状态" width="96"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
          </el-table>
          <div v-else class="empty"><b>近 90 天没有订单</b></div>
        </el-tab-pane>
        <el-tab-pane :label="`售后记录（${myRefunds.length}）`" name="refunds">
          <el-table v-if="myRefunds.length" :data="myRefunds" row-key="id">
            <el-table-column label="售后单号" width="160"><template #default="{ row }"><span class="mono">{{ row.id }}</span></template></el-table-column>
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
            <el-table-column label="金额" width="120" align="right" class-name="num"><template #default="{ row }">{{ row.type === '换货' ? '—' : yen(row.amount) }}</template></el-table-column>
            <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
          </el-table>
          <div v-else class="empty"><div class="illu" /><b>没有售后记录</b><span>这位客户从未申请过退款或换货</span></div>
        </el-tab-pane>
        <el-tab-pane label="资料与标签" name="profile">
          <div class="card-body profile">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="手机号"><span class="num">{{ c.phone }}</span></el-descriptions-item>
              <el-descriptions-item label="注册渠道">{{ c.channel }}</el-descriptions-item>
              <el-descriptions-item label="会员等级">{{ c.level }}</el-descriptions-item>
              <el-descriptions-item label="最近下单"><span class="num">{{ c.last }}</span></el-descriptions-item>
              <el-descriptions-item label="生日">{{ c.birthday }}</el-descriptions-item>
              <el-descriptions-item label="可用积分"><span class="num">{{ int(c.points) }}</span></el-descriptions-item>
            </el-descriptions>
            <div>
              <h3 class="drawer-h">客户标签</h3>
              <div class="tag-edit">
                <el-tag v-for="t in tags" :key="t" :closable="can('customer.edit')" @close="tags = tags.filter((x) => x !== t)">{{ t }}</el-tag>
                <el-input v-if="can('customer.edit')" v-model="tagInput" class="w-select" size="small" placeholder="新标签，回车添加" @keyup.enter="addTag"><template #prefix><Tag /></template></el-input>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="couponOpen" :title="`给 ${c.name} 发优惠券`" class="is-sm" append-to-body>
      <el-radio-group v-model="pick" class="coupon-pick">
        <el-radio v-for="cp in coupons.filter((x) => x.status === '进行中')" :key="cp.id" :value="cp.id">{{ cp.name }}<span class="sub">{{ cp.threshold }} · {{ cp.validity }}</span></el-radio>
      </el-radio-group>
      <template #footer><el-button @click="couponOpen = false">取消</el-button><el-button type="primary" @click="couponOpen = false; ElMessage.success('优惠券已发放，客户会收到短信')">发放</el-button></template>
    </el-dialog>
  </template>
</template>

<style scoped>
.profile { display: grid; gap: var(--space-stack); }
.tag-edit { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-2); }
.coupon-pick { display: grid; gap: var(--spacing-3); }
.coupon-pick :deep(.el-radio) { height: auto; align-items: flex-start; margin-right: 0; }
</style>
