# Morganite 玫瑰金 Design System

**中后台 · Ant Design Pro v6 底座 · antd 纯灰骨架 + 可换品牌色（默认玫瑰金 #B98D44 金底白字） · 亮 / 暗 · Element Plus / shadcn/ui / ECharts 桥接**

版本 **0.4.0** · Core 359 个 token · dark 66 条 delta · 以 Ant Design Pro v6 为视觉底座，由 [web-to-design-system](https://github.com/WYCM9527/skills/tree/main/web-to-design-system) 从 [Pro 演示站](https://preview.pro.ant.design/dashboard/analysis)的工作台、查询表格、基础表单、新建弹窗与详情抽屉实测提炼（2026-09-28），品牌色按用户决定换成玫瑰金 `#B98D44`（初定 `#AE8A50`，2026-10-09 提高饱和度与明度） · 变更见 [CHANGELOG](seeds/morganite/CHANGELOG.md)

一句话：保留 Ant Design 的交互结构、密度与纯灰骨架，把品牌色换成玫瑰金——金底放白字（主按钮、侧栏当前项；暗色侧栏当前项是金色暗底 + 亮金字），链接 / 选中 / 焦点取同色系深一档；输入框为填充式（Pro v6 原样）。圆角、0.6px 描边、卡片标题、图表配色（只用金 + 灰 + 绿、绿涨红跌）按一张预期预览图调整过；卡片不投影，只留一条很浅的边线。品牌色可以换：另有蓝、紫、青、绿、黄晶黄 5 个官方颜色，结构和规则不变，见下面「颜色」。

**看效果**：[在线效果预览](https://wycm9527.github.io/Design-System/morganite/previews/rose-gold-admin/)——工作台、交易记录、新建交易、交易详情、系统设置、组件走查、登录、空状态 8 个页面，顶栏右侧切亮 / 暗，右下角「规范调节」换颜色、调值（网址加 `?palette=<id>` 直接看某个颜色）。接入后的页面应该和它一致。

---

## 以什么为准

预览有好几种，评判时按这个顺序：

1. **规范本身**：种子 `seeds/morganite/design-system/` 里的 token（`tokens/*.tokens.json`、`themes/*/tokens/`）与 `DESIGN.md`，用户的每项决定记在 `AUDIT.md`。任何预览、项目和它冲突，都以它为准。
2. **视觉基准**：效果预览 `previews/rose-gold-admin/`（[在线版](https://wycm9527.github.io/Design-System/morganite/previews/rose-gold-admin/)，随 main 分支自动更新）——页面与组件「应该长什么样」看它，用户的视觉决定都是对着它定的。它和规范冲突时改预览。
3. **落地验证**：实测项目 `testbed/element-lab`、`testbed/shadcn-lab` 与完整业务项目 `testbed/mall-ops`——检查真实组件库接入后是否与效果预览一致、验收（citrine-accept）是否全绿；它们不是标准，不一致就修桥接或配方。
4. **只做对照，不作评判**：种子自带的 `design-system/preview/`（壳层 / 表单 / 抽屉）用来和来源站 Ant Design Pro 比像不像；`token-board.html` 是 token 清单，看值不看页面。

注意：效果预览除了种子的 dist、基础桥接和配方，还带着自己的组件样式（`components.css`，按 DESIGN 配方表写的参考实现）和页面布局（`admin.css`），这些项目拿不到。项目用到预览里有、种子里没有的组件时，先提案把它移进配方，不在项目里照着预览另写一套——2026-10-10 shadcn 单据页走样就是这个原因，分页、类别标签、顶栏搜索已移进配方；2026-10-11 完整业务项目又查出十几个这样的页面形态（问候语、看板、设置行、横向表单、登录页等），0.1.4 全部移进配方，预览也改用配方。

## 颜色

结构只有一套，品牌色可以换。每个颜色是一个调色盘文件 `seeds/morganite/palettes/<id>.json`，只管 16 个品牌色原语和身份文件 `palettes.roles` 登记的 26 个角色（链接、选中、焦点、品牌面等）；间距、字号、状态色和组件配方不随颜色变。

| 官方颜色 | id | 主色 | 说明 |
| --- | --- | --- | --- |
| 玫瑰金 | `rose-gold` | `#B98D44` | 默认颜色，就是种子本身，没有调色盘文件 |
| 蓝 / 紫 / 青 / 绿 | `blue` / `purple` / `cyan` / `green` | `#1447E6` / `#8200DB` / `#007595` / `#008236` | 从 shadcn/ui 的主题色导入，按本系统的色阶和对比度规则改写 |
| 黄晶黄 | `citrine` | `#F9CF00` | 原黄晶规范的黄：主按钮黄底黑字，链接、选中、焦点用中性黑 |

另有 13 个颜色只在效果预览里试（shadcn 的其余主题色；橙和警示橙、红和危险红太近，先不进官方），项目要用先提案。

- **项目里**：接入时 `ds.mjs init --palette <id>`，已接入的项目 `ds.mjs palette <id>`（`--list` 看清单），选择记在 `design-system/.adopter.json`，升级时自动重套；纯 CSS 交付 `ds.mjs export --palette <id>`。页面只用规范变量的，换颜色不用改页面代码。
- **验收**：品牌色审计的判色范围和跟颜色走的对比度例外取项目当前的颜色（citrine-tools ≥ 1.4.0）；玫瑰金的登记在身份文件 `accept`，其他颜色的在调色盘文件 `accept`。仓库 CI 对每个官方颜色在三个实测项目上跑页面与组件走查（亮、暗）。
- **加一个官方颜色**：提案（`ds.mjs propose --layer palette`）→ 改调色盘文件（shadcn 来源的用 `node scripts/import-shadcn-palettes.mjs` 重新生成）→ `node scripts/check-palettes.mjs --build` 体检通过（亮暗对比度、和状态色撞色）→ 加进身份文件 `palettes.official` → 发版。

## 目录

```text
morganite/
├── README.md                    # 本文件：系统概览、状态、接入入口
├── previews/rose-gold-admin/    # 效果预览（视觉基准）：8 个页面合在 index.html 里按 #/路由 跳转；引用种子的 dist、基础桥接与配方，另有预览自己的组件样式与页面布局（?theme=dark 看暗色）
├── testbed/element-lab/         # 实测项目：Vue 3 + Element Plus 按 adopter 接入种子，走查页 + 业务页；问题记录在 FINDINGS.md
├── testbed/shadcn-lab/          # 实测项目：React 19 + Tailwind v4 + shadcn/ui，骨架照 Citrine 的 shadcn 实验室；问题记录在 FINDINGS.md
├── testbed/mall-ops/            # 完整业务项目「拾光商城 · 运营后台」：Vue 3 + Element Plus，14 页 × 4 角色 × 50 个页面状态；产品设定 PRD.md，实测报告 FINDINGS.md
└── seeds/morganite/             # 分发单元：design-system/（token · DESIGN · AUDIT · themes）· palettes/（可换的颜色）· bridge/ · templates/ · design-system.json
```

以后可以像 Citrine 一样加 `tools/`（验收工具）；目前是一套 token + 规则 + 桥接，加一组效果预览页、Element Plus 与 shadcn/ui 两个实测项目和一个完整业务项目。

## 状态

- 来源与证据：`seeds/morganite/design-system/AUDIT.md`——实测 70 个角色、用户确认 108 个（含 2026-10-09 按组确认的原推断值 56 个），另有用户决定表与对比度例外。
- 规则：`seeds/morganite/design-system/DESIGN.md`（速查、视觉语言、组件配方、验收基线已写完）。
- 预览：`seeds/morganite/design-system/preview/index.html`（工作台 / 表单 / 抽屉 × 亮暗，与来源站首屏对照）、`token-board.html`、对比度报告 `contrast.md`；效果预览 `previews/rose-gold-admin/index.html`：8 个页面合在一个文件里，按路由跳转——工作台 `#/dashboard`、交易记录 `#/transactions`、新建交易 `#/transactions/new`、交易详情 `#/transactions/detail`、系统设置 `#/settings`、组件走查 `#/kitchen`、登录 `#/login`、空状态 `#/empty/<模块>`；侧栏、顶栏、路由由 `shell.js` 提供，浏览器前进 / 后退可用，亮 / 暗选择跨页保留；原来的分页文件保留为跳转页。
- 桥接：从 Citrine 2.12.0 拷入 Element Plus / shadcn / 页面配方 / ECharts 桥接当起点，引用的缺失变量已全部补 token（22 个，外加 ECharts 顺序色 5 个与提示气泡 1 个，见 AUDIT「桥接缺口」）；两套组件库桥接都用真实组件走查过：Element Plus 在 `testbed/element-lab`，shadcn/ui 在 `testbed/shadcn-lab`（见各自 FINDINGS），citrine-accept 验收都全绿。完整业务项目 `testbed/mall-ops` 对照效果预览逐角色比对后，0.1.4 校正了 Element 桥接 30 余处、收进 14 个页面形态配方，项目层样式清零，验收全绿（见它的 FINDINGS）。
- 验收：citrine-accept（清单模板 `seeds/morganite/templates/accept.config.mjs`）。品牌色审计按身份文件 `design-system.json` 的 `accept.brand` 检查品牌色是否只出现在 DESIGN「验收基线」列出的位置，判色范围和跟颜色走的对比度例外取项目当前的颜色（要 citrine-tools ≥ 1.4.0）；项目自己的例外写 `APPROVED_CONTRAST`。三个实测项目都在仓库 CI 的验收矩阵里，改了种子或桥接会自动跑完整验收，并按每个官方颜色各跑一遍。

## 接入（交给 AI 做）

Morganite 和 Citrine 用同一套接入工具 [design-system-adopter](../design-system-adopter/)，装法也一样：种子是 npm 包 `@wycm9527/morganite`（0.3.3 起），验收工具与 Citrine 共用 npm 包 `@wycm9527/citrine-tools`（命令 `citrine-accept`）。连不上 npm 时可以把种子文件夹拷进项目（见下面「自己敲命令」的注释）。数字字体 D-DIN 由桥接自带，不用另装。

**第一次接入**：用 Cursor（Agent 模式）、Claude Code 或 Codex 打开项目，把下面整段发出去，只改【】里的内容；技术信息不知道就写「不确定」。

```text
请帮当前打开的项目接入 Morganite 玫瑰金设计系统。
用途：【项目用途，如：管理供应商资料】
本次范围：【新建项目，或要调整的页面】
需要保留：【不改的内容，没有就填"无"】
技术栈：【Vue 3 + Element Plus / React + shadcn/ui / 不确定】
颜色：【玫瑰金 / 蓝 / 紫 / 青 / 绿 / 黄晶黄，不确定就用玫瑰金】

来源：https://github.com/WYCM9527/Design-System（公开仓库，浅克隆到项目外的临时目录）。
先只读识别项目目录、技术栈和接入状态，简要说明路线；旧项目写入前确认工作区已提交，并保存接入前的 git 存档点。
1. 把仓库里的 design-system-adopter 装进项目的 skill 目录（Cursor 是 .cursor/skills/design-system-adopter，Claude Code 是 .claude/skills/），读它的 SKILL.md，之后按它的流程做，不自己发明步骤。
2. 装种子 npm 包 @wycm9527/morganite 和开发依赖 @wycm9527/citrine-tools、style-dictionary，再 ds.mjs init --system morganite，--stack 按技术栈选 element-plus / shadcn / css，颜色不是玫瑰金时加 --palette（id 用 ds.mjs palette --list 查）。npm 装不上先诊断（国内可换镜像 https://registry.npmmirror.com），仍不行就把仓库里的 morganite/seeds/morganite 拷进项目再 init，按 init 打印的步骤用 file: 链接快照。不要把 /tmp 这类项目外路径写进 package.json。
3. 新项目先建一个能启动的应用再接入，没指定就用 Vue 3 + Element Plus；旧项目沿用原技术，只做指定范围的第一期换肤，完成后暂停。
4. 接好样式入口和亮 / 暗主题，steward 构建后 guard 要是 current；AGENTS.md 写入前给我看；做一个最小示例页，建验收清单，跑 citrine-accept all。
页面要和效果预览（切到所选颜色）一致：https://wycm9527.github.io/Design-System/morganite/previews/rose-gold-admin/
结束时给我：预览网址、Morganite 版本和颜色、存档点、做了什么，以及通过 / 未通过 / 跳过 / 未执行的检查结果。
```

**接入以后**，日常用短提示词，每次发一段：

> **做页面**：在当前已接入 Morganite 的项目中做页面。页面：【页面名称】；功能：【需要的功能】。先读项目规则（AGENTS.md）和 design-system/DESIGN.md；颜色、间距、字号只用规范变量，页面骨架用现成配方，缺配方先告诉我，不在页面上补样式。完成后跑验收，给我预览网址和检查结果。
>
> **换颜色**：把当前项目的颜色换成【颜色】。按 design-system-adopter 的换色流程先 dry-run 告诉我会变的地方，确认后再换；换完重新构建、跑验收，给我预览网址和检查结果。官方名单外的颜色先提案，不直接改色值。
>
> **更新**：检查 Morganite 有没有新版本，按 design-system-adopter 的「更新」剧本先 dry-run 给我看差异（尤其是我本地改过的部分），确认后再升级并跑验收。

只改部分页面、旧项目继续迁移、验收进 CI、队友接手、规范不够用时怎么提提案，见[零基础上手教程](../docs/TUTORIAL.md)。

**自己敲命令**（想知道 AI 做了什么，或不用 AI 时）：

```bash
git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds
mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/
npm i @wycm9527/morganite && npm i -D @wycm9527/citrine-tools style-dictionary@5.5.2
#   连不上 npm：mkdir -p vendor && cp -R /tmp/ds/morganite/seeds/morganite vendor/morganite（init 后按它打印的步骤 npm i file:./design-systems/morganite，vendor/morganite 可删）
# --stack 按技术栈选：element-plus（Vue 3 + Element Plus）/ shadcn（React + Tailwind v4 + shadcn/ui）/ css（其他）
# 颜色默认玫瑰金；别的加 --palette <id>（blue / purple / cyan / green / citrine），接入后换色用 ds.mjs palette <id>
node .cursor/skills/design-system-adopter/scripts/ds.mjs init --system morganite --stack element-plus
```

init 把种子落成只读快照 `design-systems/morganite/`（升级时的比较基线）、生成工作副本 `design-system/`，并打印接下来的步骤（Vite 配置、样式入口、构建、验收、项目规则）。然后 steward `build-tokens → guard`（应为 `current`）。升级走 `ds.mjs status / upgrade`（按 tag `morganite-vX.Y.Z` 找新版本；npm 装的会多打印一条 `npm i --save-exact @wycm9527/morganite@<新版本>`，页面引用的桥接在 `node_modules` 里，要跑它才跟上）。

**非 Node 项目**（Flask / Django / PHP / 静态页）：到 [Releases](https://github.com/WYCM9527/Design-System/releases?q=morganite&expanded=true) 下载最新的 `morganite-css-<版本>.tgz`（玫瑰金；别的颜色用 `ds.mjs export --palette <id>` 自己导出），解压到静态目录，按顺序 `<link>` `index.css` → `base.css`（它会自己引入同目录的 `fonts.css`）→ `recipes.css` → 你自己的样式；自己的样式只引用变量。

**数字字体**：数据大字（统计卡、KPI）用 D-DIN 系——装了 D-DIN-PRO 的电脑用它，没装的用桥接自带的 D-DIN（`bridge/fonts.css`，SIL OFL 1.1）。两者字形相同，D-DIN 只有 400 / 700 两档，半粗（600）会显示成 Bold、略粗一点。项目设了 CSP 时要允许 `font-src data:`。

## 发版

改 `seeds/morganite/design-system.json` 与 `package.json` 版本、写 CHANGELOG、更新本文件与仓库根 README 的版本行，`node scripts/check-versions.mjs --system morganite` 通过后打 tag `morganite-vX.Y.Z` 推送，`release.yml` 自动建 Release 并把种子发到 npm（Trusted Publisher 的登记与 2 天时限见 [GUIDE 8b](../docs/GUIDE.md#8b-维护者发版与-ci)）。
