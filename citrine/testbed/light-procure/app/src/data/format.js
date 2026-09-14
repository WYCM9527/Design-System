// 统一格式（PRD §6.2）：金额 ¥12,680.00；日期 YYYY-MM-DD；时间 YYYY-MM-DD HH:mm；CSV 导出带 BOM、CRLF。

export function money(n, { sign = true } = {}) {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '—'
  const s = Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return sign ? `¥${s}` : s
}
// 精确到分：用整数分做加法，避免 0.1 + 0.2
export const cents = (n) => Math.round(Number(n) * 100)
export const fromCents = (c) => c / 100
export function lineSubtotal(line) {
  const qty = Number(line.qty), price = Number(line.price)
  if (!Number.isInteger(qty) || qty < 1 || !(price > 0)) return null
  return fromCents(qty * cents(price))
}
export function sumLines(lines) {
  let total = 0, qty = 0, incomplete = false
  for (const l of lines) { const s = lineSubtotal(l); if (s === null) incomplete = true; else { total += cents(s); qty += Number(l.qty) } }
  return { total: fromCents(total), qty, incomplete }
}

export const dateOf = (s) => (s ? String(s).slice(0, 10) : '—')
export const timeOf = (s) => (s ? String(s).slice(0, 16) : '—')
export const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v)

// 日期串 ↔ 本地日期：不用 toISOString（它按 UTC 切片，东八区会倒退一天）
const parse = (dateStr) => { const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d) }
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export function addDays(dateStr, days) { const d = parse(dateStr); d.setDate(d.getDate() + days); return ymd(d) }
export function diffDays(a, b) { return Math.round((parse(b) - parse(a)) / 86400000) }
export function monthStart(dateStr) { return `${dateStr.slice(0, 7)}-01` }
export function weekday(dateStr) { return ['日', '一', '二', '三', '四', '五', '六'][parse(dateStr).getDay()] }

/** CSV 导出：columns = [{ key, label, get? }]；中文用 BOM 让 Excel 直接识别；单元格含逗号 / 引号 / 换行时加引号 */
export function toCsv(columns, rows) {
  const esc = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const head = columns.map((c) => esc(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => esc(c.get ? c.get(r) : r[c.key])).join(','))
  return '\uFEFF' + [head, ...body].join('\r\n') + '\r\n'
}
export function downloadCsv(filename, columns, rows) {
  const blob = new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function fileSize(bytes) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB` }
