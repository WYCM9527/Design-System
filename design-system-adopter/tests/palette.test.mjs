// node --test tests/palette.test.mjs：调色盘（颜色主题）——init --palette、palette 换色 / 列表 / 拦截、status、adopt 认出颜色、
// upgrade 时调色盘管的键不进三方合并（摘下再比、合并完按新版本重套）、export / scope --palette。种子用 Morganite（带 palettes 段）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPalette, loadPalette, paletteContext, tokenFiles } from '../scripts/lib/palette.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = join(HERE, '../scripts/ds.mjs');
const SEED = resolve(HERE, '../../morganite/seeds/morganite');
const tmp = () => mkdtempSync(join(tmpdir(), 'adopter-palette-'));
const copySeed = (to) => cpSync(SEED, to, { recursive: true, filter: (src) => !/[\\/](node_modules|shots)([\\/]|$)/.test(src) });
const readJ = (f) => JSON.parse(readFileSync(f, 'utf8'));
const writeJ = (f, v) => writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const FILES = Object.values(tokenFiles({ theme: 'dark' }));

function project({ palette, unofficial, crlf } = {}) {
  const proj = tmp();
  execFileSync('git', ['init', '-q'], { cwd: proj });
  copySeed(join(proj, 'downloaded-seed'));
  if (crlf) for (const f of FILES) { const p = join(proj, 'downloaded-seed', f); writeFileSync(p, readFileSync(p, 'utf8').replace(/\r?\n/g, '\r\n')); }
  const run = (a) => execFileSync('node', [DS, ...a, '--project', proj], { encoding: 'utf8', stdio: 'pipe' });
  const fails = (a) => { try { run(a); } catch (e) { return { code: e.status, out: `${e.stdout}${e.stderr}` }; } assert.fail(`应该失败：${a.join(' ')}`); };
  const init = ['init', '--system', 'downloaded-seed', '--stack', 'element-plus', ...(palette ? ['--palette', palette] : []), ...(unofficial ? ['--unofficial'] : [])];
  return { proj, run, fails, initOut: run(init) };
}
const brand500 = (proj) => readJ(join(proj, 'design-system/tokens/primitives.tokens.json')).color.brand['500'].$value.hex;
const sameAsSnapshot = (proj) => FILES.every((f) => readFileSync(join(proj, f), 'utf8') === readFileSync(join(proj, 'design-systems/morganite', f), 'utf8'));

test('init --palette：官方颜色直接套进工作副本并记进清单；清单外的颜色要 --unofficial', () => {
  const { proj, initOut, fails } = project({ palette: 'blue' });
  assert.match(initOut, /颜色：「蓝」（blue）——已套进工作副本的 token/);
  assert.equal(brand500(proj), '#1447E6');
  assert.equal(readJ(join(proj, 'design-system/.adopter.json')).palette, 'blue');
  assert.equal(readJ(join(proj, 'design-systems/morganite/design-system/tokens/primitives.tokens.json')).color.brand['500'].$value.hex, '#B98D44', '快照保持默认颜色');

  const blocked = tmp();
  execFileSync('git', ['init', '-q'], { cwd: blocked });
  copySeed(join(blocked, 'downloaded-seed'));
  let code = 0, out = '';
  try { execFileSync('node', [DS, 'init', '--system', 'downloaded-seed', '--stack', 'element-plus', '--palette', 'orange', '--project', blocked], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { code = e.status; out = e.stderr; }
  assert.equal(code, 2);
  assert.match(out, /不是 Morganite 玫瑰金 的官方颜色/);
  assert.ok(!existsSync(join(blocked, 'design-system')), '被拦下时不落任何文件');
  assert.match(fails(['palette', 'nope']).out, /没有调色盘 nope/);

  const tried = project({ palette: 'orange', unofficial: true });
  assert.equal(readJ(join(tried.proj, 'design-system/.adopter.json')).palette, 'orange');
});

test('palette：列表标出当前颜色；换色只动 token 源；换回默认颜色与快照逐字相同；status 不把换色算成本地修改', () => {
  const { proj, run, fails } = project();
  assert.ok(sameAsSnapshot(proj));
  const list = run(['palette', '--list']);
  assert.match(list, /● rose-gold/);
  assert.match(list, /官方：[\s\S]*citrine[\s\S]*只在效果预览里试[\s\S]*orange/);
  assert.match(list, /\?palette=<颜色>/);

  assert.match(fails(['palette', 'orange']).out, /--unofficial/);
  const dry = run(['palette', 'citrine', '--dry-run']);
  assert.match(dry, /\[dry-run\] 「玫瑰金」（rose-gold，默认） → 「黄晶黄」（citrine）/);
  assert.match(dry, /已批准的对比度例外/);
  assert.ok(sameAsSnapshot(proj), 'dry-run 不写文件');

  const out = run(['palette', 'citrine']);
  assert.match(out, /改 3 个 token 文件/);
  assert.equal(brand500(proj), '#F9CF00');
  const sem = readJ(join(proj, 'design-system/tokens/semantic.tokens.json'));
  assert.equal(sem.color.text.link.$value, '{color.neutral.700}', '黄晶黄的链接用中性黑');
  assert.match(sem.color.text.link.$description, /调色盘「黄晶黄」/);
  assert.equal(readJ(join(proj, 'design-system/.adopter.json')).palette, 'citrine');
  const status = run(['status', '--offline']);
  assert.match(status, /颜色：「黄晶黄」（citrine）/);
  assert.match(status, /工作副本与快照一致（无本地修改，换颜色改的键不算）/);
  assert.match(run(['palette', 'citrine']), /已经是「黄晶黄」/);

  run(['palette', 'rose-gold']);
  assert.ok(sameAsSnapshot(proj), '换回默认颜色后三个 token 文件与快照逐字相同');
  assert.equal(readJ(join(proj, 'design-system/.adopter.json')).palette, undefined);
});

test('palette：CRLF 换行的 token 文件（Windows 上 git 检出）没手改就不拦；换色写回仍是 CRLF；status 不把换行算成本地修改', () => {
  const { proj, run } = project({ crlf: true });
  const isCrlf = () => FILES.every((f) => readFileSync(join(proj, f), 'utf8').includes('\r\n'));
  assert.ok(isCrlf());
  assert.match(run(['palette', 'citrine']), /改 3 个 token 文件/);
  assert.equal(brand500(proj), '#F9CF00');
  assert.ok(isCrlf(), '写回沿用文件原来的换行');
  assert.match(run(['status', '--offline']), /工作副本与快照一致（无本地修改，换颜色改的键不算）/);
  run(['palette', 'rose-gold']);
  assert.ok(sameAsSnapshot(proj), '换回默认颜色后与 CRLF 快照逐字相同');
});

test('palette：调色盘管的键被手改过就拦下（status 也报），--force 覆盖；adopt 能认出工作副本用的颜色', () => {
  const { proj, run, fails } = project({ palette: 'purple' });
  const prim = join(proj, 'design-system/tokens/primitives.tokens.json');
  const p = readJ(prim);
  p.color.brand['500'].$value = { colorSpace: 'srgb', components: [1, 0, 0], alpha: 1, hex: '#FF0000' };
  writeJ(prim, p);
  assert.match(run(['status', '--offline']), /⚠ 颜色记的是「紫」（purple），但工作副本里它管的品牌色 \/ 角色指向被手改过/);
  const blocked = fails(['palette', 'green']);
  assert.equal(blocked.code, 2);
  assert.match(blocked.out, /被手改过/);
  run(['palette', 'green', '--force']);
  assert.equal(brand500(proj), '#008236');

  rmSync(join(proj, 'design-system/.adopter.json'));
  rmSync(join(proj, 'downloaded-seed'), { recursive: true });
  assert.match(run(['adopt', '--system', 'morganite']), /颜色：工作副本用的是「绿」（green）/);
  assert.equal(readJ(join(proj, 'design-system/.adopter.json')).palette, 'green');
});

/** 造上游新版（patch+1）：改一个调色盘不管的 token、调色盘管的一档品牌色原语与一个角色的默认描述、蓝色调色盘的一档。 */
function nextSeed() {
  const up = join(tmp(), 'seed-next');
  copySeed(up);
  const id = readJ(join(up, 'design-system.json'));
  const next = id.version.replace(/(\d+)$/, (n) => String(Number(n) + 1));
  writeJ(join(up, 'design-system.json'), { ...id, version: next });
  const primFile = join(up, 'design-system/tokens/primitives.tokens.json');
  const prim = readJ(primFile);
  prim.color.brand['500'].$description = `上游改了品牌主色的说明（${next}）`;   // 不摘下调色盘的话，这里和本地的「蓝」说明是键级冲突
  writeJ(primFile, prim);
  const semFile = join(up, 'design-system/tokens/semantic.tokens.json');
  const sem = readJ(semFile);
  sem.color.text.primary.$description = `上游改了正文色描述（${next}）`;
  sem.color.text.link.$description = `上游改了链接的默认描述（${next}）`;
  writeJ(semFile, sem);
  const blueFile = join(up, 'palettes/blue.json');
  const blue = readJ(blueFile);
  blue.primitives['color.brand.900'] = '#0B1E5C';
  writeJ(blueFile, blue);
  return { up, next };
}

test('upgrade：换过颜色的项目正常升级不起冲突——调色盘管的键摘下再比，合并完按新版本的默认值与调色盘重套，本地改动保留', () => {
  const { proj, run } = project({ palette: 'blue' });
  const semFile = join(proj, 'design-system/tokens/semantic.tokens.json');
  const sem = readJ(semFile);
  sem.color.action['local-only'] = { $type: 'color', $value: '{color.brand.500}', $description: '本地新增' };
  writeJ(semFile, sem);
  const { up, next } = nextSeed();

  const dry = run(['upgrade', '--dry-run', '--from', up]);
  assert.match(dry, /颜色「蓝」（blue）：它管的品牌色与角色指向不进合并/);
  assert.match(dry, /上游调整了这套颜色（1 档品牌色、0 处指向）/);
  assert.doesNotMatch(dry, /冲突（\d+）/);

  const done = run(['upgrade', '--from', up]);
  assert.match(done, /已按新版本重套颜色「蓝」/);
  assert.match(done, new RegExp(`完成 .* → ${next.replaceAll('.', '\\.')}`));
  const after = readJ(semFile);
  assert.equal(after.color.action['local-only'].$description, '本地新增', '本地新增的 token 保留');
  assert.equal(after.color.text.primary.$description, `上游改了正文色描述（${next}）`, '调色盘不管的键取上游');
  assert.equal(readJ(join(proj, 'design-system/tokens/primitives.tokens.json')).color.brand['900'].$value.hex, '#0B1E5C', '调色盘本身的更新跟上');
  assert.equal(brand500(proj), '#1447E6');
  // 结果 = 新版本默认值套上新版蓝 + 本地新增，逐键一致
  const expected = join(tmp(), 'expected');
  cpSync(up, expected, { recursive: true });
  const ctx = paletteContext(expected);
  applyPalette(ctx, expected, loadPalette(ctx, 'blue'));
  const exp = readJ(join(expected, 'design-system/tokens/semantic.tokens.json'));
  exp.color.action['local-only'] = after.color.action['local-only'];
  assert.deepEqual(after, exp);
  for (const f of [FILES[0], FILES[2]]) assert.deepEqual(readJ(join(proj, f)), readJ(join(expected, f)), f);
  const m = readJ(join(proj, 'design-system/.adopter.json'));
  assert.equal(m.version, next);
  assert.equal(m.palette, 'blue');
  assert.match(run(['status', '--offline']), /工作副本相对快照的本地修改[^\n]*：\n\s+design-system\/tokens\/semantic\.tokens\.json\n/);
});

test('upgrade：有别的冲突时先套好颜色再退出 3；--resolve 重跑照样摘下、重套，颜色不丢', () => {
  const { proj, run } = project({ palette: 'blue' });
  const design = join(proj, 'design-system/DESIGN.md');
  writeFileSync(design, readFileSync(design, 'utf8') + '\n本地补充的一行。\n');
  const { up, next } = nextSeed();
  writeFileSync(join(up, 'design-system/DESIGN.md'), `<!-- ${next} -->\n` + readFileSync(join(up, 'design-system/DESIGN.md'), 'utf8'));
  let code = 0;
  try { run(['upgrade', '--from', up]); } catch (e) { code = e.status; }
  assert.equal(code, 3);
  const conflicts = readJ(join(proj, '.adopter-conflicts.json')).conflicts;
  assert.deepEqual(conflicts.map((c) => c.file), ['design-system/DESIGN.md'], '只有 DESIGN.md 冲突，token 文件不冲突');
  assert.equal(readJ(join(proj, 'design-system/tokens/primitives.tokens.json')).color.brand['900'].$value.hex, '#0B1E5C', '待决时颜色已按新版本套好');
  const dec = join(proj, 'decisions.json');
  writeJ(dec, { 'design-system/DESIGN.md': 'local' });
  const done = run(['upgrade', '--from', up, '--resolve', dec]);
  assert.match(done, /颜色「蓝」（blue）：它管的品牌色与角色指向不进合并/, '重跑时认得出「已是新颜色套在新默认值上」');
  assert.match(done, /完成/);
  assert.equal(brand500(proj), '#1447E6');
  assert.equal(readJ(join(proj, 'design-system/tokens/semantic.tokens.json')).color.text.primary.$description, `上游改了正文色描述（${next}）`);
  assert.match(readFileSync(design, 'utf8'), /本地补充的一行/);
});

test('upgrade：项目用的颜色在新版本里没了 → 升级前拦下，什么都不改', () => {
  const { proj, run } = project({ palette: 'blue' });
  const { up } = nextSeed();
  rmSync(join(up, 'palettes/blue.json'));
  let code = 0, err = '';
  try { run(['upgrade', '--from', up]); } catch (e) { code = e.status; err = e.stderr; }
  assert.equal(code, 2);
  assert.match(err, /新版本 .* 里没有本项目用的颜色 blue/);
  assert.equal(readJ(join(proj, 'design-system/.adopter.json')).version, readJ(join(SEED, 'design-system.json')).version);
});

test('export --palette：调色盘覆盖接在 token 文件末尾、版本头写明颜色；重导出沿用；换回默认颜色去掉覆盖', () => {
  const to = join(tmp(), 'static/morganite');
  const run = (a) => execFileSync('node', [DS, ...a], { encoding: 'utf8', stdio: 'pipe' });
  const out = run(['export', '--system', SEED, '--to', to, '--palette', 'cyan']);
  assert.match(out, /颜色「青」（cyan）/);
  const css = readFileSync(join(to, 'index.css'), 'utf8');
  assert.match(css.split('\n')[0], /index\.css · 颜色 青（cyan）/);
  assert.match(css, /\/\* 调色盘「青」（cyan）[^\n]*\*\/\n:root \{\n[^}]*--color-brand-500: #007595;/);
  const exported = readJ(join(to, 'design-system.export.json'));
  assert.equal(exported.palette, 'cyan');
  const cyan = readJ(join(SEED, 'palettes/cyan.json')).accept;
  assert.deepEqual(exported.accept.brand.hue, cyan.brand.hue, '验收口径的判色范围换成这套颜色的');
  assert.deepEqual(exported.accept.brand.allow, readJ(join(SEED, 'design-system.json')).accept.brand.allow, '允许位置照用身份文件的');
  assert.deepEqual(exported.accept.approvedContrast, cyan.approvedContrast);
  assert.equal(exported.accept.paletteName, '青');
  assert.doesNotMatch(readFileSync(join(to, 'recipes.css'), 'utf8'), /调色盘/);
  assert.match(run(['export', '--system', SEED, '--to', to]), /未变：index\.css/);
  let code = 0;
  try { run(['export', '--system', SEED, '--to', to, '--palette', 'lime']); } catch (e) { code = e.status; }
  assert.equal(code, 2, '清单外的颜色要 --unofficial');
  assert.match(run(['export', '--system', SEED, '--to', to, '--palette', 'rose-gold']), /更新：index\.css/);
  assert.doesNotMatch(readFileSync(join(to, 'index.css'), 'utf8'), /调色盘「/);
  const back = readJ(join(to, 'design-system.export.json'));
  assert.equal(back.palette, undefined);
  assert.deepEqual(back.accept.approvedContrast, readJ(join(SEED, 'design-system.json')).accept.approvedContrast, '默认颜色用身份文件登记的例外');
});

test('验收工具按项目当前颜色取口径：判色范围与跟颜色走的对比度例外换成调色盘的，允许位置照旧；export 目录同样认', async () => {
  const { brandFor } = await import('../../morganite/tools/lib/brand.mjs');
  const { approvedFor } = await import('../../morganite/tools/lib/approved.mjs');
  const identity = readJ(join(SEED, 'design-system.json')).accept;
  const blue = readJ(join(SEED, 'palettes/blue.json')).accept;
  const { proj, run } = project();
  const whys = (list) => list.map((x) => x.why);
  const before = brandFor({}, proj);
  assert.deepEqual(before.hue, identity.brand.hue);
  assert.deepEqual(whys(approvedFor('pages', {}, proj)), whys(identity.approvedContrast));
  run(['palette', 'blue']);
  const b = brandFor({}, proj);
  assert.deepEqual([b.hue, b.saturation, b.lightness], [blue.brand.hue, blue.brand.saturation, blue.brand.lightness]);
  assert.deepEqual(b.allow, before.allow, '允许位置照用身份文件的');
  assert.match(b.palette, /「蓝」/);
  assert.deepEqual(whys(approvedFor('components', { APPROVED_CONTRAST: [{ fg: '#000', why: '项目的' }] }, proj)), [...whys(blue.approvedContrast), '项目的']);
  assert.equal(brandFor({ BRAND: { hue: [351, 4] } }, proj).hue[0], 351, '色相可以跨 0°');
  const notBrand = brandFor({}, proj, join(SEED, 'design-system/dist')).notBrand.map((c) => c.join());
  assert.ok(notBrand.includes('9,88,217') && notBrand.includes('105,177,255'), '亮暗两种模式的信息蓝都不算品牌色');
  const to = join(tmp(), 'static');
  execFileSync('node', [DS, 'export', '--system', SEED, '--to', to, '--palette', 'blue'], { stdio: 'pipe' });
  const plain = tmp();
  assert.deepEqual(brandFor({}, plain, to).hue, blue.brand.hue, '非 Node 项目读 export 目录里的口径');
  assert.equal(approvedFor('pages', {}, plain, to).length, blue.approvedContrast.length, 'Morganite 的 export 项目不带 Citrine 内置例外');
});

test('scope --palette：没有工作副本 dist 时把调色盘覆盖一起包进 @scope；有工作副本 dist 时颜色跟工作副本，要换就拦下指向 ds.mjs palette', () => {
  const proj = tmp();
  const run = (a) => execFileSync('node', [DS, ...a, '--project', proj], { encoding: 'utf8', stdio: 'pipe' });
  run(['scope', '--system', SEED, '--root', 'morganite', '--to', 'src/styles/morganite-scoped', '--palette', 'green']);
  const css = readFileSync(join(proj, 'src/styles/morganite-scoped/index.css'), 'utf8');
  assert.match(css, /@scope \(html\.morganite\)/);
  assert.match(css, /:scope \{\n[^}]*--color-brand-500: #008236;/);
  assert.equal(readJ(join(proj, 'src/styles/morganite-scoped/scope.manifest.json')).palette, 'green');

  const { proj: adopted, fails } = project({ palette: 'blue' });
  cpSync(join(SEED, 'design-system/dist'), join(adopted, 'design-system/dist'), { recursive: true });
  const blocked = fails(['scope', '--root', 'morganite', '--to', 'src/styles/morganite-scoped', '--palette', 'green']);
  assert.equal(blocked.code, 2);
  assert.match(blocked.out, /颜色跟着工作副本（现在是 blue）：换色用 ds\.mjs palette green/);
});
