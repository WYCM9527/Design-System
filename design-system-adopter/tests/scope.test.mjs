// node --test tests/scope.test.mjs：范围根生成——顶层切分、at-rule 提升、根选择器改写、括号平衡；命令端到端。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitTopLevel, scopeWrap, rewriteRootSelectors } from '../scripts/lib/scope.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = join(HERE, '../scripts/ds.mjs');
const SEED = resolve(HERE, '../../citrine/seeds/brand-yellow-e');

test('splitTopLevel：字符串 / 注释里的括号与分号不干扰切分', () => {
  const css = `@import "a;b.css";\n/* } 注释 { */\n.a { content: "{"; color: red; }\n@media (x) { .b { c: d } }`;
  const parts = splitTopLevel(css);
  assert.deepEqual(parts.map((p) => p.name), ['import', null, 'media']);
});

test('rewriteRootSelectors：:root / :root.dark / html → :scope，不碰 .html 类名与值', () => {
  assert.equal(rewriteRootSelectors(':root { --a: 1 }'), ':scope { --a: 1 }');
  assert.equal(rewriteRootSelectors(':root.dark { --a: 2 }'), ':scope.dark { --a: 2 }');
  assert.equal(rewriteRootSelectors('html { font: x }\nhtml.dark .a { }'), ':scope { font: x }\n:scope.dark .a { }');
  assert.equal(rewriteRootSelectors('.html-view { a: b }'), '.html-view { a: b }');
});

test('scopeWrap：提升 @import / @theme / @keyframes / @layer 语句，其余包进 @scope，括号平衡', () => {
  const css = `@import "x.css";\n@theme inline { --color-a: var(--a); }\n@layer base, components;\n@keyframes spin { to { transform: rotate(1turn) } }\n:root { --a: 1 }\n@layer base { * { border-color: var(--b) } }\n@media (max-width: 768px) { html { --m: 1 } .x { d: e } }`;
  const { text, hoisted } = scopeWrap(css, 'citrine');
  assert.deepEqual(hoisted.sort(), ['import', 'keyframes', 'layer', 'theme']);
  assert.ok(text.startsWith('@import "x.css";'));
  assert.ok(text.indexOf('@theme inline') < text.indexOf('@scope (html.citrine)'));
  assert.match(text, /@scope \(html\.citrine\) \{[\s\S]*:scope \{ --a: 1 \}/);
  assert.match(text, /@layer base \{ \* \{ border-color/);   // 块形式的 @layer 留在 scope 内
  assert.match(text, /@media \(max-width: 768px\) \{ :scope \{ --m: 1 \}/);
  assert.equal((text.match(/{/g) || []).length, (text.match(/}/g) || []).length);
});

test('ds.mjs scope 命令：从种子生成范围包，四文件 + 清单，含 :scope 与 @scope 头', () => {
  const to = join(mkdtempSync(join(tmpdir(), 'ds-scope-')), 'scoped');
  const out = execFileSync('node', [DS, 'scope', '--system', SEED, '--root', 'citrine', '--to', to, '--with', 'element-plus', '--project', dirname(to)], { encoding: 'utf8' });
  assert.match(out, /范围包 @scope \(html\.citrine\)/);
  for (const f of ['index.css', 'recipes.css', 'element-plus.css', 'iconpark.css', 'scope.manifest.json']) assert.ok(existsSync(join(to, f)), f);
  const idx = readFileSync(join(to, 'index.css'), 'utf8');
  assert.match(idx, /@scope \(html\.citrine\) \{/);
  assert.match(idx, /:scope \{/);
  assert.ok(!/(^|[\s{}])\:root\b/.test(idx.replace(/\/\*[\s\S]*?\*\//g, '')), 'index.css 里不该再有 :root 选择器');
  assert.match(out, /router\.beforeEach/);
});
