# Design-System

存放公司级设计系统。每个设计系统一个目录，各自带种子（tokens + 桥接 + 身份文件 `design-system.json`）、预览、实测项目与变更史。两个配套工具：**design-system-adopter**（本仓库根，把设计系统接进项目并跟版本，任何带身份文件的系统通用）与 **design-system-steward**（[WYCM9527/skills](https://github.com/WYCM9527/skills)，项目内治理：构建 / Guard / 存量迁移）。

| 设计系统 | 定位 | 版本 |
| --- | --- | --- |
| [**Citrine · 黄晶**](citrine/) | 中后台 · 品牌黄唯一焦点 + 冷灰骨架 · 亮 / 暗 · 三端（桌面 / 窄屏 / 手机） · Element Plus / shadcn/ui / ECharts 桥接 · 给编码 Agent 的配方与验收基线 | 2.11.1 |

[![Citrine](citrine/docs/screenshots/hero.png)](citrine/)

## 在你的项目里使用（vibe coding 友好）

一次安装：把 adopter skill 装进项目（Cursor 项目级；协作者随仓库共享），并把设计系统种子放进项目（npm 或直接下载文件夹，二选一）：

```bash
# 0) 浅克隆本仓库（私有仓库：本机 git 需有读权限）
git clone --depth 1 https://github.com/WYCM9527/Design-System.git /tmp/ds

# 1) 装 skill 到项目 .cursor/skills/（也可放 ~/.cursor/skills 或 ~/.codex/skills 全局用）
mkdir -p .cursor/skills && cp -R /tmp/ds/design-system-adopter .cursor/skills/

# 2) 拿种子（Citrine 为例，两条渠道等价）
npm i file:/tmp/ds/citrine/seeds/brand-yellow-e      # npm 渠道（发到 registry 后就是 npm i @wycm9527/citrine）
#   或：cp -R /tmp/ds/citrine/seeds/brand-yellow-e vendor/   放进项目任意位置，skill 的 detect 会认出来
#   非 Node 项目：到 Releases 下载 citrine-css-<版本>.tgz（纯 CSS，零工具）
npm i -D file:/tmp/ds/citrine/tools                   # 验收工具（发布后：npm i -D @wycm9527/citrine-tools）
```

完整上手教程（四件东西的关系、三个场景的提示词与拍板点、命令速查、常见问题）见 [docs/GUIDE.md](docs/GUIDE.md)；不想碰命令行的同学直接粘贴教程 [2b 节的「小白版」整段提示词](docs/GUIDE.md#2b-小白版整段交给-ai)，AI 会自己检查环境、下载、安装、自检。

然后对 Agent 说一句话即可，skill 会问「从 0 开始 / 更换现有规范 / 只更新」并走完全流程（接入 → 构建 → 接线 → 项目规则 → 验收）。三段可直接粘贴的提示词：

> **新项目**：用 Citrine 设计系统起一个 Vue 3 + Element Plus 的中后台，按 design-system-adopter 的「从 0 开始」把系统接好、验收跑绿之后再开始做页面。配方不够用时提提案，不要在页面上补样式。
>
> **旧项目换新**：把这个项目换成 Citrine 设计规范，按 design-system-adopter 的「更换现有规范」先做第一期换肤，给我看验收报告和二期收编清单再继续。
>
> **更新**：检查 Citrine 有没有新版本，按 design-system-adopter 的「更新」剧本先 dry-run 给我看差异（尤其是我本地改过的部分），确认后再升级并跑验收。

## 仓库开发（改设计系统本身）

```bash
git clone https://github.com/WYCM9527/Design-System.git && cd Design-System
git clone https://github.com/WYCM9527/skills.git skills          # steward，实测项目的构建 / Guard / 迁移用
```

实测项目（`citrine/testbed/*`）吃自己的狗食：`design-systems/citrine` 是指向种子的符号链接（零副本，改种子即生效），工作副本与 `.adopter.json` 和真实项目一致；仓库根 `.cursor/skills/design-system-adopter` 链接到本仓库的 skill，打开仓库即可用。版本 tag 只打 `<id>-vX.Y.Z`（如 `citrine-v2.7.0`）。
