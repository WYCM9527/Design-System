# Citrine 种子：品牌黄 #F9CF00 · 浅色侧栏（方案 E）

> 种子目录代号仍是 `brand-yellow-e`（脚本与文档中的路径不变）；系统名称 Citrine（黄晶）见仓库根 README。

版本 2.11.6 · 公司级中后台设计规范（单品牌线）· 纯数据包：本目录即分发单元（npm 包 **`@wycm9527/citrine`**，或整个文件夹直接下载），身份文件 `design-system.json`，接入 / 更新由 [design-system-adopter](../../../design-system-adopter/) skill 驱动 · 变更见 [CHANGELOG.md](CHANGELOG.md)

一套已通过 `design-system-steward` `validate-system` / `build-tokens` / `guard` 的 DTCG 设计系统起点。复制进任何项目就是 Core + dark Theme；视觉效果见 `../../previews/yellow-admin/`：`admin.html` 是工作台，`stress.html` 是登录、列表、表单、详情、反馈、折叠侧栏六类页面的压力测试（方案 S 全部由构建产物驱动）。

它不只是一套颜色：字体、字号阶梯、控件高度、布局尺寸、间距、圆角、线宽、阴影（拆分式）、动效、透明度、层级、浮层、图表调色板都已纳管。预览页的方案 S 没有一行手写样式值，全部来自这套种子的构建产物，并与手写的方案 E 逐像素一致。文字 / 底色配对在亮暗两个 Theme 下通过 WCAG AA，已批准的例外（三个状态色的品牌值、占位符、装饰性边线）逐条列在 `DESIGN.md` 的「验收基线」。已按国内中后台环境修正：微软雅黑显式入栈、中文字号下限 12px、字重三档、密度只有舒适一档。

## 里面有什么

```text
design-system/
├── DESIGN.md                       # 设计意图与规则（视觉语言、布局、组件、无障碍），不含数值
├── tokens/primitives.tokens.json   # 值：唯一品牌黄 brand.500（无延伸色）、冷灰、同族暗色深底、状态色（用户定版的绿 / 橙 / 红与青）、图表用青/紫、遮罩与阴影色；字体族/字号/字重/行高/字距；
│                                   #     spacing（含 6/10/14 半步）、radius、size、border.width、shadow 偏移/模糊、duration、easing、opacity、z
├── tokens/semantic.tokens.json     # 用途：color.action(primary/danger/secondary-hover)、text(含 placeholder/inverse)、bg(含 elevated/overlay/inverse/selected-hover)、
│                                   #     border(含 input/focus)、status、chart.*；text.*、control.height.*、icon/avatar.size.*、layout.*、border.width.*、
│                                   #     elevation.card/popover/modal.*、motion.*、opacity.*、layer.*、focus.ring.width、space.*
├── themes/dark/                    # 相对 Core 的 70 条 delta（颜色、浮层、阴影色、图表、骨架/只读、图标）+ THEME.md；激活方式 :root.dark（唯一的 Theme）
├── theme-map.json                  # defaultTheme: light，activation: class；登记 dark
├── scope-map.json                  # 空；局部规范在目标项目里按证据登记
├── style-dictionary.config.mjs
└── dist/                           # 空，在目标项目里构建
bridge/shadcn.css                   # shadcn/ui + Tailwind v4 桥接本体（可直接从包 @import）：契约变量、@theme inline（字体 / 字号 / 阴影 / 动效）、@layer base 边线色，以及按 data-slot 的组件级接管（控件三档高度、命中区、焦点环、提示框、遮罩、骨架 / 进度、表格、标签页、菜单项）；在 React 实验项目渲染验证
bridge/shadcn-globals.css           # 复制式接入用的 globals.css 模板：Tailwind → dist → shadcn.css → recipes.css 四行 import
bridge/element-plus.css             # Element Plus 桥接：--el-* 全部指向 token；按 Element 2.14 全部组件走查逐条接管主色 / 焦点 / 写死色表与写死高度，与实测项目 #/kitchen 走查页配套
bridge/echarts.js                   # ECharts 桥接：运行时读 token 生成主题（轴 / 网格 / 图例 / 提示框 / 折线 / 柱 / 饼默认形态）与趋势折线、面积渐变配方；亮暗切换后重注册
bridge/iconpark.css                 # IconPark 图标桥接：尺寸六档、角色色、小图标粗描边（预览页直接引用这份）
bridge/iconpark.config.ts           # IconPark 全局配置片段 + 激活态 / two-tone 的颜色数组（React / Vue 3 / @icon-park/svg 三种接法）
bridge/recipes.css                  # 配方层：DESIGN「页面骨架 / 组件配方」的可复制实现——壳层、页头、卡片区块、链接四层、状态胶囊、筛选栏 / 条件标签 / 批量条 / 分页、表单页、结果页、空态 / 加载失败、图表容器、统计卡网格 / 状态条、打印；与组件库无关，只引用 token
bridge/echarts.d.ts                 # echarts.js 的类型声明（TypeScript / React 项目）
bridge/react/                       # 配方组件（React + shadcn/ui）：StatCard / EChart / TrendChart / TableSkeleton / ConfirmBar + useInlineConfirm，与 vue/ 同形，样式共用 recipes.css
bridge/vue/                         # 配方组件（Vue 3 + Element Plus）：StatCard（统计卡，含 hint 口径说明）、EChart（图表容器，追踪 option 里的响应式数据，亮暗切换重建）、TrendChart（趋势折线，计数型自动整数刻度）、TableSkeleton（表格骨架）、ConfirmBar + inlineConfirm.js（浮层内原位确认）、confirm.js（页面级确认弹窗，关闭后焦点回到触发元素）
design-system.json                  # 身份文件：id / 版本 / upstream（仓库 · 子路径 · tag 前缀 · npm 包名）/ 两个栈的入口与模板指针 / 验收工具 / 迁移对照表 / owned 清单——adopter skill 靠它识别与更新
templates/                          # 接入模板：entry-element.css / entry-shadcn.css（样式入口片段）、notes-*.md（各栈接线要点，AGENTS 模板的填充物）、AGENTS.md（项目规则模板）、accept.config.mjs（验收清单模板）
migration/roles.json                # 旧规范 → 新 token 的角色对照（机器可读版；settle 起草决策文件用），与 README 迁移表由 scripts/check-roles.mjs 保持一致
package.json                        # 包定义：exports 暴露 bridge/*、echarts、iconpark.config、vue/*、react/*；peer 依赖全部可选；无 bin——机制代码在 adopter skill 里
```

Core 共 321 个 token，构建后 `dist/tokens.css` 的变量名就是 `--color-action-primary`、`--text-body-size`、`--control-height-md`、`--layout-form-label-width`、`--elevation-card-color` 这类形态；`dist/index.css` 把 Core 与两个 Theme 合成一个文件。

## 用法

分发单元就是本目录（`design-system/` + `bridge/` + 身份文件 `design-system.json` + 模板），三条渠道：npm 包 `@wycm9527/citrine`；把整个文件夹下载 / 复制到目标项目的 `design-systems/citrine/`（前两条等价）；**纯 CSS**——非 Node 项目（Flask / Django / PHP 模板）用 `ds.mjs export --to <static 目录>` 得到 `index.css` + `recipes.css`（+ 可选桥接），运行时零 Node，见身份文件 `export` 字段。接入、识别与更新由 **design-system-adopter** skill 驱动（安装见仓库根 README），它读 `design-system.json`，与具体设计系统无关：

```bash
# 装好 adopter skill 之后，对 Agent 说「用 Citrine 起一个后台」即可；等价的手动命令：
node .cursor/skills/design-system-adopter/scripts/ds.mjs init --system citrine --stack element-plus   # 或 --stack shadcn
# init 做的事：把种子落成只读快照 design-systems/citrine/（npm 装过就从 node_modules 拷）→ 生成工作副本 design-system/
# → 写 .adopter.json 清单 → 打印该栈的样式入口与接线步骤；然后 build-tokens → guard 应为 current
```

两层的角色：

- **`design-system/`（工作副本）**——steward 在项目内治理它（Guard、Scope、豁免、局部 token）；从快照生成，允许本地修改，升级时三方合并。
- **`design-systems/citrine/`（上游快照，只读）**——更新的比较基线，hash 校验，改了会被 `status` 报警；npm 只是下载渠道，快照始终存在。
- **`bridge/`（桥接、配方、配方组件）直接 import**——npm 装的从 `@wycm9527/citrine/bridge/*`，文件夹方式从快照相对路径；项目里不放第三份副本。

样式入口（Element Plus；shadcn 版见 `templates/entry-shadcn.css`）：

```css
@import "element-plus/dist/index.css";
@import "../../design-system/dist/index.css";
@import "@wycm9527/citrine/bridge/element-plus.css";   /* 逐组件桥接；不要再引 Element 的 dark css-vars */
@import "@wycm9527/citrine/bridge/iconpark.css";
@import "@wycm9527/citrine/bridge/recipes.css";        /* 页面骨架公共类 */
@import "./app.css";                                    /* 项目自己的补充，只引用 token */
```

配方组件与图表：`import StatCard from '@wycm9527/citrine/vue/StatCard.vue'`、`import { StatCard } from '@wycm9527/citrine/react/StatCard'`、`import { registerTheme, trendLine, rankBars } from '@wycm9527/citrine/echarts'`、`import { iconParkDefaults } from '@wycm9527/citrine/iconpark.config'`。包里是 `.vue` / `.tsx` 源码，Vite 配 `optimizeDeps.exclude: ['@wycm9527/citrine']` 交给框架插件编译（仓库内三个实测项目用 `file:` 链接消费同一份源码，另加 `resolve.preserveSymlinks: true`；发布后的真实安装不需要）。

项目规则 `AGENTS.md` 由 adopter 用 `templates/AGENTS.md` + 该栈的 `templates/notes-*.md` 生成（展示全文、确认后写入，已有文件只追加不覆盖）。页面只写业务——页头 / 筛选栏 / 状态胶囊 / 操作胶囊 / 表单页 / 空态 / 统计卡 / 原位确认条都是现成配方；存量硬编码用 steward 的 `migrate` 分层统一；验收 `citrine-accept all`（见 `../../tools/README.md`）。

### 升级

```bash
node .cursor/skills/design-system-adopter/scripts/ds.mjs status     # 快照版本 vs 上游最新 tag；快照是否被改动；工作副本哪些文件动过
node .cursor/skills/design-system-adopter/scripts/ds.mjs upgrade --dry-run   # 预览三方合并结果
node .cursor/skills/design-system-adopter/scripts/ds.mjs upgrade    # 按 citrine-vX.Y.Z tag 拉上游（npm 装的从 node_modules）：
#   上游未变→不动；本地未改→直接替换；两边都改→ tokens / scope-map / theme-map 键级自动合并（同键冲突才问），
#   DESIGN.md 等 markdown 文件级选择（保留本地 / 取上游 / 写冲突标记）；然后 build-tokens → guard → citrine-accept all
```

版本策略：描述 / 文档 / 桥接修正是 patch，新增或修改 token、新产物是 minor，重命名 / 删除是 major——minor 升级页面像素会变，属预期，看 CHANGELOG 决定是否需要页面配合。仓库只打 `citrine-vX.Y.Z` 一种 tag。

完整的 Vue 3 + Element Plus 接入范例见 `../../testbed/golden-admin/`（18 页）与 `../../testbed/light-procure/`（试点：12 页从零按文档接入）；React + shadcn/ui 见 `../../testbed/shadcn-lab/`。

## 这套颜色的硬规则（写进了 token 描述）

1. 黄底永远深字：`#F9CF00` 上白字只有 1.5:1，`color.text.on-primary` 是近黑（≈ 12:1）。
2. 白底上没有黄色文字，品牌黄没有延伸色：不做浅调、深金、半透明洗色（显脏）。层次靠冷灰与近黑，黄只以纯色小面积出现；hover 一律不用黄；数据卡不做大面积黄底，高亮只用左描边点缀。
3. warning 是橙不是黄——与品牌黄靠色相区分；info 是青不是蓝，蓝只做图表分类色。状态色、图表色以公司调色板为色相参考，具体值按对比度与冷暖调校。
4. 状态色是文字色，不是填充色：亮色文字色的目标是浅底上 ≥ 4.5:1，success / warning / error 三对是用户拍板的品牌例外（见 DESIGN「验收基线」）；危险按钮填充随 error 的 700，hover / active 从它按 OKLCH 降明度推导。
5. 弱化文字最浅到 neutral.500（白底 5.2:1、neutral.100 上 4.7:1）；neutral.400 只允许出现在占位符（`color.text.placeholder`）上，且占位符不能当筛选栏的默认值。
6. 危险分两个 token：填充 `color.action.danger`（亮暗深红），文字 `color.text.danger`（暗色下换亮红）。

## 四项公司级品牌决定（2026-09-08）

- 单品牌线：这套就是公司中后台的唯一规范，不做多品牌拆分。
- 链接无色系：`color.text.link` 是中性深灰。内容型链接（订单号、名称）靠常态下划线 + 斜体识别；操作链接（编辑 / 详情 / 改派等动词）是同色胶囊描边（`control.height.xs` 24 高、13px、400 字重，与状态胶囊同一轻重）、不斜体，hover 换底色；导览链接（查看全部）是文字 + 右箭头图标；标题型链接近黑 + 500。中文假斜体可读性略降，内容型链接文字宜短。
- 财务涨跌 = 涨绿跌红：`color.data.increase / decrease`，与 A 股惯例相反；改约定只改这两个别名。
- 密度只有舒适一档：不提供紧凑 Theme（2.0.0 起移除）。

已知且有意保留的两处：占位符 2.5:1（所以占位符不能是字段唯一的标签）；卡片 / 输入框边线 1.3–1.5:1（与 Tailwind、AntD、shadcn 默认值同一水平）。

## 结构层的几条约定

- 按钮、输入框、搜索框共用 `control.height.md`；小号按钮与分页项用 `control.height.sm`。
- 页面级留白用 `space.gutter / stack / inline` 三个语义间距；控件内部用 `spacing.*` 阶梯，6 / 10 / 14 三个半步只在控件内部出现。
- 线宽四档各有用途（普通边线 / 小控件边线 / 选中下划线与焦点外框 / 侧栏指示条），焦点环粗细单独是 `focus.ring.width`。
- 阴影写法固定：`box-shadow: 0 var(--elevation-card-y) var(--elevation-card-blur) var(--elevation-card-color)`，三层 card / popover / modal；暗色下卡片阴影色透明、浮层换黑色半透明。
- 浮层三件：`bg.elevated`（暗色比 surface 亮一档）、`bg.overlay`、`bg.inverse` + `text.inverse`。组件与 token 的完整对照见 `design-system/DESIGN.md` 的「组件配方」。
- 字号是 8 档离散阶梯（12～32px），`text.body.size` 14px 是根字号；中文不低于 12px，不在阶梯外取值。字重 400 / 500 / 600 / 700：标签类文字（按钮、表头、表单标签）用 500；徽标 / 状态胶囊 / 操作胶囊 400（浅底或描边已提供识别）；侧栏菜单项与分段选择器默认 400、选中 500（反转块组件不叠 600），雅黑上退回常规、600 等于加粗。不要 `-webkit-font-smoothing: antialiased`，Mac 上会把中文削细一档。
- 横向表单标签列宽 `layout.form.label-width`（112px，容纳 6 个汉字 + 必填星号）；表格单元格内边距 `table.cell.padding-y / -x`；侧栏折叠宽 `layout.sidebar.collapsed-width`；图标六档 `icon.size.xs…2xl`；页面级宽度 `layout.form.max-width / modal.width.sm·md / drawer.width / auth.card-width`。
- 黄色表达主操作、不表达选中：分段选择、视图 / 状态切换、侧栏当前项都用深黑反转块 `action.selected` + `text.on-selected`。表格选中行 `bg.selected-subtle` 与筹码、批量条的 `bg.selected` 都是冷灰——选中态里没有黄色。大面积品牌黄只允许出现在登录页 `bg.brand`；白底黄色文字只有 `text.brand` 一个角色且仅限 ≥ 20px。
- 图标库是字节 IconPark：线性、圆头、描边 4、尺寸走 font-size；选中项图标不换风格（靛黑反转块 + 品牌色竖条表达选中）；需要面性外观时用 multi-color 而不是 filled（后者镂空写死白色）；颜色角色 `icon.default / muted / brand / two-tone`。

## 从旧规范迁移（按角色对照，不按色值找近似）

`migrate` 只自动替换「值相等且语义唯一」的项；旧规范如果是另一套灰、另一种黄的用法，几乎所有值都会进入待决清单（排练见 `../../testbed/legacy-shop/`）。这时按**角色**改，不要给旧色值找最接近的新灰：

| 旧规范里的角色 | 改成 | 说明 |
| --- | --- | --- |
| 正文色 / 弱化色 / 次要色 | `color.text.primary` / `text.muted` / `text.secondary` | 暖灰 → 冷灰是整体换族，逐档对应 |
| 边线 / 页面底 / 分区底 / 卡片白 | `color.border.default` / `bg.page` / `bg.subtle` / `bg.surface` | 白色按角色拆：输入框 `bg.input`、浮层 `bg.elevated` |
| 品牌黄变量 | 按用途拆：按钮 `action.primary`、指示条 `brand.indicator`、登录大面积 `bg.brand`、图表 `chart.1` | 一个旧变量在新系统里是四个语义 |
| 深黄 hover、淡黄选中底、金色文字 | `action.primary-hover`（不再变深）、`bg.sidebar-selected` / `action.selected` 反转块、`text.brand`（仅 ≥ 20px） | 这些在新系统里没有对应物——延伸色不保留 |
| 状态三色（及浅底） | `status.success / warning / error`（+ `-bg`）；危险按钮填充 `action.danger` + `text.on-danger` | 状态色是文字色，填充只给危险按钮 |
| 彩色链接 | `text.link` + `text.link.decoration / style` | 链接无色系，靠下划线 + 斜体识别 |
| 1px 边线、6px 圆角、14px 字号 | `border.width.default`（发丝线）、按容器层级取 `radius.md / lg`、`text.body.size` | 尺寸按角色进阶梯，不逐像素对应 |
| HTML 内联样式 | 抽成 class 再引用 token | `guard` 会把内联字面量算作 Drift |

流程：项目先在 git 仓库里提交一次 → adopter `init`（旧 `design-system/` 会先改名 `design-system.legacy/` 当证据）并 `build-tokens` → steward `audit` → 有旧变量才 `migrate --phase adopt`（桥接为新 token 的别名）→ `replace`（自动只做无歧义项，`--apply` 生成 `MIGRATION.md`）→ `settle`（adopter 用 `migration/roles.json` 按上表起草决策文件，确认后 `--apply`）→ 豁免登记 → `guard` / `status` 两绿。上表的机器可读版在 `migration/roles.json`。

## 什么不进 Token（在目标项目用 exemptions.json 登记）

组件内部几何不是规范：对勾的位置与线宽、开关滑块的尺寸与位移、状态圆点直径、图例色块、演示图表的宽高。这些值在目标项目里按 skill 的「要么收编、要么正式豁免」原则写进 `design-system/exemptions.json` 并写明理由，不匿名留在 CSS 里。预览页对应的 37 条豁免示例见 `../../previews/yellow-admin/exemptions.example.json`；豁免是项目绑定的，所以不放在种子里。

`shadow` 复合类型不在当前 DTCG CSS Profile 内，所以阴影拆成颜色 + 偏移 + 模糊三个基础类型的 token（见 `elevation.*`）；只有开关滑块那一条 2px 投影仍是组件几何，走豁免。

## 改品牌色怎么办

只改 `color.brand.500` 一个值即可——它没有任何推导出的延伸色。但要重新核对三件事：黄底文字 `text.on-primary` 的对比度、two-tone 插图黑描边 + 新色填充是否成立、图表顺序色的封顶色是否仍然从灰阶里跳得出来。结构层 token 与品牌色无关，换色时不用动。
