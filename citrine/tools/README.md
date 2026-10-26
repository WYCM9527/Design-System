# 验收工具

DESIGN.md「验收基线」的执行者，对任意项目运行。发布为 npm 包 **`@wycm9527/citrine-tools`**（命令 `citrine-accept`），仓库内的实测项目通过 `file:../../../tools` 消费同一份源码。全部基于无头 Chrome + 原生 CDP，只需要 **Node ≥ 22** 和本机的 Google Chrome（找不到时用环境变量 `CHROME` 指定可执行文件）；没有 npm 依赖。输出（截图、`report.json`）写到项目内 `.accept/`（加进 `.gitignore`；`--out <dir>` 或 `CITRINE_OUT` 可改）。

## 项目怎么接

1. 在项目目录放一份 `accept.config.mjs`（见 `testbed/golden-admin/app/accept.config.mjs`、`testbed/light-procure/app/accept.config.mjs`）：

   ```js
   export const PAGES = [['dashboard', '#/'], ['orders-empty', '?state=empty#/orders'], …]   // 名字 → 「?演示参数#路由」
   export const DEFAULT_QUERY = { role: 'admin' }        // 每个页面缺省带的参数（直达某个身份）
   export const KITCHEN = '#/kitchen'                     // 全组件走查页；没有就 null，scan:components 会跳过
   export const NARROW = { width: 1366, pages: [['orders', '#/orders'], …] }
   export const FOCUS = { pages: { orders: '#/orders' }, steps: 80 }   // inputBorder: true：输入类控件按边线变成 --color-border-focus 认焦点（设计系统规定输入框不加外环时打开）
   // 可选：本项目所用设计系统的已批准对比度例外（不是 Citrine 的系统需要；Citrine 的例外已内置，只对 Citrine 项目生效）
   export const APPROVED_CONTRAST = [{ fg: '#FFFFFF', bg: '#B98D44', why: '金底白字' }, { fg: 'rgba(0, 0, 0, 0.45)', why: '占位符' }, { fg: '#8A6530', minRatio: 4.2, why: '叠加悬停底' }]
   // 可选：本项目另外允许出现品牌色的位置（要有理由，如营销页 hero）；旧名 YELLOW_ALLOW 照认
   export const BRAND_ALLOW = ['.welcome-banner']
   ```

   演示参数放在 `#` 之前，页面用 `location.search` 读（不要用路由 query）。**服务端渲染项目**（Flask / Django 等，没有构建产物）用 `--url http://127.0.0.1:<port>` 直接扫运行中的服务器：页面清单写服务器路径（`['orders', '/admin/orders?state=empty']`），演示参数放 query；组件走查需要 `--tokens <导出的 CSS 目录>` 来认「来自 token 的颜色」。挂载点 `#app` 或 `#root` 都可以；组件走查页的浮层触发器带 `data-ks-open`（Element 的 `.el-popper` 与 Radix / shadcn 的 popper、`role=menu|listbox|tooltip` 都能识别），弹层带 `data-ks-modal`（`.el-overlay` 或 `role=dialog|alertdialog`）。探针能解析 `rgb()` 之外的 `oklab / oklch / color()` 计算值（Tailwind v4 的 `color-mix`）。
2. 装包并在 `package.json` 里接命令（目标项目缺省是当前目录，也可 `--project <appDir>`）：

   ```bash
   npm i -D @wycm9527/citrine-tools        # 仓库内实测项目用 "file:../../../tools"
   ```

   ```json
   "scan:pages": "citrine-accept pages",
   "scan:components": "citrine-accept components",
   "check:narrow": "citrine-accept narrow",
   "check:focus": "citrine-accept focus",
   "accept": "npm run build && citrine-accept all"
   ```

   `citrine-accept all` = pages → components → narrow → focus，每一步都跑完再汇总（前一步失败不挡后面的步骤），有失败时以第一个失败步骤的退出码退出；黄金后台再加 `--with-previews` 跑 E/S 像素对照。

## 命令

在项目目录运行（`npm run …` 或直接 `npx citrine-accept <步骤>`）：

| 命令 | 检查什么 | 失败条件（退出码 1） |
| --- | --- | --- |
| `npm run accept` | 构建 + 项目登记的全部检查（四步都跑完，末尾汇总各步结果） | 任一项失败 |
| `citrine-accept pages [--modes all\|light,dark] [--only kitchen,apply-*] [--no-shots]` | `PAGES` 登记的全部页面状态 × 亮 / 暗两种模式：对比度（含底色合成）、可访问名称、命中区、横向溢出、nowrap 截断、重复 id、无 alt 图片、**静息品牌色**（不在允许清单内的品牌色背景 / 边线 / 文字 / 填充，口径见下文「品牌色口径」）；审计前禁用过渡与动画，读的是状态终值；逐页截图 | 未批准的低对比、无名称、溢出、重复 id、允许清单外的品牌色、允许清单里的选择器写错。已批准例外单列为 `approved`；截断与小命中区只提示 |
| `citrine-accept components [--modes all]` | `KITCHEN` 全组件页：对 600+ 个交互元素连同祖先链强制 `:hover` / `:focus-visible`，浮层与弹层逐个点开 | 状态切换新引入品牌色、悬停后文字对比掉档、不来自 token 的颜色、浮层 / 弹层打不开 |
| `citrine-accept narrow` | `NARROW.width`（黄金后台 1366、轻采 1280）：侧栏默认折叠、页面与内容区无横向溢出 | 任一页未折叠或溢出 |
| `citrine-accept focus [--page orders,apply] [--steps 80]` | 真实 Tab 键遍历 `FOCUS.pages`，每个停靠元素都要有可见焦点环。透明、零尺寸或被裁掉的原生控件（`input` / `select` / `textarea`，如单选、勾选、开关、文件输入，输出里标 `(hidden)`）自身的浏览器外环不算，只认兄弟、父级、开关轨道、上传区上看得见的环 | 出现 `NO RING` |
| `citrine-accept previews [--previews <dir>]` | 种子级：预览 E（手写 token）与 S（构建产物）逐像素比对（跳过顶部预览条，动画相位差 ≤ 0.6%）；与项目无关，只有黄金后台的 `accept --with-previews` 跑它 | 超阈值或高度不一致 |

## 新增页面时

1. 在项目的 `accept.config.mjs` 登记页面状态。
2. 用到新组件时，把它加进黄金后台的 `src/pages/KitchenSink.vue`（浮层加 `data-ks-open`，弹层加 `data-ks-modal`）——全组件走查只在黄金后台做一次，其他项目复用结论。
3. 跑 `npm run accept`，结果记进该项目的 `FINDINGS.md`。

## 判定口径来自哪里

别的设计系统（如 Morganite）用 `APPROVED_CONTRAST` 登记自己的例外：`fg` 必填，`bg` 可选（不写表示这个前景色在任何底上都算批准，如占位符），`minRatio` 可选（只放行实测不低于它的情况，再低照样报）；颜色写十六进制或 `rgb()`，按通道 ±1 匹配。页面扫描与组件走查都认它，实现见 `lib/approved.mjs`。它应当是该系统 DESIGN / AUDIT 已登记例外的镜像。

Citrine 的内置例外只对 Citrine 项目生效：项目 `design-system/.adopter.json` 的 `system` 不是 `citrine` 时不带（别的系统的文字不该被 Citrine 的颜色放行），读不到清单的老项目照旧带上；`accept.config.mjs` 写 `export const CITRINE_APPROVED = true / false` 可显式指定。

组件走查的背景按祖先链由底向上逐层合成（与页面审计同一算法）：此前半透明叠半透明会被当成不透明，两层 4% 黑悬停底被算成纯黑，误报「悬停后对比掉档」。

`APPROVED_CONTRAST`、逐层合成与内置例外的开关都从 1.2.0 起；1.1.x 不认 `APPROVED_CONTRAST`，别的设计系统的项目要装 ≥ 1.2.0。

阈值、已批准的例外（三对状态色、危险按钮白字、占位符）与"静息态允许出现黄色的六类元素"都写在 `design-system/DESIGN.md`「验收基线」；脚本里的常量是它的镜像（`lib/approved.mjs` 的 Citrine 内置例外、`lib/brand.mjs` 的判黄范围、`lib/yellow-allow.mjs` 的允许清单）。改了基线先改文档，再改这里。

## 品牌色口径

页面扫描的「允许清单之外的品牌色」和组件走查的「状态切换新引入的品牌色」查的是同一种颜色，口径按项目所用的设计系统取（实现见 `lib/brand.mjs`，扫描开头会打印一行当前口径）：

1. 项目 `accept.config.mjs` 的 `BRAND`：逐字段覆盖下面两种来源；写 `BRAND = false` 关闭审计。
2. 设计系统身份文件 `design-system.json` 的 `accept.brand`（经项目 `design-system/.adopter.json` 的 `snapshot` 找到快照里的身份文件）。
3. 都没有时：Citrine 项目、读不到 `.adopter.json` 的老项目用内置的品牌黄（色相 40–64°、饱和度 0.55–1、明度 0.28–0.78）和 `lib/yellow-allow.mjs`；别的设计系统不审计（Citrine 的黄和选择器不适用），扫描开头会写明「未配置」。

`accept.brand` 的字段：

| 字段 | 含义 |
| --- | --- |
| `name` / `note` | 报告里的称呼（如「品牌金」）与允许位置的一句话概括 |
| `hue` / `saturation` / `lightness` | 判色范围，HSL，都写 `[最小, 最大]`；色相单位度，其余 0–1。透明度低于 0.15 的颜色不算 |
| `allow` | 静息态允许出现品牌色的位置：CSS 选择器，元素在其内即放行；数组，或按技术栈分组的对象 `{ "element-plus": [...], "recipes": [...] }` |
| `focusRing` | 焦点指示本身是品牌色时写 `true`：组件走查不把聚焦时出现在外环 / 环形阴影 / 边线上的品牌色算作泄漏 |
| `hoverAllow` | 悬停时允许新出现品牌色的元素（选择器，元素自身或祖先匹配即放行），如静息是正文色、悬停显出链接色的链接 |

项目追加的合法位置写在 `accept.config.mjs` 的 `BRAND_ALLOW`（旧名 `YELLOW_ALLOW` 照认），要有理由。品牌色口径、`BRAND_ALLOW` 与报告字段改名（`yellow` → `brand`，`hover-yellow` / `focus-yellow` → `hover-brand` / `focus-brand`）都从 1.3.0 起；1.2.x 只认 Citrine 的黄，别的设计系统的项目要装 ≥ 1.3.0 才查得到自己的品牌色。
