# 剧本 · 更新（跟上游版本）

目标：线上设计系统出了新版，把项目升上去；本地改过的东西经用户决定后保留或合并。

## 步骤

1. `ds.mjs status`：三件事——快照完整性（被手改过会报警，先 `restore`）、工作副本相对快照的本地修改（这些会进三方合并）、上游最新 tag。npm 来源的项目可先 `npm update <包名>`。
2. `ds.mjs upgrade --dry-run`：给用户看分类结果——直接更新（本地未改）/ 上游新增 / 保留本地（上游未变）/ JSON 键级自动合并 / 上游已删除（保守保留）/ 冲突。**把冲突逐条讲给用户听**（键级冲突有 base / local / upstream 三个值；markdown 是文件级）。
3. 用户点头后 `ds.mjs upgrade`（可加 `--ref <tag>` 指定版本、`--from <dir|tgz>` 离线来源）：
   - 无冲突：一步到位，快照推进、清单记账、打印版本间 CHANGELOG 标题。
   - 有冲突：自动可并的部分已写入，退出码 3 并生成 `.adopter-conflicts.json`。按用户决定写 `decisions.json`（文件级 → `"local" | "upstream" | "markers"`；JSON 键级 → `{ "键路径": "local" | "upstream" | 字面值 }`），重跑 `upgrade --resolve decisions.json`。图省事的兜底：`--keep-local-all` / `--take-upstream-all`。
4. 升级后必跑：`build-tokens` → `guard`（current）→ 验收命令（身份文件 `accept.command`）。minor 升级像素会变，属预期；对照 CHANGELOG 看是否有需要页面配合的项（如新增配方、废弃类名）。
5. 提交：快照 + 工作副本 + lockfile 一起进一个 commit，信息里写清版本（`chore: <id> X.Y.Z → X.Y.Z'`）。

## 判断要点

- 「保留本地」的文件是项目此前有意改过的——升级不会静默吃掉，但要提醒用户：长期偏离上游的修改应该要么提回上游、要么登记豁免，别攒成永久 fork。
- 「上游已删除」不自动删本地：向用户确认无引用后手工删。
- 快照是符号链接（仓库内开发模式）时不替换快照，只合并工作副本，属预期提示。
