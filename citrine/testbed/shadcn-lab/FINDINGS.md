# shadcn/ui 实验室 · 发现与回填

编号沿用 D 序列（D99 起）。**类型**：S = 设计系统层（桥接 / 配方 / DESIGN / 工具），P = 项目层，N = 记录不改。验证手段：`citrine/tools` 的页面扫描（10 个状态 × 亮暗）、全组件走查（80 个交互元素 × 强制 hover / focus，Radix 浮层与弹层逐个点开）、1366 窄屏、Tab 焦点。

| # | 发现 | 根因 | 类型 | 处理（2.5.0） |
| --- | --- | --- | --- | --- |
| D99 | 所有 shadcn 组件都比设计小一号：`size-4` 量出 14px、`h-9` 31.5px | `recipes.css` 把 `html { font-size: 14px }` 当正文字号，Tailwind 的 rem 刻度随之缩 12.5% | S | recipes 只在 `body` 设正文字号，`html` 保持 16px；Element 项目不受影响（全是 px），像素回归通过 |
| D100 | Card / Alert / Input 只写 `border` 时边线是文字色（暗色下白边） | Tailwind v4 preflight 的 `border-color: currentColor`；shadcn 官方 globals 用 `@layer base` 改回 `--border`，桥接没做 | S | 桥接补 `@layer base { * { border-color: var(--border); outline-color: focus.ring } }` |
| D101 | 控件三档高度不对：shadcn 的 `h-8 / h-9 / h-10` 是 32 / 36 / 40，Citrine 是 28 / 34 / 40 | Tailwind 刻度与 token 不同源 | S | 桥接按 `data-slot` 把 `h-8 / h-9 / h-10 / size-9` 与 `SelectTrigger[data-size]` 接到 `control.height.*` |
| D102 | Tooltip 是黄底深字 | shadcn 默认 `bg-primary text-primary-foreground` | S | 桥接改为 `bg.inverse` + `text.inverse`（含箭头） |
| D103 | Dialog / AlertDialog 遮罩写死 `bg-black/50`；Skeleton 用 `accent`（选中底）；Progress 轨道是 `primary/20`（黄的洗色） | 组件源码写死 | S | 桥接接管 `*-overlay` → `bg.overlay`，`skeleton` → `bg.skeleton`，`progress` 轨道 → `border.default` |
| D104 | 表格表头正文色、行 hover `muted/50`；Tabs 选中项是白色浮块；菜单项 focus 用 `accent`（选中底） | shadcn 默认 | S | 桥接：表头 `bg.subtle` + `text.secondary` + 500、hover `bg.hover`、选中行 `bg.selected-subtle`；Tabs 选中项深黑反转块（分段选择器配方）；菜单 / 下拉项 focus `bg.hover` |
| D105 | Checkbox / Radio / Switch 命中区 16px（页面扫描 44 处提示） | 视觉尺寸即命中区 | S | 桥接用伪元素外扩到 `control.hit-min`（视觉不变） |
| D106 | 焦点双环：shadcn 自带「边线换 ring + 3px 半透明环」，桥接的全局 outline 再叠一层；环色是近黑 50% 而不是 16% 灰环 | 两套模型叠加 | S | 有 `data-slot` 的元素不再叠全局 outline；`--tw-ring-color` 换成 `focus.ring` |
| D107 | `TabsContent` 是 Tab 停靠点但 `outline-none`，焦点检查 `NO RING` | shadcn 源码 | S | 桥接补 `tabs-content:focus-visible` 焦点环、`tabs-trigger` 环宽 2px |
| D108 | 走查脚本把 shadcn 主按钮 hover 报成「白字白底」 | Tailwind v4 的 `bg-primary/90` 编译成 `color-mix()`，Chrome 计算值是 `oklab(…)`，探针只认 `rgb()` | S（工具） | 两个探针的颜色解析加 canvas 归一化，`oklab / oklch / lab / color()` 都能算对比 |
| D109 | 走查脚本只认 Element 的 `.el-popper` / `.el-overlay`，Radix 浮层打不开就报错；页面扫描等 `#app` | 工具与 Element 耦合 | S（工具） | `POPPER_SEL` 兼容 `[data-radix-popper-content-wrapper]` / `role=menu|listbox|tooltip`，弹层兼容 `role=dialog|alertdialog`，挂载点兼容 `#root`，非 Element 下拉触发器不再取空 |
| D110 | 页面骨架配方能直接复用：`.page-head / .filter / .chips / .batch / .status / .act / .go / .form-foot / .stats / .confirm-bar` 在 React 里零改动 | recipes 只引用 token、不含组件库选择器 | N | 记录；`.sidebar .el-menu` 之外补了纯 CSS 的 `.nav` 导航、`svg.i-icon--*` 图标尺寸与 `.crumbs` 面包屑，React 壳层不再依赖 Element |
| D111 | shadcn 有几个变体与规则天然相悖：`Button link`（白底黄字）、`Badge default`（黄底徽标）、`Badge destructive`（红实底）、`Button ghost` 文字按钮裸放 | 主色是黄时这些变体的默认语义就是错的，CSS 变量层无法区分变体 | N | 写进 DESIGN「组件库对照：shadcn/ui」的**不用**清单，替代写法给出 |
| D112 | 探针能算 `oklab()` 之后才浮出来：`Alert variant="destructive"` 的描述文字是 `text-destructive/90`（红的 90% 洗色），白底 3.3:1 | shadcn 源码 | S | 桥接把 `.text-destructive [data-slot=alert-description]` 接到 `text.danger` 实色 |

## 验收

`npm run accept`：10 个页面状态 × 亮暗 0 违规；走查 80 个交互元素 × 亮暗，静息黄色只有主按钮 / 勾选开关选中 / 进度 / 数据卡描边 / Logo，hover / focus 0 新增黄色、0 掉档、0 外来颜色；1366 侧栏折叠无溢出；20 类 Tab 停靠元素全部有焦点环。
