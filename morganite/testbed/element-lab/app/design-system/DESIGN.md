# Morganite 玫瑰金 设计系统

> 本文件记录设计意图与使用规则。对已确认纳管的设计决定，具体视觉数值的唯一来源是 `tokens/*.tokens.json`；不要在这里重复色值、尺寸或阴影参数。未迁移的旧规范仅作为审计证据，不与 Token 双重维护。
>
> 评判标准：本文件与 token 是规范本身，任何预览或项目与它冲突都以它为准；视觉基准是效果预览（种子仓库 `morganite/previews/rose-gold-admin/`，在线版 <https://wycm9527.github.io/Design-System/morganite/previews/rose-gold-admin/>），接入项目的页面应与它一致，它与本文件冲突时改预览；`preview/` 下的壳层 / 表单 / 抽屉只和来源站比像不像，`token-board.html` 只列值，都不作评判。
>
> 来源：以 Ant Design Pro v6 为视觉底座，从 https://preview.pro.ant.design/dashboard/analysis、https://preview.pro.ant.design/list/table-list、https://preview.pro.ant.design/form/basic-form 以及查询表格里的新建弹窗与详情抽屉实测提炼（2026-09-28），再按用户决定把品牌色换成玫瑰金。证据、推断、缺口与用户决定见 `AUDIT.md`。
>
> 适用类型：**中后台**（`admin`）——侧栏 + 表格 + 图表 + 弹窗尺寸的工作台。词表里其他类型才有的角色（见 `AUDIT.md`「可选角色」）本系统不发明值；需要时先走提案。

## 先读这里（编码 Agent 速查）

做页面时只需要这一屏 + 下面的「组件配方」表；其余章节是规则的理由，遇到配方没覆盖的情况再读。

1. 玫瑰金是唯一的彩色焦点，只出现在该被注意的地方：主按钮（`color.action.primary`）、勾选 / 开关选中、进度填充、页签墨条（`color.border.current`）、品牌指示条（`color.brand.indicator`）、图表首色（`color.chart.1`）。每屏只放一个主按钮，其余降为次要按钮。
2. 金底上的文字用白字（`color.text.on-primary` / `color.text.on-brand`，亮色侧栏当前项 `color.text.sidebar-selected`）——用户指定，深字在金底上显脏；白字对主色达不到正文底线，已登记为例外（见「已批准的例外」）。链接、选中文字、焦点用同色系更深的一档（`color.text.link` / `color.text.selected` / `color.focus.ring`），不直接拿主色当文字色。
3. 选中与当前：侧栏当前项是主色底块配白字，图标随文字一起变白（`color.bg.sidebar-selected` + `color.text.sidebar-selected`），与其他项同字重（不额外加粗）、不加指示条；表格选中行与悬停同色（`color.bg.hover`），再悬停深一档（`color.bg.selected-hover`）；批量条这类小面积选中用中性浅灰（`color.bg.selected`）；筹码（已选条件胶囊）用字色同色 10% 的金色浅底（`color.bg.chip` + `color.text.selected`）；分段选择器（含单选 / 多选按钮组）当前项是灰轨道上的白块（`color.action.selected`）；其余选中按 antd 走主色系：分页当前页、日期选中日、主色徽标、深色 / 勾选标签用主色实底白字（`color.action.primary` + `color.text.on-primary`），评分星用 `color.action.primary`，树当前节点用奶金浅底（`color.bg.selected-subtle`）——`color.action.selected` 是白色，只能压在灰轨道上用。暗色下侧栏当前项是金色暗底配亮金字。
4. 状态色只做「文字 + 同色浅底」胶囊（`color.status.*` / `*-bg`），并且一定配文字标签；实底按钮只有主（`color.action.primary`）与危险（`color.action.danger` + `color.text.on-danger`）。
5. 链接靠色相识别：`color.text.link`，不加下划线（`text.link.decoration`）、不用斜体（`text.link.style`），悬停变深（`color.text.link-hover`）。正文里的链接和表格操作列的「配置 / 详情」是同一种样式。
6. 尺寸只从 token 拿：控件高 `control.height.*`，间距 `space.* / spacing.*`，圆角 `radius.*` 按容器层级递减，字号走 `text.*.size` 阶梯；不在阶梯之外取值。
7. 字重：正文、按钮、表单标签、下拉菜单用 `text.weight.label`；导航菜单（侧栏、横向菜单）用 `text.weight.nav`（中等，比正文重一级）；表头、标题、卡片标题用 `text.weight.strong`；统计大字用 `text.display.weight`（半粗）。选中态不靠加粗，靠颜色和底色——菜单当前项与其他项同字重。
8. 禁用 = `opacity.disabled`；只读 = `color.bg.readonly`；加载 = 骨架屏 `color.bg.skeleton*`，不用禁用态假装。加载 / 空 / 出错三态与按角色隐藏、禁用的规则见「页面状态与权限」。
9. 图标类控件必须有 `aria-label`、命中区 ≥ `control.hit-min`；所有颜色和尺寸都必须能在 `dist/tokens.css` 里找到名字。
10. 壳层尺寸只从 token 拿：侧栏 `layout.sidebar.width` / `-collapsed-width`，侧栏菜单项高 `layout.sidebar.item-height`、同组项间距 `layout.sidebar.item-gap`，顶栏 `layout.topbar.height`，弹窗 `layout.modal.width.*`，抽屉 `layout.drawer.width`，表单标签列 `layout.form.label-width`；表格单元格内边距 `table.cell.padding-*`。
11. 图表只用 `color.chart.1…6`（金、深灰、浅金、中灰、浅灰、绿）、顺序色 `color.chart.sequential.*` 与面积 `color.chart.area`，提示气泡用白底浮层 `color.chart.tooltip`（大投影 `elevation.tooltip.*`）；涨跌用 `color.data.increase / decrease`（绿涨红跌，公司约定变了只改这两个别名），不在图表里直接写状态色。
12. 改完跑 steward `guard`（构建与登记一致）和 `status`（页面字面量清零）。

## 视觉语言

- 品牌色：玫瑰金是中等明度的暖金色，面积小、位置固定——主按钮、侧栏当前项、墨条、指示条、勾选选中、图表首色；大面积品牌面 `color.bg.brand` 只给登录页品牌区、欢迎横幅与优惠券券面的面额块，上面放 `color.text.on-brand`。落在金底上的文字按用户要求用白字（对比度例外见「验收基线」）；需要金色文字时用 `color.text.brand`，且只给不小于标题档的展示字。图表也一样克制：金领衔，其余是深灰、浅金、中灰、浅灰和一个绿。
- 中性色：纯灰，沿用 antd——文字、分隔、悬停都用半透明黑叠加，落在任何底色上都不发脏。层次以底色差为主：页面底 `color.bg.page` → 卡片 `color.bg.surface` → 表头 / 次级容器 `color.bg.subtle`，卡片不投影，只加一条很浅的细边线 `color.border.default`。边线分两档：卡片边、容器分隔、表格行线用很浅的 `color.border.default`；按钮、勾选框这类控件描边用深一档的 `color.border.strong`，两档不混用。宽度统一是 `border.width.default` 这一档发丝细线（焦点环、出错态与指示条除外）。整体是 flat-first：浮起感只留给弹窗、下拉这类真正悬浮的表面。
- 文字三档：`color.text.primary` 给正文、标题、表头、表单标签；`color.text.secondary` 给说明、菜单、次要信息；`color.text.muted` 给时间戳、帮助文字、表格副行。`color.text.placeholder` 只用于输入框占位与空值提示，不承载需要读的信息。
- 字体：正文用系统字体栈 `font.family.body`，不加载网络字体；等宽 `font.family.code` 给代码与单号；数据大字（统计数字、KPI、`el-statistic`）用 D-DIN 系（`text.display.family`，字体栈见 `font.family.numeric`：装了 D-DIN-PRO 用它，没装用随桥接分发的 D-DIN）；表格金额与日期、百分比、涨跌、图表数值、页码这些小号数字用正文字体配等宽数字（`text.numeric.family` + `text.numeric.variant`）——D-DIN 系窄体细笔画在 12px 下压不住旁边的中文。D-DIN 随桥接分发（`bridge/fonts.css` 内嵌原版字体，三个桥接入口都会引入），没装 D-DIN-PRO 的电脑也显示同一款数字字体；它只有 400 / 700 两档，`text.display.weight`（600）在这些电脑上显示 Bold，比装了 D-DIN-PRO 的略粗。项目设了 CSP 时要允许 `font-src data:`。正文 `text.body.size`，阶梯从小到大是 `text.caption.size`（与 `text.small.size`、`text.body-sm.size` 同档，也是最小字号）→ `text.body.size` → `text.title-sm.size` → `text.title.size` → `text.heading.size` → `text.display.size` → `text.hero.size`。统计数字用 `text.display.*`。D-DIN-PRO 与 D-DIN 都没有等宽数字，只用在不需要上下对齐的大数字上。
- 状态色：成功绿（与「涨」同一种祖母绿）、警示橙、错误红、信息蓝，沿用 antd 功能色的色相并压深到文字可读。警示不用 antd 默认的金黄，因为它和品牌金同色相；错误红与品牌金在色相上离得远，但依然不单靠颜色区分，胶囊里一定有文字。
- 壳层：保留能放二级菜单的宽侧栏；亮色下侧栏是纯白底（`color.bg.sidebar`，与顶栏、卡片同色，和浅灰页面底分开），当前项是主色底块配白字白图标，侧栏与内容区之间一条 `color.border.sidebar` 细线；顶栏也是白底。暗色下侧栏是纯黑底（与页面底同色，靠 `color.border.sidebar` 分开），当前项换成金色暗底配亮金字。

## 设计原则

- 优先复用已批准的 Semantic token。
- 需要新值时先提出 token 提案，不在组件里临时硬编码。
- Component token 只用于经确认的组件例外。
- 交互结构、密度、状态反馈与组件语义以 Ant Design 为准；本系统改的是品牌色、形（圆角、阴影、描边宽）与少量为对比度做的校正，不另起一套交互习惯。

## Token 使用规则

- Primitive token 表示值本身（`color.<族>.<明度档>`、`spacing.<px/4>`、`font.size.*`…）。
- Semantic token 表示用途（`color.action.primary`、`text.body.size`、`elevation.card.*`…），页面只引用用途名。
- `$description` 以 `[观察]` 开头的是实测证据，以 `[推断]` 开头的是提炼时按规则补的默认值——接入项目前逐条确认，确认后把前缀改为 `[确认]`；以 `[确认]` 开头的是用户拍板的品牌决定。
- `dist/tokens.css` 是生成物，禁止手改。

## 局部规范／生效范围

- Core 规范默认作用于整个项目；局部差异必须登记在 `scope-map.json`，不能靠零散选择器或目录名称猜测。
- Scope 只记录相对父级的差异；页面需要完整的 `data-ds-scope` 继承链才会消费对应的运行时 CSS。
- Theme、单个组件例外和未登记硬编码分别按 Theme、Component Token、Drift 管理，不把它们误建成 Scope。

## Theme

- Core 默认作用于确认的默认 Theme；已有或经确认新增的模式登记在 `theme-map.json`，其相对 Core 的差异位于 `themes/<id>/`。
- Theme 只覆写已批准的 Semantic token 和 Component 例外；不复制 Core，也不手写任意选择器。
- Scope 与 Theme 不自动组合。局部覆写遇到随 Theme 变化的 Semantic 时，先提出提案，经用户确认后再改。
- 本系统登记了 Theme `dark`（激活：:root.dark；默认 `light`），delta 见 `themes/dark/`；运行时由接入项目切换 `:root.dark`。
- 暗色只覆写颜色：表面三层翻成深底、文字换成半透明白、侧栏当前项换成金色暗阶；品牌主色、尺寸、圆角、间距、字重一律不动。

## 布局与响应式

- 页面骨架：顶栏 `layout.topbar.height`（固定时用 `layer.sticky`）+ 左侧栏 `layout.sidebar.width`（可折叠到 `layout.sidebar.collapsed-width`）+ 流式内容区；内容区不设居中最大宽，四周留白用 `space.gutter`。
- 页面结构自上而下四层，所有页面一致、一律左对齐：全局顶栏 → 页头 → 可选的标签页 / 筛选 → 业务内容。顶栏左侧统一是面包屑（`text.body-sm.size`；父级 `color.text.secondary`、当前页 `color.text.primary`，分隔符是 `color.text.muted` 的细箭头，只有真实路由可点），工作台也不例外。页头（配方 `.page-head`，组件 `PageHeader`）：每个一级页面一个 H1（`text.heading.size` × `text.weight.strong`），副标题 `text.body.size` × `color.text.secondary`、与标题相距 `spacing.1-5`、没必要就省略；右侧放页面级操作（主操作金底），与标题顶部对齐。看板页在 H1 下分板块：板块标题（配方 `.section-head`，组件 `SectionHeader`）是 `text.title-sm.size` × `text.weight.strong` × `color.text.primary` 的 H2，右侧放只作用于这一板块的筛选（周期切换、导出日报）；表格、图表自己的筛选留在各自的卡片里。标签页紧接页头：只切换下方内容的页面级标签 pane 为空、与内容相距 `space.stack`，只剩一个标签时不显示标签栏。页面不自己加 margin-top，块间距全部由内容区的 `space.stack` 给。
- 间距走 `spacing.*` 阶梯（px 系统按 4px 命名），页面级留白用四个语义间距：`space.gutter`（内容区四周）、`space.stack`（块与块之间、卡片栅格）、`space.card`（卡片 / 弹窗内边距）、`space.inline`（同一行相邻元素）。运营后台信息密，页面偏紧凑：四周留白与卡片内边距同宽，板块之间比它窄一档，卡片读成一组。
- 圆角按容器层级递减：整块面板 / 大容器 `radius.xl` → 卡片 / 弹窗 / 抽屉 `radius.lg` → 按钮 / 输入框 `radius.md` → 标签 / Tooltip `radius.sm` → 勾选框 `radius.xs`；表格单元格直角。胶囊（`radius.full`）只给顶栏搜索、期间选择、分段选择器、筹码、进度条、状态点与头像；普通按钮和标签不做胶囊。
- 层级最多四档：`layer.sticky`、`layer.dropdown`、`layer.modal`、`layer.toast`，用到哪档写哪档；不手写 z-index 数字。沿用 antd 的顺序：下拉高于弹窗（弹窗里的下拉才能展开），全局提示在两者之间。
- 断点：`layout.breakpoint.narrow` 以下侧栏默认折叠、卡片栅格减列；`layout.breakpoint.mobile` 以下侧栏收成抽屉、筛选栏纵排、表格横向滚动、留白收到 `space.stack`。CSS 媒体查询无法引用 var()，配方里的断点数值是 token 的字面镜像，改 token 必须同步。
- 页面形态走配方，不在页面上另写栅格：看板 `.board`（主图 + 侧栏 KPI）、两栏 `.two-col`（主内容 + 侧信息）、纵向堆叠 `.stack`、卡片栅格 `.card-grid`、设置行 `.setting`、横向表单 `.hform`、登录页 `.login`。看板与两栏在内容区放不下右栏的 KPI 大字时收成单栏——按内容区宽度（容器查询）而不是视口判断，侧栏展开或折叠都成立。筛选项宽度只用三档：`.w-search`（`layout.search.width`）、`.w-select`、`.w-date`。

## 组件原则

- 按钮、输入框共用同一控件高度（`control.height.md`），小号用 `control.height.sm`，大号只给页面级唯一主操作与触屏（`control.hit-touch`）。
- 按钮四层：主按钮金底白字，悬停加深一点（`color.action.primary-hover`）、按下再深一档（`color.action.primary-active`）——白字在变浅的金上更难读，所以不像 antd 那样悬停变浅；次要按钮白底 + `color.border.strong` 描边，悬停换底（`color.action.secondary-hover`）；文字按钮静息透明（`color.action.quiet`）、悬停出浅底（`color.action.quiet-hover`）；危险按钮 `color.action.danger` 实底白字，悬停 / 按下加深。悬停不引入新的颜色（主按钮只是同色系加深）。
- 卡片：不投影，靠白底与页面底的底色差（`color.bg.surface` 对 `color.bg.page`）加一条很浅的细边线 `color.border.default` 定形；卡片内的分区、表格行线用同一条边线色，不另设分隔线色。卡片标题 `text.body.size` × `text.weight.strong` × `color.text.card-title`（亮色 #212121），不加字距、不转大写，右侧放更多操作；Element 的 `el-card` 标题栏、shadcn 的卡片标题同款。贴在卡片顶部的标签栏当卡片标题头用：标签与 `space.card` 对齐、上下 `spacing.4`（与带标题的卡片头同高），底线贯穿卡片左右边缘。小号、半粗、次要色加字距 `text.tracking.caps` 的分区标签（`.section-label`）只给不值一个标题的次要分组；看板的板块标题是 H2（`.section-head`，见「布局与响应式」）。
- 输入框是填充式：静息只有底色 `color.bg.input`、没有边线（`color.border.input` 透明），悬停出现 `color.border.strong`，聚焦只把边线换成更深的 `color.border.focus`，线宽不变、不加外环（光标本身提示焦点）；选择器、日期选择、文本域与输入框同一套。
- 阴影写法固定：`box-shadow: 0 var(--elevation-<层>-y) var(--elevation-<层>-blur) var(--elevation-<层>-color)`，四层 `card` / `popover` / `modal` / `tooltip`；`card` 层颜色是透明（卡片不投影），写法照旧保留，回退时只改 token；弹窗与下拉同一档阴影，靠遮罩区分层级；`tooltip` 是图表提示气泡的大投影，比下拉大一档（白底气泡压在白卡片上，靠投影浮起来）。
- 浮层三件：`color.bg.elevated`（浮层表面）、`color.bg.overlay`（遮罩）、`color.bg.inverse` + `color.text.inverse`（文字 Tooltip / 深色 Toast；图表提示气泡不用反色，见图表条）。
- 状态色是文字色不是填充色：徽标 / 提示条 = `color.status.<x>` + `color.status.<x>-bg`；表格里的状态可以是「状态点 + 文字」，点只是辅助。
- 图标：`icon.library`（IconPark；shadcn 栈跟随 shadcn/ui 用 lucide-react）的描边型线性图标为主，默认尺寸 `icon.size.md`（与正文同高），另有 `icon.size.xs / sm / lg / xl / 2xl`；描边在屏幕上恒为 `icon.stroke.width`（1.4px），各档尺寸一样粗；每只图标的多段描边合并成一个形状再上一次色，半透明的图标色在描边交叠处不叠深。颜色：操作图标 `color.icon.default`，装饰与顶栏操作 `color.icon.muted`，双色插图 `color.icon.brand` + `color.icon.two-tone`。
- 侧栏：底 `color.bg.sidebar`；菜单项高 `layout.sidebar.item-height`，同一分组里相邻两项隔 `layout.sidebar.item-gap`（分组标题自带上下留白；折叠后标题隐藏，组与组之间也隔同样的距离）；项 hover `color.bg.sidebar-hover`，当前项 `color.bg.sidebar-selected` + `color.text.sidebar-selected`（与其他项同字重、不加指示条）；文字三档 `color.text.sidebar` / `-strong` / `-muted`（分组标题用 muted），菜单项字重 `text.weight.nav`，分组标题与页脚仍是常规字重；边线 `color.border.sidebar`；宽 `layout.sidebar.width`，折叠 `layout.sidebar.collapsed-width`；窗口不够高时菜单区自己滚动，品牌区与页脚不动。
- 表格：表头 `color.bg.subtle`（比卡片深一档）+ `color.text.secondary` × `text.weight.label`、小号字，行分隔 `color.border.default`，行 hover `color.bg.hover`，选中行与悬停同色 `color.bg.hover`（再悬停深一档 `color.bg.selected-hover`）；单元格内边距 `table.cell.padding-y / -x`；金额、日期列用 `text.numeric.family` + `text.numeric.variant`（正文字体、等宽数字，金额列小数点上下对齐），单号用 `font.family.code`。
- 弹窗 / 抽屉：宽度只用 `layout.modal.width.sm`（确认）/ `.md`（表单）/ `layout.drawer.width`；横向表单标签列 `layout.form.label-width`，单列表单最大宽 `layout.form.max-width`（单列表单用竖向标签）。
- 图表：分类色 `color.chart.1…6` 品牌金领衔，顺序色 `color.chart.sequential.1…5`（四档灰 + 金封顶，离散分段用）；单序列折线金色描线 + 空心点 + 自上而下渐隐的面积 `color.chart.area`，多序列不填面积；提示气泡是白底浮层：`color.chart.tooltip` 底 + `color.text.primary` 字 + `color.border.default` 细边 + `elevation.tooltip.*` 大投影，圆角 `radius.md`，浮在卡片之上，靠边也不被卡片裁掉；悬停时用浅金竖条 `color.chart.area` 盖住悬停的那一格（宽度是相邻两个点或两根柱子的间距），曲线图和柱状图一样，不画竖线；涨跌 `color.data.increase / decrease`，已结束 `color.data.inactive`；轴与图例文字 `color.text.secondary`。轴线与网格线是 `color.border.default` 发丝线（`border.width.default`）；曲线图的底线（x 轴线）同色同宽、改用虚线 `chart.baseline.dash`，柱状图的基线保持实线。柱子起点（基线一端）直角、末端圆角 `radius.xs`：竖柱圆顶端，横柱圆右端，负值柱圆朝外的那一端；堆叠柱段与段直接相接、接缝直角，只圆每根柱子最外的一段（图例关掉某个序列后按剩下的重算）。进度条是胶囊轨道里的填充，两端保持圆形。柱状图、进度条这类数据填充用渐变，方向统一为起点深、末端浅：竖柱下深上浅，横柱和进度条左深右浅，负值柱反过来（基线一端深）。品牌金填充用指定的两色 `color.chart.gradient.start` → `color.chart.gradient.end`；状态色、分类色等其他填充用同色的饱和度渐变：HSB 明度不变，浅端把饱和度降到 × `chart.gradient.saturation`。中性灰没有饱和度，保持实色；环形图、图例色块也保持实色。进度条在条内显示百分比时，填充改为实色（白字落在浅端看不清）。环形图用平面，不做 3D。
- 顶栏：左侧面包屑（见「布局与响应式」），右侧胶囊搜索、带未读红点（`color.action.danger`）的图标按钮与头像下拉。问候语不放顶栏，工作台把它写进页头的副标题。

## 组件配方

给普通编码 Agent 的速查表：每个组件用哪些 Token。本系统没有的组件整行删掉；配方不够用时先提案，不在页面上补样式。

| 组件 | 底 | 文字 | 边线 / 其他 |
| --- | --- | --- | --- |
| 主按钮 | `color.action.primary` / `-hover` / `-active` | `color.text.on-primary` | 高度 `control.height.md`，圆角 `radius.md` |
| 次要按钮 | `color.bg.surface`，hover `color.action.secondary-hover` | `color.text.primary` | `color.border.strong`，圆角 `radius.md` |
| 文字按钮（quiet） | `color.action.quiet` / `-hover`；表格里悬停不加底，只变色（行悬停已有底色） | `color.text.primary` | 无边线 |
| 危险按钮 | `color.action.danger` / `-hover` / `-active` | `color.text.on-danger` | — |
| 禁用态（任何控件） | 不换色 | 不换色 | `opacity.disabled` |
| 链接 | — | `color.text.link`，hover `color.text.link-hover` | 无下划线 `text.link.decoration`，常规字重 `text.weight.label` |
| 输入框 / 选择器 | `color.bg.input` | `color.text.primary`，占位符 `color.text.placeholder` | 静息 `color.border.input`，hover `color.border.strong`，聚焦 `color.border.focus`（线宽不变、不加外环），圆角 `radius.md` |
| 勾选框 / 单选 / 开关 | 选中 `color.action.primary`；开关滑块 `color.control.knob` | 勾 `color.text.on-primary` | 未选 `color.border.strong` × `border.width.control`，勾选框圆角 `radius.xs` |
| 卡片 | `color.bg.surface` | 标题 `text.body.size` × `text.weight.strong` × `color.text.card-title` | `color.border.default`，圆角 `radius.lg`，不投影（`elevation.card.*` 为透明），内边距 `space.card` |
| 数据卡 / 统计 | `color.bg.surface` | 数字 `text.display.*`（D-DIN 系），涨跌等小数字 `text.numeric.family`（正文字体），标签 `color.text.secondary` | 涨跌 `color.data.increase / decrease` |
| 表格 | 表头 `color.bg.subtle`；行 hover `color.bg.hover`；选中行与悬停同色 `color.bg.hover`，再悬停 `color.bg.selected-hover` | 表头 `color.text.secondary` × `text.weight.label`（小号），副行 `color.text.muted` | 行分隔 `color.border.default`；单元格内边距 `table.cell.padding-*` |
| 批量操作条 | `color.bg.selected` | `color.text.primary` | 上下 `color.border.default` |
| 筹码（已选条件） | `color.bg.chip`（字色同色 10%） | `color.text.selected`，小号字 | 胶囊 `radius.full`，高 `control.height.sm`；移除按钮命中区不小于 `control.hit-min` |
| 进度条 | 轨道 `color.bg.selected` | 百分比 `color.text.secondary`；条内百分比 `color.text.on-primary` | 填充左深右浅：品牌金 `color.chart.gradient.start` → `color.chart.gradient.end`，状态色与中性序列（`color.chart.4`）用同色饱和度渐变（浅端饱和度 × `chart.gradient.saturation`）；条内显示百分比时改实色 `color.action.primary-active`（白字 5.27:1）；胶囊 `radius.full` |
| 徽标 / 提示条 | `color.status.<x>-bg` | `color.status.<x>` | 标签 `radius.sm`（中性类别标签用配方 `.tag`）、状态点 `radius.full`，提示条 `radius.lg` |
| 下拉菜单 | `color.bg.elevated`；项 hover `color.bg.hover` | `color.text.primary`；危险项 `color.text.danger` | `elevation.popover.*`，`layer.dropdown`，圆角 `radius.lg` |
| 弹窗 | 遮罩 `color.bg.overlay`；面板 `color.bg.elevated` | `color.text.primary` / `secondary` | `elevation.modal.*`，`layer.modal`，圆角 `radius.lg`，进出 `motion.duration.slow` |
| Tooltip / 深色 Toast | `color.bg.inverse` | `color.text.inverse` | 圆角 `radius.sm`，`layer.toast` |
| 标签页 | — | 默认 `color.text.secondary`，选中 `color.text.selected`；`text.weight.label`，选中不加粗 | 选中下划线 `color.border.current` × `border.width.active`；贴在卡片顶部时当卡片标题头用：标签与 `space.card` 对齐、上下 `spacing.4`，底线贯穿卡片 |
| 分段选择器 / 按钮组 | 轨道 `color.bg.hover`；当前项 `color.action.selected` | 当前 `color.text.on-selected`，其余 `color.text.secondary`；`text.body-sm.size`，常规字重，选中不加粗 | 内衬 `control.segmented-inset`；不描边 |
| 头像 | `color.bg.selected-subtle`（不透明的奶金浅底，叠在悬停底上也不变色） | `color.text.selected` | 胶囊 `radius.full`，尺寸 `avatar.size.*` |
| 分页（纯 CSS / shadcn 用配方 `.pagination` + `.page`） | 当前页 `color.action.primary`；其余 hover `color.bg.hover` | 当前 `color.text.on-primary` × `text.weight.strong`，其余 `color.text.primary` | `control.height.md`（小号 `control.height.sm`） |
| 日期面板 | 选中日 `color.action.primary`；范围内 `color.bg.selected-subtle` | 选中日 `color.text.on-primary`；今天 `color.text.primary` × 500 | 选中块 `radius.full` |
| 树 | 当前节点 `color.bg.selected-subtle`；hover `color.bg.hover` | `color.text.primary`，当前节点 500 | 行高 `control.height.md`，圆角 `radius.md` |
| 步骤条 | 当前步圆点 `color.action.primary`；其余圆点 `color.bg.surface` | 当前步序号 `color.text.on-primary`；已完成的勾 `color.text.selected`；未开始 `color.text.muted`；标题 `text.weight.label`，说明 `color.text.muted` 小号 | 已完成圆点描边与连线 `color.border.current`；未开始描边 `color.border.strong`、连线 `color.border.default`；圆点 `control.height.sm`。横排：圆点在左、标题与说明在右，连线是标题行后面接到下一步的细线；手机竖排、去掉连线 |
| 时间线 | 节点 `color.bg.surface` | 事件 `color.text.primary`，时间 `color.text.muted` | 当前节点描边 `color.action.primary`，异常 `color.status.error`，其余 `color.border.strong`；竖线 `color.border.default` |
| 侧栏 | `color.bg.sidebar`；项 hover `color.bg.sidebar-hover`；当前 `color.bg.sidebar-selected` | `color.text.sidebar` / `-strong` / `-muted`；当前 `color.text.sidebar-selected`；菜单项字重 `text.weight.nav`（当前项同字重） | `color.border.sidebar`；当前项无指示条；项高 `layout.sidebar.item-height`，同组项间距 `layout.sidebar.item-gap`；宽 `layout.sidebar.width`，折叠 `layout.sidebar.collapsed-width` |
| 顶栏 | `color.bg.surface` | 面包屑父级 `color.text.secondary`、当前页 `color.text.primary`、箭头 `color.text.muted`；操作图标 `color.icon.muted` | 高 `layout.topbar.height`，`layer.sticky`，底边线 `color.border.sidebar`；搜索 `layout.search.width` × `radius.full`；未读红点 `color.action.danger` |
| 抽屉 | 遮罩 `color.bg.overlay`；面板 `color.bg.elevated` | `color.text.primary` | 宽 `layout.drawer.width`，`elevation.modal.*`，`layer.modal` |
| 横向表单 | — | 标签 `color.text.primary` | 标签列 `layout.form.label-width`，单列最大宽 `layout.form.max-width` |
| 空状态 / 结果页 | — | 标题 `color.text.primary`，说明 `color.text.secondary`；结果页错误码 `color.text.selected` | 插图 `illustration.size.md`，大图标 `icon.size.2xl`；用法见「页面状态与权限」 |
| 登录页 | 品牌面 `color.bg.brand`；表单面 `color.bg.page` | 品牌面 `color.text.on-brand`（只放不小于 `text.heading.size` 的大字）；logo 块 `color.bg.surface` 底 + `color.text.selected` | 表单卡宽 `layout.modal.width.sm`；手机收成单栏 |
| 优惠券券面（配方 `.coupon`） | 面额块是品牌面 `color.bg.brand`；已结束 / 过期 / 草稿（`.is-off`）改 `color.bg.subtle` | 面额 `text.display.family` × `text.heading.size`、门槛小号字，都用 `color.text.on-brand`；失效券 `color.text.muted` | 卡片边线 `color.border.default`，圆角 `radius.lg`；面额块宽 `illustration.size.md` |
| 图表 | 面积 `color.chart.area`（渐隐）；悬停竖条 `color.chart.area`；提示气泡 `color.chart.tooltip`（白底浮层） | 轴与图例 `color.text.secondary`；气泡 `color.text.primary` | 气泡 `color.border.default` 细边 + `elevation.tooltip.*` 大投影、圆角 `radius.md`；分类 `color.chart.1…6`，顺序 `color.chart.sequential.*`，涨跌 `color.data.*`；柱子起点直角、末端 `radius.xs` 圆角，堆叠只圆最外一段；柱子渐变下深上浅（横柱左深右浅，负值柱基线一端深）：品牌金 `color.chart.gradient.start` → `color.chart.gradient.end`，其他颜色同色饱和度渐变（浅端饱和度 × `chart.gradient.saturation`） |

## 页面状态与权限

每块取数的区域都有加载、空、出错、正常四态，样式全部来自配方，页面只决定文案。

- 加载：骨架屏占住最终形状（表格用 `TableSkeleton` / `.tskel`，列宽与真实表格一致），加载完成不跳版；不用转圈盖住整块，也不用禁用态假装加载。按钮自己的提交中用按钮的 loading，不压淡。
- 空：插图 + 一句说明 + 至多一个主操作（`.empty`）。说明讲原因和下一步；筛选后没有结果时，操作是「清空筛选」而不是新建。
- 出错：区域内的错误条（`.error-box`，`color.status.error` 成对，写清原因，右侧「重试」），页头与筛选栏保留，不整页跳走；只有整页级失败（500、网络断开）才用结果页 `.result`。
- 权限分三层：没有权限的菜单与入口直接隐藏，不放禁用的菜单项；直接访问无权限的地址进 403 结果页（`.result`），给「返回工作台」；同一页面里按角色区分的操作，按钮保持可见但禁用（`opacity.disabled`），悬停出 Tooltip 写明缺哪项权限——禁用按钮不触发悬停，Tooltip 挂在外层包裹元素上。
- 只读角色看表单用只读态（`color.bg.readonly`）并在表单顶部说明原因，不用禁用态。
- 模块还没上线（建设中）：整页结果状态 `.result`（插图 + 「某某正在建设中」+ 去处），和 403 / 404 一样不加页头 H1——模块名已经在面包屑和结果标题里，再加一个只是重复。

## 交互与无障碍

- 动效三档：即时反馈用 `motion.duration.fast` + `motion.easing.standard`；浮层出现用 `motion.duration.normal` + `motion.easing.enter`；弹窗 / 抽屉用 `motion.duration.slow`，退场用 `motion.easing.exit`。系统开启「减少动态效果」时所有时长视为 0。
- 焦点必须可见：按钮、链接、菜单项这类用焦点环 `color.focus.ring` × `focus.ring.width`；输入类控件聚焦只把边线换成 `color.border.focus`，不加环。
- 禁用态用 `opacity.disabled` 统一表达，不另造一套灰。
- 图标类控件必须有可访问名称，命中区不小于 `control.hit-min`，触屏下不小于 `control.hit-touch`。
- 对比度底线见「验收基线」，检查时连底色一起算。

## 验收基线

- **对比度**：正文与小字 ≥ 4.5:1，大字与图标 ≥ 3:1，连底色一起算；亮 / 暗两种模式都要过。`check-contrast.mjs` 的报告见 `AUDIT.md` 与 `contrast.md`。
- **已批准的例外**：
  - 填充式输入框的静息边线 `color.border.input` 对卡片（亮 / 暗）——用户选择 Ant Design Pro v6 原样的填充式，输入框靠 `color.bg.input` 与卡片区分；回补路径：改回描边式时把 `color.border.input` 指向 `color.border.strong` 同档。
  - 卡片 / 分隔线 `color.border.default` 对页面底（亮色）——用户指定很浅的半透明黑边线（2026-10-09），卡片靠白底与页面底的底色差定形，边线只做轻提示；回补路径：把 `color.border.default` 指回 `color.neutral.300`（与控件描边同档，过 1.3 底线）。暗色边线不受影响。
  - 金底白字：`color.text.on-primary` / `color.text.on-brand` 对 `color.action.primary`（亮 / 暗），以及亮色侧栏当前项 `color.text.sidebar-selected` 对 `color.bg.sidebar-selected`——都低于正文 4.5 底线（主按钮之外，分页当前页、日期选中日、主色徽标、深色 / 勾选标签、优惠券券面也是这一对）；用户指定金底放白字（2026-10-09，深字显脏）。勾选标记这类图形对金底刚好过 3:1。回补路径：文字改回 `color.neutral.900`（深字），或把金底压深到 `color.brand.600` 一档（白字可过 4.5）；侧栏当前项也可恢复奶油金底配深金字。暗色侧栏当前项不受影响。
  - 暗色链接 / 文字按钮压在悬停行与气泡上（`color.text.link` 对悬停后的底，约 4.3:1）——用户 2026-10-09 决定保持暗色链接色；回补路径：暗色 `color.text.link` 改指 `color.brand.300`（约 6.1:1）。
- **可访问名称**：所有按钮、链接、菜单项有名称；图片有 alt。
- **溢出与截断**：任何模式、任何页面无横向溢出；nowrap 文字无截断。
- **键盘焦点**：Tab 遍历每个可聚焦元素都能看出焦点：按钮、链接、菜单项有焦点环，输入类控件边线变成 `color.border.focus`。
- **金色位置**：玫瑰金只出现在本文写明的位置——主按钮、勾选 / 开关选中、进度、滑块、评分、页签选中、侧栏当前项、当前页码、选中日与选中项、步骤与时间线的当前 / 已完成、主色徽标与深色 / 勾选标签、筹码、链接与选中文字、头像、结果页 / 空状态的双色插图、图表、登录页品牌区、优惠券券面（配方 `.coupon`）。欢迎横幅也可以用品牌面，但没有配方，项目用到时把它的选择器写进 `BRAND_ALLOW`。悬停与聚焦不新引入金色，例外只有两种：焦点环与输入类控件的聚焦边线（`color.focus.ring` / `color.border.focus`），以及静息是正文色的链接（面包屑、标题链接、默认 `el-link`）悬停显出 `color.text.link-hover`。验收工具按身份文件 `design-system.json` 的 `accept.brand` 检查（判色范围与选择器清单是本条的镜像）；项目自己的合法位置写进 `accept.config.mjs` 的 `BRAND_ALLOW` 并写理由。
- **与视觉基准一致**：同类页面与组件的尺寸、内边距、字号、颜色、边线、圆角与效果预览一致；效果预览里有、种子里没有的组件样式（预览自带的参考实现），项目用到时先提案移进配方，不在项目里照着预览另写一套。
- **构建一致性**：steward `validate-system` / `build-tokens` / `guard` 三绿。

## Do / Don't

- Do：在实现前说明所选 Semantic token 表达的意图。
- Don't：为了赶工新增未命名的色值、间距、圆角或字体尺寸。
- Don't：把日常文案、数据或图片内容更新当作设计系统变更。
- Do：新增、跨页面复用或修订视觉决定前，先提出 Token／Scope／Theme／组件例外提案。
- Don't：在金底上放深字（用户 2026-10-09 决定金底放白字），或用主色 `color.action.primary` 直接当文字色——文字用 `color.text.link` / `color.text.selected` 这类深一档的角色。
- Don't：在一个区域里并排放两个主按钮；也不要用金色表达警示，警示是橙色。
- Don't：给侧栏当前项加指示条或加粗——只用底块与文字色表达（亮色主色底白字，暗色金色暗底亮金字）；批量条这类小面积选中仍是中性浅灰（筹码例外，用 `color.bg.chip` 金色浅底）。
- Don't：在图表里引入金、灰、绿以外的彩色；状态色只给状态，不当分类色。
- Don't：把描边加粗到发丝线以上——焦点环、出错态与指示条是仅有的例外；输入框聚焦也只换颜色、不加粗。
