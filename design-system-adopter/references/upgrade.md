# 剧本 · 更新（跟上游版本）

目标：线上设计系统出了新版，把项目升上去；本地改过的东西经用户决定后保留或合并。

## 步骤

1. `ds.mjs status`：三件事——快照完整性（被手改过会报警，先 `restore`）、工作副本相对快照的本地修改（这些会进三方合并）、上游最新 tag。npm 来源的项目可先 `npm update <包名>`。
2. `ds.mjs upgrade --dry-run`：给用户看分类结果——直接更新（本地未改）/ 上游新增 / 保留本地（上游未变）/ JSON 键级自动合并 / 上游已删除（保守保留）/ 冲突。**把冲突逐条讲给用户听**（键级冲突有 base / local / upstream 三个值；markdown 是文件级）。
3. 用户点头后 `ds.mjs upgrade`（可加 `--ref <tag>` 指定版本、`--from <dir|tgz>` 离线来源）：
   - 无冲突：一步到位，快照推进、清单记账、打印版本间 CHANGELOG 标题。
   - 有冲突：自动可并的部分已写入，退出码 3 并生成 `.adopter-conflicts.json`。按用户决定写 `decisions.json`（文件级 → `"local" | "upstream" | "markers"`；JSON 键级 → `{ "键路径": "local" | "upstream" | 字面值 }`），重跑 `upgrade --resolve decisions.json`。图省事的兜底：`--keep-local-all` / `--take-upstream-all`。
4. 升级后必跑：`build-tokens` → `guard`（current）→ 验收命令（身份文件 `accept.command`）。minor 升级像素会变，属预期；对照 CHANGELOG 看是否有需要页面配合的项（如新增配方、废弃类名）。AGENTS.md 模板或栈说明变了时跑 `ds.mjs agents`：它列出设计系统区块里增删的行，用户确认后 `--write` 原地替换该区块（标题与项目自己的章节不动）。
5. 提交：快照 + 工作副本 + lockfile 一起进一个 commit，信息里写清版本（`chore: <id> X.Y.Z → X.Y.Z'`）。

## 判断要点

- 「保留本地」的文件是项目此前有意改过的——升级不会静默吃掉，但要提醒用户：长期偏离上游的修改应该要么提回上游、要么登记豁免，别攒成永久 fork。
- 「上游已删除」不自动删本地：向用户确认无引用后手工删。
- 三方合并只管工作副本 `design-system/`；身份文件 `owned` 里的 `bridge/**`、`templates/**`、`migration/**` 只活在快照里，随快照整体替换，dry-run 只报个数。
- 新版把工作副本里原本不管的文件加进 `owned`（`init` 时整份拷来、之后不再更新的，如 Morganite 0.2.0 的 `design-system/preview/preview.local.css`）：以旧快照里的同名文件作基线，项目没改过就直接更新、改过报冲突。符号链接快照没有旧基线内容，hash 退化分类会把还停在接入那版的副本当成「保留本地」——先和接入那版对照，确认没改过再取上游。
- 快照是符号链接（仓库内开发模式）时不替换快照，只合并工作副本，属预期提示。种子就地改了而版本号没变也算上游更新（按快照 hash 与清单比对）：`status` 报「种子已就地更新」而不是手改、不让 `--strict` 失败，`upgrade` 不带 `--from` 也把快照当新上游。此时旧基线只剩清单里的 hash：「谁没动」仍能判定，两边都改的文件只能文件级决定。
