# 剧本 · 只覆盖部分板块（范围根）

目标：同一个应用里，只让指定的路由板块换上设计系统，其他板块（旧报表、第三方嵌入、还没排期的模块）一个字节不受影响。机制：整套 CSS 包进 `@scope (html.<root>)`，路由守卫按板块给 `<html>` 加减类。

## 先判断是不是这种情况

- **monorepo 多应用**（`apps/admin`、`apps/portal` 各有 `package.json`）→ 不需要范围根：对要覆盖的应用单独 `init --project apps/admin`，其余应用天然不受影响。
- **微前端 / iframe 子应用** → 同上，每个子应用是独立项目根。
- **同一应用内按路由分的板块** → 本剧本。
- **同一屏上新旧组件混排** → 不支持（浮层 teleport 到 body，容器级作用域罩不住）；建议把混排页整页纳入或整页不纳入。

## 步骤

1. 先按「从 0 开始」或「更换现有规范」把项目接入（快照 + 工作副本 + build-tokens）——范围根只是改变**样式生效范围**，不改变接入方式。
2. 生成范围包：`node <adopter>/scripts/ds.mjs scope --root <class> --to src/styles/citrine-scoped --with element-plus`（`--root` 通常用系统 id；`--with` 按栈选桥接组）。得到 `index.css`（token，优先项目工作副本的 dist）、`recipes.css`、桥接文件，各自包在 `@scope (html.<root>)` 里，`:root` / `html` 已改写为 `:scope`；`scope.manifest.json` 记账；`.adopter.json` 记 `scopeRoot / scopeDir / scopeWith`。
3. 样式入口：组件库基础样式保持全局；把原来的 dist / 桥接 / recipes import **换成**范围包里的文件。
4. `<html>` 默认带 `class="<root>"`（多数路由覆盖时）；路由守卫：Vue Router 在未接入板块的路由 `meta` 上标 `legacy: true`，`router.beforeEach((to) => document.documentElement.classList.toggle('<root>', !to.meta.legacy))`；React 按路径前缀切（命令会打印片段）。
5. `exemptions.json` 登记 `src/styles/citrine-scoped/**`（范围根生成物）；未接入板块的目录如需保留旧硬编码也登记并写明理由。
6. 验收清单只登记覆盖板块的页面。另外**必须自证旧板块没被波及**：打开一个未接入路由，`document.documentElement.classList` 不含 root，`getComputedStyle(document.documentElement).getPropertyValue('--color-action-primary')` 为空，组件是组件库默认外观。
7. 以后 token / 桥接变化：`upgrade` 完成时**自动**先用 steward 重建 token（dist），再用新快照与新 dist 重生成范围包——桥接 / recipes / token 一次到位。只有找不到 steward 时才需手工 `build-tokens → ds.mjs scope`；本地自己改 token 后也是这两步。不重生成的话桥接更新到不了应用——范围包是生成物快照，不是引用。

## 硬边界

- 范围包是**生成物**，不手改；差异写项目样式，公共诉求提上游。
- 这是**过渡态**：新板块立住后，用「更换现有规范」的二期收编逐个纳入旧板块，最后去掉范围根回到全局 import。
- 浏览器下限 `@scope`：Chrome / Edge 118+、Safari 17.4+、Firefox 128+。低于此的用户群不要用范围根，改为整应用接入或不接入。
- shadcn 栈：范围包会把 Tailwind 的 `@theme` 提升到顶层（它只映射工具类名到变量，本身无视觉），其余包进 `@scope`——`@theme` 生成的工具类在未接入板块里引用的变量为空，等价于无样式，不会漏色。
