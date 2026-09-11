<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AddUser, Plus } from '@icon-park/vue-next'
import { members, permissionGroups } from '../mock/data'
import { ROLES, store, setRole, can } from '../store'

const router = useRouter()
const roleKey = ref('ops')
const roleList = Object.entries(ROLES).map(([k, v]) => ({ key: k, label: v.label, count: members.filter((m) => m.role === k).length }))
// 权限矩阵：以角色为键的勾选状态（演示数据）
const matrix = reactive({
  admin: Object.fromEntries(permissionGroups.map((g) => [g.key, [...g.items]])),
  ops: { order: ['查看', '改派', '取消', '导出'], merchant: ['查看', '编辑'], campaign: ['查看', '编辑', '上线 / 下线'], rider: ['查看', '派单'], finance: [], system: [] },
  auditor: { order: ['查看'], merchant: ['查看', '审核'], campaign: [], rider: [], finance: [], system: [] },
  finance: { order: ['导出'], merchant: [], campaign: [], rider: [], finance: ['查看看板', '查看结算', '导出'], system: [] }
})
const current = computed(() => matrix[roleKey.value])
const isAll = (g) => current.value[g.key].length === g.items.length
const isSome = (g) => current.value[g.key].length > 0 && !isAll(g)
function toggleAll(g, v) { current.value[g.key] = v ? [...g.items] : [] }
function savePerms() { ElMessage.success(`已保存「${ROLES[roleKey.value].label}」的权限`) }

const editing = reactive({ open: false, member: null, role: 'ops' })
function editRole(m) { editing.member = m; editing.role = m.role; editing.open = true }
function saveRole() {
  editing.member.role = editing.role; editing.open = false
  // 自我降权：当前登录账号王小明改成财务后，菜单立刻变化并跳转到可见页（PRD §4.7）
  if (editing.member.account === 'wangxm' && editing.role !== store.role) { setRole(editing.role); ElMessage.warning('你已把自己改为' + ROLES[editing.role].label + '，菜单已按新角色刷新'); if (editing.role === 'finance') router.push('/') } else ElMessage.success('角色已更新')
}
function remove(m) {
  ElMessageBox.confirm(`移除后 ${m.name} 将立即失去访问权限，历史操作记录保留。`, `移除成员「${m.name}」？`, { confirmButtonText: '确认移除', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' })
    .then(() => { members.splice(members.indexOf(m), 1); ElMessage.success('已移除') }).catch(() => {})
}
const initials = (n) => n.slice(0, 1)
</script>

<template>
  <div class="page-head">
    <div><h1>成员与角色</h1><p>{{ members.length }} 名成员 · 4 个角色 · 角色决定菜单可见性与按钮权限</p></div>
    <div class="actions"><el-button type="primary" :disabled="!can('member.edit')"><AddUser class="i-icon--sm" />邀请成员</el-button></div>
  </div>

  <div class="split">
    <el-card class="flat roles" shadow="always">
      <div class="card-head"><h2>角色</h2><div class="right"><el-button size="small" text><Plus class="i-icon--xs" />新增</el-button></div></div>
      <ul class="role-list">
        <li v-for="r in roleList" :key="r.key" :class="{ on: roleKey === r.key }" @click="roleKey = r.key"><span>{{ r.label }}</span><span class="num count">{{ r.count }}</span></li>
      </ul>
    </el-card>
    <el-card class="flat" shadow="always">
      <div class="card-head"><h2>「{{ ROLES[roleKey].label }}」的权限</h2><div class="right"><el-button size="small" type="primary" :disabled="!can('member.edit')" @click="savePerms">保存</el-button></div></div>
      <div class="matrix">
        <div v-for="g in permissionGroups" :key="g.key" class="group">
          <el-checkbox :model-value="isAll(g)" :indeterminate="isSome(g)" :disabled="!can('member.edit')" class="group-title" @change="(v) => toggleAll(g, v)">{{ g.label }}</el-checkbox>
          <el-checkbox-group v-model="current[g.key]" :disabled="!can('member.edit')"><el-checkbox v-for="it in g.items" :key="it" :value="it" :label="it" /></el-checkbox-group>
        </div>
      </div>
    </el-card>
  </div>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>成员</h2></div>
    <el-table :data="members" style="width: 100%">
      <el-table-column label="成员" min-width="220"><template #default="{ row }"><span class="member"><span class="avatar sm">{{ initials(row.name) }}</span><span>{{ row.name }}<span class="sub mono">{{ row.account }}</span></span></span></template></el-table-column>
      <el-table-column label="角色" width="140"><template #default="{ row }"><span class="badge" :class="row.role === 'admin' ? 'brand' : 'neutral'">{{ ROLES[row.role].label }}</span></template></el-table-column>
      <el-table-column label="状态" width="120"><template #default="{ row }"><el-switch :model-value="row.status === '启用'" size="small" :disabled="!can('member.edit') || row.account === 'wangxm'" @change="(v) => (row.status = v ? '启用' : '已停用')" /></template></el-table-column>
      <el-table-column label="最近登录" width="180"><template #default="{ row }"><span class="num">{{ row.last }}</span></template></el-table-column>
      <el-table-column label="操作" width="270" fixed="right" class-name="nowrap"><template #default="{ row }"><a class="act" @click="editRole(row)">编辑角色</a><a class="act">重置密码</a><a class="act danger" @click="remove(row)">移除</a></template></el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="editing.open" title="编辑角色" :width="'var(--layout-modal-width-sm)'">
    <p class="hint">为 <b>{{ editing.member?.name }}</b> 选择角色。改为财务后将看不到订单与商户菜单。</p>
    <el-radio-group v-model="editing.role" class="role-radios"><el-radio v-for="(r, k) in ROLES" :key="k" :value="k">{{ r.label }}</el-radio></el-radio-group>
    <template #footer><el-button @click="editing.open = false">取消</el-button><el-button type="primary" @click="saveRole">保存</el-button></template>
  </el-dialog>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 240px 1fr; gap: var(--space-stack); align-items: start; }
.role-list { list-style: none; margin: 0; padding: var(--spacing-2); }
.role-list li { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-2) var(--spacing-3); border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-body-sm-size); }
.role-list li:hover { background: var(--color-bg-hover); }
.role-list li.on { background: var(--color-action-selected); color: var(--color-text-on-selected); font-weight: var(--text-weight-strong); }  /* 与侧栏一致的深黑反转块 */
.role-list .count { color: var(--color-text-muted); font-weight: var(--text-weight-label); }
.role-list li.on .count { color: inherit; }
.matrix { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-4) var(--spacing-6); padding: var(--space-card); }
.group { display: flex; flex-direction: column; gap: var(--spacing-1); }
.group-title { font-weight: var(--text-weight-strong); }
.group .el-checkbox-group { display: flex; flex-direction: column; padding-left: var(--spacing-6); }
.member { display: inline-flex; align-items: center; gap: var(--spacing-2-5); }
.avatar.sm { width: var(--avatar-size-sm); height: var(--avatar-size-sm); font-size: var(--text-small-size); background: var(--color-bg-selected); color: var(--color-text-selected); cursor: default; }
:deep(.nowrap .cell) { white-space: nowrap; }
.hint { margin: 0 0 var(--spacing-3); color: var(--color-text-secondary); font-size: var(--text-body-sm-size); }
.role-radios { display: flex; flex-direction: column; gap: var(--spacing-1); }
</style>
