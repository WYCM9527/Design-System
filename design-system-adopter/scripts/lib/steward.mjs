// design-system-steward 的查找与安装：adopter 只做接入 / 页面 / 更新，构建（build-tokens）、Guard、存量迁移（audit / migrate）全部调 steward 脚本。
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { copyDir } from './util.mjs';
import { downloadSubdir } from './fetch.mjs';

const STEWARD_REPO = 'WYCM9527/skills';
const STEWARD_SUBPATH = 'design-system-steward';

/** 按顺序查找 steward 目录（含 scripts/build-tokens.mjs 才算）。返回绝对路径或 null。 */
export function locateSteward(project) {
  const home = homedir();
  const candidates = [
    process.env.DESIGN_SYSTEM_STEWARD,
    join(project, '.cursor/skills/design-system-steward'),
    join(project, '.claude/skills/design-system-steward'),
    join(project, 'skills/design-system-steward'),
    join(home, '.cursor/skills/design-system-steward'),
    join(home, '.codex/skills/design-system-steward'),
    join(home, '.claude/skills/design-system-steward'),
  ].filter(Boolean);
  // 仓库内开发场景：project 的祖先目录里有 skills/design-system-steward
  let p = resolve(project);
  for (let i = 0; i < 5; i++) { candidates.push(join(p, 'skills/design-system-steward')); p = resolve(p, '..'); }
  for (const c of candidates) if (c && existsSync(join(c, 'scripts/build-tokens.mjs'))) return c;
  return null;
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
