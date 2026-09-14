---
name: design-system-adopter
description: 把公司发布的设计系统（带 design-system.json 身份文件的种子包，如 Citrine）接入任意 Web 项目并保持更新。用户说「用 XX 设计系统起项目 / 接入设计系统 / 换成公司设计规范 / 更换现有规范 / 升级设计系统 / 设计系统有没有新版本 / update design system」，或项目里出现 design-systems/<id>/ 快照、design-system/.adopter.json 时使用。覆盖：从 0 接入、旧项目换规范（配合 design-system-steward 迁移）、按 tag 拉上游 + 三方合并更新、生成 AGENTS.md 项目规则、验收归因。不用于：治理 / 提炼项目自己的设计系统（那是 design-system-steward）、普通的孤立 UI 修改。
metadata:
  version: "0.1.0"
---

# Design System Adopter

把「我们的设计系统」落进项目、接好线、跟着上游版本走。机制全部在 `scripts/ds.mjs`（零依赖，Node ≥ 22），数据全部来自设计系统包根的 `design-system.json` 身份文件——本 skill 与具体设计系统无关，任何带身份文件的系统（Citrine 或以后的新系统）都适用。

## 30 秒心智模型

- **种子包**：设计系统的分发单元（`design-system/` token + 规则、`bridge/` 桥接与配方、模板、身份文件）。渠道两条：npm 包（优先）或直接下载文件夹，等价。
- **快照** `design-systems/<id>/`：种子包在项目里的只读副本，升级时三方合并的基线。提交进 git，永不手改（`status` 会 hash 报警，`restore` 恢复）。
- **工作副本** `design-system/`：从快照生成、steward 治理的那份（可加 scope / 豁免 / 局部 token）。升级时本地修改被三方合并保留。
- **识别**：只有带合法 `design-system.json`（id + version + upstream + stacks）的目录才是「我们的系统」；用户自建的 `design-system/`（steward 提炼的）没有身份文件，一律不纳管、不误伤。
- **一个项目只有一个活动设计系统**；换系统 = 走「更换现有规范」。

## 入口：先问一件事

被触发后，先跑 `node scripts/ds.mjs detect --project <项目>` 看现状，然后让用户在三个场景里选（已能从上下文确定就不用问）：

1. **从 0 开始**（新项目 / 空目录）→ [references/new-project.md](references/new-project.md)
2. **更换现有规范**（项目已有旧样式或旧 design-system/）→ [references/existing-project.md](references/existing-project.md)
3. **只更新**（已接入，想跟上游版本）→ [references/upgrade.md](references/upgrade.md)

日常做页面（已接入项目里的普通 UI 需求）不用问，直接按 [references/page-work.md](references/page-work.md)；验收失败按 [references/troubleshooting.md](references/troubleshooting.md) 归因。

## 命令表（都支持 `--project <dir>`）

| 命令 | 干什么 |
| --- | --- |
| `ds.mjs detect [--json]` | 列出项目里的设计系统候选（快照 / npm 包 / 散落文件夹）、工作副本状态、是否有 legacy |
| `ds.mjs init --system <id\|路径\|npm包名> --stack <栈> [--legacy-rename]` | 落快照 + 生成工作副本 + 写清单 + 打印该栈接线；已有 `design-system/` 时需用户确认后加 `--legacy-rename` |
| `ds.mjs adopt [--system <id>] [--stack <栈>]` | 已有快照 + 工作副本的项目补 `.adopter.json` 清单 |
| `ds.mjs status [--offline]` | 快照完整性（hash）、工作副本本地修改、上游最新 tag |
| `ds.mjs upgrade [--dry-run] [--ref <tag>] [--from <dir\|tgz>] [--resolve <decisions.json>]` | 三方合并升级：JSON 键级自动并（同键冲突才问），markdown 文件级选 local / upstream / markers；冲突写 `.adopter-conflicts.json` 并退出码 3 |
| `ds.mjs restore [--files a,b\|--all] [--from <dir>]` | 快照被改时从上游 / node_modules 恢复 |
| `ds.mjs agents [--stack <栈>] [--write]` | 渲染 AGENTS.md（模板 + 栈要点）；默认只打印，用户确认后再 `--write`（新建或追加，不覆盖） |
| `ds.mjs steward locate\|install` | 查找 / 安装 design-system-steward（构建、Guard、迁移都靠它） |
| `ds.mjs self-update` | 用上游仓库 main 更新本 skill 自己 |

上游是**私有仓库**时（公司内常态）：`status / upgrade / restore / steward install / self-update` 的网络路径按顺序尝试 `GITHUB_TOKEN` / `GH_TOKEN`（API tarball）→ 匿名 codeload（公开库）→ `git clone --depth 1`（本机 git 凭证）；三条都不通就用 `--from <dir|tgz>` 离线来源。

## 硬边界（违反即错）

- **写入前确认**：`init --legacy-rename`、`agents --write`、`upgrade`（非 dry-run）、`steward install` 都要先把将发生的事告诉用户、拿到同意；`--dry-run` / 不带 `--write` 的形态随时可跑。
- **快照只读**：任何「桥接不合适、配方不够用」都不改 `design-systems/<id>/`——项目差异写自己的 `app.css` / 工作副本，公共诉求向上游仓库提提案。**绝不在页面上就地补样式值。**
- **分工**：构建 token（`build-tokens.mjs`）、一致性校验（`guard.mjs`）、存量迁移（`audit / migrate / settle`）是 steward 的；批量改写存量样式只允许走 steward `migrate --apply` 的闸门。本 skill 不自己实现这些。
- 升级后必跑：`build-tokens → guard → 验收命令`（身份文件 `accept.command`）；minor 版本像素会变属预期，对照种子 CHANGELOG。
- 找不到 steward：给出 `ds.mjs steward install` 让用户确认，不静默下载。
