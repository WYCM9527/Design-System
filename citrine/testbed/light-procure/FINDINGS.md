# 轻采试点 · 发现与回填

试点方式：四个互不通气的编码 Agent 各领 2–4 个页面，只允许读仓库文档（README 快速开始、种子 README、`DESIGN.md`、配方层）、数据层源码与黄金后台的页面写法，被要求把"文档没规定、只能自己定"的每一处记下来（原始笔记见 [`notes/`](notes/)，四份共 158 条：判断 158 / 缺口 45 / 组件冲突 55 中去重）。集成后按 PRD §8 的 T01–T15 走闭环，再跑仓库级验收（94 个页面状态 × 亮暗、1280 窄屏、Tab 焦点）。

编号沿用黄金后台 FINDINGS 的 D 序列。**类型**：S = 设计系统层（token / 桥接 / 配方 / DESIGN）修正，P = 项目层修正，N = 记录不改。

| # | 发现 | 根因 | 类型 | 处理（2.4.0） |
| --- | --- | --- | --- | --- |
| D73 | 按 README 接入第二个项目时，页头 / 筛选栏 / 状态胶囊 / 表单页 / 空态 / 结果页这些骨架，以及统计卡 / 图表 / 骨架屏组件都拿不到 | 它们只存在于黄金后台的 `app.css` 与 `components/`，从未进种子 | S | 提升为种子 `bridge/recipes.css`（公共类，只引用 token）与 `bridge/vue/`（StatCard / EChart / TrendChart / TableSkeleton）；黄金后台改为消费同一份，8 页逐像素零差异；README 快速开始与样式入口顺序补上配方层 |
| D74 | 验收工具跑不了第二个项目 | 路径、页面清单、窄屏宽度、焦点页全部写死在黄金后台目录里 | S | 移到仓库级 `citrine/tools/`，项目用 `accept.config.mjs` 登记 `PAGES / DEFAULT_QUERY / KITCHEN / NARROW / FOCUS`，`--project` 可指向任意 app；无头 Chrome 加 `--no-proxy-server`（代理环境下连不上本机） |
| D75 | README 十条硬规则与 DESIGN 漂移：第 6 条还写着"表格操作列是 quiet 文字按钮"，第 7 条还是"胶囊 500 字重" | 2.1.x / 2.3.0 只改了 DESIGN | S | 对齐 DESIGN |
| D76 | 四组都遇到：`el-select` 把 `''` 当未选、显示灰占位符，与"「全部…」是真实选项"冲突 | Element 行为 | S | DESIGN「先读这里」第 5 条写明用 `'all'` 哨兵再映射；AGENTS 同步 |
| D77 | 图表容器换数据不重画（报表重新查询、工作台切身份），页面各自用 `:key` 重建实例 | `EChart` 只在挂载和主题切换时 `setOption` | S | `EChart` 用 `watchEffect` 执行 option 函数，函数里读到的响应式数据成为依赖，变了自动重画；DESIGN 数据可视化补一句 |
| D78 | 计数型趋势（申请数 0～3）出现 0.5 / 1.5 这种"半张申请"刻度，且 y 轴不从 0 起；页面绕开 `TrendChart` 自拼 option | `trendLine` 的 `scale: true` 是给金额 / 订单量这类大数设计的 | S | `trendLine` 自动判断计数型（全整数且 ≤ 20）→ `min: 0` + `minInterval: 1`，`TrendChart` 加 `count` prop；DESIGN 补规则 |
| D79 | 部门排行柱状图：DESIGN 写"前三黄其余灰"，但页面不许写颜色、主题只给单色 | 规则有、配方没有 | S | 桥接新增 `rankBars({ categories, values, top, formatter })`：前三纯黄、其余 `sequential` 灰、零值不着黄、右侧金额标签留 96px |
| D80 | 组织树当前节点看不出"当前"：Element 的 `primary-light-9` 底经桥接映射后与 hover 几乎同色；行高 26 不在任何控件档；展开箭头是 2.5:1 的占位符灰 | 桥接只接了树的拖拽两条 | S | 桥接接管 `is-current` 为深黑反转块（含 `el-text` 标签跟随文字色）、行高 `control.height.md`、箭头 `icon.muted`；DESIGN 配方表新增「页面级组织树」行；走查页复扫通过 |
| D81 | 表格合计行（`show-summary`）压不住正文：Element 用行 hover 色做底、字重同正文 | 桥接未接管表尾 | S | 桥接：表尾 `bg.subtle` + 500 + 等宽数字；DESIGN 表格配方补「合计行」 |
| D82 | `ElMessageBox` 关闭后焦点掉到 body（T15 要求浮层关闭后回到触发按钮）；`el-drawer` 打开后焦点在容器而不是首个控件 | Element 行为 | S | 新增 `bridge/vue/confirm.js`（`confirmBox / confirmDanger`，用法同 `ElMessageBox.confirm`，关闭后把焦点还给打开前的元素）；两个项目全部改用；DESIGN 交互一节写明抽屉要 `@opened` 手动聚焦 |
| D83 | 加载中的按钮被压淡成禁用态 | Element 在 loading 时同时加 `is-disabled`，桥接的 `opacity.disabled` 一起生效 | S | 桥接 `.el-button.is-loading.is-disabled { opacity: 1 }` |
| D84 | 标签页头与内容间距 15px、弹窗宽度只能 `:width` 传变量字符串 | Element 写死 / 无尺寸档 | S | 桥接 `.el-tabs__header` 接 `spacing.4`；`.el-dialog.is-sm / .is-md` 两档类 |
| D85 | DESIGN 定义了"标题型链接"却没有类；`.chip` 的 × 是 `<span>`（不可键盘到达、无命中区）；`.help` 没有上边距、与错误文案叠加；`.act:disabled` 用 `pointer-events: none` 让 `title` 说明无处附着；抽屉小标题、只读块、`nowrap`、单独成卡的筛选栏底线各页重写 | 配方层第一次被第二个项目消费 | S | recipes 新增 `.title-link`、`.chip button.x`（命中区 24、负外边距保胶囊宽度）、`.help`（上边距 + 出错隐藏）、`.ro`、`.drawer-h`、`.nowrap`、`.filter.solo`；`.act:disabled` 改为只对 `<a>.is-disabled` 切断事件，`<button disabled>` 保留 `title` |
| D86 | 720 宽的表单页放不下 7 列明细表；表单内行内录入表格没有配方 | 表格单元格内边距 token（20 × 2）是列表页密度 | S | recipes 新增 `.table-editable`（内边距 `spacing.3 / spacing.2`、顶部对齐、行内错误静态渲染、列头星号）；DESIGN 表单页行写明 |
| D87 | 长表单的页脚看不见、上传区没有配方 | — | S | recipes `.form-foot.is-sticky`（发丝边 + 向上卡片阴影）、`.upload-zone`（虚线 / hover / 拖入 / 满额 / 整块焦点环）；DESIGN 配方表新增「上传区」行 |
| D88 | 表单页脚按钮次序：DESIGN 写"取消次要、保存草稿 quiet"，与"第二个真实动作是次要、取消是 quiet"的实际做法相反 | 早期只有"取消 / 上一步"两种页脚 | S | DESIGN 改为：主操作最右，其左次要（保存草稿 / 上一步），quiet（取消 / 放弃修改） |
| D89 | 只读字段的形态没定：readonly 输入框会进 Tab 序列却不可改 | — | S | DESIGN 先读第 8 条：只读 = `bg.readonly` 的不可聚焦文本块 `.ro` |
| D90 | 左右分栏页（树 + 表、列表 + 矩阵）、设置页、危险区没有骨架规则，四组各自定比例 | 页面骨架只有六种形态 | S | DESIGN 页面骨架表新增「左右分栏页」（1 : 5，左栏只放导航性内容，当前项反转块）与「设置页」（页签独立表单 + 页脚、未保存后缀、危险区独立卡、输入指定文字确认）两行 |
| D91 | 统计卡放不下口径说明（报表「已通过金额」与工作台口径不同要提示），页面把图标按钮绝对定位压在卡上 | StatCard 只有 delta 时才有副文案 | S | `StatCard` 新增 `hint`（标签右侧信息图标 tooltip，带 aria-label）、`note` 可单独显示、`#label-extra` 插槽 |
| D92 | 首屏权限守卫失效：申请人直达 `#/org` 没被拦 | 数据未就绪时守卫放行，就绪后 `router.replace` 同一地址被当作重复导航跳过 | P | `router.replace({ …, force: true })`；验收清单里 `forbidden` 状态专门盯这条 |
| D93 | `toISOString().slice(0, 10)` 在东八区把日期倒退一天：报表按日循环不终止、近 6 周周起点偏一天 | 数据层写法 | P | `format.js` 改为本地日期拼串，`api.report / myWeeklyTrend` 复用 |
| D94 | 提交时"供应商已停用"在落库之后才抛，新建表单会留下一张草稿 | 校验顺序 | P | `submitApplication` 先校验再保存 |
| D95 | `useDirtyGuard` 用 `onBeforeRouteLeave`，新建保存后 `replace` 到编辑路由（同一组件实例）后不再触发 | 组件级守卫绑定路由记录 | P | 改为全局 `router.beforeEach` + 卸载时移除；表单页删掉自己的补丁 |
| D96 | 操作列按 PRD 逐项列举（查看 / 编辑 / 提交 / 删除 + ⋯）在 1440 会横向滚动 | DESIGN「一行最多 3 个动作、危险动作收进更多」与 PRD 细节冲突 | N | 采用 DESIGN：查看 / 编辑 / 提交 + ⋯（复制、删除）；PRD 属于测试脚本，设计规则优先 |
| D97 | 四组在"表格列宽 / 筛选控件宽度"上都纠结要不要写像素 | DESIGN 说它们不是 token、按内容定，而项目规则说样式不写像素 | N | 维持：列宽 `width` prop 与筛选控件行内宽度按内容定，`<style>` 里零字面量；关键词框用 `layout.search-width` |
| D98 | 抽屉内的离开确认走 `ElMessageBox` 等于第二层浮层，与 PRD「浮层内原位确认」冲突；`el-date-picker` 的「今天」跟真实日期 | 组件能力 | N | 记录；原位确认区域需要自绘，留待有真实需求时做成配方 |

## 闭环验证（PRD §8）

T01 三身份菜单 / 越权拦截 / 管理员无审批 · T02 筛选组合、排序、翻页、重置、返回恢复 · T03 空提交落字段、只填标题保存、补齐提交 · T04 5 行上限、附件类型 / 大小 / 数量、刷新保留可预览 · T05 离开确认、注入提交失败保留输入、重试不重复建单 · T06 顾言通过陈予的申请 → 陈予收到通知 → 详情提示条 · T07 空意见驳回拦截、复制为新草稿 · T08 只有本人草稿可选、确认数量、退页 · T09 登记 → 分配林晓 → 归还，工作台与本人列表同步 · T10 停用蓝海电子 → 历史快照保留、新表单选不到、草稿提交要求处理 · T11 新增成员进身份切换、当前管理员不可停用 · T12 系统名称 / 每页条数刷新生效、关闭通知后审批不生成通知 · T13 报表口径与导出 · T14 空工作台（周舟）、筛选无结果、注入列表失败重试、记录不存在 · T15 日志可追溯、1280 无整页溢出、Tab 焦点环全覆盖、确认弹窗焦点归位。

## 验收

`npm run accept`：47 个页面状态 × 亮 / 暗 = 94，无未批准低对比 / 无名称 / 溢出 / 重复 id；1280 侧栏折叠、无整页横向溢出；四个页面 Tab 遍历无 `NO RING`。黄金后台在同一份桥接与配方下复跑全绿（页面 80 状态 × 亮暗、全组件走查、1366、焦点、E/S 像素）。
