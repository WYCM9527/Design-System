// node --test scripts/tests/palette-harmony.test.mjs：换色协调——只换色相不变亮度、收进色域、图表浅品牌色照默认颜色的关系算、
// 体检「协调」认得出原来的问题（黄底红棕字、琥珀暗色深红底黄字、淡蓝的图表浅色），种子里的调色盘都过。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNode, listPalettes, loadPalette, normalizePalette, paletteContext } from '../../design-system-adopter/scripts/lib/palette.mjs';
import { deltaE, fitGamut, luminance, oklchToRgb, parseHex, rgbToOklch, rotateHue, toHex } from '../lib/color.mjs';
import { chartTint, evaluatePalette, harmonyFailures, hueGap, TINT_MAX_LIGHTNESS, tintRelation, tintSlot } from '../lib/palette-checks.mjs';

const SEED = resolve(dirname(fileURLToPath(import.meta.url)), '../../morganite/seeds/morganite');
const ctx = paletteContext(SEED);
const rawOf = (id) => JSON.parse(readFileSync(join(SEED, 'palettes', `${id}.json`), 'utf8'));
const lch = (hex) => rgbToOklch(parseHex(hex.slice(0, 7)));
/** 调色盘文件改几档原语后的归一化对象（半透明档跟着它的底色）。 */
function withPrimitives(id, changes) {
  const raw = rawOf(id);
  Object.assign(raw.primitives, changes);
  for (const [slot, [from, alpha]] of Object.entries({ '300-a10': ['300', 0.1], '600-a10': ['600', 0.1] })) raw.primitives[`color.brand.${slot}`] = toHex({ ...parseHex(raw.primitives[`color.brand.${from}`]), a: alpha });
  return normalizePalette(ctx, raw);
}
const failed = (palette) => harmonyFailures(evaluatePalette(ctx, palette).harmony).map((r) => `${r.mode}|${r.label ?? '图表浅品牌色'}`);

test('rotateHue：只换色相，亮度不变（对比度跟着不变）', () => {
  for (const [hex, hue] of [['#FFB900', 63.4], ['#733E0A', 83], ['#432004', 83]]) {
    const out = rotateHue(hex, hue);
    assert.ok(Math.abs(luminance(parseHex(out)) - luminance(parseHex(hex))) < 0.002, `${hex} → ${out} 亮度变了`);
    assert.ok(hueGap(lch(out)[2], hue) < 2, `${hex} → ${out} 色相 ${lch(out)[2].toFixed(1)}，要 ${hue}`);
  }
});

test('fitGamut：超出 sRGB 的颜色只降鲜艳度，明度、色相不变', () => {
  const [L, C, H] = fitGamut([0.7, 0.4, 140]);
  assert.ok(C < 0.4 && C > 0.1, `C = ${C}`);
  const back = rgbToOklch(oklchToRgb([L, C, H]));
  assert.ok(Math.abs(back[0] - L) < 0.002 && Math.abs(back[1] - C) < 0.003 && hueGap(back[2], H) < 1, `回读 ${back.map((v) => v.toFixed(3))}`);
});

test('图表浅品牌色：关系取自默认颜色，默认颜色按规则算出来和它自己的 200 档肉眼一样', () => {
  const rel = tintRelation(ctx);
  assert.ok(Math.abs(rel.lightness - 0.126) < 0.003 && Math.abs(rel.chroma - 0.84) < 0.01, JSON.stringify(rel));
  assert.equal(tintSlot(ctx), 'color.brand.200');
  const seed = Object.fromEntries(ctx.brand.map((k) => [k, getNode(ctx.defaults.primitives, k).get('$value').get('hex')]));
  const tint = chartTint(ctx, seed, rel);
  assert.ok(deltaE(parseHex(tint), parseHex(seed['color.brand.200'])) < 0.01, `${tint} 和 ${seed['color.brand.200']} 差太多`);
});

test('图表浅品牌色：生成的调色盘都按规则算；品牌色太浅的往深取', () => {
  const rel = tintRelation(ctx);
  const deeper = [];
  for (const { id, isDefault } of listPalettes(ctx)) {
    if (isDefault) continue;
    const { primitives } = rawOf(id);
    assert.equal(primitives['color.brand.200'], chartTint(ctx, primitives, rel), `${id} 的 200 档不是按规则算的`);
    const [p, t] = [lch(primitives['color.brand.500']), lch(primitives['color.brand.200'])];
    assert.equal(t[0] < p[0], p[0] + rel.lightness > TINT_MAX_LIGHTNESS, `${id}：品牌色明度 ${p[0].toFixed(2)}，浅品牌色 ${t[0].toFixed(2)}`);
    if (t[0] < p[0]) deeper.push(id);
  }
  assert.deepEqual(deeper.sort(), ['citrine', 'lime', 'yellow']);
});

test('协调：默认颜色和种子里的调色盘都过', () => {
  for (const { id } of listPalettes(ctx)) assert.deepEqual(failed(loadPalette(ctx, id)), [], `${id} 没过协调`);
});

test('协调：认得出黄底红棕字、琥珀暗色深红底黄字', () => {
  const yellow = failed(withPrimitives('yellow', { 'color.brand.700': '#A65F00', 'color.brand.800': '#733E0A', 'color.brand.900': '#432004' }));
  assert.ok(yellow.includes('light|主按钮文字 / 填充') && yellow.includes('dark|侧栏当前项文字 / 底'), yellow.join('，'));
  const amber = failed(withPrimitives('amber', { 'color.brand.300': '#FFB900' }));
  assert.ok(amber.includes('dark|侧栏当前项文字 / 底') && amber.includes('dark|选中文字 / 选中浅底'), amber.join('，'));
});

test('协调：图表浅品牌色离品牌色太远（原来的淡蓝 #8EC5FF）不过；太近别的图表色只提示', () => {
  assert.deepEqual(failed(withPrimitives('blue', { 'color.brand.200': '#8EC5FF' })), ['light|图表浅品牌色', 'dark|图表浅品牌色']);
  const green = evaluatePalette(ctx, loadPalette(ctx, 'green')).harmony;
  assert.deepEqual(harmonyFailures(green), []);
  assert.ok(green.near.some((n) => n.mode === 'light' && n.role === 'color.chart.6'), '绿的浅品牌色和图表绿该有提示');
});
