# Morganite 玫瑰金 Design System

**中后台 · Ant Design Pro v6 底座 · 玫瑰金 #B98D44 金底白字 + antd 纯灰骨架 · 亮 / 暗 · Element Plus / shadcn/ui / ECharts 桥接**

版本 **0.1.0** · Core 342 个 token · dark 64 条 delta · 以 Ant Design Pro v6 为视觉底座，由 [web-to-design-system](https://github.com/WYCM9527/skills/tree/main/web-to-design-system) 从 [Pro 演示站](https://preview.pro.ant.design/dashboard/analysis)的工作台、查询表格、基础表单、新建弹窗与详情抽屉实测提炼（2026-09-28），品牌色按用户决定换成玫瑰金 `#B98D44`（初定 `#AE8A50`，2026-10-09 提高饱和度与明度） · 变更见 [CHANGELOG](seeds/morganite/CHANGELOG.md)

一句话：保留 Ant Design 的交互结构、密度与纯灰骨架，把品牌色换成玫瑰金——金底放白字（主按钮、侧栏当前项；暗色侧栏当前项是金色暗底 + 亮金字），链接 / 选中 / 焦点取同色系深一档；输入框为填充式（Pro v6 原样）。圆角、0.6px 描边、卡片标题、图表配色（只用金 + 灰 + 绿、绿涨红跌）按一张预期预览图调整过；卡片不投影，只留一条很浅的边线。

---

## 目录

```text
morganite/
├── README.md                    # 本文件：系统概览、状态、接入入口
├── previews/rose-gold-admin/    # 效果预览：8 个页面合在 index.html 里按 #/路由 跳转，只引用种子的 dist 与配方（?theme=dark 看暗色）
├── testbed/element-lab/         # 实测项目：Vue 3 + Element Plus 按 adopter 接入种子，走查页 + 业务页；问题记录在 FINDINGS.md
└── seeds/morganite/             # 分发单元：design-system/（token · DESIGN · AUDIT · themes）· bridge/ · templates/ · design-system.json
```

以后可以像 Citrine 一样加 `tools/`（验收工具）；目前是一套 token + 规则 + 桥接，加一组效果预览页和一个 Element Plus 实测项目。

## 状态

- 来源与证据：`seeds/morganite/design-system/AUDIT.md`——实测 70 个角色、用户确认 108 个（含 2026-10-09 按组确认的原推断值 56 个），另有用户决定表与对比度例外。
- 规则：`seeds/morganite/design-system/DESIGN.md`（速查、视觉语言、组件配方、验收基线已写完）。
- 预览：`seeds/morganite/design-system/preview/index.html`（工作台 / 表单 / 抽屉 × 亮暗，与来源站首屏对照）、`token-board.html`、对比度报告 `contrast.md`；效果预览 `previews/rose-gold-admin/index.html`：8 个页面合在一个文件里，按路由跳转——工作台 `#/dashboard`、交易记录 `#/transactions`、新建交易 `#/transactions/new`、交易详情 `#/transactions/detail`、系统设置 `#/settings`、组件走查 `#/kitchen`、登录 `#/login`、空状态 `#/empty/<模块>`；侧栏、顶栏、路由由 `shell.js` 提供，浏览器前进 / 后退可用，亮 / 暗选择跨页保留；原来的分页文件保留为跳转页。
- 桥接：从 Citrine 2.12.0 拷入 Element Plus / shadcn / 页面配方 / ECharts 桥接当起点，引用的缺失变量已全部补 token（22 个，外加 ECharts 顺序色 5 个与提示气泡 1 个，见 AUDIT「桥接缺口」）；Element Plus 桥接已在 `testbed/element-lab` 用 Element Plus 2.14 亮 / 暗走查过（见其 FINDINGS），shadcn 桥接还没实测。
- 待办：重拍种子预览截图 → `publish-check.mjs` 通过 → 打 tag（推断值已全部确认）。

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
