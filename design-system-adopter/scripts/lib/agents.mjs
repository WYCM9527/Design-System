// AGENTS.md 渲染与写入：模板与栈要点都来自设计系统快照（design-system.json 的 agents / stacks.*.notes 指针）。
// CLI 默认只渲染输出并说明 --write 会怎么改；--write 才落盘——确认由调用方（skill 流程）负责。
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

/** BRIDGE / IMPORT / DIST 占位符解析：npm 与 folder（file: 链接）两种来源的 import 路径相同（folder 走 `npm i file:./design-systems/<id>`）。 */
export function resolvePlaceholders(text, identity, { distFromEntry = '../../design-system/dist' } = {}) {
  const pkg = identity.upstream.npm;
  return text
    .replaceAll('{{BRIDGE}}', `${pkg}/bridge`)
    .replaceAll('{{IMPORT}}', pkg)
    .replaceAll('{{DIST}}', distFromEntry);
}

/** 标题里的项目名：--name 优先，其次 package.json 的 name，最后才是目录名（目录常叫 app / web，读不出是哪个项目）。 */
function projectName(project, name) {
  if (name) return name;
  try { const pkg = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8')); if (pkg.name) return pkg.name; } catch { /* 没有或读不了 package.json */ }
  return basename(project);
}

export function renderAgents(project, identity, snapshotDir, stackId, { name } = {}) {
  const stack = identity.stacks[stackId];
  if (!stack) throw new Error(`design-system.json 里没有栈 ${stackId}；可用：${Object.keys(identity.stacks).join(' / ')}`);
  const template = readFileSync(join(snapshotDir, identity.agents), 'utf8');
  const notes = resolvePlaceholders(readFileSync(join(snapshotDir, stack.notes), 'utf8'), identity).trim();
  return template
    .replaceAll('{{PROJECT}}', projectName(project, name))
    .replaceAll('{{SYSTEM_NAME}}', identity.name)
    .replaceAll('{{SYSTEM_ID}}', identity.id)
    .replaceAll('{{STACK_LABEL}}', stack.label || stackId)
    .replaceAll('{{STACK_NOTES}}', notes)
    .replaceAll('{{ACCEPT_COMMAND}}', identity.accept?.command || 'npm run accept');
}

const APPEND_MARK = '<!-- 以下由 design-system-adopter 追加 -->';

/** 渲染结果里从「## 设计系统」起的部分：写进既有文件的只有这一段，标题行留给项目。 */
function sectionOf(content) {
  const idx = content.indexOf('## 设计系统');
  return (idx === -1 ? content : content.slice(idx)).replace(/\s+$/, '');
}

/**
 * 既有 AGENTS.md 里上次写入的设计系统区块：从第一个「## 设计系统」标题起，连续的、标题词干（全角括号前）与这次生成内容相同的章节都算，
 * 到第一个别的 # / ## 标题前（或文件尾）为止，尾部空行不算。追加过两次留下的重复区块也连在一起，替换时合成一份。没有返回 null。
 */
export function findAgentsBlock(text, section) {
  const stems = section.split('\n').filter((l) => /^## /.test(l)).map((l) => l.split('（')[0].trim());
  if (!stems.length) return null;
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(stems[0]));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,2} /.test(lines[i]) && !stems.some((s) => lines[i].startsWith(s))) { end = i; break; }
  }
  while (end > start + 1 && lines[end - 1].trim() === '') end--;
  return { start, end, lines };
}

/**
 * --write 会怎么改：返回 { how, text, range?, added, removed }。
 * how：created 新建 | replaced 替换既有区块（区块外的标题与项目自己的章节不动）| appended 没有区块，追加到末尾 | unchanged 已一致。
 * added / removed：区块里新增 / 去掉的非空行，给用户确认用。
 * 比较一律按 LF（Windows 检出的模板与项目文件可能是 CRLF）；既有文件是 CRLF 的，写回仍用 CRLF。
 */
export function planAgents(existing, content) {
  content = content.replace(/\r\n/g, '\n');
  if (existing === null) return { how: 'created', text: content, added: [], removed: [] };
  const current = existing.replace(/\r\n/g, '\n');
  const eol = (t) => (current === existing ? t : t.replace(/\n/g, '\r\n'));
  const section = sectionOf(content);
  const block = findAgentsBlock(current, section);
  if (!block) return { how: 'appended', text: eol(`${current.replace(/\s+$/, '')}\n\n${APPEND_MARK}\n\n${section}\n`), added: section.split('\n').filter((l) => l.trim()), removed: [] };
  const { start, end, lines } = block;
  const old = lines.slice(start, end);
  const next = section.split('\n');
  const text = [...lines.slice(0, start), ...next, ...lines.slice(end)].join('\n');
  const nonEmpty = (arr) => arr.filter((l) => l.trim());
  const added = nonEmpty(next).filter((l) => !old.includes(l));
  const removed = nonEmpty(old).filter((l) => !next.includes(l));
  return { how: text === current ? 'unchanged' : 'replaced', text: eol(text), range: [start + 1, end], added, removed };
}

/** 按 planAgents 落盘，返回同一份计划。 */
export function writeAgents(project, content) {
  const f = join(project, 'AGENTS.md');
  const plan = planAgents(existsSync(f) ? readFileSync(f, 'utf8') : null, content);
  if (plan.how !== 'unchanged') writeFileSync(f, plan.text);
  return plan;
}
