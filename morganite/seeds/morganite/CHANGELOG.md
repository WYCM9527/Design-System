# Changelog

版本策略：patch 只改描述与文档；minor 新增或修改 token（视觉会变、名字不变，条目里写清肉眼可见的影响）；major 才改名或删除 token。

## 0.2.0 — 2026-10-12

- 数据填充渐变换成用户指定的两色（`linear-gradient(90deg, #B1863D 0%, hsl(37.3228deg 59.5252% 61.7469%) 100%)`）：
  - 新增 token：原语 `color.brand.250`（`#D8AC63`，用户给的 hsl 按 8 位 sRGB 取整）；语义 `color.chart.gradient.start`（→ `color.brand.550`，`#B1863D`，与主按钮悬停同色）与 `color.chart.gradient.end`（→ `color.brand.250`），亮暗一致。
  - 肉眼可见：品牌金进度条（Element `el-progress` 默认色、配方 `.goals`）从灰调的深金（左 `#8A7B66` → 右 `#8A6530`）换成更亮的金，并翻成左深右浅（左 `#B1863D` → 右 `#D8AC63`）；品牌金柱子（ECharts `barGradient`、`rankBars` 前三名、效果预览工作台柱状图）底端 `#B1863D`、顶端 `#D8AC63`，原来是底 `#B98D44`、顶端发灰的 `#B9A78A`。
  - 方向统一为起点深、末端浅（用户最初说的是「起始点到终止点的深浅渐变」，原记录的进度条左浅右深是误记）：成功 / 异常 / 警示 / 已结束（`is-muted`）进度条与目标进度的中性序列也翻成左深右浅，仍是同色饱和度渐变；柱子仍是下深上浅，横柱仍是左深右浅。
  - 进度条在条内显示百分比（`text-inside`）时改实色 `color.action.primary-active`：百分比贴在填充末端，白字对浅端 `#D8AC63` 只有约 2.1:1，实色上 5.27:1。
  - `chart.gradient.saturation` 只管品牌金以外的颜色；`echarts.js` 的 `chartTokens()` 多返回 `gradientStart` / `gradientEnd`，`barGradient` 按传入的颜色认出品牌金（`chart.1` 或顺序色封顶）。
- 图表提示气泡改为白底浮层 + 大投影（用户：hover 浮窗用白色底 + 大投影）：
  - `color.chart.tooltip` 由深金 `color.brand.600` 改为 `color.white`，暗色新增覆写为浮层色 `color.neutral.900`（同 `color.bg.elevated`）；新增第四层阴影 `elevation.tooltip.*`（原语 `shadow.y.3` 12px、`shadow.blur.3` 32px、`color.neutral.shadow-a12`），比下拉 / 弹窗的 `elevation.popover.*` 大一档。
  - 肉眼可见：所有 ECharts 图表（`echarts.js` 主题）的悬停提示从深金底白字变成白底正文色字，加 `color.border.default` 细边、圆角 `radius.md` 与 0 12px 32px 的 12% 黑投影，内边距 8 × 12px（原 6 × 10px）；效果预览工作台折线的提示同样改。Element 的文字 Tooltip（图标、禁用按钮上的深底白字小气泡）不变。
  - `chartTokens()` 多返回 `tooltipShadowY` / `tooltipShadowBlur` / `tooltipShadowColor` / `tooltipRadius` / `tooltipPadding`；`tooltipBg` 读不到时回退 `--color-bg-elevated`（原 `--color-bg-inverse`）。
  - 主题的提示框挂到 body（`tooltip.appendTo: 'body'`，同 Element 浮层）：`el-card` 是 `overflow: hidden`，靠卡片边的气泡和投影原先会被裁掉（环形图实测裁掉 27px）。页面若自己给图表设了 `tooltip.appendTo` 会覆盖这条。
- 曲线图的底线改为 0.6px 虚线（用户：曲线图的底线用 0.6px 虚线）：
  - 新增 `chart.baseline.dash`（4px，借 `spacing.1`）：线段与间隔各 4px，线宽 `border.width.default`、颜色 `color.border.default`，同网格线。
  - 肉眼可见：曲线图（`trendLine`、`TrendChart`）最底下那条线从两条叠画的 1px 实线（比其他网格线深）变成一条发丝细的虚线；效果预览工作台折线图同改，底线画在基准面积之后。柱状图的基线仍是实线。
  - ECharts 主题的轴线、网格线和提示气泡的细边从 1px 改为 `border.width.default`（0.6px），按 DESIGN「宽度统一是发丝细线」，与效果预览一致：所有 ECharts 图表的网格线、柱状图基线和气泡边都会变细、变浅一点。
  - `chartTokens()` 多返回 `lineWidth` / `baselineDash`；`trendLine` 可传 `el`（读 token 的元素）。
- 图表悬停改为浅金竖条（用户：悬停的竖向指示线用浅色柱状图，浅金与浅灰实测对比后选浅金）：
  - 肉眼可见：曲线图悬停时不再画竖虚线（商城原为 ECharts 默认的 1px 灰色虚线，效果预览是 0.6px 金色虚线），改为 `color.chart.area`（品牌金 16%，暗色 24%）的竖条盖住悬停的那一格，和柱状图一致。效果预览折线图同改。
  - ECharts 主题的 `tooltip.axisPointer.type` 默认改为 `'shadow'`：所有 `trigger: 'axis'` 的类目轴图表悬停都是这根竖条；时间轴 / 数值轴上竖条会缩成 1px，这类图自己设 `type: 'line'`。
  - `color.chart.area` 的说明补上「也是图表悬停竖条」，值不变。
- 图标描边改为屏幕上的 1.4px，每只图标合并后一次上色（用户：icon 描边粗细改为 1.4px 并合并栅格化，否则有透明度时会有显示 bug）：
  - `icon.stroke.width` 由数值 3（IconPark 48 网格）改为尺寸 1.4px，新增原语 `stroke-width.1-4`；`stroke-width.3` 不再被引用，按版本策略留到下个大版本再删。
  - 新增运行时 `bridge/icon-merge.js`（包导出 `@wycm9527/morganite/icon-merge`）：入口里调一次 `mergeIcons()`，把每只单色 IconPark / lucide 图标的各段描边复制进一个蒙版、用 currentColor 一次画出，之后新渲染或更新的图标自动处理；双色 / 多色图标不处理。不调时描边粗细照样改，但交叠处仍会叠深。Element / shadcn 说明补上这一步。
  - `iconpark.css` 与 `shadcn.css`（lucide）让描边按屏幕粗细画（`vector-effect: non-scaling-stroke`），shadcn 单选的实心圆点保持原样；`iconpark.config.ts` 的 `strokeWidth` 改为 4.8，只在没加载样式时兜底；`@icon-park/svg` 的静态用法改为套一层 `.i-icon`（原先把 `strokeWidth` 传成 `var(--icon-stroke-width)`，token 改成 1.4px 后会被视框缩小）；React 版 `StatCard` 的提示图标补上 lucide 类名。
  - 肉眼可见：IconPark / lucide 图标的线条变粗——14px 图标约 0.9px → 1.4px、16px 约 1px → 1.4px（lucide 16px 约 1.3px → 1.4px），各档尺寸一样粗；灰色图标在线条交叠处（如「首页」图标的底边、搜索图标把手与圆的接缝）不再出现更深的一块。效果预览的图标由 24 网格里的 1.6（16px 上约 1.07px）改为 1.4px，并在源码里合并成一条路径。
- 柱子改为起点直角、末端圆角（用户：柱状图和类似样式应该直角起底、顶部圆角，以及多柱状图叠加问题；多序列三种画法实测对比后选堆叠贴合）：
  - 肉眼可见：所有 ECharts 柱子的底端（横柱的左端）从圆角变成直角，末端仍是 `radius.xs`（4px）圆角；堆叠柱的接缝处不再两边各缺一个圆角，段与段直接相接，只有最外一段是圆的；负值柱圆朝外的一端。效果预览的柱子本来如此，不变；进度条保持胶囊形。
  - `echarts.js` 新增 `withBarEnds(option)` 与 `barEnds(series)`：按每根柱子算端头，跟随 ECharts 的堆叠规则（声明顺序与 `stackOrder`、正负值分开堆、0 值段不算、图例关掉的序列不算）。种子的 EChart 容器（`vue/EChart.vue`、`react/EChart.tsx`）每次 setOption 都套用，图例开关后重算；`rankBars` 改用它。直接 `echarts.init` 的项目自己调 `withBarEnds`，否则只有主题默认的竖柱正值端头。
- 卡片标题改为 14px #212121（用户：卡片标题改为 14px #212121；去掉大写字距、暗色取正文色两项实测对比后确认）：
  - 新增 token：原语 `color.neutral.875`（`#212121`）；语义 `color.text.card-title`（亮 → `color.neutral.875`，暗 → `color.neutral.white-a85`，同暗色正文）。
  - 肉眼可见：配方 `.card-head h2`（工作台、报表、详情、表单等页的卡片标题）从 12px 次要色（65% 黑 / 65% 白）加 0.06em 字距、西文大写，变成 14px 半粗 `#212121`（暗色 85% 白），不加字距、不转大写。带说明的卡片头高度不变；只有标题的卡片头高约 2.7px，与带说明的几乎一样高（效果预览的新建交易、交易详情页因此长 5–8px）。效果预览的卡片标题随配方改。
  - Element 的 `el-card` 标题栏由常规字重的正文色改为同款半粗 `#212121`；shadcn 的 `CardTitle` 由半粗正文色、字号跟外层改为 14px `#212121`；token 预览页的卡片标题同步。看板上方的分区标签 `.section-label` 不变。
- 板块间距收紧（用户：板块间距是否过大，稍微紧凑一些；三种收法实测对比后选定）：
  - `space.stack` 由 24px 改为 16px（`spacing.4`），`space.gutter` 由 40px 改为 24px（`spacing.6`，与卡片内边距 `space.card` 同宽）；没有新增或删除 token。
  - 肉眼可见：所有页面的内容区四周留白（含顶栏左右）由 40px 改为 24px，板块之间（页头与卡片、统计卡、看板、两栏、卡片栅格、走查页卡片）由 24px 改为 16px，登录页的品牌面板与表单区同样收紧；拾光商城工作台在 1620 × 976 下整页短 64px。手机端（≤ 768px）的内容区与顶栏留白（16px）、顶层块间距（12px）不变（配方改为引用 `space.stack`）；叠成单栏的看板卡、统计卡之间同样由 24px 改为 16px，登录页表单区的留白由 40px 改为 24px。

## 0.1.4 — 2026-10-11

- 用完整测试项目 `morganite/testbed/mall-ops`（拾光商城 · 运营后台：Vue 3 + Element Plus，14 页 × 4 角色 × 50 个页面状态）对照效果预览逐角色比对，修正：
  - Element 桥接按 DESIGN 明文与效果预览校正：标签页默认 `color.text.secondary`、选中 `color.text.selected` 且不加粗，尺寸同预览，贴在卡片顶部时缩进 `space.card`；步骤条已完成步改为 `color.border.current` + 深金勾（原为绿色），并纯 CSS 重排成预览的横排（圆点在左、标题后面接细线，手机竖排）；时间线节点空心；提示条、弹窗、抽屉、消息框圆角 `radius.lg`；文字按钮正文色；分页按钮 `control.height.md` + `radius.md`、总数次要色；选择器 `color.bg.input` 填充；单选改外圈 + 圆点；分段 / 单选 / 多选按钮组与 `el-segmented` 改灰轨道 `color.bg.hover`、不描边、选中不加粗；表格正文小号字，贴边表格首尾列让出 `space.card`；面包屑、表单标签、顶栏搜索小号字；侧栏菜单项高 `control.height.md`、图标 `icon.size.lg`；勾选框 / 单选 16、开关 44 × 22 无边线；描述列表标签在上、两列均分；文本域最小 3 倍控件高；表单里的级联 / 日期 / 数字输入撑满；并排按钮不再与容器 gap 叠加；补齐 `base.css` 的标题字号 / 行高 / 字重与按钮继承字体（Element 入口不引 `base.css`，卡片标题原比预览高 3px）；勾选列不再把表头撑高约 6px；侧栏分组标题行高同预览；勾选框与单选按钮组的焦点环立即出现，同预览（Element 把 outline 放进了过渡，环会从 0 长出来）；新增通栏按钮 `.el-button.is-block`。
  - 配方收进效果预览独有的页面形态（用户决定「全部照预览原样」）：`.greet`、`button.user` / `.user-caret`、`.section-label` + `.page-bar`、`.board` + `.panel`、`.two-col`（1 : 1 改为 1.6 : 1）、`.stack`、`.page-head .title-row`、`.legend` + `.c1–.c6`、`.alloc-list`、`.goals`、`.setting`、`.hform` + `.avatar-row`、`.file-row`、`.secondary`、登录页 `.login*`；看板 / 两栏按内容区 880px 的容器查询收成单栏。另收项目里长出来的 `.w-search` / `.w-select` / `.w-date`、`.card-grid`、`.act-group`。效果预览删掉自己的副本、改用配方（前后截图逐像素比对，只有下面三处有意变化）。
  - 头像（配方 `.avatar` 与 `el-avatar`）改为不透明的奶金浅底 `color.bg.selected-subtle` + `color.text.selected`（用户决定），删掉悬停时换底的补丁。
  - 主色不当文字色：登录品牌面上的 logo 块改为 `color.bg.surface` 底 + `color.text.selected`（原为白底主色字 3.0:1）；结果页错误码改为 `color.text.selected`。
  - 骨架屏贴边放在卡片里时首尾列让出 `space.card`；错误条 `.error-box` 圆角 `radius.lg`；上传区的字号与文字色固定为正文、`color.text.secondary`（原随所在容器变化；效果预览里它是表单字段下的 label，被预览自己的标签规则压成 12px，现已排除）；`.content > .stat-strip` 不再与内容区 gap 叠加。
- DESIGN：新增「页面状态与权限」（加载 / 空 / 出错 / 无权限 / 只读，用户决定写进规范）；「布局与响应式」补页面形态配方；配方表补头像、登录页，步骤条写明横排，标签页与分段选择器写明字重。
- 其他修正：开关选中时滑块里的加载图标改为 `color.action.primary-active`（原 `color.text.on-primary` 是白字，压在白滑块上看不见）；shadcn 进度条轨道改为 DESIGN 写的 `color.bg.selected`（原为 `color.border.default`）；IconPark 描边 4 改为 3，与 `icon.stroke.width` 一致；桥接、配方、模板里 Citrine 时期的注释清理。
- 模板：AGENTS 去掉重复的验收条目与已失效的「推断值先确认」；Element 说明补页面形态、Element 用法约定与页面状态；走查页 `KitchenSink.vue` 的 `el-rate` 改传数字、截断演示改为多行省略。adopter 的 `ds.mjs agents` 加 `--name`（标题默认读 package.json 的 name，不再用目录名）；`ds.mjs upgrade` 只合并工作副本 `design-system/`，快照里的桥接 / 模板随快照整体替换（原先本种子 `owned` 含 `bridge/**` 等，升级时会误报几十条「本地删除」冲突）。
- 肉眼可见：Element 项目的表格、面包屑、表单标签小一号，侧栏项变矮、图标变大，标签页 / 步骤条 / 时间线 / 分段选择器换成效果预览的样子，弹窗与提示条圆角变小，头像变成奶金底，两栏详情页左宽右窄；效果预览本身只有头像、登录 logo 与新建交易页的上传区（标题回到正文字号）变化。

## 0.1.3 — 2026-10-10

- 对照效果预览全面检查 shadcn 实测项目（用户发现单据页与预览的交易记录页差很多：表格边距、表单输入框、面包屑、标签等），逐角色比对计算样式后修正：
  - shadcn 桥接：字号映射 `text-sm` 由小号正文改回正文 14px（按钮、输入框、菜单原来都小一号），表格单独保持小号正文，补行高；按钮改为常规字重、图标间距 `spacing.1-5`，带图标时不收窄；输入框 / 文本域 / 下拉改为填充式（原为透明底 + 透明边线，看不出框）；勾选框 / 单选未选时描 `color.border.strong`、开关关闭轨道 `color.border.strong`（原来都是透明，看不见），它们的焦点改为外环。
  - 配方新增分页 `.pagination` / `.page`、中性类别标签 `.tag`、顶栏搜索 `<label class="search">`（原来只在效果预览里，项目只能各写各的；预览改为直接用配方）。
  - 键盘焦点：三处全局外环规则误伤带 tabindex 的输入框（Element 输入框键盘聚焦时出现 2px 粗环，违背「只加深边线」的决定），改为排除 input / textarea / select。
  - 验收清单模板 `FOCUS.inputBorder: true`：输入类控件按边线变成 `color.border.focus`（出错时保持 `color.status.error`）认焦点。
- 肉眼可见：shadcn 项目的按钮与输入框字号变大一号、输入框成为灰色填充块、勾选框与开关看得见；Element 输入框键盘聚焦时不再出现粗环。

## 0.1.2 — 2026-10-09

- shadcn/ui 走查页模板：新增 `templates/KitchenSink.tsx`（从 Citrine 移植，引用 `@wycm9527/morganite/react/*`），身份文件 shadcn 栈登记 `kitchen`；说明与验收清单模板不再写「KITCHEN 先写 null」。
- shadcn 桥接修正（`morganite/testbed/shadcn-lab` 实测发现）：弹窗 / 抽屉面板改为 `color.bg.elevated`（原为页面底，发灰）；描边 / 幽灵按钮按 DESIGN 白底 + `color.border.strong` 描边、悬停只换底、文字保持正文色（原为悬停变深金字），暗色描边不再透明；错误提示条标题用 `color.text.danger`（暗色原为 3.3:1）；Tailwind 的 border / border-* 线宽接到 `border.width.default`（全站 0.6px，原为 1px）。肉眼可见：shadcn 项目的弹窗变白、描边按钮变白底、边线变细。
- 配方：顶栏用户区悬停时头像底换成表面色（两层半透明底叠加时深金字只有 4.4:1）。
- 实测项目 `morganite/testbed/shadcn-lab`：citrine-accept 页面、组件走查、三端、焦点全部通过。
- 表格操作列的描边胶囊 `.act` 用户决定保持（不改成 antd 的纯文字链接）。

## 0.1.1 — 2026-10-09

- 接入验收工具（用户决定沿用 Citrine 的 citrine-accept）：身份文件加 `accept`，新增 `templates/accept.config.mjs`（三端按 992 / 390，已批准的对比度例外写在 `APPROVED_CONTRAST`）；AGENTS 模板与 Element / shadcn 说明写明验收命令。需要 citrine-tools ≥ 1.2.0（仓库内已生效，npm 随 Citrine 下次发版）。
- 桥接修正（验收发现）：Element 输入框前后缀（¥、元、搜索图标）改用 `color.text.muted`（原为占位符色，填充底上 3.3:1）；进度条渐变下垫同色实底，视觉不变、条内白字的底色可被正确读取。肉眼可见：输入框前后缀文字略深。
- 表格里的 Element 文字按钮悬停只变色、不叠底（用户 2026-10-09；原先行悬停与按钮悬停叠加，亮色约 4.2–4.4:1，暗色选中行再悬停只有 3.41:1）。肉眼可见：表格操作按钮悬停时不再出现浅灰底。
- 对比度例外登记（用户 2026-10-09 决定保持暗色链接色）：暗色链接 / 文字按钮压在悬停行与气泡上约 4.3:1。
- 实测项目 `morganite/testbed/element-lab` 跑通 citrine-accept：页面、组件走查、三端、焦点全部通过。

## 0.1.0 — 2026-10-09

- 初版。以 Ant Design Pro v6 为视觉底座（2026-09-28 底座调研后由用户选定），由 web-to-design-system 从 Pro 演示站的工作台、查询表格、基础表单实测提炼，另手动补测暗黑（Pro「暗色风格（实验功能）」）、表格选中行、新建弹窗与详情抽屉；缺口用 antd 官方 `design.md`、ProLayout 源码默认 token 与 Pro 源码补齐。
- 用户决定：品牌主色初定 `#AE8A50`（金底放深字，后改白字；链接 / 选中 / 焦点取深一档；后提亮，见下）、中性色沿用 antd 纯灰、亮 / 暗两套、状态色沿用 antd 功能色并压深到可读（警示改橙色系避开品牌金）、输入框填充式、卡片边线加深到过对比度底线（表格行线随之变深；2026-10-09 改为 6% 黑，见下）。
- 按预期预览图调整（2026-09-29；图为 AI 概念图，按像素取样逐项对照）：保留宽侧栏，当前项改为奶油金底 + 深金字（暗色为金色暗底 + 亮金字；亮色 2026-10-09 改为主色底块白字，见下），去掉 Citrine 桥接里的指示条与加粗；统计卡去掉左侧金色描边；全站描边 0.6px；绿涨红跌；圆角 8 / 12 / 16；卡片标题改为字距小标题；KPI 数字半粗；图表配色只用金 + 灰 + 绿，补顺序色与深金提示气泡；表头底深一档；卡片阴影更大更柔（2026-10-09 去掉）；顶栏搜索改胶囊；成功色统一为与涨同一种祖母绿（2026-10-09 确认）；玻璃模式不做。
- 主色提亮（2026-10-09，原主色发脏）：`#AE8A50` → `#B98D44`，HSB 饱和度 54% → 63%、明度 68% → 73%，明度停在主色对白底 3:1 以内（3.02:1，不登记例外）；整条品牌色阶按新主色重推，浅底与深阶明度不变，链接、侧栏深金字、提示气泡的对比度不变。肉眼可见：主按钮、图表首色、浅金、悬停 / 按下态更干净更亮。
- 卡片去投影、描边改浅（2026-10-09，用户指定）：`elevation.card.color` 取透明（亮 / 暗），借用卡片阴影的分段器选中块、shadcn 小阴影、吸底表单栏一起变平；卡片边、分隔线、表格行线 `color.border.default` 改为 `#000` 的 6% 阶梯（`color.neutral.black-a6`），对页面底 1.13:1，登记为例外；控件描边 `color.border.strong` 保持 `#d8d8d8`，暗色边线不变。肉眼可见：卡片变平，卡片边与表格行线明显变浅。
- 侧栏收窄（2026-10-09，用户指定）：`size.sidebar` 256px → 208px（Ant Design Pro 早期默认 siderWidth，放得下现有最宽的侧栏内容），`layout.sidebar.width` 与手机抽屉同宽随之变化；内容区多出 48px，两栏布局在更窄的窗口也能保持。
- 侧栏当前项（2026-10-09，用户指定）：亮色改为主色底块 + 白字白图标（`color.bg.sidebar-selected` → `color.brand.500`、`color.text.sidebar-selected` → `color.white`），白字对主色 3.02:1，低于 14px 文字的 4.5，登记为例外；暗色保持金色暗底 + 亮金字。肉眼可见：亮色侧栏当前项变成金色实底。
- 金底改放白字（2026-10-09，用户指定：深字显脏）：`color.text.on-primary` / `color.text.on-brand` → 白，主按钮、分页当前页、步骤当前步、勾选标记、logo 底块一起变；白字对主色 3.02:1，低于 4.5，亮 / 暗都登记为例外。主按钮悬停改为加深一点（`color.brand.550`），按下再深一档（`color.brand.600`），因为白字在变浅的金上只有 2.35:1。肉眼可见：主按钮变成金底白字，悬停变深而不是变浅。
- 侧栏底色（2026-10-09，用户指定）：亮色 `color.bg.sidebar` 由透出页面底的 `#f5f5f5` 改为纯白，与顶栏、卡片同色；暗色保持纯黑（取值不变）。肉眼可见：亮色侧栏变白，和浅灰内容区分开。
- 输入框焦点（2026-10-09，用户指定）：输入类控件聚焦只把边线换成 `color.border.focus`，线宽不变、去掉 `focus.ring` 外环（`base.css`、Element、shadcn 桥接与效果页搜索框一起改）；按钮、链接、菜单项的键盘焦点环不变。肉眼可见：搜索框、输入框聚焦时不再出现一圈粗环。
- 配方修正（2026-10-09，效果预览扩成 8 页后逐页走查发现）：`.badge.brand` 亮色下看不见 → 奶金浅底 + 深金字；`.batch` 文字改为 `color.text.primary`（与 DESIGN 一致）；纯 CSS 表格补选中行；补 `.two-col` 桌面定义；「窄屏」媒体查询 1366px → 992px（与 `layout.breakpoint.narrow` 一致，992–1366px 之间统计卡保持四列）。DESIGN 配方表补「步骤条」「时间线」。
- 数据填充渐变（2026-10-09，用户指定）：柱状图、进度条改为同色的饱和度渐变（HSB 明度不变），柱子上浅下深、横柱右浅左深、进度条左浅右深；新增 `chart.gradient.saturation`（浅端饱和度 × 0.4）。Element 进度条（含状态色）改渐变；ECharts 桥接新增 `barGradient(color)`，`rankBars` 改用渐变。中性灰没有饱和度，保持实色。
- 表格选中行（2026-10-09，用户指定）：选中行底色改为与悬停同色 `color.bg.hover`（纯 CSS 表格、shadcn、Element 的勾选行与当前行一起），选中行再悬停改为中性深一档（亮 6% 黑 / 暗 12% 白）；奶油金 `color.bg.selected-subtle` 只留给强调徽标与 Element 主色浅底。肉眼可见：勾选行从奶金变成浅灰。
- 数字字体（2026-10-09，用户指定）：数字数据改用 D-DIN-PRO。新增 `font.family.numeric`（D-DIN-PRO → D-DIN → Bahnschrift → 正文无衬线）与 `text.numeric.family`；`text.display.family` 改指它。配方 `.num`、`.num-col`、`.stat-card__delta`，Element 表格合计行，ECharts 数值轴与排行榜标签一起换；单号仍用等宽字体。种子不分发字体文件；D-DIN-PRO 没有等宽数字，`tabular-nums` 对它不生效。肉眼可见：KPI 与表格数字变成窄体 DIN。
- 筹码底色（2026-10-09，用户指定）：已选条件筹码的底从 4% 黑改为品牌金深一档 #8A6530 的 10%（新增 `color.bg.chip` 与原语 `color.brand.600-a10`），即筹码字色的同色浅底，叠在卡片上约 #F3F0EA、字对底 4.63:1；暗色按同一规则取亮金 #D1AB62 的 10%（用户确认，原语 `color.brand.300-a10`，约 #27231C、7.23:1）。配方 `.chip` 改用它；批量条、图标按钮选中、进度条轨道等其余小面积选中仍是中性浅灰。
- 待定项拍板（2026-10-09，用户决定）：
  - 分页当前页统一成金底白字：效果预览、shadcn 分页、Element 不带底色的分页改为 `color.action.primary` 实底白字（Element 带底色分页原本如此），DESIGN 不再写白底金边。
  - 中性标签 / 中性状态胶囊的底 `color.status.neutral-bg` 由 #fafafa 改为 6% 黑（半透明，悬停行上仍可见）；Element 默认标签与深色信息标签的边线改透明。
  - Element 选中块按 antd 改主色系：日期选中日（原为白底白字，看不见）、主色徽标、深色 / 勾选标签、引导点改金底白字，评分星改金色，树当前节点与拖放目标改奶金浅底，表头筛选选中项同下拉选中项；`color.action.selected` 白块只留给分段类（`el-segmented`、单选 / 多选按钮组、shadcn Tabs）。
  - 小号数字退回正文字体：`text.numeric.family` 改指 `font.family.body`（表格金额与日期、百分比、涨跌、图表数值、页码），配等宽数字；只有数据大字 `text.display.family` 用 D-DIN-PRO。
  - 开关关闭态保持 #D8D8D8 轨道；暗色筹码底亮金 10% 由推断改为确认。
- Element Plus 实测（2026-10-09，`morganite/testbed/element-lab`）：日期范围中间段改为奶金浅底（原为 Element 默认的边线灰）；模板去掉 Citrine 残留——`notes-element-plus.md` 的选中规则与表格数字列用法、`notes-shadcn.md` 与 `shadcn.css` 注释的控件高度 24 / 32 / 40、三个样式入口模板注释里的占位符、`KitchenSink.vue` 挂法的包名、AGENTS 模板不再写不存在的 `npm run accept`；`package.json` 打包清单排除 `design-system/preview/shots` 与 `static`（npm 包 1.5 MB → 143 kB）。
- 推断值确认（2026-10-09，用户按组确认）：亮色 56 个语义角色、暗色 33 个值（连同被引用的 41 个原语）由 `[推断]` 改为 `[确认]`，值不变；警示橙、成功祖母绿、弱化文字 58% 黑、占位符 45% 黑、最小字号 12px、勾选框边线 0.6px 单独确认保持（勾选框边线的说明由「1px」更正）。publish-check 不再需要 `--allow-inferred`。
- 种子预览页（`design-system/preview/`）跟上同日决定：`preview.local.css` 覆盖生成器默认的选中写法——表格选中行与悬停同色、分页当前页金底白字（生成器默认的 `color.action.selected` 白块在本系统是白底白卡）；12 张预览截图重拍（截图不入库）。
- 规模：primitives 164 个；语义角色 178 个（观察 70 / 确认 108 / 推断 0），中后台必须处理的缺口 0；Theme `dark` delta 64 条。
- 桥接：从 citrine 2.12.0 拷入 Element Plus / shadcn / 页面配方 / ECharts 桥接当起点，引用的缺失变量全部补 token（共 28 个：Citrine 桥接引用的 22 个，加 ECharts 顺序色 5 个与图表提示气泡 1 个；其中 17 个语义名在词表外）；组件走查未做。
- 对比度：50 组 45 组通过；填充式输入框的静息边线（亮 / 暗）、亮色卡片边线与主按钮白字（亮 / 暗）登记为例外，亮色侧栏当前项白字（不在配对里，人工核对）也登记为例外，见 DESIGN「验收基线」。侧栏分组标题 `color.text.sidebar-muted` 沿用 ProLayout 的 45% 不达 4.5（不在 50 组配对里，效果预览页实测发现），改为与弱化文字同值（2026-10-09 确认）。风险见 design-system/AUDIT.md。
