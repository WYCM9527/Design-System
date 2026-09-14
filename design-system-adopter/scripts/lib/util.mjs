// 通用工具：参数解析、hash、目录遍历、glob、复制。零依赖，Node ≥ 22。
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

export const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
export const shaText = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

/** 递归列出 dir 下全部文件（相对路径，POSIX 分隔符），跳过 node_modules / .git / dist 内容与 .DS_Store。 */
export function walk(dir, base = dir, opts = {}) {
  const skip = opts.skip ?? ['node_modules', '.git', '.DS_Store'];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (skip.includes(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, base, opts));
    else out.push(relative(base, p).split('\\').join('/'));
  }
  return out;
}

/** 极简 glob：支持 ** 与 *。design-system.json 的 owned 清单用。 */
export function globMatch(pattern, path) {
  const re = new RegExp('^' + pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0001')
    .replace(/\*\*/g, '\u0002')
    .replace(/\*/g, '[^/]*')
    .replaceAll('\u0001', '(?:.*/)?')
    .replaceAll('\u0002', '.*') + '$');
  return re.test(path);
}

export const matchesAny = (patterns, path) => patterns.some((p) => globMatch(p, path));

/** 复制目录（跟随符号链接读内容），可排除相对路径前缀。 */
export function copyDir(src, dest, { exclude = [] } = {}) {
  mkdirSync(dest, { recursive: true });
  for (const f of walk(src)) {
    if (exclude.some((e) => f === e || f.startsWith(e + '/'))) continue;
    const to = join(dest, f);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(src, f), to);
  }
}

export const isSymlink = (p) => { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } };
export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const exists = existsSync;
export const abs = (p) => resolve(p);

export function semverCompare(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; }
  return 0;
}

export function fail(msg, code = 2) { console.error(msg); process.exit(code); }
