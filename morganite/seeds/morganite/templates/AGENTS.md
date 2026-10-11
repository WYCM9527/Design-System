# {{PROJECT}} · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线（{{SYSTEM_NAME}} · {{STACK_LABEL}}）

{{STACK_NOTES}}
- **上游快照只读**：`design-systems/{{SYSTEM_ID}}/` 是设计系统的上游快照，永不手改（改了 `ds.mjs status` 会报警）；项目需要的差异写在自己的 `app.css` / 工作副本 `design-system/`（scope / 豁免），需要共享的向上游提提案。配方不够用时**不在页面上补样式**；效果预览里有、配方里没有的样式也先提案，不照着预览另写一套。
- **验收**：改完 UI 运行 `npm run build` 与 `npx {{ACCEPT_COMMAND}}`（页面 / 组件 / 三端 / 焦点；清单 `accept.config.mjs` 按种子 `templates/accept.config.mjs` 建，已批准的对比度例外写在它的 `APPROVED_CONTRAST`，需要 `@wycm9527/citrine-tools` ≥ 1.2.0）；steward `guard.mjs --project $PWD` 应为 `current`，`status.mjs` 页面字面量清零；对比度基线用 `check-contrast.mjs --system design-system`。
