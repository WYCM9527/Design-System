# 剧本 · 更换现有规范（旧项目换新）

目标：把有旧样式（可能还有自建 design-system/）的项目换成我们的设计系统。分三期，每期结束都可上线。**先装种子当 Core，再迁移存量**——不要先用 steward 从旧代码提炼 Core（方向相反）。

## 第 0 步 · 前置

- 项目必须在 git 里且工作区干净（steward `migrate --apply` 的硬要求）；不干净先让用户提交。
- `ds.mjs detect` 看现状：有无自建 `design-system/`、有无我们的种子候选。
- steward 就位（`ds.mjs steward locate`，必要时征得同意 `install`）。

## 第一期 · 换肤（1–2 天，收益最大）

1. steward `audit --project $PWD` 只读扫一遍：旧变量多少、硬编码多少、内联样式多少——这是给用户的「工程量报告」。
2. 拿种子（npm 或文件夹，同新项目剧本）→ `ds.mjs init --system <id> --stack <栈> --legacy-rename`（**先告知用户**：原 `design-system/` 会改名 `design-system.legacy/` 当迁移证据；没有自建 design-system/ 就不用该 flag）。
3. `build-tokens` → `guard` current → 按 init 打印的接线换样式入口。组件库桥接挂上那一刻，按钮 / 表格 / 表单 / 弹窗就已经是新样子（组件库占页面视觉的七八成）。
4. 旧变量做别名过渡：在一个 `theme-compat.css` 里把旧变量名指向新 token（`--text: var(--color-text-primary)`），没改到的老页面立刻拿到新值；此文件登记进豁免或列入二期清理清单。
5. 跑验收的页面扫描，把旧页面的低对比 / 黄色泄漏 / 命中区问题列成二期清单。

## 第二期 · 按页面收编（视规模 3–10 天）

1. steward `migrate --phase adopt`：`design-system.legacy/` 与旧 CSS 里的变量桥接为新 token 别名（没有旧变量就跳过）。
2. `migrate --phase replace [--apply]`：值相等且语义唯一的字面量自动替换，生成 `MIGRATION.md`。
3. `migrate --phase settle`：拿到待决清单后，**用快照里的 `migration/roles.json`（角色 → 新 token，含 CSS 属性上下文与「无对应物」的替代写法）起草决策文件**——按角色映射，不按色值找最接近的灰；旧系统独有的东西（深黄 hover、淡黄选中底、彩色链接）按 `noEquivalent` 的替代写法改。草稿给用户过目，确认后 `settle --apply --decisions-file`。
4. 有意不纳管的（第三方嵌入、营销页）写 `exemptions.json` 带理由。
5. 页面结构逐页换配方类（`.page-head / .filter / .act / .status / .form-foot` …），删自写骨架样式；每收编一批跑一次验收，用数字当进度。

## 第三期 · 收尾

steward `status` 到 `unified`、`guard` 到 `current`；`ds.mjs agents --write`（确认后）写项目规则防回潮；验收进 CI；`design-system.legacy/` 与 `theme-compat.css` 确认无引用后删除。

## 常见岔路

- 旧项目**没有**任何 token / 变量（纯硬编码）：跳过 adopt，直接 replace → settle；audit 的字面量报告就是全部工程量。
- 旧项目用的组件库没有桥接（不在身份文件 stacks 里）：如实告知——桥接是设计系统层的缺口，需要向上游提「新增栈」，不要现场给页面糊样式。
- 用户只想「先看效果」：只做第一期，二期清单交给用户排期。
