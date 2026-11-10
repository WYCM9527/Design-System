// 调色盘：一个颜色主题一个文件（<种子>/palettes/<id>.json），只改已有 token 的值——
// 品牌色原语（color.brand.*）整组换掉，加上登记过的少量角色改指向（亮色 / 暗色各一组）。
// 默认颜色（如 Morganite 的玫瑰金）不建文件：种子现值就是它。
// 同一份逻辑给 ds.mjs（接入 / 换色 / 升级 / 导出）、种子仓库的体检脚本和预览面板共用。零依赖，Node ≥ 22。
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseOrdered, stringifyOrdered } from './ojson.mjs';

export const PALETTE_ID = /^[a-z][a-z0-9-]*$/;
const HEX = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;
const REF = /^\{[a-z0-9][a-z0-9.-]*\}$/;

/** 身份文件 palettes 段 → 归一化设置；没有该段返回 null（这个设计系统不支持换色）。 */
export function paletteSettings(identity) {
  const p = identity?.palettes;
  if (!p) return null;
  const group = p.group || 'color.brand';
  return {
    dir: p.dir || 'palettes',
    group,
    swatch: p.swatch || `${group}.500`,
    defaultId: p.default?.id || 'default',
    defaultName: p.default?.name || identity.name,
    official: p.official || [],
    preview: p.preview || null,
    theme: p.theme || null,
    roles: p.roles || []
  };
}

/** 调色盘会改写的三个 token 文件（相对种子 / 项目根）。 */
export function tokenFiles(settings) {
  return {
    primitives: 'design-system/tokens/primitives.tokens.json',
    semantic: 'design-system/tokens/semantic.tokens.json',
    ...(settings.theme ? { dark: `design-system/themes/${settings.theme}/tokens/semantic.tokens.json` } : {})
  };
}

const readTree = (file) => parseOrdered(readFileSync(file, 'utf8'));
const isToken = (n) => n instanceof Map && n.has('$value');
const clone = (n) => (n instanceof Map ? new Map([...n].map(([k, v]) => [k, clone(v)])) : Array.isArray(n) ? n.map(clone) : n);

export function getNode(tree, path) {
  let n = tree;
  for (const k of path.split('.')) {
    if (!(n instanceof Map) || !n.has(k)) return undefined;
    n = n.get(k);
  }
  return n;
}

function setNode(tree, path, node) {
  const keys = path.split('.');
  let n = tree;
  for (const k of keys.slice(0, -1)) {
    if (!(n.get(k) instanceof Map)) n.set(k, new Map());
    n = n.get(k);
  }
  n.set(keys.at(-1), node);
}

function deleteNode(tree, path) {
  const keys = path.split('.');
  const chain = [tree];
  for (const k of keys.slice(0, -1)) {
    const next = chain.at(-1).get(k);
    if (!(next instanceof Map)) return;
    chain.push(next);
  }
  chain.at(-1).delete(keys.at(-1));
  for (let d = chain.length - 1; d > 0 && chain[d].size === 0; d--) chain[d - 1].delete(keys[d - 1]);
}

/** 品牌组里的原语 token 路径（按文件原序）。 */
export function brandKeys(primitives, group = 'color.brand') {
  const g = getNode(primitives, group);
  if (!(g instanceof Map)) return [];
  return [...g].filter(([k, v]) => !k.startsWith('$') && isToken(v)).map(([k]) => `${group}.${k}`);
}

/** #RRGGBB[AA] → DTCG 颜色值（分量 4 位小数；alpha 不给时取 hex 里的，没有为 1）。 */
export function colorValue(hex, alpha) {
  const m = HEX.exec(hex);
  if (!m) throw new Error(`不是 #RRGGBB / #RRGGBBAA：${hex}`);
  const a = alpha ?? (m[2] ? Math.round((parseInt(m[2], 16) / 255) * 100) / 100 : 1);
  const rgb = [0, 2, 4].map((o) => parseInt(m[1].slice(o, o + 2), 16));
  const alphaHex = a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : '';
  return new Map([
    ['colorSpace', 'srgb'],
    ['components', rgb.map((c) => Math.round((c / 255) * 10000) / 10000)],
    ['alpha', a],
    ['hex', `#${m[1]}${alphaHex}`.toUpperCase()]
  ]);
}

/** 读种子（或项目快照）根目录：设置 + 三个 token 文件的默认值。不支持换色时返回 null。 */
export function paletteContext(root, identity) {
  identity ??= JSON.parse(readFileSync(join(root, 'design-system.json'), 'utf8'));
  const settings = paletteSettings(identity);
  if (!settings) return null;
  const files = tokenFiles(settings);
  const defaults = {};
  for (const [kind, rel] of Object.entries(files)) {
    if (!existsSync(join(root, rel))) throw new Error(`${identity.id} 缺 ${rel}，套不了调色盘`);
    defaults[kind] = readTree(join(root, rel));
  }
  return { root, identity, settings, files, defaults, brand: brandKeys(defaults.primitives, settings.group) };
}

const hexOf = (node) => node?.get('$value')?.get?.('hex');

function defaultPalette(ctx) {
  return {
    id: ctx.settings.defaultId,
    name: ctx.settings.defaultName,
    isDefault: true,
    official: true,
    swatch: hexOf(getNode(ctx.defaults.primitives, ctx.settings.swatch)),
    primitives: new Map(),
    semantic: new Map(),
    dark: new Map(),
    contrastExceptions: [],
    accept: null
  };
}

const roleEntry = (v) => (typeof v === 'string' ? { value: v, why: '' } : { value: v?.value, why: v?.why || '' });

/** 调色盘文件 → 归一化对象，并按种子默认值体检格式；有问题抛错（中文说明逐条列出）。 */
export function loadPalette(ctx, id) {
  if (!id || id === ctx.settings.defaultId) return defaultPalette(ctx);
  if (!PALETTE_ID.test(id)) throw new Error(`调色盘 id 只能是小写字母、数字和连字符：${id}`);
  const file = join(ctx.root, ctx.settings.dir, `${id}.json`);
  if (!existsSync(file)) {
    const known = listPalettes(ctx).map((p) => p.id).join(' / ');
    throw new Error(`没有调色盘 ${id}（${ctx.settings.dir}/${id}.json）；可选：${known}`);
  }
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (raw.id !== id) throw new Error(`调色盘文件名是 ${id}.json，里面的 id 却是 ${raw.id}`);
  return normalizePalette(ctx, raw);
}

/** 调色盘原始对象（文件内容）→ 归一化对象：primitives 为 路径 → #hex，semantic / dark 为 角色 → { value, why }。 */
export function normalizePalette(ctx, raw) {
  const id = raw.id;
  const palette = {
    id,
    name: raw.name || id,
    isDefault: false,
    official: ctx.settings.official.includes(id),
    source: raw.source || null,
    notes: raw.notes || [],
    file: `${ctx.settings.dir}/${id}.json`,
    primitives: new Map(),
    semantic: new Map(Object.entries(raw.semantic || {}).map(([k, v]) => [k, roleEntry(v)])),
    dark: new Map(Object.entries(raw.dark || {}).map(([k, v]) => [k, roleEntry(v)])),
    contrastExceptions: raw.contrastExceptions || [],
    accept: raw.accept || null
  };
  const issues = [];
  if (!PALETTE_ID.test(id || '')) issues.push(`id 只能是小写字母、数字和连字符：${id}`);
  if (id === ctx.settings.defaultId) issues.push(`${id} 是默认颜色，不建调色盘文件`);
  const given = raw.primitives || {};
  for (const key of ctx.brand) {
    const hex = given[key];
    if (typeof hex !== 'string' || !HEX.test(hex)) { issues.push(`缺 ${key} 或不是 #RRGGBB：${hex}`); continue; }
    const alpha = getNode(ctx.defaults.primitives, key).get('$value').get('alpha');
    if (alpha < 1 && hex.length === 9 && Math.abs(parseInt(hex.slice(7), 16) - Math.round(alpha * 255)) > 1) issues.push(`${key} 的透明度应为 ${alpha}（种子里这一档就是半透明），文件里是 ${hex.slice(7)}`);
    palette.primitives.set(key, colorValue(hex.slice(0, 7), alpha).get('hex'));
  }
  for (const key of Object.keys(given)) if (!ctx.brand.includes(key)) issues.push(`${key} 不是种子里的品牌色原语（只能改 ${ctx.settings.group}.* 已有的档）`);
  for (const [kind, map] of [['semantic', palette.semantic], ['dark', palette.dark]]) {
    if (kind === 'dark' && map.size && !ctx.defaults.dark) issues.push('这个设计系统没有登记暗色主题，调色盘不能写 dark');
    for (const [key, { value }] of map) {
      if (!ctx.settings.roles.includes(key)) issues.push(`${kind === 'dark' ? '暗色 ' : ''}${key} 不在调色盘可改指向的角色名单里（design-system.json palettes.roles）`);
      else if (typeof value !== 'string' || !REF.test(value)) issues.push(`${key} 只能指向已有 token（写成 {color.xxx}）：${value}`);
      else if (value === `{${key}}`) issues.push(`${key} 不能指向自己`);
      else if (!isToken(getNode(ctx.defaults.primitives, value.slice(1, -1))) && !isToken(getNode(ctx.defaults.semantic, value.slice(1, -1)))) issues.push(`${key} 指向的 ${value} 在种子里不存在`);
    }
  }
  if (issues.length) throw new Error(`调色盘 ${id} 有 ${issues.length} 处问题：\n  - ${issues.join('\n  - ')}`);
  palette.swatch = palette.primitives.get(ctx.settings.swatch) || defaultPalette(ctx).swatch;
  return palette;
}

/** 默认颜色 + palettes/ 目录里的全部调色盘（官方在前，按名单顺序；其余按 id）。 */
export function listPalettes(ctx) {
  const dir = join(ctx.root, ctx.settings.dir);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((id) => PALETTE_ID.test(id)) : [];
  const out = [defaultPalette(ctx)];
  for (const id of files) {
    const raw = JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8'));
    out.push({ id, name: raw.name || id, isDefault: false, official: ctx.settings.official.includes(id), swatch: raw.primitives?.[ctx.settings.swatch] || null });
  }
  const rank = (p) => (p.isDefault ? -1 : p.official ? ctx.settings.official.indexOf(p.id) : 1000);
  return out.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}

function describe(palette, why) {
  const tag = palette.official ? '[确认]' : '[推断]';
  return `${tag} 调色盘「${palette.name}」（${palette.id}，见 ${palette.file}）${why ? `：${why}` : ''}`;
}

/** 三个 token 文件的默认值深拷贝（在内存里试套调色盘用）。 */
export const cloneDefaults = (ctx) => Object.fromEntries(Object.entries(ctx.defaults).map(([k, v]) => [k, clone(v)]));

/**
 * 把调色盘套到 targetRoot 的工作副本：先把调色盘管的键恢复成 ctx 里的默认值，再写入调色盘的值。
 * 只碰品牌色原语和 palettes.roles 登记的角色；其他 token 原样保留。返回实际改动的文件。
 */
export function applyPalette(ctx, targetRoot, palette, { write = true } = {}) {
  const trees = {};
  for (const [kind, rel] of Object.entries(ctx.files)) {
    if (!existsSync(join(targetRoot, rel))) throw new Error(`工作副本缺 ${rel}`);
    trees[kind] = readTree(join(targetRoot, rel));
  }
  applyToTrees(ctx, trees, palette);
  const changed = [];
  for (const [kind, rel] of Object.entries(ctx.files)) {
    const text = stringifyOrdered(trees[kind]) + '\n';
    if (text === readFileSync(join(targetRoot, rel), 'utf8')) continue;
    changed.push(rel);
    if (write) writeFileSync(join(targetRoot, rel), text);
  }
  return { changed };
}

/** 工作副本三个 token 文件在「调色盘管的键恢复成 ctx 默认值」之后的文本（相对路径 → 文本，不写盘）：看换色之外还有没有本地修改、升级前摘下调色盘用。 */
export function withoutPalette(ctx, targetRoot) {
  const trees = {};
  for (const [kind, rel] of Object.entries(ctx.files)) {
    if (!existsSync(join(targetRoot, rel))) throw new Error(`工作副本缺 ${rel}`);
    trees[kind] = readTree(join(targetRoot, rel));
  }
  applyToTrees(ctx, trees, defaultPalette(ctx));
  return Object.fromEntries(Object.entries(ctx.files).map(([kind, rel]) => [rel, stringifyOrdered(trees[kind]) + '\n']));
}

/** 同一个调色盘的两个版本差在哪（升级报告用）：{ primitives: 变了几档品牌色, roles: 变了几处指向 }。 */
export function paletteDiff(a, b) {
  const keys = (x, y) => new Set([...x.keys(), ...y.keys()]);
  let primitives = 0, roles = 0;
  for (const k of keys(a.primitives, b.primitives)) if (a.primitives.get(k) !== b.primitives.get(k)) primitives++;
  for (const kind of ['semantic', 'dark']) for (const k of keys(a[kind], b[kind])) if (a[kind].get(k)?.value !== b[kind].get(k)?.value) roles++;
  return { primitives, roles };
}

/** applyPalette 的内存版：直接改 trees（{ primitives, semantic, dark } 三棵 Map 树）。 */
export function applyToTrees(ctx, trees, palette) {
  palette ??= defaultPalette(ctx);
  for (const key of ctx.brand) {
    const node = clone(getNode(ctx.defaults.primitives, key));
    const hex = palette.primitives.get(key);
    if (hex) {
      node.set('$value', colorValue(hex.slice(0, 7), node.get('$value').get('alpha')));
      node.set('$description', describe(palette, ''));
    }
    setNode(trees.primitives, key, node);
  }
  for (const kind of ['semantic', 'dark']) {
    if (!trees[kind]) continue;
    const overrides = palette[kind];
    for (const role of ctx.settings.roles) {
      const base = getNode(ctx.defaults[kind], role);
      const over = overrides.get(role);
      if (over) {
        const node = clone(base || getNode(ctx.defaults.semantic, role) || new Map([['$type', 'color']]));
        node.set('$value', over.value);
        node.set('$description', describe(palette, over.why || `改指向 ${over.value}`));
        setNode(trees[kind], role, node);
      } else if (base) setNode(trees[kind], role, clone(base));
      else deleteNode(trees[kind], role);
    }
  }
  return trees;
}

/** 在 trees 上解析某个 token 的最终颜色（#hex；不是颜色返回 null）。mode 为 'dark' 时暗色覆写优先，引用也在暗色里解析。 */
export function resolveColor(trees, path, mode = 'light', seen = new Set()) {
  if (seen.has(path)) throw new Error(`循环引用：${[...seen, path].join(' → ')}`);
  seen.add(path);
  const pick = (tree) => (tree && isToken(getNode(tree, path)) ? getNode(tree, path) : undefined);
  const node = (mode === 'dark' ? pick(trees.dark) : undefined) ?? pick(trees.semantic) ?? pick(trees.primitives);
  if (!node) return null;
  const v = node.get('$value');
  if (typeof v === 'string' && REF.test(v)) return resolveColor(trees, v.slice(1, -1), mode, seen);
  return v instanceof Map ? v.get('hex') || null : null;
}

export const cssVar = (path) => `--${path.split('.').join('-')}`;
const refVar = (ref) => `var(${cssVar(ref.slice(1, -1))})`;

/**
 * 调色盘 → 一段 CSS 覆盖（接在种子构建产物后面用；默认颜色返回空串）。
 * selectors 可换成预览用的 :root:where([data-palette="x"])，特异度与种子的 :root / :root.dark 相同。
 */
export function paletteCss(palette, { root = ':root', dark = ':root.dark', comment = true } = {}) {
  if (!palette || palette.isDefault) return '';
  const lines = comment ? [`/* 调色盘「${palette.name}」（${palette.id}）：只换品牌色原语与少量角色指向。生成物，别手改——换色用 ds.mjs palette（纯 CSS 交付用 export / scope --palette）。 */`] : [];
  lines.push(`${root} {`);
  for (const [key, hex] of palette.primitives) lines.push(`  ${cssVar(key)}: ${hex};`);
  for (const [key, { value }] of palette.semantic) lines.push(`  ${cssVar(key)}: ${refVar(value)};`);
  lines.push('}');
  if (palette.dark.size) {
    lines.push(`${dark} {`);
    for (const [key, { value }] of palette.dark) lines.push(`  ${cssVar(key)}: ${refVar(value)};`);
    lines.push('}');
  }
  return lines.join('\n') + '\n';
}
