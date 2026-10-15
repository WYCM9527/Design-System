// node --test tests/agents.test.mjs：AGENTS.md 的写入计划（新建 / 替换既有区块 / 追加 / 已一致）与 agents 命令的打印与 --write。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planAgents } from '../scripts/lib/agents.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = join(HERE, '../scripts/ds.mjs');
const SEED = resolve(HERE, '../../citrine/seeds/brand-yellow-e');
const tmp = () => mkdtempSync(join(tmpdir(), 'adopter-agents-'));

const rendered = (notes) => `# demo · Agent 规则\n\n## 设计系统（三行规则）\n\n1. 读 DESIGN。\n\n## 项目接线（X · Vue）\n\n${notes.join('\n')}\n`;

test('planAgents：没有文件 → 新建；内容一致 → unchanged', () => {
  const content = rendered(['- a', '- b']);
  assert.equal(planAgents(null, content).how, 'created');
  assert.equal(planAgents(content, content).how, 'unchanged');
});

test('planAgents：替换既有区块，标题、区块前的说明与项目自己的章节都不动，报出增删的行', () => {
  const old = `# 拾光商城 · Agent 规则\n\n项目自己的开场白。\n\n## 设计系统（三行规则）\n\n1. 读 DESIGN。\n\n## 项目接线（X · Vue）\n\n- a\n- 旧的一条\n\n## 业务约定\n\n- 金额两位小数\n`;
  const plan = planAgents(old, rendered(['- a', '- 新的一条', '- b']));
  assert.equal(plan.how, 'replaced');
  assert.deepEqual(plan.added, ['- 新的一条', '- b']);
  assert.deepEqual(plan.removed, ['- 旧的一条']);
  assert.deepEqual(plan.range, [5, 12]);
  assert.match(plan.text, /^# 拾光商城 · Agent 规则\n\n项目自己的开场白。\n\n## 设计系统/);
  assert.match(plan.text, /- b\n\n## 业务约定\n\n- 金额两位小数\n$/);
  assert.doesNotMatch(plan.text, /旧的一条|# demo/);
});

test('planAgents：区块在文件尾，替换后保留结尾换行', () => {
  const old = rendered(['- a']).replace('# demo', '# 项目');
  const plan = planAgents(old, rendered(['- a', '- b']));
  assert.equal(plan.how, 'replaced');
  assert.ok(plan.text.endsWith('- a\n- b\n'));
  assert.ok(plan.text.startsWith('# 项目 · Agent 规则'));
});

test('planAgents：没有设计系统区块 → 追加到末尾（带说明注释）', () => {
  const plan = planAgents('# 项目\n\n## 业务约定\n\n- x\n', rendered(['- a']));
  assert.equal(plan.how, 'appended');
  assert.match(plan.text, /- x\n\n<!-- 以下由 design-system-adopter 追加 -->\n\n## 设计系统（三行规则）/);
  assert.doesNotMatch(plan.text, /# demo/);
});

test('planAgents：旧版追加过两次的重复区块合成一份', () => {
  const block = rendered(['- a']).slice(rendered(['- a']).indexOf('## 设计系统'));
  const old = `# 项目\n\n${block}\n\n<!-- 以下由 design-system-adopter 追加 -->\n\n${block}`;
  const plan = planAgents(old, rendered(['- a', '- b']));
  assert.equal(plan.how, 'replaced');
  assert.equal(plan.text.match(/## 设计系统/g).length, 1);
  assert.doesNotMatch(plan.text, /追加/);
});

test('planAgents：CRLF 与 LF 混用时按内容比较，既有文件是 CRLF 的写回仍用 CRLF', () => {
  const content = rendered(['- a', '- b']);
  const crlf = (t) => t.replace(/\n/g, '\r\n');
  assert.equal(planAgents(crlf(content), content).how, 'unchanged');
  assert.equal(planAgents(content, crlf(content)).how, 'unchanged');
  const plan = planAgents(crlf(rendered(['- a'])), crlf(content));
  assert.equal(plan.how, 'replaced');
  assert.deepEqual(plan.added, ['- b']);
  assert.deepEqual(plan.removed, []);
  assert.equal(plan.text, crlf(rendered(['- a', '- b'])));
  assert.equal(planAgents(null, crlf(content)).text, content);
});

test('agents 命令：打印时说明会替换哪几行、增删什么；--write 原地替换，标题不动；再跑报已一致', () => {
  const proj = tmp();
  execFileSync('git', ['init', '-q'], { cwd: proj });
  cpSync(SEED, join(proj, 'seed'), { recursive: true, filter: (src) => !src.includes('node_modules') });
  const run = (cmdArgs) => execFileSync('node', [DS, ...cmdArgs, '--project', proj], { encoding: 'utf8' });
  run(['init', '--system', 'seed', '--stack', 'element-plus']);
  const printed = run(['agents']);
  assert.match(printed, /--write 会新建 AGENTS\.md/);
  run(['agents', '--write']);
  const file = join(proj, 'AGENTS.md');
  const fresh = readFileSync(file, 'utf8');
  const lines = fresh.split('\n');
  const dropped = lines.findIndex((l) => l.startsWith('- **'));
  writeFileSync(file, ['# 我的项目 · Agent 规则', ...lines.slice(1, dropped), ...lines.slice(dropped + 1), '## 业务约定', '', '- 自己的规则', ''].join('\n'));
  const preview = run(['agents']);
  assert.match(preview, /--write 会替换 AGENTS\.md 第 3–\d+ 行的设计系统区块/);
  assert.match(preview, new RegExp(`\\+ ${lines[dropped].slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(run(['agents', '--write']), /已替换 AGENTS\.md 第 3–\d+ 行的设计系统区块（−0 \/ \+1 行）/);
  const after = readFileSync(file, 'utf8');
  assert.ok(after.startsWith('# 我的项目 · Agent 规则'));
  assert.ok(after.includes(lines[dropped]));
  assert.match(after, /## 业务约定\n\n- 自己的规则\n$/);
  assert.match(run(['agents', '--write']), /已是最新，未改动/);
});
