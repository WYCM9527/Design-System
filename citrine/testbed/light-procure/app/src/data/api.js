// 服务层：页面只调这里的函数，不直接改 db。全部异步（模拟 200ms 网络延迟，让骨架屏可见），
// 失败注入：session.failNext.list / submit 为 true 时，下一次列表加载 / 提交抛错一次（PRD §6.5 测试工具）。
import { db, now, today, nextNo, nextId, findMember, findDept, findSupplier, findApp, findAsset } from './db'
import { session, can } from './session'
import { sumLines, addDays } from './format'
const weekdayIndex = (d) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd).getDay() }
import { APP_STATUS, ASSET_STATUS, LOG_MODULES } from './constants'
import { deleteFile } from './files'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))
export class ApiError extends Error { constructor(msg, code = 'error') { super(msg); this.code = code } }
const fail = (kind) => { if (session.failNext[kind]) { session.failNext[kind] = false; throw new ApiError(kind === 'list' ? '列表加载失败，请重试' : '提交失败，请稍后重试', 'injected') } }

const me = () => findMember(session.userId)
const log = (module, action, objectNo, objectName, summary, before = null, after = null) => {
  const u = me()
  db.seq.log += 1
  db.logs.push({ id: `l${String(db.seq.log).padStart(4, '0')}`, at: now(), byId: u.id, byName: u.name, module, action, objectNo, objectName, summary, before, after, order: db.seq.log })
}
const paginate = (rows, page, pageSize) => ({ rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length })
const has = (text, kw) => !kw || String(text || '').toLowerCase().includes(kw.trim().toLowerCase())
const inRange = (t, from, to) => (!from || (t && t.slice(0, 10) >= from)) && (!to || (t && t.slice(0, 10) <= to))

// ───────────────────────── 采购申请 ─────────────────────────
/** 当前身份可见的申请（PRD §2：申请人仅本人） */
export function visibleApps() { const uid = session.userId; return db.applications.filter((a) => can('app.viewAll') || a.applicantId === uid) }
export function canEditApp(app) { return app.status === 'draft' && app.applicantId === session.userId }

export async function listApplications(f = {}) {
  await delay(); fail('list')
  let rows = visibleApps().filter((a) =>
    (has(a.no, f.keyword) || has(a.title, f.keyword)) &&
    (!f.status || a.status === f.status) && (!f.deptId || a.deptId === f.deptId) && (!f.applicantId || a.applicantId === f.applicantId) &&
    inRange(a.submittedAt, f.submittedFrom, f.submittedTo) &&
    (!(f.approvedFrom || f.approvedTo) || (a.status === 'approved' && inRange(a.decidedAt, f.approvedFrom, f.approvedTo))) &&
    (!f.mine || a.applicantId === session.userId) &&
    (!f.approvedMonth || (a.status === 'approved' && a.decidedAt.slice(0, 7) === f.approvedMonth))
  )
  const dir = f.sortDir === 'asc' ? 1 : -1
  rows.sort((a, b) => (f.sortBy === 'total' ? (a.total - b.total) * dir : a.updatedAt.localeCompare(b.updatedAt) * dir))
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export async function getApplication(id) { await delay(120); return findApp(id) || null }

function snapshotFrom(form) {
  const u = me(); const d = findDept(u.deptId)
  return { applicantId: u.id, applicantName: u.name, deptId: d.id, deptName: d.name }
}
/** 保存草稿：新建或更新。form: { id?, title, priority, expectDate, supplierId, purpose, note, lines, attachments } */
export async function saveDraft(form) {
  await delay()
  const t = now(); const totals = sumLines(form.lines)
  let app = form.id ? findApp(form.id) : null
  if (app && !canEditApp(app)) throw new ApiError('只能编辑本人的草稿')
  const fields = { title: form.title.trim(), priority: form.priority || 'normal', expectDate: form.expectDate || '', supplierId: form.supplierId || '', purpose: form.purpose || '', note: form.note || '', lines: form.lines.map((l) => ({ ...l })), attachments: (form.attachments || []).map((a) => ({ ...a })), total: totals.total, qty: totals.qty, updatedAt: t }
  if (!app) {
    app = { id: nextId('a'), no: nextNo('CG'), ...snapshotFrom(form), supplierName: '', status: 'draft', createdAt: t, submittedAt: '', decidedAt: '', approverId: '', approverName: '', opinion: '', events: [{ type: 'created', at: t, byId: me().id, byName: me().name }], ...fields }
    db.applications.push(app)
    log('application', '创建草稿', app.no, app.title, `新建采购申请草稿「${app.title}」`)
  } else {
    Object.assign(app, fields)
    log('application', '保存草稿', app.no, app.title, '保存草稿')
  }
  return app
}
/** 提交：先保存再提交（校验由表单完成；这里只做状态与快照） */
export async function submitApplication(form) {
  await delay(); fail('submit')
  const sup = form.supplierId ? findSupplier(form.supplierId) : null
  if (sup && !sup.active) throw new ApiError('所选供应商已停用，请重新选择或清空', 'supplier')   // 先校验再落库，失败不产生一次多余的「保存草稿」
  const app = await saveDraft(form)
  const t = now()
  Object.assign(app, { status: 'pending', submittedAt: t, updatedAt: t, supplierName: sup ? sup.name : '' })
  app.events.push({ type: 'submitted', at: t, byId: me().id, byName: me().name })
  log('application', '提交申请', app.no, app.title, `提交采购申请，预估总金额 ${app.total.toFixed(2)}`, '草稿', '待审批')
  return app
}
export async function deleteDrafts(ids) {
  await delay()
  const victims = db.applications.filter((a) => ids.includes(a.id) && canEditApp(a))
  for (const a of victims) {
    for (const f of a.attachments || []) if (!f.id.startsWith('f-seed')) deleteFile(f.id).catch(() => {})
    db.applications.splice(db.applications.indexOf(a), 1)
    log('application', '删除草稿', a.no, a.title, `删除草稿「${a.title}」`)
  }
  return victims.length
}
/** 复制为新草稿：只带标题、明细、用途、备注和仍启用的供应商（PRD §4.1） */
export async function copyApplication(id) {
  await delay()
  const src = findApp(id); if (!src) throw new ApiError('记录不存在或已被删除', 'missing')
  const sup = src.supplierId ? findSupplier(src.supplierId) : null
  const t = now()
  const app = { id: nextId('a'), no: nextNo('CG'), ...snapshotFrom(), title: src.title, priority: 'normal', expectDate: '', supplierId: sup && sup.active ? sup.id : '', supplierName: '', purpose: src.purpose, note: src.note, lines: src.lines.map((l) => ({ ...l })), attachments: [], total: src.total, qty: src.qty, status: 'draft', createdAt: t, updatedAt: t, submittedAt: '', decidedAt: '', approverId: '', approverName: '', opinion: '', events: [{ type: 'created', at: t, byId: me().id, byName: me().name, note: `由 ${src.no} 复制` }] }
  db.applications.push(app)
  log('application', '创建草稿', app.no, app.title, `复制 ${src.no} 为新草稿`)
  return app
}
/** 审批：result = approved | rejected；意见规则由调用方校验（驳回必填 2–200） */
export async function decideApplication(id, result, opinion = '') {
  await delay(); fail('submit')
  const app = findApp(id); if (!app) throw new ApiError('记录不存在或已被删除', 'missing')
  if (!can('approve')) throw new ApiError('当前身份没有审批权限', 'forbidden')
  if (app.applicantId === session.userId) throw new ApiError('不能审批本人提交的申请', 'forbidden')
  if (app.status !== 'pending') throw new ApiError('该申请已处理，请刷新列表', 'stale')
  const t = now(); const u = me()
  Object.assign(app, { status: result, decidedAt: t, updatedAt: t, approverId: u.id, approverName: u.name, opinion: opinion.trim() })
  app.events.push({ type: result, at: t, byId: u.id, byName: u.name, opinion: opinion.trim() })
  log('application', result === 'approved' ? '审批通过' : '审批驳回', app.no, app.title, result === 'approved' ? (opinion ? `审批通过：${opinion}` : '审批通过') : `审批驳回：${opinion}`, '待审批', APP_STATUS[result].label)
  if (db.settings.notifyOnResult) {
    db.seq.notify += 1
    db.notifications.unshift({ id: `n${String(db.seq.notify).padStart(4, '0')}`, userId: app.applicantId, appId: app.id, title: app.title, result, reason: result === 'rejected' ? opinion.trim() : '', at: t, read: false })
  }
  return app
}
/** 审批中心队列 */
export async function listApprovals(tab, f = {}) {
  await delay(); fail('list')
  const uid = session.userId
  let rows = tab === 'pending'
    ? db.applications.filter((a) => a.status === 'pending' && a.applicantId !== uid)
    : db.applications.filter((a) => (a.status === 'approved' || a.status === 'rejected') && a.approverId === uid)
  rows = rows.filter((a) => (has(a.no, f.keyword) || has(a.title, f.keyword)) && (!f.deptId || a.deptId === f.deptId) && (!f.result || a.status === f.result))
  if (tab === 'pending') rows.sort((a, b) => (a.priority === b.priority ? a.submittedAt.localeCompare(b.submittedAt) : a.priority === 'urgent' ? -1 : 1))
  else rows.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export const pendingCount = () => db.applications.filter((a) => a.status === 'pending' && a.applicantId !== session.userId).length

// ───────────────────────── 工作台 / 报表 ─────────────────────────
export function myStats() {
  const uid = session.userId; const mine = db.applications.filter((a) => a.applicantId === uid); const month = today().slice(0, 7)
  return {
    total: mine.length,
    pending: mine.filter((a) => a.status === 'pending').length,
    approvedAmount: mine.filter((a) => a.status === 'approved' && a.decidedAt.slice(0, 7) === month).reduce((s, a) => s + a.total, 0),
    assets: db.assets.filter((a) => a.status === 'inuse' && a.userId === uid).length
  }
}
/** 近 6 周本人提交数量（按提交时间，周一为一周起点） */
export function myWeeklyTrend() {
  const uid = session.userId
  const dow = (weekdayIndex(today()) + 6) % 7; const thisMon = addDays(today(), -dow)
  const weeks = []
  for (let i = 5; i >= 0; i--) { const from = addDays(thisMon, -i * 7); weeks.push({ from, to: addDays(from, 6) }) }
  const subs = db.applications.filter((a) => a.applicantId === uid && a.submittedAt)
  return weeks.map((w) => ({ label: `${w.from.slice(5).replace('-', '/')}周`, count: subs.filter((a) => inRange(a.submittedAt, w.from, w.to)).length }))
}
export function myStatusDistribution() {
  const uid = session.userId; const mine = db.applications.filter((a) => a.applicantId === uid)
  return Object.entries(APP_STATUS).map(([k, v]) => ({ key: k, name: v.label, value: mine.filter((a) => a.status === k).length }))
}
export const myRecentApps = (n = 5) => db.applications.filter((a) => a.applicantId === session.userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, n)
export const pendingForMe = (n = 5) => db.applications.filter((a) => a.status === 'pending' && a.applicantId !== session.userId).sort((a, b) => (a.priority === b.priority ? a.submittedAt.localeCompare(b.submittedAt) : a.priority === 'urgent' ? -1 : 1)).slice(0, n)

/** 报表（PRD P08）：范围内已提交的申请（草稿不进入）；通过率 = 已通过 ÷（已通过 + 已驳回） */
export async function report({ from, to, deptId }) {
  await delay(); fail('list')
  const rows = db.applications.filter((a) => a.status !== 'draft' && inRange(a.submittedAt, from, to) && (!deptId || a.deptId === deptId))
  const approved = rows.filter((a) => a.status === 'approved'), rejected = rows.filter((a) => a.status === 'rejected')
  const rate = (ap, rj) => (ap + rj ? ap / (ap + rj) : null)
  const days = []; for (let d = from; d <= to; d = addDays(d, 1)) days.push(d)
  const byDept = db.departments.filter((d) => !deptId || d.id === deptId).map((d) => {
    const r = rows.filter((a) => a.deptId === d.id); const ap = r.filter((a) => a.status === 'approved'); const rj = r.filter((a) => a.status === 'rejected')
    return { deptId: d.id, dept: d.name, count: r.length, amount: r.reduce((s, a) => s + a.total, 0), approvedCount: ap.length, approvedAmount: ap.reduce((s, a) => s + a.total, 0), rate: rate(ap.length, rj.length) }
  })
  return {
    indicators: { count: rows.length, amount: rows.reduce((s, a) => s + a.total, 0), approvedAmount: approved.reduce((s, a) => s + a.total, 0), rate: rate(approved.length, rejected.length) },
    trend: days.map((d) => ({ date: d, count: rows.filter((a) => a.submittedAt.slice(0, 10) === d).length })),
    byDept: byDept.slice().sort((a, b) => b.approvedAmount - a.approvedAmount),
    total: { dept: '合计', count: rows.length, amount: rows.reduce((s, a) => s + a.total, 0), approvedCount: approved.length, approvedAmount: approved.reduce((s, a) => s + a.total, 0), rate: rate(approved.length, rejected.length) }
  }
}

// ───────────────────────── 资产 ─────────────────────────
export function visibleAssets() { const uid = session.userId; return db.assets.filter((a) => can('asset.viewAll') || (a.status === 'inuse' && a.userId === uid)) }
export async function listAssets(f = {}) {
  await delay(); fail('list')
  const rows = visibleAssets().filter((a) => (has(a.no, f.keyword) || has(a.name, f.keyword)) && (!f.category || a.category === f.category) && (!f.status || a.status === f.status) && (!f.deptId || a.deptId === f.deptId) && (!f.userId || a.userId === f.userId))
  rows.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export async function getAsset(id) { await delay(120); return findAsset(id) || null }
/** 新增 / 编辑资产（管理员）。在用资产编辑基础资料不改变使用人与状态 */
export async function saveAsset(form) {
  await delay(); fail('submit')
  if (!can('asset.manage')) throw new ApiError('无权限', 'forbidden')
  const t = now(); const u = me()
  const fields = { name: form.name.trim(), category: form.category, spec: form.spec || '', price: Number(form.price), purchaseDate: form.purchaseDate, location: form.location.trim(), sourceAppId: form.sourceAppId || '', note: form.note || '', updatedAt: t }
  let asset = form.id ? findAsset(form.id) : null
  if (!asset) {
    asset = { id: nextId('z'), no: nextNo('ZC'), ...fields, status: 'idle', userId: '', userName: '', deptId: '', deptName: '', registeredAt: t, history: [{ type: 'registered', at: t, byName: u.name, note: '登记入库' }] }
    db.assets.push(asset)
    log('asset', '登记资产', asset.no, asset.name, `登记资产「${asset.name}」，存放于 ${asset.location}`)
  } else {
    const before = `${asset.name} · ${asset.location}`
    Object.assign(asset, fields)
    log('asset', '编辑资产', asset.no, asset.name, '编辑资产基础资料', before, `${asset.name} · ${asset.location}`)
  }
  return asset
}
export async function assignAsset(id, userId, note = '') {
  await delay(); fail('submit')
  const asset = findAsset(id); const m = findMember(userId)
  if (!asset || !m) throw new ApiError('记录不存在或已被删除', 'missing')
  if (!m.active) throw new ApiError('该成员已停用，不能分配')
  if (asset.status !== 'idle') throw new ApiError('该资产不是闲置状态，请刷新列表', 'stale')
  const t = now(); const d = findDept(m.deptId)
  Object.assign(asset, { status: 'inuse', userId: m.id, userName: m.name, deptId: d.id, deptName: d.name, updatedAt: t })
  asset.history.push({ type: 'assigned', at: t, byName: me().name, userName: m.name, deptName: d.name, note })
  log('asset', '分配资产', asset.no, asset.name, `分配给 ${m.name}（${d.name}）`, '闲置 · 使用人 —', `在用 · 使用人 ${m.name}`)
  return asset
}
export async function returnAsset(id) {
  await delay(); fail('submit')
  const asset = findAsset(id); if (!asset) throw new ApiError('记录不存在或已被删除', 'missing')
  if (asset.status !== 'inuse') throw new ApiError('该资产不是在用状态，请刷新列表', 'stale')
  const t = now(); const prev = asset.userName
  asset.history.push({ type: 'returned', at: t, byName: me().name, userName: prev, deptName: asset.deptName })
  Object.assign(asset, { status: 'idle', userId: '', userName: '', deptId: '', deptName: '', updatedAt: t })
  log('asset', '归还资产', asset.no, asset.name, `${prev} 归还资产`, `在用 · 使用人 ${prev}`, '闲置 · 使用人 —')
  return asset
}
export const approvedAppsForLink = () => db.applications.filter((a) => a.status === 'approved')

// ───────────────────────── 供应商 ─────────────────────────
export async function listSuppliers(f = {}) {
  await delay(); fail('list')
  const rows = db.suppliers.filter((s) => (has(s.name, f.keyword) || has(s.contact, f.keyword)) && (f.active === '' || f.active === undefined || s.active === f.active))
  rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export const activeSuppliers = () => db.suppliers.filter((s) => s.active)
export async function saveSupplier(form) {
  await delay(); fail('submit')
  if (!can('supplier.manage')) throw new ApiError('无权限', 'forbidden')
  const name = form.name.trim()
  if (db.suppliers.some((s) => s.id !== form.id && s.name.trim() === name)) throw new ApiError('供应商名称已存在', 'duplicate')
  const t = now()
  const fields = { name, contact: form.contact.trim(), phone: form.phone || '', email: form.email || '', address: form.address || '', note: form.note || '', updatedAt: t }
  let s = form.id ? findSupplier(form.id) : null
  if (!s) { s = { id: nextId('s'), ...fields, active: true }; db.suppliers.push(s); log('supplier', '新增供应商', s.id.toUpperCase(), s.name, `新增供应商「${s.name}」`) }
  else { Object.assign(s, fields); log('supplier', '编辑供应商', s.id.toUpperCase(), s.name, '编辑供应商资料') }
  return s
}
export async function toggleSupplier(id, active) {
  await delay(); fail('submit')
  const s = findSupplier(id); if (!s) throw new ApiError('记录不存在或已被删除', 'missing')
  s.active = active; s.updatedAt = now()
  log('supplier', active ? '启用供应商' : '停用供应商', s.id.toUpperCase(), s.name, `${active ? '启用' : '停用'}供应商「${s.name}」`, active ? '停用' : '启用', active ? '启用' : '停用')
  return s
}

// ───────────────────────── 成员 ─────────────────────────
export async function listMembers(f = {}) {
  await delay(); fail('list')
  const rows = db.members.filter((m) => (!f.deptId || m.deptId === f.deptId) && (has(m.name, f.keyword) || has(m.email, f.keyword)) && (f.active === '' || f.active === undefined || m.active === f.active))
  rows.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export const activeMembers = () => db.members.filter((m) => m.active)
export const roleCounts = () => ({ applicant: activeMembers().filter((m) => m.role === 'applicant').length, approver: activeMembers().filter((m) => m.role === 'approver').length, admin: activeMembers().filter((m) => m.role === 'admin').length })
export async function saveMember(form) {
  await delay(); fail('submit')
  if (!can('org.manage')) throw new ApiError('无权限', 'forbidden')
  const email = form.email.trim().toLowerCase()
  if (db.members.some((m) => m.id !== form.id && m.email.toLowerCase() === email)) throw new ApiError('邮箱已被使用', 'duplicate')
  let m = form.id ? findMember(form.id) : null
  if (m && m.id === session.userId && m.role !== form.role) throw new ApiError('不能修改当前操作账号的角色')
  if (m && m.role === 'admin' && form.role !== 'admin' && activeMembers().filter((x) => x.role === 'admin').length <= 1) throw new ApiError('不能移除最后一名启用管理员')
  const d = findDept(form.deptId)
  if (!m) {
    m = { id: nextId('u'), name: form.name.trim(), email, deptId: d.id, role: form.role, active: true, joinedAt: today() }
    db.members.push(m); log('member', '新增成员', m.email, m.name, `新增成员 ${m.name}（${d.name} · ${form.role}）`)
  } else {
    const before = `${findDept(m.deptId).name} · ${m.role}`
    const deptChanged = m.deptId !== d.id
    Object.assign(m, { name: form.name.trim(), email, deptId: d.id, role: form.role })
    if (deptChanged) for (const a of db.assets) if (a.status === 'inuse' && a.userId === m.id) { a.deptId = d.id; a.deptName = d.name }   // 在用资产的当前部门同步；历史快照不动
    log('member', '编辑成员', m.email, m.name, '编辑成员资料', before, `${d.name} · ${m.role}`)
  }
  return m
}
export async function toggleMember(id, active) {
  await delay(); fail('submit')
  const m = findMember(id); if (!m) throw new ApiError('记录不存在或已被删除', 'missing')
  if (m.id === session.userId) throw new ApiError('不能停用当前操作账号')
  if (!active && m.role === 'admin' && activeMembers().filter((x) => x.role === 'admin').length <= 1) throw new ApiError('不能停用最后一名启用管理员')
  m.active = active
  log('member', active ? '启用成员' : '停用成员', m.email, m.name, `${active ? '启用' : '停用'}成员 ${m.name}`, active ? '停用' : '启用', active ? '启用' : '停用')
  return m
}

// ───────────────────────── 设置 / 通知 / 日志 ─────────────────────────
export async function saveSettings(patch) {
  await delay(); fail('submit')
  if (!can('settings.manage')) throw new ApiError('无权限', 'forbidden')
  const before = { ...db.settings }
  Object.assign(db.settings, patch)
  const changed = Object.keys(patch).filter((k) => before[k] !== patch[k])
  if (changed.length) log('settings', '修改设置', 'SETTINGS', '系统设置', `修改：${changed.join('、')}`, changed.map((k) => `${k}=${before[k] === '' ? '—' : String(before[k]).slice(0, 20)}`).join('；'), changed.map((k) => `${k}=${patch[k] === '' ? '—' : String(patch[k]).slice(0, 20)}`).join('；'))
  return db.settings
}
export const myNotifications = (n = 10) => db.notifications.filter((x) => x.userId === session.userId).slice(0, n)
export const unreadCount = () => db.notifications.filter((x) => x.userId === session.userId && !x.read).length
export function markRead(id) { const x = db.notifications.find((n) => n.id === id); if (x) x.read = true }
export function markAllRead() { for (const x of db.notifications) if (x.userId === session.userId) x.read = true }

export async function listLogs(f = {}) {
  await delay(); fail('list')
  const rows = db.logs.filter((l) => (has(l.objectNo, f.keyword) || has(l.objectName, f.keyword)) && (!f.byId || l.byId === f.byId) && (!f.module || l.module === f.module) && inRange(l.at, f.from, f.to))
  rows.sort((a, b) => b.at.localeCompare(a.at) || b.order - a.order)
  return paginate(rows, f.page || 1, f.pageSize || 10)
}
export const moduleLabel = (m) => LOG_MODULES[m] || m
export const assetStatusLabel = (s) => ASSET_STATUS[s]?.label || s
