# Citrine 零基础上手教程

给没有开发经验、用 AI 写项目的同学（vibe coder）。你不需要看懂代码：全程把下面的**提示词整段粘给 AI**，AI 会自己干活，只在少数几处停下来问你。每个代码框都是一段可以直接复制粘贴的提示词，**【】里的字换成你的信息**。

想看完整参考（命令、原理、维护者事项）→ [GUIDE.md](GUIDE.md)。本文只讲"怎么做"。

---

## 1. 简单介绍

### Citrine 是什么

Citrine（黄晶）是公司的后台界面设计规范——按钮长什么样、表格留多少边距、什么颜色表示危险、暗色模式怎么切、手机上怎么排——全部定好了，并且打包成 **AI 能直接安装、直接遵守**的形式。

装进项目之后：

- AI 做出来的页面自动是公司统一的样子，不用你逐个描述"按钮黄一点、边距大一点"。
- 亮色 / 暗色、电脑 / 平板 / 手机三种屏幕，都是内置的，不用另做。
- 有一套自动检查（叫"验收"）：文字对比度够不够、有没有乱用品牌黄、手机上有没有横向溢出、键盘能不能操作。跑一遍，绿了就是合格。
- 规范以后更新了，一句话让 AI 升级，你自己改过的部分会被保留。

### 它由四样东西组成（AI 会装，你不用记）

| 东西 | 干什么 | 你需要碰吗 |
| --- | --- | --- |
| **设计系统种子** `@wycm9527/citrine` | 规范本体：颜色 / 字号 / 间距的定义（叫 token）、规则文档、组件外观、页面公共骨架 | 不碰，只读 |
| **adopter skill** | 教 AI 怎么接入、换规范、升级的"剧本" | 装一次 |
| **steward** | 把 token 构建成 CSS、检查有没有跑偏的治理工具 | AI 会带你装 |
| **验收工具** `@wycm9527/citrine-tools` | 自动检查页面的那套东西 | 不碰 |

### 你要准备的

- 一台电脑（Mac 或 Windows），装了 **Cursor**（Codex、Claude Code 也行）。
- 网络能访问 GitHub 和 npm（国内一般可以；慢或不通看 [FAQ](#5-faq)）。
- 其余（Node.js、git、Google Chrome）不用提前装，第一步的提示词会让 AI 检查并帮你装。

### 你在整个过程里要做的事

1. 粘提示词。
2. AI 停下来问你时回答（全程就三四处：项目叫什么、选哪套技术栈、看一眼它要写入的规则文件、点头装工具）。
3. 看结果——验收"通过"就是合格。

### 三条纪律（你不用执行，但要知道，看到 AI 违反就叫停）

1. **颜色 / 间距 / 字号不许在页面上手写数值**，只能用规范里的变量。看到 AI 在页面里写 `#F5C400`、`padding: 13px` 这种，就是错了。
2. **页面骨架用规范自带的"配方"**（页头、筛选栏、状态胶囊、表单、空状态……），不自己重新画。
3. **规范不够用就"提提案"**，不在页面上打补丁。快照目录 `design-systems/citrine/` 任何时候都不改。

---

## 2. 执行步骤

### 第 0 步：打开项目，打开 AI

- **新项目**：在电脑上新建一个空文件夹（名字用英文，比如 `order-admin`），用 Cursor「打开文件夹」打开它。
- **已有项目**：用 Cursor 打开项目文件夹。
- 打开右侧聊天面板，模式选 **Agent**（不是 Ask——Ask 模式只会回答，不会动手）。

### 第 1 步：安装（每个项目做一次，约 5 分钟）

把下面整段原文粘给 AI。它会检查环境、下载、安装、自检，只在"项目叫什么"处可能问你一次；装好后会问你「新项目还是旧项目换新」，你按第 2 步回答。

```text
你现在全权负责把公司设计系统 Citrine 的整套工作流装进这台电脑的项目里。我是小白，不要问我技术问题：能自动判断的全部自动做，只在标注【必须问我】的地方停下来问；每一步先用一句话说你在做什么，做完把结果给我看；任何一步失败就停下，用大白话告诉我原因和我该做什么，不要自己换别的办法绕过去。

一、环境检查（缺什么装什么；装系统软件前先告诉我一句再装）
1. Node.js 版本 ≥ 22（node -v）。没有或太旧：macOS 用 brew install node（没有 brew 就去 nodejs.org 下载 LTS 安装包），Windows 用 winget install OpenJS.NodeJS.LTS。
2. git（git --version）。没有：macOS 跑 xcode-select --install，Windows winget install Git.Git。
3. Google Chrome（验收截图要用）。没有就装。
4. 看当前目录：已经是前端项目（有 package.json）就在这里装；不是的话【必须问我】项目叫什么名字，然后新建这个文件夹、进入、git init。

二、下载仓库（公开仓库，不需要账号）
git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds
如果失败（超时 / 连不上）：停下，用大白话告诉我「访问 GitHub 失败」，让我处理网络后再重试。不要尝试其他下载方式。

三、安装三件东西（在项目目录里）
1. skill：mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/。如果你不是在 Cursor 里运行，就装到你自己的 skill 目录（Codex 是 ~/.codex/skills/，Claude Code 是项目 .claude/skills/）。
2. 设计系统种子与验收工具，先试 npm：npm i @wycm9527/citrine && npm i -D @wycm9527/citrine-tools style-dictionary@5.5.2。如果报 404 / 超时 / 连不上，改走文件夹渠道：mkdir -p vendor && cp -R /tmp/ds/citrine/seeds/brand-yellow-e vendor/citrine，然后访问 https://api.github.com/repos/WYCM9527/Design-System/releases/latest，在 assets 里找名字以 wycm9527-citrine-tools- 开头的 browser_download_url，npm i -D <那个地址> style-dictionary@5.5.2。两条路都不要用 npm i file:/tmp/...——那会把只在这台电脑上存在的路径写进 package.json。
3. 治理工具：node .cursor/skills/design-system-adopter/scripts/ds.mjs steward locate；如果输出「未找到」，就跑 node .cursor/skills/design-system-adopter/scripts/ds.mjs steward install。

四、自检（四条都要通过才算装好，任何一条不过就回到对应步骤重做）
- node .cursor/skills/design-system-adopter/scripts/ds.mjs detect 的输出里有 citrine（npm 装的显示 [npm]，文件夹渠道显示 [folder]）
- node .cursor/skills/design-system-adopter/scripts/ds.mjs steward locate 输出一个路径
- 文件 .cursor/skills/design-system-adopter/SKILL.md 存在
- 文件 node_modules/.bin/citrine-accept 存在

五、收尾
- 在 .gitignore 里确保有 node_modules/、.accept/、.adopter-conflicts.json 三行（没有就加）；vendor/、design-systems/、.cursor/skills/ 不要忽略。
- 通读一遍 .cursor/skills/design-system-adopter/SKILL.md。
- 用大白话向我汇报：装了哪四样、各放在哪、自检结果。然后只问我一个问题：「这个项目是从 0 开始的新项目，还是要把现有项目换成公司规范？」我回答后，按 SKILL.md 对应的剧本继续，不要自己发明步骤。
```

**装好的标志**：AI 汇报四条自检全过，并问你"新项目还是旧项目换新"。

### 第 2 步：告诉 AI 走哪条路

#### 2A · 新项目，从零开始

先决定技术栈（不懂就选第一个）：

- **Vue 3 + Element Plus**：不知道选什么就选它，公司大多数后台是这个。
- **React + shadcn/ui**：团队已经在用 React 才选。

```text
这是从 0 开始的新项目。用 Citrine 设计系统起一个【Vue 3 + Element Plus】的中后台，按 design-system-adopter 的「从 0 开始」剧本把系统接好、验收跑绿之后再开始做页面。配方不够用时提提案，不要在页面上补样式。
项目要做的是：【一句话说这个后台管什么，比如"供应商采购申请的审批后台"】。
```

AI 会做：搭应用骨架 → 接入 Citrine → 构建并校验 → 写样式入口 → 生成项目规则文件 `AGENTS.md`（给你看一眼再写入）→ 建验收清单 → 跑验收。

**你要拍板的点**：选栈（上面已经选了）；`AGENTS.md` 写入前看一眼，点头；它要装 steward 时点头。

**完成标志**：AI 说 `guard` 是 `current`，验收四项全部「通过」。之后就可以按第 3 步做页面了。

#### 2B · 已有项目，换成公司规范

开始前两件事：

1. **项目要先在 git 里提交一次**（批量改样式的硬要求）。不会的话对 AI 说「帮我把当前项目提交到 git」，它会做。
2. **项目用的组件库是什么**——不知道没关系，下面的提示词会让 AI 先告诉你。如果是 Element Plus 或 shadcn/ui，一路畅通；是别的（Ant Design、Vuetify……），第一期只能换骨架和颜色，组件外观暂时保持旧样子，见 [4.3](#43-项目用的组件库不是-element-plus-也不是-shadcnui)。

```text
把这个项目换成 Citrine 设计规范，按 design-system-adopter 的「更换现有规范」剧本做。
开始前先只读摸底，告诉我：这个项目用的组件库是什么、旧样式里有多少旧变量 / 硬编码颜色 / 内联样式（工程量报告）。如果组件库不是 Element Plus 也不是 shadcn/ui，停下来告诉我这是桥接缺口，等我决定是否继续。
然后先做第一期换肤，给我看前后截图、验收报告和二期收编清单再继续，不要自己进入二期。
```

换规范分三期，每期结束都能上线：

| 期 | 发生什么 | 你拿到什么 |
| --- | --- | --- |
| 一 · 换肤 | 接入规范，挂上组件库桥接，旧变量做别名过渡 | 组件（按钮 / 表格 / 表单 / 弹窗）立刻变成新样子；一份"还剩什么"的清单 |
| 二 · 收编 | 把旧的写死颜色、旧变量逐个换成规范变量，页面骨架换成配方 | 验收数字逐批变绿 |
| 三 · 收尾 | 写项目规则、验收进 CI | 干净的项目 |

**AI 会在这四处停下问你**：工作区不干净要先提交；把原来的 `design-system/` 目录（如果有）改名当迁移证据；写入 `AGENTS.md`；二期一份"旧颜色 → 新变量"的映射草稿要你过目。其余不用你介入。

第一期看完满意，进入二期：

```text
第一期看过了，开始二期收编。按 design-system-adopter「更换现有规范」剧本的二期做：先自动处理没有歧义的项，需要我决定的映射整理成一份清单一次性问我，不要逐条打断。每批做完跑验收给我看数字变化。
```

### 第 3 步：日常做页面

接入完成后，做页面就是正常跟 AI 聊。但每次带上"按规范做"那句，AI 才会去翻规则：

```text
做一个【页面名，比如"供应商列表"】页面：【描述功能，比如"顶部筛选（名称、状态、城市），下面表格，每行可以查看 / 编辑 / 停用，右上角新建按钮"】。
按 design-system-adopter 的日常做页面剧本：页面骨架用 recipes 配方类，颜色 / 间距 / 字号只用 token 变量，不写任何 hex 和裸像素。配方不够用就停下告诉我缺什么、建议进哪一层，不要在页面上补样式。做完把页面加进 accept.config.mjs 并跑验收，把结果给我。
```

只跑验收：

```text
跑一遍完整验收（npx citrine-accept all），把四项结果用大白话告诉我：哪项通过，哪项没过、具体是哪个页面的什么问题。
```

验收没过：

```text
验收没过，结果如下：
【把 AI 上一步贴出来的"未通过"那几行粘在这里】
按 design-system-adopter 的 references/troubleshooting.md 归因到层：是页面自己写错了就现场修；是组件库默认样式或命中区的问题属于桥接层，不要用 !important 压过去，整理成提案告诉我。修完重跑验收。
```

规范不够用（AI 说"没有对应的配方"，或者你想要一个规范里没有的样式）：

```text
把这个需求提成提案：【描述缺什么，比如"表格里需要一个带进度条的单元格样式"】。用 ds.mjs propose 生成提案草稿，写清场景、期望效果、建议进哪一层（token / 桥接 / 配方），然后把预填好的 GitHub issue 链接给我。在提案被接受之前，先用最接近的现有配方顶住，不要在页面上补样式。
```

### 第 4 步：看懂验收结果

验收有四项，AI 会逐项报"通过 / 未通过"：

| 项 | 检查什么 | 常见没过的原因 |
| --- | --- | --- |
| pages | 每个页面亮暗两遍：文字对比度、按钮有没有名字、有没有横向溢出、品牌黄有没有乱用、暗色是否真的生效 | 页面把黄色当强调色用了；暗色没接 |
| components | 全组件走查：鼠标悬停 / 键盘聚焦时颜色对不对 | 通常是规范层的问题，提案即可 |
| narrow | 窄屏侧栏折叠、手机侧栏抽屉、无横向溢出 | 某个元素写了固定宽度 |
| focus | 键盘 Tab 到每个元素都有可见的焦点框 | 自定义了控件但没做焦点态 |

四项全「通过」= 合格。任何一项没过，粘给 AI（第 3 步"验收没过"那段提示词）。

---

## 3. 后续更新

规范会不断改进（新配方、修 bug、调整间距……）。维护者发新版后，你的项目不会自动变，需要升级一次。

### 检查有没有新版本、预览差异

```text
检查 Citrine 有没有新版本，按 design-system-adopter 的「更新」剧本先 dry-run 给我看差异：哪些是直接更新的、哪些是我本地改过会被保留的、有没有冲突。先不要真的升级。
```

AI 会告诉你当前版本、最新版本、以及分类好的差异列表。

### 确认升级

```text
可以升级。按「更新」剧本执行升级；如果有冲突，把每个冲突用大白话解释（我本地改了什么、上游改了什么），一条条问我选保留本地还是取上游。升级后按剧本跑 build-tokens、guard 和完整验收，把结果给我。如果页面 import 的包在 node_modules 里，别忘了按 upgrade 打印的那条 npm i 命令把它同步到新版。
```

**关于"冲突"**：只有当**你本地改过某个值**、上游**恰好也改了同一个值**才会冲突。没改过的文件直接更新，你改过而上游没动的直接保留。所以大多数升级不会问你。

**升级后页面样子有变化是正常的**（比如表格边距变了）——那正是新版的改进。想知道改了什么，问 AI：

```text
把这次升级涉及的 CHANGELOG 条目用大白话讲给我听，哪些会影响我现有页面的外观。
```

### 网络不通时升级

```text
升级时下载失败。请先确认是不是网络问题（能不能访问 github.com）。如果访问不了，告诉我到 https://github.com/WYCM9527/Design-System/releases 下载最新的 wycm9527-citrine-<版本>.tgz，我下好后告诉你路径，你用 upgrade --from <路径> 离线升级。
```

---

## 4. 特殊情况

### 4.1 项目不是 Node 工程（Flask / Django / PHP / 静态模板）

没有 `package.json` 的项目装不了那四样东西，但规范本来就是纯 CSS，照样能用。**不要让 AI 把颜色值抄进自己的 CSS**——那等于复制了一份规范，以后升级就断了。

```text
这个项目是【Flask】模板 + 一个 CSS 文件，不是 Node 项目。按 design-system-adopter 的「非 Node 项目」剧本：
1. 导出 Citrine 的纯 CSS 到 static/citrine/（用 ds.mjs export；这台机器没有 adopter 的话，先 git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds，用 /tmp/ds 里的 adopter 和种子导出），不要手抄任何变量值。
2. 模板 <head> 里按顺序引入 index.css → recipes.css → 原有的样式文件。
3. 把原有样式里的颜色 / 字号 / 间距改成引用变量，模板的页头 / 筛选栏 / 状态标签 / 表单换用配方类。
4. 把服务跑起来，用 npx citrine-accept pages --url http://127.0.0.1:【端口】 --tokens static/citrine 跑验收给我看。
```

只想拿一份 CSS 文件、什么都不装：到 [Releases](https://github.com/WYCM9527/Design-System/releases) 下载最新的 `citrine-css-<版本>.tgz`，解压就是 `index.css` + `recipes.css` + Element 桥接。

### 4.2 只想覆盖项目里的几个板块，其他板块不动

先分清是哪种"板块"：

- **一个仓库里有多个独立应用**（各自有 `package.json`）→ 只对要换的那个应用做第 2 步即可，其他应用天然不受影响。
- **同一个应用里按页面 / 路由分**（`/orders` 换、`/legacy-report` 不换）→ 用"范围根"：规范只在指定路由下生效。

```text
这个项目里只有【/orders 和 /suppliers】这几个板块要换成 Citrine，其余板块保持原样，一个像素都不能受影响。按 design-system-adopter 的「只覆盖部分板块」剧本做范围根。做完后打开一个未接入的页面，用截图和检查结果证明它没有被影响。
```

范围根是过渡态：新板块先立住，之后再按 2B 的二期把旧板块逐个纳入。同一屏上新旧组件混排不支持。

### 4.3 项目用的组件库不是 Element Plus 也不是 shadcn/ui

规范目前只为这两个组件库做了"桥接"（让组件长成规范的样子）。其他组件库（Ant Design、Vuetify、Naive、纯手写……）：

- 第一期换肤仍然能做：页面骨架、颜色、间距会变成新规范，但按钮 / 表格 / 弹窗这些组件保持旧外观。
- 想让组件也变，需要维护者为该组件库写一份桥接（约 2–3 天，写完是公司资产）。

```text
先只读摸底，不改任何文件：告诉我这个项目用的组件库和版本、页面数量、旧样式的工程量（旧变量 / 硬编码 / 内联样式各多少）。整理成一段可以直接发给设计系统维护者的说明，包含项目路径和组件库名字，请他评估是否为这个组件库写桥接。
```

把这段说明发给维护者，等回复再决定做不做第一期。

### 4.4 多人协作：队友怎么拿到

你接入完成并提交到 git 后，队友**不需要重新安装**任何东西：

- 队友 `git clone` 项目 → `npm install` → 一切就位（`design-systems/`、`design-system/`、`.cursor/skills/` 三个目录随项目提交，这就是他们零配置的原因）。
- 队友第一次在项目里用 AI 做页面时，粘这段让 AI 接上状态：

```text
这个项目已经接入了公司设计系统 Citrine。先读 AGENTS.md 和 .cursor/skills/design-system-adopter/SKILL.md，跑 ds.mjs status 和 steward locate 确认环境（缺 steward 就装），然后告诉我：当前规范版本、验收清单里有哪些页面、我做页面时要遵守的三条纪律。
```

**千万不要**让任何人用 `npm i file:/tmp/...` 这类指向自己电脑路径的方式装种子——队友的 `npm install` 会直接失败。第 1 步的提示词已经避开了这个坑。

### 4.5 想改规范本身（换个颜色、加一种样式）

规范是公司统一的，**不在自己项目里改**——改了会和公司其他项目不一致，升级时也会产生冲突。正确做法是提提案（第 3 步那段"提提案"提示词），维护者接受后发新版，所有项目升级即可。

确实只有你这个项目需要的差异（比如登录页的品牌背景），让 AI 写在项目自己的补充样式里，并在验收配置里登记理由：

```text
【登录页的品牌区】需要用品牌黄做背景，这是本项目的合法例外。按规范的做法：样式写在项目自己的 app.css 里且只引用 token 变量，在 accept.config.mjs 的 YELLOW_ALLOW 里登记这个选择器并写明理由，然后重跑验收。不要改 design-systems/citrine/ 里的任何文件。
```

### 4.6 综合情况：旧项目 + 只换部分板块 + 带一个 Flask 子系统

真实项目常常同时命中 4.1、4.2 和 2B。下面这段整段粘贴、全权交给 AI（方括号处填你的信息）：

```text
你现在全权负责把项目【项目绝对路径】换成公司设计系统 Citrine，但只覆盖我指定的板块，其他板块一个字节不能受影响。我不懂技术细节：能自动判断的全部自动做，只在标注【必须问我】的地方停下来问；每一步先用一句话说你在做什么，做完把结果给我看；任何一步失败就停下，用大白话说原因和我该做什么，不要换别的办法绕过去。全程严格按项目里 .cursor/skills/design-system-adopter/SKILL.md 及其 references 剧本执行，不自己发明步骤。

〇、准备
1. 如果 .cursor/skills/design-system-adopter/ 不存在，先按 Citrine 教程第 1 步的安装提示词把四样东西装好（种子先试 npm，失败走文件夹渠道；不要用 npm i file:/tmp/...）。
2. 确认项目在 git 里且工作区干净（git status）。不干净就停下让我提交，不要替我提交。
3. 通读 SKILL.md、references/existing-project.md、references/scope-root.md、references/non-node.md。

一、摸底（只读，不改任何文件）
1. 跑 ds.mjs detect，告诉我识别到了什么。
2. 找到 design-system-steward（ds.mjs steward locate；没有就 steward install），跑 audit，给我一份工程量报告：旧变量、硬编码字面量、内联样式各多少。
3. 列出这个项目的结构：有哪些应用 / 路由板块 / 目录，用的组件库是什么，有没有非 Node 的子系统。然后【必须问我】：这些板块里哪几个要换成 Citrine，哪几个保持原样。我的初步答案：覆盖【要覆盖的板块】，保持原样的有【不动的板块】，另外【Flask 子系统路径】是 Flask 模板 + 一个 CSS 文件、不是 Node 项目。
4. 如果组件库不是 Element Plus 也不是 shadcn/ui：停下告诉我这是桥接缺口，第一期只能换骨架与 token、组件会保持旧样子，等我决定是否继续。

二、Node 应用的第一期换肤（只覆盖指定板块）
1. 如果项目已有 design-system/ 目录，【必须问我】是否同意把它改名为 design-system.legacy/ 当迁移证据；同意后 ds.mjs init --legacy-rename，否则不加这个参数（system 和 stack 让它自动推断，推断不出再问我）。
2. steward build-tokens → guard 必须是 current。
3. 因为只覆盖部分板块，用范围根：ds.mjs scope --root citrine --to src/styles/citrine-scoped --with <桥接组>；样式入口改引 citrine-scoped/ 里的文件，组件库基础样式保持全局；index.html 的 <html> 默认带 class="citrine"；不覆盖的板块在路由 meta 上标 legacy: true，加路由守卫按 meta 切换 <html> 上的 citrine 类（按命令打印的片段做）。
4. 旧变量做别名过渡：新建一个过渡样式文件，把旧变量名指向新 token，列出你映射了哪些，映射不了的告诉我。
5. 把 src/styles/citrine-scoped/** 和确认保持原样的板块目录登记进 design-system/exemptions.json，每条写理由。
6. ds.mjs agents 渲染 AGENTS.md 全文给我看，【必须问我】确认后再 --write；里面要写清哪些板块归新规范、哪些是旧板块不碰。
7. 建 accept.config.mjs，只登记覆盖板块的页面；npm run build && npx citrine-accept all 跑到全绿。
8. 自证旧板块没被波及：打开一个未覆盖的路由，检查 <html> 上没有 citrine 类、规范的 CSS 变量在那里取不到值、组件仍是组件库默认外观；把这三项结果连同一张截图给我。

三、Flask 子系统（非 Node，纯 CSS 交付）
1. ds.mjs export --system citrine --to <Flask 子系统>/static/citrine，得到 index.css、recipes.css 和清单。不要把变量值手抄进任何 CSS。
2. 模板 <head> 按顺序 <link>：index.css → recipes.css → 原有的样式文件；暗色靠 <html class="dark">。
3. 把原有样式里的颜色 / 字号 / 间距 / 圆角 / 阴影改成引用变量（可用 steward migrate 辅助，需要我决定的映射整理成清单问我）；表格列宽这类"按内容定"的像素允许保留。模板的页头 / 筛选栏 / 状态胶囊 / 操作胶囊 / 表单 / 空态换用 recipes 的配方类。
4. 把 Flask 服务跑起来，npx citrine-accept pages --url http://127.0.0.1:<端口> --tokens <Flask 子系统>/static/citrine（narrow、focus 同理），跑到全绿。

四、汇报与交接
用大白话给我：摸底数字、第一期做了什么、两边验收结果、旧板块自证结果，以及二期收编清单——哪些板块还没纳入、待决字面量还有多少、建议的顺序。然后只问我一个问题：「现在开始二期收编，还是先上线看效果？」在我回答前不要动二期。

硬边界：不改 design-systems/citrine/ 快照和 citrine-scoped/ 生成物；配方不够用就记下来作为提案告诉我，不在页面上补样式值，不用 !important 压验收；每一处写入前告诉我将发生什么。
```

### 4.7 不在 Cursor 里用

Codex、Claude Code 都可以。区别只在第 1 步 skill 装到哪：Codex 是 `~/.codex/skills/`，Claude Code 是项目的 `.claude/skills/`——第 1 步的提示词里已经写了，AI 会自己判断。

### 4.8 Windows 电脑

流程完全一样。第 1 步的提示词里 Node / git 的安装命令已经分平台写好；Chrome 装在默认位置即可被验收工具找到。

---

## 5. FAQ

**AI 没有按规范做，自己在页面上写颜色了。**
提示词里要带上「按 design-system-adopter 的 XX 剧本」这句，AI 才会去翻规则。另外确认项目里存在 `.cursor/skills/design-system-adopter/SKILL.md` 和 `AGENTS.md`。叫停并粘：

```text
停。你刚才在页面里写了硬编码的颜色 / 像素，违反了项目 AGENTS.md 的规范纪律。撤回这部分，改成 token 变量和 recipes 配方类；规范里没有对应物的地方停下告诉我，作为提案处理。
```

**`npm i @wycm9527/citrine` 报 404 或超时。**
多半是国内访问 npm 官方源慢。让 AI 换镜像后重试，或走文件夹渠道（第 1 步提示词里已经有自动回退）：

```text
npm 安装超时。先执行 npm config set registry https://registry.npmmirror.com 换成国内镜像再重试；镜像上还没有这个包就按安装提示词的文件夹渠道走。
```

**验收说「未找到 Chrome」。**
装 Google Chrome。装在非默认位置的话，让 AI 设置环境变量 `CHROME` 指向 Chrome 的可执行文件。

**验收说「品牌黄出现在允许清单之外」。**
规范里黄色只做"主按钮 / 选中开关 / 进度"这类主操作，不做强调色和状态色。AI 把黄色用在了未读圆点、边框、标题之类的地方——让它换成中性色或状态色（第 3 步"验收没过"那段提示词）。确实合法的位置（登录页品牌区）见 4.5。

**验收说「暗色未生效」。**
页面没有把 `?theme=dark` 落成 `<html class="dark">`。粘给 AI：

```text
验收报暗色未生效。按验收配置模板的说明，在 index.html 首屏先读 URL 的 theme 参数再读 localStorage，把它落成 <html class="dark">，避免闪烁。改完重跑 pages 验收。
```

**队友 `npm install` 报找不到 `file:/tmp/...` 之类的路径。**
有人用自己电脑上的路径装了种子或工具。让 AI 按第 1 步的方式重装（npm 版本号或项目内相对路径），提交后队友重新 `npm install`。

**升级完了，页面样子没变。**
种子是 npm 安装的话，页面实际引用的是 `node_modules` 里的那份，升级后要跟着更新一次——`upgrade` 结束时会打印那条 `npm i …` 命令。粘给 AI：

```text
升级后页面外观没变。跑 ds.mjs status 看 node_modules 里的版本是否落后于清单；落后就按它打印的命令同步，然后重新构建并跑验收。
```

**我能不能自己改颜色 / 间距？**
公司统一的部分不改，提提案（4.5）。项目工作副本 `design-system/` 里允许有登记过的例外，升级时会被保留；但每一处例外都要有理由，验收会盯着。

**手机端要不要另外做？**
不用。桌面 / 窄屏 / 手机三种形态内置：侧栏折叠、抽屉导航、表格内部滚动、弹窗贴底全宽都是自动的。验收的 narrow 项会检查。

**想看规范原文 / 让 AI 讲讲规则。**
规则在项目 `design-system/DESIGN.md`。粘给 AI：

```text
读 design-system/DESIGN.md，用大白话给我讲：颜色是怎么分工的（黄色什么时候能用）、页面骨架有哪些现成配方、按钮和链接分几种、做表格页和表单页的固定套路。
```

**AI 想修改 `design-systems/citrine/` 里的文件。**
拒绝。那是只读快照，改了以后升级就无法合并。让它把想改的东西提成提案。

**有问题 / 有建议想反馈给维护者。**
第 3 步"提提案"那段提示词——AI 会生成一份格式统一的草稿和预填好的 issue 链接，你点开提交即可。真实项目的反馈是这套规范变好的唯一来源。

### 名词小抄

| 词 | 大白话 |
| --- | --- |
| 终端 | 电脑上敲命令的黑框。本教程里你基本不用碰，AI 替你敲 |
| npm | JavaScript 的"应用商店"，`npm i xxx` 就是从那里下载一个包 |
| git | 项目的"时光机"，记录每次改动，可以回退。「提交」= 存一个存档点 |
| token | 规范里一个个命名的值，比如 `color.text.primary` 代表正文颜色。页面只引用名字，不写具体色值 |
| 桥接 | 让 Element Plus / shadcn 这类现成组件库长成规范样子的那层 CSS |
| 配方 | 规范自带的页面公共骨架：页头、筛选栏、状态胶囊、表单布局…… |
| 验收 | 自动检查页面是否符合规范的那套工具，结果只有通过 / 未通过 |
| 快照 / 工作副本 | `design-systems/citrine/` 是上游原样（只读，升级基线）；`design-system/` 是你项目在用的那份（可以有登记过的例外） |
| steward | 把 token 构建成 CSS、检查有没有跑偏的治理工具，AI 会装 |
| 范围根 | 让规范只在指定路由下生效的技术，用于只换部分板块 |
