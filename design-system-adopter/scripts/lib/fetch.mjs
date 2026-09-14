// 上游获取：查最新 tag（GitHub API，git ls-remote 兜底）、按 ref 拉 codeload tarball 并解出子目录（系统 tar）。零依赖。
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { semverCompare } from './util.mjs';

const token = () => process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
const authHeaders = () => ({ 'user-agent': 'design-system-adopter', ...(token() ? { authorization: `Bearer ${token()}` } : {}) });

/** 最新 tag：API（带 token 支持私有库）→ git ls-remote（本机 git 凭证）兜底。返回 { tag, version } 或 null。 */
export async function latestTag(repo, prefix) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, { headers: authHeaders(), signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const tags = (await res.json()).map((t) => t.name).filter((n) => n.startsWith(prefix));
      if (tags.length) { const tag = tags.sort((a, b) => semverCompare(a.slice(prefix.length), b.slice(prefix.length))).at(-1); return { tag, version: tag.slice(prefix.length) }; }
    }
  } catch { /* 走 git 兜底 */ }
  try {
    const out = execFileSync('git', ['ls-remote', '--tags', `https://github.com/${repo}.git`, `refs/tags/${prefix}*`], { encoding: 'utf8', timeout: 20000 });
    const tags = [...out.matchAll(/refs\/tags\/([^\s^]+)$/gm)].map((m) => m[1]).filter((n) => n.startsWith(prefix));
    if (tags.length) { const tag = tags.sort((a, b) => semverCompare(a.slice(prefix.length), b.slice(prefix.length))).at(-1); return { tag, version: tag.slice(prefix.length) }; }
  } catch { /* 都失败 */ }
  return null;
}

/**
 * 拿 repo 在 ref（tag 名或分支名）的内容并解出 subpath 子目录，返回目录绝对路径。
 * 三条路依次尝试：API tarball（有 GITHUB_TOKEN / GH_TOKEN 时，覆盖私有库）→ 匿名 codeload（公开库）→ git clone --depth 1（本机 git 凭证，覆盖私有库无 token 的场景）。
 */
export async function downloadSubdir(repo, ref, subpath, label = 'upstream') {
  const tmp = mkdtempSync(join(tmpdir(), 'ds-adopter-'));
  const tgz = join(tmp, 'src.tar.gz');
  let ok = false, lastStatus = 0;
  const urls = [];
  if (token()) urls.push(`https://api.github.com/repos/${repo}/tarball/${ref}`);
  for (const kind of (ref.includes('/') ? ['refs/heads/' + ref] : [`refs/tags/${ref}`, `refs/heads/${ref}`])) urls.push(`https://codeload.github.com/${repo}/tar.gz/${kind}`);
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: url.startsWith('https://api.') ? authHeaders() : { 'user-agent': 'design-system-adopter' }, signal: AbortSignal.timeout(120000), redirect: 'follow' });
      lastStatus = res.status;
      if (res.ok) { writeFileSync(tgz, Buffer.from(await res.arrayBuffer())); ok = true; break; }
    } catch { /* 下一条 */ }
  }
  if (ok) {
    const all = join(tmp, label); mkdirSync(all, { recursive: true });
    const r = spawnSync('tar', ['-xzf', tgz, '-C', all, '--strip-components=1'], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`tar 解包失败：${r.stderr}`);
    return subpath ? join(all, subpath) : all;
  }
  // git 兜底：浅克隆指定 ref（tag / 分支都支持 --branch），走本机凭证；私有库最常见的一条路
  const cloneDir = join(tmp, 'clone');
  const g = spawnSync('git', ['clone', '--depth', '1', '--branch', ref, `https://github.com/${repo}.git`, cloneDir], { encoding: 'utf8', timeout: 300000 });
  if (g.status !== 0) throw new Error(`下载失败：${repo}@${ref}（HTTP ${lastStatus}；git clone 也失败：${(g.stderr || '').split('\n')[0]}）`);
  return subpath ? join(cloneDir, subpath) : cloneDir;
}
