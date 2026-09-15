// 验收工具的路径解析：既可在仓库内（citrine/tools/）直接 node 运行，也可作为 npm 包 @wycm9527/citrine-tools 的 citrine-accept 命令运行。
// 目标项目 = --project <appDir> 或环境变量 CITRINE_APP，缺省为当前目录（在项目目录用 npm run 调用即可）。
// 项目在 accept.config.mjs 里登记页面状态、组件走查页、窄屏与焦点检查清单（见 README.md）。输出写到项目内 .accept/（加进 .gitignore）。
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { serve } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const TOOLS = resolve(here, '..');
// 预览页目录（只有黄金后台的 E/S 像素对照用）：--previews <dir>，缺省为仓库内 citrine/previews/yellow-admin
export const PREVIEWS = resolve(args().previews || process.env.CITRINE_PREVIEWS || resolve(TOOLS, '../previews/yellow-admin'));

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
/** 运行中服务器模式：--url http://127.0.0.1:5000（或 CITRINE_URL）。给 Flask / Django / PHP 这类服务端渲染项目用：不起静态服务器、不要求构建产物，页面清单写成路径而不是 hash。 */
export const URL_BASE = (early.url || process.env.CITRINE_URL || '').replace(/\/$/, '') || null;
/** token 产物目录（组件走查用它认「来自 token 的颜色」）：默认项目的 design-system/dist；非 Node 项目用 --tokens 指向 export 出来的 CSS 目录。 */
export const TOKENS_DIST = resolve(early.tokens || process.env.CITRINE_TOKENS || resolve(APP, 'design-system/dist'));
// 项目名：testbed/<name>/app → <name>；其他结构取 app 目录名
export const PROJECT = basename(APP) === 'app' ? basename(dirname(APP)) : basename(APP);
export const OUT = resolve(early.out || process.env.CITRINE_OUT || resolve(APP, '.accept'));

export function outDir(sub) { const d = resolve(OUT, sub); mkdirSync(d, { recursive: true }); return d; }

export function requireDist() {
  if (URL_BASE) return;   // 扫运行中的服务器，不需要构建产物
  if (!existsSync(resolve(APP_DIST, 'index.html'))) { console.error(`未找到构建产物 ${APP_DIST}/index.html，先在项目目录运行 npm run build（或用 --project 指定 app 目录；服务端渲染项目用 --url 指向运行中的服务器）`); process.exit(2); }
}

/** 页面来源：URL 模式直接用运行中的服务器，否则起静态服务器托管 dist。返回 { url, close }。 */
export async function startServer() {
  if (URL_BASE) return { url: URL_BASE, close() {} };
  return serve(APP_DIST);
}

/** 清空存储时打开的地址：静态模式是 dist/index.html，URL 模式是站点根 */
export const resetUrl = (base) => (URL_BASE ? `${base}/` : `${base}/index.html`);

/** 页面就绪表达式：SPA 等挂载点有内容；服务端渲染页只要 body 有内容。 */
export const READY = URL_BASE
  ? "document.readyState === 'complete' && document.body && document.body.children.length > 0 && document.body.innerText.trim().length > 20"
  : "document.readyState === 'complete' && document.querySelector('#app, #root') && document.querySelector('#app, #root').children.length > 0 && document.body.innerText.trim().length > 20";

/** 读取项目的 accept.config.mjs（PAGES / DEFAULT_QUERY / KITCHEN / NARROW / FOCUS） */
export async function loadConfig() {
  const f = resolve(APP, 'accept.config.mjs');
  if (!existsSync(f)) { console.error(`未找到 ${f}：项目需要登记验收清单，见 citrine/tools/README.md`); process.exit(2); }
  const cfg = await import(pathToFileURL(f).href);
  return { PAGES: [], DEFAULT_QUERY: { role: 'admin' }, KITCHEN: null, NARROW: { width: 1366, pages: [] }, FOCUS: { pages: {}, steps: 80 }, ...cfg };
}

/** 组合出完整 URL：hash 路由模式「?演示参数#路由」全部放在 # 之前；URL 模式（--url）spec 是服务器路径「/admin/orders?state=empty」，模式参数追加到 query */
export function pageUrl(base, spec, modeQuery = '', defaults = {}) {
  if (URL_BASE) {
    const [path, q = ''] = spec.split('?');
    const params = new URLSearchParams(q);
    for (const [k, v] of Object.entries(defaults)) if (!params.has(k)) params.set(k, v);
    for (const [k, v] of new URLSearchParams(modeQuery)) if (!params.has(k)) params.set(k, v);
    const qs = params.toString();
    return `${base}${path.startsWith('/') ? path : '/' + path}${qs ? '?' + qs : ''}`;
  }
  const [q, h = ''] = spec.split('#');
  const params = new URLSearchParams(q.replace(/^\?/, '').replace(/^&/, ''));
  for (const [k, v] of Object.entries(defaults)) if (!params.has(k)) params.set(k, v);
  for (const [k, v] of new URLSearchParams(modeQuery)) if (!params.has(k)) params.set(k, v);
  return `${base}/index.html?${params}#${h}`;
}

export const MODES = ['light', 'dark'];
export function parseModes(v) { if (!v || v === 'all') return MODES; return String(v).split(',').filter((m) => MODES.includes(m)); }
export function modeQuery(mode) { return mode === 'dark' ? 'theme=dark' : 'theme=light'; }
