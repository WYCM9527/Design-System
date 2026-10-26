# 实测反馈 · 第一轮（2026-10-09）

> 记录 Morganite 种子撞上真实 Element Plus 时发现的问题：是谁的问题（token / 桥接 / 模板 / 工具）、修在哪一层、修了没有。

技术栈：Vue 3.5 + Element Plus 2.14.7 + vue-router 5 + ECharts 6 + IconPark 1.4 + Vite 8。接入方式：`ds.mjs init --system <种子目录> --stack element-plus`，之后把快照换成指向种子的符号链接。

## 结果概览

- steward `build-tokens` 通过、`guard` current；`vite build` 通过，控制台无报错，1440 宽下两页都没有横向溢出。
- 这一轮要核对的是同日拍板的选中规则（AUDIT「用户决定」2026-10-09 各行），亮 / 暗都看过：
  - 日期选中日金底白字（改前是白底白字，看不见）、日期范围起止金底白字。
  - 主色徽标「new」、深色标签、勾选标签金底白字；评分金星。
  - 树的当前节点奶金浅底（暗色是金色暗阶），能和悬停区分开。
  - 带底色与不带底色两种分页的当前页都是金底白字。
  - 单选 / 多选按钮组、`el-segmented` 的当前项是灰轨道上的白块（暗色深灰块），能看出，但亮色下白块对轨道只有约 1.09:1，主要靠字重和字色区分。
  - Element 默认标签与信息标签：6% 黑底、边线透明，没有叠出深一圈。
  - 统计数字（`el-statistic`、`StatCard`）是 D-DIN-PRO；表格金额、日期在 `class-name="num"` 下是正文字体 + 等宽数字；ECharts 坐标轴是正文字体。
  - 配方的筹码、状态胶囊、分页条放进 Element 页面里表现与效果预览一致。

## 发现的问题

### A. 桥接（`bridge/element-plus.css`）

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| A1 | 日期范围中间段是一条灰带，和金色起止日不成套 | Element 的 `--el-datepicker-inrange-bg-color` 默认取边线色（本系统是 6% 黑），桥接没接管 | 已修：范围内与范围内悬停改为 `color.bg.selected-subtle`（奶金浅底，同 antd 范围选择），与 DESIGN「日期面板」一致 |

### B. 模板与说明（`templates/`、`bridge/vue/`）

| # | 现象 | 处理 |
| --- | --- | --- |
| B1 | `notes-element-plus.md` 还写着「带着 Citrine 的品牌决定：选中用深黑反转块」，会渲染进项目的 AGENTS.md | 已修：改写成本系统的选中规则；补一条「表格数字列加 `class-name="num"`」 |
| B2 | `notes-shadcn.md` 写「Tabs 选中用反转块、控件三档高度 28 / 34 / 40」，`shadcn.css` 注释同样是 28 / 34 / 40 | 已修：Tabs 是灰轨道上的白块，三档高度是 antd 的 24 / 32 / 40 |
| B3 | 三个样式入口模板的注释里写着 `{{BRIDGE}} / {{DIST}}`，`init` 替换后变成「@wycm9527/morganite/bridge / ../../design-system/dist 由 adopter 按来源解析」这种怪句 | 已修：注释不再含占位符。生成器 web-to-design-system 的种子模板有同样问题，留给上游 |
| B4 | `KitchenSink.vue` 头部注释的挂法写的是 `@wycm9527/citrine/vue/KitchenSink.vue` | 已修：改为 `@wycm9527/morganite` |
| B5 | `ds.mjs agents` 渲染出的 AGENTS.md 让 Agent 运行 `npm run accept`，但 Morganite 没有验收工具，项目里没有这个脚本 | 已修模板：验收写成「`npm run build` + guard current，项目有自己的验收脚本时一并运行」 |
| B6 | 从本地种子目录 `init` 后，工作副本里多了 19 张种子预览截图（1.4 MB）；查下去，种子 `package.json` 的打包清单也会把它们打进 npm 包（包体 1.5 MB，几乎全是截图） | 已修：打包清单排除 `design-system/preview/shots` 与 `static`，包体降到 143 kB；实测项目用 `.gitignore` 忽略工作副本里的截图 |

### C. 待决定

| # | 现象 | 说明 |
| --- | --- | --- |
| C1 | Morganite 没有验收工具：身份文件没有 `accept`，所以 `init` 不打印第 4 步「验收」（输出里步骤编号从 3 跳到 5），`ds.mjs ci` 只能做 guard | 可选：沿用 Citrine 的 citrine-accept 并写一份 Morganite 的验收清单；或暂时只用 guard |
| C2 | 分段类当前项（灰轨道上的白块）在亮色下对比很弱 | 用户决定保持白块；当前项不加投影（Element 桥接写明 `box-shadow: none`，效果预览的投影随卡片投影一起是透明的）。若在普通屏上分辨困难，可给当前项配一条细边线或轻投影 |

## 没覆盖到

- `el-tour` 的指示点（走查页没有引导组件）、表头单选筛选的选中项（走查页用的是多选筛选）、树的拖放目标：规则已改，未在真实组件里看过。
- shadcn 桥接：见 `morganite/testbed/shadcn-lab`。

# 实测反馈 · 第二轮（2026-10-09，验收工具）

接上 citrine-accept（`file:` 链接 `citrine/tools`），清单 `app/accept.config.mjs`：工作台 + 走查页 × 亮暗、三端（992 折叠 / 390 抽屉）、Tab 焦点。壳层照 Citrine 黄金后台补了三端：窄屏自动折叠 + 折叠按钮，手机抽屉 + 汉堡 + 遮罩。

## 结果

- pages：通过。低对比全部落在已批准例外里（金底白字、占位符），由 `APPROVED_CONTRAST` 放行。
- narrow：通过（992 侧栏折叠、汉堡隐藏；390 侧栏离屏、抽屉可开合、折叠按钮隐藏；均无横向溢出）。
- focus：通过（每个 Tab 停靠点都有可见焦点环）。
- components：通过（亮暗都 0 发现）。

## 发现的问题

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| A2 | 输入框前后缀「¥」「元」3.31:1 | Element 的 `--el-input-icon-color` 默认取占位符色 | 已修：桥接改指 `color.text.muted` |
| A3 | 进度条内「50%」被算成白字压浅灰（1.09:1） | 渐变是 background-image，取色时读不到，退到轨道色 | 已修：渐变下垫同色实底（视觉不变），实际是白字压深金 5.27:1 |
| T1 | 金底白字、占位符被报低对比 | citrine-accept 的已批准例外写死为 Citrine 的颜色 | 已修工具：新增项目可配的 `APPROVED_CONTRAST`（`fg` / `bg` / `minRatio`），Citrine 结果不变（黄金后台组件走查前后一致） |
| T2 | 表格文字按钮悬停被算成深金压纯黑（3.98:1）、暗色白字压白底（1:1） | 组件探针合成背景时把半透明叠半透明当成不透明 | 已修工具：改为由底向上逐层合成（与页面审计同一算法） |
| C3 | 暗色表格文字按钮在选中行上再悬停，金字只有 3.41:1 | 选中行底 + 行悬停 + 按钮悬停三层叠加成 #414141 | 已修：表格里的文字按钮悬停只变色、不叠底（用户 2026-10-09，antd 表格操作链接的做法），亮色那一档也随之过线 |

已登记为例外（用户 2026-10-09 决定保持暗色链接色）：暗色链接 / 文字按钮在悬停行与气泡上约 4.3:1（清单里 `minRatio: 4.2`，再低照样报）。

# 实测反馈 · 第三轮（2026-10-10，键盘焦点）

对照 shadcn 项目时顺带查出：Element 输入框键盘聚焦时，里面的 `<input>` 出现 2px 焦点色外环（顶栏搜索框里一圈粗环），违背「输入框聚焦只加深边线」的决定。根因是 Element 桥接、配方、shadcn 桥接三处全局外环规则都按 `[tabindex]` 选元素，而 Element 的输入框带 `tabindex="0"`。已改为排除 input / textarea / select，外框边线照常换成 `color.border.focus`。清单打开 `FOCUS.inputBorder`，验收四项全部通过。

# 升级到 0.2.0（2026-10-15）

项目清单一直停在 0.1.0，快照（指向种子的符号链接）早已是 0.2.0：桥接与配方是新的，项目自己的 token CSS（`design-system/dist`，由工作副本构建）还是 0.1.0。新桥接引用的卡片标题色、数据填充渐变、曲线底线虚线、提示气泡投影 4 个 token 在这里不存在，间距等也是旧值，页面是新旧混着的。用户同意后运行 `ds.mjs upgrade`：直接更新 8 个工作副本文件（两份 token、暗色 token 与说明、`theme-map.json`、`DESIGN.md`、`AUDIT.md`、`preview.local.css`），没有冲突，页面不用改。build、guard `current`，`citrine-accept all` 四步通过：2 个页面状态 × 亮暗的问题项全 0（tinyTargets 24 为提示项），组件走查亮 / 暗各 613 个元素 0 发现，992px / 390px 与焦点通过。实测工作台卡片标题 14px / 600 / `rgb(33, 33, 33)`，`space.stack` 16px、`space.gutter` 24px。

# 升级到 0.3.0（2026-10-15）

种子 0.3.0 把侧栏菜单项改为 40px 高、同组相邻项间距 12px、文字 500（用户指定，见种子 CHANGELOG 0.3.0）。本项目的侧栏用配方 `.nav`，配方随快照（符号链接）已是新的；用户同意后运行 `ds.mjs upgrade` 让项目的 token CSS 跟上：直接更新语义 token、`DESIGN.md`、`AUDIT.md`，没有冲突，页面不用改。实测：两个菜单项都是 40px 高、500 字重（当前项同字重，分组标题仍是 400）；992px 折叠后分组标题隐藏，组与组之间同样隔 12px（种子在实测拾光商城折叠态时补上）；390px 抽屉与展开态一致。build、guard `current`，`citrine-accept all` 四步通过：2 个页面状态 × 亮暗的问题项全 0（tinyTargets 24 为提示项），组件走查亮 / 暗各 613 个元素 0 发现，992px / 390px 与焦点通过。

评审中项间距由 12px 收到 8px（版本号仍是 0.3.0）：再运行一次 `ds.mjs upgrade`，直接更新语义 token、`AUDIT.md`，没有冲突。实测 992px 折叠后两项相隔 8px，其余不变；`citrine-accept all` 四步通过（结果同上）。

# 品牌金审计（2026-10-19）

citrine-tools 改为按设计系统取品牌色口径（工具 1.3.0，仓库内已生效）：Morganite 的判色范围与允许清单登记在身份文件 `accept.brand`，本项目清单的 `YELLOW_ALLOW` 换成 `BRAND_ALLOW`（空）。之前工具只认 Citrine 的黄，这里的金色从来没被检查过。首轮页面扫描报 2 处，组件走查亮暗各 4 组：

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| G1 | 走查页遮罩加载（`v-loading`）的转圈是金色，亮暗各 1 处 | Element 的转圈跟主色；DESIGN 要求加载用骨架屏，金色位置里没有加载 | 已修（桥接）：转圈与图标改 `color.icon.default` |
| G2 | 上传拖拽框、照片墙「+」框悬停出现金边线 | 桥接把拖拽框的悬停和拖入写成同一条（焦点色边线 + 选中底），照片墙悬停取 `border.focus` | 已修（桥接）：悬停改 `color.border.strong`（拖拽框加悬停底），拖入才换焦点色，同配方 `.upload-zone` |
| G3 | 默认 `el-link` 悬停显出链接金 | 设计如此：静息为正文色的链接悬停显出 `color.text.link-hover` | 写进 DESIGN「验收基线」，身份文件 `hoverAllow` 放行 |

修完复测：页面品牌金 0 处，组件走查亮 / 暗各 613 个元素 0 发现，静息金亮 110 组、暗 112 组。

侧栏页脚原来写死「Morganite 0.1.0」，升级后一直没变：改为像拾光商城一样从 `design-system/.adopter.json` 读版本。本项目也进了仓库 CI 的验收矩阵，改了种子或桥接会自动跑完整验收。

# 升级到 0.3.1（2026-10-19）

种子 0.3.1 把优惠券券面加进品牌面的位置：新增配方 `.coupon`，身份文件的品牌金允许清单加 `.coupon-value`（用户决定，见种子 CHANGELOG 0.3.1），token 不变。本项目没有优惠券，页面不用改。用户已同意种子再改时直接同步两个实验项目，于是运行 `ds.mjs upgrade`：直接更新 `DESIGN.md`、`AUDIT.md`，没有冲突。build、guard `current`、status `unified`，`citrine-accept all` 四步通过：2 个页面状态 × 亮暗的问题项全 0（tinyTargets 24 为提示项），允许清单 80 条、页面品牌金 0 处，组件走查亮 / 暗各 613 个元素 0 发现（静息金亮 110 组、暗 112 组），992px / 390px 与焦点通过。

# 升级到 0.3.2（2026-10-26）

种子 0.3.2 随设计系统分发数字字体：新增 `bridge/fonts.css`（内嵌原版 D-DIN 400 / 700），`element-plus.css` 开头引入它（用户决定，见种子 CHANGELOG 0.3.2），token 不变，项目的样式入口不用改。按用户同意的「种子再改时直接同步两个实验项目」运行 `ds.mjs upgrade`：直接更新 `DESIGN.md`、`AUDIT.md` 与两份 token 源（只改说明），没有冲突。构建产物里有两条 D-DIN `@font-face`。build、guard `current`、status `unified`，`citrine-accept all` 四步通过：2 个页面状态 × 亮暗的问题项全 0（tinyTargets 24 为提示项），页面品牌金 0 处，组件走查亮 / 暗各 613 个元素 0 发现（静息金亮 110 组、暗 112 组），992px / 390px 与焦点通过。
