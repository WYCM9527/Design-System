#!/usr/bin/env node
// GitHub Release（任意系统）：从种子 CHANGELOG 取对应版本段落做 notes，附件 = 种子 npm pack + <id>/tools 的 npm pack（存在时）+ 纯 CSS 交付包
// <id>-css-<version>.tgz（index.css + 各桥接，非 Node 项目直接下载，不用克隆仓库）。
// 用法：node scripts/release.mjs --system <id> [--version x.y.z] [--notes-only] [--dry-run]
//   默认版本 = 种子 design-system.json；tag <id>-v<version> 必须已存在（dry-run 只警告）；已有同名 Release 时更新 notes 与附件（--clobber）。
//   --notes-only：只建 / 更新 Release 说明，不打包附件（给历史版本补 Release 用——附件只能从当前工作树打包，历史版本不该附）。
// 依赖：gh 已登录；Node ≥ 22；tar。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findSystem, ROOT } from './systems.mjs';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i === -1 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const id = opt('system');
if (typeof id !== 'string') { console.error('用法：node scripts/release.mjs --system <id> [--version x.y.z] [--notes-only] [--dry-run]'); process.exit(2); }
const system = findSystem(id);
if (!system) { console.error(`没有 id 为 ${id} 的系统（<id>/seeds/*/design-system.json）`); process.exit(2); }
const { identity, seedDir } = system;
const version = typeof opt('version') === 'string' ? opt('version') : identity.version;
const tag = `${identity.upstream.tagPrefix}${version}`;
const repo = identity.upstream.repo;
const dry = !!opt('dry-run'), notesOnly = !!opt('notes-only');
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...o }).trim();
const ADOPTER = join(ROOT, 'design-system-adopter/scripts/ds.mjs');

// 1) CHANGELOG 段落
const changelog = readFileSync(join(seedDir, 'CHANGELOG.md'), 'utf8');
const escaped = version.replaceAll('.', '\\.');
const m = changelog.match(new RegExp(`^## ${escaped}[^\\n]*\\n([\\s\\S]*?)(?=^## \\d|(?![\\s\\S]))`, 'm'));
if (!m) { console.error(`${system.seedRelative}/CHANGELOG.md 里没有 ${version} 的条目`); process.exit(2); }
const heading = changelog.match(new RegExp(`^## ${escaped}[^\\n]*`, 'm'))[0].replace(/^## /, '');
const optionalGroups = Object.keys(identity.export?.optional ?? {});
const cssName = `${id}-css-${version}.tgz`;
const notes = `${m[1].trim()}\n\n---\n接入 / 升级见 [docs/GUIDE.md](https://github.com/${repo}/blob/main/docs/GUIDE.md)；非 Node 项目直接下载附件里的 \`${cssName}\`（${(identity.export?.core ?? []).map((f) => f.split('/').pop()).join(' + ')}${optionalGroups.length ? ` + ${optionalGroups.join(' / ')} 桥接` : ''}，运行时零 Node）。`;

// 2) tag 存在性
let tagExists = true;
try { sh('git', ['rev-parse', '--verify', `refs/tags/${tag}`]); } catch { tagExists = false; }
if (!tagExists && !dry) { console.error(`tag ${tag} 不存在：先打 tag 再发 Release`); process.exit(2); }
if (!tagExists) console.log(`[dry-run] 注意：本地没有 tag ${tag}`);

// 3) 附件
const assets = [];
if (!notesOnly) {
  const out = mkdtempSync(join(tmpdir(), `${id}-release-`));
  const pack = (dir) => { const name = sh('npm', ['pack', '--pack-destination', out, '--silent'], { cwd: dir }).split('\n').pop(); return join(out, name); };
  assets.push(pack(seedDir));
  if (system.tools) assets.push(pack(system.tools.dir));
  if (identity.export?.core?.length) {
    const cssDir = join(out, `${id}-css-${version}`); mkdirSync(cssDir);
    sh('node', [ADOPTER, 'export', '--system', seedDir, '--to', cssDir, ...(optionalGroups.length ? ['--with', optionalGroups.join(',')] : []), '--project', out]);
    const cssTgz = join(out, cssName);
    const r = spawnSync('tar', ['-czf', cssTgz, '-C', out, `${id}-css-${version}`], { encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
    assets.push(cssTgz);
  }
}

console.log(`Release ${tag}（${heading}）\n附件：${assets.length ? assets.map((a) => a.split('/').pop()).join(', ') : '（无）'}\n\n${notes.split('\n').slice(0, 6).join('\n')}\n…`);
if (dry) { console.log('\n[dry-run] 未调用 gh。'); process.exit(0); }

// 4) 创建或更新
const notesFile = join(mkdtempSync(join(tmpdir(), `${id}-notes-`)), 'notes.md'); writeFileSync(notesFile, notes);
const title = `${identity.name} ${version}`;
const exists = spawnSync('gh', ['release', 'view', tag, '--repo', repo], { encoding: 'utf8' }).status === 0;
if (!exists) sh('gh', ['release', 'create', tag, '--repo', repo, '--title', title, '--notes-file', notesFile, ...assets]);
else { sh('gh', ['release', 'edit', tag, '--repo', repo, '--title', title, '--notes-file', notesFile]); if (assets.length) sh('gh', ['release', 'upload', tag, '--repo', repo, '--clobber', ...assets]); }
console.log(`\n${exists ? '已更新' : '已创建'}：https://github.com/${repo}/releases/tag/${tag}`);
