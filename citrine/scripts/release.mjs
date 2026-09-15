#!/usr/bin/env node
// GitHub Release：从种子 CHANGELOG 取对应版本段落做 notes，附件 = 两个 npm pack 产物 + 纯 CSS 交付包（非 Node 项目直接下载，不用克隆仓库）。
// 用法：node citrine/scripts/release.mjs [--version 2.10.0] [--notes-only] [--dry-run]
//   默认版本 = 种子 design-system.json；tag 必须已存在（citrine-v<version>）；已有同名 Release 时更新 notes 与附件（--clobber）。
//   --notes-only：只建 / 更新 Release 说明，不打包附件（给历史版本补 Release 用——附件只能从当前工作树打包，历史版本不该附）。
// 依赖：gh 已登录；Node ≥ 22；tar。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SEED = join(ROOT, 'citrine/seeds/brand-yellow-e');
const TOOLS = join(ROOT, 'citrine/tools');
const ADOPTER = join(ROOT, 'design-system-adopter/scripts/ds.mjs');
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i === -1 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const identity = JSON.parse(readFileSync(join(SEED, 'design-system.json'), 'utf8'));
const version = opt('version') || identity.version;
const tag = `${identity.upstream.tagPrefix}${version}`;
const repo = identity.upstream.repo;
const dry = !!opt('dry-run'), notesOnly = !!opt('notes-only');
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...o }).trim();

// 1) CHANGELOG 段落
const changelog = readFileSync(join(SEED, 'CHANGELOG.md'), 'utf8');
const re = new RegExp(`^## ${version.replaceAll('.', '\\.')}[^\\n]*\\n([\\s\\S]*?)(?=^## \\d|(?![\\s\\S]))`, 'm');
const m = changelog.match(re);
if (!m) { console.error(`CHANGELOG 里没有 ${version} 的条目`); process.exit(2); }
const heading = changelog.match(new RegExp(`^## ${version.replaceAll('.', '\\.')}[^\\n]*`, 'm'))[0].replace(/^## /, '');
const notes = `${m[1].trim()}\n\n---\n接入 / 升级见 [docs/GUIDE.md](https://github.com/${repo}/blob/main/docs/GUIDE.md)；非 Node 项目直接下载附件里的 \`citrine-css-${version}.tgz\`（index.css + recipes.css，运行时零 Node）。`;

// 2) tag 存在性
try { sh('git', ['rev-parse', '--verify', `refs/tags/${tag}`]); } catch { console.error(`tag ${tag} 不存在：先打 tag 再发 Release`); process.exit(2); }

// 3) 附件
const assets = [];
if (!notesOnly) {
  const out = mkdtempSync(join(tmpdir(), 'citrine-release-'));
  const pack = (dir) => { const name = sh('npm', ['pack', '--pack-destination', out, '--silent'], { cwd: dir }).split('\n').pop(); return join(out, name); };
  assets.push(pack(SEED), pack(TOOLS));
  const cssDir = join(out, `citrine-css-${version}`); mkdirSync(cssDir);
  sh('node', [ADOPTER, 'export', '--system', SEED, '--to', cssDir, '--with', 'element-plus', '--project', out]);
  const cssTgz = join(out, `citrine-css-${version}.tgz`);
  const r = spawnSync('tar', ['-czf', cssTgz, '-C', out, `citrine-css-${version}`], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
  assets.push(cssTgz);
}

console.log(`Release ${tag}（${heading}）\n附件：${assets.length ? assets.map((a) => a.split('/').pop()).join(', ') : '（无）'}\n\n${notes.split('\n').slice(0, 6).join('\n')}\n…`);
if (dry) { console.log('\n[dry-run] 未调用 gh。'); process.exit(0); }

// 4) 创建或更新
const notesFile = join(mkdtempSync(join(tmpdir(), 'citrine-notes-')), 'notes.md'); writeFileSync(notesFile, notes);
const exists = spawnSync('gh', ['release', 'view', tag, '--repo', repo], { encoding: 'utf8' }).status === 0;
if (!exists) sh('gh', ['release', 'create', tag, '--repo', repo, '--title', `Citrine ${version}`, '--notes-file', notesFile, ...assets]);
else { sh('gh', ['release', 'edit', tag, '--repo', repo, '--title', `Citrine ${version}`, '--notes-file', notesFile]); if (assets.length) sh('gh', ['release', 'upload', tag, '--repo', repo, '--clobber', ...assets]); }
console.log(`\n${exists ? '已更新' : '已创建'}：https://github.com/${repo}/releases/tag/${tag}`);
