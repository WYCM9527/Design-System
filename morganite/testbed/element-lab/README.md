# Element 实验场 · Morganite 设计系统实测项目

`seeds/morganite` 接入真实 Element Plus 的实测场：按 design-system-adopter「从 0 开始」接入，用种子自带的 `KitchenSink.vue` 和一张业务页核对桥接。每一轮发现的问题记在 [FINDINGS.md](FINDINGS.md)。

## 运行

```bash
cd app
npm install
npm run dev            # http://localhost:5173
npm run build          # 产物在 app/dist，相对路径 + hash 路由
npx vite preview --port 4317 --host 127.0.0.1   # 截图用：服务 dist
```

设计系统接线：

- `app/design-systems/morganite` 是指向 `seeds/morganite` 的符号链接（与 Citrine 的实测项目同一做法），`@wycm9527/morganite` 依赖也是 `file:` 链接到种子——改了种子的桥接、模板或 Vue 组件，重新构建就生效。种子改动后 `ds.mjs status` 会列出「快照与清单不一致」，在实测项目里属预期。
- `app/design-system/` 是 `ds.mjs init` 生成的工作副本，token 构建与守卫走 steward：

```bash
SKILL=../../../../skills/design-system-steward/scripts
node $SKILL/build-tokens.mjs --project "$PWD"    # 生成 design-system/dist
node $SKILL/guard.mjs --project "$PWD"           # 应为 current
```

种子的 token 改了以后，工作副本要跟着同步（`ds.mjs upgrade --from ../../../seeds/morganite`，或重新 `init`），再构建。

## 页面与参数

URL 形如 `index.html?theme=dark#/kitchen`：

- `#/`：工作台——种子的 `StatCard`、`TrendChart`，配方的筹码、状态胶囊、分页条，Element 表格（金额列 `class-name="num"`）。
- `#/kitchen`：种子的 `KitchenSink.vue`，Element Plus 全部组件的默认 / 选中 / 禁用 / 出错态；`data-ks-open` 标记的选择器可以点开看浮层。走查页按桌面宽度排版，390px 下固定宽度的日期 / 级联 / 上传组件会撑出屏幕，业务页不会。
- `theme=light|dark`：亮 / 暗两种模式（`<html class="dark">`）。
