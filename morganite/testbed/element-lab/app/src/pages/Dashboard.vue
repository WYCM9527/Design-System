<script setup>
import { ref } from 'vue'
import { Close } from '@icon-park/vue-next'
import StatCard from '@wycm9527/morganite/vue/StatCard.vue'
import TrendChart from '@wycm9527/morganite/vue/TrendChart.vue'

const days = ['09-23', '09-24', '09-25', '09-26', '09-27', '09-28', '09-29']
const series = [{ name: '净资产（万元）', data: [124.2, 125.1, 124.6, 126.3, 127.0, 128.1, 128.6] }]

const chips = ref(['类型：基金', '状态：处理中', '金额 ≥ ¥10,000'])
const rows = [
  { id: 'TX20260928001', title: '定投 · 沪深 300 ETF', cat: '基金', time: '09-28 10:24', amount: -5000, status: ['info', '处理中'] },
  { id: 'TX20260927014', title: '房产投资 · 季度分红', cat: '不动产', time: '09-27 16:05', amount: 2500, status: ['success', '已到账'] },
  { id: 'TX20260926008', title: '国债逆回购 · GC007', cat: '固收', time: '09-26 09:31', amount: -120000, status: ['info', '处理中'] },
  { id: 'TX20260925021', title: '外汇兑换 · 美元', cat: '外汇', time: '09-25 14:48', amount: -30000, status: ['warning', '待确认'] },
  { id: 'TX20260924003', title: '赎回 · 货币基金', cat: '现金', time: '09-24 11:02', amount: 8000, status: ['error', '已驳回'] },
  { id: 'TX20260922006', title: '黄金积存 · 月度定投', cat: '另类', time: '09-22 08:00', amount: -3000, status: ['neutral', '已撤销'] }
]
const money = (n) => `${n < 0 ? '−' : '+'}¥${Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
const page = ref(1)
</script>

<template>
  <div class="page-head">
    <div>
      <h1>工作台</h1>
      <p>Morganite 种子接入 Element Plus 后的业务页：统计卡、趋势图、筛选筹码、表格与分页都来自种子的配方与桥接。</p>
    </div>
  </div>

  <div class="stats">
    <StatCard label="总资产" value="¥1,286,420.00" delta="+2.35%" note="较上月" />
    <StatCard label="本月收益" value="¥12,480.32" delta="+5.42%" note="较上月" />
    <StatCard label="待处理交易" value="18" delta="-3" :up="false" :positive="true" note="较昨日" />
    <StatCard label="年化收益率" value="5.42%" delta="-0.18%" :up="false" note="较上月" />
  </div>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>资产趋势</h2></div>
    <div class="card-body"><TrendChart :days="days" :series="series" /></div>
  </el-card>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>交易记录</h2></div>
    <div class="chips" aria-label="已选条件">
      <span v-for="c in chips" :key="c" class="chip">{{ c }}<button class="x" type="button" :aria-label="`移除条件 ${c}`" @click="chips = chips.filter((x) => x !== c)"><Close class="i-icon--sm" /></button></span>
    </div>
    <el-table :data="rows" row-key="id">
      <el-table-column type="selection" width="44" />
      <el-table-column label="交易单号" width="160"><template #default="{ row }"><span class="mono">{{ row.id }}</span></template></el-table-column>
      <el-table-column prop="title" label="说明" min-width="180" />
      <el-table-column label="类别" width="96"><template #default="{ row }"><el-tag>{{ row.cat }}</el-tag></template></el-table-column>
      <el-table-column prop="time" label="时间" width="120" class-name="num" />
      <el-table-column label="金额" width="140" align="right" class-name="num"><template #default="{ row }">{{ money(row.amount) }}</template></el-table-column>
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status" :class="row.status[0]">{{ row.status[1] }}</span></template></el-table-column>
    </el-table>
    <div class="pager"><el-pagination v-model:current-page="page" background layout="total, prev, pager, next" :total="1286" :page-size="20" /></div>
  </el-card>
</template>
