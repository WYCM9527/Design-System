# {{PROJECT}} · Agent 规则

## 设计系统（design-system-steward 三行规则）

1. 所有 UI 修改先阅读 `design-system/DESIGN.md` 与当前 Scope／Theme 的登记和说明，只使用已管理的设计决定。
2. 若需求需要新增、修改或跨页面复用的视觉决定，先提出提案；确认后先更新设计系统源、构建并运行 Guard，再实现页面。
3. 不要手改 `design-system/dist/`；一次性差异先作为 Drift 或实验处理，不自动升级为规范。

## 项目接线（{{SYSTEM_NAME}} · {{STACK_LABEL}}）

{{STACK_NOTES}}
- **上游快照只读**：`design-systems/{{SYSTEM_ID}}/` 是设计系统的上游快照，永不手改（改了 `ds.mjs status` 会报警）；项目需要的差异写在自己的 `app.css` / 工作副本 `design-system/`（scope / 豁免），需要共享的向上游提提案。配方不够用时**不在页面上补样式**。
- **验收**：改完 UI 运行 `npm run build` 与 `{{ACCEPT_COMMAND}}`（清单在 `accept.config.mjs`）；`design-system-steward` 的 `guard.mjs --project $PWD` 应为 `current`。演示参数（`?theme=dark`、`?state=…`）放在 `#` 之前，页面用 `location.search` 读取。
