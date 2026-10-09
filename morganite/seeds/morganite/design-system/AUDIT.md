# 设计系统审计记录 · Morganite 玫瑰金

> 由 web-to-design-system 生成、提炼后逐项核对。记录这套系统从哪里来、哪些是实测、哪些是推断、哪些是用户拍板的品牌决定；`DESIGN.md` 只写意图，`tokens/` 只写值，证据与决定都在这里。旧规范不会被此流程覆盖或删除。

## 本次决策

- 视觉底座：Ant Design Pro v6（antd 6.x + ProComponents 3.x），2026-09-28 按「当下成熟的后台系统」调研后由用户选定；调研对比见会话里的底座调研画布。
- 来源页面：https://preview.pro.ant.design/dashboard/analysis、https://preview.pro.ant.design/list/table-list、https://preview.pro.ant.design/form/basic-form，另加查询表格里手动打开的新建弹窗与详情抽屉。
- 取证方式：agent-browser 在真实渲染页面里读取计算样式、样式表规则、根变量与交互状态（桌面 1440×900；另加窄屏 / 手机视口的排版与布局探针）；不以截图为主证据。脚本够不到的状态手动补测，用 extract-evidence 的同一段探针、不刷新页面：
  - 暗黑：Pro 设置抽屉「整体风格设置 = 暗黑」（界面标注「暗色风格（实验功能）」），设置只存在内存里、刷新即丢，所以手动点选后补测工作台与查询表格。
  - 选中行：查询表格勾选前两行后重测（中后台类型要求表格页有选中行，脚本不点勾选框）。
  - 弹窗 / 抽屉：打开后临时隐藏 `#root`，只测挂在 body 下的浮层层，避免背后表格页重复计数。
- 第二来源（一手文档与源码，补证据缺口）：antd 官方 `https://ant.design/design.md`（v6 默认亮色 token 与组件规格）、ProComponents 3.1.14 `provider/typing/layoutToken.js`（ProLayout 侧栏 / 顶栏默认 token）、Ant Design Pro 源码（趋势组件涨跌色、基础表单 maxWidth、查询表格 labelWidth、SiderMenu 折叠宽）。token 描述里写明了每一项取自哪里。
- 视觉修订（2026-09-29）：用户提供一张预期预览图（ORION 财富管理仪表盘，AI 生成的概念图），当作视觉方向；色值用 Pillow 做像素聚类与元素框取样（29 处），与 token 逐项对照后调整了圆角、描边、阴影、侧栏当前项、卡片标题、KPI 数字、图表配色、涨跌与成功色。预览图里对比度不够的文字（2.3～3.9:1）取同色系更深的一档。
- 取证时间：2026-09-28
- 证据文件：/tmp/morganite-evidence.json（系统临时目录，不随项目提交，2026-10 系统重启后已清空；需要复核时重跑 `extract-evidence.mjs` 并按上面的方式手动补测）
- 确认的权威来源：本目录 `tokens/*.tokens.json`
- 系统类型：中后台（`admin`；用户指定；侧栏 有 · 有表格的页面 4/5 · 单页最多输入框 8 · 单页最多状态徽标 16）
- 品牌族：来源站为 antd 蓝（`#1677ff` / 演示站 `#1890ff`），按用户决定整体替换为玫瑰金（初定 `#AE8A50`，2026-10-09 提亮为 `#B98D44`）
- 首屏模式：light；另一模式：`dark`（delta 64 条）

### 用户决定（2026-09-28）

| 决定 | 用户选择 | 落到哪里 |
| --- | --- | --- |
| 视觉底座 | Ant Design Pro v6 | 全部观察值 |
| 品牌主色 | 自定义 `#AE8A50`（白字 3.21:1、深字 5.14:1 → 金底放深字）；2026-10-09 提亮为 `#B98D44`，同日改为金底放白字，见下 | `color.brand.*`、`color.action.primary*`、`color.text.on-primary`、链接 / 选中 / 焦点取深一档 |
| 中性色 | 纯灰，沿用 antd | `color.neutral.*`（半透明黑 / 白叠加） |
| 暗色 | 纳管亮 / 暗两套 | `themes/dark/`（64 条 delta） |
| 状态色 | 沿用 antd 功能色，压深到文字可读 | `color.status.*`；警示改用 antd 橙色系避开品牌金（2026-10-09 用户确认保持） |
| 输入框 | 填充式（Pro v6 演示站原样） | `color.bg.input`、`color.border.input`（透明） |
| 卡片边线 | 加深到过对页面底 1.3 的底线（表格行线随之变深），不登记例外（2026-10-09 被替代，见「卡片（2026-10-09）」） | `color.neutral.300` 由观察值加深一级、`color.border.default` / `-strong` 同值；暗色 `color.neutral.800` |
| 侧栏（2026-09-29） | 保留宽侧栏；当前项改成奶油金底 + 深金字（预期预览图；亮色当前项 2026-10-09 改为主色底块白字，见下） | `color.bg.sidebar-selected` → `color.brand.50`、`color.text.sidebar-selected` → `color.brand.600`；暗色同一逻辑：金色暗底 + 亮金字；去掉 Citrine 桥接里的左侧指示条与加粗 |
| 描边（2026-09-29） | 保持加深后的边线色，全站描边统一为 0.6px | `border.width.thin` → 0.6px（`border.width.default` / `-control` 随之）；焦点环、出错态 1px、页签墨条与指示条不变 |
| 涨跌（2026-09-29） | 绿涨红跌（预期预览图） | `color.data.increase` → 祖母绿、`color.data.decrease` → 红 |
| 玻璃模式（2026-09-29） | 不做 | 不建 Theme，表面保持实心 |
| 主色提亮（2026-10-09） | 原主色发脏，提高饱和度与明度：选方案 A `#B98D44`（HSB 饱和度 54% → 63%、明度 68% → 73%），明度停在主色对白底 3:1 以内，不登记例外；更亮的两档 `#C59543` / `#D19B3C` 对白底只有 2.71 / 2.48，未采用 | `color.brand.*` 11 阶 + 两档半透明；色阶按原色阶在 OKLCH 里的位置推导（色相随主色，彩度随主色放大、深阶按平方根，浅底与深阶明度不变），对比度：深字 5.46:1、对白底 3.02:1、链接 5.27:1、侧栏深金字 4.81:1、暗色链接 6.1:1 |
| 卡片（2026-10-09） | 去掉大卡片的投影；卡片 / 分隔线描边改为 `#000` 的 6% 阶梯，替代 2026-09-28「卡片边线加深过 1.3、不登记例外」与 2026-09-29「卡片阴影更大更柔」 | `elevation.card.color` → `color.neutral.transparent`（亮 / 暗一起）；`color.border.default` → `color.neutral.black-a6`（对页面底 1.13:1，登记例外）；控件描边 `color.border.strong` 保持 `color.neutral.300`；暗色边线不变（`color.neutral.800`）。借用卡片阴影的分段器选中块、shadcn 小阴影、吸底表单栏一起变平 |
| 侧栏宽度（2026-10-09） | 侧栏内容不多、空间冗余，收窄 | `size.sidebar` 256px → 208px（`layout.sidebar.width` 随之，手机抽屉同宽）；208 是 Ant Design Pro 早期默认 siderWidth，正好放下现有最宽的侧栏内容（预览页 207px）；折叠宽 64px 不变 |
| 侧栏当前项（2026-10-09） | 亮色改为主色底块 + 白字白图标；暗色保持金色暗底 + 亮金字 | `color.bg.sidebar-selected` → `color.brand.500`、`color.text.sidebar-selected` → `color.white`（图标随文字色）；白字对主色 3.02:1，低于 14px 文字的 4.5，登记例外；暗色覆写不动；`color.brand.50` 只剩强调徽标、Element 主色浅底（经 `color.bg.selected-subtle`）与 two-tone 图标填充在用 |
| 金底文字（2026-10-09） | 主色按钮上改放白字（深字显脏） | `color.text.on-primary` → `color.white`（主按钮、分页当前页、步骤当前步、勾选标记、logo 底块、确认条主按钮，亮暗一致），`color.text.on-brand` 同步改白；白字对主色 3.02:1，低于 4.5，登记例外；悬停改为加深 `color.brand.550`（白字 3.31:1，原来变浅到 `#C4A56D` 只有 2.35:1），按下 `color.brand.600`（5.27:1） |
| 侧栏底色（2026-10-09） | 亮色纯白、暗色纯黑 | 亮色 `color.bg.sidebar` → `color.white`（原为 ProLayout 侧栏透明、透出页面底 `#f5f5f5`），与顶栏、卡片同色；暗色本来就是 `color.black`，来源由推断改为用户决定；侧栏文字在白底上对比度更高（次要文字 5.33:1） |
| 输入框焦点（2026-10-09） | 聚焦不要加粗描边，只把描边加深 | 输入类控件（输入框、搜索、选择器、日期、文本域）聚焦只把边线换成 `color.border.focus`，线宽与悬停相同（`border.width.default`），去掉 `color.focus.ring` 外环；按钮、链接、菜单项的键盘焦点环不变。改在 `base.css`（原生输入框）、`element-plus.css`（原为 1px 内阴影 + 外环，文本域另有 2px 键盘焦点内描边）、`shadcn.css`（输入 / 文本域 / 选择器触发器不出环）与效果页搜索框 |
| 数据填充渐变（2026-10-09） | 柱状图、进度条等改为渐变色，起始点到终止点由浅到深；随后改为饱和度渐变（不用明度渐变），柱状图上面亮、下面深 | 同日修正为饱和度渐变、柱子上浅下深：新增 `chart.gradient.saturation`（数值借 `{opacity.40}`，推断）：HSB 明度不变，浅端饱和度降到原色 × 0.4；竖柱上浅下深、横柱右浅左深，进度条左浅右深；中性灰没有饱和度，保持实色。落在 `element-plus.css` 进度条（含成功 / 异常 / 警示 / is-muted）、`echarts.js`（新增 `barGradient`，`rankBars` 改用渐变）与效果预览的柱状图、进度条；环形图、图例色块、滑块保持实色 |
| 表格选中行（2026-10-09） | 表格的选中状态底色改为悬停状态色 | 纯 CSS 表格、shadcn 表格、Element 表格的选中行与当前行都改用 `color.bg.hover`；选中行再悬停 `color.bg.selected-hover` 改为中性深一档（亮 6% 黑 / 暗 12% 白，推断），shadcn 补上这条悬停；奶油金 `color.bg.selected-subtle` 保留给强调徽标与 Element 主色浅底 |
| 数字字体（2026-10-09） | 数字数据字体用 D-DIN-PRO | 新增原语 `font.family.numeric`（D-DIN-PRO → D-DIN → Bahnschrift → 正文无衬线；不放只有 Bold 面的 DIN Alternate，免得正文数字全变粗）；`text.display.family` 改指它（统计卡、KPI、`el-statistic`、状态条数字），新增 `text.numeric.family`（表格金额与日期、百分比、涨跌、图表数值：配方 `.num` / `.num-col` / `.stat-card__delta`、Element 表格合计行、ECharts 数值轴与排行榜标签）；单号仍用等宽字体。种子不分发字体文件；D-DIN-PRO 没有等宽数字 |
| 筹码底色（2026-10-09） | 已选条件的 tag 胶囊色为 #8A6530 10% | 新增 `color.bg.chip`（亮色 `color.brand.600-a10`，即筹码字色的同色 10% 浅底，叠在卡片上约 #F3F0EA；暗色按同一规则取亮金 `color.brand.300-a10`，约 #27231C，用户确认），配方 `.chip` 改用它；原用 `color.bg.selected`（4% 黑 / 8% 白）。批量条、图标按钮选中、进度条轨道等其余小面积选中仍是中性浅灰；Element / shadcn 没有筹码组件，`el-tag` 仍是状态标签 |
| 分页当前页（2026-10-09） | 分页当前页统一成金底白字 | 效果预览与 shadcn 分页改为 `color.action.primary` 实底 + `color.text.on-primary` × `text.weight.strong`；Element 带底色分页原本如此，不带底色的分页也改成同样的当前页；DESIGN 配方表同步，不再用 `color.border.current` 边线。白字对主色 3.02:1，与主按钮同一对，沿用已登记的例外 |
| 开关关闭态（2026-10-09） | 保持现状 | 轨道仍用 `color.border.strong`（#D8D8D8），白滑块对轨道约 1.4:1，关闭态靠滑块位置与文字标签区分 |
| 中性标签底（2026-10-09） | 中性标签 / 中性状态胶囊的底改为 6% 黑 | `color.status.neutral-bg` 由 #fafafa 改指 `color.neutral.black-a6`：半透明，压在表格悬停行、表头上仍深一档；Element 默认标签与深色信息标签的边线改为透明，免得与半透明底叠出深一圈；暗色白 8% 不变 |
| Element 选中块（2026-10-09） | 「反转块」按 antd 改主色系 | 本系统 `color.action.selected` 是白块，只留给分段类（`el-segmented`，以及桥接里画成灰轨道内胶囊的单选 / 多选按钮组）；日期选中日（原为白底白字，看不见）、主色徽标、深色标签、勾选标签、引导指示点改为 `color.action.primary` + `color.text.on-primary`；评分填充星改为 `color.action.primary`；树当前节点与拖放目标改为奶金浅底 `color.bg.selected-subtle` + 正文字；表头筛选选中项与下拉选中项同款（`color.bg.selected` + `color.text.selected`）。待测试项目实际渲染核对 |
| 小号数字字体（2026-10-09） | 表格数字退回正文字体，只有数据大字用 D-DIN-PRO | `text.numeric.family` 改指 `font.family.body`（表格金额与日期、百分比、涨跌、图表数值、页码），配 `text.numeric.variant` 等宽数字，金额列小数点重新上下对齐；`text.display.family` 仍是 D-DIN-PRO（统计卡、KPI、`el-statistic`）。原因：D-DIN-PRO 窄体细笔画在 12px 下显得小而轻 |
| 暗色筹码底（2026-10-09） | 保持亮金 10% | `color.bg.chip` 的暗色值 `color.brand.300-a10` 由推断改为确认 |
| 推断值确认（2026-10-09） | 89 条 `[推断]` 按组确认 | 亮色 56 个语义角色、暗色 33 个值全部改为 `[确认]`，值不变（被它们引用的 41 个原语一起改）；单独问过的 6 项都保持：警示橙、成功祖母绿、弱化文字 58% 黑、占位符 45% 黑、最小字号 12px、勾选框边线 0.6px（说明由「1px」更正） |
| 验收工具（2026-10-09） | 沿用 citrine-accept，写一份 Morganite 的验收清单 | 身份文件加 `accept`（`@wycm9527/citrine-tools` · `citrine-accept all` · `templates/accept.config.mjs`）；citrine-accept 新增项目可配的 `APPROVED_CONTRAST`（Citrine 的内置例外不变），组件走查的背景改为逐层合成（修掉半透明叠底被算成纯黑 / 纯白的误报）；`morganite/testbed/element-lab` 跑 pages / components / narrow / focus |
| 暗色链接与表格文字按钮悬停（2026-10-09） | 都保持现状 | 验收报出暗色链接 / 文字按钮在悬停行与气泡上约 4.3:1、亮色表格文字按钮悬停叠底后约 4.2–4.4:1，登记为例外（DESIGN「已批准的例外」，验收清单 `minRatio: 4.2`）；暗色选中行再悬停时文字按钮只有 3.41:1，比决定时给的数字低，另行确认 |
| 发版「最新」标记（2026-10-09） | 发版脚本只让 Citrine 标为最新 | Morganite 0.1.0 发版时成了 GitHub「最新」，README / GUIDE 里 `releases/latest/download` 的 citrine-tools 直链随之 404，已手动把 Citrine 2.12.0 改回最新；`scripts/release.mjs` 对 Citrine 以外的系统加 `--latest=false` |
| 按预期预览图默认调整（2026-09-29，列出后用户未反对） | 圆角加大、卡片标题字距小标题、KPI 数字半粗、图表配色只用金 + 灰 + 绿、图表提示气泡深金底、表头底深一档、卡片阴影更大更柔（2026-10-09 去掉）、顶栏搜索胶囊 | `radius.md / lg / xl`、`text.tracking.caps`、`text.display.weight`、`color.chart.*`、`color.chart.tooltip`、`color.bg.subtle`、`elevation.card.*`；配方 `.card-head h2`、`.topbar .search`；ECharts 桥接 |
| 组件库桥接 | 带 Citrine 的 Element Plus / shadcn / 配方 / ECharts 桥接当起点 | `bridge/`，缺口见「桥接缺口」 |
| 预览 | 虚拟页面（工作台 / 表单 / 抽屉 × 亮暗）确认像「Pro + 金色」 | `preview/` |

## 角色覆盖

- 观察（有实测证据）：70 个
- 确认（用户拍板的品牌决定，含按预期预览图的调整与 2026-10-09 按组确认的原推断值）：108 个
- 推断：0 个——原有 56 个按 antd 规格或规则补的默认值，2026-10-09 用户按组确认，前缀已改为 `[确认]`（下表留作来源追溯）
- 必须处理的缺口（按系统类型）：0 个
- 可选角色未填：3 个——这个系统类型不要求、本次也没证据；有证据再填，不发明值
- 词表外的语义名：20 个，全部来自 Citrine 桥接的扩展（`text.display.family`、`text.link.style`、`text.weight.logo`、`avatar.size.sm / md`、`control.hit-touch`、`control.segmented-inset`、`icon.size.2xl`、`illustration.size.md`、`layout.search.width`、`opacity.on-primary-muted`、`color.chart.sequential.1…5`，以及本系统新增的 `color.chart.tooltip`、`chart.gradient.saturation`、`text.numeric.family`、`color.bg.chip`），名字与 Citrine 一致、值按 antd / Pro / 预期预览图

### 推断角色清单

2026-10-09 用户按组确认了下表全部 56 条，值不变；其中警示橙、成功祖母绿、弱化文字 58% 黑、占位符 45% 黑、最小字号 12px、勾选框边线 0.6px 是单独问过、确认保持的。

| 角色 | 别名 | 推断依据 | 确认状态 |
| --- | --- | --- | --- |
| `color.bg.skeleton` | `{color.neutral.black-a6}` | antd Skeleton 底 rgba(0,0,0,0.06) | 已确认 |
| `color.bg.skeleton-highlight` | `{color.neutral.black-a15}` | antd Skeleton 流光 rgba(0,0,0,0.15) | 已确认 |
| `color.bg.readonly` | `{color.neutral.black-a4}` | antd 禁用 / 只读容器底 colorBgContainerDisabled rgba(0,0,0,0.04) | 已确认 |
| `color.bg.mask` | `{color.neutral.white-a50}` | antd Spin 局部加载遮罩：容器底白 50% | 已确认 |
| `color.bg.selected-hover` | `{color.neutral.black-a6}` | 表格选中行已与悬停同色（用户决定），再悬停深一档用 6% 黑；暗色 12% 白 | 已确认 |
| `color.text.muted` | `{color.neutral.black-a58}` | antd 第三档 rgba(0,0,0,0.45) 达不到弱化文字 4.5:1，压到 0.58 | 已确认 |
| `color.text.placeholder` | `{color.neutral.black-a45}` | 演示站占位符 rgba(0,0,0,0.25) 对白 1.84:1（低于占位符底线 3）；改用 antd 第三档 0.45（3.36:1） | 已确认 |
| `color.text.sidebar-muted` | `{color.neutral.black-a58}` | 侧栏分组标题 / 页脚：ProLayout 原值 0.45 压侧栏底 #f5f5f5 只有 3.31:1，与 `color.text.muted` 同取 0.58（5.19:1）；暗色 0.45 → 0.50 白（5.32:1） | 已确认 |
| `color.text.inverse` | `{color.white}` | Tooltip / 反色底上的白字 | 已确认 |
| `color.text.on-danger` | `{color.white}` | 危险按钮白字（对 #cf1322 5.57:1） | 已确认 |
| `color.text.on-overlay` | `{color.neutral.black-a88}` | 遮罩 45% 黑叠在 #f5f5f5 上偏浅（合成 #878787），用正文色 | 已确认 |
| `color.action.secondary-hover` | `{color.neutral.black-a4}` | 次要按钮悬停底 rgba(0,0,0,0.04)（悬停探针）；antd 描边按钮悬停改的是边线与文字色，桥接用底色表达 | 已确认 |
| `color.status.success` | `{color.emerald.700}` | 成功与「涨」统一成预期预览图的祖母绿（对浅底 4.6:1）；原为 antd green-8 #237804 | 已确认 |
| `color.status.success-bg` | `{color.emerald.50}` | 成功浅底（与涨同一绿） | 已确认 |
| `color.status.warning` | `{color.orange.8}` | antd orange-8 #ad4e00（对浅底 5.09:1）；antd 默认警示 gold 与品牌金同色相，改用橙色系 | 已确认 |
| `color.status.warning-bg` | `{color.orange.1}` | antd orange-1 #fff7e6 | 已确认 |
| `color.status.neutral` | `{color.neutral.black-a65}` | 中性状态文字借用次要文字 0.65 | 已确认 |
| `color.control.knob` | `{color.white}` | 开关滑块白色（antd Switch handle） | 已确认 |
| `color.chart.area` | `{color.brand.500-a16}` | 面积填充：品牌金 16% | 已确认 |
| `color.chart.sequential.1` | `{color.neutral.200}` | 顺序色：四档灰 + 品牌金封顶（与 Citrine 用法一致），按离散分段使用 | 已确认 |
| `color.chart.sequential.2` | `{color.neutral.300}` | 顺序色第二档（排行榜非前三名） | 已确认 |
| `color.chart.sequential.3` | `{color.neutral.500}` | 顺序色第三档 | 已确认 |
| `color.chart.sequential.4` | `{color.cat.charcoal}` | 顺序色第四档 | 已确认 |
| `color.chart.sequential.5` | `{color.brand.500}` | 顺序色封顶：品牌金（排行榜前三名） | 已确认 |
| `color.data.inactive` | `{color.neutral.black-a25}` | 已结束的进度条用禁用色 rgba(0,0,0,0.25) | 已确认 |
| `border.width.control` | `{border.width.thin}` | 勾选框 / 单选框边线 1px | 已确认 |
| `border.width.active` | `{border.width.bold}` | 页签墨条 / 选中下划线 2px | 已确认 |
| `border.width.indicator` | `{border.width.bold}` | 指示条 2px | 已确认 |
| `control.height.lg` | `{size.control.lg}` | 大控件 40px（antd controlHeightLG） | 已确认 |
| `control.hit-min` | `{size.hit-min}` | 图标控件最小命中区 24px | 已确认 |
| `control.hit-touch` | `{size.control.touch}` | 触屏命中区 40px | 已确认 |
| `control.segmented-inset` | `{spacing.0-5}` | 分段选择器内衬 2px（antd Segmented trackPadding） | 已确认 |
| `icon.size.2xl` | `{size.icon.2xl}` | 结果页 / 提示卡大图标 24px | 已确认 |
| `icon.stroke.width` | `{stroke-width.3}` | IconPark 描边 3（与 antd 线性图标比例一致） | 已确认 |
| `space.card` | `{spacing.6}` | antd Card 内边距 24px（design.md）；演示站数据卡为 20px 24px | 已确认 |
| `text.caption.size` | `{font.size.sm}` | 最小字号 12px（国内中后台下限 / antd fontSizeSM）；演示站 11px 只见于页脚版本号等 8 处 | 已确认 |
| `text.heading.size` | `{font.size.2xl}` | 页头大标题 24px（antd headline-md） | 已确认 |
| `text.heading.line-height` | `{font.line-height.heading}` | 32 / 24 | 已确认 |
| `text.display.line-height` | `{font.line-height.display}` | 38 / 30 | 已确认 |
| `text.display.tracking` | `{font.letter-spacing.none}` | 数据大字不调字距 | 已确认 |
| `text.hero.size` | `{font.size.4xl}` | 结果页 / 登录页大字 38px（antd display-lg） | 已确认 |
| `text.hero.line-height` | `{font.line-height.hero}` | 46 / 38 | 已确认 |
| `text.paragraph.line-height` | `{font.line-height.normal}` | 成段说明同正文行高（antd） | 已确认 |
| `text.weight.brand` | `{font.weight.semibold}` | 品牌字重 600（antd 不用 700） | 已确认 |
| `text.numeric.variant` | `{font.numeric.tabular}` | 金额 / 单号 / 统计数字用 tabular-nums | 已确认 |
| `layout.modal.width.sm` | `{size.modal.sm}` | 确认弹窗 416px（antd Modal.confirm） | 已确认 |
| `layout.modal.width.md` | `{size.modal.md}` | 表单弹窗 520px（antd Modal 默认） | 已确认 |
| `layout.search.width` | `{size.search}` | 筛选栏搜索框 216px | 已确认 |
| `motion.easing.exit` | `{easing.exit}` | antd motionEaseIn | 已确认 |
| `opacity.disabled` | `{opacity.40}` | 禁用态 0.4（antd 用禁用色，桥接用透明度近似） | 已确认 |
| `opacity.on-primary-muted` | `{opacity.100}` | 金底上的次要文字不压透明度（对比余量不足） | 已确认 |
| `chart.gradient.saturation` | `{opacity.40}` | 柱状图 / 进度条饱和度渐变的浅端：HSB 明度不变，饱和度降到原色 × 0.4（用户决定用饱和度渐变，0.4 是默认值；数值借用 opacity.40） | 已确认 |
| `layer.dropdown` | `{z.1050}` | 下拉 / 气泡 1050（antd：高于弹窗） | 已确认 |
| `avatar.size.sm` | `{size.avatar.sm}` | 小头像 24px | 已确认 |
| `avatar.size.md` | `{size.avatar.md}` | 头像 32px | 已确认 |
| `illustration.size.md` | `{size.illustration}` | 空状态 / 结果页插图 100px | 已确认 |

### 必须处理的缺口

| 角色 | 层 | 含义 | 找证据的位置 | 决定 |
| --- | --- | --- | --- | --- |
| — | | | | 草稿里的 40 个缺口已全部处理：侧栏 9 个取 ProLayout 源码默认值，状态 / 危险 13 个取 antd 色板，图表 / 涨跌 10 个取 Pro 源码与品牌色，尺寸 8 个取 Pro 源码与 antd 规格 |

### 可选角色（未填）

- font：`font.family.heading`（标题与正文同字体栈）
- layout：`layout.container.max-width`（Pro 内容区为流式，不设居中最大宽）、`layout.root.font-size`（不是 vw 缩放的 rem 站点）

## 对比度基线

`check-contrast.mjs --system <本目录>` 的完整报告留档在 `contrast.md`（亮 / 暗各 25 组）。结论：50 组里 45 组通过，5 组低于底线；另有 2 组不在配对里、人工核对：亮色侧栏当前项（不过线，见下表）；筹码文字 `color.text.selected` 对 `color.bg.chip`（半透明底叠在卡片上实测，亮 4.63:1、暗 7.23:1，通过）。6 组不过线的都已登记为例外：

| 模式 | 配对 | 对比 | 底线 | 处置 |
| --- | --- | --- | --- | --- |
| light | 输入框边线 `color.border.input` / 卡片 | 1:1 | 1.3 | 例外：用户选择填充式输入框，静息无边线，靠 `color.bg.input` 区分；回补路径见 DESIGN「已批准的例外」 |
| dark | 输入框边线 `color.border.input` / 卡片 | 1:1 | 1.3 | 同上 |
| light | 卡片边线 `color.border.default` / 页面底 | 1.13:1 | 1.3 | 例外：用户指定 6% 黑（2026-10-09），卡片不投影、靠白底与页面底的底色差定形；回补路径见 DESIGN「已批准的例外」 |
| light | 侧栏当前项文字 / 图标 `color.text.sidebar-selected` / `color.bg.sidebar-selected` | 3.02:1 | 4.5 | 例外：用户指定主色底块白字（2026-10-09）；这一对不在 `check-contrast` 的 50 组配对里，人工核对；回补路径见 DESIGN「已批准的例外」 |
| light | 主按钮文字 `color.text.on-primary` / `color.action.primary` | 3.02:1 | 4.5 | 例外：用户指定金底放白字（2026-10-09，深字显脏）；分页当前页、日期选中日、主色徽标、深色 / 勾选标签也是这一对；回补路径见 DESIGN「已批准的例外」 |
| dark | 主按钮文字 `color.text.on-primary` / `color.action.primary` | 3.02:1 | 4.5 | 同上（主按钮亮暗同值） |

卡片边线对页面底原本不过线（antd 分隔线 `#f0f0f0` 亮色 1.05:1、暗色实测 1.27:1），用户决定加深而不是登记例外：亮色 1.31:1、暗色 1.59:1。2026-10-09 用户改为 6% 黑：亮色降到 1.13:1，登记为例外；暗色不变（1.59:1）。

验收工具（citrine-accept，`morganite/testbed/element-lab`）在悬停态另报出三类：暗色链接 / 文字按钮压在悬停行、气泡上约 4.3:1，亮色表格文字按钮悬停时行悬停与按钮悬停底叠加、深金字约 4.2–4.4:1——用户 2026-10-09 都决定保持，登记为例外（见 DESIGN「已批准的例外」）；暗色表格文字按钮在选中行上再悬停（三层叠底 #414141）金字只有 3.41:1，待确认，验收清单不放行。

为过底线而偏离 antd 原值的角色（原值写在 primitive 描述里）：

- `color.border.strong`：antd 控件描边 `#d9d9d9` 加深一级到 `#d8d8d8`；`color.border.default` 原与它同档，2026-10-09 起改为 6% 黑（不再过底线，见上表例外）；暗色 `color.border.default` 用 antd 暗色 colorBorderSecondary。

- `color.text.muted`：antd 第三档 45% 黑对白 3.36:1 → 58% 黑（5.33:1）；暗色 45% 白 → 50% 白。
- `color.text.sidebar-muted`：ProLayout 分组标题 45% 黑压侧栏底 3.31:1（暗色 45% 白压 #000 4.41:1）→ 与 `color.text.muted` 同值（5.19:1 / 5.32:1）。这一对不在 `check-contrast` 的 50 组配对里，是效果预览页（`morganite/previews/rose-gold-admin/`）逐元素实测时发现的。
- `color.text.placeholder`：演示站 25% 黑对白 1.84:1 → 45% 黑（3.36:1，填充底上 3.27:1）；暗色 25% 白 → 45% 白。
- `color.action.primary-hover` / `-active`：antd 主按钮悬停变浅；本系统金底白字，变浅会让白字更难读（2.35:1），改为悬停加深一点（`#B1863D`，白字 3.31:1）、按下再深一档（`#8A6530`，5.27:1）。
- `color.text.link-hover`、`color.action.danger-hover`：antd 悬停变浅会低于 4.5 → 改为变深。
- `color.action.danger` / `color.text.danger` / `color.status.*`：antd 功能色基准档对白都不到 4.5 → 取同色板更深的档。
- `color.focus.ring`：演示站焦点环 `#91d5ff` 对白 1.7:1 → 品牌金深一档（5.27:1）。
- 预期预览图里对比度不够的文字：侧栏当前项金字 `#ac8c54`（对奶油金底 2.88:1）→ `color.text.sidebar-selected` 深金（4.81:1；2026-10-09 亮色当前项改为主色底块白字，3.02:1，见上表例外）；涨幅绿 `#5ca47c`（对白 2.98:1）→ `color.data.increase`（5.03:1）；图表提示气泡金底白字（3.14:1）→ `color.chart.tooltip` 深金底（5.27:1）；问候语浅灰 `#acacac`（2.27:1）→ 用 `color.text.muted`；侧栏未选中文字 `#848484`（3.37:1）→ 保持 `color.text.sidebar`。

## 未纳管项

- 渐变、复合阴影原式、组件内部几何（对勾位置、滑块位移、圆点直径）不进 Token；接入项目里用 `exemptions.json` 登记并写明理由。
- 页面底渐变：ProLayout 的 bgLayout 是「白 → 页面底色」的纵向渐变，加三张装饰背景图（bgLayoutImgList）；token 只收终点色 `color.bg.page`，渐变与装饰图不纳管。
- 顶栏半透明底：ProLayout 顶栏是 60% 浮层色 + 背景模糊，不在词表里；配方用 `color.bg.surface` 近似。
- 阴影：演示站 5 种阴影只收两套——boxShadowTertiary → `elevation.card.*`，boxShadowSecondary → `elevation.popover.*` 与 `elevation.modal.*`（antd 两者同式）；每套只取第一层；顶栏阴影、抽屉方向阴影、按钮底部 2px 投影（primaryShadow / defaultShadow）不纳管。
- 不在 4px 网格上的间距：按钮左右内边距 15px（46 处）、输入框左右内边距 11px（38 处）是 antd 为 1px 边线预留的历史值（design.md 明确说明），交给组件库自身，不进阶梯；1.5px / 7px / 9px 为图标与徽标内部几何。
- 字体：演示站首位字体 AlibabaSans 是 Ant 的网络字体（CDN 加载）；种子不带字体文件，字体栈用系统字体栈。
- 按钮两字中文自动加空格（「查 询」）是 antd 的 autoInsertSpace 行为，不是字距 token。
- 图表：Pro 的图表由 @ant-design/plots 在 canvas 里绘制，DOM 无颜色证据；`color.chart.2…6` 按预期预览图取样定为深灰 / 浅金 / 中灰 / 浅灰 / 绿。
- 预期预览图的玻璃模式（半透明表面 + 背景模糊 + 背景图）按用户决定不做；3D 环形图不纳管（透视会让比例失真），用平面环形图。
- 0.6px 描边：CSS 不能保证亚像素宽度，1 倍屏上浏览器会画成 1px，高分屏上是一条设备像素细线。

## 桥接缺口

`bridge/` 从 citrine 2.12.0 拷入 21 个文件当起点（`citrine/seeds/brand-yellow-e`）。它把组件库的变量与写死的色表接到语义 token 上，这部分通用；但也带着 Citrine 的品牌决定（hover 不出现品牌色、选中用反转块、状态色只做浅底胶囊、quiet 按钮必须有浅底等）：选中块 2026-10-09 已按 antd 改为主色系，并在 `morganite/testbed/element-lab` 用真实 Element Plus 亮 / 暗走查过（见本节末）。桥接引用的 22 个缺失变量全部**补 token**，另有 ECharts 用模板字符串拼出的顺序色 5 个与新增的提示气泡 1 个（表格最后两行）；`check-bridge-vars.mjs` 复核：缺失 0：

| 桥接引用的变量 | 引用文件 | 决定 |
| --- | --- | --- |
| `--radius-xs` | echarts.js、element-plus.css、recipes.css | 补 token：`radius.xs`，antd 勾选框圆角（与 `radius.sm` 同值） |
| `--text-display-tracking` | base.css、element-plus.css、recipes.css | 补 token：`text.display.tracking` → 不调字距 |
| `--text-numeric-variant` | element-plus.css、recipes.css、vue/KitchenSink.vue | 补 token：`text.numeric.variant` → tabular-nums |
| `--font-weight-medium` | element-plus.css、recipes.css | 补 token：`font.weight.medium`（演示站工作台 h4 实测） |
| `--icon-stroke-width` | iconpark.config.ts、iconpark.css | 补 token：`icon.stroke.width`，与 antd 线性图标笔画比例一致（比 Citrine 细一档） |
| `--spacing-2-5` | element-plus.css、recipes.css | 补 token：`spacing.2-5`（演示站实测） |
| `--spacing-3-5` | element-plus.css、recipes.css | 补 token：`spacing.3-5`（配方步长，演示站无对应值） |
| `--text-display-family` | element-plus.css、recipes.css | 补 token：`text.display.family` → 初为正文字体栈；2026-10-09 用户改为 D-DIN-PRO（`font.family.numeric`） |
| `--text-link-style` | element-plus.css、recipes.css | 补 token：`text.link.style` → normal（不用 Citrine 的斜体） |
| `--avatar-size-md` | recipes.css | 补 token：`avatar.size.md`（antd Avatar default） |
| `--avatar-size-sm` | recipes.css | 补 token：`avatar.size.sm`（antd Avatar small） |
| `--color-action-quiet` | element-plus.css | 补 token：`color.action.quiet` → 透明（antd 文字按钮；与 Citrine「quiet 必须有浅底」不同） |
| `--color-action-quiet-hover` | element-plus.css | 补 token：`color.action.quiet-hover`（悬停探针实测） |
| `--control-hit-touch` | recipes.css | 补 token：`control.hit-touch` → antd 大控件高 |
| `--control-segmented-inset` | element-plus.css | 补 token：`control.segmented-inset`（antd Segmented trackPadding） |
| `--icon-size-2xl` | iconpark.css | 补 token：`icon.size.2xl`（antd 带描述的 Alert 图标） |
| `--illustration-size-md` | recipes.css | 补 token：`illustration.size.md`（antd Empty 插图高） |
| `--layout-search-width` | recipes.css | 补 token：`layout.search.width`（ProForm 宽度档 sm） |
| `--motion-easing-exit` | shadcn.css | 补 token：`motion.easing.exit`（antd motionEaseIn） |
| `--opacity-on-primary-muted` | recipes.css | 补 token：`opacity.on-primary-muted` → 不压透明度（金底白字只有 3.02:1，没有余量） |
| `--size-icon-2xl` | recipes.css | 补 token：`size.icon.2xl` |
| `--text-weight-logo` | recipes.css | 补 token：`text.weight.logo`（演示站 Logo 文字实测） |
| `--color-chart-sequential-1…5` | echarts.js（用模板字符串拼变量名，`check-bridge-vars` 识别不到） | 补 token：`color.chart.sequential.*`，四档灰 + 品牌金封顶（排行柱状图用） |
| `--color-chart-tooltip` | echarts.js（本系统新增） | 补 token：图表提示气泡深金底；读不到时回退 `--color-bg-inverse` |

按预期预览图对桥接的改动（2026-09-29）：删除侧栏当前项的左侧指示条与加粗（recipes.css `.nav a.active::before`、element-plus.css `.el-menu-item.is-active::before`）；统计卡 `.stat-card` 去掉左侧金色描边，与普通卡片同一形态（`StatCard.vue` / `.tsx`、`iconpark.config.ts` 里相应的注释一并改掉）；卡片标题 `.card-head h2` 改成字距小标题；顶栏搜索 `.topbar .search` 改胶囊；ECharts 默认主题名改为 `morganite`、提示气泡读 `--color-chart-tooltip`、单序列折线显示空心点；验证码输入框悬停描边改走 `--border-width-control`。

效果预览扩成 8 页后对配方的修正（2026-10-09，`morganite/previews/rose-gold-admin/` 逐页走查发现）：`.badge.brand` 原是 Citrine 的「反转块」（`color.action.selected` 底），本系统的 action.selected 是白块，亮色下白底白卡看不见，改为奶金浅底 + 深金字；`.batch` 文字由 `color.text.selected` 改为 DESIGN 写的 `color.text.primary`；纯 CSS 表格补上选中行 `tr.is-selected`（同日改为与悬停同色 `color.bg.hover`，再悬停 `color.bg.selected-hover`）；`.two-col` 只在手机断点里出现、桌面没有定义，补上；「窄屏」媒体查询从 Citrine 的 1366px 改为与 `layout.breakpoint.narrow` 一致的 992px。DESIGN 配方表补「步骤条」「时间线」两行（照 Element 桥接已有实现）。

Element Plus 实测（2026-10-09，`morganite/testbed/element-lab`，逐条记录在它的 FINDINGS.md）：按 adopter「从 0 开始」接入 Element Plus 2.14，用 `KitchenSink.vue` 与一张业务页亮 / 暗核对同日拍板的选中规则，都按预期渲染。修了日期范围中间段的灰带（Element 默认取边线色，改为 `color.bg.selected-subtle`）；模板里残留的 Citrine 说法一并改掉：`notes-element-plus.md` 的选中规则（另补表格数字列用 `class-name="num"`）、`notes-shadcn.md` 与 `shadcn.css` 注释里的控件高度（改为 24 / 32 / 40）、三个样式入口模板注释里的占位符、`KitchenSink.vue` 挂法里的包名、AGENTS 模板里不存在的 `npm run accept`；`package.json` 的打包清单排除预览截图（npm 包从 1.5 MB 降到 143 kB）。

## 风险与待确认

- 推断值已全部确认（2026-10-09）：亮色语义角色与暗色值不再有 `[推断]`；只剩两个原语 `radius.xs`、`spacing.3-5` 仍标 `[推断]`——没有语义角色引用、由桥接直接使用，取值按 antd 勾选框圆角与配方步长。
- 警示色改用橙色系（`color.status.warning*`）是为避开品牌金做的偏离，用户 2026-10-09 确认保持。
- 暗色证据来自 Pro 的「暗色风格（实验功能）」，只测了工作台与查询表格；表单、弹窗、抽屉的暗色值按 antd 暗色算法推断（2026-10-09 用户已确认）。
- 覆盖盲区：只取了工作台 / 查询表格 / 基础表单 / 新建弹窗 / 详情抽屉；登录页、分步表单、结果页、空状态、通知、上传、步骤条没有取证，相关角色（`text.hero.*`、`illustration.size.md`、`icon.size.2xl` 等）按 antd 规格取值（2026-10-09 已确认，但没在这些页面上取证）。
- 桥接沿用 Citrine 的实现：Element Plus 栈的 extra 带 IconPark 桥接，而本系统图标库登记为 `@ant-design/icons`，接入前决定用哪套图标；桥接里其他 Citrine 式的组件习惯（操作胶囊等配方）还没按 antd 的做法逐个走查（选中块已改，见用户决定表）。
- 开关关闭态：用户决定保持 `color.border.strong` 轨道（2026-10-09），白滑块对轨道约 1.4:1，关闭态主要靠滑块位置与文字标签区分；若在低对比屏上看不清，改指 `color.data.inactive`（25% 黑，antd 原值）即可。
- Element 选中块已在实测项目里亮 / 暗核对（日期面板、徽标、标签、评分、树、两种分页）；引导指示点、表头单选筛选、树拖放目标没有在真实组件里看过。分段类（单选 / 多选按钮组、`el-segmented`）当前项是灰轨道上的白块，亮色下对轨道约 1.09:1，主要靠字重与字色区分。
- 验收工具沿用 Citrine 的 citrine-accept（身份文件 `accept`、清单模板 `templates/accept.config.mjs`）：Morganite 的例外靠 `APPROVED_CONTRAST`，要 citrine-tools ≥ 1.2.0——仓库内已生效，npm 上的 1.2.0 随 Citrine 下次发版。品牌黄审计对 Morganite 的金不生效（工具判黄范围是色相 40–64°、饱和度 ≥ 0.55），金色用错位置不会被自动发现。
- 暗色表格文字按钮在选中行上再悬停只有 3.41:1（选中行底 + 行悬停 + 按钮悬停三层叠加），待确认：可改暗色链接色、去掉表格里文字按钮的悬停底，或登记为例外。
- `.stat-strip` 自带 `margin-bottom`，放进带 gap 的内容区会和 gap 叠成双倍间距（效果预览里单独抵消了）。
- 词表外的 11 个语义名跟随 Citrine 桥接，若词表以后收编或改名，需要同步。
- 成功色 `color.status.success*` 与「涨」统一成同一种祖母绿，用户 2026-10-09 确认保持；若要回到 antd 的绿，改回 antd green 色板即可。
- 视觉已偏离 Ant Design Pro 原样：圆角、描边宽、侧栏当前项、卡片标题、图表配色按预期预览图改过，卡片按用户决定不投影；交互结构、密度与控件尺寸仍是 antd。
- 0.6px 描边在 1 倍屏上是 1px（见「未纳管项」）；需要在高分屏与普通屏各看一眼。
- 数字字体 D-DIN-PRO 不是系统字体，种子不带字体文件：没装的机器退到 D-DIN / Bahnschrift / 正文字体，各端数字字形可能不同；要一致需项目自行托管（先确认授权）。它没有等宽数字，所以只用在数据大字上（并排的 KPI 数字宽度会随数值变化）。
- 输入框聚焦只靠边线变深和光标：满足 WCAG 2.4.7（AA）「焦点可见」，达不到 2.4.13（AAA）对焦点外观的面积要求；若要过 AAA，给输入类控件恢复外环即可。
- 卡片边线很浅（亮色对页面底 1.13:1，已登记例外）且不投影：卡片主要靠白底与页面底的底色差分辨，低对比度显示器或强光下卡片边界可能看不清；在普通屏上看一眼，不行就按 DESIGN 的回补路径退回。
- 取证警告：品牌族按用户决定替换，派生色阶最初由 @ant-design/colors 生成后按对比度校正（antd 算法对低饱和种子生成的浅档偏灰，浅底改为与白按比例混合）；2026-10-09 主色提亮后，按原色阶在 OKLCH 里的位置重推。
- 取证警告：层级顺序沿用 antd：下拉高于弹窗，全局提示在两者之间，与 Citrine 的「下拉 < 弹窗 < 提示」不同。

## 后续治理

- 日常文案、数据或图片内容更新不改变设计系统。
- 新增、跨页面复用或修订视觉决定时，先记录提案和用户选择；一次性差异先标为 Drift 或试验。
- 本记录写完后运行 steward：`validate-system` → `build-tokens` → `guard`，三绿再接入。
