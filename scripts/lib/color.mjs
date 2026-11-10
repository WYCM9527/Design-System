// 颜色计算：OKLCH ↔ sRGB、WCAG 对比度、半透明叠底、OKLab 色差、HSL。调色盘导入与体检用，零依赖。
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** #RRGGBB[AA] → { r, g, b, a }（0–1）。 */
export function parseHex(hex) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) throw new Error(`不是 #RRGGBB / #RRGGBBAA：${hex}`);
  const n = (o) => parseInt(m[1].slice(o, o + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
}

export function toHex({ r, g, b, a = 1 }) {
  const byte = (v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a) : ''}`.toUpperCase();
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** OKLCH（L 0–1）→ sRGB。超出色域按通道截断——与浏览器在 sRGB 屏上的显示一致，也是 Tailwind 色值常见的十六进制写法。 */
export function oklchToRgb([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
  const [r, g, bl] = lin.map((v) => clamp01(toGamma(clamp01(v))));
  return { r, g, b: bl, a: 1 };
}

export function rgbToOklab({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}

export function rgbToOklch(rgb) {
  const [L, a, b] = rgbToOklab(rgb);
  const C = Math.hypot(a, b);
  return [L, C, C < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}

/** 两个 OKLCH 之间按 t 插值（色相走短弧），再转 sRGB。 */
export function mixOklch(from, to, t) {
  let dh = to[2] - from[2];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return oklchToRgb([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, (from[2] + dh * t + 360) % 360]);
}

export function luminance({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** 半透明前景叠到不透明底上。 */
export function composite(fg, bg) {
  const a = fg.a ?? 1;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/** WCAG 2 对比度；半透明的颜色先叠到 base（缺省白）上。 */
export function contrast(fg, bg, base = { r: 1, g: 1, b: 1, a: 1 }) {
  const solidBg = composite(bg, base);
  const solidFg = composite(fg, solidBg);
  const [x, y] = [luminance(solidFg), luminance(solidBg)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** OKLab 欧氏色差（ΔE_OK，约 0.02 是肉眼刚能分辨）。 */
export function deltaE(x, y) {
  const [a, b] = [rgbToOklab(x), rgbToOklab(y)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** sRGB → HSL（色相度数，饱和度 / 明度 0–1）——验收工具的判色范围用这个口径。 */
export function rgbToHsl({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  return [h, s, l];
}

export const round = (v, digits = 2) => Math.round(v * 10 ** digits) / 10 ** digits;
