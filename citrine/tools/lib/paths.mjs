// 仓库级验收工具的路径解析：tools/ 位于 citrine/tools/，可对任意实测项目运行。
// 目标项目 = --project <appDir> 或环境变量 CITRINE_APP，缺省为当前目录（在项目 app/ 目录用 npm run 调用即可）。
// 项目在 app/accept.config.mjs 里登记页面状态、组件走查页、窄屏与焦点检查清单（见 tools/README.md）。
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
export const TOOLS = resolve(here, '..');
export const PREVIEWS = resolve(TOOLS, '../previews/yellow-admin');

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
const early = args();
export const APP = resolve(early.project || process.env.CITRINE_APP || process.cwd());
export const APP_DIST = resolve(APP, 'dist');
export const TOKENS_DIST = resolve(APP, 'design-system/dist');
// 项目名：testbed/<name>/app → <name>；其他结构取 app 目录名
export const PROJECT = basename(APP) === 'app' ? basename(dirname(APP)) : basename(APP);
export const OUT = resolve(TOOLS, 'out', PROJECT);

export function outDir(sub) { const d = resolve(OUT, sub); mkdirSync(d, { recursive: true }); return d; }

export function requireDist() {
  if (!existsSync(resolve(APP_DIST, 'index.html'))) { console.error(`未找到构建产物 ${APP_DIST}/index.html，先在项目目录运行 npm run build（或用 --project 指定 app 目录）`); process.exit(2); }
}

/** 读取项目的 accept.config.mjs（PAGES / DEFAULT_QUERY / KITCHEN / NARROW / FOCUS） */
export async function loadConfig() {
  const f = resolve(APP, 'accept.config.mjs');
  if (!existsSync(f)) { console.error(`未找到 ${f}：项目需要登记验收清单，见 citrine/tools/README.md`); process.exit(2); }
  const cfg = await import(pathToFileURL(f).href);
  return { PAGES: [], DEFAULT_QUERY: { role: 'admin' }, KITCHEN: null, NARROW: { width: 1366, pages: [] }, FOCUS: { pages: {}, steps: 80 }, ...cfg };
}

/** 组合出完整 URL：项目默认参数（如 role=admin）+ 模式参数，全部放在 # 之前 */
export function pageUrl(base, spec, modeQuery = '', defaults = {}) {
  const [q, h = ''] = spec.split('#');
  const params = new URLSearchParams(q.replace(/^\?/, '').replace(/^&/, ''));
  for (const [k, v] of Object.entries(defaults)) if (!params.has(k)) params.set(k, v);
  for (const [k, v] of new URLSearchParams(modeQuery)) if (!params.has(k)) params.set(k, v);
  return `${base}/index.html?${params}#${h}`;
}

export const MODES = ['light', 'dark'];
export function parseModes(v) { if (!v || v === 'all') return MODES; return String(v).split(',').filter((m) => MODES.includes(m)); }
export function modeQuery(mode) { return mode === 'dark' ? 'theme=dark' : 'theme=light'; }
