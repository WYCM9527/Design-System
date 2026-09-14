<script setup>
// 页面框架（PRD §6.1）：左侧分组导航（可折叠）、顶部面包屑 / 站内通知 / 主题 / 当前身份与演示身份切换 / 测试工具。
// 壳层样式来自种子配方层 recipes.css（.app / .sidebar / .topbar / .iconbtn / .avatar…），这里只写业务。
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Home, Order, Audit, Box, Shop, ChartHistogram, TreeDiagram, Permissions, Setting, Log, Remind, Moon, Sunny, MenuFold, MenuUnfold, HamburgerButton, Down, Bug, CheckSmall } from '@icon-park/vue-next'
import { db } from '../data/db'
import { session, user, roleLabel, userDept, canSee, switchUser, toggleTheme } from '../data/session'
import { leaveIfClean } from '../data/guard'
import { myNotifications, unreadCount, markRead, markAllRead, activeMembers, pendingCount } from '../data/api'
import { ROLES } from '../data/constants'
import { timeOf } from '../data/format'

// el-menu-item 不透传 attrs，折叠后只剩图标：用指令把 aria-label 写到根元素（DESIGN 折叠侧栏配方）
const vAriaLabel = { mounted: (el, b) => el.setAttribute('aria-label', b.value), updated: (el, b) => el.setAttribute('aria-label', b.value) }

const route = useRoute(); const router = useRouter()
// 手机（≤ layout.breakpoint.mobile，字面镜像 768）：侧栏离屏抽屉，汉堡开、遮罩 / 选中菜单关；抽屉里永远是展开形态
const mqMobile = matchMedia('(max-width: 768px)')
const isMobile = ref(mqMobile.matches)
const navOpen = ref(false)
const onMq = (e) => { isMobile.value = e.matches; navOpen.value = false }
mqMobile.addEventListener('change', onMq)
onBeforeUnmount(() => mqMobile.removeEventListener('change', onMq))
router.afterEach(() => { navOpen.value = false })
const groups = [
  { title: '工作台', items: [{ key: 'dashboard', label: '工作台', to: '/', icon: Home }] },
  { title: '业务管理', items: [
    { key: 'applications', label: '采购申请', to: '/applications', icon: Order },
    { key: 'approvals', label: '审批中心', to: '/approvals', icon: Audit, badge: () => pendingCount() },
    { key: 'assets', label: '资产台账', to: '/assets', icon: Box },
    { key: 'suppliers', label: '供应商管理', to: '/suppliers', icon: Shop }
  ] },
  { title: '数据分析', items: [{ key: 'report', label: '数据报表', to: '/report', icon: ChartHistogram }] },
  { title: '系统管理', items: [
    { key: 'org', label: '组织与成员', to: '/org', icon: TreeDiagram },
    { key: 'roles', label: '角色权限', to: '/roles', icon: Permissions },
    { key: 'settings', label: '系统设置', to: '/settings', icon: Setting },
    { key: 'logs', label: '操作日志', to: '/logs', icon: Log }
  ] }
]
const visibleGroups = computed(() => groups.map((g) => ({ ...g, items: g.items.filter((i) => canSee(i.key)) })).filter((g) => g.items.length))
const activeKey = computed(() => route.meta.menu || '')
const crumbs = computed(() => [...(route.meta.crumbs || []), route.meta.title].filter(Boolean))
const brandInitial = computed(() => (db.settings.systemName || '轻').slice(0, 1))
// 系统名称保存后标题栏立即跟随（路由守卫只在导航时写 title）
watch(() => db.settings.systemName, () => { document.title = `${route.meta.title || ''} · ${db.settings.systemName}` })

// 站内通知面板（PRD §6.3）：最近 10 条、未读数、全部标为已读；点击标记已读并进入详情
const notifOpen = ref(false)
const notifs = computed(() => myNotifications(10))
const unread = computed(() => unreadCount())
function openNotif(n) { markRead(n.id); notifOpen.value = false; router.push(`/applications/${n.appId}`) }

// 演示身份切换：只列启用成员；切换成功回工作台，清除上个身份的筛选与选中；有未保存修改先确认
const members = computed(() => activeMembers())
async function onUser(cmd) {
  if (cmd === 'fail-list' || cmd === 'fail-submit') { session.failNext[cmd === 'fail-list' ? 'list' : 'submit'] = true; ElMessage.info(cmd === 'fail-list' ? '已设置：下一次列表加载将失败一次' : '已设置：下一次提交将失败一次'); return }
  if (cmd === session.userId) return
  if (!(await leaveIfClean())) return
  switchUser(cmd)
  router.push('/')
  ElMessage.success(`已切换为 ${user.value.name}（${roleLabel.value}）`)
}
</script>

<template>
  <div class="app" :class="{ 'is-collapsed': session.collapsed, 'is-nav-open': navOpen }">
    <aside class="sidebar">
      <div class="app-brand">
        <span class="logo"><img v-if="db.settings.logo" :src="db.settings.logo" alt="企业标识" /><template v-else>{{ brandInitial }}</template></span>
        <span v-if="!session.collapsed || isMobile">{{ db.settings.systemName }}</span>
      </div>
      <el-menu :default-active="activeKey" :collapse="session.collapsed && !isMobile" :collapse-transition="false" router>
        <el-menu-item-group v-for="g in visibleGroups" :key="g.title" :title="g.title">
          <el-menu-item v-for="item in g.items" :key="item.key" :index="item.key" :route="item.to" v-aria-label="item.label">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title><span class="menu-label">{{ item.label }}</span><span v-if="item.badge && item.badge()" class="menu-count num">{{ item.badge() }}</span></template>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div class="sidebar-foot">{{ session.collapsed ? 'v1.0' : `${db.settings.companyName} · V1.0 测试版` }}</div>
    </aside>

    <button v-if="navOpen" class="sidebar-mask" aria-label="关闭菜单" @click="navOpen = false" />

    <div class="main">
      <header class="topbar">
        <button class="iconbtn menu-btn" title="打开菜单" @click="navOpen = true"><HamburgerButton class="i-icon--lg" /></button>
        <button class="iconbtn collapse-btn" :title="session.collapsed ? '展开菜单' : '折叠菜单'" @click="session.collapsed = !session.collapsed">
          <component :is="session.collapsed ? MenuUnfold : MenuFold" class="i-icon--lg" />
        </button>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(c, i) in crumbs" :key="i">{{ c }}</el-breadcrumb-item>
        </el-breadcrumb>
        <span class="spacer"></span>

        <el-popover v-model:visible="notifOpen" trigger="click" placement="bottom-end" :width="360" popper-class="notif-pop" :show-arrow="false">
          <template #reference>
            <button class="iconbtn" :title="unread ? `通知（${unread} 条未读）` : '通知'" :aria-label="unread ? `通知，${unread} 条未读` : '通知'">
              <Remind class="i-icon--lg" />
              <span v-if="unread" class="unread num">{{ unread > 99 ? '99+' : unread }}</span>
            </button>
          </template>
          <div class="notif">
            <div class="notif-head"><b>通知</b><span class="sub" v-if="unread">{{ unread }} 条未读</span><button v-if="unread" class="act" @click="markAllRead()">全部标为已读</button></div>
            <ul v-if="notifs.length" class="notif-list">
              <li v-for="n in notifs" :key="n.id" :class="{ 'is-read': n.read }">
                <button class="notif-item" @click="openNotif(n)">
                  <span class="dot" aria-hidden="true"></span>
                  <span class="body">
                    <span class="line1"><span class="status" :class="n.result === 'approved' ? 'success' : 'error'">{{ n.result === 'approved' ? '已通过' : '已驳回' }}</span><span class="title">{{ n.title }}</span></span>
                    <span class="sub">{{ n.reason ? `原因：${n.reason}` : '申请已获准' }} · {{ timeOf(n.at) }}</span>
                  </span>
                </button>
              </li>
            </ul>
            <div v-else class="empty notif-empty"><CheckSmall class="i-icon--xl i-icon--muted" /><b>暂无通知</b></div>
          </div>
        </el-popover>

        <button class="iconbtn" :class="{ 'is-on': session.theme === 'dark' }" :title="session.theme === 'dark' ? '切换亮色' : '切换暗色'" @click="toggleTheme">
          <component :is="session.theme === 'dark' ? Sunny : Moon" class="i-icon--lg" />
        </button>

        <el-dropdown trigger="click" @command="onUser">
          <span class="user" role="button" tabindex="0" aria-haspopup="menu">
            <span class="avatar" aria-hidden="true">{{ user.name?.slice(0, 1) }}</span>
            <span class="user-name">{{ user.name }} · {{ roleLabel }}<span class="sub">{{ userDept }}</span></span>
            <Down class="i-icon--sm i-icon--muted" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <li class="dd-title">演示身份切换（启用成员）</li>
              <el-dropdown-item v-for="m in members" :key="m.id" :command="m.id" :disabled="m.id === session.userId">
                <span class="dd-user"><span>{{ m.name }}</span><span class="sub">{{ ROLES[m.role].label }} · {{ db.departments.find((d) => d.id === m.deptId)?.name }}</span></span>
              </el-dropdown-item>
              <li class="dd-title" style="margin-top: var(--spacing-1)"><Bug class="i-icon--xs" /> 测试工具（只影响下一次操作）</li>
              <el-dropdown-item command="fail-list">下一次列表加载失败</el-dropdown-item>
              <el-dropdown-item command="fail-submit">下一次提交失败</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content"><router-view /></main>
    </div>
  </div>
</template>

<style scoped>
.menu-label { flex: 1; }
/* 侧栏待办计数：中性反转小徽标，不用黄（黄不表达数量 / 强调） */
.menu-count { margin-left: var(--spacing-2); padding: 0 var(--spacing-1-5); border-radius: var(--radius-full); background: var(--color-action-selected); color: var(--color-text-on-selected); font-size: var(--text-caption-size); line-height: var(--size-icon-md); }
.el-menu-item.is-active .menu-count { background: var(--color-text-on-selected); color: var(--color-action-selected); }
.topbar .user-name .sub { display: inline; margin-left: var(--spacing-1-5); }
.dd-title { padding: var(--spacing-1-5) var(--spacing-4) var(--spacing-1); font-size: var(--text-small-size); color: var(--color-text-muted); list-style: none; display: flex; align-items: center; gap: var(--spacing-1); }
.dd-user { display: flex; flex-direction: column; line-height: var(--text-body-line-height); }
.dd-user .sub { font-size: var(--text-caption-size); }
/* 通知面板 */
.notif-head { display: flex; align-items: center; gap: var(--spacing-2); padding: var(--spacing-2) var(--spacing-3); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.notif-head .act { margin-left: auto; }
.notif-list { list-style: none; margin: 0; padding: 0; max-height: calc(var(--control-height-md) * 12); overflow: auto; }
.notif-item { display: flex; gap: var(--spacing-2-5); width: 100%; text-align: left; padding: var(--spacing-2-5) var(--spacing-3); background: transparent; border: 0; border-bottom: var(--border-width-default) solid var(--color-border-default); cursor: pointer; font: inherit; color: inherit; }
.notif-item:hover { background: var(--color-bg-hover); }
.notif-item .dot { flex: none; width: var(--spacing-2); height: var(--spacing-2); margin-top: var(--spacing-1-5); border-radius: var(--radius-full); background: var(--color-action-danger); }
.is-read .notif-item .dot { background: transparent; }
.notif-item .body { display: flex; flex-direction: column; gap: var(--spacing-0-5); min-width: 0; }
.notif-item .line1 { display: flex; align-items: center; gap: var(--spacing-2); min-width: 0; }
.notif-item .title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.is-read .notif-item .title { color: var(--color-text-secondary); }
.notif-empty { padding: var(--spacing-6) var(--spacing-3); }
</style>

<style>
.notif-pop.el-popover { padding: 0; }
</style>
