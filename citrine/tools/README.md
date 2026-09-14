# 验收工具

DESIGN.md「验收基线」的执行者，仓库级、对任意实测项目运行。全部基于无头 Chrome + 原生 CDP，只需要 **Node ≥ 22** 和本机的 Google Chrome（找不到时用环境变量 `CHROME` 指定可执行文件）；没有 npm 依赖。输出（截图、`report.json`）写到 `tools/out/<项目名>/`，已在 `.gitignore` 里。

## 项目怎么接

1. 在项目 `app/` 目录放一份 `accept.config.mjs`（见 `testbed/golden-admin/app/accept.config.mjs`、`testbed/light-procure/app/accept.config.mjs`）：

   ```js
   export const PAGES = [['dashboard', '#/'], ['orders-empty', '?state=empty#/orders'], …]   // 名字 → 「?演示参数#路由」
   export const DEFAULT_QUERY = { role: 'admin' }        // 每个页面缺省带的参数（直达某个身份）
   export const KITCHEN = '#/kitchen'                     // 全组件走查页；没有就 null，scan:components 会跳过
   export const NARROW = { width: 1366, pages: [['orders', '#/orders'], …] }
   export const FOCUS = { pages: { orders: '#/orders' }, steps: 80 }
   ```

   演示参数放在 `#` 之前，页面用 `location.search` 读（不要用路由 query）。
2. `package.json` 的脚本指向 `citrine/tools`（目标项目缺省是当前目录，也可 `--project <appDir>`）：

   ```json
   "scan:pages": "node ../../../tools/scan-pages.mjs",
   "check:narrow": "node ../../../tools/check-narrow.mjs",
   "check:focus": "node ../../../tools/check-focus.mjs",
   "accept": "npm run build && node ../../../tools/scan-pages.mjs --modes all && node ../../../tools/check-narrow.mjs && node ../../../tools/check-focus.mjs"
   ```

## 命令

在项目 `app/` 目录运行：

| 命令 | 检查什么 | 失败条件（退出码 1） |
| --- | --- | --- |
| `npm run accept` | 构建 + 项目登记的全部检查 | 任一项失败 |
| `npm run scan:pages -- [--modes all\|light,dark] [--only kitchen,apply-*] [--no-shots]` | `PAGES` 登记的全部页面状态 × 亮 / 暗两种模式：对比度（含底色合成）、可访问名称、命中区、横向溢出、nowrap 截断、重复 id、无 alt 图片；逐页截图 | 未批准的低对比、无名称、溢出、重复 id。已批准例外单列为 `approved`；截断与小命中区只提示 |
| `npm run scan:components -- [--modes all]` | `KITCHEN` 全组件页：对 600+ 个交互元素连同祖先链强制 `:hover` / `:focus-visible`，浮层与弹层逐个点开 | 状态切换新引入品牌黄、悬停后文字对比掉档、不来自 token 的颜色、浮层 / 弹层打不开 |
| `npm run check:narrow` | `NARROW.width`（黄金后台 1366、轻采 1280）：侧栏默认折叠、页面与内容区无横向溢出 | 任一页未折叠或溢出 |
| `npm run check:focus -- [--page orders,apply] [--steps 80]` | 真实 Tab 键遍历 `FOCUS.pages`，每个停靠元素都要有可见焦点环 | 出现 `NO RING` |
| `node ../../../tools/diff-previews.mjs` | 种子级：预览 E（手写 token）与 S（构建产物）逐像素比对（跳过顶部预览条，动画相位差 ≤ 0.6%）；与项目无关，黄金后台的 `accept` 顺带跑它 | 超阈值或高度不一致 |

## 新增页面时

1. 在项目的 `accept.config.mjs` 登记页面状态。
2. 用到新组件时，把它加进黄金后台的 `src/pages/KitchenSink.vue`（浮层加 `data-ks-open`，弹层加 `data-ks-modal`）——全组件走查只在黄金后台做一次，其他项目复用结论。
3. 跑 `npm run accept`，结果记进该项目的 `FINDINGS.md`。

## 判定口径来自哪里

阈值、已批准的例外（三对状态色、危险按钮白字、占位符）与"静息态允许出现黄色的六类元素"都写在 `design-system/DESIGN.md`「验收基线」；脚本里的常量是它的镜像（`lib/page-audit.js` 的 `APPROVED_FG`、`scan-components.mjs` 的 `APPROVED_FG` 与判黄阈值）。改了基线先改文档，再改这里。
