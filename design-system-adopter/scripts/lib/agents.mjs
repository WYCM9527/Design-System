// AGENTS.md 渲染与写入：模板与栈要点都来自设计系统快照（design-system.json 的 agents / stacks.*.notes 指针）。
// CLI 默认只渲染输出；--write 才落盘（新建，或追加到已有文件末尾，不覆盖）——确认由调用方（skill 流程）负责。
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

/** BRIDGE / IMPORT / DIST 占位符解析：npm 与 folder（file: 链接）两种来源的 import 路径相同（folder 走 `npm i file:./design-systems/<id>`）。 */
export function resolvePlaceholders(text, identity, { distFromEntry = '../../design-system/dist' } = {}) {
  const pkg = identity.upstream.npm;
  return text
    .replaceAll('{{BRIDGE}}', `${pkg}/bridge`)
    .replaceAll('{{IMPORT}}', pkg)
    .replaceAll('{{DIST}}', distFromEntry);
}

export function renderAgents(project, identity, snapshotDir, stackId) {
  const stack = identity.stacks[stackId];
  if (!stack) throw new Error(`design-system.json 里没有栈 ${stackId}；可用：${Object.keys(identity.stacks).join(' / ')}`);
  const template = readFileSync(join(snapshotDir, identity.agents), 'utf8');
  const notes = resolvePlaceholders(readFileSync(join(snapshotDir, stack.notes), 'utf8'), identity).trim();
  return template
    .replaceAll('{{PROJECT}}', basename(project))
    .replaceAll('{{SYSTEM_NAME}}', identity.name)
    .replaceAll('{{SYSTEM_ID}}', identity.id)
    .replaceAll('{{STACK_LABEL}}', stack.label || stackId)
    .replaceAll('{{STACK_NOTES}}', notes)
    .replaceAll('{{ACCEPT_COMMAND}}', identity.accept?.command || 'npm run accept');
}

/** 写入：不存在则新建；存在则把「## 设计系统」起的内容追加到末尾（带分隔说明），永不覆盖既有内容。返回 'created' | 'appended'。 */
export function writeAgents(project, content) {
  const f = join(project, 'AGENTS.md');
  if (!existsSync(f)) { writeFileSync(f, content); return 'created'; }
  const idx = content.indexOf('## 设计系统');
  const section = idx === -1 ? content : content.slice(idx);
  appendFileSync(f, `\n\n<!-- 以下由 design-system-adopter 追加 -->\n\n${section}`);
  return 'appended';
}
