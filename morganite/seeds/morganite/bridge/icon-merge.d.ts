// bridge/icon-merge.js 的类型声明（给 TypeScript / React 项目）。实现见 icon-merge.js。
/** 合并一只图标（`.i-icon > svg` 或 `svg.lucide`）；已合并且各段没变时什么都不做 */
export function mergeIcon(svg: SVGSVGElement): void
/** 合并 root 里现有的图标，并持续处理之后加进来或被改动的图标；返回停止监听的函数 */
export function mergeIcons(root?: ParentNode & Node): () => void
