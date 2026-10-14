<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Phone, Mail } from '@icon-park/vue-next'
import PageHeader from '@wycm9527/morganite/vue/PageHeader.vue'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { store, setTheme, setPreferCollapsed, demo } from '../store'

// 与效果预览的系统设置页同构（四个页签、横向表单、设置行），外观页签接到壳层（主题、默认折叠）
const tab = ref(['profile', 'notify', 'security', 'look'].includes(demo('tab')) ? demo('tab') : 'notify')   // ?tab=
const profile = reactive({ name: store.user.name, phone: '138 **** 6621', mail: 'linxia@shiguang.shop', dept: '运营中心', bio: '' })
const notify = reactive({ order: true, refund: true, daily: false, marketing: false, channels: ['站内信', '短信'], quiet: '22:00 – 08:00' })
const security = reactive({ twoStep: true })
const density = ref('default')
const theme = ref(store.theme)
const onTheme = (v) => setTheme(v)
const closeAccount = () => confirmDanger('注销后你将无法登录，名下的待处理事项会转交给管理员。数据保留 30 天，期间可联系管理员恢复。', '确定注销账户？', { confirmButtonText: '确认注销', cancelButtonText: '再想想' }).then(() => ElMessage.success('已提交注销申请')).catch(() => {})
</script>

<template>
  <PageHeader title="系统设置" subtitle="个人资料、通知、安全与外观偏好，修改后立即生效。" />

  <el-card class="flat" shadow="always">
    <el-tabs v-model="tab">
      <el-tab-pane label="个人资料" name="profile">
        <el-form class="hform" :model="profile" label-position="right">
          <el-form-item label="头像"><div class="avatar-row"><span class="avatar">{{ store.user.initial }}</span><el-button size="small" @click="ElMessage.info('头像上传建设中')">更换头像</el-button></div></el-form-item>
          <el-form-item label="姓名" required><el-input v-model="profile.name" /></el-form-item>
          <el-form-item label="手机" required><el-input v-model="profile.phone"><template #prefix><Phone /></template></el-input><span class="help">用于登录验证与异常订单提醒</span></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="profile.mail"><template #prefix><Mail /></template></el-input></el-form-item>
          <el-form-item label="所在部门"><el-select v-model="profile.dept"><el-option v-for="d in ['运营中心', '客服部', '财务部', '品控部']" :key="d" :label="d" :value="d" /></el-select></el-form-item>
          <el-form-item label="个人简介"><el-input v-model="profile.bio" type="textarea" :rows="3" placeholder="一句话介绍自己" /></el-form-item>
          <el-form-item><el-button type="primary" @click="ElMessage.success('资料已保存')">保存</el-button><el-button text>重置</el-button></el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="通知" name="notify">
        <div class="card-body"><el-alert type="info" show-icon :closable="false" title="通知设置对网页、App 与短信同时生效；物流异常与售后超时类通知不受免打扰影响。" /></div>
        <div class="setting"><div class="text"><b>订单状态变更</b><span class="sub">付款、发货、签收与物流异常时通知</span></div><el-switch v-model="notify.order" aria-label="订单状态变更" /></div>
        <div class="setting"><div class="text"><b>售后待处理</b><span class="sub">新的售后申请与 24 小时未处理提醒</span></div><el-switch v-model="notify.refund" aria-label="售后待处理" /></div>
        <div class="setting"><div class="text"><b>经营日报</b><span class="sub">每天 09:00 推送昨日销售与待办</span></div><el-switch v-model="notify.daily" aria-label="经营日报" /></div>
        <div class="setting"><div class="text"><b>平台营销推送</b><span class="sub">管理员已关闭，成员不可开启</span></div><el-switch v-model="notify.marketing" disabled aria-label="平台营销推送" /></div>
        <div class="setting"><div class="text"><b>通知渠道</b><span class="sub">至少保留一个渠道</span></div><el-checkbox-group v-model="notify.channels" :min="1"><el-checkbox value="站内信">站内信</el-checkbox><el-checkbox value="短信">短信</el-checkbox><el-checkbox value="邮件">邮件</el-checkbox></el-checkbox-group></div>
        <div class="setting"><div class="text"><b>免打扰时段</b><span class="sub">期间只推送物流异常与售后超时</span></div><el-select v-model="notify.quiet" class="w-select" aria-label="免打扰时段"><el-option v-for="q in ['22:00 – 08:00', '23:00 – 07:00', '不开启']" :key="q" :label="q" :value="q" /></el-select></div>
      </el-tab-pane>

      <el-tab-pane label="安全" name="security">
        <div class="setting"><div class="text"><b>登录密码</b><span class="sub">上次修改于 3 个月前</span></div><button class="act" type="button" @click="ElMessage.success('已发送修改链接到手机')">修改</button></div>
        <div class="setting"><div class="text"><b>两步验证</b><span class="sub">登录与导出报表时需要短信验证码</span></div><span class="status" :class="security.twoStep ? 'success' : 'neutral'">{{ security.twoStep ? '已开启' : '未开启' }}</span><el-switch v-model="security.twoStep" aria-label="两步验证" /></div>
        <div class="setting"><div class="text"><b>MacBook Air · Safari</b><span class="sub">杭州 · 当前设备</span></div><span class="badge brand">本机</span></div>
        <div class="setting"><div class="text"><b>iPhone 16 · 拾光商城 App</b><span class="sub">杭州 · 2 小时前活跃</span></div><button class="act danger" type="button" @click="ElMessage.success('该设备已下线')">下线</button></div>
        <div class="setting"><div class="text"><b>注销账户</b><span class="sub">注销后数据保留 30 天，期间可联系管理员恢复</span></div><el-button type="danger" size="small" @click="closeAccount">注销账户</el-button></div>
      </el-tab-pane>

      <el-tab-pane label="外观" name="look">
        <div class="setting"><div class="text"><b>主题</b><span class="sub">与顶栏的亮 / 暗切换同步</span></div><el-radio-group v-model="theme" aria-label="主题" @change="onTheme"><el-radio-button value="light">亮色</el-radio-button><el-radio-button value="dark">暗色</el-radio-button></el-radio-group></div>
        <div class="setting"><div class="text"><b>界面密度</b><span class="sub">影响表格行高与卡片留白（实测项目未接入）</span></div><el-radio-group v-model="density" aria-label="界面密度"><el-radio value="compact">紧凑</el-radio><el-radio value="default">默认</el-radio><el-radio value="loose">宽松</el-radio></el-radio-group></div>
        <div class="setting"><div class="text"><b>默认折叠侧栏</b><span class="sub">窄屏（≤ 992px）下始终折叠</span></div><el-switch :model-value="store.preferCollapsed" aria-label="默认折叠侧栏" @update:model-value="setPreferCollapsed" /></div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

