# 黄金后台 · 设计系统实测项目

`seeds/brand-yellow-e` 的实测场。产品需求在 [PRD.md](PRD.md)，每一轮实测发现的问题记在 [FINDINGS.md](FINDINGS.md)；验收截图由仓库级工具生成到 `citrine/tools/out/golden-admin/`（不入库）。

## 运行

```bash
cd app
npm install
npm run dev            # http://localhost:5173
npm run build          # 产物在 app/dist，用相对路径与 hash 路由，可直接静态托管
```

设计系统在 `app/design-system/`（从种子复制），构建与守卫走 skill：

```bash
SKILL=../../../skills/design-system-steward/scripts
node $SKILL/build-tokens.mjs --project "$PWD"    # 生成 design-system/dist
node $SKILL/guard.mjs --project "$PWD"           # 应为 current
node $SKILL/status.mjs --project "$PWD"          # 应为 unified 100%
```

## 直达任意页面与状态（截图脚本用同一套参数）

URL 形如 `index.html?theme=dark&state=empty#/orders`：

- `theme=light|dark`：亮 / 暗两种模式
- `role=admin|ops|auditor|finance`：以某个角色进入（财务访问订单即 403；审核员打开商户编辑即只读）
- `state=loading|empty|error`（订单列表 / 工作台）、`state=error`（登录）、`state=invalid`（商户表单三种错误同屏）
- `audit=1`（商户审核弹窗）、`dialog=1`（新建活动弹窗，含负数校验）、`view=card`（活动卡片视图）
- hash 路由内的 `?reassign=1`（订单详情直接打开改派抽屉）
- 第二轮：`tab=settlement#/analytics`（结算页，需财务或管理员）、`dialog=1#/riders`（派单弹窗）、`#/notices/a1`（公告详情）、`state=pwd#/profile`（密码校验错误）、`#/error/500`、任意不存在的路径 → 404

## 验收

验收基线（阈值与已批准的例外）以种子 `design-system/DESIGN.md` 的「验收基线」一节为准。工具在仓库级 [`citrine/tools/`](../../tools/)（页面清单登记在 `app/accept.config.mjs`），在 `app/` 目录 `npm run accept` 一键跑完：全部页面状态 × 亮 / 暗的自动扫描（对比度、可访问名称、命中区、溢出、截断、重复 id）、全组件走查（hover / focus 不新引入黄色、悬停不掉对比、无外来颜色）、1366px 窄屏、Tab 键焦点遍历、预览 E 与 S 的像素一致。只需 Node ≥ 22 与 Chrome。结果记进 [FINDINGS.md](FINDINGS.md)。

`#/merchants/:id`（商户详情，页签 + 日志 + 结算）是第三轮盲测产物；`#/merchants/apply`（入驻申请，三步表单）是第二轮盲测产物，同样只凭文档完成后保留为常规页面。

`#/refunds`（退款审核）是盲测产物：由一个只读过 `AGENTS.md` 与 DESIGN.md、禁止看其他页面源码的 Agent 完成，之后按补全的配方对齐（筛选栏形态、操作列按钮、批量条），保留为常规页面参与回归。

`#/kitchen` 是组件走查页：Element Plus 全部组件的静息 / 选中 / 禁用 / 出错状态铺在一页（浮层与弹层带 `data-ks-open` / `data-ks-modal` 标记供脚本逐个打开），用于桥接覆盖率扫描——亮 / 暗两种模式下对每个交互元素强制 hover / focus-visible，看是否新引入黄色、对比是否掉档、颜色是否都来自 token。不是业务页面，不进侧栏。

## 结构

```text
app/
├── design-system/            # 种子副本 + 本项目的 exemptions.json
├── accept.config.mjs         # 验收清单（citrine/tools 读取）
├── src/styles/globals.css    # 样式入口顺序：Element Plus → 设计系统 dist → 桥接 → 配方层 recipes.css → 项目补充 app.css
├── src/styles/bridge/        # 种子 bridge/ 的同步副本（element-plus.css / iconpark.css / echarts.js / recipes.css / vue/）
├── src/layouts/AdminLayout.vue
├── src/pages/                # Login / Dashboard / Orders / OrderDetail / Merchants / MerchantForm / MerchantApply / MerchantDetail / Refunds / Campaigns / Members
│                             # Analytics / Riders / Notices / NoticeDetail / Profile；异常页 Forbidden / NotFound / ServerError；组件走查页 KitchenSink
├── src/mock/data.js          # 确定性模拟数据
└── src/store.js              # 角色 / 主题 / 折叠
```
