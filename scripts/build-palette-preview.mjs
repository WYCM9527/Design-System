#!/usr/bin/env node
// 给效果预览的规范调节面板生成两个文件（生成物，不要手改）：
//   palettes.css    每个调色盘一段 :root:where([data-palette="<id>"]) 覆盖，接在种子 dist 后面；特异度与种子的 :root / :root.dark 相同，靠先后顺序生效
//   panel-data.js   面板用的数据：调色盘清单（官方 / 仅预览、色阶、改指向、例外、撞色）、全部 token 的路径与说明、调值分组
// 用 classic script 而不是 fetch JSON：直接双击打开 index.html（file://）也能用。
// 用法：node scripts/build-palette-preview.mjs [--check（与文件不一致退出 1，CI 用）]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../design-system-adopter/scripts/lib/util.mjs';
import { cssVar, getNode, listPalettes, loadPalette, paletteContext, paletteCss } from '../design-system-adopter/scripts/lib/palette.mjs';
import { BRAND_PAIRS, evaluatePalette } from './lib/palette-checks.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = join(ROOT, 'morganite/seeds/morganite');
const PREVIEW = join(ROOT, 'morganite/previews/rose-gold-admin');
const GENERATOR = 'scripts/build-palette-preview.mjs';
const args = parseArgs();
const ctx = paletteContext(SEED);

const GROUPS = [
  { id: 'radius', label: '圆角', unit: 'px', paths: ['radius.xs', 'radius.sm', 'radius.md', 'radius.lg', 'radius.xl'] },
  { id: 'space', label: '间距', unit: 'px', paths: ['space.inline', 'space.stack', 'space.gutter', 'space.card', 'table.cell.padding-y', 'table.cell.padding-x'] },
  { id: 'font', label: '字号', unit: 'px', paths: ['font.size.sm', 'font.size.md', 'font.size.lg', 'font.size.xl', 'font.size.2xl', 'font.size.3xl', 'font.size.4xl'] },
  { id: 'control', label: '控件高度', unit: 'px', paths: ['size.control.xs', 'size.control.sm', 'size.control.md', 'size.control.lg'] }
];

const short = (text) => {
  const s = String(text || '').replace(/^\[[^\]]+\]\s*/, '').split(/[；。（(]/)[0].trim();
  return s.length > 42 ? `${s.slice(0, 41)}…` : s;
};
const refOf = (node) => {
  const v = node?.get('$value');
  return typeof v === 'string' && /^\{.+\}$/.test(v) ? v.slice(1, -1) : null;
};

/** 全部 token：变量名 → [路径, 层（p 原语 / s 语义）, 类型, 一句话说明, 亮色指向, 暗色指向]。 */
function tokenTable() {
  const out = {};
  const walk = (tree, layer, prefix = []) => {
    for (const [k, v] of tree) {
      if (k.startsWith('$') || !(v instanceof Map)) continue;
      const path = [...prefix, k];
      if (v.has('$value')) {
        const p = path.join('.');
        const dark = layer === 's' ? getNode(ctx.defaults.dark, p) : null;
        out[cssVar(p)] = [p, layer, v.get('$type') || '', short(v.get('$description')), refOf(v), dark?.has?.('$value') ? refOf(dark) : null];
      } else walk(v, layer, path);
    }
  };
  walk(ctx.defaults.primitives, 'p');
  walk(ctx.defaults.semantic, 's');
  return out;
}

const labelOf = (fg, bg) => BRAND_PAIRS.find(([f, b]) => f === fg && b === bg)?.[3] || `${fg} / ${bg}`;
const plainRoles = (map) => Object.fromEntries([...map].map(([k, { value }]) => [k, value.slice(1, -1)]));

const tokens = tokenTable();
for (const g of GROUPS) for (const p of g.paths) if (!tokens[cssVar(p)]) throw new Error(`调值分组里的 ${p} 在种子里不存在`);
const palettes = listPalettes(ctx).map((entry) => {
  const p = loadPalette(ctx, entry.id);
  const { collisions } = evaluatePalette(ctx, p);
  return {
    id: p.id,
    name: p.name,
    official: p.official,
    isDefault: p.isDefault,
    swatch: p.swatch,
    file: p.isDefault ? null : p.file,
    ladder: p.isDefault ? null : Object.fromEntries(p.primitives),
    semantic: plainRoles(p.semantic),
    dark: plainRoles(p.dark),
    notes: p.notes || [],
    exceptions: (p.contrastExceptions || []).map((e) => ({ mode: e.mode || 'light', label: labelOf(e.fg, e.bg), min: e.min, approved: e.approved === true, why: e.why })),
    collisions: collisions.map((c) => ({ mode: c.mode, label: c.label, delta: c.delta, severity: c.severity }))
  };
});

const data = {
  generatedBy: GENERATOR,
  system: ctx.identity.id,
  name: ctx.identity.name,
  version: ctx.identity.version,
  defaultId: ctx.settings.defaultId,
  brand: ctx.brand.map(cssVar),
  groups: GROUPS.map((g) => ({ id: g.id, label: g.label, unit: g.unit, vars: g.paths.map(cssVar) })),
  palettes,
  tokens
};

const css = [
  `/* ${ctx.identity.name} · 调色盘覆盖（效果预览用；生成物：node ${GENERATOR}）。`,
  '   <html data-palette="<id>"> 切换；默认颜色不写，种子 dist 就是它。每段只换品牌色原语与少量角色指向，规则与 ds.mjs palette 套到项目里的一致。 */',
  ...palettes.filter((p) => !p.isDefault).map((p) => paletteCss(loadPalette(ctx, p.id), { root: `:root:where([data-palette="${p.id}"])`, dark: `:root.dark:where([data-palette="${p.id}"])`, comment: false }).trimEnd())
].join('\n') + '\n';
const js = `/* ${ctx.identity.name} · 规范调节面板的数据（生成物：node ${GENERATOR}）。tokens 每项为 [路径, 层 p 原语 / s 语义, 类型, 说明, 亮色指向, 暗色指向]。 */\nwindow.MorganitePanelData = ${JSON.stringify(data, null, 1)};\n`;

let stale = 0;
for (const [file, text] of [['palettes.css', css], ['panel-data.js', js]]) {
  const path = join(PREVIEW, file);
  const same = existsSync(path) && readFileSync(path, 'utf8') === text;
  if (same) { console.log(`不变 ${file}`); continue; }
  stale++;
  if (args.check) console.log(`过期 ${file}`);
  else { writeFileSync(path, text); console.log(`已写 ${file}（${(text.length / 1024).toFixed(1)} KB）`); }
}
if (args.check && stale) {
  console.error(`效果预览的调色盘文件过期：跑 node ${GENERATOR} 重新生成后一起提交。`);
  process.exitCode = 1;
}
