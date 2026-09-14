# 剧本 · 日常做页面（已接入的项目）

每次改 UI 之前的固定动作，与三行 steward 规则一致：

1. **先读文档再动手**：`design-system/DESIGN.md` 对应章节（页面骨架 / 组件配方 / 组件库对照）+ 项目 `AGENTS.md` 的接线段。不确定某个场景用什么，查 DESIGN 的配方表，找最接近的一行类推。
2. **只用已管理的决定**：
   - 结构用配方类（页头 / 筛选栏 / 条件标签 / 批量条 / 状态胶囊 / 操作胶囊 / 表单页 / 空态 / 统计卡 / 原位确认条 / 结果页），不自写骨架；
   - 组件用桥接过的组件库与配方组件（身份文件 `stacks.<栈>.components` 目录），import 路径见 AGENTS.md；
   - 颜色 / 间距 / 字号 / 圆角 / 阴影只写 token 变量；页面里出现 `#hex`、裸像素、`rgba(...)` 就是错的（Tailwind 项目的刻度类除外——它们已接到 token）。
3. **配方不够用时**：停下来提提案（要什么、给谁用、建议进哪一层——token / 桥接 / 配方 / 组件），由用户决定是否向上游仓库提交；临时先用最接近的既有配方顶住。**不在页面上就地发明样式值，不改快照。**
4. **做完自检**：`npm run build` → steward `guard`（current）→ 验收命令；新页面记得加进 `accept.config.mjs` 的 PAGES / NARROW / FOCUS 清单。
5. 演示参数（`?theme=dark`、`?state=empty|error|invalid`）放在 `#` 之前、用 `location.search` 读——验收工具靠这个直达各状态。
