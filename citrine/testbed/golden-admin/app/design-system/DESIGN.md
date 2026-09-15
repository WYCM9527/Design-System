# 设计系统

> 本文件记录设计意图与使用规则。对已确认纳管的设计决定，具体视觉数值的唯一来源是 `tokens/*.tokens.json`；不要在这里重复色值、尺寸或阴影参数。未迁移的旧规范仅作为审计证据，不与 Token 双重维护。

## 先读这里（编码 Agent 速查）

做页面时只需要这一屏 + 下面的「组件配方」表；其余章节是规则的理由，遇到配方没覆盖的情况再读。

1. 黄只做主操作面：主按钮、进行中的进度 / 滑杆填充、勾选 / 开关选中、当前步骤、分页当前页、品牌 logo、数据卡左描边。**选中、当前、强调一律用深黑反转块或近黑文字**，不用黄——头像、角色 / 置顶徽标、已结束的进度条都不是黄。
2. 黄底深字、白底无黄字、任何 hover / focus 不出现黄。
3. 状态色只做"文字 + 同色浅底"胶囊；实底按钮只有主（黄）与危险（红底白字）；`type=success / warning / info` 按钮不用。
4. 按钮不能裸放：有描边（次要）或浅底（quiet 文字按钮）。链接分四层：内容型（订单号、名称：下划线 + 斜体）、操作型（编辑 / 详情 / 改派等动词：同色胶囊描边，行内胶囊档 `control.height.xs` 高、`text.body-sm` 字号、400 字重——与状态胶囊同一轻重，不斜体、hover 底色、危险红字红边）、导览型（查看全部 / 查看列表：文字 + 右箭头图标，不描边）、标题型（列表项标题：近黑 + 500）。表格操作列默认操作胶囊，审批类决定才用 quiet 按钮。
5. 筛选栏：控件不带可见标签（靠 `aria-label`），下拉默认值是真实选项「全部…」（值不能是空串——Element 把空串当未选、显示灰占位符；用 `'all'` 哨兵再在查询时映射为不过滤），关键词框占位符描述可搜字段；动作区「查询」主按钮 +「重置」quiet，折行时整体换到下一行右对齐。
6. 尺寸只从 token 拿：控件高 `control.height.*`，间距 `space.* / spacing.*`，圆角按容器层级递减，字号 8 档阶梯；**列宽与筛选控件宽度不是 token**（按内容定，关键词框用 `layout.search-width`）。页面骨架（页头 / 列表 / 表单 / 分步 / 详情 / 结果 / 左右分栏 / 设置）见「页面骨架」一节，**它们的可复制实现在 `bridge/recipes.css`（公共类）与 `bridge/vue/`（统计卡、图表、骨架、确认弹窗），项目只写业务页面，不重写这些结构**。
7. 字重：正文与胶囊 400，按钮 / 表头 / 标签 500，反转块选中 500，数据大字 700。
8. 禁用 = `opacity.disabled`；只读 = `bg.readonly` 的**不可聚焦文本块**（`.ro`），不是 readonly 输入框（会进 Tab 序列却不可改）；加载 = 骨架屏或转圈，不用禁用态假装。
9. 图标类控件必须有 `aria-label`、命中区 ≥ 24px；所有颜色和尺寸都必须能在 `dist/tokens.css` 里找到名字。
10. 改完跑 `guard`（构建与登记一致）和 `status`（页面字面量清零，`migrate --phase settle` 无待决项）；新页面登记进项目的 `accept.config.mjs` 后跑 `npm run accept`。

## 视觉语言

- 品牌是一个高饱和的正黄（`color.brand.500`），中后台里它只做「唯一焦点」：主按钮、进度 / 强度、指示条（含数据卡的左描边点缀）。**黄色表达"主操作"，不表达"选中"**：分段选择器、视图 / 状态切换、侧栏当前项这类选中态一律用深黑反转块（`color.action.selected` + `color.text.on-selected`），黄色最多留给旁边的指示条。页面 90% 以上面积保持冷灰白中性色，黄色出现的地方就是该被注意的地方。
- 黄底永远深字。品牌黄上白字对比度只有约 1.5:1，`color.text.on-primary` 固定为近黑；任何在黄色上放浅色文字的写法都不合规。
- 品牌黄只有一个值 `brand.500`，**没有延伸色**：不做浅调（奶油黄）、不做深金、不做半透明洗色——实测发现它们在界面里显脏。需要层次时用无色系：冷灰（`neutral.*`）做底与分隔，近黑（`neutral.900`，#111827 带一丝深蓝）做选中块、焦点边线、品牌插图的描边。白底上没有任何黄色文字：黄字白底 1.5:1 不可读，品牌强调靠「黑 + 纯黄」的对比而不是金色文字。
- 链接不用色相（品牌决定），分四层：**内容型链接**——正文、表格单元格里指向另一处内容的文字（订单号、商户名、活动名、公告正文里的链接），`color.text.link` 中性深灰 + 常态下划线（`text.link.decoration`）+ 斜体（`text.link.style`），hover 加深到 `text.link-hover`；**操作链接**——动词（编辑 / 复制 / 详情 / 改派 / 催单 / 取消选择 / 忘记密码），出现在操作列、卡片页脚、提示条、批量条里，形态是**同色胶囊描边**：`text.link`、`text.body-sm` 字号（13）、400 字重（描边已经给出"可点"的信号，再加粗就重了；与同一行的状态胶囊同一轻重），文字与描边同色（currentColor）、发丝线、`radius.full`、高 `control.height.xs`（24，与状态胶囊同高——比按钮最小档 sm 还低一档，才不会和按钮抢重量）、左右内边距 `spacing.2`、无填充，**不斜体不下划线**，hover 换 `bg.hover` 底色；危险动作 `text.danger` 红字红边，hover `status.error-bg`；相邻胶囊间距 `space.inline`，不用「·」分隔——把动词排成斜体下划线像被强调的正文，是错的；与按钮的区别是不填充、描边是发丝线而不是 `border.strong`；**导览链接**——「查看全部」「查看列表」这类"去另一处看"的入口，不是动作也不是内容：`text.link` + 500，**文字 + 右箭头图标**（`icon.size.sm`）引导，不描边不斜体，hover 箭头右移 `spacing.0-5`；只有图标的版本（列表项右侧的 ›）用 `icon.muted`；**标题型链接**——列表项标题（待办、公告）本身可点，`text.primary` + 500，hover 出下划线。导航、标签页、分页、菜单是组件型链接，各有自己的颜色规则。注意中文字体没有真斜体，浏览器合成的假斜体在雅黑上可读性略降，所以链接文字宜短；**等宽数字型链接（订单号、单号）不斜体**，只保留下划线——数字斜体显歪。危险动作的内容型链接用 `text.danger` 红字（白底上），与普通链接分开。
- 亲和感与层次感来自灰、黑、黄三者的配比：黄只以纯色小面积出现（主按钮、进度填充、指示条、品牌徽标、two-tone 插图的填充），灰承担 90% 的面积与所有中间层次，黑承担选中与强调。hover / active 不换黄色的深浅（延伸色显脏），用边线变黑、内阴影表达。
- 中性色是冷灰（gray 族），暗色深底与它同族。冷灰让品牌黄与深蓝近黑形成互补对比，黄更跳；暖灰会让整个界面显黄、显脏（「黄的淡色落在冷灰上变橄榄」的顾虑只在黄有延伸色时成立，本系统没有延伸色）。弱化文字（`color.text.muted`）最浅只到 neutral.500（白底 5.2:1、页面底上 4.7:1）；neutral.400 只允许出现在输入框占位符（`color.text.placeholder`）上，且占位符永远不能是字段唯一的标签——有可见标签的字段（含必填项）可以用占位符给格式或示例提示。
- 状态色与图表色以公司调色板为**色相参考**（Success Green / Warning Orange / Danger Red / Info Cyan / Purple / Primary Blue），让多条产品线的状态语义看起来是一家的；具体值按对比度与冷暖调校，公司原值保留在 token 描述里。本系统主色是黄，所以调色板里的 Primary Blue 只做图表分类色，链接、焦点、选中态一律无色系。warning 是橙不是黄，与品牌黄靠色相区分——「主操作」和「警告」必须一眼分开；info 是青不是蓝。
- 暗色是黄色的主场：dark Theme 只覆写背景、文字、边线层，品牌黄一个字节不动，对比度反而更高。
- 字体使用系统无衬线字体栈（`font.family.body`），Windows 上中文由微软雅黑显式承担；根字号取中后台主流的 14px；订单号、ID、金额这类需要对齐的内容用 `font.family.code`。字号是一条 8 档离散阶梯（`text.caption` 12px … `text.display` / `text.hero` 32px；display 是数据数字——tabular + 紧行高 1.25 + 700，hero 是结果页大字），**中文不低于 12px**，不在阶梯之外取值。
- 字重四档：正文 400、标签 500（`text.weight.label`）、强调 600、品牌 700。归属：正文、表格单元格、输入值、徽标 / 状态胶囊 / 标签（浅色底已提供识别，12px 小字再加字重显闷）用 400；按钮、表头、表单标签、标签页默认项、描述列表标签、面包屑用 500；**反转块组件（侧栏菜单项、分段选择器）默认 400、选中 500**——深黑反转块本身已是强调，不再叠 600；数据大字 700（`text.display.weight`）。雅黑没有 500 字形会退回常规，但 ClearType 渲染的雅黑本来就比 Mac 的 400 显得重，500 让两端观感更接近而不是更远；600 在雅黑上渲染成粗体，与 700 无差别，强调不能只靠字重，要配合颜色或字号。
- 文字渲染两条硬规则：**不要 `-webkit-font-smoothing: antialiased`**（Tailwind 的 `antialiased` 同理）——Mac 上它去掉字形的加粗补偿，把中文削细一档，是"字太细"的第一原因；表单控件（button / input / select / textarea）必须 `font-family: inherit`——浏览器默认给它们的是 Arial，按钮里的数字会和正文不一样。两条都已写进桥接。
- 中文不加字距、没有大小写：`text.tracking.caps` 只用于全大写西文缩写（如 GMV），侧栏分组标题这类中文小字不套用。金额、订单号、时间等数字列用 `text.numeric.variant`（等宽数字）对齐；成段说明文字用 `text.paragraph.line-height`。
- 大面积品牌黄只允许出现一次：登录页品牌区 / 欢迎横幅（`color.bg.brand` + `color.text.on-brand`）。进入工作区后黄色回到「唯一焦点」用法。白底上的黄色文字只有一个合法角色 `color.text.brand`，且仅限 ≥ 20px 的大字（结果页的 403 / 404、统计强调）。

## 设计原则

- 优先复用已批准的 Semantic token。
- 需要新值时先提出 token 提案，不在组件里临时硬编码。
- Component token 只用于经确认的组件例外。

## Token 使用规则

- Primitive token 表示值本身。
- Semantic token 表示用途。
- `dist/tokens.css` 是生成物，禁止手改。

## 局部规范／生效范围

- Core 规范默认作用于整个项目；局部差异必须登记在 `scope-map.json`，不能靠零散选择器或目录名称猜测。
- Scope 只记录相对父级的差异；页面需要完整的 `data-ds-scope` 继承链才会消费对应的运行时 CSS。
- Theme、单个组件例外和未登记硬编码分别按 Theme、Component Token、Drift 管理，不把它们误建成 Scope。

### 只覆盖部分板块：范围根（与 Scope 相反的方向）

Scope 是「Core 全局生效、某些页面有差异」；**范围根**是「Core 只在某些板块生效、其余板块一个字节不受影响」——同一应用里新旧板块并存时用。做法：把 token + 桥接 + 配方整套包进 `@scope (html.<root>)`（`design-system-adopter` 的 `ds.mjs scope` 生成，根选择器 `:root` / `html` 自动改写为 `:scope`），路由守卫按板块给 `<html>` 加减类。

- **挂在 `html` 上、按路由切换**，不用容器级作用域：Element / Radix 的弹窗、下拉、消息都 teleport 到 `body`，容器罩不住它们，`html` 之下都在范围内。因此板块必须**按路由分开**；同一屏新旧组件混排不支持。
- 首屏 `<html class="<root>">` 默认带类（多数路由覆盖时），未接入板块的路由在 `beforeEach` 里移除；未接入板块保留自己的旧布局与组件库默认外观。
- 生成物只读（`scope.manifest.json` 记账），token / 桥接变化后 `build-tokens → ds.mjs scope` 再生成；生成物含字面量，在 `exemptions.json` 登记。验收清单只登记覆盖板块的页面。
- 浏览器下限：`@scope` 需 Chrome / Edge 118+、Safari 17.4+、Firefox 128+。
- **这是过渡态**：让新板块先立住，再用「更换现有规范」的二期收编把其他板块逐个纳入，最后摘掉范围根回到全局；不要把它当长期架构。

## Theme

- Core 默认作用于确认的默认 Theme；已有或经确认新增的模式登记在 `theme-map.json`，其相对 Core 的差异位于 `themes/<id>/`。
- Theme 只覆写已批准的 Semantic token 和 Component 例外；不复制 Core，也不手写任意选择器。
- Scope 与 Theme 不自动组合。局部覆写遇到随 Theme 变化的 Semantic 时，先提出提案并等待确认。

## 布局与响应式

- 经典中后台骨架：固定宽度浅色侧栏（`layout.sidebar.width`）+ 顶栏（`layout.topbar.height`）+ 内容区。侧栏与顶栏都是 sticky。层级只有四档：`layer.sticky`（侧栏、顶栏、表格固定表头）、`layer.dropdown`（下拉、Tooltip、Popover）、`layer.modal`（弹窗、抽屉及其遮罩）、`layer.toast`（全局通知，永远在弹窗之上）；不手写 z-index 数字。
- 间距走 4px 基础阶梯（`spacing.*`），其中 6 / 10 / 14 三个半步只用于控件内部与单元格内边距。页面级留白用四个语义间距：`space.gutter`（32）是内容区四周与顶栏左右内边距，`space.stack`（20）是卡片之间的纵向 / 网格间距，`space.card`（24）是卡片、弹窗、抽屉的内边距，`space.inline`（8）是同一行内相邻元素的间距；compact Theme 下四者分别收到 16 / 12 / 16 / 8。
- 圆角五档，按容器层级递减：`radius.xl` 弹窗、抽屉（露出的两角）、登录卡等最外层容器；`radius.lg` 卡片、面板、统计卡；`radius.md` 按钮、输入框、菜单项、下拉浮层、提示条、侧栏选中块；`radius.sm` 标签、分页项、分段选择器内项、骨架条；`radius.xs` 勾选框等 ≤ 16px 的元素；胶囊与圆形一律 `radius.full`。**嵌套规则**：内元素的圆角必须小于外框，相邻嵌套层级至少差一档（弹窗 xl → 内部卡片 lg → 按钮 md → 标签 sm → 勾选框 xs）；同一层级的并列元素用同一档。
- 密度只有舒适一档（品牌决定；2.0.0 起不再提供紧凑 Theme——实测项目里它从未被真正需要，却让每条规则都要多验一种模式）。个别高密度表格用组件的 `size="small"`（控件 sm 档）解决，不做全局密度开关。
- 横向表单（左标签右输入）是国内中后台的默认形态，标签列宽全站统一用 `layout.form.label-width`，不按页面手调；纵向表单只用于筛选区和窄卡片。标签文案不超过 6 个汉字（`layout.form.label-width` 112px 在 13px 字号下容纳 6 个汉字 + 必填星号；无星号可到 7 字），说明性内容放帮助文字，不放标签。描述列表（详情页的键值对）的标签列也用同一个宽度。
- 侧栏宽度 `layout.sidebar.width` 按中文菜单项定：3～5 个汉字的标签加图标只占 100px 左右，宽了色块右侧就是一片空白（200 时用户反馈"宽度浪费"），所以取 168（8px 外边距 + 152px 色块），**侧栏标签不超过 6 个汉字**。折叠后的宽度是 `layout.sidebar.collapsed-width`，折叠态只剩图标，图标必须在 40px 方块里几何居中（Element 折叠时的 tooltip 触发层带 12px 内边距，会把 20px 图标挤偏 2px，桥接已清零）。
- 表格单元格内边距用 `table.cell.padding-y / -x`，页面里不改这两个值。
- 筛选栏分「条件区」和「动作区」两组，折行时动作区整体换到下一行并右对齐，不允许「查询」单独掉到左下角。

### 三端（桌面 / 窄屏 / 手机）

断点两条线，登记在 `layout.breakpoint.narrow`（1366）与 `layout.breakpoint.mobile`（768）：**桌面** > 1366；**窄屏**（小笔记本 / 平板横屏）769–1366；**手机** ≤ 768。JS 用 `matchMedia` 读 token 值；CSS 媒体查询无法引用 var()，`recipes.css` 与桥接里的 `@media (max-width: 1366px / 768px)` 是这两个 token 的**字面镜像**（改 token 必须同步改镜像，migrate 不扫媒体查询）。项目可按 PRD 覆盖窄屏线（如轻采用 1280），手机线不建议覆盖。

| | 桌面 > 1366 | 窄屏 769–1366 | 手机 ≤ 768 |
| --- | --- | --- | --- |
| 侧栏 | 展开（`layout.sidebar.width`） | 默认折叠为图标栏（`.is-collapsed`，项目 JS 按断点初始化，用户可手动展开） | 离屏抽屉：汉堡按钮（`.menu-btn`）唤出，`.is-nav-open` 滑入 + 遮罩（`.sidebar-mask`），选中菜单或点遮罩即收回 |
| 内容区留白 | `space.gutter`（32） | 同桌面 | 收到 `spacing.4`（16），卡片间距 `space.stack` 收到 `spacing.3` |
| 页头 / 筛选栏 | 单行 | 条件区可折行，动作区整体换行右对齐 | 允许整体换行；搜索框全宽，下拉自适应剩余宽度 |
| 统计卡网格 `.stats` | 4 列 | 2 列 | 1 列 |
| 表单 `.form-grid` | 两列（`.span2` 跨两列） | 两列 | 单列；`.form-foot.is-sticky` 贴底全宽 |
| 表格 | 全列 | 全列（列宽按内容定，避免文档级横向溢出） | **保留全部列、表格内部横向滚动**（信息完整优先，不做卡片化改写；文档级不允许横向溢出，表格容器内允许） |
| 弹窗 / 抽屉 | token 尺寸 | 同桌面 | 弹窗全宽贴底（宽 `100vw`、圆角只留顶部）、抽屉全宽；确认弹窗宽度自适应 |
| 分页 | 完整（total, sizes, prev, pager, next） | 完整 | 允许换行；建议项目在手机档收敛 layout（去 sizes / jumper） |
| 命中区 | `control.hit-min`（24） | 同桌面 | 粗指针（`pointer: coarse`）下操作胶囊、图标按钮、条件标签 × 的命中高度提到 `control.hit-touch`（44），视觉字号与描边不变 |

不做的事：不做底部 Tab 导航、不做列表卡片化（真实移动端需求出现时再作为配方提案）；手机端目标是**可用**（能导航、能查表、能填表、浮层不残废），不是移动优先重设计。验收：`citrine-accept narrow` 按项目登记的多档宽度检查——窄屏档侧栏折叠 + 文档无横向溢出，手机档侧栏离屏、汉堡可唤出关闭、文档无横向溢出。

## 组件原则

- 按钮、输入框、搜索框共用同一控件高度（`control.height.md`），小号按钮与分页项用 `control.height.sm`。表单里的对齐靠这条规则成立，不靠逐个手调。
- 图标六档 `icon.size.xs … 2xl`（12 / 14 / 16 / 20 / 24 / 32），默认 `md`；图标规则见下面「图标」一节。头像两档（`avatar.size.sm` 用于 Logo 方块，`avatar.size.md` 用于用户头像）。
- 线宽四档：普通边线 `border.width.default` 是 0.6px 发丝线（卡片外框、表格行分隔、输入框边线、分隔线；Retina 上 1 物理像素，1x 屏上浏览器取整为 1px，不会消失）；小控件边线 `border.width.control` 1.5px，因为发丝线挨着高对比黄色会显得太弱；选中标签页下划线和焦点外框用 `border.width.active` 2px；侧栏选中项左侧的品牌色指示条用 `border.width.indicator` 3px。聚焦态的 1px 实线是有意保留的例外——焦点必须一眼可见。
- 状态色只以「文字色 + 同色系浅底」成对出现（`color.status.*` / `color.status.*-bg`），五种：success / warning / error / info / neutral（草稿、已过期、已停用等无倾向状态用 neutral）。状态的展示形式统一为**浅色胶囊 + 文字**，不带圆点（圆点 + 文字在表格里存在感弱、与链接和数字混在一起）；徽标、提示条、表格状态列、待办列表都用这一对，不再各自调色。亮色文字色的目标是「在浅底上 ≥ 4.5:1」（胶囊是 12px 小字）；success / warning / error 三对是用户拍板的品牌例外，见「验收基线」。各族 500 档只在暗色下当文字、以及做 14% 预混 wash。圆点只保留给时间线节点和骑手在线这类"指示灯"语义。
- 财务涨跌是独立语义：`color.data.increase`（涨，绿）/ `color.data.decrease`（跌，红），公司约定与 A 股「红涨绿跌」相反。页面里只能引用这两个名字，不能直接用 status.success / error 表示涨跌；若公司约定改变，只改这两个别名。箭头方向与颜色是两个维度：取消率、超时率这类"下降是好事"的指标，箭头向下但用 `data.increase` 的绿——颜色表达好坏，箭头表达方向。
- **彩色文字不落在灰底上**：状态色、危险色、涨跌色这些有色文字只出现在白底（`bg.surface` / `bg.elevated`）或同色系浅底上，不放在中性灰的控件底（`action.quiet`、`bg.selected`、`bg.subtle`、分段外壳）上——浅色模式下灰底配彩字显脏，与「黄的淡色落在灰上变橄榄」同理。所以行内危险操作是 error 成对（红字 + `status.error-bg` 浅红底）而不是 quiet 灰底 + 红字；下拉里危险项的 hover 底也是浅红。表格行 hover 的极浅底（`bg.hover`）不在此列。
- hover 不能只靠色相变化：品牌黄 400 与 500 在廉价显示器上几乎不可分，主按钮 hover 同时把边线换成 `action.primary-active`，其他组件 hover 用底色变化（`bg.hover`）而不是文字变色。**任何元素的 hover 状态不允许出现品牌黄**：黄只出现在静息的主操作面上，hover 反馈交给无色系——文字加深到 `text.primary`、边线换 `border.focus`、底色换 `bg.hover`。组件库默认把 hover 指向主色的地方（关闭按钮、标签页、面包屑、分页、日期面板、上传列表等 20+ 处）由桥接逐条接管。
- 状态色是"文字色"，不是"填充色"。危险按钮的填充用 `color.action.danger`（及 -hover / -active），亮暗两个 Theme 都用 `red.700`（hover / active 按「OKLCH 降 L」规则从它推导；白字对比见「验收基线」），白字（`color.text.on-danger`）才读得清；`color.status.error` 在暗色下会变浅，拿它做填充会让白字糊掉。危险按钮也是全站唯一允许白字的实底按钮。
- 输入框、搜索框的边线用 `color.border.input`，比卡片边线 `color.border.default` 实一档；卡片边线不变。
- 危险有两个 token：`color.action.danger` 是填充（按钮底，亮暗都深红），`color.text.danger` 是文字（下拉里的删除项、危险链接、行内警示，暗色下换亮红）。拿填充色当文字色，暗色浮层上不到 AA。
- 筛选栏的下拉不用占位符当默认值：「全部状态」要是一个真实选项（值 `all`），用正文色显示；占位符 `text.placeholder` 只有 2.5:1，只允许出现在有可见标签、且真的可以为空的输入框里。
- 禁用态的淡黄是 `opacity.disabled` 的结果，不是延伸色，允许；不要为禁用态另造一套灰。
- 表格行有四种底：默认（或斑马纹 `bg.subtle`）、`bg.hover`、`bg.selected-subtle`（选中）、`bg.selected-hover`（已选中再被悬停）。选中行用 subtle 而不是 `bg.selected`，是因为多选十行再加批量操作条会变成一面黄墙；`bg.selected` 留给徽标、筹码、批量条、侧栏这类小面积元素。选中状态同时由勾选框表达，不能只靠底色。
- 三种“不可操作”要分清：禁用用 `opacity.disabled`（整个控件变淡）；只读用 `color.bg.readonly` + `text.secondary`（可读可复制，不可改）；加载中用骨架屏 `bg.skeleton / -highlight` 或 `action.primary-active` 的旋转指示器，不用禁用态假装加载。
- 控件三档高度：`control.height.sm` 用于表格内的按钮、筹码、分页；`md` 是默认；`lg` 只用于登录按钮、页面级唯一主操作和触屏场景。另有一档行内胶囊 `control.height.xs`（24）只给操作胶囊与状态胶囊——它不是按钮档，按钮最小到 sm。
- 页面级宽度约束：单列表单页内容不超过 `layout.form.max-width`；确认类弹窗 `layout.modal.width.sm`，带表单的弹窗 `layout.modal.width.md`；抽屉 `layout.drawer.width`；登录卡 `layout.auth.card-width`。
- 浮层分三层：下拉菜单、弹窗表面用 `color.bg.elevated`（暗色下必须比 `bg.surface` 亮一档，否则浮层和底板分不开）；弹窗遮罩用 `color.bg.overlay`；Tooltip 和深色 Toast 用 `color.bg.inverse` + `color.text.inverse`（亮色下深底白字，暗色下反过来）。
- 阴影拆成颜色 + 偏移 + 模糊三个 Token，写法固定为 `box-shadow: 0 var(--elevation-<层>-y) var(--elevation-<层>-blur) var(--elevation-<层>-color)`，三层分别是 `card`、`popover`、`modal`，偏移与模糊逐层放大、颜色逐层加深，数值以 token 为准。卡片用「细边线定形 + 软阴影定层」：外框仍是 `border.default`（neutral.200）——它必须与页面底色 neutral.100 可区分，再浅一档就会与底色重合、边缘发虚；亲和感来自这层柔和阴影，而不是把边线抹掉。暗色下卡片阴影色是透明（靠边线分层），浮层和弹窗换成更重的黑色阴影。
- 组件库自带的"另一套语义"不进系统：Element 的 `type=success / warning / info` 按钮（状态色实底）、`effect=dark` 的状态标签与提示条（状态色实底白字）、`type=primary` 的标签 / 徽标 / 文字 / 链接（黄字或黄底）在桥接下一律退化为系统形态——次要按钮、浅色成对胶囊、中性块或反转块。语义靠文案，不靠这些变体。组件库在 JS 里写死的色表（进度环的蓝、空状态插图的灰、评分的金）也由桥接接管；每次升级组件库用走查页（见验收基线）复扫。
- 组件内部几何（对勾的位置、开关滑块的位移、状态圆点直径、演示图表尺寸）不是规范，不进 Token；在目标项目里用 `exemptions.json` 写明理由登记，而不是匿名留在 CSS 里。

## 图标

- 图标库是字节跳动 [IconPark](https://iconpark.oceanengine.com/official)（`icon.library`，Apache-2.0，2600+ 图标，48×48 viewBox，描边粗细可调）。React 用 `@icon-park/react`，Vue 3 用 `@icon-park/vue-next`，静态页 / 模板引擎用 `@icon-park/svg` 内联。不混用其他图标库；缺图标先在 IconPark 里找近义词。
- 全局配置只做一次（见 `bridge/iconpark.config.ts` + `bridge/iconpark.css`）：线性 `icon.theme.default`，圆头圆角，描边 `icon.stroke.width` = 4（IconPark 默认值；3 在 Retina 上明显偏细）；`icon.stroke.width-small` 目前与默认相同，保留角色名以便日后单独调整。
- 尺寸只走六档 `icon.size.*`，通过 `font-size` 生效（图标 `size` 固定 `1em`），不在图标上写像素。随文字出现的图标继承 currentColor；独立图标按角色取色：`color.icon.default`（工具栏、表格操作）、`color.icon.muted`（装饰性）、`color.icon.brand`（two-tone 品牌插图的描边，近黑）、状态图标用 `color.status.*`。
- 图标不用风格变化表达状态：选中项、激活项的图标保持线性（`icon.theme.active` = outline），状态由底色与指示条承担。若某处确实需要面性外观（如底部 Tab），不要用 IconPark 的 filled（镂空色写死 #FFF，暗色或黄色底上漏白），用 multi-color 传四个颜色 `[描边, 填充, 镂空描边, 镂空填充]` 全部指向 token，见 `bridge/iconpark.config.ts` 的 `activeIconProps()`。
- two-tone 只用于品牌时刻（空状态插图、引导页）：描边 `color.icon.brand`、填充 `color.icon.two-tone`。工作区内的功能图标一律线性。
- 图标不单独承载信息：按钮里的图标必须伴随文字或 `aria-label`；状态图标必须与状态文字同时出现。
- 接入组件库后，组件内部的功能性图标（下拉箭头、关闭、勾选、分页箭头）允许保留组件库自带的 SVG，不强求替换；业务图标（导航、操作、状态、空状态）一律 IconPark。两套图标在同一屏并存是接入真实组件库不可避免的妥协，实测（Element Plus）证明视觉上可接受。

## 数据可视化

- 分类色用 `color.chart.1` … `color.chart.6`：品牌黄领衔，其后是公司调色板的蓝（Primary Blue 500 / 暗 400）、青（亮用 `cyan.600`，因为 `cyan.500` 在白底上只有 2.5:1，画不出线；暗用 `cyan.500`）、紫（亮暗同值），再是浅灰、深灰。刻意避开 warning 橙、error 红、success 绿，图表颜色不能和状态语义打架。调色板里的 Indigo 与 blue 800 / 300 留给第 7 序列以上的图表，出现前不收进 token。
- **计数型趋势**（申请数、订单数这类小整数）：y 轴从 0 起、刻度只取整数——`scale: true` 会让 1～3 出现 1.5 / 2.5 这种“半张申请”刻度；`trendLine` 按数据自动判断（全是整数且最大值 ≤ 20），也可显式传 `count`。排行横向柱状图用 `rankBars({ categories, values, top, formatter })` 配方：前三名纯黄、其余灰、零值不着黄、右侧金额标签。图表容器组件 `EChart` 会追踪 option 函数里读到的响应式数据，数据变了自动重画，不需要 key 重建。
- 单序列强度（热力、排行）用 `color.chart.sequential.1` … `5`：灰阶四档 + 纯黄封顶，**按离散分段使用**（ECharts 用 piecewise visualMap），不要在灰与黄之间做连续插值——中间值是橄榄色。排行榜前三名纯黄、其余中性灰是同一条规则的应用。
- 图表里的品牌黄和主按钮是同一个颜色，所以同一屏里图表不要和主按钮抢注意力：图表区域内不再放主按钮。
- **折线（趋势）**：y 轴贴数据范围（ECharts `scale: true`，不强制从 0——两周对比的 1200～1900 若从 0 画起会被压成顶部一条），柱状图与面积图必须从 0 开始；平滑取 0.5 并开 `smoothMonotone: 'x'`（单独调低平滑到 0.3 会让曲线在数据点处显硬；不加 monotone 约束则会在点之间鼓出数据里没有的起伏），线端与拐角圆头；不常显数据点，hover 由轴指示线带出；**所有序列统一 2px 细线**——主序列靠品牌黄识别，不靠加粗（浅色底上一条 3px 的黄粗条会很突兀）。**面积只给单序列**，且是从 `chart.area` 到透明的纵向渐变——多序列对比不填面积（面积会盖住其他序列、把整张图压成一块灰）。
- 轴与网格：类目轴有轴线（`border.default`）、无刻度、无网格；数值轴无轴线、网格线 `border.default`；标签 `text.muted`、`text.small.size`；图例右上、圆角方块；提示框 `bg.inverse` + `text.inverse`。
- ECharts 不读 CSS 变量：用 `bridge/echarts.js` 在运行时读 token 生成主题（`registerTheme`）与配方（`trendLine`、`areaGradient`），亮 / 暗切换后重新注册并重建实例；页面只写数据与布局，不写颜色与线型。

## 页面骨架

页面由布局与页面两层组成：布局只出侧栏、顶栏、面包屑；**页头由页面自己渲染**。四种页面形态：

| 形态 | 骨架 | 说明 |
| --- | --- | --- |
| 页头（所有页面） | 标题 `text.heading.size` + `text.weight.strong`（详情页在标题后跟状态胶囊）；一句说明 `text.secondary`；右侧页面级操作区：主按钮 = 最常用的正向动作（编辑 / 新建），可逆的状态变更（停用 / 恢复、上线 / 下线）= 次要按钮，不可逆或危险的（删除）收进「更多」下拉的 `is-danger` 项，都要二次确认 | 与内容区间距 `space.stack` |
| 列表页 | 页头 → 筛选卡 → 表格卡（批量操作条、表格、分页在同一张卡里） | 见「筛选栏」「表格」「已选筹码 / 批量操作条」配方 |
| 统计卡 vs 状态条 | 带趋势 / 对比的指标用统计卡（数据大字 + 涨跌，左侧品牌指示条是固定特征）；**只有一个数字的计数不拉满一行**，做成状态条：一行等高格子（`control.height.lg`），左点右数，可点击时作筛选 | 同侧栏的"宽度浪费"规则：内容撑不起的容器不要拉满。**统计卡用配方组件 `bridge/vue/StatCard.vue`**（label / value / delta / up / positive / note / hint——口径说明放 `hint`，标签右侧信息图标悬停出 tooltip），不要每页复制一份样式——两页各写一份迟早漂移 |
| 表单页 | 一张卡，宽度 ≤ `layout.form.max-width`；卡内两列网格（列间距 `spacing.6`），地址、多行文本、上传等长字段跨两列；标签列宽 `layout.form.label-width`、右对齐；页脚按钮行右对齐、顶部发丝线，主操作在最右，其左依次次要（第二个真实动作：保存草稿 / 上一步）、quiet（取消 / 放弃修改）；超过一屏的长表单页脚用 `.form-foot.is-sticky` 贴底跟随；表单内的行内录入表格（采购明细这类）用 `.table-editable`：单元格内边距收到 `spacing.3 / spacing.2`、控件 `small`、行内错误静态渲染在控件下、列头星号标必填 | 帮助文字 `text.small.size` + `text.muted`，在控件下方 `spacing.1`；出错时错误文案（`status.error`）占同一位置，不叠加。单位后缀（km、元）用 `text.secondary` 文字跟在控件后，间距 `space.inline` |
| 分步流程 | 顶部步骤条 + 每步一张表单卡；「上一步 / 下一步」在页脚；最后一步是只读汇总（描述列表，标签列宽同表单）+ 协议勾选 + 提交主按钮 | 完成步骤图标 `status.success`、标题 `text.secondary`；当前步骤 `action.primary`（不必传 `finish-status`，桥接已把完成态与 success 态都映射好） |
| 详情页 | 页头（标题 + 状态胶囊 + 概要）→ 数据卡一行 → **一张卡内的页签**（概览 / 资质 / 日志 / 结算这类维度），每个页签内用分区小标题（`text.title-sm.size` + `text.weight.label`）+ 发丝线分隔多个板块；概览页签 = 描述列表 + 进度 / 状态 + 关联列表（带「查看全部」导览）；卡内多栏网格间距 `spacing.4`；次级详情 / 小表单用右侧抽屉，不开第二层弹窗；`?tab=` 直达页签 | 页签放卡内而不是卡外：卡外页签会让每个页签各成一张卡，页面被切碎 |
| 左右分栏页（组织树 + 成员表、角色列表 + 权限矩阵） | 左窄右宽 `minmax(0, 1fr) minmax(0, 5fr)`（1440 展开侧栏时左栏约 200px）；左栏只放导航性内容（树 / 列表，6～8 字一项），**当前项深黑反转块**（`action.selected` + `text.on-selected` + 500，同侧栏与分段选择器；树由桥接接管 `is-current`，自绘列表用同一组 token）；右栏页头由页面全宽渲染，卡头再写当前范围 | 左栏再宽就是侧栏那条「宽度浪费」规则；1280 下右栏要容得下 7 列表格不滚动 |
| 设置页 | 页签放卡内（同详情页），每个页签 = 独立表单 + 自己的页脚（放弃修改 quiet + 保存主按钮），有未保存修改时切换页签要确认，页签标题后缀文字「（未保存）」而不是圆点；「恢复演示数据」这类危险区独立成卡：卡头 + 说明 + 实底危险按钮，红色只落在按钮上，不做红边红标题；确认要求输入指定文字，不匹配时确认按钮禁用 | 每个字段旁用 `.help` 写「保存后的效果」；字段出错时 `.help` 隐藏、错误文案占同一位置（recipes 已处理） |
| 结果页 | 内容区垂直居中；插图底 `bg.subtle` + `border.strong` 虚线；标题 `text.title.size` + strong；说明 `text.secondary` + `text.paragraph.line-height`；操作居中：主按钮 + 次要 | 系统结果（403 / 404 / 500）用 two-tone 品牌插图 + `text.brand` 大字代码；**操作结果**（提交成功 / 失败）用 `status.success / error` 的线性图标 `icon.size.2xl`；**内容级不存在**（记录已删除、链接有误）用 `icon.muted` 线性图标 + 说明 + 「返回列表」主按钮，不用品牌插图——那是系统级页面 |

## 组件配方

给普通编码 Agent 的速查表：每个组件用哪些 Token。不在表里的组件先按最接近的一行类推，再提提案。

### 组件库对照：shadcn/ui（React + Tailwind v4）

Element Plus 由 `bridge/element-plus.css` 逐组件接管；shadcn/ui 由 `bridge/shadcn-globals.css` 接管（契约变量 + `@theme inline` + 按 `data-slot` 的组件级接管），2.5.0 起在 React 实验项目（`testbed/shadcn-lab`）上渲染验证并跑同一套走查。页面骨架公共类（`recipes.css`）与组件库无关，React 项目直接用；配方组件用 `bridge/react/`（StatCard / EChart / TrendChart / TableSkeleton / ConfirmBar + `useInlineConfirm`）。

| shadcn 写法 | Citrine 角色 | 说明 |
| --- | --- | --- |
| `Button` default | 主按钮（黄底深字） | `--primary` = `action.primary`；hover 走 `primary/90`，桥接已让 color-mix 结果可被验收工具解析 |
| `Button variant="outline"` | 次要（描边） | |
| `Button variant="secondary"` | quiet（浅底文字按钮） | `--secondary` = `bg.hover` |
| `Button variant="ghost"` | 只给图标按钮 | 静息透明，文字按钮裸放违反「按钮不能裸放」 |
| `Button variant="destructive"` | 危险实底（最终确认） | 红底白字，只用于最终确认 |
| `Button variant="link"` | **不用** | `text-primary` 是白底黄字；链接用 recipes 的 `.link` / `.act` / `.go` |
| `Badge` default / destructive | **不用** | 黄底徽标违反「黄不表达强调」，红实底只留给按钮；状态用 `.status.*`，强调用 `.badge.brand`，中性标签可用 `Badge variant="secondary|outline"` |
| `Tabs` | 分段选择器形态 | 桥接把选中项改为深黑反转块、外壳 `bg.subtle` + 发丝线；`TabsContent` 是 Tab 停靠点，桥接补了焦点环 |
| `Tooltip` | 反转块 | shadcn 默认 `bg-primary`（黄），桥接改为 `bg.inverse` + `text.inverse` |
| `Dialog` / `AlertDialog` 遮罩 | `bg.overlay` | shadcn 写死 `bg-black/50`，桥接接管 `*-overlay` |
| `Skeleton` / `Progress` 轨道 | `bg.skeleton` / `border.default` | shadcn 用 `accent`（选中底）与 `primary/20`（黄的洗色），都不是 |
| `Table` | 表头 `bg.subtle` + `text.secondary` + 500，单元格内边距 `table.cell.padding-x / -y`（20 / 14），行 hover `bg.hover`，选中 `bg.selected-subtle` | shadcn 默认表头正文色、hover `muted/50`、单元格 `p-2` = 8px（内容贴边，2.11.1 桥接接管） |
| `Checkbox` / `RadioGroup` / `Switch` | 选中黄（允许），命中区 24 | 视觉 16，桥接用伪元素外扩到 `control.hit-min` |
| `h-8` / `h-9` / `h-10`、`size-9`、`SelectTrigger size` | `control.height.sm / md / lg` | shadcn 三档是 32 / 36 / 40，桥接按 `data-slot` 接到 28 / 34 / 40 |
| 焦点 | 边线换 `--ring`（= `border.focus`）+ 3px 环 | 桥接把环色从「`--ring` 的 50%」换成 `focus.ring`（16% 灰环）；有 `data-slot` 的元素不再叠全局 outline |
| 根字号 | 保持 16px | Tailwind 的 rem 刻度依赖根字号；recipes 只在 `body` 设 14px，不动 `html` |
| 菜单 / 下拉项 focus | `bg.hover` | `accent` 是「选中」语义，留给 `data-state=checked` |

| 组件 | 底 | 文字 | 边线 / 其他 |
| --- | --- | --- | --- |
| 主按钮 | `action.primary` / `-hover` / `-active` | `text.on-primary` | 高度 `control.height.md`，圆角 `radius.md` |
| 次要按钮 | `bg.surface`，hover `action.secondary-hover` | `text.primary` | `border.strong` |
| 文字按钮（quiet） | 静息 `action.quiet` 浅底，hover / active `action.quiet-hover` | `text.link` / hover `text.link-hover` | 无边线；**按钮类内容不能无框架直接放在背景上**（用户规则）：要么描边（次要按钮），要么浅底（quiet），不允许裸文字当按钮 |
| 内容型链接（订单号、名称、正文里的链接） | — | `text.link`，hover `text.link-hover` | `text.link.decoration` + `text.link.style`；等宽数字型链接不斜体 |
| 操作链接（编辑 / 复制 / 详情 / 改派 / 催单 / 取消选择…） | 无填充；hover `bg.hover`（危险 `status.error-bg`） | `text.link` + `text.body-sm.size` + 400（`<a>` 与 `<button>` 同形：button 不要写 `font: inherit`，简写会把字重、行高一并重置）；危险动作 `text.danger`（hover 不变色） | **同色胶囊描边**：`border.width.default` × currentColor，`radius.full`，高 `control.height.xs`（与状态胶囊同高），左右内边距 `spacing.2`；不斜体不下划线；相邻胶囊间距 `space.inline`，一行最多 3 个，其余收进「⋯」图标胶囊；导航用 `<a>`、不导航的动作用 `<button>`，二者同形；**不可用时保留位置、`opacity.disabled` 压淡**，不隐藏（列宽不跳） |
| 导览链接（查看全部 / 查看列表） | — | `text.link` + `text.weight.label`，hover `text.link-hover` | 文字 + 右箭头 `icon.size.sm`，hover 箭头右移 `spacing.0-5`；不描边不斜体；只有图标时（列表项右侧 ›）`icon.muted`，命中区 ≥ `control.hit-min` |
| 标题型链接（待办、公告的标题） | — | `text.primary` + `text.weight.label`，hover `text.link-hover` + 下划线 | 不斜体、常态无下划线 |
| 危险按钮 | `action.danger` / `-hover` / `-active` | `text.on-danger` | — |
| 禁用态（任何控件） | 不换色 | 不换色 | `opacity.disabled` |
| 输入框 / 搜索框 | `bg.input` | `text.primary`，占位符 `text.placeholder` | `border.input`；聚焦 `border.focus` + `focus.ring` × `focus.ring.width`；出错 `status.error` |
| 卡片 | `bg.surface` | — | `border.default`，`radius.lg`，`elevation.card.*`，内边距 `space.card` |
| 表格 | 表头 `bg.subtle`；斑马纹 `bg.subtle`；行 hover `bg.hover`；选中 `bg.selected-subtle`；选中 + hover `bg.selected-hover` | 表头 `text.secondary`（`text.small.size`），副行 `text.muted`，数字列 `text.numeric.variant` | 行分隔 `border.default`；单元格内边距 `table.cell.padding-y / -x`；排序激活 `text.selected`；固定列右缘 `elevation.popover.*`；**合计行**（`show-summary`）`bg.subtle` + 500 + 等宽数字（桥接已接管表尾）；操作胶囊不可用时 `<button disabled>` 保留 `title` 说明原因（`<a>` 没有原生禁用，需要原因时外包一层带 `title` 的 span）。**操作列**：默认是一串操作胶囊（详情 改派 ⋯，间距 `space.inline`），危险动作红字红边；列宽按胶囊估算——两字胶囊约 44px、四字约 70px、图标胶囊约 28px，加间距与单元格内边距，胶囊不得换行；只有审批类决定（通过 / 拒绝、确认 / 驳回）用 small quiet 文字按钮（`text` + `size="small"`），危险的用 `type="danger" text`（红字 + `status.error-bg` 浅红底，hover 同色发丝边——不是灰底红字）；无论哪种形态，**危险动作不得与普通动作同色**；一行最多 3 个动作，更多收进下拉「更多」；不可操作的行放 `text.muted` 的「—」；不用描边次要按钮排成一列；单元格里的名称 / 单号才是内容型链接 |
| 筛选栏 | 条件区无底；控件不带可见标签，靠 `aria-label` 命名（筛选栏是紧凑形态，占位符规则在这里的例外只有关键词框：占位符列出可搜字段，且带 `aria-label` 与清除按钮） | 下拉默认值是真实选项「全部…」，用正文色 | 条件区 / 动作区两组；动作区「查询」主按钮 +「重置」quiet 文字按钮，`margin-left: auto`，折行时整体换行右对齐；关键词框宽 `layout.search-width`，其余控件按内容定宽 |
| 已选筹码 / 批量操作条 | `bg.selected` | 「已选 N 项」`text.selected` + `text.weight.strong`；带「取消选择」内容型链接 | 按钮 small：普通批量为次要按钮，破坏性批量为实底危险按钮；条随勾选出现，位于表格上方 |
| 选项卡片（改派骑手、派单选单） | 默认 `bg.surface`；hover `bg.hover`；选中 `bg.selected-subtle` | `text.primary`，meta `text.muted` | 边线 `border.default`，选中 `border.focus`；卡片撑满容器宽度（radio-group 默认 align-items:center 会把它挤成内容宽） |
| 分段选择 / 视图切换 / 状态切换（radio-button 组、checkbox-button 组、`el-segmented` 同一配方） | 外胶囊 `bg.subtle` + `border.default` 发丝线；未选项透明；选中项 `action.selected` 内胶囊（深黑反转） | 未选 `text.secondary`、400；hover `text.primary`；选中 `text.on-selected`（白）+ `font.weight.medium`（反转块已是强调，不叠 600） | 外壳高 `control.height.*`、`radius.full`；内胶囊内缩 `control.segmented-inset`（2px）、`radius.full`——胶囊套胶囊天然同心；不用边线拼接的方块按钮；禁止用品牌黄表达选中 |
| 空状态 / 骨架屏 | 插图底 `bg.subtle`（`illustration.size.md`）；骨架 `bg.skeleton` → `bg.skeleton-highlight` 流光 | `text.secondary` / `text.muted` | 加载指示器 `action.primary-active` 转圈，轨道 `border.default`。**骨架按目标形状占位**：表格骨架 = 表头（`bg.subtle`）+ 与真实行等高的行（行高 = `control.height.sm` + 上下 `table.cell.padding-y`）+ 目标列宽，行数取每页条数（上限 10）；可以直接用组件库的 skeleton 原子拼，但要封装成项目组件复用，不要每页手写；加载完成不跳版 |
| 只读 / 禁用输入框 | 只读 `bg.readonly` | 只读 `text.secondary` | 禁用整体 `opacity.disabled` |
| 单选 / 滑杆 / 数字步进 / 上传 | 滑杆轨道 `bg.selected`，填充 `action.primary-active`；上传区 `bg.subtle`，拖入 `bg.selected` | — | 单选选中 `action.primary-active`；上传虚线 `border.strong`，拖入 `border.focus` |
| 描述列表 | 标签列 `bg.subtle` | 标签 `text.secondary`，值 `text.primary` | 标签列宽 `layout.form.label-width`，行分隔 `border.default` |
| 上传区 | `.upload-zone`：`bg.subtle` + `border.strong` 虚线 + `radius.md`；hover `bg.hover`；拖入 `.is-over` 边线换 `border.focus` + `bg.selected`；满额 `.is-full` 压淡；键盘焦点画在整块上 | 说明 `text.secondary`，限制文案 `.help` | 用原生 `<input type=file>` 包在 `<label>` 里（Element 的 `el-upload` 列表表达不了「写入中 / 失败」与预览 / 删除胶囊）；文件行 = 类型图标 `icon.muted` + 文件名 + 大小 + 状态胶囊（写入中 info / 已就绪 success / 失败 error）+ 操作胶囊「预览 / 删除」；已随记录保存过的文件删除时先记待删、保存成功后再物理删除 |
| 附件 / 资质卡 | 缩略图占位 `bg.subtle` + `border.default` 虚线 + `icon.muted` 图标，比例 4:3、宽随栅格 | 文件名 `text.body-sm.size`，元信息（上传时间）`text.muted`，审核状态胶囊 | 操作胶囊「下载 / 预览」；缺失项：状态胶囊「未上传」+ 说明 + `text.muted`「—」占位 |
| 步骤条 | 完成 `status.success`，当前 `action.primary` | 当前 `text.primary` 加粗，其余 `text.muted` | 连线 `border.default`，完成段 `status.success`。**流程中止**（取消、驳回）：当前步改为 `status.error`（Element `process-status="error"`），标题改成中止原因，后续步骤保持待办灰——不能让已取消的单子还亮着一个黄色进行中 |
| 时间线 | 节点按事件语义取 `status.*`（完成 success、失败 / 取消 error、告警 warning）；当前进行中 `action.primary`；**未发生的步骤空心节点 `border.strong`**；中性 / 记录类事件（资料变更、备注）不传 type，用默认灰节点——只有带语义的事件上色 | 标题 `text.body-sm.size` + `text.primary`，说明与时间 `text.muted` | 连线 `border.default` |
| 登录页 | 品牌区 `bg.brand`；表单卡 `bg.surface` | 品牌区 `text.on-brand` + `text.hero.size`；卡片标题 `text.heading.size` | 卡宽 `layout.auth.card-width`，按钮/输入 `control.height.lg` |
| 结果页（403 / 404 / 500） | 插图底 `bg.subtle` + `border.strong` 虚线 | 代码 `text.brand` + `text.hero.size`；说明 `text.secondary` + `text.paragraph.line-height` | 内容在内容区里**垂直居中**（min-height = 视口 − 顶栏 − 上下 gutter），不贴顶；插图 `illustration.size.md`，用 two-tone 图标（`icon.brand` 描边 + `icon.two-tone` 填充） |
| 通知卡 | `bg.elevated` | `text.primary` / `text.secondary` | `border.default` + 左侧 `status.*` × `border.width.indicator`，`elevation.popover.*` |
| 浮层内的确认（关闭带未保存修改的抽屉 / 弹窗、抽屉里的不可逆动作） | **原位确认条** `.confirm-bar`（`bridge/vue/ConfirmBar.vue` + `useInlineConfirm`）：把浮层页脚替换成一条 `bg.subtle` 底 + 上发丝线的确认区域，不叠第二层弹窗；只有确认按钮带颜色（可逆的关闭用主按钮，丢弃修改 / 不可逆用 danger），文字保持中性 | 一句话说明后果 `text.body-sm`；按钮「继续填写 / 继续编辑」（次要，出现时自动聚焦）+「确定关闭 / 放弃修改」 | Esc 在条内 = 留下；再次触发关闭复用同一条，不叠两条；页面级导航的离开确认仍用 `confirmBox`（那里没有"原位"可言） |
| 抽屉 | `bg.elevated` | 内部分组小标题 `.drawer-h`（`text.title-sm.size` + `text.weight.label`，首个不加上外边距）；480 宽的抽屉里描述列表用单列、明细表把类别 / 规格并入物品副行 | 宽 `layout.drawer.width`，`elevation.modal.*`，进出 `motion.duration.slow`；内容用描述列表 + 时间线，不放第二层弹窗 |
| 折叠侧栏 | 同侧栏 | 同侧栏 | 宽 `layout.sidebar.collapsed-width`（Element 会按图标宽 + padding 自己推算折叠宽度，必须显式覆盖成这个 token），图标 `icon.size.lg`，项是 `control.height.lg` 的正方形、水平居中，选中指示条贴侧栏外沿；折叠后菜单项只剩图标，必须带 `aria-label`（Element 的 `el-menu-item` 不透传属性，用指令写到根元素） |
| 计数徽标（顶栏通知、`el-badge`） | `action.danger`（亮暗都保持深红；不用 `status.error`，它暗色下变浅红、白字不够）；`type=primary` 的徽标是反转块 `action.selected` | `text.on-danger` / `text.on-selected`，`text.caption.size` | 顶栏的 16px 胶囊挂在铃铛右上角略出头，不用 badge 组件（它按包裹元素定位，在小按钮上会顶出容器）；组件库 badge 的默认类型就是 danger，文字色必须跟填充走（红底不能配近黑字） |
| 图标（IconPark） | — | 随文字继承；独立图标 `icon.default / muted / brand`，状态图标 `status.*` | 尺寸 `icon.size.*`（font-size），描边 `icon.stroke.width`（小图标 `-small`），激活 `icon.theme.active`（multi-color），插图 two-tone `icon.brand` + `icon.two-tone` |
| 徽标 / 提示条 | `status.<x>-bg`（x = success / warning / error / info / neutral） | `status.<x>` | 徽标 `radius.full`，提示条 `radius.md` |
| 横向表单 | — | 标签 `text.body-sm.size`，右对齐 | 标签列宽 `layout.form.label-width`，标签与输入间距 `spacing.3` |
| 涨跌数字 | — | `data.increase` / `data.decrease` | — |
| 强调徽标（置顶、管理员等角色） | `action.selected` 反转块 | `text.on-selected` | 不用黄底：徽标是强调不是主操作 |
| 标签页 | — | 默认 `text.secondary`，选中 `text.primary` | 选中下划线 `border.current` × `border.width.active`（深黑，不用黄） |
| 分页 | 当前页 `action.primary`（保留黄色，用户决定——它和主按钮一样是静息的主色面，不与「查询」主按钮冲突），hover `bg.hover` | 当前页 `text.on-primary` | 尺寸 `control.height.sm`，`radius.sm` |
| 勾选框 / 开关 | 选中 `action.primary`；开关轨道未选中 `border.strong`；滑块 `control.knob` | 对勾 `text.on-primary` | 勾选框边线 `border.strong` × `border.width.control` |
| 侧栏 | `bg.sidebar`；项 hover `bg.sidebar-hover`；选中 `bg.sidebar-selected`（深黑反转块，hover 不变） | `text.sidebar` / `-strong` / `-muted`；选中 `text.sidebar-selected`（白）；菜单项 400、选中 500（`font.weight.medium`，不用 600） | 图标始终线性；左侧指示条 `brand.indicator` × `border.width.indicator`；分组标题 `text.caption.size`，不加字距；侧栏内不放计数气泡，待处理数放在页面与工作台 |
| 日期面板 | 选中日 / 起止日 `action.selected` 深黑圆底；范围带用组件库默认浅灰 | 选中白字 `text.on-selected`；「今天」`text.primary` + `font.weight.medium`（不用黄字）；hover `text.primary` | 组件库的 `--el-datepicker-*` 变量在组件级声明，必须在 `.el-picker-panel` 同级覆盖，`:root` 级会被压掉 |
| 下拉菜单 | `bg.elevated`；项 hover `bg.hover`；危险项 hover `status.error-bg` | `text.primary`；危险项 `text.danger`（桥接约定类 `is-danger`） | `border.default`，`elevation.popover.*`，出现用 `motion.duration.normal` + `motion.easing.enter` |
| 弹窗 | 遮罩 `bg.overlay`；面板 `bg.elevated` | `text.primary` / `text.secondary` | 尺寸档用类：确认类 `.el-dialog.is-sm`（`layout.modal.width.sm`）、带表单 `.is-md`（不要 `:width` 传字符串）；`radius.lg`，`elevation.modal.*`，进出用 `motion.duration.slow` + `motion.easing.enter` / `exit` |
| Tooltip / 深色 Toast | `bg.inverse` | `text.inverse` | `radius.sm`，`text.small.size` |
| 统计卡（数据卡） | 同普通卡（`bg.surface`）+ **左侧 `brand.indicator` × `border.width.indicator` 描边**——这是数据卡的固定特征，所有同类卡都带，不是高亮；**数据色卡禁止大面积黄色**（用户规则），黄只出现在这一条描边上 | 同普通卡；涨跌照用 `data.increase / decrease` | 数字 `text.display.size`（32px）+ `.weight`（700）+ `.line-height`（1.25 紧行高）+ `.tracking`；数据数字是卡片主角，必须一眼压住标签与涨跌 |
| 进度条 / 进度环 / 仪表盘 | 轨道 `bg.selected` | 内嵌百分比 `text.on-primary`（不用白字） | 填充 `action.primary-active`，`radius.full`；**颜色跟状态走**：只有进行中是黄，已结束 / 已下线 / 草稿等非进行中用 `data.inactive` 灰（桥接约定类 `is-muted`；不用 `border.strong`，它与轨道几乎同色），并在旁边用 `status.neutral` 胶囊说明状态（已到期 / 已暂停）——一屏十几张卡全黄就不是焦点了；status 变体用 `status.*`；不接受自定义进度色 |
| 评分 | — | 文案 `text.secondary` | 实星 `action.selected`（填充是选中语义，不用金黄），空星 `border.strong`；焦点 `border.focus` |
| 头像（字母 / 占位，含顶栏与个人中心） | `bg.selected` | `text.selected` | 不用品牌黄——头像不是主操作面；组件库默认的灰底白字暗色下不到 3:1 |
| 可勾选标签（check-tag） | 未选 `status.neutral-bg`；选中 `action.selected` | 未选 `status.neutral`；选中 `text.on-selected` | `radius.full`；同分段选择器的"选中 = 反转块" |
| 局部加载（v-loading、表格加载） | 遮罩 `bg.mask`（surface 90%，内容隐约透出） | 加载文字 `text.secondary` | 转圈 `action.primary-active`；不要拿 `bg.overlay` 当加载遮罩，那会把一张卡片压成黑块 |
| 锚点导航 | — | 默认 `text.secondary`，当前 `text.selected` | 标记条 `brand.indicator`（指示条语义，允许黄）；焦点 `border.focus` |
| 级联 / 树选择 / 时间选择的面板 | 项 hover `bg.hover`；勾选 / 当前 `text.selected` + 加重 | `text.primary` | 选中不用黄字；勾图标随文字色 |
| 页面级组织树（`el-tree highlight-current`） | 行 hover `bg.hover`；**当前节点深黑反转块** `action.selected` + `text.on-selected` + 500（桥接接管，含展开箭头颜色） | 节点计数 `text.small` + `text.muted` 靠右 | 行高 `control.height.md`、行圆角 `radius.md`；展开箭头 `icon.muted`（Element 默认的占位符灰只有 2.5:1） |
| 日历 | 今天 / 选中 `bg.selected` | 今天 `text.primary` + `font.weight.medium`；上下月日期 `text.muted`（不是占位符） | 同日期面板的规则 |
| 穿梭框 | 面板 `bg.surface`，项 hover `bg.hover` | 项 `text.primary`，hover 不变色 | 中间两个箭头按钮必须传 `button-texts`（组件库不给它们可访问名称，图标也不能单独承载信息） |
| Popconfirm | `bg.elevated` | `text.primary` | 图标色是 prop 不是 CSS：传 `icon-color="var(--color-status-warning)"`，组件库默认写死 #f90 |
| 图表 | 系列 `chart.1…6`；强度 `chart.sequential.1…5`；单序列折线面积 `chart.area` → 透明的纵向渐变（多序列不填） | 图例 `text.secondary`，轴标签 `text.muted` | 主题与配方来自 `bridge/echarts.js`；趋势 y 轴 `scale: true`、平滑 0.5 + monotone、圆头、不常显数据点；柱状从 0 起、`radius.xs` 圆角 |

## 交互与无障碍

- 动效三档：即时反馈（hover / active）用 `motion.duration.fast` + `motion.easing.standard`；下拉、Tooltip 出现用 `motion.duration.normal` + `motion.easing.enter`；弹窗、抽屉用 `motion.duration.slow`，进场 `easing.enter`（减速）、退场 `easing.exit`（加速）。用户系统开启"减少动态效果"时，所有时长视为 0——由桥接里的 `@media (prefers-reduced-motion: reduce)` 落地：三档 duration 归零，所有 transition / animation 时长归零。
- 焦点必须可见：焦点环用 `color.focus.ring` 配 `focus.ring.width`，输入框聚焦同时把边线换成 `color.border.focus`。焦点边线是近黑（暗色下近白），焦点环是 16% 的灰环——黄色在白底上不可见，深金又显脏，焦点这种"必须一眼看见"的状态交给无色系最可靠。桥接提供全局 `:focus-visible` 兜底（链接、按钮、菜单项、标签页、单选组、开关、分页、排序、关闭按钮全部覆盖）——组件库自带的焦点环是主色画的，黄在白底上等于没有；菜单项和标签页还被写死了 `outline: none`；Element 2.14 又给 38 处控件（表格筛选 / 展开 / 排序、标签关闭、锚点、取色器、评分、标签页 inset 阴影）加了主色 `:focus-visible`，全部由桥接改为 `border.focus`。
- 浮层里不再叠浮层：抽屉 / 弹窗内需要确认时用原位确认条（见配方表「浮层内的确认」），`ElMessageBox` 只用于页面级的确认。
- 浮层关闭后焦点回到触发元素：弹窗 / 抽屉由 Element 的焦点陷阱归位（列表刷新导致触发行重绘时页面要兜底到同列首个按钮）；**`ElMessageBox` 不会归位**，确认弹窗一律走 `bridge/vue/confirm.js` 的 `confirmBox / confirmDanger`（记住打开前的焦点元素、关闭后还回去，用法同 `ElMessageBox.confirm`）。抽屉打开后焦点落在容器而不是首个控件，需要 `@opened` 手动聚焦到意见框 / 第一个输入。
- 禁用态用 `opacity.disabled` 统一表达，按钮、输入框、开关都一样，不另造一套灰色。
- 黄底面（登录页品牌区等）上的次要文字用 `opacity.on-primary-muted` 压一档，而不是换成灰色文字——灰字在黄底上对比度不够。
- 图标类控件（关闭 ×、更多 ⋯、箭头、表格操作链接）必须有可访问名称（`aria-label` 或可见文字；Tooltip 不算），命中区不小于 `control.hit-min`（24×24）——视觉尺寸可以更小，用伪元素或 min-width / min-height 外扩。句中链接除外。
- 对比度底线见「验收基线」。检查时要连底色一起算：弱化文字落在页面底 / 选中行上、状态胶囊落在选中行上，都要按实际底色算；暗色状态浅底做成预混实色正是为了让它不随底色变化。新增任何「黄色上的文字」或「白底上的黄色文字」前先算对比度，Token 描述里写着关键数值。

## 验收基线

每次改 token 或桥接后，按下面的基线对实测项目做全量回归；基线与例外都在这里，扫描工具只是执行者（仓库级工具 `citrine/tools/`，各实测项目在 `app/` 目录 `npm run accept` 一键跑完）。

- **对比度**（亮 / 暗两种模式都要过）：正文与 12px 小字 ≥ 4.5:1，大字（≥ 24px 或 ≥ 18.66px 加粗）与图标 ≥ 3:1，连底色一起算（页面底、选中行、预混浅底）。
- **已批准的例外**（用户拍板，不算失败，扫描单列统计）：
  - success（`green.700` 压 `green.50` 3.0:1 / 白底 3.4:1）、warning（`orange.700` 压 `orange.50` 3.2:1 / 白底 3.6:1）、error（`red.700` 压 `red.50` 3.0:1 / 白底 3.7:1，以及危险按钮白字 3.7:1）。回补路径（同色相压深到 AA）写在对应 token 描述里。
  - 占位符 `text.placeholder`（亮 neutral.400 2.5:1 / 暗 neutral.500 3.7:1）：只允许出现在带可见标签、且真的可以为空的输入框里。
- **可访问名称**：所有按钮、链接、菜单项有名称（图标类靠 `aria-label`）；无重复 id；图片有 alt。
- **命中区**：图标类控件 ≥ `control.hit-min`（24px）；句中文字链接除外。
- **溢出与截断**：任何模式、任何页面无横向溢出；nowrap 文字无截断。
- **键盘焦点**：Tab 遍历每个可聚焦元素都有可见焦点环（近黑实线 / 暗色近白）；可滚动容器被键盘聚焦时同样近黑，不留浏览器默认的蓝环。
- **窄屏**：1366px 下侧栏默认折叠，无溢出，筛选栏动作区整体换行。
- **构建一致性**：`validate-system` / `guard` / `status` 三绿；预览 E（手写 token）与 S（构建产物）逐像素一致（动画相位差除外）。
- **组件走查**：实测项目的 `#/kitchen` 页铺开组件库全部组件（静息 / 选中 / 禁用 / 出错，浮层与弹层逐个点开），亮 / 暗两种模式下对每个交互元素强制 `:hover` 与 `:focus-visible`：状态切换**不得新引入**品牌黄（静息黄只允许主按钮、进度 / 滑杆填充、勾选 / 开关选中、当前步骤、时间线主节点、加载转圈）；hover 不得让文字对比掉档；页面上每一个可见颜色都必须来自 token（外来颜色 = 0）。组件库升级后必跑。

## Do / Don't

- Do：在实现前说明所选 Semantic token 表达的意图。
- Don't：为了赶工新增未命名的色值、间距、圆角或字体尺寸。
- Don't：让任何 hover / focus 反馈用品牌黄——包括组件库自带的默认（它们大多指向主色变量）。
- Don't：把日常文案、数据或图片内容更新当作设计系统变更。
- Do：新增、跨页面复用或修订视觉决定前，先提出 Token／Scope／Theme／组件例外提案。
