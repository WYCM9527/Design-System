# 实测项目三 · 轻采（企业采购与资产后台）

Citrine 的**接入试点**：拿到一份与黄金后台无关的 PRD（[PRD.md](PRD.md)，12 页、3 类角色、单级审批），只靠仓库文档（README 快速开始、种子 README、`DESIGN.md`、配方层）从零把项目做出来，验证"第二个项目能否不看第一个项目的源码就落地"。做不下去、只能猜的地方，就是设计系统的缺口。

## 结构

```text
light-procure/
├── PRD.md          # 用户提供的产品需求（V1.0）
├── FINDINGS.md     # 本次试点的发现：每条对应一次系统级修正或一条待办
├── notes/          # 四组页面开发时各自记录的「只能猜的地方 / 缺口 / 组件冲突」原始笔记
└── app/            # Vue 3 + Element Plus + ECharts + IconPark；hash 路由；本地模拟数据（localStorage + IndexedDB 附件）
    ├── AGENTS.md           # 编码 Agent 的规则入口（项目接线）
    ├── accept.config.mjs   # 验收清单（citrine/tools 读取）
    ├── design-system/      # 种子副本 + dist
    └── src/
        ├── data/           # constants / seed（36 张申请、24 件资产、8 家供应商、12 名成员）/ db（持久化 + 演示时钟）/ api（全部业务）/ session / format / files / guard
        ├── layouts/        # AppLayout：分组侧栏、面包屑、通知面板、主题、身份切换、测试工具
        ├── pages/          # P01–P12 + 403 / 404
        └── styles/         # globals.css 入口；bridge/ 为种子 bridge 的同步副本（含 recipes.css 与 vue/ 配方组件）
```

## 运行

```bash
cd app && npm ci && npm run build          # design-system/dist 已随仓库提供；改 token 后用 steward 的 build-tokens 重建
python3 -m http.server 4174 --directory dist  # 或 npm run dev
```

直达参数（放在 `#` 之前）：`?role=admin|approver|applicant`（许岚 / 陈予 / 林晓）或 `?user=u05`；`?theme=dark`；`?state=loading|error|empty|invalid|missing`；页面自己的 `?tab=`、`?drawer=`、`?edit=`、`?assign=`、`?dialog=`。

演示身份与测试工具在顶栏右侧的用户菜单里：切换启用成员、「下一次列表加载失败」「下一次提交失败」。「恢复演示数据」在系统设置底部（管理员）。

## 验收

`npm run accept`：构建 → 页面扫描（`accept.config.mjs` 登记的全部状态 × 亮 / 暗）→ 1280px 窄屏 → Tab 焦点。全组件走查只在黄金后台做，这里复用结论。
