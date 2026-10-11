<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Filter, Download } from '@icon-park/vue-next'
import { can, needPerm } from '../store'
import { customers, tone, yen, int } from '../mock/data'

const LEVELS = ['普通会员', '银卡会员', '金卡会员', '黑金会员']
const TAGS = ['高复购', '礼品客', '价格敏感', '新客', '大促活跃', '珍珠偏好', '腕表偏好', '生日月']
const draft = reactive({ keyword: '', level: '', tags: [], channel: '' })
const applied = ref({ ...draft, tags: [] })
const rows = computed(() => {
  const f = applied.value
  return customers.filter((c) =>
    (!f.keyword || c.name.includes(f.keyword) || c.phone.includes(f.keyword) || c.id.includes(f.keyword)) &&
    (!f.level || c.level === f.level) &&
    (!f.tags.length || f.tags.every((t) => c.tags.includes(t))) &&
    (!f.channel || c.channel === f.channel))
})
const sort = ref({ prop: 'spent', order: 'descending' })
const sorted = computed(() => {
  const { prop, order } = sort.value
  if (!prop || !order) return rows.value
  return rows.value.slice().sort((a, b) => (order === 'ascending' ? 1 : -1) * (a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0))
})
const page = ref(1)
const paged = computed(() => sorted.value.slice((page.value - 1) * 10, page.value * 10))
const search = () => { applied.value = { ...draft, tags: [...draft.tags] }; page.value = 1 }
const reset = () => { Object.assign(draft, { keyword: '', level: '', tags: [], channel: '' }); search() }
</script>

<template>
  <div class="page-head">
    <div>
      <h1>客户管理</h1>
      <p>查看会员等级、消费与标签；点客户进入详情发券或打标签。</p>
    </div>
    <div class="actions">
      <el-tooltip :disabled="can('report.export')" :content="needPerm('report.export')"><span><el-button :icon="Download" :disabled="!can('report.export')" @click="ElMessage.success(`已导出 ${rows.length} 位客户`)">导出</el-button></span></el-tooltip>
    </div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="filter">
      <div class="conds">
        <el-input v-model="draft.keyword" class="w-search" placeholder="姓名 / 手机尾号 / 客户 ID" aria-label="关键词" clearable><template #prefix><Search /></template></el-input>
        <el-select v-model="draft.level" class="w-select" placeholder="全部等级" aria-label="会员等级" clearable><el-option v-for="l in LEVELS" :key="l" :label="l" :value="l" /></el-select>
        <el-select v-model="draft.tags" class="w-search" multiple collapse-tags collapse-tags-tooltip placeholder="客户标签" aria-label="客户标签"><el-option v-for="t in TAGS" :key="t" :label="t" :value="t" /></el-select>
        <el-select v-model="draft.channel" class="w-select" placeholder="注册渠道" aria-label="注册渠道" clearable><el-option v-for="c in ['小程序', 'App', '天猫', '抖音']" :key="c" :label="c" :value="c" /></el-select>
      </div>
      <div class="acts"><el-button text @click="reset">重置</el-button><el-button :icon="Filter" @click="search">查询</el-button></div>
    </div>

    <div v-if="!rows.length" class="empty"><div class="illu" /><b>没有符合条件的客户</b><span>减少标签条件再试</span><el-button @click="reset">清除筛选</el-button></div>
    <template v-else>
      <el-table :data="paged" row-key="id" :default-sort="{ prop: 'spent', order: 'descending' }" @sort-change="({ prop, order }) => (sort = { prop, order })">
        <el-table-column label="客户" min-width="180">
          <template #default="{ row }"><div class="who"><span class="avatar">{{ row.name[0] }}</span><span><router-link class="title-link" :to="`/customers/${row.id}`">{{ row.name }}</router-link><span class="sub num">{{ row.phone }}</span></span></div></template>
        </el-table-column>
        <el-table-column label="等级" width="100"><template #default="{ row }"><span class="badge" :class="row.levelIx === 3 ? 'brand' : 'neutral'">{{ row.level }}</span></template></el-table-column>
        <el-table-column prop="spent" label="累计消费" width="130" align="right" class-name="num" sortable="custom"><template #default="{ row }">{{ yen(row.spent) }}</template></el-table-column>
        <el-table-column prop="orders" label="订单数" width="100" align="right" class-name="num" sortable="custom"><template #default="{ row }">{{ int(row.orders) }}</template></el-table-column>
        <el-table-column prop="last" label="最近下单" width="110" class-name="num" sortable="custom" />
        <el-table-column label="标签" min-width="180"><template #default="{ row }"><div class="tags"><span v-for="t in row.tags" :key="t" class="tag">{{ t }}</span></div></template></el-table-column>
        <el-table-column label="状态" width="86"><template #default="{ row }"><span class="status" :class="tone(row.status)">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="90" fixed="right"><template #default="{ row }"><router-link class="act" :to="`/customers/${row.id}`">详情</router-link></template></el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next, jumper" :total="rows.length" :page-size="10" /></div>
    </template>
  </el-card>
</template>

<style scoped>
.who { display: flex; align-items: center; gap: var(--spacing-2-5); }
.tags { display: flex; flex-wrap: wrap; gap: var(--spacing-1); }
</style>
