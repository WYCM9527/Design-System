<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@icon-park/vue-next'
import { confirmDanger } from '@wycm9527/morganite/vue/confirm.js'
import { ROLES, PERM_LABELS } from '../store'
import { members } from '../mock/data'

const list = reactive(members.map((m) => ({ ...m })))
const GROUPS = [
  ['订单', ['order.ship', 'order.close', 'order.note']],
  ['售后', ['refund.audit', 'refund.create']],
  ['商品', ['product.edit', 'product.shelf', 'product.cost']],
  ['客户与营销', ['customer.edit', 'campaign.edit', 'coupon.issue']],
  ['财务与报表', ['finance.view', 'report.export']],
  ['系统', ['member.edit']]
]
const roleKeys = Object.keys(ROLES)
// 权限矩阵的本地副本：勾选只改这页的草稿，点保存才算数
const matrix = reactive(Object.fromEntries(roleKeys.map((r) => [r, new Set(ROLES[r].perms)])))
const rows = GROUPS.map(([label, perms]) => ({ id: label, label, children: perms.map((p) => ({ id: p, label: PERM_LABELS[p], perm: p })) }))
const groupState = (r, row) => { const n = row.children.filter((c) => matrix[r].has(c.perm)).length; return { checked: n === row.children.length, indeterminate: n > 0 && n < row.children.length } }
function toggle(r, row, v) {
  const perms = row.perm ? [row.perm] : row.children.map((c) => c.perm)
  perms.forEach((p) => (v ? matrix[r].add(p) : matrix[r].delete(p)))
}
const dirty = ref(false)

const inviteOpen = ref(false)
const invite = reactive({ name: '', account: '', role: 'service' })
const inviteRef = ref()
const inviteRules = { name: [{ required: true, message: '请输入姓名', trigger: 'blur' }], account: [{ required: true, message: '请输入账号', trigger: 'blur' }, { pattern: /^[a-z][a-z0-9]{3,19}$/, message: '小写字母开头，4–20 位字母或数字', trigger: 'blur' }] }
async function sendInvite() {
  if (!(await inviteRef.value.validate().catch(() => false))) return
  list.push({ name: invite.name, account: invite.account, role: invite.role, enabled: true, last: '—' })
  inviteOpen.value = false
  ElMessage.success(`已邀请 ${invite.name}，激活链接已发到企业微信`)
}
const remove = (m) => confirmDanger(`移除后 ${m.name} 立即无法登录，名下待处理的售后单会转给管理员。`, `移除成员 ${m.name}？`, { confirmButtonText: '确认移除', cancelButtonText: '再想想' }).then(() => { list.splice(list.indexOf(m), 1); ElMessage.success('已移除') }).catch(() => {})
</script>

<template>
  <div class="page-head">
    <div>
      <h1>成员与角色</h1>
      <p>邀请成员、分配角色；角色决定能看到哪些菜单、能做哪些操作。</p>
    </div>
    <div class="actions"><el-button type="primary" :icon="Plus" @click="inviteOpen = true">邀请成员</el-button></div>
  </div>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>成员</h2><span class="sub">{{ list.length }} 人 · 停用 {{ list.filter((m) => !m.enabled).length }} 人</span></div>
    <el-table :data="list" row-key="account">
      <el-table-column label="成员" min-width="180"><template #default="{ row }"><div class="who"><span class="avatar">{{ row.name[0] }}</span><span>{{ row.name }}<span v-if="row.account === 'linxia'" class="badge brand me">我</span><span class="sub mono">{{ row.account }}</span></span></div></template></el-table-column>
      <el-table-column label="角色" width="150">
        <template #default="{ row }"><el-select v-model="row.role" size="small" :disabled="row.account === 'linxia'" :aria-label="`${row.name}的角色`"><el-option v-for="(r, k) in ROLES" :key="k" :label="r.label" :value="k" /></el-select></template>
      </el-table-column>
      <el-table-column label="启用" width="90"><template #default="{ row }"><el-switch v-model="row.enabled" :disabled="row.account === 'linxia'" :aria-label="`启用 ${row.name}`" /></template></el-table-column>
      <el-table-column prop="last" label="最近登录" width="150" class-name="num" />
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }"><div class="act-group"><button class="act" type="button" @click="ElMessage.success(`重置链接已发给 ${row.name}`)">重置密码</button><button class="act danger" type="button" :disabled="row.account === 'linxia'" @click="remove(row)">移除</button></div></template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-card class="flat" shadow="always">
    <div class="card-head"><h2>角色权限</h2><span class="sub">管理员拥有全部权限，不可修改</span><div class="right"><el-button size="small" :disabled="!dirty" @click="dirty = false">撤销修改</el-button><el-button size="small" type="primary" :disabled="!dirty" @click="dirty = false; ElMessage.success('角色权限已保存，成员下次刷新生效')">保存</el-button></div></div>
    <el-table :data="rows" row-key="id" default-expand-all :tree-props="{ children: 'children' }">
      <el-table-column label="权限" min-width="200"><template #default="{ row }"><b v-if="!row.perm" class="group">{{ row.label }}</b><template v-else>{{ row.label }}</template></template></el-table-column>
      <el-table-column v-for="r in roleKeys" :key="r" :label="ROLES[r].label" width="110" align="center">
        <template #default="{ row }">
          <el-checkbox v-if="!row.perm" v-bind="groupState(r, row)" :disabled="r === 'admin'" :aria-label="`${ROLES[r].label} · ${row.label}`" @change="(v) => { toggle(r, row, v); dirty = true }" />
          <el-checkbox v-else :model-value="matrix[r].has(row.perm)" :disabled="r === 'admin'" :aria-label="`${ROLES[r].label} · ${row.label}`" @change="(v) => { toggle(r, row, v); dirty = true }" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="inviteOpen" title="邀请成员" class="is-sm" append-to-body>
    <el-form ref="inviteRef" :model="invite" :rules="inviteRules" label-position="top">
      <el-form-item label="姓名" prop="name"><el-input v-model="invite.name" /></el-form-item>
      <el-form-item label="登录账号" prop="account"><el-input v-model="invite.account" placeholder="如 zhangsan" /><span class="help">激活链接会发到对方的企业微信</span></el-form-item>
      <el-form-item label="角色"><el-radio-group v-model="invite.role"><el-radio v-for="k in roleKeys.filter((x) => x !== 'admin')" :key="k" :value="k">{{ ROLES[k].label }}</el-radio></el-radio-group></el-form-item>
    </el-form>
    <template #footer><el-button @click="inviteOpen = false">取消</el-button><el-button type="primary" @click="sendInvite">发送邀请</el-button></template>
  </el-dialog>
</template>

<style scoped>
.who { display: flex; align-items: center; gap: var(--spacing-2-5); }
.me { margin-left: var(--spacing-1-5); }
.group { font-weight: var(--text-weight-label); }
</style>
