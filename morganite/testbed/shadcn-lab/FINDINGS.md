# 实测反馈 · 第一轮（2026-10-09）

> 记录 Morganite 种子撞上真实 shadcn/ui 时发现的问题：是谁的问题、修在哪一层、修了没有。

技术栈：Vite 7 + React 19 + Tailwind v4 + Radix（shadcn/ui new-york 源码 21 个组件）+ ECharts 6。接入：`ds.mjs init --system <种子目录> --stack shadcn`，快照换成指向种子的符号链接。

## 结果

- steward `build-tokens` 通过、`guard` current，`vite build` 通过。
- citrine-accept 四项全部通过：页面（5 个页面状态 × 亮暗，低对比都落在已批准例外里）、组件走查（亮暗都 0 发现）、三端（992 侧栏折叠；390 侧栏离屏、抽屉可开合；均无横向溢出）、Tab 焦点。

## 发现的问题

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| S1 | 弹窗 / 确认弹窗的面板是灰色 | shadcn 的 DialogContent 写 `bg-background`，桥接把 `--background` 映射成页面底（#F5F5F5）；DESIGN 的弹窗面板是 `color.bg.elevated` | 已修（桥接）：dialog / alert-dialog / sheet / drawer 面板改为 `color.bg.elevated` |
| S2 | 描边 / 幽灵按钮悬停后文字变深金，弹窗里压在叠底上只有 4.4:1；暗色描边按钮没有边线 | 悬停走 `accent`（本系统是「选中」语义：浅底 + 深金字）；暗色描边取 `--input`（填充式下透明） | 已修（桥接）：按 DESIGN 白底 + `color.border.strong` 描边，悬停只换底（`action.secondary-hover` / `quiet-hover`）、文字保持正文色；按钮没有变体属性，用稳定的类名片段区分 outline 与 ghost |
| S3 | 暗色错误提示条的标题「提交失败」3.31:1 | 桥接只把描述改成了 `color.text.danger`，标题仍继承 `text-destructive`（危险填充色） | 已修（桥接）：提示条整体用 `color.text.danger` |
| S4 | 卡片、输入框、表格行线、描边按钮是 1px，Element 那边是 0.6px | Tailwind 的 `border` / `border-*` 写死 1px，桥接没接 `border.width.default` | 已修（桥接）：按类名把线宽接到 token，只作用于本来带这些类的元素 |
| S5 | 顶栏用户区悬停时头像里的深金字 4.42:1 | 头像底（4% 黑）叠在用户区悬停底（4% 黑）上 | 已修（配方，Element 也受益）：悬停时头像底换成表面色 |
| S6 | 种子没有 shadcn 版走查页，说明里写「KITCHEN 先写 null」 | Morganite 的模板来自生成器，没带 Citrine 的 `templates/KitchenSink.tsx` | 已修（种子）：移植走查页模板，身份文件 shadcn 栈登记 `kitchen` |
| T3 | 首次构建 token 失败：steward 要求 `style-dictionary@5.5.2`，装到的是 5.6.0 | `package.json` 写 `^5.5.2`，没有锁文件时会装到新版本 | 本项目已锁 5.5.2（`--save-exact`）；adopter 打印的安装命令也该带 `--save-exact`（工具问题，未改） |

## 没覆盖到

- 表格操作列的「描边胶囊」（`.act`）是 Citrine 的写法，antd 表格这里是纯文字链接；用户 2026-10-09 决定保持胶囊（AUDIT 用户决定表）。

# 实测反馈 · 第二轮（2026-10-10，对照效果预览）

用户发现 `#/orders` 与效果预览的 `#/transactions` 差很多（表格边距、表单输入框、面包屑、标签颜色等）。写了逐角色比对脚本：同一视口、亮暗各一遍，在两页上读对应元素（顶栏、面包屑、页头、按钮、筛选栏、输入框、下拉、表头 / 表体单元格、勾选框、单号、状态 / 类别标签、操作胶囊、分页）的尺寸、内边距、字号、颜色、底色、边线、圆角。

## 发现与处理

| # | 现象 | 根因 | 处理 |
| --- | --- | --- | --- |
| P1 | 按钮、输入框、下拉、菜单的字比预览小一号，按钮偏粗 | 桥接把 `text-sm` 映射成小号正文 12px；shadcn 按钮是 font-medium、gap-2，带图标时收窄 | 已修（桥接）：`text-sm` = 正文 14px（表格单独 12px），补行高；按钮常规字重、间距 `spacing.1-5`、带图标不收窄 |
| P2 | 筛选栏的输入框和下拉看不出框 | shadcn 是透明底 + `--input` 描边，本系统 `--input` 透明 | 已修（桥接）：填充式（`bg.input`，悬停 `border.strong`，聚焦 `border.focus`，出错 `status.error`） |
| P3 | 表格勾选框看不见；开关关闭时没有轨道、单选没有圈 | 同上，都继承透明的 `--input` | 已修（桥接）：未选描 `border.strong` × `border.width.control`，开关关闭轨道 `border.strong`，焦点改为外环 |
| P4 | 分页样式不同（24px、4px 圆角、文字上一页 / 下一页） | 分页只在预览的 `components.css` 里，本项目用的是从 Citrine 带来的自写样式 | 已修（种子）：配方新增 `.pagination` / `.page`（预览改用配方），本页改成同样的结构，补总数、省略号、每页条数 |
| P5 | 没有类别标签列 | 页面内容差异；中性类别标签也只在预览里（`.cat`） | 已修（种子）：配方新增 `.tag`（预览的 `.cat` 改为 `.tag`），本页加「类型」列 |
| P6 | 顶栏：多了折叠按钮、没有搜索框，面包屑位置不同 | 骨架照 Citrine 的实验室；面包屑本身的样式两边一致 | 已修：去掉桌面折叠按钮（预览没有，窄屏仍自动折叠），加顶栏胶囊搜索（配方 `<label class="search">`，预览改用配方） |
| P7 | 筛选栏「查询」是主按钮且排在前面 | 页面写法 | 已修：照预览「重置（文字按钮）→ 查询（次要按钮 + 图标）」 |
| P8 | 焦点检查：输入框「没有焦点环」 | 按 DESIGN 输入框只换边线、不加外环，旧的通过是因为 shadcn 的透明外环被误算 | 已修（工具）：清单 `FOCUS.inputBorder: true`，输入类控件按边线变成焦点色（出错保持错误色）认焦点 |

比对后剩下的差异只是写法不同（表头灰底画在 thead 上、行线画在 tr 上、固定高度下的上下内边距）或数据内容不同（预览多一排状态快捷筛选、说明列是两行）。验收四项全部通过。
