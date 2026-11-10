#!/usr/bin/env node
// 把 shadcn/ui 的 17 个主题色搬成 Morganite 调色盘（morganite/seeds/morganite/palettes/<id>.json）。
// 主色 = shadcn 亮色 primary；其余档按 Morganite 每一档的用途取 Tailwind v4 同色系色阶（见 LADDERS）；
// 再按对比度改指向：浅色主色上的字改深色，亮色链接 / 焦点 / 当前项不够深就往深档挪，暗色不够亮就往浅档挪。
// 挪完仍不达标的配对写进 contrastExceptions（用户批过的见 APPROVED，其余 approved: false），体检脚本 check-palettes.mjs 认这份登记。
// 另生成黄晶黄 citrine：主色是黄晶的 #F9CF00，链接、选中、当前项、焦点像黄晶那样用中性黑（用户 2026-11-10 在「加深的黄」和「用黑」里选了用黑）。
// 来源钉在固定版本（升级来源 = 改 SOURCES 后重跑，diff 里能看清颜色变了什么），两者都是 MIT：
//   shadcn-ui/ui apps/v4/registry/themes.ts · tailwindlabs/tailwindcss packages/tailwindcss/theme.css
// 调色盘文件是生成物：要改颜色或改指向，改这里的规则再重跑；用户批过的例外与验收登记的 approvedContrast 重跑时保留。
// 目录里由本脚本生成、但规则里已经没有的调色盘文件会被删掉（--check 时算过期）；不是本脚本生成的文件不碰。
// 用法：node scripts/import-shadcn-palettes.mjs [--cache <dir>] [--only blue,cyan] [--dry-run] [--check（与文件不一致退出 1，CI 用）]
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../design-system-adopter/scripts/lib/util.mjs';
import { applyToTrees, cloneDefaults, getNode, normalizePalette, paletteContext, resolveColor } from '../design-system-adopter/scripts/lib/palette.mjs';
import { contrast, mixOklch, oklchToRgb, parseHex, rgbToHsl, rgbToOklch, round, toHex } from './lib/color.mjs';
import { classify, colorOf, evaluatePalette } from './lib/palette-checks.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = join(ROOT, 'morganite/seeds/morganite');
const GENERATOR = 'scripts/import-shadcn-palettes.mjs';
const SCHEMA = 'https://raw.githubusercontent.com/WYCM9527/Design-System/main/design-system-adopter/schema/palette.schema.json';
const SOURCES = {
  shadcn: { repo: 'shadcn-ui/ui', ref: '4101ec98af37e2d812f859e3f540bceafbbc5200', path: 'apps/v4/registry/themes.ts' },
  tailwind: { repo: 'tailwindlabs/tailwindcss', ref: 'v4.3.5', path: 'packages/tailwindcss/theme.css' }
};
const NAMES = { amber: '琥珀', blue: '蓝', cyan: '青', emerald: '翡翠绿', fuchsia: '品红', green: '绿', indigo: '靛蓝', lime: '青柠', orange: '橙', pink: '粉', purple: '紫', red: '红', rose: '玫红', sky: '天蓝', teal: '蓝绿', violet: '紫罗兰', yellow: '黄' };
const CITRINE = '#F9CF00';

// 槽位 → Tailwind 的某一档，或两档之间按 OKLCH 插值 [从, 到, 比例]。按 shadcn 主色落在哪一档分两套：
// 主色在 700（深主色放白字）：200 / 250 给图表浅色，300 / 400 给暗色下的文字，550 / 600 / 700 是悬停 / 按下与链接（Morganite 悬停是加深），900 是暗色选中底。
// 主色在 400（浅主色放深字）：深档跳着取，留出链接能用的 700（对白 ≥ 4.5）和品牌色上的深字 800。
const LADDERS = {
  700: { 50: ['50'], 100: ['100'], 200: ['300'], 250: ['300', '400', 0.3], 300: ['400'], 400: ['500'], 500: ['700'], 550: ['700', '800', 0.35], 600: ['800'], 700: ['900'], 800: ['900', '950', 0.5], 900: ['950'] },
  400: { 50: ['50'], 100: ['100'], 200: ['200'], 250: ['200', '300', 0.5], 300: ['300'], 400: ['300', '400', 0.5], 500: ['400'], 550: ['400', '500', 0.35], 600: ['500'], 700: ['700'], 800: ['900'], 900: ['950'] }
};
const ALPHAS = { '500-a16': ['500', 0.16], '500-a24': ['500', 0.24], '600-a10': ['600', 0.1], '300-a10': ['300', 0.1] };
const ORDER = ['50', '100', '200', '250', '300', '400', '500', '550', '600', '700', '800', '900'];

const ON_ROLES = ['color.text.on-primary', 'color.text.on-brand', 'color.text.sidebar-selected'];
// [角色, 底线, 压在哪些底上]：亮色往深档挪，暗色往浅档挪。「上层@下层」是叠出来的底（卡片上的悬停行），口径同 lib/palette-checks.mjs
const LINK_BGS = ['color.bg.surface', 'color.bg.page', 'color.bg.elevated', 'color.bg.hover@color.bg.surface'];
const SELECTED_BGS = ['color.bg.surface', 'color.bg.elevated', 'color.bg.selected-subtle', 'color.bg.chip'];
const LIGHT_RULES = [
  ['color.text.link', 4.5, LINK_BGS],
  ['color.text.link-hover', 4.5, ['color.bg.surface', 'color.bg.page']],
  ['color.text.selected', 4.5, SELECTED_BGS],
  ['color.border.focus', 3, ['color.bg.surface']],
  ['color.focus.ring', 3, ['color.bg.surface']],
  ['color.text.brand', 3, ['color.bg.surface']],
  ['color.icon.brand', 3, ['color.bg.surface']],
  ['color.border.current', 3, ['color.bg.surface']]
];
const DARK_RULES = [
  ['color.text.link', 4.5, LINK_BGS],
  ['color.text.link-hover', 4.5, ['color.bg.surface', 'color.bg.page']],
  ['color.text.selected', 4.5, SELECTED_BGS],
  ['color.text.sidebar-selected', 4.5, ['color.bg.sidebar-selected']],
  ['color.border.focus', 3, ['color.bg.surface']],
  ['color.focus.ring', 3, ['color.bg.surface']],
  ['color.text.brand', 3, ['color.bg.surface']],
  ['color.icon.brand', 3, ['color.bg.surface']],
  ['color.border.current', 3, ['color.bg.surface']],
  ['color.brand.indicator', 3, ['color.bg.surface']]
];
// 黄晶的写法：链接、选中、当前项、焦点都用中性黑（暗色用浅灰），只有主按钮、品牌底、指示条、图表是黄
const INK = {
  semantic: {
    'color.text.on-primary': '{color.neutral.900}',
    'color.text.on-brand': '{color.neutral.900}',
    'color.text.link': '{color.neutral.700}',
    'color.text.link-hover': '{color.neutral.900}',
    'color.text.selected': '{color.neutral.900}',
    'color.text.brand': '{color.neutral.900}',
    'color.border.current': '{color.neutral.900}',
    'color.border.focus': '{color.neutral.900}',
    'color.focus.ring': '{color.neutral.700}',
    'color.icon.brand': '{color.neutral.900}',
    'color.bg.selected-subtle': '{color.neutral.100}',
    'color.bg.sidebar-selected': '{color.neutral.900}'
  },
  dark: {
    'color.text.link': '{color.neutral.300}',
    'color.text.link-hover': '{color.neutral.100}',
    'color.text.selected': '{color.neutral.100}',
    'color.text.brand': '{color.brand.500}',
    'color.border.current': '{color.neutral.100}',
    'color.border.focus': '{color.neutral.100}',
    'color.focus.ring': '{color.neutral.300}',
    'color.icon.brand': '{color.neutral.100}',
    'color.bg.selected-subtle': '{color.neutral.800}',
    'color.bg.sidebar-selected': '{color.neutral.700}',
    'color.text.sidebar-selected': '{color.neutral.100}'
  }
};
// 用户拍板过的调整（预览面板「导出」给的清单写到这里）：primitives 覆盖色阶里的某几档，semantic / dark 直接定某个角色的指向（不再按对比度自动挪）
const TWEAKS = {};
// 用户批过的对比度例外（2026-11-10 定官方颜色时）：[调色盘, 前景, 背景, 模式]。只批这几条，以后新冒出来的例外照样待批
const APPROVED = [
  ['blue', 'color.action.primary', 'color.bg.surface', 'dark'],
  ['purple', 'color.action.primary', 'color.bg.surface', 'dark'],
  ['citrine', 'color.action.primary', 'color.bg.surface', 'light'],
  ['citrine', 'color.brand.indicator', 'color.bg.surface', 'light']
];
// 挪不动、只能登记的配对，说明写清楚为什么能接受
const WHY = {
  'color.action.primary|color.bg.surface|dark': (r) => `暗色主按钮填充对卡片 ${r.ratio}:1，低于 UI 组件 3:1：Morganite 暗色不换品牌主色，按钮靠上面的字识别（shadcn 原版暗色主色还要更深）`,
  'color.action.primary|color.bg.surface|light': (r) => `浅色主按钮对白卡片 ${r.ratio}:1，低于 UI 组件 3:1：按钮靠深色字识别（shadcn 原版同样如此）`,
  'color.brand.indicator|color.bg.surface|light': (r) => `品牌指示条对白卡片 ${r.ratio}:1：指示条总和选中底 / 加粗一起出现，不单靠颜色区分`
};

const args = parseArgs();
const fail = (msg) => { console.error(msg); process.exit(1); };
const ctx = paletteContext(SEED);
const group = ctx.settings.group;
const ref = (slot) => `{${group}.${slot}}`;
const slotOf = (value) => (typeof value === 'string' && value.startsWith(`{${group}.`) ? value.slice(group.length + 2, -1) : null);

async function source(key) {
  const s = SOURCES[key];
  const cacheFile = args.cache ? join(resolve(args.cache), `${key}-${s.ref}.txt`) : null;
  if (cacheFile && existsSync(cacheFile)) return readFileSync(cacheFile, 'utf8');
  const url = `https://raw.githubusercontent.com/${s.repo}/${s.ref}/${s.path}`;
  const res = await fetch(url);
  if (!res.ok) fail(`下载失败 ${url}：HTTP ${res.status}`);
  const text = await res.text();
  if (cacheFile) { mkdirSync(dirname(cacheFile), { recursive: true }); writeFileSync(cacheFile, text); }
  return text;
}

function tailwindScales(css) {
  const out = {};
  for (const m of css.matchAll(/--color-([a-z]+)-(\d+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)) (out[m[1]] ||= {})[m[2]] = [Number(m[3]) / 100, Number(m[4]), Number(m[5])];
  return out;
}

const cssVars = (text) => Object.fromEntries([...text.matchAll(/"?([a-z0-9-]+)"?:\s*"oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)"/g)].map((m) => [m[1], [Number(m[2]), Number(m[3]), Number(m[4])]]));

/** 只取颜色主题：底色主题（neutral / stone …）带 background 等整套变量，跳过。 */
function shadcnThemes(ts) {
  const out = [];
  for (const block of ts.split(/\n {2}\{\n/).slice(1)) {
    const name = /name: "([a-z]+)"/.exec(block)?.[1];
    const lightAt = block.indexOf('light: {');
    const darkAt = block.indexOf('dark: {');
    if (!name || lightAt < 0 || darkAt < 0) continue;
    const light = cssVars(block.slice(lightAt, darkAt));
    const dark = cssVars(block.slice(darkAt));
    if (!light.primary || light.background) continue;
    out.push({ name, light, dark });
  }
  return out;
}

function stepOf(scale, oklch) {
  return Object.keys(scale).find((s) => scale[s].every((v, i) => Math.abs(v - oklch[i]) < (i === 2 ? 0.01 : 0.002)));
}

function ladder(scale, at) {
  const rules = LADDERS[at] || fail(`主色落在 Tailwind ${at} 档，没有对应的取色规则（LADDERS 只写了 700 与 400）`);
  const slots = {};
  for (const [slot, [from, to, t]] of Object.entries(rules)) slots[slot] = toHex(to ? mixOklch(scale[from], scale[to], t) : oklchToRgb(scale[from]));
  for (const [slot, [from, alpha]] of Object.entries(ALPHAS)) slots[slot] = toHex({ ...parseHex(slots[from]), a: alpha });
  return Object.fromEntries([...ORDER, ...Object.keys(ALPHAS)].map((s) => [`${group}.${s}`, slots[s]]));
}

/** 角色在某个模式下当前指向什么（调色盘的改指向优先，暗色先看暗色覆写）。 */
function pointer(raw, role, mode) {
  if (mode === 'dark') {
    if (raw.dark[role]) return raw.dark[role].value;
    const d = getNode(ctx.defaults.dark, role);
    if (d?.has?.('$value')) return d.get('$value');
  }
  return raw.semantic[role]?.value ?? getNode(ctx.defaults.semantic, role)?.get('$value');
}

/** 角色临时指到 slot 时，对这些底的最低对比度。 */
function measure(raw, mode, role, bgs, slot) {
  const trial = { ...raw, semantic: { ...raw.semantic }, dark: { ...raw.dark } };
  if (slot) (mode === 'dark' ? trial.dark : trial.semantic)[role] = { value: ref(slot), why: '' };
  const trees = applyToTrees(ctx, cloneDefaults(ctx), normalizePalette(ctx, trial));
  const color = (p) => colorOf(trees, p, mode);
  const page = color('color.bg.page');
  return Math.min(...bgs.map((bg) => contrast(color(role), color(bg), page)));
}

function settle(raw, mode, role, min, bgs, notes) {
  if (raw.fixed.has(`${mode}:${role}`)) return;
  const slot = slotOf(pointer(raw, role, mode));
  if (!slot) return;
  const layer = mode === 'dark' ? raw.dark : raw.semantic;
  const label = mode === 'dark' ? '暗色' : '亮色';
  // 暗色：亮色为了对比挪走了、种子暗色又没有覆写的角色，先试回到种子原来的档（暗底上原来那档往往就够）
  const seedCore = slotOf(getNode(ctx.defaults.semantic, role)?.get('$value'));
  if (mode === 'dark' && !getNode(ctx.defaults.dark, role) && raw.semantic[role] && seedCore && seedCore !== slot && measure(raw, mode, role, bgs, seedCore) >= min) {
    layer[role] = { value: ref(seedCore), why: `亮色改到 ${slot} 是为了压白底；暗底上种子原来的 ${seedCore} 就够（${round(measure(raw, mode, role, bgs, seedCore))}:1），暗色改回去` };
    return;
  }
  // 链接悬停要比链接更进一档（亮色更深、暗色更浅）
  const link = role === 'color.text.link-hover' ? slotOf(pointer(raw, 'color.text.link', mode)) : null;
  const beyond = (s) => !link || (mode === 'dark' ? ORDER.indexOf(s) < ORDER.indexOf(link) : ORDER.indexOf(s) > ORDER.indexOf(link));
  const now = measure(raw, mode, role, bgs, null);
  if (now >= min && beyond(slot)) return;
  const idx = ORDER.indexOf(slot);
  const candidates = (mode === 'dark' ? ORDER.slice(0, idx).reverse() : ORDER.slice(idx + 1)).filter(beyond);
  const pick = candidates.find((s) => measure(raw, mode, role, bgs, s) >= min);
  if (!pick) { notes.push(`${label} ${role} 往${mode === 'dark' ? '浅' : '深'}挪到头也不到 ${min}:1，保持 ${slot}，见 contrastExceptions`); return; }
  layer[role] = { value: ref(pick), why: now >= min ? `${label}要比链接${mode === 'dark' ? '更浅' : '更深'}一档，改用 ${pick}（${round(measure(raw, mode, role, bgs, pick))}:1）` : `${label}原来的 ${slot} 只有 ${round(now)}:1（要 ${min}），改用 ${pick}（${round(measure(raw, mode, role, bgs, pick))}:1）` };
}

function decideRoles(raw, notes) {
  const fill = (slot) => parseHex(raw.primitives[`${group}.${slot}`]);
  const white = parseHex('#FFFFFF');
  const onWhite = contrast(white, fill('500'));
  if (onWhite < 3) {
    const pick = ['800', '900', '700'].find((s) => ['500', '550', '600'].every((f) => contrast(fill(s), fill(f)) >= 4.5));
    if (!pick) fail(`${raw.id}：品牌色上找不到对主色 / 悬停 / 按下都 ≥ 4.5 的深字`);
    for (const role of ON_ROLES) if (!raw.fixed.has(`light:${role}`)) raw.semantic[role] = { value: ref(pick), why: `白字对主色只有 ${round(onWhite)}:1，品牌色上的字改深色 ${pick}（对主色 ${round(contrast(fill(pick), fill('500')))}:1）` };
  } else notes.push(`白字对主色 ${round(onWhite)}:1${onWhite < 4.5 ? '（低于 4.5，见 contrastExceptions）' : ''}`);
  for (const [role, min, bgs] of LIGHT_RULES) settle(raw, 'light', role, min, bgs, notes);
  for (const [role, min, bgs] of DARK_RULES) settle(raw, 'dark', role, min, bgs, notes);
}

/** 验收工具的判色范围：取被当作品牌色用的几档（图表浅色到链接深色）的 HSL 外包，再放一点余量。 */
function brandRange(raw, name) {
  const hsl = ['200', '250', '300', '400', '500', '550', '600', '700'].map((s) => rgbToHsl(parseHex(raw.primitives[`${group}.${s}`])));
  let hues = hsl.map(([h]) => h);
  const wraps = Math.max(...hues) - Math.min(...hues) > 180;
  if (wraps) hues = hues.map((h) => (h > 180 ? h - 360 : h));
  const lo = Math.floor(Math.min(...hues) - 4);
  const hi = Math.ceil(Math.max(...hues) + 4);
  const sat = hsl.map(([, s]) => s);
  const light = hsl.map(([, , l]) => l);
  return {
    name: `品牌${name}`,
    hue: [(lo + 360) % 360, (hi + 360) % 360],
    saturation: [round(Math.max(0, Math.min(...sat) - 0.1)), round(Math.min(1, Math.max(...sat) + 0.15))],
    lightness: [round(Math.max(0.05, Math.min(...light) - 0.05)), round(Math.min(0.95, Math.max(...light) + 0.08))]
  };
}

function exceptionsFor(raw, baseline) {
  const { rows } = evaluatePalette(ctx, normalizePalette(ctx, raw));
  return classify(rows, baseline, []).filter((r) => r.status === 'fail').map((r) => ({
    fg: r.fg,
    bg: r.bg,
    mode: r.mode,
    min: Math.floor(r.ratio * 100) / 100,
    why: (WHY[`${r.fg}|${r.bg}|${r.mode}`] || ((x) => `${x.label} ${x.ratio}:1，低于 ${x.min}:1`))(r),
    approved: APPROVED.some(([id, fg, bg, mode]) => id === raw.id && fg === r.fg && bg === r.bg && mode === r.mode)
  }));
}

function build({ id, name, source, primitives, notes, preset }, baseline) {
  const tweak = TWEAKS[id] || {};
  const raw = { id, name, primitives: { ...primitives, ...tweak.primitives }, semantic: {}, dark: {}, fixed: new Set() };
  for (const [slot, [from, alpha]] of Object.entries(ALPHAS)) {
    const key = `${group}.${slot}`;
    if (tweak.primitives?.[`${group}.${from}`] && !tweak.primitives[key]) raw.primitives[key] = toHex({ ...parseHex(raw.primitives[`${group}.${from}`]), a: alpha });
  }
  for (const [kind, mode] of [['semantic', 'light'], ['dark', 'dark']]) {
    for (const [k, v] of Object.entries(tweak[kind] || {})) {
      raw[kind][k] = typeof v === 'string' ? { value: v, why: '用户指定' } : v;
      raw.fixed.add(`${mode}:${k}`);
    }
  }
  if (tweak.primitives) notes.push(`用户调过的档：${Object.keys(tweak.primitives).join('、')}`);
  if (preset) {
    for (const [k, v] of Object.entries(preset.semantic)) raw.semantic[k] ??= { value: v, why: '黄晶的写法：链接、选中、当前项、焦点用中性黑，黄色只留给主按钮、品牌底、指示条和图表' };
    for (const [k, v] of Object.entries(preset.dark)) raw.dark[k] ??= { value: v, why: '黄晶的暗色写法：链接与选中用浅灰，品牌大字用黄' };
  } else decideRoles(raw, notes);
  const contrastExceptions = exceptionsFor(raw, baseline);
  return {
    $schema: SCHEMA,
    id,
    name,
    source,
    primitives: raw.primitives,
    semantic: raw.semantic,
    dark: raw.dark,
    contrastExceptions,
    accept: { brand: brandRange(raw, name.replace(/（.*$/, '')), approvedContrast: [] },
    notes
  };
}

const [ts, css] = await Promise.all([source('shadcn'), source('tailwind')]);
const scales = tailwindScales(css);
const themes = shadcnThemes(ts);
if (themes.length !== 17) fail(`themes.ts 里认出 ${themes.length} 个颜色主题（预期 17）：${themes.map((t) => t.name).join(' ')}`);
const baseline = evaluatePalette(ctx, null).rows;
const only = typeof args.only === 'string' ? args.only.split(',') : null;
const outputs = [];
const scaleNote = (family) => `tailwindcss@${SOURCES.tailwind.ref} ${SOURCES.tailwind.path} · ${family}`;

for (const t of themes) {
  const scale = scales[t.name] || fail(`Tailwind 没有 ${t.name} 色系`);
  const at = stepOf(scale, t.light.primary) || fail(`${t.name} 的 primary 不在 Tailwind ${t.name} 色阶上`);
  const darkAt = stepOf(scale, t.dark.primary);
  const primitives = ladder(scale, at);
  outputs.push(build({
    id: t.name,
    name: NAMES[t.name],
    source: { from: `shadcn/ui ${SOURCES.shadcn.path} · ${t.name}（亮色 primary = ${t.name}-${at}）`, ref: `${SOURCES.shadcn.repo}@${SOURCES.shadcn.ref}`, scale: scaleNote(t.name), license: 'MIT', generator: GENERATOR },
    primitives,
    notes: [
      `主色 ${primitives[`${group}.500`]} 是 shadcn「${t.name}」的亮色 primary（Tailwind ${t.name}-${at}）；其余各档按 Morganite 每档的用途取同色系色阶，规则见 ${GENERATOR} 的 LADDERS`,
      `暗色沿用同一个主色：Morganite 暗色不换品牌主色（shadcn 原版暗色换成 ${t.name}-${darkAt ?? '?'}）`
    ]
  }, baseline));
}

const yellow = { ...scales.yellow, 400: rgbToOklch(parseHex(CITRINE)) };
const citrinePrimitives = ladder(yellow, 400);
const citrineSource = { from: `Citrine 黄晶 citrine/seeds/brand-yellow-e · color.brand.500 ${CITRINE}`, scale: `${scaleNote('yellow')}（400 档换成 ${CITRINE}）`, license: 'MIT（色阶）', generator: GENERATOR };
outputs.push(build({ id: 'citrine', name: '黄晶黄', source: citrineSource, primitives: citrinePrimitives, preset: INK, notes: [`主色是黄晶的品牌黄 ${CITRINE}；像黄晶那样，链接、选中、当前项、焦点用中性黑（暗色用浅灰），黄色只留给主按钮、品牌底、指示条和图表`] }, baseline));

/** 重跑不丢人的决定：用户批过的例外（底线没降）保留批准与说明，验收跑出来登记的 approvedContrast 原样保留。 */
function keepDecisions(p, before) {
  if (!before) return p;
  for (const ex of p.contrastExceptions) {
    const old = before.contrastExceptions?.find((o) => o.fg === ex.fg && o.bg === ex.bg && o.mode === ex.mode);
    if (old?.approved === true && ex.min >= old.min - 0.005) Object.assign(ex, { why: old.why, approved: true });
  }
  if (before.accept?.approvedContrast?.length) p.accept.approvedContrast = before.accept.approvedContrast;
  return p;
}

const dir = join(SEED, ctx.settings.dir);
mkdirSync(dir, { recursive: true });
let stale = 0;
for (const generated of outputs) {
  if (only && !only.includes(generated.id)) continue;
  const file = join(dir, `${generated.id}.json`);
  const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const p = keepDecisions(generated, before && JSON.parse(before));
  normalizePalette(ctx, p);
  const text = JSON.stringify(p, null, 2) + '\n';
  const state = before === null ? '新建' : before === text ? '不变' : '更新';
  if (state !== '不变') stale++;
  if (!args['dry-run'] && !args.check && state !== '不变') writeFileSync(file, text);
  const moved = Object.keys(p.semantic).length + Object.keys(p.dark).length;
  const pending = p.contrastExceptions.filter((x) => !x.approved).length;
  console.log(`${args['dry-run'] || args.check ? '[只看] ' : ''}${state} ${ctx.settings.dir}/${p.id}.json · ${p.name} ${p.primitives[`${group}.500`]} · 改指向 ${moved} 处 · 例外 ${p.contrastExceptions.length}（待批 ${pending}）`);
}
if (!only) {
  const kept = new Set(outputs.map((o) => `${o.id}.json`));
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json') && !kept.has(f))) {
    const file = join(dir, name);
    let generator = null;
    try { generator = JSON.parse(readFileSync(file, 'utf8')).source?.generator; } catch { generator = null; }
    if (generator !== GENERATOR) continue;
    stale++;
    if (!args['dry-run'] && !args.check) rmSync(file);
    console.log(`${args['dry-run'] || args.check ? '[只看] ' : ''}删除 ${ctx.settings.dir}/${name} · 规则里已经没有这个调色盘`);
  }
}
if (args.check && stale) {
  console.error(`\n${stale} 个调色盘文件和生成脚本的结果不一致：手改过的颜色要写回 ${GENERATOR}（调色盘文件是生成物），再重跑一次。`);
  process.exitCode = 1;
}
