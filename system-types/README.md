# 系统类型（公司自定义）

`web-to-design-system` 提炼一套设计系统前要先定**类型**：这套规范给什么类型的产品用。类型决定哪些语义角色必须处理、允许按规则推断哪些、`DESIGN.md` 用哪套配方词汇、要不要拷组件库桥接、预检推荐取哪些页面、预览板放哪套样例。**不是所有设计系统都给中后台用**——一个官网按「通用网站」处理，不会被补出侧栏宽、表格内边距、状态色。

skill 内置三类（`skills/web-to-design-system/assets/types/`）：

| id | label | 一句话 |
| --- | --- | --- |
| `website`（别名 `brand`） | 通用网站 | 官网、活动页、作品集、博客、内容站：以读和看为主，交互只有导航、链接、CTA 与少量表单 |
| `product` | 产品应用 | 面向用户的应用 / SaaS 前台：表单、列表、弹窗、状态反馈齐全，没有后台壳层 |
| `admin` | 中后台 | 侧栏 + 表格 + 图表 + 弹窗尺寸的工作台 |

公司自己的类型放**本目录** `system-types/<id>/`，skill 从仓库根自动发现（同 id 会覆盖内置定义）：

```text
system-types/<id>/
├── type.json        # id / label / description / aliases / extends / roles / bridges / pages / board
├── quick.md         # DESIGN「先读这里」（可省，回退到 extends 的类型）
├── visual.md        # DESIGN「视觉语言」
├── components.md    # DESIGN「组件原则」
└── recipes.md       # DESIGN「组件配方」表
```

最省事的写法是 `extends` 一个内置类型、只增删角色，例如文档站：

```json
{
  "id": "docs",
  "label": "文档站",
  "description": "产品文档 / 帮助中心：长文阅读、代码块、侧栏目录、搜索",
  "extends": "website",
  "roles": { "required": { "include": ["font.family.code", "text.numeric.variant", "layout.sidebar.width"], "exclude": ["color.bg.overlay"] } },
  "pages": "首页 + 一篇长文档（标题阶梯、代码块、表格）+ 搜索结果页"
}
```

字段说明、角色模式（`color.status.*` 通配）、自动推断的判据见 skill 的 [references/system-types.md](../skills/web-to-design-system/references/system-types.md)。列出当前可用的类型：

```bash
node skills/web-to-design-system/scripts/list-types.mjs            # 内置 + 本目录
node skills/web-to-design-system/scripts/list-types.mjs --roles docs   # 某类型必须处理 / 可推断的角色
```

类型只决定「要哪些角色、用哪些词汇」，不改语义角色词表本身——角色名在所有类型间通用，桥接 / 配方 / 迁移对照才能跨系统复用。要给某类系统加独有角色（比如 `hero.*`），是词表扩展，走 skill 的版本。
