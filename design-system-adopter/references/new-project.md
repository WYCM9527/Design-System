# 剧本 · 从 0 开始

目标：空目录 / 新项目接上设计系统，第一页就用配方，验收全绿。全程命令里的 `<adopter>` = 本 skill 目录，`<steward>` = `ds.mjs steward locate` 的输出。

## 步骤

1. **应用骨架（不属于设计系统）**：项目还没有 `package.json` 时，先问用户选栈（看身份文件 `stacks` 的 label，如 Vue 3 + Element Plus / React + shadcn），把该栈 `scaffold` 字段的 create-vite 命令给用户看、同意后代为执行。已有工程就跳过。**目标就是当前目录**（里面已有 `.cursor/`、下载的种子等）时，create-vite 对非空目录会交互式询问、无人值守会卡住：先 scaffold 到临时子目录，再把生成物搬回根目录（不要覆盖已有文件），删掉临时目录。
2. **拿到种子包**（两条渠道，装一个即可）：
   - npm：`npm i <身份文件 upstream.npm>`（如 `@wycm9527/citrine`）；
   - 文件夹：用户把种子文件夹放进项目任意位置（`ds.mjs detect` 能认出来）。
   仓库未发 registry 时，npm 渠道等价于 `npm i file:<种子路径>`。
3. **接入**：`node <adopter>/scripts/ds.mjs init --system <id> --stack <栈>`。它会：落只读快照 `design-systems/<id>/` → 生成工作副本 `design-system/` → 写 `.adopter.json` → 打印接线步骤（folder 来源会多一行 `npm i file:./design-systems/<id>`，让 import 路径与 npm 一致）。
4. **构建与校验**（steward）：`npm i -D <身份文件 build.tool>` → `node <steward>/scripts/build-tokens.mjs --project $PWD`（生成 `design-system/dist/`）→ `guard.mjs` 应为 `current`。steward 找不到就 `ds.mjs steward locate`，没有则征得同意后 `ds.mjs steward install`。
5. **样式入口**：按 init 打印的片段建（通常 `src/styles/globals.css`），同时建一个空的 `app.css`（项目补充，只引用 token）。Vite 配置按 init 打印的注意项（`optimizeDeps.exclude`；`file:` 链接再加 `resolve.preserveSymlinks: true`）。
6. **项目规则**：`ds.mjs agents --stack <栈>` 渲染 AGENTS.md 全文给用户看，确认后 `--write`。
7. **第一批页面**：按 [page-work.md](page-work.md) 做——壳层与页面骨架全用配方类（`.app / .sidebar / .nav / .page-head / .filter / .status / .form-*`），组件用桥接过的组件库 + 配方组件，颜色 / 间距 / 字号只写 token 变量。
8. **验收**：`npm i -D <身份文件 accept.npm>` → 按快照里的 `accept.configTemplate` 建 `accept.config.mjs`（列页面、走查页、窄屏、焦点清单）→ `package.json` 加 `"accept": "npm run build && <accept.command>"` → 跑绿。`.accept/` 与 `.adopter-conflicts.json` 加进 `.gitignore`。

## 常见岔路

- **folder 渠道的原始下载目录**：`init` 会把它复制成 `design-systems/<id>/` 快照，之后 `npm i file:./design-systems/<id>` 链接的是快照——原始下载目录（如 `vendor/`、`~/Downloads/…`）确认接入完成后即可删除；将来升级的来源是上游 tag / npm / `--from`，与它无关。

- 用户没说栈 → 问一次（身份文件里 stacks 的 label 列给他选）。
- `init` 报「已存在 design-system/」→ 这不是从 0，是[更换现有规范](existing-project.md)。
- 页面做着做着发现配方缺东西 → 不补页面样式；见 [troubleshooting.md](troubleshooting.md) 的「配方不够用」。
