// 表格骨架（种子配方组件 · React 版）：按目标表格的形状占位（表头 + 等高行 + 列宽），加载完成后不发生版面跳动。样式来自 recipes.css 的 .tskel。
export function TableSkeleton({ rows = 6, cols = [200, 160, 120, 120, 100] }: { rows?: number; cols?: number[] }) {
  return (
    <div className="tskel" role="status" aria-live="polite" aria-label="正在加载">
      <div className="tskel-head">{cols.map((w, i) => <span key={i} className="cell" style={{ flex: `0 0 ${w}px` }}><i className="bar head" /></span>)}</div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="tskel-row">{cols.map((w, i) => <span key={i} className="cell" style={{ flex: `0 0 ${w}px` }}><i className={`bar${(r + i) % 3 === 0 ? ' short' : ''}`} /></span>)}</div>
      ))}
    </div>
  )
}
