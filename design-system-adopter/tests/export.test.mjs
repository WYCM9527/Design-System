// node --test tests/export.test.mjs：纯 CSS 交付——导出、重导出未变、手改拦截、--force、--with 可选组。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = join(HERE, '../scripts/ds.mjs');
const SEED = resolve(HERE, '../../citrine/seeds/brand-yellow-e');
const run = (a, opts = {}) => execFileSync('node', [DS, ...a], { encoding: 'utf8', ...opts });

test('export：核心两文件 + 清单 + 版本头；重导出未变；手改拦截（退出 3）；--force 覆盖；--with 加桥接', () => {
  const to = join(mkdtempSync(join(tmpdir(), 'ds-export-')), 'static/citrine');
  const out = run(['export', '--system', SEED, '--to', to]);
  assert.match(out, /新增：index\.css, recipes\.css/);
  assert.match(out, /接线（按顺序 <link>）/);
  for (const f of ['index.css', 'recipes.css', 'design-system.export.json']) assert.ok(existsSync(join(to, f)), f);
  const head = readFileSync(join(to, 'index.css'), 'utf8').split('\n')[0];
  assert.match(head, /Citrine 黄晶（citrine）\d+\.\d+\.\d+ · index\.css · design-system-adopter export/);
  assert.match(readFileSync(join(to, 'index.css'), 'utf8'), /--color-action-primary/);
  const manifest = JSON.parse(readFileSync(join(to, 'design-system.export.json'), 'utf8'));
  assert.equal(manifest.system, 'citrine');
  assert.deepEqual(Object.keys(manifest.files).sort(), ['index.css', 'recipes.css']);

  // 重导出：未变
  assert.match(run(['export', '--system', SEED, '--to', to]), /未变：index\.css, recipes\.css/);

  // 手改导出文件 → 拦截
  appendFileSync(join(to, 'recipes.css'), '\n/* 手改 */\n');
  let code = 0;
  try { run(['export', '--system', SEED, '--to', to]); } catch (e) { code = e.status; }
  assert.equal(code, 3);

  // --force 覆盖 + --with 加 Element 桥接组
  const forced = run(['export', '--system', SEED, '--to', to, '--force', '--with', 'element-plus']);
  assert.match(forced, /新增：element-plus\.css, iconpark\.css/);
  assert.ok(!readFileSync(join(to, 'recipes.css'), 'utf8').includes('/* 手改 */'));
  assert.ok(existsSync(join(to, 'element-plus.css')));

  // 不存在的可选组
  let bad = 0;
  try { run(['export', '--system', SEED, '--to', to, '--with', 'antd']); } catch (e) { bad = e.status; }
  assert.equal(bad, 2);
});
