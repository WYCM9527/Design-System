<script setup>
// 角色权限（PRD P10）：左侧三个预置角色（显示启用成员数），右侧角色说明 + 只读权限矩阵。内容严格对应 PRD §2 权限表与补充规则。
// 本页只读：没有保存 / 新增按钮；角色调整在「组织与成员」完成。
// 演示参数（放在 # 之前）：?tab=applicant|approver|admin 直达某角色（?role= 已被 session 用作身份参数，所以这里读 tab）。
import { computed, ref } from 'vue'
import { CheckOne, Right } from '@icon-park/vue-next'
import { ROLES } from '../data/constants'
import { roleCounts } from '../data/api'
import { demoParam } from '../data/session'

const KEYS = Object.keys(ROLES)
const wanted = demoParam('tab')
const cur = ref(KEYS.includes(wanted) ? wanted : 'applicant')
const counts = computed(() => roleCounts())

// 权限矩阵：每个模块 × 角色 = { scope: 本人 | 全部 | 无入口 | 只读, ops: 可执行操作, ok: 是否可用, note?: 补充说明 }
const NONE = (note) => ({ scope: '无入口', ops: [], ok: false, note })
const MATRIX = [
  { module: '工作台', cells: {
    applicant: { scope: '本人', ops: ['查看本人的申请与资产指标、趋势图', '查看最近申请', '新建采购申请'], ok: true },
    approver: { scope: '本人', ops: ['查看本人的申请与资产指标、趋势图', '查看最近申请', '新建采购申请', '查看「待我审批」摘要（排除本人申请）'], ok: true },
    admin: { scope: '本人', ops: ['查看本人的申请与资产指标、趋势图', '查看最近申请', '新建采购申请'], ok: true }
  } },
  { module: '采购申请', cells: {
    applicant: { scope: '本人', ops: ['创建采购申请', '编辑、提交、删除本人的草稿', '复制本人可见的申请'], ok: true, note: '仅看到本人的申请；复制生成一张属于自己的新草稿，不改变原申请' },
    approver: { scope: '全部', ops: ['查看全部申请', '创建采购申请', '编辑、提交、删除本人的草稿', '复制可见申请', '导出'], ok: true, note: '草稿只能由申请人本人编辑、提交或删除' },
    admin: { scope: '全部', ops: ['查看全部申请', '创建采购申请', '编辑、提交、删除本人的草稿', '复制可见申请', '导出'], ok: true, note: '草稿只能由申请人本人编辑、提交或删除' }
  } },
  { module: '审批', cells: {
    applicant: NONE('没有审批中心入口'),
    approver: { scope: '全部', ops: ['通过 / 驳回待审批申请', '查看「我已处理」记录'], ok: true, note: '排除本人提交的申请——本人申请不能由本人审批' },
    admin: NONE('管理员角色不自动获得审批权')
  } },
  { module: '资产台账', cells: {
    applicant: { scope: '本人', ops: ['查看本人在用的资产'], ok: true, note: '只显示本人当前在用的资产，不能解除本人范围' },
    approver: { scope: '全部', ops: ['查看全部资产', '导出'], ok: true, note: '只读：不能登记、编辑、分配或归还' },
    admin: { scope: '全部', ops: ['查看全部资产', '登记资产', '编辑资产', '分配给启用成员', '确认归还', '导出'], ok: true }
  } },
  { module: '供应商', cells: {
    applicant: NONE('采购表单中仍可选择启用的供应商，这不代表拥有供应商管理权限'),
    approver: NONE('采购表单中仍可选择启用的供应商，这不代表拥有供应商管理权限'),
    admin: { scope: '全部', ops: ['查看供应商', '新增', '编辑', '启用 / 停用'], ok: true, note: '停用后不可用于新申请，历史申请不受影响' }
  } },
  { module: '数据报表', cells: {
    applicant: NONE(),
    approver: { scope: '全部', ops: ['按提交日期范围、部门查看采购统计', '导出汇总'], ok: true },
    admin: { scope: '全部', ops: ['按提交日期范围、部门查看采购统计', '导出汇总'], ok: true }
  } },
  { module: '组织与成员', cells: {
    applicant: NONE(),
    approver: NONE(),
    admin: { scope: '全部', ops: ['按组织树查看成员', '新增成员', '编辑成员（部门、角色）', '启用 / 停用成员'], ok: true, note: '不能停用当前操作账号或修改其角色；不能移除最后一名启用管理员' }
  } },
  { module: '角色权限', cells: {
    applicant: NONE(),
    approver: NONE(),
    admin: { scope: '只读', ops: ['查看角色说明与权限矩阵'], ok: true, note: '系统预置角色，权限不可编辑' }
  } },
  { module: '系统设置', cells: {
    applicant: NONE(),
    approver: NONE(),
    admin: { scope: '全部', ops: ['修改基础设置（系统名称、企业名称、Logo、每页条数）', '修改通知设置', '恢复演示数据'], ok: true }
  } },
  { module: '操作日志', cells: {
    applicant: NONE(),
    approver: NONE(),
    admin: { scope: '全部', ops: ['查询日志', '查看操作前后摘要'], ok: true, note: '只读：不提供编辑、删除或导出' }
  } },
  { module: '导出', cells: {
    applicant: NONE('不能导出采购、资产和报表'),
    approver: { scope: '全部', ops: ['导出采购申请、资产台账、报表汇总（CSV）'], ok: true, note: '只能导出自己有权查看的数据，覆盖当前筛选条件下的全部结果' },
    admin: { scope: '全部', ops: ['导出采购申请、资产台账、报表汇总（CSV）'], ok: true, note: '只能导出自己有权查看的数据，覆盖当前筛选条件下的全部结果' }
  } }
]
const rows = computed(() => MATRIX.map((m) => ({ module: m.module, ...m.cells[cur.value] })))
const okCount = computed(() => rows.value.filter((r) => r.ok).length)

// PRD §2 补充规则，整页只读展示
const EXTRA_RULES = [
  '所有人在采购表单中都能选择启用的供应商；这不代表拥有供应商管理权限。',
  '复制任意可见申请时，生成一张属于当前用户的新草稿，不改变原申请。',
  '隐藏无权限菜单和按钮。直接访问无权限页面时显示「暂无访问权限」，提供返回工作台入口。',
  '管理员角色不自动获得审批权。本人申请也不能由本人审批。',
  '初始演示数据包含两名启用审批人，便于验证审批人提交的申请由另一人处理。'
]
</script>

<template>
  <div class="page-head">
    <div><h1>角色权限</h1><p>三个系统预置角色能看到什么、能执行什么；成员的角色在「组织与成员」里调整</p></div>
  </div>

  <el-alert type="info" :closable="false" show-icon>
    <template #title>系统预置角色，权限不可编辑。角色调整在「组织与成员」完成。<router-link class="go" to="/org">前往组织与成员<Right class="i-icon--sm" /></router-link></template>
  </el-alert>

  <div class="split">
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>角色</h2></div>
      <ul class="role-list" role="tablist" aria-label="角色">
        <li v-for="k in KEYS" :key="k" role="presentation">
          <button type="button" role="tab" :id="`role-tab-${k}`" aria-controls="role-panel" :aria-selected="cur === k" class="role-item" :class="{ on: cur === k }" @click="cur = k">
            <span class="role-name">{{ ROLES[k].label }}</span><span class="role-cnt num">{{ counts[k] }} 人</span>
          </button>
        </li>
      </ul>
    </el-card>

    <el-card id="role-panel" class="flat" shadow="always" role="tabpanel" :aria-labelledby="`role-tab-${cur}`">
      <div class="card-head"><h2>「{{ ROLES[cur].label }}」的权限</h2><div class="right"><span class="sub">启用成员 <span class="num">{{ counts[cur] }}</span> 人 · 可用模块 <span class="num">{{ okCount }}</span> / {{ rows.length }}</span></div></div>
      <p class="desc">{{ ROLES[cur].desc }}</p>
      <el-table :data="rows" style="width: 100%">
        <el-table-column label="模块" width="140"><template #default="{ row }"><span class="mod" :class="{ muted: !row.ok }">{{ row.module }}</span></template></el-table-column>
        <el-table-column label="查看范围" width="120"><template #default="{ row }"><span :class="{ muted: !row.ok }">{{ row.scope }}</span></template></el-table-column>
        <el-table-column label="可执行操作" min-width="360">
          <template #default="{ row }">
            <span :class="{ muted: !row.ok }">{{ row.ops.length ? row.ops.join('；') : '—' }}</span>
            <span v-if="row.note" class="sub">{{ row.note }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否可用" width="120">
          <template #default="{ row }">
            <!-- 只读勾选：图标 + 文字同时出现，不只靠颜色 -->
            <span class="avail" :class="row.ok ? 'yes' : 'no'"><CheckOne v-if="row.ok" class="i-icon--md i-icon--success" /><span v-else class="dash" aria-hidden="true">—</span>{{ row.ok ? '可以' : '不可以' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="notes">
        <b>补充规则</b>
        <ul><li v-for="(r, i) in EXTRA_RULES" :key="i">{{ r }}</li></ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 左窄右宽 1 : 5，与「组织与成员」同一分栏比例 */
.split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 5fr); gap: var(--space-stack); align-items: start; }

/* 角色列表：自绘，当前项 = 深黑反转块（action.selected + text.on-selected，500），与侧栏 / 分段选择器同一选中语义 */
.role-list { list-style: none; margin: 0; padding: var(--spacing-2); display: flex; flex-direction: column; gap: var(--spacing-0-5); }
.role-item { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); width: 100%; height: var(--control-height-lg); padding: 0 var(--spacing-3); border: 0; border-radius: var(--radius-md); background: transparent; color: var(--color-text-primary); font-size: var(--text-body-size); font-weight: var(--font-weight-regular); text-align: left; cursor: pointer; transition: background var(--motion-duration-fast) var(--motion-easing-standard); }
.role-item:hover { background: var(--color-bg-hover); }
.role-item.on, .role-item.on:hover { background: var(--color-action-selected); color: var(--color-text-on-selected); font-weight: var(--font-weight-medium); }
.role-cnt { font-size: var(--text-small-size); color: var(--color-text-muted); }
.role-item.on .role-cnt { color: inherit; }

.desc { margin: 0; padding: var(--spacing-4) var(--space-card); color: var(--color-text-secondary); line-height: var(--text-paragraph-line-height); border-bottom: var(--border-width-default) solid var(--color-border-default); }
.mod { font-weight: var(--text-weight-label); }
.muted { color: var(--color-text-muted); }
.avail { display: inline-flex; align-items: center; gap: var(--spacing-1-5); white-space: nowrap; }
.avail.no { color: var(--color-text-muted); }
.dash { display: inline-flex; width: var(--icon-size-md); justify-content: center; }

.notes { padding: var(--spacing-4) var(--space-card) var(--space-card); border-top: var(--border-width-default) solid var(--color-border-default); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.notes b { display: block; margin-bottom: var(--spacing-1); color: var(--color-text-primary); font-weight: var(--text-weight-label); }
.notes ul { margin: 0; padding-left: var(--spacing-5); line-height: var(--text-paragraph-line-height); }
</style>
