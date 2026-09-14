// {{PROJECT}} 的验收清单（@wycm9527/citrine-tools 的 citrine-accept 读取）。
// 演示参数放在 # 之前（?theme=dark、?state=empty），页面用 location.search 读；名字 → 「?演示参数#路由」。
// 亮暗两遍：工具用 ?theme=light|dark 打开每个页面——项目要在首屏把它落成 <html class="dark">（index.html 里先读 URL 再读 localStorage，避免闪烁）。
export const PAGES = [
  ['dashboard', '#/'],
  // ['orders', '#/orders'], ['orders-empty', '?state=empty#/orders'], ['form-invalid', '?state=invalid#/form'], …
];
export const DEFAULT_QUERY = {};              // 每个页面缺省带的参数（如 { role: 'admin' }）
export const KITCHEN = null;                  // 全组件走查页（如 '#/kitchen'）；null 会跳过 components 走查——桥接层的 hover / focus 回归由上游实测项目覆盖，独立项目靠 pages 扫描兜底；要本地覆盖就自建走查页填这里
export const NARROW = { width: 1366, pages: [['dashboard', '#/']] };   // 窄屏检查：侧栏折叠、无横向溢出
export const FOCUS = { pages: { dashboard: '#/' }, steps: 80 };        // Tab 焦点遍历
