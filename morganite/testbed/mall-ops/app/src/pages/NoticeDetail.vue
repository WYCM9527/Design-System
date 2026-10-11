<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Left } from '@icon-park/vue-next'
import { announcements } from '../mock/data'

const route = useRoute()
const router = useRouter()
const a = announcements.find((x) => x.id === route.params.id)
</script>

<template>
  <el-card v-if="!a" class="flat" shadow="always">
    <div class="empty"><div class="illu" /><b>公告不存在或已撤回</b><el-button @click="router.push('/notices')">返回消息中心</el-button></div>
  </el-card>
  <template v-else>
    <div class="page-head">
      <div>
        <div class="title-row"><h1>{{ a.title }}</h1><span v-if="a.id === 'a1'" class="badge brand">置顶</span></div>
        <p>{{ a.author }} · 发布于 <span class="num">{{ a.time }}</span> · 全员可见</p>
      </div>
      <div class="actions"><el-button :icon="Left" @click="router.push('/notices')">返回</el-button></div>
    </div>
    <el-card class="flat" shadow="always">
      <article class="card-body article">
        <p>各位同事：双十一大促（10 月 20 日 – 11 月 11 日）期间订单量预计为平日的 4–6 倍。为保证发货时效与售后体验，现将安排通知如下。</p>
        <h3>一、发货安排</h3>
        <ul>
          <li>每日 18:00 截单，当日订单次日 12:00 前全部发出；预售订单按商品页标注的时间发货。</li>
          <li>11 月 10 日 – 12 日仓库三班倒，客服需在下单后 2 小时内处理「催发货」消息。</li>
          <li>物流异常订单（超过 48 小时未揽收）由仓库组长每日 10:00 统一跟进，结果同步到订单备注。</li>
        </ul>
        <h3>二、售后安排</h3>
        <p>大促期间「仅退款」申请金额在 <span class="num">¥200.00</span> 以内的，客服可直接同意；超过的仍需财务审核。七天无理由退货的时效从签收次日起算，不因大促延长。</p>
        <el-alert type="warning" show-icon :closable="false" title="定制刻字类商品不支持七天无理由退货" description="请在客户咨询时提前说明，避免售后纠纷。" />
        <h3>三、值班表</h3>
        <el-table :data="[{ d: '10-20 ~ 10-31', ops: '周一诺', svc: '何若溪', fin: '方时雨' }, { d: '11-01 ~ 11-09', ops: '许嘉禾', svc: '唐南乔', fin: '韩星辰' }, { d: '11-10 ~ 11-12', ops: '全员', svc: '全员', fin: '方时雨、韩星辰' }]" border>
          <el-table-column prop="d" label="日期" width="150" class-name="num" />
          <el-table-column prop="ops" label="运营" />
          <el-table-column prop="svc" label="客服" />
          <el-table-column prop="fin" label="财务" />
        </el-table>
        <p class="sign">运营中心<br><span class="num">2026-10-08</span></p>
      </article>
    </el-card>
  </template>
</template>

<style scoped>
.article { max-width: var(--layout-form-max-width); line-height: var(--text-paragraph-line-height); }
.article h3 { margin: var(--spacing-6) 0 var(--spacing-2); font-size: var(--text-title-sm-size); font-weight: var(--text-weight-strong); }
.article p { margin: 0 0 var(--spacing-3); }
.article ul { margin: 0 0 var(--spacing-3); padding-left: var(--spacing-5); }
.article li + li { margin-top: var(--spacing-1-5); }
.article .el-alert { margin: var(--spacing-4) 0; }
.article .sign { margin-top: var(--spacing-6); text-align: right; color: var(--color-text-secondary); }
</style>
