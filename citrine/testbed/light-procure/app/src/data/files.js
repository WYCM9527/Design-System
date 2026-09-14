// 附件存储：文件内容放 IndexedDB（localStorage 放不下 3 × 5MB），元数据放在申请记录里（id / name / size / type）。
// 种子样本：一张 canvas 生成的 PNG 与一份最小合法 PDF（PRD §7）。
import { FILE_LIMIT } from './constants'

const DB_NAME = 'qc-files', STORE = 'files'
let dbp
function open() {
  if (dbp) return dbp
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error)
  })
  return dbp
}
function tx(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode); const s = t.objectStore(STORE); const r = fn(s)
    t.oncomplete = () => resolve(r && r.result); t.onerror = () => reject(t.error)
  }))
}
export const putFile = (id, blob) => tx('readwrite', (s) => s.put(blob, id))
export const getFile = (id) => tx('readonly', (s) => s.get(id))
export const deleteFile = (id) => tx('readwrite', (s) => s.delete(id))
export const clearFiles = () => tx('readwrite', (s) => s.clear())

/** 校验一个待上传文件：返回错误文案或 null（PRD P03：类型 / 大小 / 数量，超限时保留已成功的） */
export function validateFile(file, currentCount) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (currentCount >= FILE_LIMIT.count) return `最多上传 ${FILE_LIMIT.count} 个附件`
  if (!FILE_LIMIT.types.includes(file.type) && !FILE_LIMIT.exts.includes(ext)) return '仅支持 JPG、PNG、PDF'
  if (file.size > FILE_LIMIT.size) return '单个文件不超过 5MB'
  return null
}

export const newFileId = () => `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/** 在新标签打开 / 取得预览地址（调用方负责 revoke） */
export async function fileUrl(id) { const blob = await getFile(id); return blob ? URL.createObjectURL(blob) : null }

// ── 种子样本 ──
function samplePng() {
  const c = document.createElement('canvas'); c.width = 640; c.height = 400
  const g = c.getContext('2d')
  g.fillStyle = '#F3F4F6'; g.fillRect(0, 0, 640, 400)
  g.fillStyle = '#111827'; g.font = 'bold 40px sans-serif'; g.fillText('轻采 · 测试样本', 60, 120)
  g.font = '22px sans-serif'; g.fillStyle = '#4B5563'; g.fillText('报价单截图（虚构） 2026-08', 60, 180)
  g.strokeStyle = '#9CA3AF'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(60, 230 + i * 36); g.lineTo(580, 230 + i * 36); g.stroke() }
  return new Promise((r) => c.toBlob(r, 'image/png'))
}
function samplePdf() {
  // 最小合法 PDF：一页、一行 Helvetica 文字（中文用拼音避免字体嵌入）
  const content = 'BT /F1 24 Tf 72 720 Td (QingCai test sample - quotation) Tj ET'
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ]
  let out = '%PDF-1.4\n'; const offsets = []
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Blob([out], { type: 'application/pdf' })
}
export const SEED_FILES = [
  { id: 'f-seed-png', name: '报价单截图.png', type: 'image/png', size: 0 },
  { id: 'f-seed-pdf', name: '供应商报价.pdf', type: 'application/pdf', size: 0 }
]
export async function seedFiles() {
  await clearFiles()
  const png = await samplePng(); const pdf = samplePdf()
  SEED_FILES[0].size = png.size; SEED_FILES[1].size = pdf.size
  await putFile('f-seed-png', png); await putFile('f-seed-pdf', pdf)
  return SEED_FILES.map((f) => ({ ...f }))
}
