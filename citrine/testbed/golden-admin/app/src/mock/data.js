// 静态模拟数据（PRD §6）。全部确定性生成，方便截图复现。
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都']
const MERCHANT_NAMES = ['川味小馆（望京店）', '鲜果时光', '老北京炸酱面', '星光甜品', '湘辣小厨', '早安豆浆铺', '云南米线', '粤式茶餐厅', '鲜蔬到家', '深夜烧烤局', '轻食主义', '蜀香冒菜']
const RIDER_NAMES = ['李明', '王芳', '赵磊', '陈静', '刘洋', '周琪', '吴涛', '郑爽', '孙浩', '朱敏', '何俊', '高娜']
const ORDER_STATUS = ['配送中', '待接单', '已完成', '已取消', '草稿']

// 状态词汇 → 状态色（PRD §6 词汇表）
export const STATUS_TONE = {
  '已完成': 'success', '已上线': 'success', '进行中': 'success', '在线': 'success', '通过': 'success', '启用': 'success',
  '待接单': 'warning', '待审核': 'warning', '忙碌': 'warning', '即将过期': 'warning',
  '已取消': 'error', '已驳回': 'error', '失败': 'error',
  '配送中': 'info', '处理中': 'info',
  '草稿': 'neutral', '已停用': 'neutral', '已结束': 'neutral', '离线': 'neutral', '已过期': 'neutral', '已下线': 'neutral'
}
export const tone = (s) => STATUS_TONE[s] || 'neutral'

const pad = (n, w = 2) => String(n).padStart(w, '0')
const seq = (i, m) => ((i * 7919 + 13) % m)

export const orders = Array.from({ length: 128 }, (_, i) => {
  const status = ORDER_STATUS[seq(i, 5)]
  const minute = 59 - (i % 60), hour = 14 - Math.floor(i / 60)
  return {
    id: `20260908-${pad(412 - i, 4)}`,
    merchant: MERCHANT_NAMES[seq(i, 12)],
    city: CITIES[seq(i, 6)],
    amount: 28 + seq(i, 130) * 9.9,
    time: `2026-09-08 ${pad(hour)}:${pad(minute)}`,
    status,
    rider: status === '待接单' || status === '草稿' ? null : RIDER_NAMES[seq(i, 12)],
    duration: status === '已完成' ? 22 + seq(i, 25) : status === '配送中' ? 8 + seq(i, 20) : null,
    rating: status === '已完成' ? (4.5 + seq(i, 6) / 10).toFixed(1) : null,
    items: [['宫保鸡丁', 1, 32], ['米饭', 2, 3], ['酸梅汤', 1, 8]]
  }
})
export const yen = (n) => `¥ ${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const merchants = Array.from({ length: 36 }, (_, i) => ({
  id: `M-2026-${pad(400 + i, 6)}`,
  name: MERCHANT_NAMES[i % 12] + (i >= 12 ? `（${CITIES[i % 6]}${Math.floor(i / 12)}店）` : ''),
  type: ['餐饮', '生鲜', '零售'][seq(i, 3)],
  city: CITIES[seq(i, 6)],
  status: ['已上线', '待审核', '已驳回', '已停用', '已上线', '已上线'][seq(i, 6)],
  joined: `2026-0${1 + (i % 8)}-${pad(1 + (i * 3) % 28)}`,
  contact: RIDER_NAMES[seq(i, 12)],
  phone: `138****${pad(1000 + seq(i, 8999), 4)}`,
  radius: 3 + seq(i, 5),
  minOrder: 15 + seq(i, 4) * 5,
  cycle: ['T+1', 'T+7', '月结'][seq(i, 3)],
  tags: [['川菜', '夜宵'], ['水果', '高评分'], ['面食'], ['甜品', '下午茶']][seq(i, 4)]
}))

export const riders = Array.from({ length: 24 }, (_, i) => ({
  id: `R${pad(100 + i, 3)}`, name: RIDER_NAMES[i % 12] + (i >= 12 ? '·B' : ''),
  status: ['在线', '忙碌', '离线'][seq(i, 3)], current: seq(i, 4), done: 8 + seq(i, 20), rating: (4.4 + seq(i, 6) / 10).toFixed(1),
  distance: (0.4 + seq(i, 30) / 10).toFixed(1), active: `${pad(14 - (i % 3))}:${pad(59 - i)}`
}))

export const campaigns = Array.from({ length: 12 }, (_, i) => ({
  id: `C${pad(i + 1, 3)}`,
  name: ['周末满减 · 9 月第二周', '新客首单立减', '夜宵时段折扣', '开学季赠饮', '国庆满 99 减 20', '会员日双倍积分', '雨天配送费补贴', '商户联合促销', '早餐 6 折', '深夜食堂', '水果周', '中秋礼盒预售'][i],
  type: ['满减', '折扣', '赠品'][seq(i, 3)],
  scope: [['北京', '上海'], ['全部城市'], ['广州', '深圳', '杭州'], ['成都']][seq(i, 4)],
  budget: 20000 + seq(i, 8) * 10000,
  used: 0,
  range: ['2026-09-06 ~ 2026-09-14', '2026-09-01 ~ 2026-09-30', '2026-10-01 ~ 2026-10-07', '2026-09-10 ~ 2026-09-12'][seq(i, 4)],
  status: ['进行中', '待审核', '草稿', '已结束', '进行中', '已下线'][seq(i, 6)],
  banner: seq(i, 2) === 0, autoOff: true
})).map((c) => ({ ...c, used: c.status === '进行中' ? Math.round(c.budget * (0.3 + seq(c.budget, 60) / 100)) : c.status === '已结束' ? c.budget : 0 }))

export const members = [
  { name: '王小明', account: 'wangxm', role: 'admin', status: '启用', last: '2026-09-08 09:12' },
  { name: '李雪', account: 'lixue', role: 'ops', status: '启用', last: '2026-09-08 08:40' },
  { name: '张伟', account: 'zhangwei', role: 'ops', status: '启用', last: '2026-09-07 18:22' },
  { name: '刘婷', account: 'liuting', role: 'auditor', status: '启用', last: '2026-09-08 10:05' },
  { name: '陈浩', account: 'chenhao', role: 'auditor', status: '已停用', last: '2026-08-30 17:01' },
  { name: '周敏', account: 'zhoumin', role: 'finance', status: '启用', last: '2026-09-06 11:30' },
  { name: '吴磊', account: 'wulei', role: 'ops', status: '启用', last: '2026-09-08 07:58' },
  { name: '郑丽', account: 'zhengli', role: 'ops', status: '已停用', last: '2026-07-12 16:45' },
  { name: '孙杰', account: 'sunjie', role: 'finance', status: '启用', last: '2026-09-05 15:20' }
]

export const permissionGroups = [
  { key: 'order', label: '订单', items: ['查看', '改派', '取消', '导出'] },
  { key: 'merchant', label: '商户', items: ['查看', '编辑', '审核', '停用'] },
  { key: 'campaign', label: '营销活动', items: ['查看', '编辑', '上线 / 下线'] },
  { key: 'rider', label: '骑手', items: ['查看', '派单', '强制下线'] },
  { key: 'finance', label: '财务', items: ['查看看板', '查看结算', '导出'] },
  { key: 'system', label: '系统', items: ['成员管理', '角色管理'] }
]

export const todos = [
  { text: '审核商户「鲜蔬到家」的资质更新', status: '待审核', time: '09:20', to: '/merchants' },
  { text: '订单 20260908-0411 等待接单超 15 分钟', status: '待接单', time: '13:58', to: '/orders/20260908-0411' },
  { text: '活动「周末满减」预算已用 78%', status: '进行中', time: '12:05', to: '/campaigns' },
  { text: '骑手赵磊连续 3 单超时', status: '处理中', time: '11:40', to: '/orders' },
  { text: '3 个商户资质将在 7 天内过期', status: '即将过期', time: '08:00', to: '/merchants' }
]

export const trend = {
  days: Array.from({ length: 14 }, (_, i) => (26 + i <= 31 ? `08-${pad(26 + i)}` : `09-${pad(26 + i - 31)}`)),
  thisWeek: [1210, 1380, 1290, 1520, 1460, 1710, 1650, 1480, 1590, 1530, 1720, 1680, 1810, 1890],
  lastWeek: [1150, 1260, 1180, 1400, 1350, 1580, 1490, 1320, 1410, 1380, 1550, 1500, 1620, 1700]
}

// ---- 第二轮：看板、通知、公告 ----
export const analytics = {
  days: Array.from({ length: 7 }, (_, i) => `09-${pad(2 + i)}`),
  cityLines: [
    { name: '北京', data: [1210, 1380, 1290, 1520, 1460, 1710, 1650] },
    { name: '上海', data: [980, 1040, 1120, 1080, 1230, 1310, 1290] },
    { name: '广州', data: [640, 720, 690, 810, 790, 880, 930] }
  ],
  categories: [{ name: '正餐', value: 38 }, { name: '轻食', value: 17 }, { name: '甜品饮品', value: 15 }, { name: '生鲜', value: 12 }, { name: '夜宵', value: 11 }, { name: '零售', value: 7 }],
  ranking: MERCHANT_NAMES.slice(0, 10).map((name, i) => ({ name, gmv: 98600 - i * 7400 - seq(i, 900) })),
  heat: Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
    const lunch = Math.max(0, 6 - Math.abs(h - 12)) * 9, dinner = Math.max(0, 6 - Math.abs(h - 18.5)) * 11, late = h >= 21 || h <= 1 ? 18 : 0
    return Math.round((lunch + dinner + late + seq(d * 24 + h, 9)) * (d >= 5 ? 1.25 : 1))
  })),
  settlement: [
    { city: '北京', orders: 9860, gmv: 1286400, fee: 128640, refund: 21300 },
    { city: '上海', orders: 7420, gmv: 934200, fee: 93420, refund: 14800 },
    { city: '广州', orders: 5210, gmv: 612800, fee: 61280, refund: 9900 },
    { city: '深圳', orders: 4880, gmv: 587100, fee: 58710, refund: 8600 },
    { city: '杭州', orders: 3120, gmv: 361900, fee: 36190, refund: 5200 },
    { city: '成都', orders: 2780, gmv: 298400, fee: 29840, refund: 4100 }
  ]
}

const NOTICE_TEXT = [
  ['system', '系统将于 9 月 12 日 02:00–04:00 升级', '升级期间订单管理与商户审核不可用，请提前安排。'],
  ['audit', '「鲜蔬到家」提交了资质更新', '营业执照已更换，等待审核。'],
  ['ops', '订单 20260908-0411 等待接单超 15 分钟', '建议手动催单或改派附近骑手。'],
  ['ops', '活动「周末满减」预算已用 78%', '按当前速度预算将在明天中午耗尽。'],
  ['audit', '「深夜烧烤局」审核已通过', '商户已上线，可在商户管理中查看。'],
  ['system', '密码策略更新', '自 10 月起密码需包含大小写字母与数字，且每 90 天更换。'],
  ['ops', '骑手赵磊连续 3 单超时', '请核实是否需要调整派单策略。'],
  ['audit', '「早安豆浆铺」被驳回', '驳回原因：营业执照照片不清晰。'],
  ['ops', '3 个商户资质将在 7 天内过期', '请通知商户更新证照。'],
  ['system', '数据看板新增「时段热力」', '可按小时查看下单分布。']
]
export const notices = Array.from({ length: 30 }, (_, i) => {
  const [type, title, summary] = NOTICE_TEXT[i % 10]
  return { id: i + 1, type, title: i >= 10 ? `${title}（${i - 9}）` : title, summary, time: i < 5 ? `今天 ${pad(9 + i)}:${pad(seq(i, 60))}` : `09-${pad(8 - Math.floor(i / 5))} ${pad(8 + (i % 12))}:${pad(seq(i, 60))}`, unread: i < 5 }
})
export const NOTICE_TYPE = { system: '系统', audit: '审核', ops: '运营' }

export const announcements = [
  { id: 'a1', title: '9 月运营规范更新：订单改派与取消的处理时限', author: '运营中心', time: '2026-09-06 18:30', tag: '规范' },
  { id: 'a2', title: '商户资质审核标准（2026 版）', author: '审核组', time: '2026-09-01 10:00', tag: '审核' },
  { id: 'a3', title: '国庆假期值班与应急联系方式', author: '运营中心', time: '2026-08-28 15:20', tag: '通知' }
]

// ---- 第三轮：退款审核 ----
// 状态用英文键存储，展示文案与状态色（DESIGN.md 五种状态语义）在这里统一映射
export const REFUND_STATUS = {
  pending: { label: '待审核', tone: 'warning' },
  approved: { label: '已通过', tone: 'success' },
  rejected: { label: '已拒绝', tone: 'error' }
}
const REFUND_REASONS = ['商品少送一份', '菜品有异物', '配送超时超过 40 分钟', '用户重复下单', '商户缺货未通知', '收货地址填写错误', '骑手联系不上用户', '餐品洒漏无法食用']
const REJECT_REASONS = ['超出 24 小时可退款时限', '商户已提供补送凭证', '订单已正常送达，无质量问题记录', '同一订单已存在处理完成的退款']
const REFUND_HANDLERS = ['王小明', '李雪', '张伟', '吴磊']
export const refunds = Array.from({ length: 40 }, (_, i) => {
  const status = ['pending', 'approved', 'rejected', 'pending', 'approved'][seq(i, 5)]
  const order = orders[seq(i, 128)]
  const day = 8 - Math.floor(i / 5), hour = 20 - (i % 5) * 2, minute = seq(i, 60)   // 每天 5 笔，按时间倒序
  const handled = status !== 'pending'
  return {
    id: `RF-202609${pad(day)}-${pad(120 - i, 4)}`,
    orderId: order.id,
    merchant: order.merchant,
    amount: Math.round(order.amount * [1, 1, 0.5, 0.3][seq(i, 4)] * 100) / 100,
    reason: REFUND_REASONS[seq(i, 8)],
    status,
    appliedAt: `2026-09-${pad(day)} ${pad(hour)}:${pad(minute)}`,
    handler: handled ? REFUND_HANDLERS[seq(i, 4)] : null,
    handledAt: handled ? `2026-09-${pad(day)} ${pad(hour + 1 + seq(i, 3))}:${pad((minute + 17) % 60)}` : null,
    rejectReason: status === 'rejected' ? REJECT_REASONS[seq(i, 4)] : null
  }
})
