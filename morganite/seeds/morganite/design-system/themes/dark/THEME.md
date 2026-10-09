# Theme：dark

> Core Token 是确认的默认 Theme。本文件只记录当前 Theme 相对 Core 的意图、适用范围和运行时约束；具体值只写在本目录 `tokens/*.tokens.json`，不要复制 Core 或手改生成 CSS。

## 映射

- 默认 Theme：`light`
- 当前 Theme：`dark`
- 状态：`active`
- 激活方式：`:root.dark`
- 权威来源：`https://preview.pro.ant.design/dashboard/analysis（toggle-dark）`
- 运行时所有者：接入项目——在 `<html>` 上切换 `dark` 类；来源站 Ant Design Pro 通过设置抽屉切换，且设置只存在内存里。
- 设计理由：取证时手动打开 Pro 设置抽屉的「暗色风格（实验功能）」拿到另一模式；delta 64 条，页面底 / 表面 / 文字 / 边线 / 悬停来自实测，其余按 antd 暗色算法推断，品牌相关的按用户决定。

## 相对 Core 的设计意图

- delta 覆写 64 条，每条的来源写在 `tokens/semantic.tokens.json` 的 `$description` 里。下面这些「通常也随模式变化」的角色逐条确认过，**保持 Core 值**：`color.bg.overlay`（antd 暗色遮罩与亮色同值）、`color.text.inverse`（反色底在暗色换成深灰，白字不变）、`color.text.brand` / `color.border.current` / `color.icon.brand` / `color.chart.1`（品牌金在深底上对比更高）、`color.border.input`（填充式，亮暗都不画边线）、`elevation.card.color` / `elevation.popover.color` / `elevation.modal.color`（沿用 antd：暗色仍是黑色阴影，深底上几乎看不见，层次改靠浮层表面亮一档）。
- 品牌色 / 主按钮保持 Core 值：金底白字亮暗一致，品牌色一个值都不动。
- 浮层表面（`color.bg.elevated`）比 `color.bg.surface` 亮一档，页面底最深；三层顺序与 antd 暗色算法一致。卡片与亮色一样不投影，靠底色差分层；暗色卡片边线保持 antd 暗色分隔线那一档，不跟亮色改成半透明黑。
- 状态色文字换成更亮的一档，浅底改为 antd 暗色色板的预混实色，胶囊对比都在底线以上。
- 侧栏当前项换成金色暗阶、文字换成亮金；表格选中行与悬停同色（白 8%），再悬停用白 12%（亮色当前项是主色底块配白字，暗色按用户要求保持金色暗底配亮金字）；筹码底取暗色筹码字色亮金的 10%（与亮色「字色同色 10%」同一规则，推断）；图表的「深灰 / 浅灰」两个分类色在深底上互换明暗，绿与涨跌色换亮一档。
- 字体、尺寸、间距、线宽、动效等结构层 Token 不随 Theme 变化，本 Theme 不覆写它们。
- 优先覆写 Core Semantic token；Component token 仅用于已批准的组件例外。
- 不覆写 Core Primitive，也不在此处创建主题开关、持久化或系统偏好逻辑。

## 与 Scope 的关系

- Theme 是同一界面的模式，Scope 是页面边界；二者不自动组合。
- 若当前 Theme 与某个 Scope 需要同时覆写同一 Semantic，先提出提案并获得确认；不要添加猜测性 CSS。
