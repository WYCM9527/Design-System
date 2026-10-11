// 确定性模拟数据（PRD §6）：刷新不变，截图可复现。所有名称、数字都是编的。
const pad = (n, w = 2) => String(n).padStart(w, '0')
const seq = (i, m, salt = 0) => ((i * 7919 + 13 + salt * 104729) % m)

// 状态词汇 → 状态色（PRD §6）
export const STATUS_TONE = {
  '已完成': 'success', '在售': 'success', '进行中': 'success', '已退款': 'success', '正常': 'success', '已开启': 'success', '已生效': 'success',
  '待发货': 'warning', '待审核': 'warning', '告急': 'warning', '待确认': 'warning', '即将开始': 'warning',
  '物流异常': 'error', '已驳回': 'error', '已冻结': 'error', '失败': 'error',
  '已发货': 'info', '处理中': 'info', '退款中': 'info',
  '待付款': 'neutral', '已关闭': 'neutral', '已下架': 'neutral', '草稿': 'neutral', '已结束': 'neutral', '已下线': 'neutral', '已撤销': 'neutral', '已过期': 'neutral', '已使用': 'neutral'
}
export const tone = (s) => STATUS_TONE[s] || 'neutral'

export const yen = (n, sign = false) => `${sign ? (n < 0 ? '−' : '+') : n < 0 ? '−' : ''}¥${Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const int = (n) => n.toLocaleString('zh-CN')

// ── 商品 ──
export const CATEGORIES = [
  { value: 'ring', label: '戒指', children: [{ value: 'band', label: '素圈' }, { value: 'gem', label: '宝石戒' }] },
  { value: 'necklace', label: '项链', children: [{ value: 'chain', label: '锁骨链' }, { value: 'pendant', label: '吊坠' }] },
  { value: 'bracelet', label: '手链', children: [{ value: 'bangle', label: '手镯' }, { value: 'charm', label: '串珠' }] },
  { value: 'earring', label: '耳饰', children: [{ value: 'stud', label: '耳钉' }, { value: 'drop', label: '耳坠' }] },
  { value: 'watch', label: '腕表', children: [{ value: 'quartz', label: '石英' }, { value: 'smart', label: '智能' }] },
  { value: 'gift', label: '礼盒', children: [{ value: 'festival', label: '节日' }, { value: 'custom', label: '定制' }] }
]
const PRODUCT_BASE = [
  ['玫瑰金细圈戒指', 'ring', 'band', 399], ['月光石开口戒', 'ring', 'gem', 699], ['碎钻排戒', 'ring', 'gem', 1599], ['素面情侣对戒', 'ring', 'band', 1299],
  ['淡水珍珠锁骨链', 'necklace', 'chain', 899], ['星河吊坠项链', 'necklace', 'pendant', 1099], ['四叶草锁骨链', 'necklace', 'chain', 599], ['字母定制吊坠', 'necklace', 'pendant', 499],
  ['编织玫瑰金手链', 'bracelet', 'charm', 459], ['极简开口手镯', 'bracelet', 'bangle', 799], ['转运珠红绳', 'bracelet', 'charm', 199], ['方糖链手镯', 'bracelet', 'bangle', 1199],
  ['几何耳钉', 'earring', 'stud', 259], ['珍珠流苏耳坠', 'earring', 'drop', 399], ['小雏菊耳钉', 'earring', 'stud', 229], ['长款星芒耳线', 'earring', 'drop', 329],
  ['简约石英腕表', 'watch', 'quartz', 1899], ['方盘复古腕表', 'watch', 'quartz', 2399], ['玫瑰金智能手环', 'watch', 'smart', 999], ['陶瓷女士腕表', 'watch', 'quartz', 3999],
  ['七夕限定礼盒', 'gift', 'festival', 1688], ['生日惊喜礼盒', 'gift', 'custom', 888], ['中秋团圆礼盒', 'gift', 'festival', 1288], ['刻字定制礼盒', 'gift', 'custom', 1088]
]
const MATERIALS = ['18K 玫瑰金', '925 银', '淡水珍珠', '钛钢', '天然月光石', '锆石']
const catLabel = (c) => CATEGORIES.find((x) => x.value === c).label
export const products = Array.from({ length: 48 }, (_, i) => {
  const [name, cat, sub, price] = PRODUCT_BASE[i % 24]
  const v = i >= 24 ? '（二代）' : ''
  const stock = [186, 42, 8, 120, 320, 64, 240, 520, 96, 0][seq(i, 10)]
  const status = i % 11 === 5 ? '已下架' : i % 13 === 7 ? '草稿' : '在售'
  return {
    id: `SG${pad(2610 + i, 4)}`,
    sku: `SG-${cat.slice(0, 2).toUpperCase()}-${pad(101 + i, 4)}`,
    name: name + v,
    cat, sub, catLabel: catLabel(cat),
    material: [MATERIALS[seq(i, 6)], MATERIALS[seq(i, 6, 1)]].filter((m, k, a) => a.indexOf(m) === k),
    price: price + (i >= 24 ? 100 : 0),
    listPrice: Math.round((price + (i >= 24 ? 100 : 0)) * 1.25),
    cost: Math.round(price * 0.38),
    stock, safety: 20,
    sales: 12 + seq(i, 380),
    status,
    onShelf: status === '在售',
    hue: seq(i, 6)   // 缩略图占位的形状序号（没有真实图片）
  }
})
export const lowStock = products.filter((p) => p.stock < p.safety && p.status === '在售')

// ── 客户 ──
const SURNAMES = ['苏', '周', '陈', '林', '吴', '许', '何', '沈', '韩', '叶', '方', '唐']
const GIVEN = ['晚晴', '一诺', '思远', '若溪', '嘉禾', '知夏', '亦舒', '景行', '南乔', '时雨', '星辰', '安然']
const LEVELS = ['普通会员', '银卡会员', '金卡会员', '黑金会员']
const CHANNELS = ['小程序', 'App', '天猫', '抖音']
const TAGS = ['高复购', '礼品客', '价格敏感', '新客', '大促活跃', '珍珠偏好', '腕表偏好', '生日月']
export const customers = Array.from({ length: 64 }, (_, i) => {
  const lv = [0, 1, 2, 1, 0, 3, 2, 0, 1, 0][seq(i, 10)]
  const orders = 1 + seq(i, 30) + lv * 6
  return {
    id: `C${pad(10086 + i * 7, 6)}`,
    name: SURNAMES[i % 12] + GIVEN[seq(i, 12)],
    phone: `1${[38, 39, 58, 86, 77][seq(i, 5)]}****${pad(1000 + seq(i, 8999), 4)}`,
    level: LEVELS[lv], levelIx: lv,
    spent: Math.round((380 + seq(i, 5200)) * (1 + lv * 1.6)) + 0.5 * (i % 2),
    orders,
    last: `2026-${pad(10 - (seq(i, 9) > 6 ? 3 : 0))}-${pad(9 - (i % 9))}`,
    tags: [TAGS[seq(i, 8)], TAGS[seq(i, 8, 3)], TAGS[seq(i, 8, 5)]].filter((t, k, a) => a.indexOf(t) === k).slice(0, 1 + seq(i, 3)),
    channel: CHANNELS[seq(i, 4)],
    status: i % 17 === 9 ? '已冻结' : '正常',
    joined: `202${4 + (i % 3)}-${pad(1 + (i % 12))}-${pad(1 + (i * 3) % 28)}`,
    points: 120 + seq(i, 9800),
    birthday: `${pad(1 + (i % 12))}-${pad(1 + (i * 5) % 28)}`
  }
})

// ── 订单 ──
const ORDER_STATUS = ['待发货', '已发货', '已完成', '待付款', '已完成', '已关闭', '待发货', '物流异常', '已完成', '已发货']
const CARRIERS = ['顺丰速运', '京东物流', '中通快递', '圆通速递']
const CITIES = ['上海市 静安区 南京西路 1266 号 恒隆广场办公楼 2 座 38 层', '杭州市 西湖区 文三路 90 号 东部软件园 1 号楼 5 层', '北京市 朝阳区 建国路 87 号 华贸中心写字楼 1 座 1206', '广州市 天河区 珠江新城 花城大道 85 号 高德置地广场 A 座', '成都市 武侯区 天府大道北段 1700 号 环球中心 W6 区 1702']
export const orders = Array.from({ length: 128 }, (_, i) => {
  const status = ORDER_STATUS[seq(i, 10)]
  const c = customers[seq(i, 64)]
  const count = 1 + seq(i, 3)
  const items = Array.from({ length: count }, (_, k) => { const p = products[seq(i + k * 5, 48)]; return { id: p.id, name: p.name, sku: p.sku, price: p.price, qty: 1 + seq(i + k, 2), material: p.material[0] } })
  const goods = items.reduce((s, it) => s + it.price * it.qty, 0)
  const discount = [0, 50, 100, 0, 30][seq(i, 5)]
  const minute = 59 - (i % 60), hour = 18 - Math.floor(i / 60) * 3 - (i % 4)
  return {
    id: `SO20261009${pad(4120 - i * 3, 4)}`,
    customer: c.name, customerId: c.id, phone: c.phone,
    channel: CHANNELS[seq(i, 4, 2)],
    items, goods, discount, freight: goods >= 299 ? 0 : 12,
    amount: goods - discount + (goods >= 299 ? 0 : 12),
    time: `2026-10-${pad(9 - Math.floor(i / 24))} ${pad(Math.max(hour, 8))}:${pad(minute)}`,
    status,
    pay: ['微信支付', '支付宝', '银联云闪付', '花呗分期'][seq(i, 4)],
    carrier: status === '已发货' || status === '已完成' || status === '物流异常' ? CARRIERS[seq(i, 4)] : '',
    waybill: status === '已发货' || status === '已完成' || status === '物流异常' ? `SF${pad(1408812000 + i * 37, 10)}` : '',
    address: CITIES[seq(i, 5)],
    note: i % 5 === 0 ? '礼物，请不要放价签；外包装请用品牌礼袋，附手写卡片「生日快乐」。' : ''
  }
})
// 客户的累计订单数 / 消费是近 3 年口径，不能少于近 90 天订单列表里已经能看到的
for (const c of customers) {
  const mine = orders.filter((o) => o.customerId === c.id)
  c.orders = Math.max(c.orders, mine.length)
  c.spent = Math.max(c.spent, mine.reduce((s, o) => s + o.amount, 0))
}

// ── 售后 ──
const REFUND_STATUS = ['待审核', '处理中', '已退款', '待审核', '已驳回', '已撤销', '已退款', '待审核']
const REASONS = [['尺寸不合适，想换小一号', '换货'], ['收到时外包装破损，戒指有划痕', '退货退款'], ['与详情页颜色差异较大', '退货退款'], ['七天无理由退货', '退货退款'], ['物流太慢，已在别处购买', '仅退款'], ['礼盒缺少贺卡与手提袋', '仅退款'], ['珍珠有明显瑕疵', '退货退款'], ['拍错款式', '换货']]
export const refunds = Array.from({ length: 24 }, (_, i) => {
  const o = orders[(i * 5) % 128]
  const [reason, type] = REASONS[seq(i, 8)]
  return {
    id: `RF20261009${pad(310 - i * 4, 3)}`,
    orderId: o.id, customer: o.customer, phone: o.phone,
    type,
    amount: type === '换货' ? 0 : Math.min(o.amount, o.items[0].price * o.items[0].qty),
    reason,
    time: `2026-10-${pad(9 - Math.floor(i / 6))} ${pad(17 - (i % 9))}:${pad(48 - i)}`,
    status: REFUND_STATUS[seq(i, 8)],
    item: o.items[0].name
  }
})

// ── 营销 ──
export const campaigns = Array.from({ length: 12 }, (_, i) => {
  const status = ['进行中', '待审核', '草稿', '已结束', '进行中', '已下线', '进行中', '即将开始', '已结束', '草稿', '进行中', '已下线'][i]
  const budget = 30000 + seq(i, 8) * 15000
  return {
    id: `MK${pad(i + 1, 3)}`,
    name: ['双十一预热 · 满 999 减 120', '新客首单立减 50', '珍珠季 8.8 折', '中秋礼盒限时秒杀', '会员日积分翻倍', '七夕告白季 · 赠刻字', '腕表以旧换新补贴', '圣诞限定礼盒预售', '国庆满赠礼袋', '周末闪购', '黑金会员专享 9 折', '520 告白日'][i],
    type: ['满减', '满减', '折扣', '秒杀', '赠品', '赠品', '满减', '折扣', '赠品', '秒杀', '折扣', '满减'][i],
    channels: [['小程序', 'App'], ['全渠道'], ['天猫', '抖音'], ['小程序']][seq(i, 4)],
    budget,
    used: status === '进行中' ? Math.round(budget * [0.42, 0.93, 0.68, 0.27][i % 4]) : status === '已结束' ? budget : status === '已下线' ? Math.round(budget * 0.55) : 0,
    range: ['10-20 ~ 11-11', '10-01 ~ 12-31', '10-08 ~ 10-31', '09-10 ~ 09-17', '每月 18 日', '08-01 ~ 08-10', '10-01 ~ 10-31', '11-25 ~ 12-25', '10-01 ~ 10-07', '每周六、日', '10-01 ~ 12-31', '05-15 ~ 05-21'][i],
    status, banner: i % 3 === 0
  }
})
export const coupons = Array.from({ length: 10 }, (_, i) => {
  const total = [5000, 2000, 10000, 800, 3000][i % 5]
  const status = ['进行中', '进行中', '已结束', '草稿', '进行中', '已过期', '进行中', '进行中', '草稿', '已结束'][i]
  return {
    id: `CP${pad(i + 1, 3)}`,
    name: ['满 299 减 30', '满 999 减 120', '无门槛 10 元', '黑金专享 9 折', '生日礼券 50 元', '新客 20 元', '珍珠品类 9.5 折', '腕表满 2000 减 200', '复购回馈 15 元', '中秋 8 折'][i],
    type: ['满减券', '满减券', '无门槛券', '折扣券', '无门槛券', '无门槛券', '折扣券', '满减券', '无门槛券', '折扣券'][i],
    value: ['¥30', '¥120', '¥10', '9 折', '¥50', '¥20', '9.5 折', '¥200', '¥15', '8 折'][i],
    threshold: ['满 ¥299', '满 ¥999', '无门槛', '黑金会员', '生日当月', '首单', '珍珠品类', '满 ¥2,000', '近 30 天下单', '全场'][i],
    total, issued: status === '草稿' ? 0 : Math.round(total * [0.62, 0.95, 0.31, 0.78, 1][i % 5]),
    validity: ['领取后 7 天', '10-20 ~ 11-11', '领取后 3 天', '长期', '生日当月', '领取后 15 天', '10-01 ~ 10-31', '10-01 ~ 11-30', '领取后 7 天', '09-10 ~ 09-17'][i],
    status
  }
})

// ── 工作台 / 报表 ──
export const trend = {
  days: Array.from({ length: 14 }, (_, i) => `09-${pad(26 + i > 30 ? 26 + i - 30 : 26 + i)}`).map((d, i) => (i >= 5 ? `10-${pad(i - 4)}` : d)),
  current: [182, 205, 196, 231, 268, 312, 289, 246, 258, 301, 334, 318, 362, 386].map((v) => v * 1000),
  previous: [168, 172, 185, 190, 214, 240, 236, 210, 221, 230, 251, 262, 270, 288].map((v) => v * 1000)
}
export const channelShare = [['小程序', 38], ['App', 27], ['天猫', 21], ['抖音', 14]]
export const topProducts = products.filter((p) => p.status === '在售').slice().sort((a, b) => b.sales - a.sales).slice(0, 8)
export const todos = [
  { status: '物流异常', text: '3 单顺丰件超过 48 小时未揽收', time: '10:42', to: '/orders' },
  { status: '待审核', text: '6 个售后申请等待审核，最早一单已等 20 小时', time: '10:15', to: '/refunds' },
  { status: '告急', text: `${lowStock.length} 个在售商品库存低于安全线`, time: '09:30', to: '/products' },
  { status: '待审核', text: '「双十一预热」活动方案待你审批', time: '09:02', to: '/campaigns' },
  { status: '待发货', text: '昨日 23 单待发货，今日 18:00 截单', time: '08:45', to: '/orders' },
  { status: '处理中', text: '黑金会员生日礼券本周自动发放 128 张', time: '昨天', to: '/campaigns' }
]
export const goals = [
  { label: '10 月销售目标', value: 68, note: '已完成 ¥6,812,400 / 目标 ¥10,000,000' },
  { label: '新客获取', value: 54, note: '已获取 2,160 / 目标 4,000 人' },
  { label: '复购率（参考线，不考核）', value: 81, note: '当前 32.4% / 目标 40%', neutral: true }
]
const series = (base, k) => Array.from({ length: 30 }, (_, i) => Math.round(base * (1 + 0.18 * Math.sin((i + k) / 3.2) + i / 90) / 100) * 100)
export const analytics = {
  days: Array.from({ length: 30 }, (_, i) => (i < 21 ? `09-${pad(10 + i)}` : `10-${pad(i - 20)}`)),
  channels: [['小程序', series(128000, 0)], ['App', series(91000, 2)], ['天猫', series(70000, 4)]],
  categories: CATEGORIES.map((c, i) => [c.label, [486, 612, 338, 274, 401, 529][i] * 1000]),
  heat: Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => Math.max(0, Math.round((h < 8 ? 2 : h < 12 ? 9 : h < 14 ? 14 : h < 19 ? 10 : h < 23 ? 19 : 6) + (d >= 5 ? 4 : 0) + seq(d * 24 + h, 5) - 2))))
}
export const settlement = [
  ['小程序', 4128, 2613420.5, 81240, 39201.3],
  ['App', 2961, 1872106, 52310, 28081.59],
  ['天猫', 2210, 1406390.8, 61880, 70319.54],
  ['抖音', 1488, 920511.2, 33620, 46025.56]
].map(([channel, orders, gmv, refund, fee]) => ({ channel, orders, gmv, refund, fee, net: gmv - refund - fee }))

// ── 消息 / 公告 ──
export const notices = Array.from({ length: 30 }, (_, i) => {
  const kind = ['order', 'audit', 'system'][seq(i, 3)]
  const pool = {
    order: [['物流异常提醒', '订单 SO202610094102 的包裹超过 48 小时未揽收，请联系仓库确认'], ['大额订单', '客户苏晚晴下单 ¥12,880.00（陶瓷女士腕表 ×3），已进入人工复核'], ['催发货', '客户韩知夏第 2 次催促发货，订单已付款 30 小时']],
    audit: [['售后待审核', '售后单 RF20261009302：七天无理由退货，申请退款 ¥2,598.00'], ['活动待审批', '「双十一预热 · 满 999 减 120」由运营周一诺提交，预算 ¥120,000'], ['商品待审核', '「方糖链手镯（二代）」提交上架，等待品控确认材质证书']],
    system: [['系统维护通知', '10 月 12 日 02:00 – 04:00 支付通道升级，期间暂停退款原路返回'], ['新功能上线', '订单列表支持按物流状态筛选，批量发货支持导入运单号'], ['安全提醒', '你的账号在新设备「MacBook Air · Safari」登录，如非本人操作请修改密码']]
  }
  const [title, summary] = pool[kind][seq(i, 3, 1)]
  return { id: `n${i + 1}`, kind, title, summary, time: i < 4 ? `${pad(10 - i)}:${pad(30 - i * 7)}` : i < 12 ? '昨天' : `10-${pad(8 - Math.floor(i / 6))}`, unread: i < 4 }
})
export const announcements = [
  { id: 'a1', title: '关于双十一大促期间发货与售后安排的通知', author: '运营中心 · 周一诺', time: '2026-10-08 18:30' },
  { id: 'a2', title: '10 月会员体系调整说明', author: '会员运营 · 许嘉禾', time: '2026-10-02 10:00' },
  { id: 'a3', title: '珍珠品类质检标准更新', author: '品控部 · 沈景行', time: '2026-09-26 15:20' }
]

// ── 成员 ──
export const members = [
  { name: '林夏', account: 'linxia', role: 'admin', enabled: true, last: '2026-10-09 09:12' },
  { name: '周一诺', account: 'zhouyinuo', role: 'ops', enabled: true, last: '2026-10-09 08:40' },
  { name: '许嘉禾', account: 'xujiahe', role: 'ops', enabled: true, last: '2026-10-08 18:22' },
  { name: '何若溪', account: 'heruoxi', role: 'service', enabled: true, last: '2026-10-09 10:05' },
  { name: '唐南乔', account: 'tangnanqiao', role: 'service', enabled: false, last: '2026-09-30 17:01' },
  { name: '沈景行', account: 'shenjingxing', role: 'ops', enabled: true, last: '2026-10-07 11:30' },
  { name: '方时雨', account: 'fangshiyu', role: 'finance', enabled: true, last: '2026-10-09 07:58' },
  { name: '叶安然', account: 'yeanran', role: 'service', enabled: false, last: '2026-08-12 16:45' },
  { name: '韩星辰', account: 'hanxingchen', role: 'finance', enabled: true, last: '2026-10-05 15:20' }
]
