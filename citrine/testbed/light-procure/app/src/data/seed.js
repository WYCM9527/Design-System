// 演示数据（PRD §7）：全部虚构。指标、图表、表格、详情都从这一套数据计算，没有单独编写的展示数字。
// 必须保留的可定位样本见文末 SAMPLES。
import { BASE_DATE } from './constants'
import { sumLines } from './format'

export const DEPARTMENTS = [
  { id: 'd1', name: '行政' }, { id: 'd2', name: '财务' }, { id: 'd3', name: '产品设计' }, { id: 'd4', name: '技术' }
]

// 12 名成员：1 管理员、2 审批人、9 申请人（2 名停用）；周舟无申请无资产（空工作台样本）
export const MEMBERS = [
  { id: 'u01', name: '许岚', email: 'xulan@example.com', deptId: 'd1', role: 'admin', active: true, joinedAt: '2024-03-04' },
  { id: 'u02', name: '陈予', email: 'chenyu@example.com', deptId: 'd1', role: 'approver', active: true, joinedAt: '2024-05-13' },
  { id: 'u03', name: '顾言', email: 'guyan@example.com', deptId: 'd2', role: 'approver', active: true, joinedAt: '2024-06-17' },
  { id: 'u04', name: '林晓', email: 'linxiao@example.com', deptId: 'd3', role: 'applicant', active: true, joinedAt: '2025-01-06' },
  { id: 'u05', name: '周舟', email: 'zhouzhou@example.com', deptId: 'd4', role: 'applicant', active: true, joinedAt: '2026-08-25' },
  { id: 'u06', name: '沈叶', email: 'shenye@example.com', deptId: 'd4', role: 'applicant', active: true, joinedAt: '2025-03-10' },
  { id: 'u07', name: '韩梅', email: 'hanmei@example.com', deptId: 'd2', role: 'applicant', active: true, joinedAt: '2025-04-21' },
  { id: 'u08', name: '罗川', email: 'luochuan@example.com', deptId: 'd3', role: 'applicant', active: true, joinedAt: '2025-07-01' },
  { id: 'u09', name: '方晴', email: 'fangqing@example.com', deptId: 'd1', role: 'applicant', active: true, joinedAt: '2025-09-15' },
  { id: 'u10', name: '江澄', email: 'jiangcheng@example.com', deptId: 'd4', role: 'applicant', active: true, joinedAt: '2025-11-03' },
  { id: 'u11', name: '唐宁', email: 'tangning@example.com', deptId: 'd2', role: 'applicant', active: false, joinedAt: '2025-02-18' },
  { id: 'u12', name: '蒋一', email: 'jiangyi@example.com', deptId: 'd3', role: 'applicant', active: false, joinedAt: '2025-05-26' }
]

// 8 家供应商：启用 6、停用 2；s7 停用但有历史已通过申请；s6 同时关联已提交申请与草稿（T10 样本）
export const SUPPLIERS = [
  { id: 's1', name: '星辰办公设备', contact: '王磊', phone: '021-6688 1200', email: 'sales@xingchen.example.com', address: '上海市徐汇区宜山路 800 号', note: '', active: true, updatedAt: '2026-07-02 10:00' },
  { id: 's2', name: '云图科技', contact: '李静', phone: '+86 138 0000 2211', email: 'lijing@yuntu.example.com', address: '北京市海淀区中关村大街 1 号', note: '电脑设备主供', active: true, updatedAt: '2026-07-15 14:20' },
  { id: 's3', name: '木野家具', contact: '赵一舟', phone: '0571-8800 3300', email: 'zhao@muye.example.com', address: '杭州市余杭区文一西路 998 号', note: '', active: true, updatedAt: '2026-06-28 09:10' },
  { id: 's4', name: '恒达数码', contact: '孙倩', phone: '0755-2233 4455', email: 'sunqian@hengda.example.com', address: '深圳市南山区科技园南区', note: '', active: true, updatedAt: '2026-08-01 16:45' },
  { id: 's5', name: '优办耗材', contact: '周明', phone: '400-800-1234', email: '', address: '', note: '耗材类年度框架', active: true, updatedAt: '2026-08-10 11:30' },
  { id: 's6', name: '蓝海电子', contact: '吴桐', phone: '020-3344 5566', email: 'wutong@lanhai.example.com', address: '广州市天河区珠江新城', note: '', active: true, updatedAt: '2026-08-20 15:00' },
  { id: 's7', name: '旧岸贸易', contact: '郑凯', phone: '', email: 'zhengkai@jiuan.example.com', address: '', note: '2026-08 起停用：交付延期', active: false, updatedAt: '2026-08-18 10:05' },
  { id: 's8', name: '北原文具', contact: '何雨', phone: '010-5566 7788', email: '', address: '北京市朝阳区', note: '价格无优势，停用', active: false, updatedAt: '2026-08-05 09:30' }
]

const byId = (list, id) => list.find((x) => x.id === id)
const dept = (id) => byId(DEPARTMENTS, id)
const member = (id) => byId(MEMBERS, id)
const supplier = (id) => byId(SUPPLIERS, id)

// 明细简写：[名称, 类别, 数量, 单价, 规格?]
const L = (name, category, qty, price, spec = '') => ({ name, category, spec, qty, price })

// 采购申请规格：status / who / 时间 / 明细 / 供应商 / 审批人与结果。数字都从明细算出。
// no 的日期部分取自 createdAt；序号在同日内递增（生成时统一编号）
const APP_SPECS = [
  // ── 已通过 10 ──
  { key: 'ap1', who: 'u04', title: '设计部 2 台校色显示器', created: '2026-08-03 09:12', submitted: '2026-08-03 09:40', decided: '2026-08-04 10:20', by: 'u02', status: 'approved', supplier: 's2', expect: '2026-08-20', purpose: '产品设计部新增 2 名视觉设计师，现有显示器无法满足色彩校准需求，用于 UI 走查与印刷物料校色。', lines: [L('27 英寸 4K 校色显示器', '电脑设备', 2, 4299, 'sRGB 99%，自带校色仪')], files: ['png'], opinion: '同意，注意与 IT 确认接口。' },
  { key: 'ap2', who: 'u08', title: '产品设计部升降办公桌', created: '2026-08-05 14:02', submitted: '2026-08-05 14:30', decided: '2026-08-06 09:15', by: 'u03', status: 'approved', supplier: 's3', expect: '2026-08-30', purpose: '设计部工位改造第一批，替换 4 张老化办公桌，改善久坐问题，方案已在部门会议通过。', lines: [L('电动升降办公桌', '办公家具', 4, 1680, '1.4m 白色桌面'), L('人体工学椅', '办公家具', 4, 899)], opinion: '' },
  { key: 'ap3', who: 'u06', title: '技术部开发用笔记本电脑', created: '2026-08-08 10:15', submitted: '2026-08-08 10:50', decided: '2026-08-08 16:40', by: 'u02', status: 'approved', supplier: 's7', expect: '2026-08-25', purpose: '技术部 8 月入职 3 名后端工程师，需配置开发用笔记本，旧机型无法运行当前容器环境。', lines: [L('开发用笔记本电脑', '电脑设备', 3, 9999, '32G 内存 / 1T 固态'), L('笔记本扩展坞', '电脑设备', 3, 699)], opinion: '按入职名单发放。' },
  { key: 'ap4', who: 'u07', title: '财务部票据打印机与耗材', created: '2026-08-11 11:20', submitted: '2026-08-11 11:45', decided: '2026-08-12 09:05', by: 'u02', status: 'approved', supplier: 's1', expect: '2026-08-28', purpose: '现有票据打印机故障率高，报销单据打印频繁卡纸，采购 1 台新机并备一批耗材。', lines: [L('针式票据打印机', '办公设备', 1, 2380), L('色带', '其他', 10, 45)], opinion: '' },
  { key: 'ap5', who: 'u10', title: '技术部机房交换机与服务器扩容', created: '2026-08-14 09:30', submitted: '2026-08-14 10:10', decided: '2026-08-15 15:30', by: 'u03', status: 'approved', supplier: 's6', expect: '2026-09-10', purpose: '内部测试环境容量不足，新增 2 台服务器与 1 台核心交换机，支撑 Q4 项目并行测试与 CI 构建。', lines: [L('机架式服务器', '电脑设备', 2, 68000, '2U，双路，256G 内存'), L('核心交换机', '电脑设备', 1, 12800, '48 口万兆')], files: ['pdf'], opinion: '预算内，同意。' },   // 六位数金额样本
  { key: 'ap6', who: 'u09', title: '行政前台接待区沙发', created: '2026-08-18 15:00', submitted: '2026-08-18 15:20', decided: '2026-08-19 10:00', by: 'u03', status: 'approved', supplier: 's3', expect: '2026-09-05', purpose: '前台接待区沙发使用超过 6 年，多处破损影响来访体验，更换为三人位沙发 1 组与茶几 1 张。', lines: [L('三人位沙发', '办公家具', 1, 3200), L('茶几', '办公家具', 1, 780)], opinion: '' },
  { key: 'ap7', who: 'u04', title: '设计部手绘板与配件', created: '2026-08-22 10:05', submitted: '2026-08-22 10:30', decided: '2026-08-23 11:10', by: 'u03', status: 'approved', supplier: 's4', expect: '2026-09-08', purpose: '插画与图标绘制需求增加，为 2 名设计师配置专业手绘板，替换已无法校准的旧设备。', lines: [L('专业手绘板', '电脑设备', 2, 2599, '中号，8192 级压感'), L('替换笔尖', '其他', 4, 39)], opinion: '' },
  { key: 'ap8', who: 'u02', title: '行政部会议室投影设备', created: '2026-08-26 09:00', submitted: '2026-08-26 09:25', decided: '2026-08-27 09:50', by: 'u03', status: 'approved', supplier: 's1', expect: '2026-09-15', purpose: '三号会议室投影亮度不足，白天需拉窗帘，更换为激光投影 1 台并配 120 寸幕布。', lines: [L('激光投影仪', '办公设备', 1, 8600, '4000 流明'), L('电动幕布', '办公设备', 1, 1500, '120 寸')], opinion: '' },
  { key: 'ap9', who: 'u06', title: '技术部机械键盘与显示器支架', created: '2026-09-01 10:40', submitted: '2026-09-01 11:00', decided: '2026-09-02 09:30', by: 'u02', status: 'approved', supplier: 's4', expect: '2026-09-20', purpose: '技术部工位配件统一更换，键盘按键失灵率高，显示器支架用于双屏工位。', lines: [L('机械键盘', '电脑设备', 6, 499), L('双屏显示器支架', '办公设备', 6, 329)], opinion: '' },
  { key: 'ap10', who: 'u04', title: '设计部打样用彩色激光打印机', created: '2026-09-03 14:10', submitted: '2026-09-03 14:35', decided: '2026-09-04 10:05', by: 'u02', status: 'approved', supplier: 's1', expect: '2026-09-25', purpose: '物料打样频繁外送，来回耗时两天，采购部门级彩色激光打印机一台用于日常打样与校稿。', lines: [L('彩色激光打印机', '办公设备', 1, 5680, 'A3，双面'), L('硒鼓套装', '其他', 1, 1290)], opinion: '同意。' },
  // ── 已驳回 6 ──
  { key: 'rj1', who: 'u04', title: '设计部 VR 头显体验设备', created: '2026-08-06 16:00', submitted: '2026-08-06 16:30', decided: '2026-08-07 10:00', by: 'u02', status: 'rejected', supplier: 's4', expect: '2026-08-30', purpose: '探索 VR 场景下的产品交互原型验证，需要 2 台头显用于内部体验测试与原型演示。', lines: [L('VR 头显', '电脑设备', 2, 3999)], opinion: '暂无明确项目承接，建议先借用外部设备验证需求后再申请。' },
  { key: 'rj2', who: 'u09', title: '行政部咖啡机升级', created: '2026-08-12 10:00', submitted: '2026-08-12 10:20', decided: '2026-08-13 09:00', by: 'u03', status: 'rejected', supplier: 's5', expect: '2026-09-01', purpose: '现有胶囊咖啡机耗材成本高，拟更换为全自动咖啡机一台，降低长期耗材费用并提升员工满意度。', lines: [L('全自动咖啡机', '办公设备', 1, 12800)], opinion: '本季度非必要支出暂缓，四季度再议。' },
  { key: 'rj3', who: 'u07', title: '财务部第二台碎纸机', created: '2026-08-20 09:15', submitted: '2026-08-20 09:40', decided: '2026-08-21 14:20', by: 'u02', status: 'rejected', supplier: 's1', expect: '2026-09-05', purpose: '月末凭证销毁量大，一台碎纸机排队严重，申请第二台大容量碎纸机。', lines: [L('大容量碎纸机', '办公设备', 1, 2680)], opinion: '与行政共用现有设备即可，请先协调使用时段。' },
  { key: 'rj4', who: 'u10', title: '技术部游戏手柄（测试用）', created: '2026-08-27 11:30', submitted: '2026-08-27 11:50', decided: '2026-08-28 09:10', by: 'u03', status: 'rejected', supplier: 's4', expect: '2026-09-10', purpose: '客户端项目需要在手柄输入场景下做兼容性测试，申请 4 只主流手柄用于测试矩阵。', lines: [L('游戏手柄', '其他', 4, 459)], opinion: '请补充测试计划和项目编号后重新提交。' },
  { key: 'rj5', who: 'u08', title: '设计部无线降噪耳机', created: '2026-09-02 15:20', submitted: '2026-09-02 15:40', decided: '2026-09-03 09:20', by: 'u02', status: 'rejected', supplier: 's2', expect: '2026-09-20', purpose: '开放式办公区噪音影响专注工作，为设计部 6 名成员配备降噪耳机。', lines: [L('无线降噪耳机', '其他', 6, 1899)], opinion: '个人配件不在部门采购范围内，可走个人补贴。' },
  { key: 'rj6', who: 'u04', title: '设计部资料柜', created: '2026-09-05 10:10', submitted: '2026-09-05 10:30', decided: '2026-09-05 16:00', by: 'u03', status: 'rejected', supplier: 's3', expect: '2026-09-25', purpose: '设计物料样品堆放无序，申请 2 组带锁资料柜用于集中存放印刷样品与设备配件。', lines: [L('带锁资料柜', '办公家具', 2, 1350)], opinion: '仓库有闲置资料柜 3 组，请先联系行政调拨。' },
  // ── 待审批 12 ──
  { key: 'pd1', who: 'u04', title: '设计部人像摄影灯与背景架', created: '2026-09-01 09:20', submitted: '2026-09-01 09:50', status: 'pending', supplier: 's4', expect: '2026-09-22', purpose: '官网与招聘物料需拍摄团队人像，外包单次费用高，采购一套基础摄影灯与背景架自建拍摄条件。', lines: [L('LED 摄影补光灯', '其他', 2, 1299, '双色温 200W'), L('背景架', '其他', 1, 460), L('背景布', '其他', 2, 120, '灰 / 白')], files: ['png', 'pdf'] },   // 林晓 · 3 行带附件 · 供通过
  { key: 'pd2', who: 'u04', title: '设计部会议投屏器', created: '2026-09-04 11:05', submitted: '2026-09-04 11:25', status: 'pending', supplier: 's2', expect: '2026-09-28', purpose: '设计评审频繁切换电脑投屏，线缆接口不统一，采购无线投屏器 2 套用于两个评审室。', lines: [L('无线投屏器', '办公设备', 2, 1380)] },   // 林晓 · 供驳回与复制
  { key: 'pd3', who: 'u02', title: '行政部访客登记平板', created: '2026-09-02 09:00', submitted: '2026-09-02 09:15', status: 'pending', supplier: 's2', expect: '2026-09-20', purpose: '前台访客登记改为电子签到，需 1 台平板与支架，配合现有访客系统使用。', lines: [L('平板电脑', '电脑设备', 1, 3299), L('桌面支架', '办公设备', 1, 199)] },   // 陈予提交 · 顾言可审批
  { key: 'pd4', who: 'u08', title: '产品设计部打样材料与工具', created: '2026-08-29 10:30', submitted: '2026-08-29 10:55', status: 'pending', supplier: 's6', expect: '2026-09-18', purpose: '硬件原型打样需要一批手工工具与材料，含热熔胶枪、切割垫与模型板材，供原型迭代使用。', lines: [L('热熔胶枪', '其他', 2, 89), L('切割垫', '其他', 3, 65, 'A2'), L('模型板材', '其他', 20, 18)] },   // s6 已提交申请（T10）
  { key: 'pd5', who: 'u06', title: '技术部 UPS 不间断电源', created: '2026-09-03 09:40', submitted: '2026-09-03 10:00', status: 'pending', priority: 'urgent', supplier: 's6', expect: '2026-09-12', purpose: '机房 UPS 电池老化告警，雷雨季停电风险高，需紧急更换 2 台 UPS 以保护测试服务器。', lines: [L('在线式 UPS', '电脑设备', 2, 5600, '3kVA')] },
  { key: 'pd6', who: 'u07', title: '财务部保险柜', created: '2026-09-05 14:00', submitted: '2026-09-05 14:20', status: 'pending', supplier: 's1', expect: '2026-09-30', purpose: '现有保险柜容量不足且无电子锁，重要凭证与印章需分柜存放，申请 1 台电子密码保险柜。', lines: [L('电子密码保险柜', '办公家具', 1, 2980)] },
  { key: 'pd7', who: 'u09', title: '行政部绿植与花架', created: '2026-09-06 10:10', submitted: '2026-09-06 10:30', status: 'pending', supplier: 's5', expect: '2026-09-25', purpose: '办公区改造第二期，新增公共区域绿植 12 盆与花架 4 组，改善开放区视觉与空气质量。', lines: [L('中型绿植', '其他', 12, 168), L('三层花架', '办公家具', 4, 320)] },
  { key: 'pd8', who: 'u10', title: '技术部测试手机', created: '2026-09-06 15:30', submitted: '2026-09-06 15:50', status: 'pending', priority: 'urgent', supplier: 's4', expect: '2026-09-15', purpose: '新版本需覆盖两款主流机型的兼容测试，现有测试机系统版本过旧无法升级，紧急补充 2 台。', lines: [L('测试用手机 A', '电脑设备', 1, 5999), L('测试用手机 B', '电脑设备', 1, 4599)] },
  { key: 'pd9', who: 'u03', title: '财务部双屏显示器', created: '2026-09-07 09:10', submitted: '2026-09-07 09:30', status: 'pending', supplier: 's2', expect: '2026-09-28', purpose: '财务对账需同时查看两套系统，为 3 名成员配置第二块显示器，提升核对效率。', lines: [L('24 英寸显示器', '电脑设备', 3, 1299)] },
  { key: 'pd10', who: 'u08', title: '产品设计部评审室改造：会议桌、磁性白板、储物柜、会议座椅及白板笔等配套物料一批（第一期）', created: '2026-09-07 11:00', submitted: '2026-09-07 11:30', status: 'pending', supplier: 's3', expect: '2026-10-08', purpose: '设计评审室改造：更换会议桌 1 张、白板 2 面、储物柜 2 组与座椅 8 把，形成可同时容纳 8 人的评审空间。', lines: [L('会议桌', '办公家具', 1, 4200, '2.4m'), L('磁性白板', '办公设备', 2, 680), L('储物柜', '办公家具', 2, 1150), L('会议椅', '办公家具', 8, 420), L('白板笔套装', '其他', 4, 35)] },   // 接近标题上限 + 5 行明细
  { key: 'pd11', who: 'u06', title: '技术部工位电源与网线', created: '2026-09-07 16:20', submitted: '2026-09-07 16:40', status: 'pending', supplier: 's5', expect: '2026-09-20', purpose: '新增 6 个工位需要配套排插与网线，长度按工位布置分两种规格。', lines: [L('多功能排插', '其他', 6, 79), L('六类网线 3m', '其他', 6, 22), L('六类网线 5m', '其他', 6, 28)] },
  { key: 'pd12', who: 'u07', title: '财务部档案密集柜', created: '2026-09-08 08:40', submitted: '2026-09-08 08:55', status: 'pending', supplier: 's3', expect: '2026-10-10', purpose: '历年凭证归档空间不足，申请密集柜 1 组，安装于档案室北侧，替换原有开放式货架。', lines: [L('手动密集柜', '办公家具', 1, 15800, '6 列')] },
  // ── 草稿 8 ──
  { key: 'dr1', who: 'u04', title: '设计部显示器采购', created: '2026-09-06 17:20', status: 'draft', supplier: '', expect: '', purpose: '', lines: [L('', '', 1, '')] },   // 只有标题（保存 vs 提交校验样本）
  { key: 'dr2', who: 'u04', title: '设计部文具与打印纸补货', created: '2026-09-05 15:10', status: 'draft', supplier: 's8', expect: '2026-09-20', purpose: '设计部季度文具与打印纸补货，含 A4 纸 10 箱与常用文具。', lines: [L('A4 打印纸', '其他', 10, 168, '70g，500 张 × 5 包'), L('文具套装', '其他', 6, 45)] },   // 选择了已停用供应商 s8 的草稿
  { key: 'dr3', who: 'u04', title: '设计部原型打样耗材', created: '2026-09-07 14:40', status: 'draft', supplier: 's6', expect: '2026-09-30', purpose: '硬件原型迭代耗材补充，含 PLA 线材与砂纸。', lines: [L('PLA 3D 打印线材', '其他', 5, 89, '1kg'), L('砂纸套装', '其他', 2, 29)] },   // s6 草稿（T10）
  { key: 'dr4', who: 'u08', title: '设计部绘图桌灯', created: '2026-09-04 09:30', status: 'draft', supplier: 's6', expect: '2026-09-26', purpose: '', lines: [L('护眼绘图桌灯', '其他', 4, 259)] },
  { key: 'dr5', who: 'u06', title: '技术部会议室电视', created: '2026-08-30 16:00', status: 'draft', supplier: 's4', expect: '2026-09-30', purpose: '技术部小会议室缺少显示设备，采购 65 寸电视 1 台用于站会与远程会议。', lines: [L('65 寸电视', '办公设备', 1, 4999)] },
  { key: 'dr6', who: 'u07', title: '财务部计算器与装订机', created: '2026-09-03 11:50', status: 'draft', supplier: 's1', expect: '', purpose: '财务部日常办公设备补充。', lines: [L('财务计算器', '办公设备', 4, 128), L('装订机', '办公设备', 1, 560)] },
  { key: 'dr7', who: 'u09', title: '行政部访客饮水机', created: '2026-09-07 10:20', status: 'draft', supplier: '', expect: '2026-09-25', purpose: '', lines: [L('直饮水机', '办公设备', 1, 3280)] },
  { key: 'dr8', who: 'u10', title: '技术部机房温湿度监控', created: '2026-09-08 08:20', status: 'draft', supplier: 's6', expect: '2026-09-22', purpose: '机房缺少温湿度监控，拟采购联网温湿度传感器 2 套接入告警。', lines: [L('温湿度传感器', '其他', 2, 399)] }
]

// 24 件资产：闲置 10、在用 14；四种类别；使用部门分散。[名称, 类别, 规格, 金额, 购入日期, 位置, 使用人?, 来源申请 key?]
const ASSET_SPECS = [
  ['27 英寸 4K 校色显示器', '电脑设备', 'sRGB 99%', 4299, '2026-08-21', '产品设计区 A-03', 'u04', 'ap1'],
  ['27 英寸 4K 校色显示器', '电脑设备', 'sRGB 99%', 4299, '2026-08-21', '产品设计区 A-04', 'u08', 'ap1'],
  ['开发用笔记本电脑', '电脑设备', '32G / 1T', 9999, '2026-08-26', '技术部 B-11', 'u06', 'ap3'],
  ['开发用笔记本电脑', '电脑设备', '32G / 1T', 9999, '2026-08-26', '技术部 B-12', 'u10', 'ap3'],
  ['开发用笔记本电脑', '电脑设备', '32G / 1T', 9999, '2026-08-26', '技术部备用柜', null, 'ap3'],
  ['针式票据打印机', '办公设备', '', 2380, '2026-08-29', '财务室', 'u07', 'ap4'],
  ['机架式服务器', '电脑设备', '2U 双路 256G', 68000, '2026-09-06', '机房 3 号机柜', null, 'ap5'],
  ['核心交换机', '电脑设备', '48 口万兆', 12800, '2026-09-06', '机房 3 号机柜', null, 'ap5'],
  ['三人位沙发', '办公家具', '', 3200, '2026-09-04', '前台接待区', 'u09', 'ap6'],
  ['专业手绘板', '电脑设备', '中号', 2599, '2026-09-05', '产品设计区 A-03', 'u04', 'ap7'],
  ['专业手绘板', '电脑设备', '中号', 2599, '2026-09-05', '产品设计区备用柜', null, 'ap7'],
  ['激光投影仪', '办公设备', '4000 流明', 8600, '2026-09-05', '三号会议室', 'u02', 'ap8'],
  ['电动升降办公桌', '办公家具', '1.4m', 1680, '2026-08-25', '产品设计区 A-01', 'u08', 'ap2'],
  ['电动升降办公桌', '办公家具', '1.4m', 1680, '2026-08-25', '产品设计区 A-02', 'u04', 'ap2'],
  ['人体工学椅', '办公家具', '', 899, '2026-08-25', '产品设计区 A-01', 'u08', 'ap2'],
  ['人体工学椅', '办公家具', '', 899, '2026-08-25', '产品设计区备用', null, 'ap2'],
  ['商务笔记本电脑', '电脑设备', '16G / 512G', 6899, '2025-11-12', '行政部 C-02', 'u01', null],
  ['商务笔记本电脑', '电脑设备', '16G / 512G', 6899, '2025-11-12', '行政部 C-03', 'u02', null],
  ['商务笔记本电脑', '电脑设备', '16G / 512G', 6899, '2025-11-12', '财务室', 'u03', null],
  ['商务笔记本电脑', '电脑设备', '16G / 512G', 6899, '2025-11-12', 'IT 备用柜', null, null],
  ['高速扫描仪', '办公设备', 'A4 双面', 3450, '2025-06-20', '行政部文印区', null, null],
  ['会议音频全向麦', '办公设备', '', 1980, '2025-09-08', '二号会议室', null, null],
  ['移动白板', '办公设备', '1.2m × 0.9m', 620, '2025-03-15', '公共区', null, null],
  ['文件柜', '办公家具', '四抽', 760, '2024-12-02', '财务室', null, null]
]

function pad(n, w = 4) { return String(n).padStart(w, '0') }
function noFor(prefix, dateStr, seq) { return `${prefix}-${dateStr.slice(0, 10).replace(/-/g, '')}-${pad(seq[dateStr.slice(0, 10)] = (seq[dateStr.slice(0, 10)] || 0) + 1)}` }

export function buildSeed(seedFiles) {
  const seq = { CG: {}, ZC: {}, log: 0, notify: 0 }
  const logs = [], notifications = []
  let logClock = 0
  const log = (at, byId, module, action, objectNo, objectName, summary, before = null, after = null) => {
    logs.push({ id: `l${pad(++seq.log)}`, at, byId, byName: member(byId).name, module, action, objectNo, objectName, summary, before, after, order: logClock++ })
  }
  const fileOf = (kind) => seedFiles.find((f) => f.id === (kind === 'png' ? 'f-seed-png' : 'f-seed-pdf'))

  const applications = APP_SPECS
    .slice().sort((a, b) => a.created.localeCompare(b.created))
    .map((s) => {
      const m = member(s.who); const d = dept(m.deptId); const sup = s.supplier ? supplier(s.supplier) : null
      const totals = sumLines(s.lines)
      const app = {
        id: s.key, no: noFor('CG', s.created, seq.CG), title: s.title, applicantId: m.id, applicantName: m.name, deptId: d.id, deptName: d.name,
        priority: s.priority || 'normal', expectDate: s.expect || '', supplierId: s.supplier || '', supplierName: sup && s.status !== 'draft' ? sup.name : '',
        purpose: s.purpose || '', note: s.note || '', lines: s.lines.map((l) => ({ ...l })), attachments: (s.files || []).map((k) => ({ ...fileOf(k) })),
        status: s.status, createdAt: s.created, updatedAt: s.decided || s.submitted || s.created, submittedAt: s.submitted || '', decidedAt: s.decided || '',
        approverId: s.by || '', approverName: s.by ? member(s.by).name : '', opinion: s.opinion || '',
        total: totals.total, qty: totals.qty,
        events: [{ type: 'created', at: s.created, byId: m.id, byName: m.name }]
      }
      log(s.created, m.id, 'application', '创建草稿', app.no, app.title, `新建采购申请草稿「${app.title}」`)
      if (s.submitted) { app.events.push({ type: 'submitted', at: s.submitted, byId: m.id, byName: m.name }); log(s.submitted, m.id, 'application', '提交申请', app.no, app.title, `提交采购申请，预估总金额 ${totals.total.toFixed(2)}`, '草稿', '待审批') }
      if (s.decided) {
        const ap = member(s.by)
        app.events.push({ type: s.status, at: s.decided, byId: ap.id, byName: ap.name, opinion: s.opinion || '' })
        log(s.decided, ap.id, 'application', s.status === 'approved' ? '审批通过' : '审批驳回', app.no, app.title, s.status === 'approved' ? '审批通过' : `审批驳回：${s.opinion}`, '待审批', s.status === 'approved' ? '已通过' : '已驳回')
        notifications.push({ id: `n${pad(++seq.notify)}`, userId: m.id, appId: app.id, title: app.title, result: s.status, reason: s.status === 'rejected' ? s.opinion : '', at: s.decided, read: s.decided < '2026-09-01' })
      }
      return app
    })

  const assets = ASSET_SPECS.map(([name, category, spec, price, purchaseDate, location, userId, appKey], i) => {
    const registeredAt = `${purchaseDate} 10:${pad(10 + i, 2)}`
    const asset = {
      id: `z${pad(i + 1, 2)}`, no: noFor('ZC', purchaseDate, seq.ZC), name, category, spec, price, purchaseDate, location, note: '',
      sourceAppId: appKey || '', status: userId ? 'inuse' : 'idle', userId: userId || '', userName: userId ? member(userId).name : '', deptId: userId ? member(userId).deptId : '', deptName: userId ? dept(member(userId).deptId).name : '',
      registeredAt, updatedAt: registeredAt,
      history: [{ type: 'registered', at: registeredAt, byName: '许岚', note: '登记入库' }]
    }
    log(registeredAt, 'u01', 'asset', '登记资产', asset.no, asset.name, `登记资产「${asset.name}」，存放于 ${location}`)
    if (userId) {
      const at = `${purchaseDate} 14:${pad(10 + i, 2)}`
      asset.history.push({ type: 'assigned', at, byName: '许岚', userName: asset.userName, deptName: asset.deptName, note: '' })
      asset.updatedAt = at
      log(at, 'u01', 'asset', '分配资产', asset.no, asset.name, `分配给 ${asset.userName}（${asset.deptName}）`, '闲置 · 使用人 —', `在用 · 使用人 ${asset.userName}`)
    }
    return asset
  })

  for (const s of SUPPLIERS) log(s.updatedAt, 'u01', 'supplier', s.active ? '新增供应商' : '停用供应商', s.id.toUpperCase(), s.name, s.active ? `新增供应商「${s.name}」` : `停用供应商「${s.name}」：${s.note}`, s.active ? null : '启用', s.active ? null : '停用')
  for (const m of MEMBERS.filter((x) => !x.active)) log('2026-08-15 10:00', 'u01', 'member', '停用成员', m.email, m.name, `停用成员 ${m.name}（离职）`, '启用', '停用')
  logs.sort((a, b) => a.at.localeCompare(b.at) || a.order - b.order)
  notifications.sort((a, b) => b.at.localeCompare(a.at))

  return {
    version: 1, baseDate: BASE_DATE, clock: 0,
    settings: { systemName: '轻采', companyName: '云禾科技', logo: '', pageSize: 10, notifyOnResult: true },
    departments: DEPARTMENTS.map((d) => ({ ...d })),
    members: MEMBERS.map((m) => ({ ...m })),
    suppliers: SUPPLIERS.map((s) => ({ ...s })),
    applications, assets, notifications, logs,
    seq: { CG: seq.CG, ZC: seq.ZC, log: seq.log, notify: seq.notify, file: 0 }
  }
}

// 可定位样本（PRD §7），页面 / 测试脚本按 key 找：
export const SAMPLES = {
  draftTitleOnly: 'dr1', pendingWithFiles: 'pd1', pendingForReject: 'pd2', approverOwnPending: 'pd3',
  approvedWithDisabledSupplier: 'ap3', draftWithDisabledSupplier: 'dr2', supplierForT10: 's6', t10Submitted: 'pd4', t10Draft: 'dr3',
  idleAsset: 'z05', longTitle: 'pd10', fiveLines: 'pd10', sixDigits: 'ap5', emptyMember: 'u05'
}
