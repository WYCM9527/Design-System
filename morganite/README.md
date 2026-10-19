# Morganite 玫瑰金 Design System

**中后台 · Ant Design Pro v6 底座 · 玫瑰金 #B98D44 金底白字 + antd 纯灰骨架 · 亮 / 暗 · Element Plus / shadcn/ui / ECharts 桥接**

版本 **0.3.0** · Core 359 个 token · dark 66 条 delta · 以 Ant Design Pro v6 为视觉底座，由 [web-to-design-system](https://github.com/WYCM9527/skills/tree/main/web-to-design-system) 从 [Pro 演示站](https://preview.pro.ant.design/dashboard/analysis)的工作台、查询表格、基础表单、新建弹窗与详情抽屉实测提炼（2026-09-28），品牌色按用户决定换成玫瑰金 `#B98D44`（初定 `#AE8A50`，2026-10-09 提高饱和度与明度） · 变更见 [CHANGELOG](seeds/morganite/CHANGELOG.md)

一句话：保留 Ant Design 的交互结构、密度与纯灰骨架，把品牌色换成玫瑰金——金底放白字（主按钮、侧栏当前项；暗色侧栏当前项是金色暗底 + 亮金字），链接 / 选中 / 焦点取同色系深一档；输入框为填充式（Pro v6 原样）。圆角、0.6px 描边、卡片标题、图表配色（只用金 + 灰 + 绿、绿涨红跌）按一张预期预览图调整过；卡片不投影，只留一条很浅的边线。

---

## 以什么为准

预览有好几种，评判时按这个顺序：

1. **规范本身**：种子 `seeds/morganite/design-system/` 里的 token（`tokens/*.tokens.json`、`themes/*/tokens/`）与 `DESIGN.md`，用户的每项决定记在 `AUDIT.md`。任何预览、项目和它冲突，都以它为准。
2. **视觉基准**：效果预览 `previews/rose-gold-admin/`——页面与组件「应该长什么样」看它，用户的视觉决定都是对着它定的。它和规范冲突时改预览。
3. **落地验证**：实测项目 `testbed/element-lab`、`testbed/shadcn-lab` 与完整业务项目 `testbed/mall-ops`——检查真实组件库接入后是否与效果预览一致、验收（citrine-accept）是否全绿；它们不是标准，不一致就修桥接或配方。
4. **只做对照，不作评判**：种子自带的 `design-system/preview/`（壳层 / 表单 / 抽屉）用来和来源站 Ant Design Pro 比像不像；`token-board.html` 是 token 清单，看值不看页面。

注意：效果预览除了种子的 dist、基础桥接和配方，还带着自己的组件样式（`components.css`，按 DESIGN 配方表写的参考实现）和页面布局（`admin.css`），这些项目拿不到。项目用到预览里有、种子里没有的组件时，先提案把它移进配方，不在项目里照着预览另写一套——2026-10-10 shadcn 单据页走样就是这个原因，分页、类别标签、顶栏搜索已移进配方；2026-10-11 完整业务项目又查出十几个这样的页面形态（问候语、看板、设置行、横向表单、登录页等），0.1.4 全部移进配方，预览也改用配方。

## 目录

```text
morganite/
├── README.md                    # 本文件：系统概览、状态、接入入口
├── previews/rose-gold-admin/    # 效果预览（视觉基准）：8 个页面合在 index.html 里按 #/路由 跳转；引用种子的 dist、基础桥接与配方，另有预览自己的组件样式与页面布局（?theme=dark 看暗色）
├── testbed/element-lab/         # 实测项目：Vue 3 + Element Plus 按 adopter 接入种子，走查页 + 业务页；问题记录在 FINDINGS.md
├── testbed/shadcn-lab/          # 实测项目：React 19 + Tailwind v4 + shadcn/ui，骨架照 Citrine 的 shadcn 实验室；问题记录在 FINDINGS.md
├── testbed/mall-ops/            # 完整业务项目「拾光商城 · 运营后台」：Vue 3 + Element Plus，14 页 × 4 角色 × 50 个页面状态；产品设定 PRD.md，实测报告 FINDINGS.md
└── seeds/morganite/             # 分发单元：design-system/（token · DESIGN · AUDIT · themes）· bridge/ · templates/ · design-system.json
```

以后可以像 Citrine 一样加 `tools/`（验收工具）；目前是一套 token + 规则 + 桥接，加一组效果预览页、Element Plus 与 shadcn/ui 两个实测项目和一个完整业务项目。

## 状态

- 来源与证据：`seeds/morganite/design-system/AUDIT.md`——实测 70 个角色、用户确认 108 个（含 2026-10-09 按组确认的原推断值 56 个），另有用户决定表与对比度例外。
- 规则：`seeds/morganite/design-system/DESIGN.md`（速查、视觉语言、组件配方、验收基线已写完）。
- 预览：`seeds/morganite/design-system/preview/index.html`（工作台 / 表单 / 抽屉 × 亮暗，与来源站首屏对照）、`token-board.html`、对比度报告 `contrast.md`；效果预览 `previews/rose-gold-admin/index.html`：8 个页面合在一个文件里，按路由跳转——工作台 `#/dashboard`、交易记录 `#/transactions`、新建交易 `#/transactions/new`、交易详情 `#/transactions/detail`、系统设置 `#/settings`、组件走查 `#/kitchen`、登录 `#/login`、空状态 `#/empty/<模块>`；侧栏、顶栏、路由由 `shell.js` 提供，浏览器前进 / 后退可用，亮 / 暗选择跨页保留；原来的分页文件保留为跳转页。
- 桥接：从 Citrine 2.12.0 拷入 Element Plus / shadcn / 页面配方 / ECharts 桥接当起点，引用的缺失变量已全部补 token（22 个，外加 ECharts 顺序色 5 个与提示气泡 1 个，见 AUDIT「桥接缺口」）；两套组件库桥接都用真实组件走查过：Element Plus 在 `testbed/element-lab`，shadcn/ui 在 `testbed/shadcn-lab`（见各自 FINDINGS），citrine-accept 验收都全绿。完整业务项目 `testbed/mall-ops` 对照效果预览逐角色比对后，0.1.4 校正了 Element 桥接 30 余处、收进 14 个页面形态配方，项目层样式清零，验收全绿（见它的 FINDINGS）。
- 验收：沿用 Citrine 的 citrine-accept（清单模板 `seeds/morganite/templates/accept.config.mjs`）。对比度例外靠 `APPROVED_CONTRAST`；品牌金审计按身份文件 `design-system.json` 的 `accept.brand` 检查金色是否只出现在 DESIGN「验收基线」列出的位置（要 citrine-tools ≥ 1.3.0，仓库内已生效）。三个实测项目都在仓库 CI 的验收矩阵里，改了种子或桥接会自动跑完整验收。
- 待办：品牌金审计要等 citrine-tools 1.3.0 上 npm（随 Citrine 下次发版）才对仓库外的项目生效，在那之前装 npm 版的项目查不到金色用错位置。

## 接入

```bash
git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds
mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/
mkdir -p vendor && cp -R /tmp/ds/morganite/seeds/morganite vendor/morganite
node .cursor/skills/design-system-adopter/scripts/ds.mjs init --system morganite --stack css
```

然后 steward `validate-system → build-tokens → guard`，再对 Agent 说「用 Morganite 玫瑰金 起项目」。升级走 `ds.mjs status / upgrade`（按 tag `morganite-vX.Y.Z`）。

## 发版

改 `seeds/morganite/design-system.json` 与 `package.json` 版本、写 CHANGELOG、更新本文件与仓库根 README 的版本行，`node scripts/check-versions.mjs --system morganite` 通过后打 tag `morganite-vX.Y.Z` 推送，`release.yml` 自动建 Release。
