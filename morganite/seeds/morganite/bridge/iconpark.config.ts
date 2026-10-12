/**
 * IconPark 桥接（配置部分）。全局配置只做一次，让每个图标默认就符合设计系统：
 *   圆头圆角、线性、跟随 font-size。描边由 iconpark.css 按屏幕上的 icon.stroke.width（1.4px）画，各档尺寸一样粗；
 *   入口里调一次 icon-merge.js 的 mergeIcons()，多段描边合并后一次上色，半透明的图标色在交叠处不叠深。
 * 尺寸与颜色交给 iconpark.css 里的 .i-icon--* 类，不在每个图标上写 size / fill。
 *
 * 版本：@icon-park/react、@icon-park/vue-next、@icon-park/svg 1.4.x（Apache-2.0）。
 * 站点：https://iconpark.oceanengine.com/official
 */

/** 与 token 一致的默认配置片段（IIconConfig 的可覆写部分）。 */
export const iconParkDefaults = {
  size: "1em",          // 跟随 font-size；尺寸用 .i-icon--xs…2xl（对应 icon.size.*）
  strokeWidth: 4.8,     // 没加载 iconpark.css 时的退路：48 网格里的 4.8 ≈ 14px 图标上的 1.4px（icon.stroke.width）；加载后由样式按屏幕粗细覆盖
  strokeLinecap: "round" as const,   // icon.stroke.linecap
  strokeLinejoin: "round" as const,  // icon.stroke.linejoin
  theme: "outline" as const,         // icon.theme.default
  prefix: "i"           // 生成 .i-icon 类名，iconpark.css 依赖它
};

/**
 * 侧栏选中项不再换成面性图标（icon.theme.active = outline）：选中靠底块与文字色表达（亮色主色底白字白图标，暗色金色暗底亮金字）。
 * 仍需要面性外观的场合（例如底部 Tab 的选中态）才用这个工具。
 * 不用 theme="filled"：IconPark 把 filled 的镂空色写死为 #FFF，在暗色或金色底上会漏白。
 * 用 multi-color 传四个颜色 [外描边, 外填充, 内描边, 内填充]，镂空色跟随所在底色的 token。
 */
export function activeIconProps(backgroundVar = "var(--color-bg-sidebar-selected)") {
  return {
    theme: "multi-color" as const,
    fill: ["currentColor", "currentColor", backgroundVar, backgroundVar]
  };
}

/** two-tone 品牌图标（空状态插图、引导页）：描边 icon.brand，填充面 icon.two-tone。 */
export const brandTwoToneProps = {
  theme: "two-tone" as const,
  fill: ["var(--color-icon-brand)", "var(--color-icon-two-tone)"]
};

/* ---------- React ----------
import { IconProvider, DEFAULT_ICON_CONFIGS } from "@icon-park/react";
import "@icon-park/react/styles/index.css";
import "../design-system/bridge/iconpark.css";

<IconProvider value={{ ...DEFAULT_ICON_CONFIGS, ...iconParkDefaults }}>
  <App />
</IconProvider>
// main.tsx 里 render() 之后：import { mergeIcons } from "@wycm9527/morganite/icon-merge"; mergeIcons();

// 用法
<Home className="i-icon--lg" />                     // 尺寸靠类，颜色继承文字
<Search className="i-icon--sm i-icon--muted" />     // 小号 + 弱化色
<Home {...activeIconProps()} />                     // 需要面性外观的选中态（不用于侧栏）
<Order className="i-icon--2xl" {...brandTwoToneProps} />   // 空状态

   ---------- Vue 3 ----------
// 注意：@icon-park/vue-next 的 IconProvider 不是组件，是一个在根组件 setup() 里调用一次的函数（内部 provide）
import { IconProvider, DEFAULT_ICON_CONFIGS } from "@icon-park/vue-next";
import "../design-system/bridge/iconpark.css";

// App.vue <script setup>
IconProvider({ ...DEFAULT_ICON_CONFIGS, ...iconParkDefaults });
// main.js 里 app.mount() 之后：import { mergeIcons } from "@wycm9527/morganite/icon-merge"; mergeIcons();

// 任意组件
import { Home } from "@icon-park/vue-next";
<Home class="i-icon--lg" />
<Home v-bind="activeIconProps()" />
// Element Plus 的 <el-icon> 里也能直接放：<el-icon><Home /></el-icon>

   ---------- 静态页 / 模板引擎（@icon-park/svg） ----------
import { setConfig, DEFAULT_ICON_CONFIGS, Home } from "@icon-park/svg";
setConfig({ ...DEFAULT_ICON_CONFIGS, ...iconParkDefaults });
`<span class="i-icon i-icon--lg">${Home()}</span>`;   // Home() 返回裸 <svg> 字符串；套一层 .i-icon，尺寸、描边、合并才和组件版一致
*/
