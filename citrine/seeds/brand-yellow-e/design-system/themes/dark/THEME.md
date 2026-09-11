# Theme：dark

> Core Token 是确认的默认 Theme。本文件只记录当前 Theme 相对 Core 的意图、适用范围和运行时约束；具体值只写在本目录 `tokens/*.tokens.json`，不要复制 Core 或手改生成 CSS。

## 映射

- 默认 Theme：`light`
- 当前 Theme：`dark`
- 状态：`active`
- 激活方式：`:root.dark`
- 权威来源：本目录 `tokens/semantic.tokens.json`（预览 `tokens-e/d.css` 的 `.dark` 块是它的手写镜像，用于像素一致校验）。
- 运行时所有者：`宿主应用在 <html> 上切换 class dark（如 next-themes）。`
- 设计理由：预览中确认的暗色模式：黄色在深底上对比度更高。

## 相对 Core 的设计意图

- 只覆写背景、文字、边线、状态色、浮层与阴影、图表这几组 Semantic；品牌黄（`color.action.primary*`、`color.brand.indicator`、`color.text.on-primary`）保持 Core 值，黄色在深底上对比度比亮色更高，不需要调整。危险按钮填充 `color.action.danger*` 同样不覆写：填充必须保持深红，白字才读得清。
- 焦点边线与焦点环反转为近白 + 白 20% 的环；品牌黄不参与焦点表达。
- 选中态（表格行、筹码、批量条）与骨架屏、只读底都用 graphite 阶梯——品牌黄不参与任何选中表达。
- 浮层表面 `color.bg.elevated` 比 `bg.surface` 亮一档；卡片阴影色设为透明，靠边线分层；浮层和弹窗的阴影换成黑色半透明，才在深底上看得见。
- 图表分类色：蓝提亮到 `blue.400`、青换成 default `cyan.500`，紫亮暗同值；顺序色的灰阶换成 graphite / neutral 的暗色梯度，仍以纯黄封顶。
- 深底用独立的 `color.graphite.*` 色阶而不是把亮灰反转：反转出来的中段发闷。graphite 与亮色冷灰**同族**（每档保持原明度，色相按 gray 族暗端校准），亮暗切换时灰的"味道"一致。
- 选中态（筹码、表格行、侧栏）用 graphite 梯度反转，文字近白；`text.brand`（结果页大字）在暗色下才是纯黄——深底上纯黄 11:1，这是黄色文字唯一合法的场合。
- 状态色在暗色下用各族的 500 档做文字，统一压到 graphite.850 上 5.5–5.6:1（wash 浅底上 4.6+）——亮色的鲜亮值直接搬进暗色会刺眼；浅底改为同色 14% 叠在 graphite.850 上**预混的实色 wash**（`*.wash`、`neutral.wash-dark`），让徽标、提示条在深底上不发脏；实色而不是半透明，是因为半透明落在选中行 / 悬停行上会随底色变浅，文字掉到 4.1:1 以下。
- 局部加载遮罩 `bg.mask` 用 graphite.800（surface）90%，与亮色"白 90%"同一语义。
- `data.inactive`（非进行中的数据填充）换成 neutral.500：在 graphite 轨道上 2.6:1，看得见但不抢。
- `text.danger` 换成 `red.500`；`action.danger` 仍是深红——文字与填充在暗色下必须分道。
- 字体、尺寸、间距、线宽、动效等结构层 Token 不随 Theme 变化，dark 不覆写它们。
- 优先覆写 Core Semantic token；Component token 仅用于已批准的组件例外。
- 不覆写 Core Primitive，也不在此处创建主题开关、持久化或系统偏好逻辑。

## 与 Scope 的关系

- Theme 是同一界面的模式，Scope 是页面边界；二者不自动组合。
- 若当前 Theme 与某个 Scope 需要同时覆写同一 Semantic，先提出提案并获得确认；不要添加猜测性 CSS。
