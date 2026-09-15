# 剧本 · 非 Node 项目（Flask / Django / PHP / 静态模板）

目标：项目运行时没有 Node、装不了 npm 包，也要用上设计系统——**用构建好的 CSS，不要手搬变量**。设计系统的交付物本来就是纯 CSS；Node 只在维护者构建 token、跑验收工具时需要，可以在任何一台有 Node 的机器上完成。

## 判断

- 项目根没有 `package.json`，页面是服务端渲染模板（Jinja / Django / Blade / Twig / 纯 HTML），样式是一两个手写 CSS。→ 走本剧本。
- 有 Bootstrap 之类组件库：桥接缺口（身份文件 `stacks` 里没有），只能覆盖骨架与 token，组件仍旧样子——如实告知，交给维护者评估写桥接。

## 步骤

1. **导出**（在有 Node 的机器上，来源是种子目录 / npm 包 / 已接入项目的快照）：
   `node <adopter>/scripts/ds.mjs export --system <种子目录|id|npm包名> --to <项目>/static/citrine`
   得到 `index.css`（token 亮 + 暗色 delta）、`recipes.css`（页面骨架公共类，与组件库无关）和清单 `design-system.export.json`；每个文件带版本头。有组件库桥接可加 `--with element-plus`。
2. **接线**：模板 `<head>` 按顺序 `<link>`：`index.css` → `recipes.css` → 项目自己的样式。暗色：`<html class="dark">`（首屏脚本读 `?theme=` / localStorage）。
3. **项目样式只引用变量**：`admin.css` 里把颜色 / 字号 / 间距 / 圆角 / 阴影改成 `var(--color-text-primary)` 这类引用，不写值（表格列宽、筛选控件宽度这类"按内容定"的宽度除外）。**导出文件只读**——再次 `export` 会拦截被手改的文件（`--force` 才覆盖）。
4. **模板用配方类**：壳层 `.app / .sidebar / .nav / .topbar / .content`，页头 `.page-head`，筛选栏 `.filter`，条件标签 `.chips`，状态胶囊 `.status.*`，操作胶囊 `.act`，表单 `.form-grid / .form-foot`，空态 `.empty`，统计卡 `.stat-card`，分页 `.pager`。三端内置：窄屏由项目 JS 按 `matchMedia('(max-width: 1366px)')` 加 `.is-collapsed`；手机抽屉用 `.menu-btn` / `.sidebar-mask` / `.is-nav-open` 十行原生 JS。模板切换显隐用 `hidden` 属性即可（recipes 保证它优先）。
5. **迁移旧 CSS**（有 Node 的机器上）：steward `audit --project <项目>` 报工程量，`migrate --phase replace / settle` 按角色对照表替换（不需要项目是 Node 工程，只读写目录里的 CSS）。**不建 `design-system/` 工作副本**——`build-tokens` 需要项目里有 `node_modules/style-dictionary`，非 Node 项目直接消费导出的 CSS。
6. **验收**：服务器跑起来后
   `npx citrine-accept pages --url http://127.0.0.1:<port> --tokens <项目>/static/citrine`（`narrow` / `focus` 同理加 `--url`）。`accept.config.mjs` 的页面写服务器路径（`['orders', '/admin/orders?state=empty']`）而不是 hash。
7. **升级**：维护者出新版后再 `export` 一次（未变 / 更新 / 新增逐文件列出），项目样式不用动；对照种子 CHANGELOG 看是否有需要模板配合的项。

## 不做的事

- 不把变量值抄进项目 CSS（等于 fork token，升级与暗色都断）。
- 不在项目里改导出的 `recipes.css` / `index.css`；差异写项目样式，公共诉求向上游提。
