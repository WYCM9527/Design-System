#!/usr/bin/env node
// 调色盘体检：每个调色盘套到种子的临时副本上查一遍——
//   1. 格式：键给齐、指向存在、改指向的角色在身份文件 palettes.roles 名单里（lib/palette.mjs loadPalette）
//   2. steward 校验（validate-system.mjs）与对比度基线（check-contrast.mjs，亮、暗）
//   3. 品牌配对（scripts/lib/palette-checks.mjs BRAND_PAIRS，亮、暗）
//   4. 撞色：主色与错误 / 危险、警示、成功、信息、涨跌、图表第 6 色的 ΔE_OK
//   5. --build：用 style-dictionary 真构建一次，逐变量对比「种子 dist + 调色盘 CSS 覆盖」（预览面板与 ds.mjs export 用的就是这段覆盖）
//   6. 协调（scripts/lib/palette-checks.mjs HARMONY_PAIRS，亮、暗）：同一处的两个品牌色色相差不超过 HARMONY_HUE；图表浅品牌色和品牌色的明度差、鲜艳度在默认颜色那样的范围里
// 判定：和默认颜色同样不达标、颜色也相同 → 继承（不归调色盘管）；调色盘 contrastExceptions 登记过 → 例外（approved 区分已批 / 待批）；其余 → 不通过。
// 协调不过的，官方和仅预览的颜色都不通过；图表浅品牌色和别的图表色太近只提示。
// 官方名单里的调色盘更严：撞错误红 / 危险按钮不通过；有待批例外也不通过（用户拍板前加 --allow-pending 放行）。
// 用法：node scripts/check-palettes.mjs [--only a,b] [--build] [--json] [--allow-pending] [--steward <steward 目录>] [--contrast <check-contrast.mjs>]
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../design-system-adopter/scripts/lib/util.mjs';
import { applyPalette, listPalettes, loadPalette, paletteContext, paletteCss } from '../design-system-adopter/scripts/lib/palette.mjs';
import { classify, evaluatePalette, HARMONY_HUE, harmonyFailures, TINT_CHROMA, TINT_LIGHTNESS } from './lib/palette-checks.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = join(ROOT, 'morganite/seeds/morganite');
const args = parseArgs();
const STEWARD = resolve(args.steward || process.env.DS_STEWARD || join(ROOT, 'skills/design-system-steward'));
const CONTRAST = resolve(args.contrast || join(ROOT, 'skills/web-to-design-system/scripts/check-contrast.mjs'));
for (const [what, p] of [['steward', join(STEWARD, 'scripts/validate-system.mjs')], ['check-contrast.mjs', CONTRAST]]) {
  if (!existsSync(p)) { console.error(`找不到 ${what}：${p}\n先 git clone --depth 1 https://github.com/WYCM9527/skills.git skills（或用 --steward / --contrast 指定）`); process.exit(2); }
}

const ctx = paletteContext(SEED);
const only = typeof args.only === 'string' ? args.only.split(',') : null;
const work = mkdtempSync(join(tmpdir(), 'palette-check-'));

/** 种子 design-system/ 的干净副本（不带 dist 与预览截图），node_modules 链到种子的（构建要用 style-dictionary）。 */
function freshCopy(id) {
  const root = join(work, id);
  cpSync(join(SEED, 'design-system'), join(root, 'design-system'), { recursive: true, filter: (src) => !/[\\/]design-system[\\/](dist|preview)([\\/]|$)/.test(src.slice(SEED.length)) });
  if (existsSync(join(SEED, 'node_modules'))) symlinkSync(join(SEED, 'node_modules'), join(root, 'node_modules'), 'junction');
  return root;
}

function runJson(script, argv) {
  const r = spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  try { return JSON.parse(r.stdout); } catch { throw new Error(`${script} 没有输出 JSON（退出码 ${r.status}）：${(r.stderr || r.stdout).slice(0, 400)}`); }
}

function contrastRows(root) {
  const out = runJson(CONTRAST, ['--system', join(root, 'design-system'), '--json', '--soft']);
  return out.report.flatMap((m) => m.rows.map((r) => ({ mode: m.id === 'dark' ? 'dark' : 'light', fg: r.fg, bg: r.bg, min: r.minimum, label: r.label, fgHex: r.fgCss, bgHex: r.bgCss, ratio: r.ratio, pass: r.pass })));
}

/** CSS 文本 → 选择器 → { 变量: 值 }（只认种子产物这种平铺写法）。 */
function cssVars(text) {
  const out = {};
  for (const m of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decl = (out[m[1].trim()] ||= {});
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decl[d[1]] = d[2].trim();
  }
  return out;
}

function buildMatches(root, palette) {
  const out = join(root, 'out');
  const built = runJson(join(STEWARD, 'scripts/build-tokens.mjs'), ['--project', root, '--out', out]);
  if (!built.valid) return [`style-dictionary 构建失败：${JSON.stringify(built.issues || built).slice(0, 300)}`];
  const seed = cssVars(readFileSync(join(SEED, 'design-system/dist/index.css'), 'utf8'));
  const over = cssVars(paletteCss(palette, { comment: false }));
  const real = cssVars(readFileSync(join(out, 'index.css'), 'utf8'));
  const diffs = [];
  for (const sel of new Set([...Object.keys(seed), ...Object.keys(real)])) {
    const expect = { ...seed[sel], ...over[sel] };
    for (const k of new Set([...Object.keys(expect), ...Object.keys(real[sel] || {})])) if (expect[k] !== real[sel]?.[k]) diffs.push(`${sel} ${k}：覆盖得到 ${expect[k] ?? '（无）'}，真构建是 ${real[sel]?.[k] ?? '（无）'}`);
  }
  return diffs;
}

const modeTag = (mode) => (mode === 'dark' ? '暗' : '亮');
/** 协调不过的话，亮暗说的是同一句就并成一条：[[话, '亮' | '暗' | '亮暗'], …]。 */
function harmonyMessages(harmony) {
  const out = new Map();
  for (const h of harmonyFailures(harmony)) {
    const text = 'hue' in h
      ? `${h.label}：${h.fgHex} 和 ${h.bgHex} 色相差 ${h.hue}°（不超过 ${HARMONY_HUE}°），同一处的两个品牌色要是同一个色相`
      : `图表浅品牌色 ${h.hex} 和品牌色 ${h.baseHex} 明度差 ${h.lightness}（要 ${TINT_LIGHTNESS.join('–')}）、鲜艳度是品牌色的 ${h.chroma} 倍（不超过 ${TINT_CHROMA}），不像同一种颜色的深浅两档`;
    out.set(text, (out.get(text) || '') + modeTag(h.mode));
  }
  return [...out];
}

const baseline = { brand: evaluatePalette(ctx, null).rows, contrast: contrastRows(freshCopy('_baseline')) };
const results = [];
try {
  for (const entry of listPalettes(ctx)) {
    if (only && !only.includes(entry.id)) continue;
    const r = { id: entry.id, name: entry.name, official: entry.official, isDefault: entry.isDefault, swatch: entry.swatch, problems: [], exceptions: [], inherited: 0, collisions: [], chartNear: [] };
    results.push(r);
    let palette;
    try { palette = loadPalette(ctx, entry.id); } catch (e) { r.problems.push(e.message); continue; }
    r.moved = palette.semantic.size + palette.dark.size;
    const root = freshCopy(entry.id);
    applyPalette(ctx, root, palette);
    const valid = runJson(join(STEWARD, 'scripts/validate-system.mjs'), ['--project', root]);
    if (!valid.valid) r.problems.push(`steward 校验不过：${(valid.issues || []).filter((i) => i.severity !== 'warning').map((i) => i.message || i.code).join('；').slice(0, 400)}`);
    const { rows, collisions, harmony } = evaluatePalette(ctx, palette);
    const verdicts = [...classify(rows, baseline.brand, palette.contrastExceptions), ...classify(contrastRows(root), baseline.contrast, palette.contrastExceptions)];
    const seen = new Set();
    for (const v of verdicts) {
      const key = `${v.mode}|${v.fg}|${v.bg}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (v.status === 'inherited') r.inherited++;
      else if (v.status === 'exception') r.exceptions.push({ mode: v.mode, label: v.label, ratio: v.ratio, min: v.min, approved: v.approved, why: v.why });
      else r.problems.push(`[${v.mode === 'dark' ? '暗' : '亮'}] ${v.label}：${v.fg} ${v.fgHex} 压 ${v.bg} ${v.bgHex} 只有 ${v.ratio}:1（底线 ${v.min}）${v.why ? `；${v.why}` : ''}`);
    }
    for (const ex of palette.contrastExceptions) {
      if (!verdicts.some((v) => v.fg === ex.fg && v.bg === ex.bg && v.mode === (ex.mode || 'light'))) r.problems.push(`contrastExceptions 里 ${ex.fg} / ${ex.bg}（${ex.mode || 'light'}）已经达标，删掉这条登记`);
    }
    r.collisions = collisions;
    for (const [text, modes] of harmonyMessages(harmony)) r.problems.push(`[${modes}] 协调 · ${text}`);
    r.chartNear = harmony.near;
    if (entry.official) {
      for (const c of collisions.filter((x) => x.severity === 'severe')) r.problems.push(`[${c.mode === 'dark' ? '暗' : '亮'}] 主色 ${c.brandHex} 和${c.label} ${c.hex} 撞色（ΔE ${c.delta}）：红色系只放预览面板`);
      const pending = r.exceptions.filter((x) => !x.approved);
      if (pending.length && !args['allow-pending']) r.problems.push(`官方颜色还有 ${pending.length} 条例外没批：${pending.map((x) => `${x.label} ${x.ratio}:1`).join('；')}`);
    }
    if (args.build && !palette.isDefault) r.problems.push(...buildMatches(root, palette).slice(0, 8));
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

const failed = results.filter((r) => r.problems.length);
if (args.json) console.log(JSON.stringify({ seed: 'morganite/seeds/morganite', checked: results.length, failed: failed.length, results }, null, 2));
else {
  console.log(`调色盘体检 · ${ctx.identity.name}：${results.length} 个（默认 + ${results.length - 1}）${args.build ? '，含真构建对照' : ''}`);
  for (const r of results) {
    const tags = [r.isDefault ? '默认' : r.official ? '官方' : '仅预览', r.moved ? `改指向 ${r.moved}` : null, r.exceptions.length ? `例外 ${r.exceptions.length}（待批 ${r.exceptions.filter((x) => !x.approved).length}）` : null, r.inherited ? `继承 ${r.inherited}` : null].filter(Boolean).join(' · ');
    console.log(`${r.problems.length ? '✘' : '✔'} ${r.id.padEnd(12)} ${r.name} ${r.swatch || ''}  ${tags}`);
    for (const c of r.collisions) console.log(`    ${c.severity === 'severe' ? '撞色' : '提示'} [${modeTag(c.mode)}] 主色和${c.label} ${c.hex} 很近（ΔE ${c.delta}）`);
    for (const n of r.chartNear) console.log(`    提示 [${modeTag(n.mode)}] 图表浅品牌色 ${n.hex} 和${n.label} ${n.otherHex} 很近（ΔE ${n.delta}），环形图里挨着放会分不太清`);
    for (const p of r.problems) console.log(`    ✘ ${p}`);
  }
  console.log(failed.length ? `\n${failed.length} 个不通过。` : '\n全部通过。');
}
process.exitCode = failed.length ? 1 : 0;
