# 实测项目四 · Citrine × shadcn/ui 实验室

第二条消费路径的**渲染验证**：Vite + React 19 + Tailwind v4 + Radix 上的 shadcn/ui 组件（按 new-york 源码手写 21 个），从 npm 包 `@wycm9527/citrine` 引入 `bridge/shadcn.css`，页面骨架直接用与组件库无关的 `recipes.css`，配方组件用 `@wycm9527/citrine/react/*`。此前这条路径只做过变量级验证（引用可解析），从未画出来看。

## 页面

- `#/kitchen` 组件走查：按钮 5 种变体 × 尺寸、徽标与状态胶囊、输入（含禁用 / 出错）、勾选 / 开关 / 单选、下拉 / 菜单 / 弹出层 / 提示、标签页、表格 + 操作胶囊、弹窗 / 确认弹窗、提示条 / 进度 / 骨架、统计卡 / 卡片 / 条件标签 / 导览链接、表单页脚。浮层触发器带 `data-ks-open`，弹层带 `data-ks-modal`，供 `citrine/tools` 的走查脚本逐个点开。
- `#/` 工作台：`StatCard`（含 hint）、`TrendChart`、`rankBars` 排行、最近订单表。
- `#/orders` 列表页：`.filter` / `.chips` / `.batch` / `.pager` 配方 + shadcn 控件，可勾选、可筛选。
- `#/form` 表单页：`.form-page` / `.form-grid` / `.form-foot.is-sticky` + shadcn 控件；弹窗里的离开确认用 React 版 `ConfirmBar`（原位确认条）。`?state=invalid` 展示错误态。

## 运行与验收

```bash
cd app && npm install && npm run build     # style-dictionary 锁 5.5.2；design-system/dist 已随仓库提供
npm run accept                              # 页面扫描 × 亮暗 → 全组件走查（Radix 浮层）→ 1366 窄屏 → Tab 焦点
```

`?theme=dark` 直达暗色。验收清单在 `app/accept.config.mjs`。

## 发现

见 [FINDINGS.md](FINDINGS.md)：桥接缺的 8 处组件级接管、Tailwind 根字号与 rem 刻度的冲突、验收工具对 `color-mix` 计算值与 Radix 浮层的适配，以及 shadcn 变体与 Citrine 角色的对照（进了 DESIGN「组件库对照：shadcn/ui」）。
