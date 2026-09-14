// 本地数据库：一个 reactive 对象 + localStorage 持久化（PRD §1.1：业务修改、设置和新增附件在刷新后保留）。
// 时间：所有新操作都记在演示基准日 2026-09-08，从 09:00 起每次操作 +1 分钟，保证先后顺序、不随真实日期漂移（PRD §7）。
import { reactive, watch } from 'vue'
import { BASE_TIME } from './constants'
import { buildSeed } from './seed'
import { seedFiles } from './files'

const KEY = 'qc.db.v1'

function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.version === 1) return d } } catch { /* 损坏则重建 */ }
  return null
}

export const db = reactive(load() || { version: 0 })
export const ready = reactive({ value: db.version === 1 })

let persistTimer
function persist() { clearTimeout(persistTimer); persistTimer = setTimeout(() => localStorage.setItem(KEY, JSON.stringify(db)), 50) }
watch(db, persist, { deep: true })

/** 首次进入或恢复演示数据：重建种子数据（含附件样本），返回 Promise */
export async function resetDemo() {
  const files = await seedFiles()
  const fresh = buildSeed(files)
  for (const k of Object.keys(db)) delete db[k]
  Object.assign(db, fresh)
  ready.value = true
  localStorage.setItem(KEY, JSON.stringify(db))
}
export async function ensureReady() { if (!ready.value) await resetDemo() }

/** 演示时钟：基准日 09:00 起每次 +1 分钟 */
export function now() {
  db.clock = (db.clock || 0) + 1
  const [d, hm] = BASE_TIME.split(' '); const [h, m] = hm.split(':').map(Number)
  const total = h * 60 + m + db.clock
  return `${d} ${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
export const today = () => db.baseDate

/** 单号：CG-YYYYMMDD-#### / ZC-YYYYMMDD-####，同日递增，删除不复用 */
export function nextNo(prefix, dateStr = today()) {
  const day = dateStr.slice(0, 10)
  db.seq[prefix][day] = (db.seq[prefix][day] || 0) + 1
  return `${prefix}-${day.replace(/-/g, '')}-${String(db.seq[prefix][day]).padStart(4, '0')}`
}
export const nextId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// 查询助手
export const findMember = (id) => db.members?.find((m) => m.id === id)
export const findDept = (id) => db.departments?.find((d) => d.id === id)
export const findSupplier = (id) => db.suppliers?.find((s) => s.id === id)
export const findApp = (id) => db.applications?.find((a) => a.id === id)
export const findAsset = (id) => db.assets?.find((a) => a.id === id)
