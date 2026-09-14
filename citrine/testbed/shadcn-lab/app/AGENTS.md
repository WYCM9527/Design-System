# shadcn 实验室 · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线

- **样式入口** `src/styles/globals.css`：Tailwind → `design-system/dist/index.css` → `@wycm9527/citrine/bridge/shadcn.css` → `@wycm9527/citrine/bridge/recipes.css` → 项目补充 `app.css`。桥接与配方来自 npm 包（仓库内 `file:` 链接种子），项目里没有副本、不要改；`design-system/` 由 design-system-adopter 升级（`ds.mjs status / upgrade`，清单 `.adopter.json`）；`@theme inline` 已把颜色、字号阶梯、阴影、动效接到 token，Tailwind 的 `text-sm` 是 13px、`text-base` 14px、`rounded-md` 是 `radius.md`。
- **组件**：`src/components/ui/*` 按 shadcn new-york 源码手写（不经 CLI），可以用 shadcn 的 className 写法；哪个变体对应哪个角色、哪些变体**不用**（`Button link`、`Badge default / destructive`、文字型 `ghost`）见 DESIGN「组件库对照：shadcn/ui」。
- **页面骨架用配方类**（与 Vue 项目同一套）：`.page-head`、`.card-head`、`.filter / .conds / .acts`、`.chips / .chip`、`.batch`、`.pager`、`.form-page / .form-grid / .form-foot(.is-sticky)`、`.status.*`、`.badge.brand`、`.act / .link / .go / .title-link`、`.empty`、`.error-box`、`.stats`、`.confirm-bar`；壳层 `.app / .sidebar / .nav / .topbar / .content`。
- **配方组件** `@wycm9527/citrine/react/*`（`import { StatCard } from '@wycm9527/citrine/react/StatCard'`）：`StatCard`（label / value / delta / up / positive / note / hint）、`EChart`（option 函数 + deps）、`TrendChart`（days / series / count）、`TableSkeleton`、`ConfirmBar` + `useInlineConfirm`（Dialog 内的离开确认替换页脚，不叠第二层弹窗）。图表 option 只写数据与布局，颜色线型来自 `@wycm9527/citrine/echarts` 主题。
- **三端**（DESIGN「三端」）：窄屏 ≤1366 `.is-collapsed`；手机 ≤768 抽屉（`navOpen` → `.is-nav-open` + `.menu-btn` / `.sidebar-mask` / `.collapse-btn`）；Dialog 手机贴底全宽由桥接接管，页面不自己写媒体查询。
- **图标**：lucide，尺寸用 `i-icon--xs|sm|md|lg|xl|2xl`（recipes 对 `svg` 生效），弱化 `i-icon--muted`；图标按钮必须有 `aria-label` / `title`。
- **样式规则**：`app.css` 与组件 className 之外不写样式；`app.css` 只引用 token 变量，不写色值、像素字面量（Tailwind 的间距 / 尺寸类允许，它们已经接到刻度）。
- **演示参数**放在 `#` 之前：`?theme=dark`、`?state=invalid`（表单错误态）。验收清单 `accept.config.mjs`；组件走查页 `#/kitchen` 的浮层触发器加 `data-ks-open`（可选 `data-ks-type`），弹层触发器加 `data-ks-modal`。
- 改完 UI 运行 `npx tsc --noEmit && npm run build`，再 `npm run accept`；`node ../../../../skills/design-system-steward/scripts/guard.mjs --project "$PWD"` 应为 `current`。
