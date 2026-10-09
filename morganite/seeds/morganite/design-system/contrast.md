# 对比度基线 · morganite

检查 50 组配对，5 组低于底线。口径：正文与 12px 小字 ≥ 4.5:1，大字 / 图标 / UI 组件 ≥ 3:1，边线可辨 ≥ 1.3:1；底色半透明时先叠到页面底上再算。

## 模式：light

| 配对 | 前景 | 底色 | 对比 | 底线 | 结果 |
| --- | --- | --- | --- | --- | --- |
| 正文 / 页面底 | `color.text.primary` #000000E0 | `color.bg.page` #F5F5F5 | 15.29:1 | ≥ 4.5 | ✔ |
| 正文 / 卡片 | `color.text.primary` #000000E0 | `color.bg.surface` #FFFFFF | 16.48:1 | ≥ 4.5 | ✔ |
| 次要文字 / 卡片 | `color.text.secondary` #000000A6 | `color.bg.surface` #FFFFFF | 7:1 | ≥ 4.5 | ✔ |
| 次要文字 / 页面底 | `color.text.secondary` #000000A6 | `color.bg.page` #F5F5F5 | 6.73:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 卡片 | `color.text.muted` #00000094 | `color.bg.surface` #FFFFFF | 5.33:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 页面底 | `color.text.muted` #00000094 | `color.bg.page` #F5F5F5 | 5.19:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 浅分区 | `color.text.muted` #00000094 | `color.bg.subtle` #F5F5F5 | 5.19:1 | ≥ 4.5 | ✔ |
| 链接 / 卡片 | `color.text.link` #8A6530 | `color.bg.surface` #FFFFFF | 5.27:1 | ≥ 4.5 | ✔ |
| 占位符 / 输入框（已知例外，≥ 3 即记录） | `color.text.placeholder` #00000073 | `color.bg.input` #0000000A | 3.27:1 | ≥ 3 | ✔ |
| 主按钮文字 / 填充 | `color.text.on-primary` #FFFFFF | `color.action.primary` #B98D44 | 3.02:1 | ≥ 4.5 | ✘ 低于底线 |
| 危险按钮文字 / 填充 | `color.text.on-danger` #FFFFFF | `color.action.danger` #CF1322 | 5.57:1 | ≥ 4.5 | ✔ |
| 反色文字 / 反色底 | `color.text.inverse` #FFFFFF | `color.bg.inverse` #000000D9 | 15.33:1 | ≥ 4.5 | ✔ |
| 选中块文字 / 选中底 | `color.text.on-selected` #000000E0 | `color.action.selected` #FFFFFF | 16.48:1 | ≥ 4.5 | ✔ |
| 成功胶囊 | `color.status.success` #2E7D52 | `color.status.success-bg` #EDF7F1 | 4.6:1 | ≥ 4.5 | ✔ |
| 警示胶囊 | `color.status.warning` #AD4E00 | `color.status.warning-bg` #FFF7E6 | 5.09:1 | ≥ 4.5 | ✔ |
| 错误胶囊 | `color.status.error` #CF1322 | `color.status.error-bg` #FFF1F0 | 5.07:1 | ≥ 4.5 | ✔ |
| 信息胶囊 | `color.status.info` #0958D9 | `color.status.info-bg` #E6F4FF | 5.5:1 | ≥ 4.5 | ✔ |
| 中性胶囊 | `color.status.neutral` #000000A6 | `color.status.neutral-bg` #0000000F | 6.42:1 | ≥ 4.5 | ✔ |
| 危险文字 / 卡片 | `color.text.danger` #CF1322 | `color.bg.surface` #FFFFFF | 5.57:1 | ≥ 4.5 | ✔ |
| 独立图标 / 卡片 | `color.icon.default` #000000A6 | `color.bg.surface` #FFFFFF | 7:1 | ≥ 3 | ✔ |
| 装饰图标 / 卡片 | `color.icon.muted` #00000073 | `color.bg.surface` #FFFFFF | 3.36:1 | ≥ 3 | ✔ |
| 卡片边线 / 页面底（可辨即可） | `color.border.default` #0000000F | `color.bg.page` #F5F5F5 | 1.13:1 | ≥ 1.3 | ✘ 低于底线 |
| 输入框边线 / 卡片（可辨即可；WCAG UI 组件 3:1 是业界普遍不达的已知例外，Citrine 同样登记为例外） | `color.border.input` #00000000 | `color.bg.surface` #FFFFFF | 1:1 | ≥ 1.3 | ✘ 低于底线 |
| 焦点边线 / 卡片 | `color.border.focus` #8A6530 | `color.bg.surface` #FFFFFF | 5.27:1 | ≥ 3 | ✔ |
| 主按钮填充 / 卡片（UI 组件 3:1） | `color.action.primary` #B98D44 | `color.bg.surface` #FFFFFF | 3.02:1 | ≥ 3 | ✔ |

## 模式：dark

| 配对 | 前景 | 底色 | 对比 | 底线 | 结果 |
| --- | --- | --- | --- | --- | --- |
| 正文 / 页面底 | `color.text.primary` #FFFFFFD9 | `color.bg.page` #000000 | 14.88:1 | ≥ 4.5 | ✔ |
| 正文 / 卡片 | `color.text.primary` #FFFFFFD9 | `color.bg.surface` #141414 | 13.43:1 | ≥ 4.5 | ✔ |
| 次要文字 / 卡片 | `color.text.secondary` #FFFFFFA6 | `color.bg.surface` #141414 | 8.21:1 | ≥ 4.5 | ✔ |
| 次要文字 / 页面底 | `color.text.secondary` #FFFFFFA6 | `color.bg.page` #000000 | 8.63:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 卡片 | `color.text.muted` #FFFFFF80 | `color.bg.surface` #141414 | 5.34:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 页面底 | `color.text.muted` #FFFFFF80 | `color.bg.page` #000000 | 5.32:1 | ≥ 4.5 | ✔ |
| 弱化文字 / 浅分区 | `color.text.muted` #FFFFFF80 | `color.bg.subtle` #FFFFFF0A | 5.37:1 | ≥ 4.5 | ✔ |
| 链接 / 卡片 | `color.text.link` #B98D44 | `color.bg.surface` #141414 | 6.1:1 | ≥ 4.5 | ✔ |
| 占位符 / 输入框（已知例外，≥ 3 即记录） | `color.text.placeholder` #FFFFFF73 | `color.bg.input` #FFFFFF14 | 4.54:1 | ≥ 3 | ✔ |
| 主按钮文字 / 填充 | `color.text.on-primary` #FFFFFF | `color.action.primary` #B98D44 | 3.02:1 | ≥ 4.5 | ✘ 低于底线 |
| 危险按钮文字 / 填充 | `color.text.on-danger` #FFFFFF | `color.action.danger` #CF1322 | 5.57:1 | ≥ 4.5 | ✔ |
| 反色文字 / 反色底 | `color.text.inverse` #FFFFFF | `color.bg.inverse` #424242 | 10.05:1 | ≥ 4.5 | ✔ |
| 选中块文字 / 选中底 | `color.text.on-selected` #FFFFFFD9 | `color.action.selected` #424242 | 7.83:1 | ≥ 4.5 | ✔ |
| 成功胶囊 | `color.status.success` #5FBF86 | `color.status.success-bg` #13261B | 7.03:1 | ≥ 4.5 | ✔ |
| 警示胶囊 | `color.status.warning` #FFC069 | `color.status.warning-bg` #2B1D11 | 10.1:1 | ≥ 4.5 | ✔ |
| 错误胶囊 | `color.status.error` #FF7875 | `color.status.error-bg` #2A1215 | 6.85:1 | ≥ 4.5 | ✔ |
| 信息胶囊 | `color.status.info` #69B1FF | `color.status.info-bg` #111A2C | 7.73:1 | ≥ 4.5 | ✔ |
| 中性胶囊 | `color.status.neutral` #FFFFFFA6 | `color.status.neutral-bg` #FFFFFF14 | 8.21:1 | ≥ 4.5 | ✔ |
| 危险文字 / 卡片 | `color.text.danger` #FF7875 | `color.bg.surface` #141414 | 7.19:1 | ≥ 4.5 | ✔ |
| 独立图标 / 卡片 | `color.icon.default` #FFFFFFA6 | `color.bg.surface` #141414 | 8.21:1 | ≥ 3 | ✔ |
| 装饰图标 / 卡片 | `color.icon.muted` #FFFFFF73 | `color.bg.surface` #141414 | 4.54:1 | ≥ 3 | ✔ |
| 卡片边线 / 页面底（可辨即可） | `color.border.default` #303030 | `color.bg.page` #000000 | 1.59:1 | ≥ 1.3 | ✔ |
| 输入框边线 / 卡片（可辨即可；WCAG UI 组件 3:1 是业界普遍不达的已知例外，Citrine 同样登记为例外） | `color.border.input` #00000000 | `color.bg.surface` #141414 | 1:1 | ≥ 1.3 | ✘ 低于底线 |
| 焦点边线 / 卡片 | `color.border.focus` #B98D44 | `color.bg.surface` #141414 | 6.1:1 | ≥ 3 | ✔ |
| 主按钮填充 / 卡片（UI 组件 3:1） | `color.action.primary` #B98D44 | `color.bg.surface` #141414 | 6.1:1 | ≥ 3 | ✔ |

## 低于底线

- [light] 主按钮文字 / 填充：`color.text.on-primary`（#FFFFFF）压 `color.action.primary`（#B98D44）只有 3.02:1，底线 4.5。改值，或由用户拍板登记为例外并写回补路径。
- [light] 卡片边线 / 页面底（可辨即可）：`color.border.default`（#0000000F）压 `color.bg.page`（#F5F5F5）只有 1.13:1，底线 1.3。改值，或由用户拍板登记为例外并写回补路径。
- [light] 输入框边线 / 卡片（可辨即可；WCAG UI 组件 3:1 是业界普遍不达的已知例外，Citrine 同样登记为例外）：`color.border.input`（#00000000）压 `color.bg.surface`（#FFFFFF）只有 1:1，底线 1.3。改值，或由用户拍板登记为例外并写回补路径。
- [dark] 主按钮文字 / 填充：`color.text.on-primary`（#FFFFFF）压 `color.action.primary`（#B98D44）只有 3.02:1，底线 4.5。改值，或由用户拍板登记为例外并写回补路径。
- [dark] 输入框边线 / 卡片（可辨即可；WCAG UI 组件 3:1 是业界普遍不达的已知例外，Citrine 同样登记为例外）：`color.border.input`（#00000000）压 `color.bg.surface`（#141414）只有 1:1，底线 1.3。改值，或由用户拍板登记为例外并写回补路径。
