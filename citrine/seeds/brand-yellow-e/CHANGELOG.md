# Changelog

版本策略：patch 只改描述与文档，以及让组件库遵守既有规则的桥接修正；minor 新增 token 或改 token 值（视觉会变、名字不变，条目里必须写清肉眼可见的影响）；major 才改名或删除 token，并附兼容 shim。

## 1.1.2 — 2026-09-10（盲测：文档补规则 + 控件高度真正共用）

- **盲测**：让一个没有上下文的编码 Agent 只凭 `AGENTS.md` + DESIGN.md 给实测项目做「退款审核」页（禁止看其他页面源码）。结果：build 通过、guard `current`、色彩与无障碍零违规——文档的硬规则是够用的；但它交出 8 条"不得不猜"，全部变成了规则：
  - 表格操作列的控件形态（quiet 文字按钮 / 内容型链接 / 危险红字 / 「—」占位）；筛选栏是紧凑形态（无可见标签、aria-label、「查询」主按钮 +「重置」quiet）；批量操作条的按钮尺寸与危险按钮；时间线未发生步骤的空心节点色；抽屉内分组标题；骨架行数与行高；分页"唯一黄色"措辞与主按钮的冲突；列宽与筛选控件宽度明确"不是 token"。
  - DESIGN.md 顶部新增「先读这里」十条速查：编码 Agent 只需这一屏 + 配方表，其余章节是理由。
- **桥接（肉眼可见）：控件高度第一次真正共用 `control.height.*`**。Element 只有输入类读 `--el-component-size`，按钮、下拉、级联、取色器、单选、开关、滑杆、评分、表单标签行高、分段器、分页的高度是各尺寸类写死的 32 / 24 / 40——默认密度下按钮 32 比输入框 34 矮 2px，compact 主题对这些组件从未生效。逐条接回 token 后：默认 34 / 28 / 40，compact 28 / 24 / 34，按钮与输入框同高。分页项按配方改为 `control.height.sm`。
- `type="danger"` 的文字 / 链接按钮 = quiet 浅底 + `text.danger` 红字（行内危险操作配方）；朴素危险按钮保持状态成对。用户复核发现「通过 / 拒绝」同色：该规则与通用 `.el-button.is-text`（链接灰）特异性相同且排在前面，被盖掉——提高特异性后修正（教训：同一元素被多条桥接规则命中时，先查层叠顺序再查变量）。
- **新规则：彩色文字不落在灰底上**（用户反馈：浅色下 quiet 灰底 + 红字很突兀）。危险文字按钮改为 error 成对（红字 + `status.error-bg`），hover 加同色发丝边；下拉危险项改用桥接约定类 `is-danger`，hover 底浅红而不是灰。写进 DESIGN 组件原则与速查第 4 条。
- 实测项目补上 `AGENTS.md`（skill 的三行规则 + 项目接线），此前一直缺——普通 Agent 没有入口知道要先读设计系统。

## 1.1.1 — 2026-09-10（走查页目检补正：禁用与加载态）

- 主按钮禁用态此前被 Element 的 `primary-light-5` 换成一块边线灰，看起来像次要按钮；按规则"禁用态只用 `opacity.disabled`"，把所有按钮的 disabled 变量接回常态色，只留透明度（主 / 次 / 危险 / 文字 / 链接一致）。禁用的文字按钮保留 quiet 浅底。
- 加载中的按钮不再被压淡：1.1.0 把 `--el-mask-color-extra-light` 也接到了 90% 加载遮罩，Element 用它给 `is-loading` 按钮盖了一层近白。取消该映射并把按钮的加载遮罩设为透明——转圈本身就是状态。
- 用户复核走查页时列出的 15 处主色问题（朴素主色、Text / Link primary、级联选中、开关文案、勾选按钮组、上传 em、primary 标签全家、check-tag、进度内嵌白字、el-segmented、日历今天、边框卡片页签）与 1.1.0 修正项一一对应，当前构建逐项核对均为无色系。

## 1.1.0 — 2026-09-10（全组件走查：Element 2.14 全部组件接管）

- **新增 token** `color.bg.mask`（亮 `neutral.mask` 白 90% / 暗 `graphite.mask` graphite.800 90%）：局部加载遮罩。此前桥接把 Element 的 `--el-mask-color` 接到了弹窗遮罩 `bg.overlay`，`v-loading` 会把一张卡片压成黑块、加载文字 2.6:1。Core 313 / dark 69。
- **走查方法**：实测项目新增 `#/kitchen` 页铺开 Element 全部组件；三模式对 619 个交互元素强制 hover / focus-visible，只报"状态切换新引入的黄色""悬停对比掉档""不来自 token 的颜色"。首轮：27 组状态问题 + 60 组静息黄色（其中约一半是把黄当选中 / 强调），4 种外来颜色；终轮全部为 0，剩余静息黄只有规则允许的六类。写进 DESIGN「验收基线」。
- **桥接接管（肉眼可见）**：
  - 用黄表达选中 / 强调 → 反转块或近黑：`el-segmented`、checkbox-button 组（同 radio-button 的胶囊配方）、级联 / 树选择 / 时间选择的选中项、日历今天与选中日、check-tag、表格筛选选中项与表头高亮、锚点当前项、树拖拽指示、Tour 指示点。
  - 黄字 / 黄底 → 无色系：`el-link` 默认 hover、`el-link / el-text / el-tag / el-badge` 的 primary 变体、上传区"点击上传"、加载文字、开关选中文案与滑块加载图标、朴素主色按钮。
  - Element 2.14 新增的 38 处主色 `:focus-visible`（表格筛选 / 展开 / 排序、标签关闭、锚点、取色器、评分、标签页 inset 阴影）→ `border.focus`。
  - 写死色表：进度环 / 仪表盘的 `#20a0ff` 蓝（SVG 属性）→ `action.primary-active`，status 变体走 `status.*`；空状态插图 10 档暖灰 → 冷灰语义 token；评分 `#F7BA2A` 金 → 实星 `action.selected`、空星 `border.strong`。
  - 状态色派生变量 `-light-3 / -light-5 / -dark-2` 补全映射（此前危险链接 hover 漏出 Element 的浅红 #F89898，2.1:1）。
  - 退化为系统形态：`type=success / warning / info` 按钮 → 次要按钮；`effect=dark` 状态标签与提示条 → 浅色成对；进度条内嵌百分比白字 → `text.on-primary`；头像默认灰底白字（暗色 2.5:1）→ `bg.selected` + `text.selected`。
  - **修正一个潜伏 bug**：`el-badge` 默认类型是 danger（红底），桥接给徽标文字写的却是 `text.on-primary`（近黑）——红底黑字。改为 `text.on-danger`，primary 徽标改反转块。
  - 桥接内不再直接引用 primitive（`neutral.300` 之类在暗色下不会切换），全部走语义 token；横向菜单去掉侧栏语义的左指示条。
- 全量回归：31 页 × 3 模式 + 走查页，0 未批准低对比、0 无名称、0 溢出。

## 1.0.0 — 2026-09-10（正式版）

- 内容与 rc.34 完全相同，只是版本号落定：Core 310 个 token、dark 68 条 / compact 8 条 delta；三份桥接（Element Plus / shadcn / IconPark）；DESIGN 含组件配方与验收基线。
- 定版依据：两个测试项目（`testbed/golden-admin` 新项目 + 组件库、`testbed/legacy-shop` 遗留迁移）validate / guard / status 三绿；93 个页面状态 × 三模式全量回归通过（例外均为用户拍板并写入验收基线）；预览 E 与 S 逐像素一致。
- 自此按顶部的版本策略走：文档与描述改 patch，token 值改 minor（并写清肉眼可见的影响），改名或删除才 major 并附兼容 shim；不再发 rc。

## 1.0.0-rc.34 — 2026-09-10（文档收敛 + 验收基线）

- **DESIGN.md 新增「验收基线」**：对比度阈值、已批准的例外（三对状态色、危险按钮白字、占位符）、可访问名称、命中区、溢出、键盘焦点、窄屏、构建一致性——扫描工具只是执行者，基线以此为准。
- **文档去编年**：DESIGN / README / dark THEME 里的「rc.xx 实测反馈」「用户拍板」注记全部沉淀为规则本身，历史只留在本文件；删掉与现行规则矛盾的「幽灵按钮透明底」配方行；去掉文档里重复 token 的具体色值（`text.on-primary` 仍写着旧的 #1C1917 之类），过期数值不再散落。dark THEME 的「权威来源」改为本目录 token（预览是镜像）。
- 全量回归（93 个页面状态 × 亮 / 暗 / 紧凑、E/S 像素一致、Tab 焦点遍历、1366 窄屏）通过，见测试项目 FINDINGS D54。token 无改动。
- **第二条消费路径验证**：三份桥接的 229 个 `var(--x)` 引用全部可在构建产物中解析（shadcn 桥接 90/90 首次核对）；新增测试项目二 `testbed/legacy-shop/`（旧暖灰规范的静态后台）排练 `audit → migrate 三阶段 → guard / status`：无 git 时工具正确拒绝写入；旧规范不同族时自动阶段只处理 1/56，其余按角色手工映射后 adoption 100%、`unified`。对照表写进 README「从旧规范迁移」。

## 1.0.0-rc.33 — 2026-09-10（实测反馈：卡片阴影被裁 + 不够柔和）

- **`shadow.y.1` 2px → 4px、`shadow.blur.1` 8px → 16px**：卡片层阴影更大扩散、更柔（颜色仍是 neutral.900 6%）；浮层 / 弹窗两层不动，层级差保持。
- **桥接放开 `.el-tabs__content` 的 `overflow: hidden`**：卡片贴住 tab-pane 边缘时阴影被裁掉一半（数据看板最明显）；Element 的 pane 切换靠 display:none，不靠 overflow 收纳，放开安全。
- **可见影响**：全站卡片阴影更柔和；看板页卡片四周阴影完整。

## 1.0.0-rc.32 — 2026-09-10（用户规则重申：日期面板去黄）

- **修复日期面板三处违规**：选中起止日是黄圆底 + 白字（违反「黄底永远深字」与「黄不表达选中」）、「今天」与 hover 日是黄字（违反「白底无黄字」）。根因：rc.22 把 `--el-datepicker-active-color / hover-text-color` 接管写在 `:root`，而 Element 把这组变量定义在 `.el-date-picker` **组件级**——组件级声明压过 `:root`，接管从未生效。**教训入库：组件级变量必须在同级或更近处覆盖**。
- 桥接：变量改在 `.el-picker-panel / .el-date-picker / .el-date-range-picker` 级覆盖（选中日 = `action.selected` 深黑圆底 + 白字，同分段选择器）；today 黄字属性级覆盖为 `text.primary` + medium，作为选中端点时转白字。配方表新增「日期面板」一行。token 无改动。
- **可见影响**：日期范围选择器的起止日从黄圆变深黑圆，「今天」从黄字变近黑中等字重，hover 日不再变黄。

## 1.0.0-rc.31 — 2026-09-10（实测反馈：分段选择器默认态过重）

- **分段选择器默认项 500 → 400，选中项 600 → 500**（`font.weight.medium`）。与侧栏（rc.20）同一条"反转块组件"规则：深黑反转块本身已是强调，字重只做轻微突出；默认态是普通选项，不该比正文重。标签页保持 500 / 选中 600（它的选中是下划线，不是反转块）。token 无改动；预览 `.seg` 同步。
- **可见影响**：筛选栏「全部 / 我负责的 / 已收藏」、看板时间范围、骑手状态、活动视图切换、表单里的结算周期 / 活动类型——未选项变细一档，选中项从粗体变中等。

## 1.0.0-rc.30 — 2026-09-09（实测反馈：胶囊字重过重）

- **徽标 / 状态胶囊 / el-tag 从 500 降回 400**。rc.16 把它们归入"标签类文字"统一 500，实测 12px 小字 + 浅色底再加 500 显闷——浅色底本身已经提供了识别，字重不用再扛。按钮、表头、表单标签等其余标签类文字保持 500。token 无改动（app.css / 预览 / el-tag 桥接三处引用改为 `font.weight.regular`）。
- **可见影响**：表格状态列、待办胶囊、公告分类标签、活动状态、经营标签的文字变细一档。

## 1.0.0-rc.29 — 2026-09-09（实测反馈：暗色状态色偏亮）

- **四个暗色状态文字色统一压暗**（OKLCH 只降明度，色相不动）：green.500 #10B981 → #00A56E、orange.500 #F5A524 → #CB7E00、red.500 #FB7185 → #EB6378、cyan.500 #12B5CB → #009FB5。graphite.850 上从 6.6–8.7:1 收敛到 5.5–5.6:1，四个 wash 预混随之重算（文字在浅底上 4.6+）。亮色不动（rc.26–28 的用户指定值保持）。
- 连带：暗色图表第 3 序列（cyan.500）、暗色涨跌（green / red.500）同步变暗，属预期。
- **可见影响**：暗色下状态胶囊、提示条、涨跌数字的荧光感消失，与深底更协调。

## 1.0.0-rc.28 — 2026-09-09（用户指定：error 换更亮的红）

- **`red.50` #FFF1F2 → #FFE2E3，`red.700` #BE123C → #EE484B**（用户逐值指定）；`red.800 / 900`（危险按钮 hover / active）按既有推导规则（OKLCH L−0.05 / −0.10）从新 700 重推为 **#DC353C / #CA1E2D**——不重推的话 hover 会从亮红突然跳回深红。暗色不变（`red.500` #FB7185 与其 wash 不动）。
- **对比度声明**：文字压浅底 3.04:1、白底 3.71:1；危险按钮白字 3.71:1（hover 4.55、active 5.62）。success / warning / error 三对现在都是用户拍板的品牌例外（AA 保留项只剩 info）；回补路径 ≈#D6203B 写在 token 描述。
- **可见影响**：错误胶囊、"跌"数字、危险按钮从玫红变鲜亮的珊瑚红；按钮 hover / active 比静息深。

## 1.0.0-rc.27 — 2026-09-09（用户指定：warning 换更亮的橙）

- **`orange.50` #FFF7E6 → #FFF1D8，`orange.700` #B45309 → #D76712**（用户逐值指定）。影响 warning 胶囊、提示条（工作台黄条）、待办「即将过期」等。暗色不变（`orange.500` #F5A524 与其 wash 不动）。
- **对比度声明**：新文字色在新浅底上 3.22:1、白底 3.60:1，低于 12px 小字的 AA 底线（同 rc.26 的 success，属用户拍板的品牌例外）；与品牌黄 2.39:1，区分主要靠色相。回补路径 ≈#A8500D，写在 token 描述里。
- **可见影响**：警告态从深琥珀变为鲜亮的橘橙，浅底更暖。

## 1.0.0-rc.26 — 2026-09-09（用户指定：success 换更鲜亮的绿）

- **`green.50` #ECFDF5 → #DAF5E8，`green.700` #047857 → #0B9E74**（用户逐值指定）。影响 success 胶囊、提示条、步骤条完成段、涨跌的"涨"、时间线成功节点。暗色不变（`green.500` #10B981 与其 wash 不动）。
- **对比度声明**：新文字色在新浅底上 2.96:1、白底 3.41:1，低于 12px 小字的 AA 底线 4.5（其余三个状态色仍是 4.7–5.7）。属用户拍板的品牌例外，已写进 token 描述与 README 硬规则；后续验收扫描对 success 配对放行。若要回到 AA，同色相压深到 ≈#067A59 即可，位置在 primitives。
- **可见影响**：成功态从深森林绿变为鲜亮的翡翠绿，浅底更饱和；"涨"的数字变亮。

## 1.0.0-rc.25 — 2026-09-09（实测反馈：数据数字没有重点感）

- **`text.display.size` 26px → 32px（`font.size.4xl`）**，新增 `text.display.line-height`（tight 1.25）与 `text.display.weight`（700）。KPI 数字原来 26px / 600 / 1.6 行高，上下浮空、压不住标签；现在 32 / 700 / 1.25，数字成块。阶梯不加档（4xl 已存在，与 hero 同尺寸、不同语义）。Core 310 token。
- **可见影响**：工作台、看板、骑手页的统计卡数字明显变大变重，卡高略增；结果页大字不变。

## 1.0.0-rc.24 — 2026-09-09（用户规则：数据色卡禁大面积黄）

- **新规则**：数据卡（统计卡）禁止大面积黄色填充；「高亮」降级为左侧 `brand.indicator` × `border.width.indicator`（3px）描边点缀，卡体与文字同普通卡，涨跌数字恢复红绿。黄色的大面积使用只剩登录页品牌面 `bg.brand` 一处。token 无改动（复用侧栏选中项的指示条语言）。
- **可见影响**：工作台"今日订单"从黄底卡变为白卡 + 左侧黄条；卡上的涨跌从近黑变回绿/红。测试项目与预览 admin 同步。

## 1.0.0-rc.23 — 2026-09-09（用户规则：按钮不裸放）

- **新规则**：按钮类内容不能无框架直接放在背景上——要么描边（次要按钮），要么浅色底（文字按钮）。触发点：筛选栏"重置"是裸文字。
- **新增 `color.action.quiet` / `quiet-hover`**（亮 neutral.200 / 300，暗 graphite.700 / 600；100 与白卡只有 1.04:1 不可辨，所以取 200）：文字按钮的静息浅底与 hover 底，构成主按钮（黄）→ 次要按钮（白底描边）→ quiet（浅灰底）三层级。Core 308 token，dark 68 条。
- 桥接 `.el-button.is-text` 属性级覆盖接 quiet 对（Element 把它的背景写死 transparent，变量接管无效）；预览 `.btn-ghost` 同步（原来静息透明）。`is-link` 保持链接形态（下划线 + 斜体自带识别特征），不加底。
- **可见影响**：全站"重置""权限说明"等文字按钮从裸文字变成浅灰底胶片，hover 深一档。

## 1.0.0-rc.22 — 2026-09-09（用户规则：hover 一律不用品牌黄）

- **新规则**：任何元素的 hover / focus 反馈不允许出现品牌黄——黄只出现在静息的主操作面上，hover 反馈交给无色系（文字加深到近黑、边线变黑、底色 `bg.hover`）。触发点：MessageBox 关闭按钮 hover 变黄。
- **桥接**：穷举 Element 编译产物里 20+ 处 hover / focus 直接取 `--el-color-primary` 的规则（弹窗 / 抽屉 / 引导的关闭按钮、面包屑链接、标签页、checkbox-button、数字步进、表格筛选、穿梭框、折叠面板、上传列表、旧 text 按钮），按原选择器同形接管为 `text.primary`；上传卡片 / 拖拽分隔条的边线类 hover 接 `border.focus` / `border.strong`；分页与日期面板走变量接管（`--el-pagination-hover-color` 已有、新增 `--el-datepicker-hover-text-color`）。顺带把日期面板选中色 `--el-datepicker-active-color` 接到 `action.selected`（黄不表达选中）、`--el-input-focus-border-color` 显式接到 `border.focus`。token 无改动。
- **可见影响**：弹窗关闭 ×、标签页、面包屑、数字步进、上传列表等的 hover 从黄变近黑；日期面板"今天/选中日"从黄块变深黑反转块。

## 1.0.0-rc.21 — 2026-09-09（实测缺陷：危险按钮 hover 黑字红底）

- **桥接修复**：`.el-button--danger` 块补齐 `--el-button-hover-text-color / --el-button-active-text-color / --el-button-disabled-text-color`（都是白）。MessageBox 的确认按钮同时带 `el-button--primary el-button--danger` 两个类：`text-color` 被 danger 块的白覆盖，但 hover 文字色只有 primary 块定义（黄底用的近黑）——hover 变成黑字红底。老教训的又一实例：**变量覆写要按状态穷举**，混合类的按钮会从另一个块漏掉的状态里继承错误值。token 无改动。
- **可见影响**：确认弹窗里的红色危险按钮 hover / 按下时文字保持白色。

## 1.0.0-rc.20 — 2026-09-09（实测反馈：侧栏字重降一档）

- **侧栏菜单项 500 → 400，选中项 600 → 500**（`font.weight.medium`）。rc.16 把菜单项归入"标签类文字"统一 500，实测整列竖排的导航 500 显重；选中项的深黑反转块本身已是强调，叠 600 过头。token 无改动；桥接与预览 `.nav a.active` 同步，`tokens-base.css` 补 `--font-weight-regular / -medium` 两个与构建产物同名的变量供骨架引用。标签页、分段选择器、按钮等其余标签类文字仍是 500 / 选中 600，不受影响。
- **可见影响**：侧栏默认菜单项变细一档，选中白字从粗体变中等。

## 1.0.0-rc.19 — 2026-09-09（用户决定：无色系整体转冷）

实测反馈暖灰让界面显黄、显脏。31 页 × 亮暗 × 三变体（现状 / 冷灰 / slate）并排样张后拍板：无色系换 **gray 冷灰族**，品牌黄一字不动。token 名与数量不变（Core 306），只换值。

- **`neutral.50–900` 暖灰（stone）→ 冷灰（gray）**：页面底 #F5F5F4 → #F3F4F6，近黑 #1C1917 → #111827（带一丝深蓝）。500 档压深到 #666D7B（冷灰原 500 白底只有 4.4:1；现在白底 5.2、页面底 4.7）。遮罩、三档阴影色、焦点环、`wash / wash-dark` 随 900 / 400 重算。
- **`graphite.600–950` 色相校到与亮灰同族**：每档保持原明度，OKLCH 色相按 gray 族暗端（700–950 锚点）插值——暗色卡片 #18181B → #111827，页面底 #0F0F10 → #080F1C。亮暗切换时灰的"味道"一致。
- **success → emerald，error → rose**（公司调色板自 rc.19 起降为**色相参考**，原值保留在 token 描述里）：green.700 #15803D → #047857（浅底 5.2:1）、green.500 #22C55E → #10B981；red.700 #CE2C31 → #BE123C（白字 6.3:1，danger hover/active 随之 #AC002E / #9A0021）、red.500 #FF5A5F → #FB7185（rose-400：rose-500 #F43F5E 在暗色预混浅底上只有 4.2:1，回退一档）。warning 琥珀、info 青、图表蓝/青/紫不动。四个暗色预混 wash 在新 graphite.850 上重算。
- **可见影响**：全站底色与文字的暖味消失，黄按钮在冷灰里更跳；暗色整体带蓝黑味；成功态更青翠、错误态偏玫红；危险按钮深红略偏玫。顺带修复两处历史边缘值（弱化文字在页面底 4.68 → 4.73、暗色 error 预混 4.87 → 5.43）。
- 预览站删除参考方案 A / B / C（tokens-a/b/c.css、切换链接、首页卡片与截图；见 git 历史），只保留 D / E / S。
- 决策依据：/tmp/cool-samples/（186 张样张 + index.html 总表）与 28 项对比度体检 canvas。

## 1.0.0-rc.18 — 2026-09-09（用户决定：分段选择器改胶囊）

- **分段选择器配方**：从「边线拼接的方块按钮组」改为「外胶囊 + 选中内胶囊」——外壳 `bg.subtle` + `border.default` 发丝线 + `radius.full`，内缩 `control.segmented-inset`；选中项是 `action.selected` 的 `radius.full` 内胶囊，未选项透明、`text.secondary`。新增原语 `spacing.0-5`（2px，只给胶囊内缩用，不是间距阶梯成员）与语义 `control.segmented-inset`。Core 306 token。
- Element 桥接重写 radio-button 组样式，不依赖 `:has()`（外胶囊由每个 label 的底色、上下边线、首尾圆角拼成）；预览 `stress.css` 的 `.seg` 同步为胶囊并把 2px / 4px 字面量换成 token。
- **可见影响**：筛选栏「全部 / 我负责的 / 已收藏」、看板时间范围、骑手状态、活动视图切换、表单里的结算周期 / 活动类型，全部从方块拼接变为胶囊套胶囊；外壳高度不变（34 / 28），内胶囊约 29 / 23px。

## 1.0.0-rc.17 — 2026-09-09（实测反馈：折叠侧栏）

- **桥接修折叠菜单**：Element 的 `.el-menu--collapse` 宽度是「图标宽 + 两侧 padding」推算的（我们映射成 16 + 12 × 2 = 40px），与 `layout.sidebar.collapsed-width` 64px 对不上——菜单项被压成 24 × 40 的竖条、偏在左侧，黄色指示条骑在黑块边上。现在折叠宽度显式取 token，菜单项是 `control.height.lg` 的 40 × 40 正方形居中，分组标题隐藏，指示条贴侧栏外沿。token 无改动；测试项目 app.css 里的两条折叠规则删掉，交给桥接。

## 1.0.0-rc.16 — 2026-09-09（实测反馈：字太细）

- **`text.weight.label` 400 → 500**，新增原语 `font.weight.medium`。按钮、表头、徽标 / 状态胶囊、表单标签、描述列表标签、面包屑随之变为中等字重；桥接把菜单项与标签页默认项也接到 label（选中项仍是 600）。正文、表格单元格、输入值仍是 400。Core 304 token。雅黑没有 500 会退回常规，但 ClearType 下的雅黑常规本来就比 Mac 的 400 重，两端观感更接近。
- **桥接加文字渲染基线**：`html { -webkit-font-smoothing: auto }`——`antialiased` 在 Mac 上去掉字形加粗补偿、把中文削细一档，是"字太细"的第一原因，测试项目与预览的 `html` 上都删掉了它；`button / input / select / textarea { font-family: inherit }`——浏览器默认给按钮的是 Arial，Element 没有覆盖，按钮里的数字一直和正文不是一个字体。shadcn 桥接同步。
- **可见影响**：Mac 上全站文字笔画略重；标签类文字从常规变中等；按钮里的数字字母换成正文字体。

## 1.0.0-rc.15 — 2026-09-09（全局扫描：对比度、焦点、命中区）

对测试项目 31 个页面/状态 × 亮 / 暗 / 紧凑 + 1366px 窄屏做了自动扫描（对比度、可访问名称、命中区、溢出）与逐页目检，问题按「改一处全站受益」归进 token / 桥接 / 配方三层。Core 303 token，dark 66 条，compact 8 条。

- **`neutral.500` #78716C → #736D68**：`text.muted` 在 neutral.100（页面底、表格选中行、骑手卡）上原本只有 4.4:1，现在 4.7:1，白底 5.1:1。**可见影响**：所有弱化文字、次要图标、`chart.5`、`sequential.3` 深一丁点。
- **暗色状态浅底改为预混实色**：`green / orange / red / cyan.wash` 从 14% 半透明改为叠在 graphite.850 上的实色（#193024 / #372C1C / #382125 / #172E34），新增 `neutral.wash-dark` #2C2B2D 给 `status.neutral-bg`。半透明落在选中行上会把"已取消"红字压到 4.06:1；实色后恒定 4.9–6.7:1。`neutral.wash` 保留半透明，供 `chart.area` 亮暗共用。
- **新增 `color.text.danger`**（亮 red.700 / 暗 red.500）：下拉删除项、危险链接不能再用填充色 `action.danger`——暗色浮层上只有 3.0:1。配方表下拉菜单一行同步改。
- **新增 `color.chart.area`**（`neutral.wash`）：折线面积填充；原来用 `sequential.1` 实色，暗色下是一整块灰压掉网格线。
- **新增 `control.hit-min`** 24px：图标类控件最小命中区。桥接给 `el-tag` 关闭、输入框清除按钮外扩命中区。
- **compact 新增 `control.height.lg` → 34px**：侧栏菜单项跟随紧凑，之前只有内容区变密。
- **桥接**：全局 `:focus-visible` 兜底（Element 自带焦点环用主色画，黄在白底上不可见；菜单项 / 标签页写死 outline:none；文字型按钮的焦点环 Element 走 `--el-button-outline-color` = primary-light-5，被我们映射成了暖灰，一并接到 `border.focus`）；`@media (prefers-reduced-motion: reduce)` 把三档 duration 与所有 transition / animation 归零（DESIGN 早就写了这条约定，一直没落地）。shadcn 桥接同步。
- **配方**：表格骨架按目标形状；步骤条流程中止态；结果页垂直居中 + two-tone 插图；筛选栏条件区 / 动作区两组并规定折行行为；新增「选项卡片」；通知计数底色改 `action.danger`（白字 3.05 → 5.2:1）；筛选下拉默认值必须是真实选项而非占位符。
- **规则**：≤1440px 侧栏默认折叠；图标类控件必须有可访问名称（折叠侧栏的菜单项也算——`el-menu-item` 不透传属性，要用指令写 `aria-label`）；禁用态的淡黄是透明度结果、允许。

## 1.0.0-rc.14 — 2026-09-09（并入公司调色板：状态色与图表色）

- **状态色、图表色、危险按钮换成公司调色板的近似色，品牌黄不动**。每个色系收 default / bg 两个原值，dark 用 default 作文字、default 14% 作 wash；`teal.*`、`violet.*`、旧 `blue.*` 删除，新增 `cyan.*`、`purple.500`、`blue.400 / 500`。Core 仍是 299 token，dark 65 条（`chart.4` 亮暗共用一个紫，不再覆写）。
  - success：`green.50` #ECFDF3、`green.500` #22C55E、`green.700` #15803D；warning：`orange.50` #FFF7E6、`orange.500` #F5A524、`orange.700` #B45309；error：`red.50` #FFF1F1、`red.500` #FF5A5F、`red.700` #CE2C31（+ hover `red.800` #BC1221、active `red.900` #AA0010）；info 由蓝改青：`cyan.50` #ECFDFF、`cyan.500` #12B5CB、`cyan.600` #0E8A9B、`cyan.700` #007C8D。
  - **亮色文字色没有照抄调色板的 text 值**：#16A34A / #D97706 / #E5484D / #0E8A9B 在各自浅底上只有 3.1 / 3.0 / 3.6 / 3.9:1，12px 胶囊不到 AA；同色相压深一档（绿、橙取同一梯度的 700，红取 Radix 同梯度的 11，青按 OKLCH 只降明度），浅底上 4.7–4.8:1、白底 4.9–5.2:1。要照抄原值，只改这四个 700 的 hex。
  - 图表：`chart.2` → Primary Blue（亮 500 #4F7DF7 / 暗 400 #7DA0FC）；`chart.3` → 青（亮用 text 值 #0E8A9B，白底 4.1:1；暗用 default #12B5CB，因为它在白底上只有 2.5:1，画不出线）；`chart.4` → 紫 #8B5CF6。浅灰、深灰、顺序色不变。Indigo、blue.800 / 300、cyan hover、purple bg 未被引用，不收。
- **可见影响**：绿更鲜（#177A35 → #15803D），橙由红橙变琥珀（#C2410C → #B45309），红由砖红变正红（#C62828 → #CE2C31），info 由蓝变青；暗色下四个状态色饱和度都升高；折线图第二序列由深蓝变亮蓝；危险按钮及其 hover / active 略微变亮。链接、焦点、选中态仍是无色系，不受影响。

## 1.0.0-rc.13 — 2026-09-08（实测反馈：删除品牌延伸色）

- **删除全部品牌延伸色**：`color.brand.50–400`、`600–900`、`wash`、`wash-subtle`、`glow` 共 12 个 primitive；品牌黄只剩 `brand.500`。实测反馈延伸色（进度条的 600、筹码的 100、深金文字 700–900）在界面里显脏。Core 299 token，dark 66 条。
- 原来引用延伸色的角色全部改为无色系或纯黄：`action.primary-hover / -active` → 纯黄（反馈靠边线变黑与按压内阴影）；`brand.indicator` → 纯黄；`text.selected` → 近黑；`bg.selected / -subtle / -hover` → 暖灰 100 / 100 / 200；`border.focus` → 近黑，`focus.ring` → 新 `neutral.ring`（16% 灰）；`icon.brand` → 近黑、`icon.two-tone` → 纯黄（品牌插图 = 黑描边 + 纯黄填充）；`text.brand` → 近黑（暗色下纯黄）；`chart.6` → 深灰；`chart.sequential.1–5` → 灰阶四档 + 纯黄封顶。暗色 delta 相应改为 graphite 梯度。
- **可见影响**：进度条、滑杆填充由深金变纯黄；筹码、批量条、表格选中行由奶油黄变暖灰；焦点边线由金变黑；热力图与排行条由黄-金渐变变为灰阶 + 纯黄封顶；品牌徽标由浅黄底变纯黄底。
- Element 桥接：主按钮 hover 边线 → `border.current`，active 加内阴影；`--el-color-primary-light-5 / 7` → 暖灰。ECharts 顺序色改用 piecewise 分段，不再连续插值。

## 1.0.0-rc.12 — 2026-09-08（实测反馈：状态胶囊）

- 状态展示形式统一为浅色胶囊 + 文字，去掉圆点（token 无改动，DESIGN.md 与配方表更新）。**可见影响**：表格状态列、待办列表、改派抽屉里的状态由「圆点 + 文字」变为带浅色底的胶囊。圆点只保留给时间线节点等"指示灯"语义。

## 1.0.0-rc.11 — 2026-09-08（实测反馈：发丝线）

- `border.width.thin` 1px → 0.6px：卡片外框、表格行分隔、输入框边线、分隔线全部变为发丝线。**可见影响**：Retina 上边线变细一半；1x 屏上浏览器取整为 1px，无变化。聚焦 1px 实线、控件 1.5px、下划线 2px、指示条 3px 不变。
- Element 桥接：`--el-border-width / --el-border` 接到 `border.width.default`；卡片边线、标签页底线（原写死 2px）、描述列表表格线改走同一变量。输入类边线 Element 是用 inset box-shadow 画的，且日期范围（`.el-date-editor.el-input__wrapper`）、级联、输入数字、表单出错态各有一套特异性不同的选择器——桥接按默认 / 悬停 / 聚焦 / 出错 / 禁用五种状态统一接管并用 `!important` 压过全部特异性，避免再有漏网之鱼。

## 1.0.0-rc.10 — 2026-09-08（实测反馈：卡片边缘发虚）

- 回退 rc.9 的卡片边线降档：删除 `color.border.subtle`，卡片外框回到 `border.default`。根因是 subtle（neutral.100）与页面底色 `bg.page`（neutral.100）相同，卡片边缘零对比、只剩阴影，看起来发虚。软阴影保留——正确组合是「细边线定形 + 软阴影定层」。Core 309 token，dark 67 条。
- `border.default` 的描述写入约束：外框颜色必须与页面底色可区分。

## 1.0.0-rc.9 — 2026-09-08（实测反馈：阴影与留白）

- 阴影放柔放大：card 1/2/4% → 2/8/6%，popover 4/12 → 8/24，modal 12/32 → 16/48（颜色不变）。**可见影响**：卡片有了可见的柔和投影，浮层与弹窗更弥散。
- 新增 `color.border.subtle`（neutral.100 / 暗色 graphite.750）：卡片、面板外框降一档，分层交给阴影；表格行、输入框边线不变。
- 留白放大一档：`space.gutter` 24 → 32，`space.stack` 16 → 20，新增 `space.card` 24（卡片 / 弹窗 / 抽屉内边距，compact 下 16），`table.cell.padding-y` 12 → 14，正文行高 1.5 → 1.6。Core 310 token，compact 7 条。
- Element 桥接：`--el-card-padding` / 弹窗 / 抽屉内边距接 `space.card`，卡片边线接 `border.subtle`。

## 1.0.0-rc.8 — 2026-09-08（实测反馈：圆角）

- 圆角整体放大一档并补成五档：新增 `radius.xs`（4）与 `radius.xl`（16），`radius.sm` 4 → 6、`md` 6 → 8、`lg` 10 → 12。**可见影响**：全站按钮、输入框、卡片、弹窗更圆。Core 308 token。
- 写入嵌套规则：内元素圆角必须小于外框，相邻层级至少差一档；勾选框改用 xs，弹窗 / 抽屉露出角改用 xl，空状态插图框由 lg 降为 md（它在卡片内）。
- 桥接：`--el-checkbox-border-radius` → xs；`--el-dialog-border-radius` → xl；右侧抽屉左侧两角 xl；分页项 sm。

## 1.0.0-rc.7 — 2026-09-08（实测反馈：标签页）

- 新增 `color.border.current`（neutral.900 / 暗色 neutral.100）：当前位置指示线。标签页下划线由 `action.primary-active` 改为它——**可见影响**：标签页选中下划线由黄变黑。分页当前页保留黄色（用户决定）。Core 306 token。

## 1.0.0-rc.6 — 2026-09-08（实测反馈：选中态）

- 新增 `color.action.selected`（neutral.900 / 暗色 graphite.600）与 `color.text.on-selected`（white / neutral.100）：分段选择、视图切换、状态切换等「选项卡式按钮」的当前项一律深黑反转，禁止用品牌黄。**可见影响**：`el-radio-button` 选中项由黄底黑字变为黑底白字；预览页分段选择器与控制条同步。Core 305 token。
- 分页当前页改为 `action.selected` 反转块；标签页下划线改为跟随 `text.primary`。**可见影响**：分页与标签页不再出现黄色。
- 视觉语言新增一条总则：黄色表达"主操作"，不表达"选中"或"当前位置"。

## 1.0.0-rc.5 — 2026-09-08（实测反馈：侧栏）

第一批人工反馈，全部来自在实测项目里的肉眼观察。Core 303 token。

- 图标描边 `icon.stroke.width` 3 → 4（**可见影响**：全站图标变粗；删除 primitive `stroke-width.3`，`width-small` 与默认相同）。
- 侧栏选中项改为深黑反转块：`bg.sidebar-selected` brand.100 → neutral.900，`text.sidebar-selected` brand.900 → white；暗色 delta 改为 graphite.600 / neutral.100；图标保持线性，`icon.theme.active` multi-color → outline；左侧品牌色指示条保留。
- `layout.sidebar.width` 232 → 200；菜单项内外边距收紧（桥接 `--el-menu-base-level-padding` 20 → 12，项外边距 12 → 8）。
- 侧栏不再放计数气泡（配方表与 PRD 同步）。
- 桥接：`el-table` 选中行底色改用 `:has(.el-checkbox.is-checked)` 读勾选状态，不再依赖页面维护 row-class-name；选中菜单项 hover 不再变浅。

## 1.0.0-rc.4 — 2026-09-08（实测第一轮：Vue 3 + Element Plus）

用 `testbed/golden-admin`（PRD 第一轮七页）在真实组件库上实测，问题清单见 `testbed/golden-admin/FINDINGS.md`。token 无改动。

- 新增 `bridge/element-plus.css`：`--el-*` 全部指向 token；组件级覆写包括主按钮深字、危险按钮用 `action.danger`、链接型按钮中性化、`info` 映射到 `status.neutral`、固定列阴影只换色不换几何、聚焦追加 3px 环、控件尺寸接 `control.height.*`（compact 自动生效）、菜单 / 表格 / 弹窗 / 抽屉 / 浮层 / 分页 / 步骤 / 标签页等。
- 修正 `bridge/iconpark.config.ts`：Vue 版 `IconProvider` 是在根组件 setup 里调用的函数，不是组件。
- DESIGN.md 新增：组件库内置功能图标允许与 IconPark 并存；表单标签不超过 6 个汉字，描述列表标签列复用 `layout.form.label-width`。
- 实测结论：暗色不需要 Element 的 dark css-vars；`bg.selected-subtle` 在 `el-table` 多选下同样避免黄墙；采用率 100%（11 处字面量均为 Element 内部几何，已豁免）。

## 1.0.0-rc.3 — 2026-09-08（图标库）

图标库定为字节 IconPark（Apache-2.0）。Core 304 token，dark 64 条 delta。

- 新增 `icon.library`、`icon.stroke.width`（3）/ `width-small`（4）、`icon.stroke.linecap / linejoin`（round）、`icon.theme.default`（outline）/ `active`（multi-color）；primitive `stroke-width.3 / 4`。
- 新增图标颜色角色 `color.icon.default / muted / brand / two-tone`（暗色各有 delta）。
- 新增 `bridge/iconpark.css` 与 `bridge/iconpark.config.ts`；预览页用 `@icon-park/svg` 内联 24 个图标替换占位方块与 emoji，描边、颜色、尺寸全部由 token 决定（SVG 表现属性里的 `var()` 已在 Chrome 验证）。
- 已知约束写入 DESIGN.md：IconPark filled 主题的镂空色写死 #FFF，激活态改用 multi-color 四色数组。

## 1.0.0-rc.2 — 2026-09-08（页面类型压力测试）

用登录、列表、表单、详情、反馈、折叠侧栏六类页面做压力测试（`previews/yellow-admin/stress.html`），补齐暴露出的角色。Core 291 token，dark 60 条 delta。

- 选中态分级：新增 `color.bg.selected-subtle`（brand.50 / 暗色 8%）用于表格行等大面积选中；`bg.selected-hover` 改为 brand.100 / 暗色 14%；`bg.selected` 留给徽标、筹码、批量条、侧栏。**可见影响**：表格选中行变淡，不再形成黄色墙。删除未再使用的 `color.brand.wash-hover`。
- 新增 `color.text.brand`（brand.700 / 暗色 brand.500）：白底黄色文字唯一合法角色，仅限 ≥ 20px。
- 新增 `color.bg.brand / text.on-brand`（登录页品牌区）、`bg.skeleton / -highlight`、`bg.readonly`。
- 新增 `text.hero.size`（32px）与行高、`text.paragraph.line-height`（1.7）、`text.numeric.variant`（tabular-nums）。
- 新增 `control.height.lg`（40px）、`icon.size.2xl`（32px）、`illustration.size.md`（120px）、`layout.form.max-width`（720）、`layout.modal.width.sm / md`（420 / 640）、`layout.drawer.width`（480）、`layout.auth.card-width`（400）。
- DESIGN.md：中文不加字距、`text.tracking.caps` 只用于全大写西文；禁用 / 只读 / 加载中三种状态的区分；配方表新增 12 行页面级组件。预览页侧栏分组标题去掉了对中文无效的字距与大小写。
- QA：层级补齐 `layer.dropdown`（10）/ `layer.modal`（100）/ `layer.toast`（1000），删除无人引用的 `z.1`；预览方案 D 深侧栏弱化文字 4.39 → 5.4:1。全部预览方案（A–E、S）与 shadcn 桥接的变量引用完整性通过脚本核对，无缺失。

## 1.0.0-rc.1 — 2026-09-08

首个可交付的公司级中后台设计规范候选版。Core 259 token，Theme：dark（55 条 delta）、compact（6 条 delta）。

- 四项品牌决定入 token：单品牌线；链接无色系 + 常态下划线 + 斜体（`color.text.link / link-hover`、`text.link.decoration / style`）；财务涨跌 `color.data.increase`（绿）/ `decrease`（红）；密度默认舒适，新增可选 `compact` Theme。
- 国内环境修正：字体栈显式加入 Microsoft YaHei；`text.caption.size` 11 → 12px（中文下限）；字重收成 400 / 600 / 700 三档，`text.weight.label` 500 → 400、`text.weight.logo` 800 → 700。**可见影响**：侧栏分组标题与计数徽标变大 1px；表单标签、表头、按钮、徽标在 Mac 上变细，Windows 上不变。
- 新增布局与表格 token：`layout.form.label-width`（112px）、`layout.sidebar.collapsed-width`（64px）、`table.cell.padding-y / -x`；图标阶梯 `icon.size.xs / sm / lg / xl`。
- 新增 `color.status.neutral / neutral-bg`（草稿、已过期、已停用）。
- 主按钮 hover 规则：除换色外边线换成 `action.primary-active`（廉价显示器上 400/500 不可分）。

## 0.3.0 — 2026-09-08（体检修复）

- 对比度真问题：`text.muted / sidebar-muted` 改指 neutral.500（2.5 → 4.8:1），新增 `text.placeholder`；四个状态色加深一档（浅底 ≥ 4.5:1）；亮色 `border.focus` 改 brand.700（1.9 → 3.8:1），dark 保持 brand.600。
- 角色补齐：`action.danger / -hover / -active`（与 status.error 分家，暗色白字 2.8 → 5.6:1）、`action.secondary-hover`、`bg.selected-hover`、`border.input`、`bg.elevated / overlay / inverse`、`text.inverse`、拆分式 `elevation.card / popover / modal`、`motion.duration.normal / slow`、`motion.easing.enter / exit`。
- 数据可视化：`color.chart.1–6` 与 `chart.sequential.1–5`；DESIGN.md 新增组件配方表；shadcn 桥接同步。

## 0.2.0 — 2026-09-08（结构层）

- 新增 typography / size / layout / border.width / motion / opacity / z 六族 token（97 → 180）；spacing 加 6 / 10 / 14 半步；`focus.ring.width`。
- DESIGN.md 填写视觉语言、布局、组件、无障碍章节。

## 0.1.0 — 2026-09-08（颜色种子）

- 以 #F9CF00 为锚点推导十级 brand 色阶、暖灰、暗色深底、状态色；语义层 color.action / text / bg / border / status；dark Theme 29 条 delta；shadcn 桥接。
