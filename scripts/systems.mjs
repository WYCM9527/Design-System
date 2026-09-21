#!/usr/bin/env node
// 仓库里有哪些设计系统：<id>/seeds/<seed-name>/design-system.json 就算一个。CI、发版、版本检查都从这里拿清单，不再写死 citrine。
// 用法：node scripts/systems.mjs [--json] [--ids] [--seed-dirs] [--dist-paths] [--publish-dirs <id>] [--system <id>]
//   --json          全部系统的 { id, name, version, seedDir, seedRelative, dir, tools }
//   --ids           一行一个 id
//   --seed-dirs     一行一个种子目录（相对仓库根）——CI 循环构建 dist 用
//   --dist-paths    一行一个 <seed>/design-system/dist——CI git diff 用
//   --publish-dirs  某系统要发 npm 的目录：种子 + <id>/tools（存在时）；只列 package.json 带 publishConfig 的（显式选择进 registry）
//   --system <id>   只打印该系统的种子目录（相对仓库根），找不到退出 1
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** 枚举 <id>/seeds/<seed-name>/design-system.json；目录名必须等于身份文件里的 id（adopter 快照目录与 tag 前缀都用它）。 */
export function listSystems(root = ROOT) {
  const systems = [];
  for (const dir of readdirSync(root)) {
    if (dir.startsWith('.') || dir === 'node_modules' || !isDir(join(root, dir, 'seeds'))) continue;
    for (const seedName of readdirSync(join(root, dir, 'seeds'))) {
      const seedDir = join(root, dir, 'seeds', seedName);
      const identityPath = join(seedDir, 'design-system.json');
      if (!isDir(seedDir) || !existsSync(identityPath)) continue;
      const identity = readJson(identityPath);
      const toolsDir = join(root, dir, 'tools');
      systems.push({
        dir,
        id: identity.id,
        identity,
        name: identity.name,
        seedDir,
        seedRelative: `${dir}/seeds/${seedName}`,
        tools: existsSync(join(toolsDir, 'package.json')) ? { dir: toolsDir, relative: `${dir}/tools`, ...readJson(join(toolsDir, 'package.json')) } : null,
        version: identity.version,
      });
    }
  }
  return systems.sort((a, b) => a.id.localeCompare(b.id));
}

export function findSystem(id, root = ROOT) {
  return listSystems(root).find((s) => s.id === id) || null;
}

/** npm pack 的文件名：@scope/name → scope-name-<version>.tgz */
export const packName = (pkg) => `${pkg.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = (k) => { const i = argv.indexOf(`--${k}`); return i === -1 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
  const systems = listSystems();
  if (opt('ids')) console.log(systems.map((s) => s.id).join('\n'));
  else if (opt('seed-dirs')) console.log(systems.map((s) => s.seedRelative).join('\n'));
  else if (opt('dist-paths')) console.log(systems.map((s) => `${s.seedRelative}/design-system/dist`).join('\n'));
  else if (typeof opt('publish-dirs') === 'string') {
    const s = findSystem(opt('publish-dirs'));
    if (!s) { console.error(`没有 id 为 ${opt('publish-dirs')} 的系统`); process.exit(1); }
    const dirs = [s.seedRelative, ...(s.tools ? [s.tools.relative] : [])].filter((d) => readJson(join(ROOT, d, 'package.json')).publishConfig);
    console.log(dirs.join('\n'));
  } else if (typeof opt('system') === 'string') {
    const s = findSystem(opt('system'));
    if (!s) { console.error(`没有 id 为 ${opt('system')} 的系统（<id>/seeds/*/design-system.json）`); process.exit(1); }
    console.log(s.seedRelative);
  } else console.log(JSON.stringify(systems.map(({ identity, ...rest }) => ({ ...rest, tools: rest.tools ? { name: rest.tools.name, relative: rest.tools.relative, version: rest.tools.version } : null })), null, 2));
}
