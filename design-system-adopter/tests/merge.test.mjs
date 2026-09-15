// node --test tests/merge.test.mjs：三方合并的键级 / 文件级行为，以及 init → 本地改 → upgrade --from 的端到端。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeJson, classify, resolveJsonConflict } from '../scripts/lib/merge.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = join(HERE, '../scripts/ds.mjs');
const SEED = resolve(HERE, '../../citrine/seeds/brand-yellow-e');
const tmp = () => mkdtempSync(join(tmpdir(), 'adopter-test-'));

test('mergeJson：本地未改 → 取上游；上游未改 → 留本地；不同键各取各的', () => {
  const base = { a: { x: 1, y: 2 }, b: 'old' };
  const local = { a: { x: 1, y: 3 }, b: 'old' };           // 本地改了 a.y
  const remote = { a: { x: 9, y: 2 }, b: 'new' };          // 上游改了 a.x 与 b
  const { merged, conflicts } = mergeJson(base, local, remote);
  assert.equal(conflicts.length, 0);
  assert.deepEqual(merged, { a: { x: 9, y: 3 }, b: 'new' });
});

test('mergeJson：同键两边改成不同值 = 冲突，先保持本地', () => {
  const { merged, conflicts } = mergeJson({ k: 1 }, { k: 2 }, { k: 3 });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].path, 'k');
  assert.equal(merged.k, 2);
});

test('mergeJson：两边改成同一个值不算冲突；单边新增 / 删除各自生效', () => {
  const base = { keep: 1, delLocal: 1, delRemote: 1 };
  const local = { keep: 2, delRemote: 1, addLocal: 'L' };   // 删 delLocal、加 addLocal、改 keep=2
  const remote = { keep: 2, delLocal: 1, addRemote: 'R' };  // 删 delRemote、加 addRemote、改 keep=2
  const { merged, conflicts } = mergeJson(base, local, remote);
  assert.equal(conflicts.length, 0);
  assert.deepEqual(merged, { keep: 2, addLocal: 'L', addRemote: 'R' });
});

test('mergeJson：两边新增同一键但值不同 = 冲突', () => {
  const { conflicts } = mergeJson({}, { n: 'a' }, { n: 'b' });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].base, undefined);
});

test('classify：文件级新增 / 删除 / 未变 / 单边改 / markdown 双边改', () => {
  const b = tmp(), l = tmp(), r = tmp();
  const W = (d, f, t) => { mkdirSync(dirname(join(d, f)), { recursive: true }); writeFileSync(join(d, f), t); };
  W(b, 'design-system/DESIGN.md', 'v1'); W(l, 'design-system/DESIGN.md', 'v1-local'); W(r, 'design-system/DESIGN.md', 'v1-remote');   // md 双边改 → 文件级冲突
  W(b, 'design-system/a.json', '{"x":1}'); W(l, 'design-system/a.json', '{"x":1}'); W(r, 'design-system/a.json', '{"x":2}');          // 本地未改 → updated
  W(b, 'design-system/gone.md', 'x'); W(l, 'design-system/gone.md', 'x');                                                              // 上游删除
  W(r, 'design-system/new.md', 'fresh');                                                                                                // 上游新增
  W(b, 'design-system/t.json', '{"c":{"p":1,"q":1}}'); W(l, 'design-system/t.json', '{"c":{"p":2,"q":1}}'); W(r, 'design-system/t.json', '{"c":{"p":1,"q":9}}'); // 键级可自动合并
  const files = ['design-system/DESIGN.md', 'design-system/a.json', 'design-system/gone.md', 'design-system/new.md', 'design-system/t.json'];
  const out = classify(b, l, r, files);
  assert.deepEqual(out.updated, ['design-system/a.json']);
  assert.deepEqual(out.added, ['design-system/new.md']);
  assert.deepEqual(out.removedUpstream, ['design-system/gone.md']);
  assert.equal(out.jsonMerges.length, 1);
  assert.match(out.jsonMerges[0].mergedText, /"p": 2/);
  assert.match(out.jsonMerges[0].mergedText, /"q": 9/);
  assert.equal(out.conflicts.length, 1);
  assert.equal(out.conflicts[0].kind, 'file');
});

test('resolveJsonConflict：按键决议 local / upstream / 字面值', () => {
  const base = JSON.stringify({ k1: 1, k2: 1 }), local = JSON.stringify({ k1: 2, k2: 2 }), remote = JSON.stringify({ k1: 3, k2: 3 });
  const { text, unresolved } = resolveJsonConflict(base, local, remote, { k1: 'upstream', k2: 42 });
  assert.equal(unresolved.length, 0);
  assert.deepEqual(JSON.parse(text), { k1: 3, k2: 42 });
});

test('端到端：init（folder）→ 本地改 token + DESIGN → upgrade --from 新版（键级合并 + md 冲突决议）', () => {
  const proj = tmp();
  execFileSync('git', ['init', '-q'], { cwd: proj });
  // 种子放进项目（模拟「下载文件夹」），init
  cpSync(SEED, join(proj, 'downloaded-seed'), { recursive: true });
  const run = (cmdArgs, opts = {}) => execFileSync('node', [DS, ...cmdArgs, '--project', proj], { encoding: 'utf8', ...opts });
  const out = run(['init', '--system', 'downloaded-seed', '--stack', 'element-plus']);
  assert.match(out, /已接入 Citrine/);
  assert.ok(existsSync(join(proj, 'design-systems/citrine/design-system.json')));
  assert.ok(existsSync(join(proj, 'design-system/.adopter.json')));
  // 本地改：semantic tokens 里加一个自有 token；DESIGN.md 追加一行
  const semPath = join(proj, 'design-system/tokens/semantic.tokens.json');
  const sem = JSON.parse(readFileSync(semPath, 'utf8'));
  sem.color.action['local-only'] = { $type: 'color', $value: '{color.brand.500}', $description: '本地新增' };
  writeFileSync(semPath, JSON.stringify(sem, null, 2) + '\n');
  writeFileSync(join(proj, 'design-system/DESIGN.md'), readFileSync(join(proj, 'design-system/DESIGN.md'), 'utf8') + '\n本地补充的一行。\n');
  // 造上游（当前版本 patch+1）：改同一个 tokens 文件的另一处 + 改 DESIGN.md 开头
  const cur = JSON.parse(readFileSync(join(SEED, 'design-system.json'), 'utf8')).version;
  const next = cur.replace(/(\d+)$/, (m) => String(Number(m) + 1));
  const up = join(tmp(), 'seed-next');
  cpSync(SEED, up, { recursive: true });
  const upId = JSON.parse(readFileSync(join(up, 'design-system.json'), 'utf8'));
  upId.version = next; writeFileSync(join(up, 'design-system.json'), JSON.stringify(upId, null, 2) + '\n');
  const upSem = JSON.parse(readFileSync(join(up, 'design-system/tokens/semantic.tokens.json'), 'utf8'));
  upSem.color.action.primary.$description = `上游改了描述（${next}）`;
  writeFileSync(join(up, 'design-system/tokens/semantic.tokens.json'), JSON.stringify(upSem, null, 2) + '\n');
  writeFileSync(join(up, 'design-system/DESIGN.md'), readFileSync(join(up, 'design-system/DESIGN.md'), 'utf8').replace(/^/, `<!-- ${next} -->\n`));
  // dry-run：tokens 应键级可自动并，DESIGN 应文件级冲突
  const dry = run(['upgrade', '--dry-run', '--from', up]);
  assert.match(dry, /JSON 键级自动合并/);
  assert.match(dry, /DESIGN\.md · 文件级/);
  // 真跑：不带决议 → 退出码 3 且写冲突清单
  let code = 0;
  try { run(['upgrade', '--from', up]); } catch (e) { code = e.status; }
  assert.equal(code, 3);
  const conflicts = JSON.parse(readFileSync(join(proj, '.adopter-conflicts.json'), 'utf8'));
  assert.equal(conflicts.conflicts.length, 1);
  // tokens 的自动合并已经落盘：本地新增与上游描述并存
  const mergedSem = JSON.parse(readFileSync(semPath, 'utf8'));
  assert.equal(mergedSem.color.action['local-only'].$description, '本地新增');
  assert.equal(mergedSem.color.action.primary.$description, `上游改了描述（${next}）`);
  // 决议：DESIGN.md 保留本地 → 完成升级
  const dec = join(proj, 'decisions.json');
  writeFileSync(dec, JSON.stringify({ 'design-system/DESIGN.md': 'local' }));
  const done = run(['upgrade', '--from', up, '--resolve', dec]);
  assert.match(done, new RegExp(`完成 ${cur.replaceAll('.', '\\.')} → ${next.replaceAll('.', '\\.')}`));
  const manifest = JSON.parse(readFileSync(join(proj, 'design-system/.adopter.json'), 'utf8'));
  assert.equal(manifest.version, next);
  assert.match(readFileSync(join(proj, 'design-system/DESIGN.md'), 'utf8'), /本地补充的一行/);
  assert.ok(!existsSync(join(proj, '.adopter-conflicts.json')));
  // 快照推进到 2.7.1
  assert.equal(JSON.parse(readFileSync(join(proj, 'design-systems/citrine/design-system.json'), 'utf8')).version, next);
});
