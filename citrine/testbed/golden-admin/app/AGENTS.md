# 黄金后台 · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线

- 样式只引用 `design-system/dist` 生成的 CSS 变量（`--color-*`、`--space-*`、`--text-*`、`--control-*`、`--radius-*`、`--elevation-*`…），不写色值、像素字面量；页面级公共类在 `src/styles/app.css`。
- 组件库是 Element Plus，已由 `src/styles/bridge/element-plus.css` 接到 token；不要改桥接、不要引 Element 的 dark css-vars。图表用 `components/EChart.vue`（主题来自 `src/styles/bridge/echarts.js`），option 里只写数据与布局，不写颜色、线型。
- 路由 `src/router.js`（hash 路由，`meta.menu` 对应侧栏项与角色权限），侧栏与顶栏在 `src/layouts/AdminLayout.vue`，角色与权限在 `src/store.js`，演示数据在 `src/mock/data.js`。
- 演示状态参数（`?state=empty|loading|error|invalid|success`、`?step=2`、`?role=`、`?theme=`、`?density=`）放在 `#` **之前**，页面用 `new URLSearchParams(location.search)` 读取（截图脚本依赖这一约定，不要用 `useRoute().query`）。
- 改完 UI 运行 `node ../../../../skills/design-system-steward/scripts/guard.mjs --project "$PWD"`，应为 `current`。
