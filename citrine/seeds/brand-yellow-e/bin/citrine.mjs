#!/usr/bin/env node
// citrine CLI：把种子的 design-system/ 落到项目里并跟着版本升级。零依赖，Node ≥ 22。
//
//   citrine init     [--project <dir>] [--stack element|shadcn]   复制 design-system/（项目里不能已有），写 .citrine.json 清单，打印接线步骤
//   citrine manifest [--project <dir>]                            给已经手工复制过 design-system/ 的项目补清单（以当前包为基线）
//   citrine upgrade  [--project <dir>] [--dry-run] [--force]      按清单升级上游文件：本地没改过的直接更新，改过的跳过并列出（--force 覆盖）
//   citrine status   [--project <dir>]                            项目清单版本 vs 包版本、哪些上游文件被本地改过
//
// 归属边界：tokens / DESIGN.md / THEME.md / style-dictionary.config.mjs / scope-map.json / theme-map.json 是上游文件，随包升级；
// exemptions.json / MIGRATION.md / scopes/ / dist/ 是项目自己的，永远不碰。桥接与配方不在这里——它们直接从包 import。
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
const SEED_DS = join(PKG_ROOT, 'design-system');
const MANIFEST = '.citrine.json';
const PROJECT_OWNED = [/^exemptions\.json$/, /^MIGRATION\.md$/, /^scopes\//, /^dist\//, new RegExp(`^${MANIFEST.replace('.', '\\.')}$`)];

const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith('--')) || 'help';
const opt = (k) => { const i = argv.indexOf(`--${k}`); if (i === -1) return argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]; const v = argv[i + 1]; return v && !v.startsWith('--') ? v : true; };
const project = resolve(opt('project') || process.cwd());
const ds = join(project, 'design-system');

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
const walk = (dir, base = dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p, base) : [relative(base, p).split('\\').join('/')]; });
const upstreamFiles = () => walk(SEED_DS).filter((f) => !PROJECT_OWNED.some((re) => re.test(f)) && !f.endsWith('.gitkeep'));
const readManifest = () => (existsSync(join(ds, MANIFEST)) ? JSON.parse(readFileSync(join(ds, MANIFEST), 'utf8')) : null);
const writeManifest = (files) => writeFileSync(join(ds, MANIFEST), JSON.stringify({ package: PKG.name, version: PKG.version, updatedAt: new Date().toISOString().slice(0, 10), files }, null, 2) + '\n');
const log = (...a) => console.log(...a);

function wiring(stack) {
  const common = `
接下来（按 design-system-steward 的流程）：
  1. npm i -D style-dictionary@5.5.2
  2. node <skill>/scripts/build-tokens.mjs --project "${project}"     # 生成 design-system/dist
  3. node <skill>/scripts/guard.mjs --project "${project}"            # 应为 current
  4. 项目规则 AGENTS.md：三行 steward 规则 + 项目接线（样板见包内 README「用法」；新增项目规则需要你确认）
  5. 验收：npm i -D @wycm9527/citrine-tools，写 accept.config.mjs，npx citrine-accept all`;
  if (stack === 'shadcn') return `
样式入口（src/styles/globals.css）：
  @import "tailwindcss";
  @import "../../design-system/dist/index.css";
  @import "@wycm9527/citrine/bridge/shadcn.css";      /* 契约变量 + @theme inline + 按 data-slot 的组件接管 */
  @import "@wycm9527/citrine/bridge/recipes.css";     /* 页面骨架公共类 */
  @import "./app.css";                                 /* 项目自己的补充，只引用 token */
配方组件：import { StatCard } from '@wycm9527/citrine/react/StatCard'（EChart / TrendChart / TableSkeleton / ConfirmBar 同）
图表主题：import { registerTheme, trendLine, rankBars } from '@wycm9527/citrine/echarts'
Vite：optimizeDeps.exclude: ['@wycm9527/citrine']（包里是 .tsx 源码，不预打包）；根字号保持 16px
暗色：<html class="dark">；变体对照与「不用」清单见 DESIGN「组件库对照：shadcn/ui」${common}`;
  return `
样式入口（src/styles/globals.css）：
  @import "element-plus/dist/index.css";
  @import "../../design-system/dist/index.css";
  @import "@wycm9527/citrine/bridge/element-plus.css";   /* 逐组件桥接 */
  @import "@wycm9527/citrine/bridge/iconpark.css";       /* 图标六档尺寸与颜色 */
  @import "@wycm9527/citrine/bridge/recipes.css";        /* 页面骨架公共类 */
  @import "./app.css";                                    /* 项目自己的补充，只引用 token */
  （不要再引 Element 的 dark css-vars，暗色由 dist/themes/dark.css 生效）
IconPark：根组件 setup 里一次 IconProvider({ ...DEFAULT_ICON_CONFIGS, ...iconParkDefaults })，iconParkDefaults 来自 '@wycm9527/citrine/iconpark.config'
配方组件：import StatCard from '@wycm9527/citrine/vue/StatCard.vue'（EChart / TrendChart / TableSkeleton / ConfirmBar + inlineConfirm.js / confirm.js 同）
图表主题：import { registerTheme, trendLine, rankBars } from '@wycm9527/citrine/echarts'
Vite：optimizeDeps.exclude: ['@wycm9527/citrine']（包里是 .vue 源码，不预打包）
暗色：<html class="dark">${common}`;
}

function init() {
  const stack = opt('stack') === 'shadcn' ? 'shadcn' : 'element';
  if (existsSync(ds)) { console.error(`已存在 ${ds}：init 不覆盖既有设计系统。已手工复制过的项目用 citrine manifest 补清单，之后用 citrine upgrade 升级。`); process.exit(2); }
  mkdirSync(project, { recursive: true });
  cpSync(SEED_DS, ds, { recursive: true, filter: (src) => !/[\\/]dist[\\/].+/.test(src) });
  mkdirSync(join(ds, 'dist'), { recursive: true });
  const files = Object.fromEntries(upstreamFiles().map((f) => [f, sha(join(SEED_DS, f))]));
  writeManifest(files);
  log(`已落 ${PKG.name}@${PKG.version} 的 design-system/ → ${ds}（${Object.keys(files).length} 个上游文件，清单 ${MANIFEST}）`);
  log(wiring(stack));
}

function manifest() {
  if (!existsSync(ds)) { console.error(`未找到 ${ds}：先 citrine init`); process.exit(2); }
  const files = {}; let same = 0, diff = 0, missing = 0;
  for (const f of upstreamFiles()) {
    const up = sha(join(SEED_DS, f)); files[f] = up;
    const local = join(ds, f);
    if (!existsSync(local)) { missing++; log(`  缺失   ${f}（upgrade 会补上）`); continue; }
    if (sha(local) === up) same++; else { diff++; log(`  有差异 ${f}（以包为基线记录；下次 upgrade 会把它当作"本地改过"跳过，除非 --force）`); }
  }
  writeManifest(files);
  log(`已写 ${join(ds, MANIFEST)}：基线 ${PKG.name}@${PKG.version} · 一致 ${same} · 有差异 ${diff} · 缺失 ${missing}`);
}

function upgrade() {
  const m = readManifest();
  if (!m) { console.error(`未找到 ${join(ds, MANIFEST)}：先 citrine manifest（或 citrine init）`); process.exit(2); }
  const dry = !!opt('dry-run'), force = !!opt('force');
  const files = { ...m.files }; const updated = [], added = [], kept = [], current = [];
  for (const f of upstreamFiles()) {
    const src = join(SEED_DS, f), dst = join(ds, f);
    const up = sha(src), rec = m.files[f], local = existsSync(dst) ? sha(dst) : null;
    if (local === up) { current.push(f); files[f] = up; continue; }
    if (local === null) { added.push(f); if (!dry) { mkdirSync(dirname(dst), { recursive: true }); cpSync(src, dst); } files[f] = up; continue; }
    if (local === rec || force) { updated.push(f + (local !== rec ? '（本地改动被 --force 覆盖）' : '')); if (!dry) cpSync(src, dst); files[f] = up; continue; }
    kept.push(f);
  }
  if (!dry) writeManifest(files);
  log(`${dry ? '[dry-run] ' : ''}${m.package}@${m.version} → ${PKG.name}@${PKG.version}`);
  for (const f of updated) log(`  更新 ${f}`);
  for (const f of added) log(`  新增 ${f}`);
  for (const f of kept) log(`  保留 ${f}（本地改过：与清单记录的上游版本不同。看 diff 后手工合并，或 --force 用上游覆盖）`);
  log(`  未变 ${current.length} 个 · 项目自有文件（exemptions.json / MIGRATION.md / scopes/ / dist/）未触碰`);
  changelogSince(m.version);
  if (updated.length || added.length) log(`\n然后：build-tokens → guard → 验收（citrine-accept all）。token 有变化时页面像素会变，属预期；对照 CHANGELOG 看是否有需要页面配合的项。`);
}

function status() {
  const m = readManifest();
  if (!m) { log(`项目 ${project} 没有 ${MANIFEST}；包版本 ${PKG.version}。用 citrine manifest 建清单。`); return; }
  let modified = 0, behind = 0;
  for (const f of upstreamFiles()) {
    const up = sha(join(SEED_DS, f)), dst = join(ds, f);
    const local = existsSync(dst) ? sha(dst) : null;
    if (local !== null && local !== m.files[f] && local !== up) { modified++; log(`  本地改过 ${f}`); }
    if (local !== up) behind++;
  }
  log(`清单 ${m.package}@${m.version}（${m.updatedAt}）· 包 ${PKG.version} · 与包不同 ${behind} 个文件 · 本地改过 ${modified} 个`);
  if (behind && m.version !== PKG.version) changelogSince(m.version);
  log(behind ? '可以 citrine upgrade --dry-run 预览。' : '已是最新。');
}

function changelogSince(version) {
  const f = join(PKG_ROOT, 'CHANGELOG.md'); if (!existsSync(f)) return;
  const heads = readFileSync(f, 'utf8').split('\n').filter((l) => /^## \d/.test(l));
  const idx = heads.findIndex((h) => h.includes(` ${version} `) || h.includes(` ${version}（`) || h.includes(`## ${version}`));
  if (idx === -1) return;   // 清单版本不在 CHANGELOG 里（比如比包还新），不猜
  const newer = heads.slice(0, idx);
  if (newer.length) { log(`\n自 ${version} 以来的版本（详见包内 CHANGELOG.md）：`); for (const h of newer) log('  ' + h.replace(/^## /, '')); }
}

const help = () => log(`citrine ${PKG.version}\n  citrine init     [--project <dir>] [--stack element|shadcn]\n  citrine manifest [--project <dir>]\n  citrine upgrade  [--project <dir>] [--dry-run] [--force]\n  citrine status   [--project <dir>]`);
({ init, manifest, upgrade, status, help })[cmd] ? ({ init, manifest, upgrade, status, help })[cmd]() : (console.error(`未知命令 ${cmd}`), help(), process.exit(2));
