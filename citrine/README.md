# Citrine Design System

**黄晶 · 公司级中后台设计系统** — 一个以品牌黄为唯一焦点、冷灰为骨架的 Web 中后台设计系统：DTCG 令牌单一来源、亮 / 暗两种模式、Element Plus、shadcn/ui 与 ECharts 三条桥接、给编码 Agent 的组件配方，以及一套可复跑的验收基线。

![Citrine · 实测项目「轻采」亮 / 暗模式](docs/screenshots/hero.png)

版本 **2.11.9** · Core 321 个 token · dark 70 条 delta · 变更见 [CHANGELOG](seeds/brand-yellow-e/CHANGELOG.md)

---

## 它解决什么

中后台项目的样式失控通常不是缺规范，而是规范活在文档里、代码里各写各的。Citrine 把"设计决定"收进一个可构建、可校验、可守卫的令牌系统，让人和 AI 编码 Agent 都只从同一个地方取值：

- **一个来源**：颜色、字体、字号阶梯、控件高度、间距、圆角、线宽、阴影、动效、层级、图表色全部是 DTCG 格式的 token，构建成 CSS 变量；页面不写任何色值与像素字面量。
- **暗色零重复**：`dark` 只覆写颜色与浮层层，尺寸、字体、间距一律不动；品牌黄一个字节不动。密度只有舒适一档，不做全局密度开关。
- **组件库不再"自带主见"**：Element Plus 桥接把 `--el-*` 全部指向 token，并按 Element 2.14 **全部组件**走查逐条接管它写死的主色、焦点环、色表和高度——hover 与 focus 不会再冒出一个黄色，按钮与输入框第一次真正同高。
- **给 Agent 的配方，而不是给人的论文**：`DESIGN.md` 顶部十条速查 + 一张"组件 → token"配方表；一个从未看过项目源码的编码 Agent 只凭它做出的页面，通过了全部自动验收。
- **验收基线是规范的一部分**：对比度阈值与已批准例外、可访问名称、命中区、溢出、键盘焦点、窄屏、构建一致性、全组件走查——每次改动都以此复跑。

## 设计立场（十条硬规则）

1. 黄只做主操作面：主按钮、进度 / 滑杆填充、勾选 / 开关选中、当前步骤。**选中、当前、强调一律用深黑反转块或近黑文字**，不用黄。
2. 黄底深字、白底无黄字、任何 hover / focus 不出现黄；品牌黄没有延伸色——不做浅调、深金、半透明洗色。
3. 中性色是冷灰（gray 族），暗色深底与它同族；黄与深蓝近黑形成互补，黄更跳、灰不脏。
4. 状态色只做"文字 + 同色浅底"胶囊；实底按钮只有主（黄）与危险（红底白字）。
5. 彩色文字不落在灰底上：状态色、危险色只与白底或同色浅底成对。
6. 按钮不能裸放：描边（次要）或浅底（quiet）。表格操作列默认是操作胶囊（同色发丝描边、与状态胶囊同高），只有审批类决定用 small quiet 文字按钮；危险动作红字 + 浅红底。
7. 链接无色系（品牌决定），分四层：内容型（下划线 + 斜体）、操作型（同色胶囊描边，行内胶囊档 24、400 字重）、导览型（文字 + 右箭头）、标题型（近黑 + 500）。
8. 尺寸只从 token 拿：控件高度三档共用、间距 4px 阶梯、圆角按容器层级递减、字号八档、中文不低于 12px。
9. 字重：正文与胶囊 400，标签 500，反转块选中 500，数据大字 700；不要 `-webkit-font-smoothing: antialiased`。
10. 焦点必须一眼可见（近黑实线，暗色近白）；图标类控件必须有可访问名称且命中区 ≥ 24px。

## 仓库结构

```text
citrine/
├── seeds/brand-yellow-e/        # 设计系统种子（复制进项目即用）
│   ├── design-system/           #   DESIGN.md（速查 + 规则 + 配方 + 验收基线）、tokens/、themes/dark/、theme-map.json
│   ├── bridge/                  #   element-plus.css · shadcn.css（+ shadcn-globals.css 模板）· echarts.js(+.d.ts) · iconpark.css / iconpark.config.ts · recipes.css（页面骨架配方）· vue/ 与 react/（配方组件）
│   ├── bin/citrine.mjs          #   citrine CLI：init / manifest / upgrade / status
│   └── package.json             #   npm 包 @wycm9527/citrine（exports 暴露 bridge/*、echarts、iconpark.config、vue/*、react/*）
│   ├── README.md                #   用法、硬规则、从旧规范迁移的角色对照
│   └── CHANGELOG.md             #   rc.1 → 2.4.0 每一条决定的来历
├── previews/yellow-admin/       # 静态预览：手写 token（E）与构建产物（S）逐像素一致的两套页面
├── testbed/golden-admin/        # 实测项目一「黄金后台」：Vue 3 + Element Plus，18 个页面 × 亮 / 暗 + 全组件走查页
│   ├── PRD.md · FINDINGS.md     #   需求与 72 条实测发现（每条对应一次系统级修正；D73 起在 light-procure）
│   └── app/                     #   AGENTS.md 是编码 Agent 的规则入口
├── testbed/legacy-shop/         # 实测项目二：暖灰旧规范的遗留后台，排练 audit → migrate → guard 的迁移路径
├── testbed/light-procure/       # 实测项目三「轻采」：按 PRD 从零接入的试点——采购 / 资产 / 审批 12 页，验证第二个项目能否只靠文档与配方层落地
├── testbed/shadcn-lab/          # 实测项目四：React + Tailwind v4 + shadcn/ui 实验室，第二条消费路径的渲染验证与全组件走查
├── tools/                       # 仓库级验收工具（页面扫描、全组件走查、窄屏、Tab 焦点、E/S 像素比对），项目用 accept.config.mjs 登记清单
└── docs/screenshots/            # 本页截图
```

治理工具（`audit / migrate / guard / status / build-tokens / validate-system`）来自独立仓库 [WYCM9527/skills](https://github.com/WYCM9527/skills) 的 `design-system-steward`。本目录的脚本与文档默认它被克隆在仓库根的 `skills/` 目录。

## 快速开始

```bash
git clone https://github.com/WYCM9527/Design-System.git && cd Design-System
git clone https://github.com/WYCM9527/skills.git skills          # 治理工具，放在仓库根目录

# 种子是纯数据包（目录 citrine/seeds/brand-yellow-e 即 npm 包 @wycm9527/citrine 的包根，身份文件 design-system.json）；
# 接入 / 更新由仓库根的 design-system-adopter skill 驱动（安装一行命令见根 README），验收工具是 @wycm9527/citrine-tools（citrine/tools）
cd /path/to/project
npm i @wycm9527/citrine && npm i -D @wycm9527/citrine-tools style-dictionary@5.5.2   # 方式 A：npm registry；方式 B（文件夹渠道 + Releases 直链）见 docs/GUIDE.md §2
node .cursor/skills/design-system-adopter/scripts/ds.mjs init --system citrine --stack element-plus   # 或 --stack shadcn
# init：落只读快照 design-systems/citrine/ → 生成工作副本 design-system/ → 写 .adopter.json → 打印该栈的样式入口与接线
node <Design-System>/skills/design-system-steward/scripts/build-tokens.mjs --project "$PWD"   # → design-system/dist/
node <Design-System>/skills/design-system-steward/scripts/guard.mjs --project "$PWD"          # 应为 current
```

桥接、配方与配方组件**直接从包 import**，项目里不放副本：样式入口按顺序引入组件库基础样式 → `design-system/dist/index.css` → `@wycm9527/citrine/bridge/element-plus.css`（或 `bridge/shadcn.css`）→ `@wycm9527/citrine/bridge/recipes.css` → 项目自己的补充；组件 `@wycm9527/citrine/vue/StatCard.vue` / `@wycm9527/citrine/react/StatCard`，图表 `@wycm9527/citrine/echarts`。暗色在 `<html>` 上加 `dark`。项目规则写进 `AGENTS.md`（见 `testbed/light-procure/app/AGENTS.md`）。升级：`npm update @wycm9527/citrine && npx citrine upgrade`——本地没改过的上游文件直接更新、改过的跳过并列出，然后 build-tokens → guard → `citrine-accept all`。细节见 [种子 README「用法 / 升级」](seeds/brand-yellow-e/README.md#用法)。

已有旧规范的项目走 adopter 的「更换现有规范」三期剧本：换肤（init --legacy-rename + 桥接接管）→ 收编（steward `audit` → `adopt / replace` 自动处理无歧义项，其余按种子 `migration/roles.json` 的**角色对照**起草 settle 决策）→ 收尾（`guard` / `status` 两绿）。排练记录见 `testbed/legacy-shop/README.md`。升级：`ds.mjs status → upgrade`（三方合并，本地改动经确认保留）。

## 实测项目

**接入试点「轻采」**（[`testbed/light-procure/`](testbed/light-procure/)）：一份企业采购与资产后台的 PRD（12 页、3 类角色、单级审批），由四个互不通气的编码 Agent 只靠仓库文档从零实现，每一处"文档没规定、只能自己定"的地方都被记下（[158 条原始笔记](testbed/light-procure/notes/)），集成后按 15 条验收用例走通闭环，94 个页面状态 × 亮暗验收全绿。这次试点把页面骨架配方层（`bridge/recipes.css` + `bridge/vue/`）和仓库级验收工具（`tools/`）逼进了种子——第二个项目不用再看第一个项目的源码；26 条发现与处理见 [FINDINGS.md](testbed/light-procure/FINDINGS.md)。下面的截图全部来自它。

| 采购申请列表 · 申请人视角（内容型链接 + 操作胶囊 + ⋯） | 采购申请列表 · 暗色 |
| --- | --- |
| ![](docs/screenshots/procure-applications-light.png) | ![](docs/screenshots/procure-applications-dark.png) |

| 审批中心（待审批 / 我已处理页签、待办计数） | 审批抽屉 · 暗色（浮层内原位确认） |
| --- | --- |
| ![](docs/screenshots/procure-approvals-light.png) | ![](docs/screenshots/procure-approvals-drawer-dark.png) |

| 表单页（行内录入明细表、贴底操作条） | 申请详情 · 审批人视角 |
| --- | --- |
| ![](docs/screenshots/procure-form-light.png) | ![](docs/screenshots/procure-application-detail-approver-light.png) |

| 数据报表（`rankBars` 排行、合计行） | 组织与成员 · 暗色（树当前节点反转块） |
| --- | --- |
| ![](docs/screenshots/procure-report-light.png) | ![](docs/screenshots/procure-org-dark.png) |

| 资产台账 | 供应商管理 · 暗色 |
| --- | --- |
| ![](docs/screenshots/procure-assets-light.png) | ![](docs/screenshots/procure-suppliers-dark.png) |

| 系统设置（页签各带页脚，危险区独立成卡） | 审批人工作台（计数型趋势整数刻度） |
| --- | --- |
| ![](docs/screenshots/procure-settings-light.png) | ![](docs/screenshots/procure-dashboard-approver-light.png) |

**全组件走查页**（种子自带的 `bridge/vue/KitchenSink.vue`，项目挂到 `#/kitchen`）把 Element Plus 全部组件的静息 / 选中 / 禁用 / 出错状态铺在一页，浮层与弹层逐个点开，亮 / 暗两种模式下对 600+ 个交互元素强制 `:hover` / `:focus-visible`，只报三类硬问题：状态切换新引入的黄色、悬停后对比掉档、不来自 token 的颜色。

| 亮色 | 暗色 |
| --- | --- |
| ![](docs/screenshots/kitchen-light.png) | ![](docs/screenshots/kitchen-dark.png) |

**遗留项目迁移**：一个暖灰旧规范的静态后台，复制种子后按角色对照改写，`status` 从 21% 到 100%、`guard` current——和新项目是同一套样子。

![](docs/screenshots/legacy-shop-migrated.png)

**手机档（390px，2.8.0 三端）**：侧栏离屏抽屉 + 汉堡，表格保留全列内部滚动，浮层贴底全宽，触控命中 44。

| 工作台 · 手机 | 采购申请 · 手机 |
| --- | --- |
| ![](docs/screenshots/procure-dashboard-mobile.png) | ![](docs/screenshots/procure-applications-mobile.png) |

**范围根（2.10.0，只覆盖部分板块）**：轻采里新增一个「未接入」的旧报表板块——同一个 SPA，上面是 Citrine 的供应商页，下面的旧报表保持 Element 默认蓝与旧布局，一个字节不受影响。

![](docs/screenshots/procure-scope-root.png)

**React + shadcn/ui 实验室**（[`testbed/shadcn-lab/`](testbed/shadcn-lab/)）：第二条消费路径的渲染验证——按 shadcn new-york 源码手写 21 个组件接种子的 `bridge/shadcn-globals.css`，页面骨架直接复用与组件库无关的 `recipes.css`，配方组件用 `bridge/react/`。全组件走查揪出 8 处需要组件级接管的地方（Tailwind 根字号与 rem 刻度冲突、提示框黄底、遮罩写死黑色、骨架 / 进度轨道、表头与 hover、标签页浮块、勾选命中区、焦点双环），全部修在桥接里；同一套验收工具跑通（页面 × 亮暗、80 个交互元素走查、窄屏、焦点），见 [FINDINGS.md](testbed/shadcn-lab/FINDINGS.md)。

| 组件走查 · 亮色（`templates/KitchenSink.tsx`） | 组件走查 · 暗色 |
| --- | --- |
| ![](docs/screenshots/shadcn-kitchen-light.png) | ![](docs/screenshots/shadcn-kitchen-dark.png) |

## 验收基线

每次改 token 或桥接都复跑（详见 `DESIGN.md`「验收基线」；工具在仓库级 `tools/`，各实测项目在 `app/` 目录 `npm run accept` 一键执行，只需 Node ≥ 22 与 Chrome）：

- 对比度：正文 ≥ 4.5:1，大字与图标 ≥ 3:1，连底色一起算；已批准的品牌例外逐条列出（三对状态色、危险按钮白字、占位符），扫描单列统计而不算失败。
- 可访问名称、无重复 id、图标控件命中区 ≥ 24px、任何模式无横向溢出与截断。
- 键盘：Tab 遍历每个可聚焦元素都有可见焦点环。
- 窄屏 1366px：侧栏默认折叠、筛选栏动作区整体换行。
- 构建一致性：`validate-system / guard / status` 三绿；预览 E 与 S 逐像素一致。
- 全组件走查：hover / focus 不新引入黄色、不掉对比、外来颜色为 0。

当前状态（2.5.0）：黄金后台 80 个页面状态 + 轻采 94 个 + shadcn 实验室 10 个 × 亮 / 暗，0 未批准项；Element 与 shadcn 两个走查页两模式 0 状态问题；三个项目 `guard` current。

## 版本策略

patch 只改描述、文档，以及让组件库遵守既有规则的桥接修正；minor 新增 token 或改 token 值（视觉会变、名字不变，条目必须写清肉眼可见的影响）；major 才改名或删除 token，并附兼容 shim。每一条规则的来历都在 [CHANGELOG](seeds/brand-yellow-e/CHANGELOG.md) 与 [FINDINGS](testbed/golden-admin/FINDINGS.md) 里可追溯。

## 已知边界

- shadcn/ui 桥接已在 React 实验项目渲染验证并跑全组件走查（21 个组件、80 个交互元素）；未覆盖的 shadcn 组件（Sheet、Command、Calendar、DataTable、Sonner 等）接入时先按 DESIGN「组件库对照」类推，再跑走查。
- 三端（桌面 / 窄屏 / 手机）已覆盖：断点 token + recipes / 桥接的手机形态 + `check-narrow` 多档验收（见 DESIGN「三端」）。手机目标是**可用**（导航抽屉、表格内部滚动、浮层贴底全宽、触控命中 44），不做底部 Tab 导航与列表卡片化——真实移动端需求出现时再作为配方提案。
- 走查页未铺 Tour、Watermark、Affix、Backtop、InfiniteScroll、TableV2 等依赖滚动或运行时的组件。
- 两个 npm 包（`@wycm9527/citrine`、`@wycm9527/citrine-tools`）已发布到 npmjs.org，并随每个 Release 附带 tgz；仓库内实测项目用 `file:` 链接消费种子本身。非 Node 项目走纯 CSS 渠道（Release 附件 `citrine-css-<版本>.tgz` 或 `ds.mjs export`），不依赖 npm。
- Figma 变量尚未与 token 同步。治理工具的四个已知缺陷（尺寸匹配不看属性、注释里的值被计数、`settle --apply` 只写豁免、guard / status 分工不清）已在 [WYCM9527/skills](https://github.com/WYCM9527/skills) 的 `design-system-steward` 0.6.0 修正，本仓库默认克隆的就是它。

## 方法

Citrine 不是一次性画出来的：每一条规则都来自实测项目里的一次具体反馈——发现、拍板、改到 token / 桥接 / 配方层（而不是页面层）、复跑验收、写进 CHANGELOG。测试项目存在的唯一目的是打磨这套通用系统。
