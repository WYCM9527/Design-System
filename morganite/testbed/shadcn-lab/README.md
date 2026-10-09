# shadcn 实验场 · Morganite 设计系统实测项目

`seeds/morganite` 的第二条消费路径：Vite + React 19 + Tailwind v4 + Radix 上的 shadcn/ui（new-york 源码 21 个组件），骨架照 Citrine 的 shadcn 实验室（`citrine/testbed/shadcn-lab`），按 design-system-adopter 接入 Morganite。每一轮发现的问题记在 [FINDINGS.md](FINDINGS.md)。

## 运行与验收

```bash
cd app
npm install
npm run dev            # http://localhost:5173
npm run accept         # 构建 + citrine-accept all：页面 × 亮暗、组件走查、三端（992 / 390）、Tab 焦点
```

- `app/design-systems/morganite` 是指向 `seeds/morganite` 的符号链接，`@wycm9527/morganite` 依赖也是 `file:` 链接到种子——改了种子的桥接、配方、React 组件或走查页模板，重新构建就生效；`app/design-system/` 是 `ds.mjs init` 生成的工作副本，token 构建与守卫走 steward（`style-dictionary` 要锁 5.5.2，steward 只认这个版本）。
- 验收清单 `app/accept.config.mjs`，已批准的对比度例外与种子 `templates/accept.config.mjs` 一致；工具以 `file:` 链接仓库里的 `citrine/tools`。

## 页面

URL 形如 `index.html?theme=dark#/kitchen`（`theme=light|dark`，首屏落成 `<html class="dark">`）：

- `#/` 工作台：`StatCard`、`TrendChart`、`rankBars` 排行、最近订单表。
- `#/orders` 单据：`.filter` / `.chips` / `.batch` / `.pager` 配方 + shadcn 控件。
- `#/form` 表单：`.form-page` / `.form-grid` / 吸底操作条，`?state=invalid` 展示错误态；离开确认用 React 版 `ConfirmBar`。
- `#/kitchen` 组件走查：直接用种子的 `templates/KitchenSink.tsx`（真实项目是拷进来）。
