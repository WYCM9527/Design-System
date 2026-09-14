# 黄金后台 · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线

- 链接分四层：内容型 `.link`（订单号 / 名称：斜体下划线）、操作型 `.act`（编辑 / 详情 / 改派等动词：同色胶囊描边，`<a>` / `<button>` 同形，相邻直接并排不加「·」，危险加 `danger`；不要给它另写字号字重）、导览型 `.go`（查看全部 / 查看列表：文字 + `<Right class="i-icon--sm" />`）、标题型（待办 / 公告标题）；不要把动词写成 `.link`。
- 样式只引用 `design-system/dist` 生成的 CSS 变量（`--color-*`、`--space-*`、`--text-*`、`--control-*`、`--radius-*`、`--elevation-*`…），不写色值、像素字面量；页面骨架公共类来自 `@wycm9527/citrine/bridge/recipes.css`（种子配方层，从包引入，勿重写），只有本项目特有的选择器放 `src/styles/app.css`。
- 组件库是 Element Plus，已由 `@wycm9527/citrine/bridge/element-plus.css` 接到 token；不要改桥接、不要引 Element 的 dark css-vars。桥接、配方与配方组件全部来自 npm 包 `@wycm9527/citrine`（仓库内是 `file:../../../seeds/brand-yellow-e` 链接，项目里没有副本，改种子即生效）：统计卡 / 图表 / 趋势 / 表格骨架 `import X from '@wycm9527/citrine/vue/X.vue'`（`StatCard`：label / value / delta / up / positive / note / hint；`EChart` 的 option 只写数据与布局，不写颜色、线型），确认弹窗一律用 `@wycm9527/citrine/vue/confirm.js` 的 `confirmBox / confirmDanger`（关闭后焦点回到触发按钮），浮层内的离开确认用 `ConfirmBar.vue` + `inlineConfirm.js`。`design-system/` 由 `npx citrine upgrade` 升级（清单 `.citrine.json`）。
- IconPark 图标尺寸类六档 `i-icon--xs|sm|md|lg|xl|2xl`（桥接 `iconpark.css`），不在图标上写 font-size。
- 路由 `src/router.js`（hash 路由，`meta.menu` 对应侧栏项与角色权限），侧栏与顶栏在 `src/layouts/AdminLayout.vue`，角色与权限在 `src/store.js`，演示数据在 `src/mock/data.js`。
- 演示状态参数（`?state=empty|loading|error|invalid|success|disabled|missing`、`?step=2`、`?tab=`、`?role=`、`?theme=`）放在 `#` **之前**，页面用 `new URLSearchParams(location.search)` 读取（截图脚本依赖这一约定，不要用 `useRoute().query`）。
- 改完 UI 运行 `node ../../../../skills/design-system-steward/scripts/guard.mjs --project "$PWD"`，应为 `current`。
