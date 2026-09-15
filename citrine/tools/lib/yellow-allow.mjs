// 页面级静息黄色的默认允许清单（DESIGN「黄不表达强调」的白名单）：Element Plus 桥接 · shadcn 桥接 · recipes 配方。
// 项目在 accept.config.mjs 里用 YELLOW_ALLOW: ['selector', …] 追加自己的合法位置（要有理由，如营销页 hero）。
export const YELLOW_ALLOW = [
  // Element Plus：主按钮（含禁用态，靑 opacity 变淡）、勾选 / 单选 / 开关选中、进度 / 滑杆、当前页码、当前步骤、时间线主节点、加载转圈
  '.el-button--primary:not(.is-plain):not(.is-text):not(.is-link)', '.el-checkbox__input.is-checked', '.el-checkbox__input.is-indeterminate', '.el-checkbox-button.is-checked',
  '.el-radio__input.is-checked', '.el-radio-button.is-active', '.el-switch.is-checked .el-switch__core', '.el-progress', '.el-slider__bar', '.el-slider__button',
  '.el-pager .is-active', '.el-step__head.is-process', '.el-timeline-item__node--primary', '.el-loading-spinner', '.el-picker-panel .is-selected', '.el-picker-panel td.current',
  // shadcn：主按钮（default 变体）、选中态、进度、滑杆
  '[data-slot="button"]', '[data-state="checked"]', '[data-slot="progress-indicator"]', '[data-slot="slider-range"]', '[data-slot="slider-thumb"]',
  // recipes / 模板：数据卡描边、Logo、当前页码、纯 CSS 主按钮、原位确认条主按钮
  '.stat-card', '.app-brand .logo', '.pages .page.is-current', '.btn.primary', '.confirm-bar__btn.is-primary',
  // 空态 / 结果页的 two-tone 品牌插图（DESIGN「图标」：描边 icon.brand、填充 icon.two-tone）
  '.empty .illu', '.result .illu',
  // 结果页的大号错误码：text.brand（DESIGN：品牌色文字只允许 ≥ 20px 的展示性文字；暗色下为黄）
  '.result .code',
];
