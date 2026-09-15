// design-system-steward 的查找与安装：adopter 只做接入 / 页面 / 更新，构建（build-tokens）、Guard、存量迁移（audit / migrate）全部调 steward 脚本。
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { copyDir } from './util.mjs';
import { downloadSubdir } from './fetch.mjs';

const STEWARD_REPO = 'WYCM9527/skills';
const STEWARD_SUBPATH = 'design-system-steward';
/** 读 steward 的 SKILL.md frontmatter 版本；返回 { dir, version, ok, hint }。dir 为 null 表示未找到。 */
export function stewardInfo(project) {
  const dir = locateSteward(project);
  if (!dir) return { dir: null, version: null, ok: false, hint: stewardInstallHint(project) };
  let version = null;
  try { version = (readFileSync(join(dir, 'SKILL.md'), 'utf8').match(/^\s*version:\s*"?([\d.]+)"?/m) || [])[1] || null; } catch { /* 没有 SKILL.md 也算找到了脚本 */ }
  const ok = !version || cmp(version, MIN_STEWARD) >= 0;
  return { dir, version, ok, hint: ok ? '' : `steward ${version} 低于 adopter 依赖的 ${MIN_STEWARD}（migrate 属性匹配 / settle --decisions-file / guard-status 分工都是 0.6.0 才有）：更新它——ds.mjs steward install 会拉最新 main，或在原位置 git pull。` };
}

/** adopter 剧本依赖的 steward 最低版本：0.6.0 起有按属性匹配的 migrate、settle --apply --decisions-file、guard / status 分工。 */
export const MIN_STEWARD = '0.6.0';

const cmp = (a, b) => { const pa = a.split('.').map(Number), pb = b.split('.').map(Number); for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; } return 0; };

const readVersion = (dir) => { try { return (readFileSync(join(dir, 'SKILL.md'), 'utf8').match(/^\s*version:\s*"?([\d.]+)"?/m) || [])[1] || '0.0.0'; } catch { return '0.0.0'; } };

/**
 * 查找 steward：环境变量 DESIGN_SYSTEM_STEWARD 优先；否则在项目 / 祖先目录 / 个人目录里收集全部候选，**取版本最高**的一份
 * （同版本取更靠近项目的）——机器上常同时躺着几份不同版本的 skill 拷贝，按目录顺序取第一份会拿到旧的。返回绝对路径或 null。
 */
export function locateSteward(project) {
  if (process.env.DESIGN_SYSTEM_STEWARD && existsSync(join(process.env.DESIGN_SYSTEM_STEWARD, 'scripts/build-tokens.mjs'))) return process.env.DESIGN_SYSTEM_STEWARD;
  const home = homedir();
  const candidates = [
    join(project, '.cursor/skills/design-system-steward'),
    join(project, '.claude/skills/design-system-steward'),
    join(project, 'skills/design-system-steward'),
  ];
  let p = resolve(project);
  for (let i = 0; i < 5; i++) { candidates.push(join(p, 'skills/design-system-steward')); p = resolve(p, '..'); }   // 仓库内开发：祖先目录的 skills/
  candidates.push(join(home, '.cursor/skills/design-system-steward'), join(home, '.codex/skills/design-system-steward'), join(home, '.claude/skills/design-system-steward'));
  const found = [...new Set(candidates)].filter((c) => existsSync(join(c, 'scripts/build-tokens.mjs'))).map((dir, i) => ({ dir, i, version: readVersion(dir) }));
  if (!found.length) return null;
  found.sort((a, b) => cmp(b.version, a.version) || a.i - b.i);
  return found[0].dir;
}

/** 安装 steward 到项目 .cursor/skills/（默认分支 tarball）。返回安装路径。 */
export async function installSteward(project) {
  const src = await downloadSubdir(STEWARD_REPO, 'main', STEWARD_SUBPATH, 'steward');
  const dest = join(project, '.cursor/skills/design-system-steward');
  copyDir(src, dest);
  if (!existsSync(join(dest, 'scripts/build-tokens.mjs'))) throw new Error('steward 安装后校验失败：缺 scripts/build-tokens.mjs');
  return dest;
}

export const stewardInstallHint = (project) =>
  `未找到 design-system-steward。可运行：node <adopter>/scripts/ds.mjs steward install --project "${project}"（从 https://github.com/${STEWARD_REPO} 拉到项目 .cursor/skills/），或手动克隆后用环境变量 DESIGN_SYSTEM_STEWARD 指向它。`;
