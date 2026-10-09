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
- shadcn 桥接（本轮只接了 Element Plus）。

# 实测反馈 · 第二轮（2026-10-09，验收工具）

接上 citrine-accept（`file:` 链接 `citrine/tools`），清单 `app/accept.config.mjs`：工作台 + 走查页 × 亮暗、三端（992 折叠 / 390 抽屉）、Tab 焦点。壳层照 Citrine 黄金后台补了三端：窄屏自动折叠 + 折叠按钮，手机抽屉 + 汉堡 + 遮罩。

## 结果

- pages：通过。低对比全部落在已批准例外里（金底白字、占位符），由 `APPROVED_CONTRAST` 放行。
- narrow：通过（992 侧栏折叠、汉堡隐藏；390 侧栏离屏、抽屉可开合、折叠按钮隐藏；均无横向溢出）。
- focus：通过（每个 Tab 停靠点都有可见焦点环）。
- components：亮色通过；暗色剩 2 组，见 C3。

## 发现的问题

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| A2 | 输入框前后缀「¥」「元」3.31:1 | Element 的 `--el-input-icon-color` 默认取占位符色 | 已修：桥接改指 `color.text.muted` |
| A3 | 进度条内「50%」被算成白字压浅灰（1.09:1） | 渐变是 background-image，取色时读不到，退到轨道色 | 已修：渐变下垫同色实底（视觉不变），实际是白字压深金 5.27:1 |
| T1 | 金底白字、占位符被报低对比 | citrine-accept 的已批准例外写死为 Citrine 的颜色 | 已修工具：新增项目可配的 `APPROVED_CONTRAST`（`fg` / `bg` / `minRatio`），Citrine 结果不变（黄金后台组件走查前后一致） |
| T2 | 表格文字按钮悬停被算成深金压纯黑（3.98:1）、暗色白字压白底（1:1） | 组件探针合成背景时把半透明叠半透明当成不透明 | 已修工具：改为由底向上逐层合成（与页面审计同一算法） |
| C3 | 暗色表格文字按钮在选中行上再悬停，金字只有 3.41:1 | 选中行底 + 行悬停 + 按钮悬停三层叠加成 #414141 | 待确认：用户按「悬停行上约 4.3:1」决定保持暗色链接色，这一档更低，验收清单不放行 |

已登记为例外（用户 2026-10-09 决定保持）：暗色链接 / 文字按钮在悬停行与气泡上约 4.3:1；亮色表格文字按钮悬停叠底后约 4.2–4.4:1（清单里 `minRatio: 4.2`，再低照样报）。
