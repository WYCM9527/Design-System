# 实测反馈 · 第一轮（P0 七页）

> 记录"设计系统撞上真实组件库"时发现的每一个问题：是谁的问题（token / 桥接 / 组件库 / 页面）、修在哪一层、修了没有。设计系统的每个版本迭代都应该能追溯到这里的一行。

技术栈：Vue 3.5 + Element Plus 2.14 + IconPark 1.4 + ECharts 6 + Vite 8。项目在 `app/`，设计系统落在 `app/design-system/`（从 `seeds/brand-yellow-e` 复制），桥接两份在 `app/src/styles/bridge/`（与种子 `bridge/` 同步）。

## 结果概览（2026-09-08）

- `validate` 0 issue · `guard` current · `status: unified`，采用率 **100%**（751 处 `var()` 引用，11 处字面量全部登记豁免——全是 Element 组件内部几何与徽标圆点）。
- 七页 + 十三种状态 × 亮 / 暗 / 紧凑 = 60 张截图在 `shots/`。
- 暗色**没有**引入 Element 的 `dark/css-vars.css`，全部靠 `--el-*` → token 的 `var()` 间接生效，可用。

## 发现的问题

### A. 组件库"自带主见"（修在桥接层 `bridge/element-plus.css`）

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| A1 | 主按钮白字，黄底上 1.5:1 | Element 主按钮文字固定 `--el-color-white` | `.el-button--primary` 覆写为 `text.on-primary`；hover 边线换 `action.primary-active` |
| A2 | 危险按钮暗色下白字发糊 | Element 用 `--el-color-danger`（= 我们的 status.error，暗色变浅）做填充 | `.el-button--danger` 填充改 `action.danger*`——与种子 rc.1 的"状态色 ≠ 填充色"结论完全一致 |
| A3 | 链接型按钮变成黄字 | Element `link` 按钮取主色 | 改为 `text.link` + 下划线 + 斜体（公司决定） |
| A4 | Element 的 `info` 是灰色 | 与我们蓝色 `status.info` 语义相反 | `--el-color-info` 指向 `status.neutral`；蓝色 info 只用于提示条（`.el-alert--info` 单独覆写），状态徽标不用 el-tag |
| A5 | 固定列阴影糊成一条灰带 | Element 把阴影画在 10px 伪元素上，我用 elevation 的 4/12px 几何替换后失真 | 沿用 Element 的 `inset ±10px 0 10px -10px`，只换颜色。**教训：桥接组件库时几何跟组件、颜色跟 token** |
| A6 | 聚焦只有 1px inset 线 | Element 默认 | 追加 3px `focus.ring`，与设计系统焦点规则一致 |
| A7 | 标题字重 500 | Element `--el-font-weight-primary: 500` | 改 600（雅黑无 500 字形） |
| A8 | 控件默认 32px、小号 24px | Element 尺寸阶梯 40/32/24 与我们 40/34/28 不同 | `--el-component-size*` 指向 `control.height.*`，compact Theme 下自动收紧 |
| A9 | Element 内置图标（下拉箭头、关闭、勾）与 IconPark 并存 | 组件内部 SVG 不可替换 | **接受**。写进 DESIGN.md 图标一节：功能性内置图标允许混用，业务图标一律 IconPark |
| A10 | `<el-badge>` 默认红色 | Element badge 默认 type=danger | 未改：通知未读用红是国内通用心智；菜单里的"待处理数"用品牌黄。两者语义不同，各留各的 |

### B. 设计系统自身（修在 token / 文档）

| # | 现象 | 处理 |
| --- | --- | --- |
| B1 | IconPark Vue 版的 `IconProvider` 是函数不是组件 | 修正 `bridge/iconpark.config.ts` 的 Vue 用法（在 App.vue setup 里调用） |
| B2 | 描述列表标签列默认太窄，"用户备注"换行 | 用 `layout.form.label-width` 作为 `el-descriptions` 的 label-width——同一个 token 同时约束表单与描述列表，是正确的复用 |
| B3 | 表单弹窗里长标签（"同步到 App 首页 Banner"）换行 | 页面问题：标签文案缩短为"首页 Banner"。规范层面新增一条：表单标签不超过 6 个汉字，超出的用帮助文字 |
| B4 | 多选表格 + 批量条在 Element 里同样会"黄墙" | rc.2 的 `bg.selected-subtle` 在 Element 表格里通过 `tr.is-selected` 覆写生效，问题不再出现——**种子层的修复被真实组件库验证** |

### C. 页面层（修在 `app/`）

- C1 订单列表默认筛选过严只剩 4 行，改为无默认筛选。
- C2 改派抽屉的骑手卡片 grid 自动布局把状态和姓名放反，改为显式 `grid-template-areas`。
- C3 成员表操作列 200px 不够三个链接，改 230px + 不换行。

## D. 人工反馈 · 第一批（侧栏，2026-09-08 19:45）

| # | 反馈 | 判断 | 处理层 | 处理 |
| --- | --- | --- | --- | --- |
| D1 | 图标太细 | 我在 rc.3 里为 1x 屏选了描边 3，Retina 上确实偏细；这是预测过但需要真人确认的口味问题 | token | `icon.stroke.width` 3 → 4，删 `stroke-width.3`；App / 预览 / 桥接同步 |
| D2 | 选中态改为线性图标 + 深黑底 + 保留左侧主色竖条 | 面性图标表达选中在真实页面里"多了一层"；反转块更利落，黄色只留给竖条更克制 | token + 桥接 | `bg.sidebar-selected` → neutral.900、`text.sidebar-selected` → white（暗色 graphite.600 / neutral.100）；`icon.theme.active` → outline；桥接让选中项 hover 不变浅 |
| D3 | 侧栏空白太多 | 232 是照抄预览的值，没有验证过 | token + 桥接 | `layout.sidebar.width` → 200；菜单 base padding 20 → 12、项外边距 12 → 8、品牌区 20 → 16 |
| D4 | 去掉侧栏里的计数气泡 | 气泡与顶栏通知铃铛的红点重复，且在反转块上没有好的配色 | 页面 + 规范 | 去掉 `menu-count`；DESIGN.md 与 PRD 写明侧栏不放计数，待处理数放工作台与列表页头 |

| D5 | 分段选择 / 状态切换 / 视图切换按钮的选中态禁止用黄色，改为黑色 | 与 D2 是同一个原则：黄色表达主操作，不表达选中。之前 `el-radio-button` 走 Element 的 primary 取色，等于把品牌色用在了选中态 | token + 桥接 | 新增 `action.selected` / `text.on-selected`；桥接改 `--el-radio-button-checked-*` 三个变量；预览页 `.seg` 与控制条同步；DESIGN.md 写入总则 |
| D6 | 标签页下划线改黑；分页保留黄 | 下划线是"当前位置"，同属选中语义；分页黄块很小，作为页面唯一的黄色定位点保留 | token + 桥接 | 新增 `border.current`（暗色用浅色，细线不能复用 graphite.600）；`.el-tabs__active-bar` 与预览页 `.tabs` 同步 |
| D7 | 整体太凌厉，增大圆角，但要守嵌套规则（内 < 外） | 原阶梯 4 / 6 / 10 是照 AntD 密度取的，放大一档更亲和；同时原来只有三档，弹窗与卡片同为 lg、勾选框与标签同为 sm，本来就违反"内 < 外" | token + 桥接 + 页面 | 五档 xs 4 / sm 6 / md 8 / lg 12 / xl 16；勾选框 xs、弹窗与抽屉 xl、卡片 lg、控件 md、标签 sm；空状态插图框降为 md；演示舞台不圆角 |
| D8 | 圆角到顶后继续"亲和"：调阴影和留白 | 凌厉感的真正来源是 1px 硬边线 + 几乎不可见的阴影 + 偏紧的留白，不是圆角 | token + 桥接 + 页面 | 阴影三层放柔放大；卡片边线降为新 `border.subtle`；`space.gutter` 32 / `space.stack` 20 / 新 `space.card` 24 / 表格行内边距 14 / 正文行高 1.6；应用与预览页的卡片内边距全部改引用 `space.card` |
| D9 | 卡片边缘发虚（不是错觉） | rc.9 把卡片边线降到 neutral.100，而页面底色正好也是 neutral.100——外框与底色零对比，边缘只剩 6% 的阴影 | token + 桥接 | 删除 `border.subtle`，外框回到 `border.default`；软阴影保留。规则：外框颜色必须与页面底色可区分 |
| D10 | 所有描边设为 0.6px | 发丝线是 Retina 时代中后台的常见处理；风险只在 1x 屏——浏览器会把 <1px 边线取整为 1px，所以不会消失，只是 Mac 上更细 | token + 桥接 | `border.width.thin` → 0.6；Element 的 `--el-border-width`、输入框 inset 线、卡片边线、标签页 2px 底线、描述列表表格线统一接变量；聚焦线保留 1px |
| D11 | 日期范围选择器的描边没跟着变发丝线 | Element 用 `.el-date-editor.el-input__wrapper`（两个类）画这条边线，特异性高于我覆写的 `.el-input__wrapper`（一个类），覆写没生效；出错态的选择器更是四个类 | 桥接 | 输入类边线按五种状态统一接管，`!important` 压过 Element 全部特异性；一次性把级联、输入数字、标签输入也纳入 |
| D12 | 状态改为浅色胶囊 + 文字，去掉圆点 | 圆点 + 纯文字在表格里存在感弱，和旁边的链接、数字混在一起；胶囊有底色，一眼能扫出状态列 | 页面 + 规范 | `.status` 与 `.badge` 合并为同一种胶囊；预览页压力表格的圆点列同步改胶囊；DESIGN.md、PRD 更新；圆点保留给时间线节点 |
| D13 | 黄色的延伸色在视觉里很脏，去掉所有主色延伸色，用无色系替代 | 进度条的 brand.600、筹码的 brand.100、深金文字都属于此。饱和黄一旦变浅就成奶油色、一旦变深就成芥末 / 橄榄——这是黄色的物理属性，之前用色相偏移只能缓解。正确做法是不做延伸：黄只以纯色出现，层次全部交给灰与黑 | token（删 12 个 primitive）+ 桥接 + 页面 | 见 CHANGELOG rc.13；顺序色改为灰阶 + 纯黄封顶并用离散分段，避免灰 → 黄插值出橄榄色；two-tone 插图定型为黑描边 + 纯黄填充 |
| D14 | 「实时」「规范」等徽标变成 56px 高的突兀胶囊块 | 不是设计问题，是类名冲突：布局的品牌区用了 `.brand`（高 56、大字、粗体），徽标语气类 `.badge.brand` 同时命中这条规则。rc.13 把品牌徽标改成纯黄底后，这个一直存在的冲突才变得显眼 | 页面 | 布局品牌区改名 `.app-brand`；顺带修正语义：「实时」是数据状态 → success 胶囊，公告分类标签 → neutral，纯黄品牌徽标只留给管理员角色这类真正需要品牌强调的地方 |
| D15 | 顶栏消息气泡不合理 | `el-badge` 的 `is-fixed` 把计数挂在包裹元素的右上角外侧：按钮 34px、顶栏 56px，气泡顶到了顶栏边缘，18px 的红块又比图标本身还抢眼 | 页面 | 弃用 `el-badge`，自写 16px 未读胶囊，挂在铃铛右上角略微出头（translate 25% / -15%），红色保留（国内通知计数心智），点击直达通知中心。DESIGN.md 配方表"通知铃铛"一行待补 |
| D16 | 数据看板的指标卡、图表卡上下粘连（横向有 20px 间距，纵向 0） | 板块间距挂错了容器：`gap` 写在 `.el-tabs__content` 上，但它的直接子元素是 `.el-tab-pane`，板块是 pane 的子元素，gap 落不到板块之间 | 页面 | 把 flex + gap 挂到 `.el-tab-pane` 上；纵横间距同为 `space.stack` |
| D17 | 并入公司调色板（状态色 / 图表色 / 危险按钮），品牌黄不动 | 调色板给的四个亮色 text 值在各自浅底上只有 3.0–3.9:1，直接照抄会让 12px 状态胶囊、KPI 涨跌数字退到 AA 以下；default 值白字只有 2.0–3.1:1，不能做危险按钮填充 | token（22 个色彩 primitive 换值 / 改名）+ 预览 D / E | 见 CHANGELOG rc.14：default / bg 照收，亮色文字色同色相压深一档到 4.7–4.8:1，暗色文字用 default；info 由蓝改青，图表第 2–4 序列换成蓝 / 青 / 紫。实测三页亮暗各一张，胶囊、涨跌、折线、饼图都换色，无需改页面 |
| D18 | `text.muted` 在浅灰底上 4.4:1（表格选中行副行、骑手卡 meta、预览 caption） | 对比度只按白底算过；neutral.100 是页面底与选中行底，muted 文字大量落在上面 | token | `neutral.500` 压深到 #736D68（neutral.100 上 4.7、白底 5.1）；DESIGN 写明"对比度要连底色一起算" |
| D19 | 暗色下"已取消"红字在选中行上 4.06:1 | dark 的状态浅底是 14% 半透明 wash，落在选中行（graphite.700）上随底色变浅 | token | 四个 wash 改为在 graphite.850 上预混的实色，新增 `neutral.wash-dark`；文字对比恒定 4.9–6.7 |
| D20 | 下拉"取消订单"、预览菜单危险项暗色下 3.04:1 | 页面把填充色 `action.danger` 当文字色；配方表也是这么写的 | token + 配方 | 新增 `color.text.danger`（亮 red.700 / 暗 red.500）；配方表下拉菜单一行改掉 |
| D21 | 通知计数白字压 red.500 只有 3.05:1 | 用了会随主题变浅的 `status.error` | 配方 + 页面 | 底色改 `action.danger`（亮暗深红），5.2:1 |
| D22 | 键盘焦点：复选框 / 开关 / 分页 / 单选组的焦点环是黄色（白底 1.5:1），菜单项 / 标签页 / 下拉项 outline:none，自写 iconbtn / 链接无焦点样式 | 桥接只覆写了 el-button 与输入框的焦点；Element 自带焦点环用主色画 | 桥接 | 全局 `:focus-visible` 兜底 + 逐组件覆盖，近黑实线 |
| D23 | DESIGN 写了"减少动态效果时所有时长视为 0"，但没有任何实现 | 约定没有落地点：token 构建产物不带 media query | 桥接 | 两份桥接各加 `@media (prefers-reduced-motion: reduce)`，duration 归零 |
| D24 | 筛选栏"全部状态 / 全部城市"是占位符（2.5:1），且是该字段唯一的标签 | 违反 DESIGN 自己的规则 | 配方 + 页面 | 「全部…」改为真实选项（值 all）用正文色显示；搜索框补 aria-label |
| D25 | 表格加载态是通用段落骨架，加载完跳版 | 没有表格形状的骨架配方 | 配方 + 页面 | 新增 `TableSkeleton`（表头 + 等高行 + 目标列宽）；配方表写明"骨架按目标形状" |
| D26 | 已取消订单的步骤条仍亮着黄色"商户接单 · 进行中" | 步骤条配方没有流程中止态 | 配方 + 页面 | `process-status="error"`、当前步标题改"已取消"，后续步骤保持待办灰 |
| D27 | 折线图面积填充是实色灰块，暗色下压掉网格线 | 用了 `sequential.1` 实色 | token + 页面 | 新增 `chart.area` = `neutral.wash` 半透明 |
| D28 | 403 / 404 / 500 内容贴顶，下方 85% 空白，无插图 | 结果页配方只写了字号，没写布局 | 配方 + 页面 | 内容区垂直居中，two-tone 插图（Lock / FileSearch / ErrorComputer）；三页共用 app.css 的 `.result` |
| D29 | 1366px 下筛选栏"查询 / 重置"单独掉到第二行最左；侧栏没有按 PRD 在 ≤1440 折叠 | 筛选栏是一维 flex-wrap；折叠没实现 | 配方 + 页面 | 筛选栏分 `.conds` / `.acts` 两组，动作区 margin-left:auto 整体换行；store 初始 `collapsed` 读 matchMedia |
| D30 | 密度切换按钮无可访问名称（Tooltip 不算）；工作台 / 通知的箭头链接只有图标 | 图标类控件没有命名规则 | 规则 + 页面 | DESIGN 加规则；补 aria-label / aria-pressed |
| D31 | 关闭 ×、el-tag 关闭、表格操作链接命中区 < 24px | 没有最小命中区 token | token + 桥接 + 页面 | 新增 `control.hit-min` 24px；桥接给 tag 关闭 / 输入清除外扩；`td .link`、`.tip-x`、`.go` 撑到 24 |
| D32 | 派单弹窗选项卡只有内容宽、居中漂着 | Element radio-group 默认 `align-items: center`，纵向排列时把子项挤成内容宽 | 配方 + 页面 | `.orders` 改 `align-items: stretch`；配方表新增「选项卡片」一行注明这个坑 |
| D33 | 结算表退款列逐行红字、合计行黑字；"确认新密码"没有必填星号；改派抽屉文案"6 位空闲骑手"里 3 位忙碌 | 页面细节 | 页面 | 退款列改普通数字（退款不是涨跌语义）；补 required 规则；改文案 |
| D62 | 侧栏宽度浪费、折叠图标不居中（用户反馈） | 200px 侧栏对 3～5 字标签过宽；折叠触发层 12px 内边距把 20px 图标挤偏 2px，且 IconPark 字号未随 .el-icon 升档 | token + 桥接 | 1.3.0：`size.sidebar` 168；触发层内边距清零居中、图标继承 lg |
| D61 | 主序列 3px 黄线在浅色下突兀（用户规则） | 折线按序列加粗 | 桥接配方 | 1.2.2：所有序列统一 2px |
| D60 | 1.2.0 曲线"不够丝滑、偏硬"（用户反馈） | 平滑 0.3 在数据点处留折角 | 桥接主题 | 1.2.1：平滑 0.5 + smoothMonotone x + 圆头 |
| D59 | 工作台订单趋势图"很奇怪"（用户反馈） | y 轴强制从 0、面积铺到 0 盖住对比序列、平滑 0.5 造起伏；两个图表组件各自取色 | 桥接 + 配方 | 1.2.0：新增 `bridge/echarts.js` 主题与 `trendLine` / `areaGradient` 配方，DESIGN 折线规则；组件改用桥接 |
| D58 | 验收工具进仓库后首跑 | Tab 遍历到可滚动容器时露出 Chrome 默认蓝环；焦点探针漏检自身 box-shadow（textarea 误报） | 桥接 + 工具 | 1.1.4：`.el-scrollbar__wrap` / textarea 焦点环近黑；探针补自身阴影检测 |
| D57 | 盲测二：表单 / 详情类（三步入驻申请） | 硬规则守住、扫描零违规；8 处猜测集中在页面骨架（页头归属、表单两列网格、帮助文字、结果页成功态、标签字数、必填项占位符）；步骤条 `is-success` 标题绿字 | 文档 + 桥接 | 1.1.3：新增「页面骨架」配方节；桥接补 `is-success`；盲测页保留为第 17 个页面 |
| D56 | 盲测：无上下文 Agent 只凭 AGENTS.md + DESIGN.md 做「退款审核」页 | 硬规则全部守住（build / guard / 扫描零违规），但 8 处配方缺口靠猜：操作列形态、筛选栏标签与查询按钮、批量条、时间线未发生节点、抽屉小标题、骨架行高、分页"唯一黄色"措辞、列宽 token；并发现按钮小号实测 24 ≠ `control.height.sm` 28——顺藤摸出 Element 写死了 11 类组件高度，compact 主题对它们从未生效 | 文档 + 桥接 | 1.1.2：缺口全部写成规则并加「先读这里」速查；控件高度全部接回 token；退款页对齐配方后保留为第 16 个页面 |
| D55 | 全组件走查（`#/kitchen`，Element 2.14 全部组件 × 三模式 × 强制 hover / focus） | 首轮 27 组状态问题（默认链接 hover 黄字 1.5:1、危险链接 hover 漏出 Element 浅红 2.1:1、38 处主色 focus-visible、标签关闭 hover 黄底…）+ 60 组静息黄色（级联 / 分段 / 日历 / check-tag / 徽标 / Text / Link / 上传 / 加载文字用黄表达选中或强调）+ 4 种外来颜色（进度环 #20a0ff、空状态插图灰）+ 无障碍扫描抓到 `el-badge` 红底黑字、头像暗色 2.5:1、加载遮罩误接弹窗遮罩、穿梭框按钮无名称 | 桥接 + token（`bg.mask`）+ 配方 | 1.1.0：终轮三模式全部为 0；静息黄只剩规则允许的六类。走查页与扫描进入验收基线 |
| D54 | rc.33 全量回归验收（例外白名单化后） | 93 个页面状态：0 未批准低对比、0 无名称、0 溢出/截断/重复 id，233 处命中均为已批准例外（三对状态色、危险按钮白字、占位符）；69 个小命中区全是句中链接或已伪元素外扩的图标；E/S 静态像素零差异；17 类可聚焦元素焦点环齐全；1366 折叠无溢出 | 验收 | 通过。验收基线与例外清单已写进 DESIGN「验收基线」 |
| D53 | 卡片阴影被 tabs 容器裁掉，且扩散不够柔和（用户反馈） | `.el-tabs__content` overflow:hidden 裁掉贴边卡片的阴影（D16 时量到过该属性但只修了间距）；card 层 2/8 偏硬 | token + 桥接 | rc.33：shadow.y.1/blur.1 → 4/16；桥接放开 tabs content 的 overflow |
| D52 | 日期面板：选中日黄圆底白字、「今天」与 hover 黄字（用户规则重申） | rc.22 的变量接管写在 :root，被 Element 组件级（.el-date-picker）同名变量声明压掉，从未生效；today 黄字是写死属性 | 桥接 + 配方 | rc.32：变量降到 .el-picker-panel 同级覆盖 + today 属性级覆盖；教训「组件级变量必须同级覆盖」写进桥接注释与配方表 |
| D51 | 分段选择器默认态文字过重（用户反馈） | rc.16 归入标签类 500；未选项是普通选项不该比正文重，选中项反转块 + 600 双重强调 | 桥接 + 配方 + 预览 | rc.31：默认 400、选中 500（medium），与侧栏 rc.20 同一条"反转块组件"规则；标签页不变（下划线选中，非反转块） |
| D50 | 状态胶囊字重过重（用户反馈） | rc.16 把胶囊归入标签类 500；12px 小字 + 浅底 + 500 三重强调显闷 | 配方 + 桥接 + 页面 + 预览 | rc.30：徽标 / 胶囊 / el-tag 回 400，浅底负责识别；DESIGN 标签类清单同步 |
| D49 | 暗色状态色偏亮（用户反馈：浅色系没问题，深色系上有点亮） | 亮色的鲜亮品牌值直接做暗色文字，在深底上 6.6–8.7:1，荧光感 | token + 预览 | rc.29：四个 500 按 OKLCH 降明度压到 5.5–5.6:1，wash 重算；亮色不动 |
| D48 | error 换更亮的红（用户逐值指定 #FFE2E3 / #EE484B） | 品牌观感优先；危险按钮白字 3.7:1；800 / 900 按推导规则从新 700 重推，避免 hover 突跳 | token + 预览 | rc.28：red.50 / 700 / 800 / 900 换值，暗色不动；例外与回补（≈#D6203B）记录在 token 描述 |
| D47 | warning 换更亮的橙（用户逐值指定 #FFF1D8 / #D76712） | 品牌观感优先；新配对 3.2:1 低于 AA，与品牌黄的区分从明度转为色相 | token + 预览 | rc.27：orange.50 / 700 换值，暗色不动；例外与回补路径（≈#A8500D）记录在 token 描述 |
| D46 | success 换更鲜亮的绿（用户逐值指定 #DAF5E8 / #0B9E74） | 品牌观感优先；新配对 3.0:1 低于 AA，记录为例外 | token + 预览 | rc.26：green.50 / 700 换值，暗色不动；token 描述与 README 写明例外与回补路径（≈#067A59） |
| D45 | KPI 数字太小、没有重点感（用户反馈） | display 26px / 600 / 正文行高 1.6：数字上下浮空，与 20px 标题差距不够 | token + 页面 | rc.25：display 升 32 / 700 / 紧行高 1.25（新增 display.line-height / .weight 两个 token）；四处 `.stat .value` 与预览同步 |
| D44 | 数据色卡禁止大面积黄色，高亮改左描边点缀（用户决定） | 黄底统计卡是整页最大的色块，抢过主按钮；且黄底上涨跌被迫用近黑、丢了红绿语义 | 配方 + 页面 + 预览 | rc.24：`.stat.hi` = 白卡 + `brand.indicator` 左描边；涨跌恢复 data.increase/decrease；「大面积黄只剩登录页品牌面」自此无例外 |
| D43 | 筛选栏「重置」裸文字当按钮；用户规则「按钮类内容至少要浅色底或描边」 | is-text 按钮静息完全透明，与旁边白底描边按钮并排时看不出可点 | token + 桥接 + 配方 + 预览 | rc.23：新增 `action.quiet / quiet-hover`，is-text / .btn-ghost 接管；配方表新增「文字按钮（quiet）」一行 |
| D42 | MessageBox 关闭按钮 hover 变黄；用户升级为全局规则「hover 一律不用品牌黄」 | Element 20+ 处 hover / focus 直接取主色变量，我们的主色是黄 | 规则 + 桥接 | rc.22：穷举接管全部 hover 主色规则 → text.primary / border.focus；分页、日期面板走变量；日期选中色顺带接到 action.selected；DESIGN 交互节 + Do/Don't 各加一条 |
| D41 | MessageBox 确认按钮（primary + danger 双类）hover 黑字红底 | 桥接 danger 块没定义 hover / active 文字色，层叠回落到 primary 块的近黑（黄底用） | 桥接 | rc.21：danger 块按状态穷举补齐三个文字色变量；与 D11「覆写按状态穷举」同源教训 |
| D40 | 侧栏字重显重，降一档（用户决定） | rc.16 把菜单项归入标签类 500；整列竖排导航里 500 偏重，选中项反转底 + 600 双重强调过头 | 配方 + 桥接 + 预览 | rc.20：菜单项 400、选中 500（medium）；DESIGN 标签类清单移除菜单项并在侧栏配方写明 |
| D39 | 无色系从暖灰整体转冷（用户决定，审美：暖灰显黄、显脏） | 暖灰是「黄的淡色落在冷灰上变橄榄」时代的选择；延伸色删掉后顾虑不再成立 | token（22 个色彩 primitive 换值）+ 预览 | rc.19：neutral → gray 族（500 压深 #666D7B），graphite 保明度校色相，success → emerald、error → rose（暗色档 rose-400），公司调色板降为色相参考；先出 31 页 × 亮暗 × 3 变体样张拍板再改种子；预览删 A / B / C |
| D38 | 分段选择器要做成「完整外胶囊 + 选中内胶囊」（用户决定） | 原配方是 Element 默认的边线拼接方块，与全站的胶囊语言（状态胶囊、筹码、分页）不一致 | token + 桥接 + 配方 + 预览 | rc.18：新增 `control.segmented-inset`，桥接重写 radio-button 组；stress.css `.seg` 同步 |
| D37 | 侧栏收起后选中块是 24px 宽的竖条、整体偏左，黄色指示条骑在块边上 | Element 用「图标宽 + 两侧 padding」推算折叠宽度，桥接把这两个变量改小了（16 / 12），折叠菜单只有 40px 宽，64px 的侧栏里再减 8px 边距只剩 24px | 桥接 | 折叠宽度显式取 `layout.sidebar.collapsed-width`，项 40 × 40 居中，指示条贴外沿；配方表补充「Element 的折叠宽度必须显式覆盖」 |
| D36 | 很多字太细，观感不佳（Mac） | 两个叠加原因：`html` 上的 `-webkit-font-smoothing: antialiased` 去掉了字形加粗补偿，全站中文削细一档；标签类文字（按钮、表头、徽标、表单标签、菜单）用 400。另外发现按钮一直在用浏览器默认的 Arial（Element 没覆盖 button 的 font-family） | token + 桥接 + 页面 | 见 CHANGELOG rc.16：`text.weight.label` → 500（新增 `font.weight.medium`）；桥接加文字渲染基线（smoothing auto、表单控件继承字体）；app.css / 预览 admin.css 删掉 antialiased |
| D35 | 侧栏折叠后 9 个菜单项没有可访问名称；「重置」这类文字型按钮的焦点环是暖灰 | Element 的 `el-menu-item` 不透传 attrs，折叠时标题不渲染；`.el-button.is-text:focus-visible` 特异性高于桥接的通用规则，且 `--el-button-outline-color` 来自被我们映射成暖灰的 primary-light-5 | 桥接 + 页面 | 桥接把 `--el-button-outline-color` 接到 `border.focus` 并覆盖 is-text / is-link；页面用 `v-aria-label` 指令写到菜单项根元素，配方表折叠侧栏一行注明 |
| D34 | 成员表禁用开关渲染成奶油黄 | `opacity.disabled` 作用在纯黄上的必然结果 | 规则 | 不改：DESIGN 写明禁用态的淡黄是透明度结果、允许，不为禁用态另造灰 |

顺带修掉一个只有真实交互才暴露的问题：`el-table` 选中行底色依赖页面用 `row-class-name` 维护，选中状态变化时表格不重绘，行底色会滞后一帧。桥接改用 `tr:has(.el-checkbox.is-checked)` 直接读勾选框状态，页面不用再管。

## E. 第二轮（P1 四页 + 异常页，2026-09-08 22:50）

新增：数据看板（四种 ECharts 图表 + 财务结算表）、骑手调度（状态卡 + 表格 + 派单小弹窗 + 强制下线确认）、通知中心 + 公告详情（三类通知、未读、长文排版）、个人中心（头像、只读账号、通知偏好开关、密码强度条）、500 结果页。共 11 页、23 种状态 × 3 模式 = 90 张截图。`status` 仍为 unified 100%。

| # | 发现 | 判断 | 处理层 | 处理 |
| --- | --- | --- | --- | --- |
| E1 | ECharts 不读 CSS 变量，四种图表如何吃 token | 渲染前从 `:root` 读 token 计算值注入 option，主题 / 密度切换时重绘；分类色接 `chart.1–6`，排行条与热力接 `chart.sequential.1–5`，坐标轴 / 图例 / tooltip 接文字与边线 token。四种图表都成立，不需要新 token | 页面（通用 `EChart.vue`） | 一个 option 工厂 + 一个 token 读取器，页面只写数据 |
| E2 | 图表高度是否随密度变化（第一轮遗留） | 应该随：高度写成 `calc(var(--control-height-md) * 7)`，紧凑模式下控件高度 34 → 28，图表自动从 238 变 196，不需要专门的 token，也不写死像素 | 页面（`.chart` 类） | 通用规则进 `app.css`，第一轮遗留问题关闭 |
| E3 | 热力图的顺序色阶用 brand.100 → 900 从"浅黄"到"深金"，单色相热力图可读；饼图六个品类用分类色 1–6，黄色领衔 | 与 rc.2 的图表调色板设计一致，没有出现 warning 橙 / error 红混入图表的情况 | — | 验证通过 |
| E4 | "取消率下降"这类"下降是好事"的指标，涨跌色不能只看箭头方向 | 箭头方向与颜色是两个维度：`up` 决定箭头，`positive` 决定绿红 | 页面 + 规范 | 看板统计卡拆成两个字段；DESIGN.md 涨跌一节待补一句 |
| E5 | 长文页（公告）验证 `text.paragraph.line-height` 1.7、标题层级、有序列表、表格、引用块 | 引用块用品牌色指示条 + `bg.selected-subtle` 底，是黄色在长文里唯一的出现，克制且有辨识度 | — | 验证通过 |
| E6 | 通知列表的未读圆点、骑手状态卡的指示灯 | 与 D12 的"圆点只留给指示灯语义"一致：未读点用 `action.primary-active`，骑手在线 / 忙碌 / 离线用状态色 | — | 符合规范 |
| E7 | 密码强度条 | 4 段用 `status.error / warning / success` 表达弱 → 强，轨道用 `bg.selected`；是状态色在非状态组件上的合理借用 | 页面 | 无需新 token |
| E8 | skill 观察：`status` / `migrate` 只扫 .css/.scss 里的尺寸字面量，`.vue` 的 `<style>` 里 `8px`、`4px` 这类几何值没有被计入 | 采用率 100% 有一部分是"没看见"而不是"没有"。对 Vue 项目这是覆盖盲区，推给同事前值得修 | skill（不动） | 记录 |

## 尚未验证（留到第二轮或需要真机）

- Windows 1x 屏上的描边 3 与字重三档（需要真机）。
- 打印样式只写了规则，没有出过 PDF 对照。
- （第二轮已关闭：四种图表均可用 token 注入；图表高度用 `control.height.md × 7` 表达，随密度变化。）

## 给种子的回流

- `bridge/element-plus.css`（新）—— 本轮最大产出。
- `bridge/iconpark.config.ts` Vue 用法修正。
- DESIGN.md 待补两条：组件库内置图标的混用规则；表单标签字数上限。
