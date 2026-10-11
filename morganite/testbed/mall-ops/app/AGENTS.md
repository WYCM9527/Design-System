# 拾光商城 · 运营后台 · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线（Morganite 玫瑰金 · Vue 3 + Element Plus）

- **样式来源**：样式入口按顺序引入 Element Plus → `design-system/dist/index.css` → 桥接 `@wycm9527/morganite/bridge/{element-plus.css, iconpark.css}` → 配方层 `@wycm9527/morganite/bridge/recipes.css` → 项目补充 `app.css`（不引 `base.css`，桥接自带标题字号 / 行高 / 字重、按钮继承字体这些基础规则）。桥接与配方是上游只读快照 / npm 包，不改；页面 `<style scoped>` 与 `app.css` 只引用 token 变量（`--color-*`、`--spacing-*`、`--space-*`、`--text-*`、`--control-*`、`--radius-*`、`--border-*`、`--elevation-*`），不写色值与像素字面量。像素只允许出现在按内容定的宽度（表格列宽）上。
- **桥接按 DESIGN 与效果预览逐组件接管**：Element 的 `--el-*` 变量与写死的主色 / 焦点 / 色表都接到语义 token 上，尺寸、字号、圆角、选中态与效果预览一致（分段类是灰轨道上的白块，其余选中走主色系）；已在 Element Plus 2.14 上用完整项目实测过（种子仓库 `morganite/testbed/mall-ops`）。接入后挂走查页 `@wycm9527/morganite/vue/KitchenSink.vue` 到 `/kitchen`，亮 / 暗两种模式下逐组件看一遍 hover / focus / disabled。
- **页面骨架与页面形态用配方类，不自己重写**（`recipes.css`）：壳层 `.app/.sidebar/.topbar`（首页把面包屑换成问候语 `.greet`，头像区 `<button class="user">` + `.avatar`）、页头 `.page-head`（详情标题 + 状态胶囊 `.title-row`；看板页用 `.section-label` + `.page-bar`）、看板 `.board` + 看板卡 `<el-card class="flat panel">`、两栏 `.two-col`、纵向堆叠 `.stack`、卡片栅格 `.card-grid`、设置行 `.setting`、横向表单 `.hform`、附件行 `.file-row`、登录页 `.login*`、图例 `.legend` / 占比列表 `.alloc-list` / 目标进度 `.goals`（分类色 `.c1–.c6`）、筛选栏 `.filter`（控件宽度 `.w-search` / `.w-select` / `.w-date`）、状态胶囊 `.status.*`、操作胶囊 `.act`（一组放进 `.act-group`）、表单页 `.form-page`（只给单列竖向表单）、统计卡 `.stats`；配方组件在 `@wycm9527/morganite/vue/*`（StatCard / EChart / TrendChart / TableSkeleton / ConfirmBar），图表主题来自 `@wycm9527/morganite/echarts`（运行时读 token）。
- **Element 用法约定**：表格放进 `<el-card class="flat">` 贴边（首尾列自动让出卡片内边距），勾选列宽 48；卡片顶部的 `el-tabs` 自动缩进与卡片标题对齐，不用另加类；步骤条用 `finish-status="success"`（已完成显示勾）、不加 `align-center`（桥接排成效果预览的横排）；通栏按钮 `class="is-block"`；弹窗 `class="is-sm"`（确认）/ `"is-md"`（表单）并 `append-to-body`；金额、日期列 `class-name="num"`（正文字体 + 等宽数字），单号包 `.mono`；统计数字用 `el-statistic` 或 `StatCard`（D-DIN-PRO）。
- **页面状态与权限**（DESIGN「页面状态与权限」）：加载用 `TableSkeleton`（列宽与真实表格一致），空用 `.empty`（插图 + 一句说明 + 至多一个主操作），区域出错用 `.error-box` + 重试按钮，无权限的地址进 403 结果页 `.result`；按角色禁用的按钮外包一层 `<span>` 挂 `el-tooltip` 写明缺的权限（禁用按钮不触发悬停），只读角色用只读态。
- **另一模式**：按 `design-system/theme-map.json` 的激活方式切换（class 激活 = `<html class="dark">`）；不要引 Element 的 dark css-vars。
- **上游快照只读**：`design-systems/morganite/` 是设计系统的上游快照，永不手改（改了 `ds.mjs status` 会报警）；项目需要的差异写在自己的 `app.css` / 工作副本 `design-system/`（scope / 豁免），需要共享的向上游提提案。配方不够用时**不在页面上补样式**；效果预览里有、配方里没有的样式也先提案，不照着预览另写一套。
- **验收**：改完 UI 运行 `npm run build` 与 `npx citrine-accept all`（页面 / 组件 / 三端 / 焦点；清单 `accept.config.mjs` 按种子 `templates/accept.config.mjs` 建，已批准的对比度例外写在它的 `APPROVED_CONTRAST`，需要 `@wycm9527/citrine-tools` ≥ 1.2.0）；steward `guard.mjs --project $PWD` 应为 `current`，`status.mjs` 页面字面量清零；对比度基线用 `check-contrast.mjs --system design-system`。
