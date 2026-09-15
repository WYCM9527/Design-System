<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { announcements } from '../mock/data'
const route = useRoute()
const ann = computed(() => announcements.find((a) => a.id === route.params.id) || announcements[0])
</script>

<template>
  <article class="doc">
    <header class="doc-head">
      <span class="badge neutral">{{ ann.tag }}</span>
      <h1>{{ ann.title }}</h1>
      <p class="meta">{{ ann.author }} · 发布于 <span class="num">{{ ann.time }}</span> · 约 4 分钟</p>
    </header>
    <el-card class="flat" shadow="always">
      <div class="prose">
        <p>为了统一各城市运营同学在订单异常处理上的口径，减少商户与用户的等待时间，本次对<strong>改派</strong>与<strong>取消</strong>两类操作的处理时限做出如下规定。规定自 9 月 15 日起生效，此前的口头约定同时废止。</p>
        <h2>一、适用范围</h2>
        <p>本规范适用于全部已上线城市的外卖与到店订单。企业客户的批量订单与平台自营配送不在此列，仍按原有 SLA 执行。</p>
        <h2>二、改派的处理时限</h2>
        <p>订单在「待接单」状态下停留超过 <strong>15 分钟</strong>，系统会在通知中心产生一条运营通知，并在工作台待办中置顶。运营同学应在收到通知后：</p>
        <ol>
          <li>先催单一次，等待不超过 5 分钟；</li>
          <li>仍未接单的，从附近空闲骑手中改派，优先评分 ≥ 4.7 且当前单量 ≤ 2 的骑手；</li>
          <li>连续两次改派失败的订单，标记为异常并转交城市负责人。</li>
        </ol>
        <h3>各城市的容忍上限</h3>
        <table>
          <thead><tr><th>城市</th><th>待接单上限</th><th>配送超时上限</th><th>负责人</th></tr></thead>
          <tbody>
            <tr><td>北京 / 上海</td><td class="num">15 分钟</td><td class="num">45 分钟</td><td>李雪</td></tr>
            <tr><td>广州 / 深圳</td><td class="num">15 分钟</td><td class="num">40 分钟</td><td>张伟</td></tr>
            <tr><td>杭州 / 成都</td><td class="num">20 分钟</td><td class="num">45 分钟</td><td>吴磊</td></tr>
          </tbody>
        </table>
        <h2>三、取消的处理时限</h2>
        <p>用户发起的取消在商户接单前自动通过；接单后的取消需要运营在 <strong>10 分钟</strong>内处理。已出餐的订单取消需同时通知骑手返回，退款按原路径在 1–3 个工作日内到账。</p>
        <blockquote>凡是系统能自动完成的判断，不要让人来做；凡是需要人判断的，要在 10 分钟内给出结果——这是本次修订的两条原则。</blockquote>
        <h2>四、例外与申诉</h2>
        <p>恶劣天气、平台故障等不可抗力期间，上述时限自动放宽一倍，届时会在通知中心发布系统通知。对处理结果有异议的商户可在 48 小时内通过商户后台申诉，由审核组复核。</p>
        <p>如对本规范有疑问，请在工作日 9:00–18:00 联系运营中心，或在本公告下留言。</p>
      </div>
    </el-card>
  </article>
</template>

<style scoped>
.doc { max-width: var(--layout-form-max-width); }
.doc-head { margin-bottom: var(--space-stack); }
.doc-head h1 { margin: var(--spacing-2) 0 var(--spacing-1); font-size: var(--text-hero-size); line-height: var(--text-hero-line-height); font-weight: var(--text-weight-brand); }
.meta { margin: 0; color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
/* 长文排版：全站唯一的段落页面（PRD §5.3） */
.prose { padding: var(--space-card) calc(var(--space-card) + var(--spacing-2)); line-height: var(--text-paragraph-line-height); color: var(--color-text-primary); }
.prose p { margin: 0 0 var(--spacing-4); }
.prose h2 { font-size: var(--text-title-size); font-weight: var(--text-weight-strong); margin: var(--spacing-6) 0 var(--spacing-3); }
.prose h3 { font-size: var(--text-title-sm-size); font-weight: var(--text-weight-strong); margin: var(--spacing-5) 0 var(--spacing-2); color: var(--color-text-secondary); }
.prose ol { margin: 0 0 var(--spacing-4); padding-left: var(--spacing-6); }
.prose li { margin-bottom: var(--spacing-1-5); }
.prose strong { font-weight: var(--text-weight-strong); }
.prose table { width: 100%; border-collapse: collapse; margin: 0 0 var(--spacing-4); font-size: var(--text-body-sm-size); }
.prose th, .prose td { text-align: left; padding: var(--spacing-2-5) var(--spacing-3); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.prose th { background: var(--color-bg-subtle); color: var(--color-text-secondary); font-weight: var(--text-weight-label); font-size: var(--text-small-size); }
.prose blockquote { margin: 0 0 var(--spacing-4); padding: var(--spacing-3) var(--spacing-4); border-left: var(--border-width-indicator) solid var(--color-border-strong); background: var(--color-bg-selected-subtle);   /* 引用块边线用中性 border.strong：品牌指示条只属于数据卡与导航选中，不给正文引用（页面级黄色审计） */ color: var(--color-text-secondary); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
</style>
