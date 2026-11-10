// 保序 JSON：对象读成 Map，写回与 JSON.stringify(v, null, 2) 同格式。
// JSON.parse 会把 "3"、"500" 这类整数键提到最前，改写 token 文件时会打乱原有顺序；这里按文件原序读写。
export function parseOrdered(text) {
  let i = 0;
  const fail = (what) => { throw new SyntaxError(`JSON 解析失败：第 ${i} 个字符附近${what}`); };
  const ws = () => { while (i < text.length && ' \t\n\r'.includes(text[i])) i++; };
  const string = () => {
    const start = i++;
    while (i < text.length && text[i] !== '"') i += text[i] === '\\' ? 2 : 1;
    if (i >= text.length) fail('字符串没有结束');
    i++;
    return JSON.parse(text.slice(start, i));
  };
  const value = () => {
    ws();
    const ch = text[i];
    if (ch === '{') {
      i++;
      const map = new Map();
      ws();
      if (text[i] === '}') { i++; return map; }
      for (;;) {
        ws();
        if (text[i] !== '"') fail('应为键名');
        const key = string();
        ws();
        if (text[i++] !== ':') fail('缺少冒号');
        map.set(key, value());
        ws();
        const sep = text[i++];
        if (sep === '}') return map;
        if (sep !== ',') fail('缺少逗号或 }');
      }
    }
    if (ch === '[') {
      i++;
      const list = [];
      ws();
      if (text[i] === ']') { i++; return list; }
      for (;;) {
        list.push(value());
        ws();
        const sep = text[i++];
        if (sep === ']') return list;
        if (sep !== ',') fail('缺少逗号或 ]');
      }
    }
    if (ch === '"') return string();
    const m = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i, i + 40));
    if (!m) fail('不是合法的值');
    i += m[0].length;
    return JSON.parse(m[0]);
  };
  const out = value();
  ws();
  if (i !== text.length) fail('后面还有多余内容');
  return out;
}

export function stringifyOrdered(value, indent = '') {
  const next = indent + '  ';
  if (value instanceof Map) {
    if (value.size === 0) return '{}';
    return '{\n' + [...value].map(([k, v]) => `${next}${JSON.stringify(k)}: ${stringifyOrdered(v, next)}`).join(',\n') + `\n${indent}}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '[\n' + value.map((v) => next + stringifyOrdered(v, next)).join(',\n') + `\n${indent}]`;
  }
  if (value && typeof value === 'object') return stringifyOrdered(new Map(Object.entries(value)), indent);
  return JSON.stringify(value);
}

/** Map 树转普通对象（只读场景用，整数键顺序不再保证）。 */
export function toPlain(value) {
  if (value instanceof Map) return Object.fromEntries([...value].map(([k, v]) => [k, toPlain(v)]));
  if (Array.isArray(value)) return value.map(toPlain);
  return value;
}
