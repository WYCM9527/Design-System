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

- 表格操作列的「描边胶囊」（`.act`）是 Citrine 的写法，antd 表格这里是纯文字链接；属于 AUDIT「风险与待确认」里还没按 antd 走查的配方，这轮没动。
