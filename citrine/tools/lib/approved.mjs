// 已批准的对比度例外。项目登记的在 accept.config.mjs 的 APPROVED_CONTRAST：[{ fg, bg?, minRatio?, why }]，颜色写 #RGB / #RRGGBB / #RRGGBBAA / rgb() / rgba()。
// 不写 bg 表示这个前景色在任何底上都算批准（如占位符）；写 minRatio 表示只放行实测不低于它的情况（如叠加悬停底后略低于 4.5 的文字），再低照样报。比较按通道 ±1、透明度 ±0.02，计算值里的空格与写法差异不影响匹配。
// 它是系统 DESIGN「验收基线 / 已批准的例外」的镜像：先在设计系统里登记例外，再写到这里。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function parseColor(s) {
  if (!s || typeof s !== 'string') return null;
  const t = s.trim();
  const hex = t.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? +(n(6) / 255).toFixed(3) : 1 };
  }
  const m = t.match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null;
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

export function normalizeApproved(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((x) => ({ fg: parseColor(x?.fg), bg: x?.bg ? parseColor(x.bg) : null, minRatio: Number(x?.minRatio) || 0, why: x?.why || '' }))
    .filter((x) => x.fg);
}

const near = (p, q) => !!p && !!q && Math.abs(p.r - q.r) <= 1 && Math.abs(p.g - q.g) <= 1 && Math.abs(p.b - q.b) <= 1 && Math.abs((p.a ?? 1) - (q.a ?? 1)) <= 0.02;

export function isApprovedPair(fg, bg, list, ratio) {
  if (!list?.length) return false;
  const f = parseColor(fg), b = parseColor(bg);
  return list.some((x) => near(f, x.fg) && (!x.bg || near(b, x.bg)) && (!x.minRatio || (ratio ?? 0) >= x.minRatio));
}

// Citrine 的内置例外（Citrine DESIGN「验收基线 / 已批准的例外」），页面审计与组件走查各一份。
const DANGER_WHITE = { fg: 'rgb(255, 255, 255)', bg: 'rgb(238, 72, 75)', why: '危险按钮白字' };
const CITRINE = {
  pages: [
    { fg: 'rgb(11, 158, 116)', why: 'success 文字' }, { fg: 'rgb(215, 103, 18)', why: 'warning 文字' }, { fg: 'rgb(238, 72, 75)', why: 'error 文字' },
    { fg: 'rgb(156, 163, 175)', why: '亮色占位符 neutral.400' }, { fg: 'rgb(102, 109, 123)', why: '暗色占位符 neutral.500' }, DANGER_WHITE,
  ],
  components: [
    { fg: 'rgb(11, 158, 116)', why: 'success 文字' }, { fg: 'rgb(215, 103, 18)', why: 'warning 文字' }, { fg: 'rgb(238, 72, 75)', why: 'error 文字' },
    { fg: 'rgb(0, 165, 110)', why: '暗色 success' }, { fg: 'rgb(203, 126, 0)', why: '暗色 warning' }, { fg: 'rgb(235, 99, 120)', why: '暗色 error' }, DANGER_WHITE,
  ],
};

/**
 * 内置例外只对 Citrine 项目生效：accept.config.mjs 写了 CITRINE_APPROVED = true / false 就照它；否则看项目 design-system/.adopter.json 的 system，
 * 不是 citrine 就不带（别的系统的颜色不该被 Citrine 的例外放行）；读不到清单的老项目照旧带上。
 */
export function citrineApprovedOn(cfg, appDir) {
  if (typeof cfg?.CITRINE_APPROVED === 'boolean') return cfg.CITRINE_APPROVED;
  try { const system = JSON.parse(readFileSync(join(appDir, 'design-system/.adopter.json'), 'utf8')).system; return !system || system === 'citrine'; } catch { return true; }
}

/** 某一步（pages | components）实际生效的例外：Citrine 内置（按上面的开关）+ 项目登记的 APPROVED_CONTRAST。 */
export function approvedFor(kind, cfg, appDir) {
  return normalizeApproved([...(citrineApprovedOn(cfg, appDir) ? CITRINE[kind] : []), ...(cfg?.APPROVED_CONTRAST || [])]);
}
