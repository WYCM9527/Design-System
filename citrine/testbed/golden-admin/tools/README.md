# 验收工具

DESIGN.md「验收基线」的执行者。全部基于无头 Chrome + 原生 CDP，只需要 **Node ≥ 22** 和本机的 Google Chrome（找不到时用环境变量 `CHROME` 指定可执行文件）；没有 npm 依赖。输出（截图、`report.json`）写到 `tools/out/`，已在 `.gitignore` 里。

在 `app/` 目录运行：

| 命令 | 检查什么 | 失败条件（退出码 1） |
| --- | --- | --- |
| `npm run accept` | 构建 + 下面全部 | 任一项失败 |
| `npm run scan:pages -- [--modes all\|light,dark] [--only kitchen,apply-*] [--no-shots]` | `lib/pages.mjs` 登记的全部页面状态 × 亮 / 暗两种模式：对比度（含底色合成）、可访问名称、命中区、横向溢出、nowrap 截断、重复 id、无 alt 图片；逐页截图 | 未批准的低对比、无名称、溢出、重复 id。已批准例外单列为 `approved`；截断与小命中区只提示 |
| `npm run scan:components -- [--modes all]` | `#/kitchen` 全组件页：对 600+ 个交互元素连同祖先链强制 `:hover` / `:focus-visible`，浮层与弹层逐个点开 | 状态切换新引入品牌黄、悬停后文字对比掉档、不来自 token 的颜色、浮层 / 弹层打不开 |
| `npm run check:narrow` | 1366px：侧栏默认折叠、页面与内容区无横向溢出 | 任一页未折叠或溢出 |
| `npm run check:focus -- [--page orders,apply] [--steps 80]` | 真实 Tab 键遍历，每个停靠元素都要有可见焦点环 | 出现 `NO RING` |
| `npm run diff:previews` | 预览 E（手写 token）与 S（构建产物）逐像素比对（跳过顶部预览条，动画相位差 ≤ 0.6%） | 超阈值或高度不一致 |

## 新增页面时

1. 在 `lib/pages.mjs` 登记页面状态（`名字 → ?演示参数#路由`）。演示参数放在 `#` 之前，页面用 `location.search` 读。
2. 用到新组件时，把它加进 `src/pages/KitchenSink.vue`（浮层加 `data-ks-open`，弹层加 `data-ks-modal`）。
3. 跑 `npm run accept`，结果记进 `../FINDINGS.md`。

## 判定口径来自哪里

阈值、已批准的例外（三对状态色、危险按钮白字、占位符）与"静息态允许出现黄色的六类元素"都写在 `design-system/DESIGN.md`「验收基线」；脚本里的常量是它的镜像（`lib/page-audit.js` 的 `APPROVED_FG`、`scan-components.mjs` 的 `APPROVED_FG` 与判黄阈值）。改了基线先改文档，再改这里。
