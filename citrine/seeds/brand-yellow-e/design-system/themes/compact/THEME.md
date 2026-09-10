# Theme：compact

> Core Token 是确认的默认 Theme。本文件只记录当前 Theme 相对 Core 的意图、适用范围和运行时约束；具体值只写在本目录 `tokens/*.tokens.json`，不要复制 Core 或手改生成 CSS。

## 映射

- 默认 Theme：`light`（舒适密度）
- 当前 Theme：`compact`
- 状态：`active`
- 激活方式：`:root.compact`
- 权威来源：公司级设计规范决定（2026-09-08）：密度默认舒适，紧凑为可选。
- 运行时所有者：宿主应用在 `<html>` 上切换 class `compact`；可与 `dark` 同时存在。
- 设计理由：高密度表格页与大屏运营后台需要更紧的控件与间距。

## 相对 Core 的设计意图

- 只覆写尺寸与间距类 Semantic：控件高度降一档（`control.height.md` → 28px、`control.height.sm` → 24px）、卡片间距与内容区留白各收一档、表格单元格内边距收紧。颜色、字号、字重、线宽一律不动——紧凑不是"变小字"，中文 12px 下限在紧凑模式下同样成立。
- 与 `dark` 覆写的 token 完全不相交，所以 `:root.dark.compact` 自然叠加，不需要第三份 delta。
- 紧凑是页面级或用户级偏好，由宿主应用决定何时开启；本 Theme 不创建切换控件，也不持久化。
- 不覆写 Core Primitive，也不在此处创建主题开关、持久化或系统偏好逻辑。

## 与 Scope 的关系

- Theme 是同一界面的模式，Scope 是页面边界；二者不自动组合。
- 若当前 Theme 与某个 Scope 需要同时覆写同一 Semantic，先提出提案并获得确认；不要添加猜测性 CSS。
