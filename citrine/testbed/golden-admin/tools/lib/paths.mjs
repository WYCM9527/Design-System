// 仓库内路径：tools/ 位于 citrine/testbed/golden-admin/tools/
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
export const TOOLS = resolve(here, '..');
export const APP = resolve(TOOLS, '../app');
export const APP_DIST = resolve(APP, 'dist');
export const TOKENS_DIST = resolve(APP, 'design-system/dist');
export const PREVIEWS = resolve(TOOLS, '../../../previews/yellow-admin');
export const OUT = resolve(TOOLS, 'out');

export function outDir(sub) { const d = resolve(OUT, sub); mkdirSync(d, { recursive: true }); return d; }

export function requireDist() {
  if (!existsSync(resolve(APP_DIST, 'index.html'))) { console.error(`未找到构建产物 ${APP_DIST}/index.html，先在 app 目录运行 npm run build`); process.exit(2); }
}

/** 解析 --key value / --key=value / 位置参数 */
export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const [k, v] = a.slice(2).split('='); if (v !== undefined) out[k] = v; else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i]; else out[k] = true; }
    else out._.push(a);
  }
  return out;
}

export const MODES = ['light', 'dark'];
export function parseModes(v) { if (!v || v === 'all') return MODES; return String(v).split(',').filter((m) => MODES.includes(m)); }
export function modeQuery(mode) { return mode === 'dark' ? 'theme=dark' : 'theme=light'; }
