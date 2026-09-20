// node --test tests/ci.test.mjs：ds.mjs ci——adopter 在项目内、有清单与 accept.config 时写出 GitHub Actions 门禁；缺 accept.config 报错；--no-accept 只做 guard；不覆盖已存在文件。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SEED = resolve(HERE, '../../citrine/seeds/brand-yellow-e');

function project() {
  const p = mkdtempSync(join(tmpdir(), 'ds-ci-'));
  cpSync(resolve(HERE, '..'), join(p, '.cursor/skills/design-system-adopter'), { recursive: true, filter: (src) => !src.includes('node_modules') && !src.includes('/tests/') });
  writeFileSync(join(p, 'package.json'), JSON.stringify({ name: 'ci-sim', private: true, scripts: { build: 'echo build' }, dependencies: { 'element-plus': '^2' } }));
  writeFileSync(join(p, 'package-lock.json'), '{}');
  cpSync(SEED, join(p, 'vendor/citrine'), { recursive: true });
  const DS = join(p, '.cursor/skills/design-system-adopter/scripts/ds.mjs');
  const run = (a, opts = {}) => execFileSync('node', [DS, ...a, '--project', p], { encoding: 'utf8', ...opts });
  run(['init']);   // system / stack 自动推断
  return { p, run };
}

test('ci：缺 accept.config 报错并指模板；--no-accept 只做 guard；有清单时写出含验收步骤的工作流；不覆盖', () => {
  const { p, run } = project();
  assert.throws(() => run(['ci']), /accept\.config\.mjs/);
  const dry = run(['ci', '--no-accept', '--dry-run']);
  assert.match(dry, /name: Design System/); assert.match(dry, /status --offline --strict/); assert.match(dry, /guard\.mjs/); assert.match(dry, /npm ci/); assert.doesNotMatch(dry, /citrine-accept/);
  assert.match(dry, /A=\.cursor\/skills\/design-system-adopter\/scripts\/ds\.mjs/);
  writeFileSync(join(p, 'accept.config.mjs'), readFileSync(join(p, 'design-systems/citrine/templates/accept.config.mjs'), 'utf8'));
  const out = run(['ci']);
  assert.match(out, /已写 \.github\/workflows\/design-system\.yml/);
  const yml = readFileSync(join(p, '.github/workflows/design-system.yml'), 'utf8');
  assert.match(yml, /npx citrine-accept all/); assert.match(yml, /upload-artifact/); assert.match(yml, /fonts-noto-cjk/); assert.match(yml, /"status": "current"/);
  assert.throws(() => run(['ci']), /已存在/);
  assert.match(run(['ci', '--force']), /已写/);
});

test('ci：adopter 在项目外时拒绝并给拷贝命令', () => {
  const p = mkdtempSync(join(tmpdir(), 'ds-ci-out-'));
  writeFileSync(join(p, 'package.json'), JSON.stringify({ name: 'x', dependencies: { 'element-plus': '^2' } }));
  cpSync(SEED, join(p, 'vendor/citrine'), { recursive: true });
  const DS = resolve(HERE, '../scripts/ds.mjs');
  execFileSync('node', [DS, 'init', '--project', p], { encoding: 'utf8' });
  assert.throws(() => execFileSync('node', [DS, 'ci', '--project', p], { encoding: 'utf8', stdio: 'pipe' }), /adopter 装在项目外/);
});
