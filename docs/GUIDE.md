# 设计系统工作流 · 上手教程

给要把公司设计系统（当前是 **Citrine 黄晶**）用进自己项目的同学。全程由 Agent（Cursor / Codex / Claude Code）执行，你只做三件事：装好、说一句话、在它停下来问你时拍板。读完约 10 分钟。

> 没有开发经验、只想照着粘提示词的同学，看 [TUTORIAL.md（零基础上手教程）](TUTORIAL.md)；本文是完整参考。

## 0. 四件东西的关系

| 东西 | 在哪 | 干什么 | 你需要碰吗 |
| --- | --- | --- | --- |
| **设计系统种子** | `citrine/seeds/brand-yellow-e/`（也是 npm 包 `@wycm9527/citrine`） | token、DESIGN 规范、Element Plus / shadcn 桥接、页面配方、Vue / React 配方组件，带身份文件 `design-system.json` | 只读。放进项目当快照 |
| **design-system-adopter** | 仓库根 `design-system-adopter/` | 让 Agent 会「接入 / 换规范 / 更新」的 skill + 零依赖 CLI（`scripts/ds.mjs`） | 装一次进项目 |
| **design-system-steward** | [WYCM9527/skills](https://github.com/WYCM9527/skills) | 构建 token、Guard 校验、存量迁移的治理工具 | adopter 找不到时会带你装 |
| **验收工具** | `citrine/tools/`（npm 包 `@wycm9527/citrine-tools`，命令 `citrine-accept`） | 无头 Chrome 扫对比度、命名、品牌色泄漏、三端响应、Tab 焦点 | 装进项目 devDependencies |

项目里最终长这样：

```text
your-project/
├── design-systems/citrine/      # 上游只读快照（提交进 git，永不手改，是升级时的合并基线）
├── design-system/               # 工作副本：token 与规则，steward 在这里治理（可加 scope / 豁免）
│   ├── dist/                    # 构建产物（build-tokens 生成，不手改）
│   └── .adopter.json            # 接入清单（系统 id、版本、快照 hash）
├── .cursor/skills/design-system-adopter/
├── src/styles/globals.css       # 样式入口：组件库 → dist → 桥接 → 配方层 → app.css
├── accept.config.mjs            # 验收清单（页面、走查页、三端宽度、焦点）
└── AGENTS.md                    # 项目规则（adopter 用模板生成，你确认后写入）
```

## 1. 前置条件

- Node ≥ 22、本机装有 Google Chrome（验收用；找不到时设环境变量 `CHROME` 指向可执行文件）。
- 能访问 GitHub（仓库 `WYCM9527/Design-System` 是公开的，不需要账号或权限；`upgrade` 与 steward 安装也走匿名下载）。
- 项目在 git 里。旧项目换规范前要先提交一次（批量改写存量样式的硬要求）。

## 2. 安装（5 分钟）

```bash
# 1) 拿到仓库（公开，浅克隆即可）
git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds

# 2) 把 adopter skill 装进你的项目（Cursor 项目级，随仓库共享给协作者；也可拷到 ~/.cursor/skills 或 ~/.codex/skills 全局用）
cd your-project
mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/

# 3) 种子 + 验收工具 + token 构建器——方式 A：npm registry（步骤最少；两个包都在 npmjs.org 上）
npm i @wycm9527/citrine && npm i -D @wycm9527/citrine-tools style-dictionary@5.5.2

# 3') 方式 B：文件夹渠道（连不上 npm registry、或想把种子锁进项目 git 时）——种子拷进项目，工具用 Releases 直链
cp -R /tmp/ds/citrine/seeds/brand-yellow-e vendor/citrine   # 放哪都行，init 会把它落成 design-systems/citrine/ 快照，之后 vendor/ 可删
npm i -D https://github.com/WYCM9527/Design-System/releases/latest/download/wycm9527-citrine-tools-1.1.3.tgz style-dictionary@5.5.2
```

两种方式 adopter 都认，队友都零配置（A 写进 `package.json` 的是版本号，B 是项目内相对路径 `file:./design-systems/citrine`），已接入的项目不必换。**唯独不要 `npm i file:/tmp/ds/...`**：那会把一条只在你电脑上存在的路径写进 `package.json`，队友 `npm install` 直接失败。国内访问 registry.npmjs.org 慢或不通时，`npm config set registry https://registry.npmmirror.com`（镜像同步公开包，通常十分钟内）或改用方式 B。

steward 不用手动装：Agent 走到需要构建时会先找（`~/.cursor/skills`、`~/.codex/skills`、项目 `.cursor/skills`），找不到会给你一行安装命令，你点头它就装（来源是公开仓库 [WYCM9527/skills](https://github.com/WYCM9527/skills)）。

> `design-systems/`、`design-system/`、`.cursor/skills/` 都要提交进 git——这就是队友零配置的来源。`.accept/` 与 `.adopter-conflicts.json` 进 `.gitignore`。

### 2b. 小白版：整段交给 AI

不想碰命令行的同学，打开 Cursor（或 Codex / Claude Code）的 Agent，把下面整段原文粘贴发送即可。它会自己检查环境、下载、安装、自检，只在一处需要你开口（项目名），装好后问你一句「新项目还是旧项目换新」就接着走。

> 你现在全权负责把公司设计系统 **Citrine** 的整套工作流装进这台电脑的项目里。我是小白，不要问我技术问题：能自动判断的全部自动做，只在标注【必须问我】的地方停下来问；每一步先用一句话说你在做什么，做完把结果给我看；任何一步失败就停下，用大白话告诉我原因和我该做什么，不要自己换别的办法绕过去。
>
> **一、环境检查**（缺什么装什么；装系统软件前先告诉我一句再装）
> 1. Node.js 版本 ≥ 22（`node -v`）。没有或太旧：macOS 用 `brew install node`（没有 brew 就去 nodejs.org 下载 LTS 安装包），Windows 用 `winget install OpenJS.NodeJS.LTS`。
> 2. git（`git --version`）。没有：macOS 跑 `xcode-select --install`，Windows `winget install Git.Git`。
> 3. Google Chrome（验收截图要用）。没有就装。
> 4. 看当前目录：已经是前端项目（有 `package.json`）就在这里装；不是的话【必须问我】项目叫什么名字，然后新建这个文件夹、进入、`git init`。
>
> **二、下载仓库**（公开仓库，不需要账号）
> `git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds`
> 如果失败（超时 / 连不上）：停下，用大白话告诉我「访问 GitHub 失败」，让我处理网络后再重试。不要尝试其他下载方式。
>
> **三、安装三件东西**（在项目目录里）
> 1. skill：`mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/`。如果你不是在 Cursor 里运行，就装到你自己的 skill 目录（Codex 是 `~/.codex/skills/`，Claude Code 是项目 `.claude/skills/`）。
> 2. 设计系统种子与验收工具，先试 npm：`npm i @wycm9527/citrine && npm i -D @wycm9527/citrine-tools style-dictionary@5.5.2`。如果报 404 / 超时 / 连不上，改走文件夹渠道：`mkdir -p vendor && cp -R /tmp/ds/citrine/seeds/brand-yellow-e vendor/citrine`，然后访问 `https://api.github.com/repos/WYCM9527/Design-System/releases/latest`，在 `assets` 里找名字以 `wycm9527-citrine-tools-` 开头的 `browser_download_url`，`npm i -D <那个地址> style-dictionary@5.5.2`。两条路都不要用 `npm i file:/tmp/...`——那会把只在这台电脑上存在的路径写进 package.json。
> 3. 治理工具：`node .cursor/skills/design-system-adopter/scripts/ds.mjs steward locate`；如果输出「未找到」，就跑 `node .cursor/skills/design-system-adopter/scripts/ds.mjs steward install`。
>
> **四、自检**（四条都要通过才算装好，任何一条不过就回到对应步骤重做）
> - `node .cursor/skills/design-system-adopter/scripts/ds.mjs detect` 的输出里有 `citrine`（npm 装的显示 `[npm]`，文件夹渠道显示 `[folder]`）
> - `node .cursor/skills/design-system-adopter/scripts/ds.mjs steward locate` 输出一个路径
> - 文件 `.cursor/skills/design-system-adopter/SKILL.md` 存在
> - 文件 `node_modules/.bin/citrine-accept` 存在
>
> **五、收尾**
> - 在 `.gitignore` 里确保有 `node_modules/`、`.accept/`、`.adopter-conflicts.json` 三行（没有就加）；`vendor/`、`design-systems/`、`.cursor/skills/` **不要**忽略。
> - 通读一遍 `.cursor/skills/design-system-adopter/SKILL.md`。
> - 用大白话向我汇报：装了哪四样、各放在哪、自检结果。然后只问我一个问题：「这个项目是**从 0 开始**的新项目，还是要把**现有项目换成公司规范**？」我回答后，按 SKILL.md 对应的剧本继续，不要自己发明步骤。

## 3. 场景 A：新项目从 0 开始

对 Agent 说（可直接粘贴，改栈名即可）：

> 用 Citrine 设计系统起一个 **Vue 3 + Element Plus**（或 **React + shadcn/ui**）的中后台，按 design-system-adopter 的「从 0 开始」把系统接好、验收跑绿之后再开始做页面。配方不够用时提提案，不要在页面上补样式。

Agent 会依次做：应用骨架（空目录时先问你选栈，给出 create-vite 命令）→ `ds.mjs init`（落快照 + 工作副本 + 清单，打印接线）→ steward `build-tokens` / `guard` → 写样式入口与 Vite 配置 → 渲染 `AGENTS.md` 给你看 → 做页面 → 建 `accept.config.mjs` → `npm run accept`。

**你要拍板的点**：选栈；`AGENTS.md` 写入前看一眼；steward 安装。**完成标志**：`guard` 输出 `current`，`npm run accept` 四项全「通过」。最后一步是 `ds.mjs ci`（见 5e）把这两项接进 CI。

## 4. 场景 B：旧项目换成公司规范

**开始前确认两件事**：

1. **项目在 git 里且工作区干净**（已提交）。这是批量改写存量样式的硬要求，不干净 Agent 会先让你提交，不会绕过。
2. **组件库是什么**：
   - **Element Plus 或 shadcn/ui** → 直接走。第一期挂上桥接那一刻，按钮 / 表格 / 表单 / 弹窗就已经是新样子（组件库占页面视觉的七八成）。
   - **其他**（Ant Design、Vuetify、Naive、纯手写……）→ 桥接是缺口：第一期换肤只能覆盖页面骨架与 token，组件仍是旧样子。别硬做——把项目路径交给设计系统维护者，评估后为该组件库写一份桥接（系统层工作，按 Element 桥接的做法逐组件走查，约 2–3 天）；写完是公司资产，同栈的第二个项目直接复用。

**两条路**：

- **自己的 Agent 做**：在旧项目目录先按第 2 节装好（或粘 2b 小白版提示词，装完它问「新项目还是旧项目换新」答后者），再粘下面这句。
- **交给维护者做**：把项目**绝对路径 + 组件库**发给维护者，先只读跑 steward `audit` 出一份工程量报告（旧变量 / 硬编码 / 内联样式各多少），点头后做第一期，看前后截图与二期清单再排期。

对 Agent 说：

> 把这个项目换成 Citrine 设计规范，按 design-system-adopter 的「更换现有规范」先做第一期换肤，给我看验收报告和二期收编清单再继续。

三期，每期结束都能上线：

| 期 | Agent 做什么 | 你拿到什么 | 大致工期 |
| --- | --- | --- | --- |
| 一 · 换肤 | steward `audit` 报工程量 → `init --legacy-rename`（原 `design-system/` 改名 `design-system.legacy/` 当证据，会先问你）→ 构建 → 挂桥接 → 旧变量做别名过渡 | 组件库部分立刻变成新样子（占页面视觉七八成）；页面扫描列出的二期清单 | 1–2 天 |
| 二 · 收编 | steward `migrate adopt / replace` 自动处理无歧义项 → `settle` 时用种子的角色对照表起草决策文件给你确认 → 页面结构逐页换配方类 | `MIGRATION.md` 对照与回滚；验收数字逐批变绿 | 3–10 天看规模 |
| 三 · 收尾 | `status` 到 unified、`guard` 到 current、写 `AGENTS.md`、`ds.mjs ci` 验收进 CI | 干净的项目 | 半天 |

**Agent 会在这四处停下问你**：工作区不干净要先提交；把原有的 `design-system/`（若有）改名为 `design-system.legacy/` 当迁移证据；写入 `AGENTS.md`；二期 `settle` 的决策文件（旧角色 → 新 token 的映射草稿）过目确认。其余步骤不需要你介入。

关键原则（Agent 会遵守，你也要知道）：**按角色映射，不按色值找最接近的灰**——旧的深黄 hover、淡黄选中底、彩色链接在新系统里没有对应物，会换成反转块 / 无色系写法，不是"找个像的"。

## 5. 场景 C：设计系统出新版了

对 Agent 说：

> 检查 Citrine 有没有新版本，按 design-system-adopter 的「更新」剧本先 dry-run 给我看差异（尤其是我本地改过的部分），确认后再升级并跑验收。

流程：`ds.mjs status`（快照是否完整、你本地改过哪些文件、上游最新 tag）→ `upgrade --dry-run`（分类：直接更新 / 上游新增 / 保留本地 / 自动合并 / 冲突）→ 你拍板 → `upgrade`。

合并规则：token 等 JSON **键级**三方合并——你改的键和上游改的键各取各的，同一个键两边都改才问你；`DESIGN.md` 等文档是文件级，选「保留本地 / 取上游 / 写冲突标记手工合」。有冲突时 Agent 会拿着 `.adopter-conflicts.json` 逐条问你，然后 `--resolve`。升级后必跑 `build-tokens → guard → accept`；minor 版本像素会变属预期，对照种子 CHANGELOG。种子若是 npm 来源（`npm i @wycm9527/citrine` 或 Release 直链装的），页面 import 的桥接在 `node_modules` 里，`upgrade` 结束会打印一条 `npm i …` 让它跟上新版——不跑那条，样子不会变；文件夹渠道（`file:./design-systems/citrine`）无此步。范围根项目 `upgrade` 会自动重生成范围包。

## 5b. 场景 D：项目不是 Node 工程（Flask / Django / PHP 模板）

装不了 npm 那四样东西没关系——设计系统的交付物本来就是纯 CSS，运行时不需要 Node。**别把变量值手抄进自己的 CSS**（等于 fork 了 token：上游改值你不知道、暗色没有、升级断掉）。

最省事：到仓库 [Releases](https://github.com/WYCM9527/Design-System/releases) 下载最新的 `citrine-css-<版本>.tgz`（就是导出好的 `index.css` + `recipes.css` + Element 桥接），解压进 `static/citrine/`，不需要任何工具。或者在任何一台有 Node 的机器上（维护者或同事）导出一次：

```bash
node <adopter>/scripts/ds.mjs export --system /tmp/ds/citrine/seeds/brand-yellow-e --to <项目>/static/citrine
```

得到 `index.css`（token 亮 + 暗色）、`recipes.css`（页面骨架公共类）和一份清单，文件带版本头。模板 `<head>` 按顺序 `<link>` 这两个文件再接自己的样式；自己的样式只引用变量（`var(--color-text-primary)`），模板直接用配方类（`.page-head / .filter / .status / .act / .form-grid / .stats / .nav` …），三端与暗色（`<html class="dark">`）都内置。导出文件只读，再次 `export` 会拦截被手改的文件。

验收照样能跑：服务器起来后 `npx citrine-accept pages --url http://127.0.0.1:5000 --tokens <项目>/static/citrine`（`narrow` / `focus` 同理），页面清单写服务器路径。升级 = 再 `export` 一次，逐文件告诉你什么变了。对 Agent 说：

> 这个项目是 Flask 模板 + 一个 CSS 文件，不是 Node 项目。按 design-system-adopter 的「非 Node 项目」剧本：导出 Citrine 的纯 CSS 到 static/，把 admin.css 里的颜色 / 字号 / 间距改成引用变量，模板换用配方类，然后用 --url 跑验收给我看。

## 5c. 场景 E：只想覆盖项目里的几个板块

先分清「板块」是哪种：

- **monorepo 里的多个应用**（各自有 `package.json`）→ 什么都不用做：只对要覆盖的应用 `init --project apps/admin`，其余应用天然不受影响；微前端 / iframe 子应用同理。
- **同一个应用里按路由分的板块**（`/orders` 换、`/legacy-report` 不换）→ **范围根**：`ds.mjs scope --root citrine --to src/styles/citrine-scoped --with element-plus` 把整套 CSS 包进 `@scope (html.citrine)`，样式入口改引这些文件，路由守卫在未接入板块的路由上把 `<html>` 的 `citrine` 类去掉（Vue Router：`meta: { legacy: true }` + 一行 `beforeEach`，命令会打印片段）。未接入板块保留自己的旧布局与组件库默认外观——弹窗、下拉这类 teleport 到 body 的浮层也一起覆盖 / 一起不覆盖，因为都在 `html` 之下。
- **同一屏上新旧组件混排** → 不支持，整页纳入或整页不纳入。

范围根是**过渡态**：新板块先立住，再按 5 节的二期收编把旧板块逐个纳入，最后去掉范围根回到全局。浏览器下限 `@scope`：Chrome / Edge 118+、Safari 17.4+、Firefox 128+。对 Agent 说：

> 这个项目里只有 /orders 和 /suppliers 两个板块要换成 Citrine，其余板块保持原样。按 design-system-adopter 的「只覆盖部分板块」剧本做范围根，做完打开一个未接入的页面证明它没被影响。

## 5d. 综合示例：旧项目 + 只覆盖部分板块 + 带一个 Flask 子系统

真实项目往往同时命中 B、E、D 三个场景。下面是一段可整段粘贴、全权交给 Agent 的提示词（方括号处填你的信息）：

> 你现在全权负责把项目 **【项目绝对路径】** 换成公司设计系统 **Citrine**，但只覆盖我指定的板块，其他板块一个字节不能受影响。我不懂技术细节：能自动判断的全部自动做，只在标注【必须问我】的地方停下来问；每一步先用一句话说你在做什么，做完把结果给我看；任何一步失败就停下，用大白话说原因和我该做什么，不要换别的办法绕过去。全程严格按项目里 `.cursor/skills/design-system-adopter/SKILL.md` 及其 references 剧本执行，不自己发明步骤。
>
> **〇、准备**
> 1. 如果 `.cursor/skills/design-system-adopter/` 不存在：`git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds`（连不上就停下告诉我网络问题），然后 `mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/`，种子走文件夹渠道 `mkdir -p vendor && cp -R /tmp/ds/citrine/seeds/brand-yellow-e vendor/citrine`，工具按 2b 节第三步用 Releases 最新的 `wycm9527-citrine-tools-*.tgz` 直链 `npm i -D <地址> style-dictionary@5.5.2`（不要用 `npm i file:/tmp/...`）。
> 2. 确认项目在 git 里且工作区干净（`git status`）。不干净就停下让我提交，不要替我提交。
> 3. 通读 SKILL.md、`references/existing-project.md`、`references/scope-root.md`、`references/non-node.md`。
>
> **一、摸底（只读，不改任何文件）**
> 1. `node .cursor/skills/design-system-adopter/scripts/ds.mjs detect`，告诉我识别到了什么。
> 2. 找到 design-system-steward（`ds.mjs steward locate`；没有就 `steward install`），跑 `audit`，给我一份工程量报告：旧变量、硬编码字面量、内联样式各多少。
> 3. 列出这个项目的结构：有哪些应用 / 路由板块 / 目录，用的组件库是什么，有没有非 Node 的子系统（例如 Flask 模板）。然后【必须问我】：这些板块里哪几个要换成 Citrine，哪几个保持原样。我的初步答案：覆盖 **【要覆盖的板块】**，保持原样的有 **【不动的板块】**，另外 **【Flask 子系统路径】** 是 Flask 模板 + 一个 CSS 文件、不是 Node 项目。
> 4. 如果组件库不是 Element Plus 也不是 shadcn/ui：停下告诉我这是桥接缺口，第一期只能换骨架与 token、组件会保持旧样子，等我决定是否继续。
>
> **二、Node 应用的第一期换肤（只覆盖指定板块）**
> 1. 如果项目已有 `design-system/` 目录，【必须问我】是否同意把它改名为 `design-system.legacy/` 当迁移证据；同意后 `ds.mjs init --system citrine --stack <栈> --legacy-rename`，否则去掉 `--legacy-rename`。
> 2. steward `build-tokens` → `guard` 必须是 `current`。
> 3. 因为只覆盖部分板块，用范围根：`ds.mjs scope --root citrine --to src/styles/citrine-scoped --with <桥接组>`；样式入口里把原来的 dist / 桥接 / recipes import 换成 `citrine-scoped/` 里的文件，组件库基础样式保持全局；`index.html` 的 `<html>` 默认带 `class="citrine"`；不覆盖的板块在路由 `meta` 上标 `legacy: true`，加 `router.beforeEach((to) => document.documentElement.classList.toggle('citrine', !to.meta.legacy))`（React 项目按命令打印的片段做）。
> 4. 旧变量做别名过渡：新建一个过渡样式文件，把旧变量名指向新 token（如 `--text: var(--color-text-primary)`），列出你映射了哪些，映射不了的告诉我。
> 5. 把 `src/styles/citrine-scoped/**` 和你确认要保持原样的板块目录登记进 `design-system/exemptions.json`，每条写理由。
> 6. `ds.mjs agents --stack <栈>` 渲染 AGENTS.md 全文给我看，【必须问我】确认后再 `--write`；里面要写清哪些板块归新规范、哪些是旧板块不碰。
> 7. 建 `accept.config.mjs`，只登记覆盖板块的页面；`npm run build && npx citrine-accept all` 跑到全绿。
> 8. **自证旧板块没被波及**：打开一个未覆盖的路由，检查 `document.documentElement.classList` 不含 `citrine`、`getComputedStyle(document.documentElement).getPropertyValue('--color-action-primary')` 为空、组件仍是组件库默认外观；把这三项结果连同一张截图给我。
>
> **三、Flask 子系统（非 Node，纯 CSS 交付）**
> 1. `ds.mjs export --system citrine --to <Flask 子系统>/static/citrine`，得到 `index.css`、`recipes.css` 和清单。不要把变量值手抄进任何 CSS。
> 2. 模板 `<head>` 按顺序 `<link>`：`index.css` → `recipes.css` → 原有的 `admin.css`；暗色靠 `<html class="dark">`。
> 3. 把 `admin.css` 里的颜色 / 字号 / 间距 / 圆角 / 阴影改成引用变量（可用 steward `migrate --phase replace / settle` 辅助，settle 决策草稿给我确认）；表格列宽、筛选控件宽度这类「按内容定」的像素允许保留。模板的页头 / 筛选栏 / 状态胶囊 / 操作胶囊 / 表单 / 空态换用 recipes 的配方类；显隐切换用 `hidden` 属性。
> 4. 把 Flask 服务跑起来，`npx citrine-accept pages --url http://127.0.0.1:<端口> --tokens <Flask 子系统>/static/citrine`（`narrow`、`focus` 同理），页面清单写服务器路径。跑到全绿。
>
> **四、汇报与交接**
> 用大白话给我：摸底数字、第一期做了什么、两边验收结果、旧板块自证结果，以及**二期收编清单**——哪些板块还没纳入、待决字面量还有多少、建议的顺序。然后只问我一个问题：「现在开始二期收编，还是先上线看效果？」在我回答前不要动二期。
>
> **硬边界**：不改 `design-systems/citrine/` 快照和 `citrine-scoped/` 生成物；配方不够用就记下来作为提案告诉我，不在页面上补样式值，不用 `!important` 压验收；每一处写入前告诉我将发生什么。

## 5e. 验收进 CI（门禁）

接入完成后，规则只是被 AI「看见」（`AGENTS.md` 每次对话自动加载），没有东西**强制**它——AI 改完页面是否记得跑验收，取决于模型的遵从度。唯一不依赖这点的机制是把验收放进 CI：

```bash
node .cursor/skills/design-system-adopter/scripts/ds.mjs ci --dry-run   # 先看
node .cursor/skills/design-system-adopter/scripts/ds.mjs ci             # 写 .github/workflows/design-system.yml
```

工作流在每次 PR 与推 main 时跑：`status --strict`（上游快照没被手改）→ steward 就位（仓库里没有就临时安装）→ `build-tokens` → `guard` 必须 `current` → `npm run build` → `citrine-accept all` 四项全绿；失败时把 `.accept/` 的报告与截图上传为 artifact。steward `status` 只打印（换规范收尾前不要求 unified，收尾后把那一行改成门禁）。前置：adopter 与 `accept.config.mjs` 在仓库里；runner 自带 Chrome，工作流会装中文字体。GitLab / Jenkins 照里面的 shell 步骤搬即可。

对 Agent 说：

> 把设计系统验收接进 CI：按 design-system-adopter 用 `ds.mjs ci --dry-run` 把工作流给我看，我确认后写入并提交。

## 6. 日常做页面的三条纪律

Agent 在已接入的项目里改 UI 时自动遵守，你验收产出时按这三条看：

1. **结构用配方类**：页头 / 筛选栏 / 状态胶囊 / 操作胶囊 / 表单页 / 空态 / 统计卡 / 原位确认条都在 `recipes.css` 里，不自己写骨架。
2. **颜色 / 间距 / 字号 / 圆角只写 token 变量**：页面里出现 `#hex`、裸像素（表格列宽、筛选控件宽度这类"按内容定"的宽度除外）就是错的。
3. **配方不够用时提提案，不在页面上补样式**：Agent 会停下来告诉你缺什么、建议进哪一层；你决定向仓库提 issue / PR 还是先用最接近的配方顶住。快照 `design-systems/citrine/` 任何时候都不改。

三端是内置的：桌面展开、窄屏（≤1366）侧栏折叠、手机（≤768）抽屉侧栏 + 表格内部滚动 + 浮层贴底全宽，页面不用自己写媒体查询。

## 7. 命令速查（Agent 会用，你也能直接跑）

```bash
A=.cursor/skills/design-system-adopter/scripts/ds.mjs
node $A detect                          # 项目里有哪些设计系统候选、工作副本状态
node $A init --system citrine --stack element-plus   # 或 --stack shadcn；已有 design-system/ 时加 --legacy-rename
node $A status [--offline]              # 快照完整性、本地修改、上游最新
node $A upgrade --dry-run               # 预览升级；去掉 --dry-run 执行；--resolve decisions.json 提交冲突决议
node $A agents --stack element-plus     # 渲染 AGENTS.md；确认后加 --write
node $A ci [--dry-run]                  # 写 GitHub Actions 门禁（status --strict → guard → 构建 → 验收）
node $A steward locate|install          # 找 / 装治理工具
npx citrine-accept all                  # 验收：pages → components → narrow → focus；单跑某项：citrine-accept pages
```

steward（`<steward>` = `ds.mjs steward locate` 的输出）：`node <steward>/scripts/build-tokens.mjs --project $PWD`、`guard.mjs`（应为 `current`）、`status.mjs`（应为 `unified`）、`audit.mjs` / `migrate.mjs`（换规范用）。

## 8. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| `upgrade` / `steward install` 报下载失败 | 访问 GitHub 不通（仓库是公开的，不是权限问题）：换网络重试；完全离线用 `upgrade --from <种子目录或 tgz>`（tgz 到 Releases 页下载） |
| `npm i @wycm9527/citrine` 404 / 超时 | 多半是 registry 访问问题：换镜像 `npm config set registry https://registry.npmmirror.com`，或走第 2 节方式 B（文件夹渠道 + Release 直链） |
| 队友 `npm install` 报找不到 `file:/tmp/...` 或 `file:../ds/...` | 有人用机器专属路径装了种子 / 工具。改成第 2 节的写法：种子走文件夹渠道（`file:./design-systems/citrine`），工具走 Release 直链 |
| 验收报「暗色未生效」 | 页面没把 `?theme=dark` 落成 `<html class="dark">`（`index.html` 首屏先读 URL 再读 localStorage）；项目确实没有暗色就 `--modes light` |
| 验收报「品牌黄出现在允许清单之外」 | 页面把黄色用成了强调 / 状态（如未读点、引用块边线）——换中性或状态色；确属合法位置（登录品牌区、数据卡骨架）写进 `accept.config.mjs` 的 `YELLOW_ALLOW` 并写理由 |
| 组件走查被跳过（KITCHEN 为 null） | Element 项目挂 `@wycm9527/citrine/vue/KitchenSink.vue` 到 `/kitchen`，shadcn 拷 `templates/KitchenSink.tsx`，`KITCHEN: '#/kitchen'` |
| 只想覆盖部分板块 | 多应用各自 `init`；同一应用按路由用范围根（5c）；同屏混排不支持 |
| 项目不是 Node 工程 / 装不了 npm | 走 5b：`ds.mjs export` 出纯 CSS，模板用配方类，验收加 `--url` 与 `--tokens`；不要手抄变量值 |
| 验收「未找到 Chrome」 | 装 Google Chrome，或 `CHROME=/path/to/chrome npx citrine-accept all` |
| 验收报低对比 / 品牌色泄漏 / 无名称 | 先按 skill 的 `references/troubleshooting.md` 归因到层：页面自己的问题现场修；组件库默认色 / 命中区属于桥接层，向仓库提，不要用 `!important` 压 |
| `status` 说快照被本地改动 | 快照只读；`ds.mjs restore --all` 恢复，需要的差异改到 `app.css` 或工作副本 |
| 手机档验收失败：横向溢出 | 找超出视口的元素（多半是固定宽度）；组件走查页可在 `accept.config.mjs` 的手机档 `pages` 里剔除 |
| 想看规则原文 | `design-system/DESIGN.md`（配方表、组件库对照、三端、验收基线），改动史在种子 `CHANGELOG.md` |

## 8b. 维护者：发版与 CI

- 改了 `recipes.css` / 桥接后，除 CI 外再跑一次级联审计：`node citrine/scripts/audit-cascade.mjs --dist citrine/testbed/golden-admin/app/dist --pages "?theme=light#/kitchen,?role=admin#/orders"`——找「位置更后却因特异性更低而输掉」的声明（2.11.7 汉堡按钮那类问题，pages / narrow / focus 看不出来）。输出需人判断，口径写在脚本末尾。
- 每次 push / PR 自动跑 CI：adopter 单测、角色表与 token 源一致、六处版本号一致、种子 `dist` 与源一致，以及三个实测项目的 guard / status / 全量验收（并行三个 job，失败会上传截图与报告为 artifact）。不绿不合。
- 发版：改 `design-system.json` 与 `package.json` 版本、写 CHANGELOG、`node citrine/scripts/check-versions.mjs` 通过后打 tag `citrine-vX.Y.Z` 推送——`release.yml` 自动建 GitHub Release（说明取 CHANGELOG 段落，附件 = 种子与工具的 npm pack 产物 + 纯 CSS 包）。手动补历史版本：`node citrine/scripts/release.mjs --version X.Y.Z --notes-only`。
- npm 发布是 `release.yml` 的第二个 job：同一个 tag 把 `@wycm9527/citrine` 与 `@wycm9527/citrine-tools` 发到 registry（已存在的版本跳过，所以只升种子不升工具也没事；带 provenance）。认证走 npm **Trusted Publishing**（已在 npmjs.com 两个包的 Settings → Trusted Publisher 登记 GitHub `WYCM9527/Design-System` + 工作流 `release.yml`，零密钥，2.11.5 起生效）；换仓库或改工作流文件名要重新登记；也可退回仓库 Secret `NPM_TOKEN`（granular token，勾 publish + bypass 2FA）。**工具有改动必升 `citrine/tools/package.json` 的版本号**，否则 registry 上已存在同版本会被跳过、Release 里同名 tgz 内容不同。

## 9. 反馈回路

这套系统靠真实项目的发现变好：接入过程中任何「配方缺、桥接漏、文档说不清」都值得提到仓库——四个实测项目已经回填了 100 多条，你的项目会再出一批。对 Agent 说「把这个提成提案」，它会用 `ds.mjs propose` 生成草稿并给你一个**预填好的 GitHub issue 链接**（场景、期望、建议层、涉及 token 都填好了），你点开提交即可；维护者按版本策略发新版，你 `upgrade` 拿到。
