# 测试项目二：老商城后台（遗留项目迁移排练）

一个只有三张样式表的静态"遗留后台"：2024 版旧规范——自定义变量（`--brand`、`--text`、`--border`…）+ 各处硬编码，暖灰系（stone）、淡黄选中底、深黄 hover、琥珀色链接。用它排练 `design-system-steward` 的**存量统一路径**：复制种子 → `audit` → `migrate` 三阶段 → 手工按角色映射 → `guard` / `status`。与 `golden-admin`（新项目 + 组件库）互补，覆盖 skill 承诺的「同事手里有旧规范」和「一次性统一存量」两个场景。

## 排练记录（2026-09-10，种子 1.0.0-rc.34）

| 步骤 | 结果 |
| --- | --- |
| `cp -R seed/design-system` + `build-tokens` | valid，dist 生成 |
| `audit`（只读） | 扫 13 个文件：10 个旧变量定义、6 组重复颜色、8 组重复尺寸，`status: needs-decision` |
| `status`（迁移前） | adoption 21%，待决策 64，可自动替换 1，可桥接 0 |
| `migrate --phase adopt` | 0 处可自动桥接：`--brand` 值与 `brand.500` 相同但语义歧义（action.primary / brand.indicator / bg.brand / chart.1 都是它）；其余旧变量是暖灰旧值，与新冷灰无一相等 |
| `migrate --phase replace` | 只有 1 处无歧义（顶栏 56px → `layout.topbar.height`）；45 处待决：`#FFFFFF` 在多个 bg 语义间歧义，`14px` 同时匹配 `text.body.size` / `icon.size.sm` / `table.cell.padding-y`（匹配不看属性——skill 缺陷，已记） |
| `migrate --phase replace --apply` | 无 git 时**拒绝写入**并提示 `git init` 或 `--force`（正确）；建库提交后写入 1 处，生成 `design-system/MIGRATION.md`（对照表 + 回滚指引 + 待决清单） |
| `migrate --phase settle` | 5 组决策：26 语义歧义、7 无匹配旧值、5 只匹配到 primitive、15 未纳管字面量（1px 等）、2 个 HTML 内联样式 |
| 手工按角色映射（见下） | `guard: current`，`status: unified`，adoption 100%，`settle: settled` |
| 渲染目检 | 深黑反转侧栏选中、黄底深字主按钮、红底白字危险按钮、三对状态胶囊、发丝边线、冷灰底——与 golden-admin 同一套样子 |

## 结论

1. **旧规范与新规范不同族时，自动阶段几乎不出手**（56 个值只自动改了 1 个）。这是工具刻意保守的结果——它只替换"值相等且语义唯一"的项，不猜。迁移的主体工作是**按角色而不是按色值**重写：旧文字色 → `text.primary`，旧弱化色 → `text.muted`，旧边线 → `border.default`，而不是找一个"最接近的灰"。角色对照已写进种子 README「从旧规范迁移」。
2. 三类歧义是必然的，不是缺陷：同一 primitive 被多个语义共用（白、品牌黄）；只匹配到 primitive 而无语义（6px 圆角、16px 间距）；旧值在新系统里根本不存在（暖灰、淡黄、深黄、琥珀）。最后一类正是规范变化本身——淡黄选中底、深黄 hover、彩色链接在新系统里**没有对应物**，必须换成反转块、无色系 hover、无色系链接。
3. 尺寸匹配不看 CSS 属性（`font-size: 14px` 也给出 `icon.size.sm`）会放大待决清单；已作为 skill 缺陷记录，不在本仓库修。
4. 保留旧变量名做别名（`theme.css` 里 `--text: var(--color-text-primary)`）是最省力的过渡：没改到的老页面立刻拿到新值，新代码直接用 token。

## 目录

```text
src/styles/theme.css        # 旧变量名 → token 别名（迁移后）
src/styles/app.css          # 全部改为 token 引用
src/pages/orders.html       # 引入 design-system/dist/index.css，内联样式改为 class
design-system/              # 种子副本 + dist 构建产物 + MIGRATION.md（migrate --apply 生成）
```

复现：`npm i -D style-dictionary@5.5.2` 后按种子 README 的用法跑 `build-tokens` / `guard` / `status`；`migrate --apply` 需要项目在 git 仓库里。
