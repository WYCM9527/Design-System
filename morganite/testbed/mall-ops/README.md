# 拾光商城 · 运营后台 · Morganite 完整测试项目

用一个完整的运营后台检验 Morganite：Vue 3 + Element Plus，14 个业务页 × 4 个角色 × 50 个页面状态，按 design-system-adopter 接入。页面只用种子的配方与桥接，项目层样式 `app/src/styles/app.css` 一条规则都没有。产品设定见 [PRD.md](PRD.md)，实测结果和每条问题的去向见 [FINDINGS.md](FINDINGS.md)。

## 运行

```bash
cd app
npm install
npm run dev            # http://localhost:5173
npm run build          # 产物在 app/dist，相对路径 + hash 路由
npm run accept         # 构建 + citrine-accept all：页面 × 亮暗、组件走查、三端、焦点
```

设计系统接线：

- `app/design-systems/morganite` 是指向 `seeds/morganite` 的符号链接，`@wycm9527/morganite` 依赖也是 `file:` 链接到种子——改了种子的桥接、模板或 Vue 组件，重新构建就生效。开发服务器不会察觉种子的改动，要重启；改了种子的 JS（如 `echarts.js`）用 `npx vite --force` 重启，否则浏览器会继续用缓存里的旧模块（FINDINGS F11）。
- `app/design-system/` 是 `ds.mjs init` 生成的工作副本，token 构建与守卫走 steward：

```bash
SKILL=../../../../skills/design-system-steward/scripts
node $SKILL/build-tokens.mjs --project "$PWD"    # 生成 design-system/dist
node $SKILL/guard.mjs --project "$PWD"           # 应为 current
```

- 种子发了新版本，工作副本用 `ds.mjs status` 看差异、`ds.mjs upgrade --dry-run` 看分类，确认后再 `upgrade`。
- `app/AGENTS.md` 由 `ds.mjs agents --write` 生成：设计系统规则与本项目的接线说明，给 Agent 读。

验收清单在 `app/accept.config.mjs`（`PAGES` 列出全部页面状态），工具以 `file:` 链接仓库里的 `citrine/tools`。

## 页面与参数

URL 形如 `index.html?role=finance&theme=dark#/orders`，参数写在 `#` 前面：

- `role=admin|ops|service|finance`：管理员、运营、客服、财务。没权限的菜单隐藏，直接访问进 403；没权限的按钮禁用，悬停说明缺什么权限。
- `theme=light|dark`：亮 / 暗两种模式。
- 页面状态：`state=loading|empty|error|invalid|closed`（各页支持的不同，见 `accept.config.mjs`），另有 `tab`、`view=card`、`dialog`、`drawer=ship`、`audit`、`preset` 直达页签、卡片视图与弹窗。

页面：登录 `#/login`；工作台 `#/`、数据报表 `#/analytics`；订单 `#/orders`、订单详情 `#/orders/<单号>`、售后 `#/refunds`；商品 `#/products`、发布商品 `#/products/new`、编辑商品 `#/products/<编号>/edit`；客户 `#/customers`、客户详情 `#/customers/<编号>`；营销 `#/campaigns`；消息 `#/notices`、公告详情；成员与角色 `#/members`；系统设置 `#/settings`；另有库存盘点（建设中）、403 / 404 / 500 和组件走查 `#/kitchen`（种子的 `KitchenSink.vue`）。
