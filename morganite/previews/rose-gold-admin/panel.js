/* 规范调节面板（效果预览专用，不属于设计系统）：换色、调值、点组件看角色、导出改动清单。
   面板只改 CSS 变量：换色是给 <html> 加 data-palette（palettes.css 里每个调色盘一段覆盖），调值写进 <style id="dsp-overrides">
   （原语和亮色写 html:root，暗色写 html:root.dark，特异度都比种子 dist 高一级）；不改页面上的样式规则，也不存规范值——
   定下来的改动从「导出」交给 AI 写回种子，再由 check-palettes / guard 把关。
   数据来自 panel-data.js（node scripts/build-palette-preview.mjs 生成）；?panel=open 打开页面时直接展开。 */
(function () {
  "use strict";
  const data = window.MorganitePanelData;
  if (!data || document.querySelector(".dsp")) return;
  const root = document.documentElement;
  const body = document.body;
  const icon = window.MorganiteIcon || (() => "");
  const toast = window.MorganiteToast || (() => {});
  const KEYS = { palette: "morganite-palette", edits: "morganite-panel", open: "morganite-panel-open" };
  const store = {
    get(key, session) { try { return (session ? sessionStorage : localStorage).getItem(key); } catch (e) { return null; } },
    set(key, value, session) {
      try {
        const s = session ? sessionStorage : localStorage;
        if (value === null) s.removeItem(key); else s.setItem(key, value);
      } catch (e) { /* 隐私模式下不持久化 */ }
    },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // tokens：变量名 → [路径, 层 p 原语 / s 语义, 类型, 说明, 亮色指向, 暗色指向]
  const T = data.tokens;
  const byId = Object.fromEntries(data.palettes.map((p) => [p.id, p]));
  const pathOf = (v) => (T[v] ? T[v][0] : v.replace(/^--/, ""));
  const short = (path) => path.replace(/^color\./, "");
  const ALPHA = {};
  data.brand.forEach((v) => {
    const m = /^(.*)-a(\d+)$/.exec(v);
    if (m) (ALPHA[m[1]] = ALPHA[m[1]] || []).push([v, Number(m[2]) / 100]);
  });
  const baseOf = (v) => Object.keys(ALPHA).find((b) => ALPHA[b].some(([a]) => a === v));

  const hex = (s) => {
    const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(s).trim());
    return m ? { rgb: "#" + m[1].toUpperCase(), alpha: m[2] ? m[2].toUpperCase() : "" } : null;
  };
  const withAlpha = (rgb, a) => rgb + Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase();
  const rgba = (s) => {
    const h = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
    if (h) { const n = parseInt(h[1], 16); return [n >> 16, (n >> 8) & 255, n & 255, h[2] ? parseInt(h[2], 16) / 255 : 1]; }
    const m = /^rgba?\(([^)]+)\)$/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const dot = (value) => `<span class="dsp-dot" style="--dsp-c: ${esc(value)}"></span>`;

  // ---- 改动：{ core: {变量: {from, to}}, dark: {…} } ----
  const loadEdits = () => {
    try {
      const o = JSON.parse(store.get(KEYS.edits)) || {};
      return { core: o.core || {}, dark: o.dark || {} };
    } catch (e) { return { core: {}, dark: {} }; }
  };
  const edits = loadEdits();
  const SELECTOR = { core: "html:root", dark: "html:root.dark" };
  const editCount = () => Object.keys(edits.core).length + Object.keys(edits.dark).length;
  const editCss = () => Object.keys(SELECTOR).map((layer) => {
    const rows = Object.entries(edits[layer]).map(([v, e]) => `  ${v}: ${e.to};`);
    return rows.length ? `${SELECTOR[layer]} {\n${rows.join("\n")}\n}\n` : "";
  }).join("");
  let overrides = document.getElementById("dsp-overrides");
  if (!overrides) {
    overrides = document.createElement("style");
    overrides.id = "dsp-overrides";
    document.head.appendChild(overrides);
  }
  const apply = () => {
    const css = editCss();
    overrides.textContent = css;
    store.set(KEYS.edits, editCount() ? JSON.stringify({ core: edits.core, dark: edits.dark, css }) : null);
  };

  const isDark = () => root.classList.contains("dark");
  const layerOf = (v) => (T[v] && T[v][1] === "s" && T[v][2] === "color" && isDark() ? "dark" : "core");
  const editOf = (v) => edits[layerOf(v)][v];
  const read = (v, cs) => (cs || getComputedStyle(root)).getPropertyValue(v).trim();

  /** 改一个变量（to 为 null 即恢复）；改品牌色的基础档时，它的半透明档跟着换。 */
  const setVar = (v, to) => {
    const layer = layerOf(v);
    const map = edits[layer];
    const put = (name, value) => {
      if (value === null) { delete map[name]; return; }
      const from = map[name] ? map[name].from : read(name);
      if (from.toLowerCase() === value.toLowerCase()) delete map[name];
      else map[name] = { from, to: value };
    };
    put(v, to);
    if (ALPHA[v] && layer === "core") {
      const h = to === null ? null : hex(to);
      ALPHA[v].forEach(([name, a]) => put(name, h ? withAlpha(h.rgb, a) : null));
    }
    apply();
  };
  const dropEdits = (test) => {
    let n = 0;
    ["core", "dark"].forEach((layer) => Object.keys(edits[layer]).forEach((v) => {
      if (test(v)) { delete edits[layer][v]; n++; }
    }));
    apply();
    return n;
  };

  // ---- 颜色主题 ----
  const current = () => byId[root.getAttribute("data-palette")] || byId[data.defaultId];
  const kindOf = (p) => (p.isDefault ? "默认" : p.official ? "官方" : "仅预览");
  const syncUrl = () => {
    const q = new URLSearchParams(location.search);
    const p = current();
    if (p.isDefault) q.delete("palette"); else q.set("palette", p.id);
    const s = q.toString();
    try { history.replaceState(history.state, "", location.pathname + (s ? "?" + s : "") + location.hash); } catch (e) { /* 个别浏览器在 file:// 下不让改地址 */ }
  };
  const setPalette = (id) => {
    const p = byId[id];
    if (!p || p === current()) return;
    if (p.isDefault) root.removeAttribute("data-palette"); else root.setAttribute("data-palette", p.id);
    store.set(KEYS.palette, p.isDefault ? null : p.id);
    const dropped = dropEdits((v) => T[v] && T[v][2] === "color");
    syncUrl();
    render();
    toast(dropped ? `已换成「${p.name}」，按上一个颜色手调的 ${dropped} 个颜色值已清掉` : `已换成「${p.name}」`);
  };
  const unknown = root.getAttribute("data-palette");
  if (unknown && !byId[unknown]) {
    root.removeAttribute("data-palette");
    store.set(KEYS.palette, null);
    setTimeout(() => toast(`没有「${unknown}」这个颜色主题，显示的是默认的${byId[data.defaultId].name}`), 0);
  } else if (unknown === data.defaultId) {
    root.removeAttribute("data-palette");
    store.set(KEYS.palette, null);
  }
  syncUrl();

  /** 角色在当前颜色主题、当前亮暗下指向哪个 token（调色盘改指向优先，暗色先看暗色）。 */
  const pointer = (path, p, dark) => {
    const t = T["--" + path.split(".").join("-")];
    if (!t) return null;
    if (dark) {
      if (p.dark[path]) return p.dark[path];
      if (t[5]) return t[5];
    }
    return p.semantic[path] || t[4];
  };
  const usersOf = (slot, p, dark) => Object.values(T).filter((t) => t[1] === "s" && pointer(t[0], p, dark) === slot).map((t) => short(t[0]));

  // ---- 行 ----
  const resetBtn = (v, changed) => `<button class="iconbtn" type="button" data-reset="${v}" aria-label="恢复 ${esc(pathOf(v))}"${changed ? "" : " hidden"}>${icon("refresh", "icon--sm")}</button>`;
  const colorRow = (v, desc) => {
    const val = read(v);
    const h = hex(val);
    const base = baseOf(v);
    const changed = Boolean(editOf(v));
    const label = esc(pathOf(v));
    const edit = base
      ? `<span class="dsp-value" data-show="${v}">${dot(val)}${esc(val)}</span>`
      : (h ? `<input class="dsp-color" type="color" value="${h.rgb.toLowerCase()}" data-var="${v}" aria-label="${label} 取色">` : "")
        + `<input class="input" type="text" value="${esc(val)}" data-var="${v}" spellcheck="false" aria-label="${label} 的值">${resetBtn(v, changed)}`;
    return `<div class="dsp-row${changed ? " is-changed" : ""}" data-row="${v}"><div><span class="name">${esc(short(pathOf(v)))}</span><span class="desc">${esc(desc)}</span></div><div class="edit">${edit}</div></div>`;
  };
  const sizeRow = (v, desc) => {
    const val = read(v);
    const n = parseFloat(val);
    const changed = Boolean(editOf(v));
    const px = /px$/.test(val) || val === "0";
    const input = px
      ? `<input class="input" type="number" min="0" step="1" value="${isNaN(n) ? "" : n}" data-var="${v}" aria-label="${esc(pathOf(v))}（px）"><span class="unit">px</span>`
      : `<input class="input" type="text" value="${esc(val)}" data-var="${v}" spellcheck="false" aria-label="${esc(pathOf(v))} 的值">`;
    return `<div class="dsp-row${changed ? " is-changed" : ""}" data-row="${v}"><div><span class="name">${esc(pathOf(v))}</span><span class="desc">${esc(desc)}</span></div><div class="edit">${input}${resetBtn(v, changed)}</div></div>`;
  };
  const plainRow = (name, desc, val) => `<div class="dsp-row"><div><span class="name">${esc(name)}</span><span class="desc">${esc(desc)}</span></div><div class="edit"><span class="dsp-value">${rgba(val) ? dot(val) : ""}${esc(val || "（未定义）")}</span></div></div>`;

  // ---- 颜色 ----
  const paletteCard = (p) => {
    const items = [];
    if (!p.isDefault) {
      const light = Object.keys(p.semantic).length, dark = Object.keys(p.dark).length;
      items.push(light + dark ? `按对比度改了 ${light + dark} 个角色的指向（亮 ${light}、暗 ${dark}），其余角色跟着色阶自动变` : "所有角色都跟着色阶自动变，没有改指向");
    }
    p.exceptions.forEach((e) => items.push(`${e.approved ? "已批" : "待批"}的对比度例外 · ${e.mode === "dark" ? "暗色" : "亮色"}${esc(e.label)}：${esc(e.why)}`));
    const near = {};
    p.collisions.forEach((c) => {
      const k = c.label;
      near[k] = near[k] || { severe: false, delta: c.delta, modes: new Set() };
      near[k].severe = near[k].severe || c.severity === "severe";
      near[k].delta = Math.min(near[k].delta, c.delta);
      near[k].modes.add(c.mode === "dark" ? "暗" : "亮");
    });
    Object.entries(near).forEach(([label, c]) => items.push(`${c.severe ? "撞色" : "近色"} · 主色和「${esc(label)}」很近（${[...c.modes].join("、")}色，ΔE ${c.delta}）${c.severe ? "，会被看成报错 / 危险" : "，靠图标和文字区分"}`));
    if (!p.official) items.push("只在预览里试；要给项目用，先提案进官方名单");
    const tag = `<span class="dsp-tag${p.official ? "" : " is-muted"}">${kindOf(p)}</span>`;
    const file = p.file ? `<a href="../../seeds/morganite/${esc(p.file)}" target="_blank" rel="noopener">调色盘文件</a>` : "";
    return `<div class="dsp-card"><div class="title">${dot(p.swatch)}<span>${esc(p.name)}</span>${tag}${file}</div>${items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : ""}</div>`;
  };
  const swatches = (list, p) => list.map((x) => `<button type="button" class="dsp-swatch" data-palette-pick="${x.id}" aria-pressed="${x.id === p.id}" title="${esc(x.name)}（${x.id}）${x.swatch}">${dot(x.swatch)}<span>${esc(x.name)}</span></button>`).join("");
  const colorPane = () => {
    const p = current();
    const dark = isDark();
    const official = data.palettes.filter((x) => x.official);
    const trial = data.palettes.filter((x) => !x.official);
    const ladder = data.brand.map((v) => {
      const base = baseOf(v);
      if (base) return colorRow(v, `跟着 ${short(pathOf(base))} 自动（${Math.round(ALPHA[base].find(([a]) => a === v)[1] * 100)}% 透明）`);
      const users = usersOf(pathOf(v), p, dark);
      return colorRow(v, users.length ? `${dark ? "暗色" : "亮色"}用在：${users.slice(0, 3).join("、")}${users.length > 3 ? ` 等 ${users.length} 个` : ""}` : "没有角色直接指向这一档");
    }).join("");
    const brandEdits = data.brand.some((v) => edits.core[v]);
    return `
      <div class="dsp-section">${paletteCard(p)}</div>
      <div class="dsp-section"><h3>官方 <span class="dsp-tag">${official.length}</span></h3><p class="dsp-hint">项目可以直接用：新项目 ds.mjs init --palette &lt;id&gt;，已接入的 ds.mjs palette &lt;id&gt;。</p><div class="dsp-grid">${swatches(official, p)}</div></div>
      <div class="dsp-section"><h3>仅预览 <span class="dsp-tag is-muted">${trial.length}</span></h3><p class="dsp-hint">shadcn 的其余主题色，只在这里试。</p><div class="dsp-grid">${swatches(trial, p)}</div></div>
      <div class="dsp-section"><h3>品牌色阶${brandEdits ? `<button class="btn btn--sm btn--quiet" type="button" data-reset-group="brand">${icon("refresh", "icon--sm")}恢复色阶</button>` : ""}</h3><p class="dsp-hint">「${esc(p.name)}」的 12 档品牌色，所有品牌角色都从这里取。改一档，用到它的组件一起变；半透明档跟着基础档走。</p><div class="dsp-rows">${ladder}</div></div>`;
  };

  // ---- 尺寸 ----
  const sizePane = () => data.groups.map((g) => {
    const changed = g.vars.some((v) => edits.core[v]);
    return `<div class="dsp-section"><h3>${esc(g.label)}${changed ? `<button class="btn btn--sm btn--quiet" type="button" data-reset-group="${g.id}">${icon("refresh", "icon--sm")}恢复</button>` : ""}</h3><div class="dsp-rows">${g.vars.map((v) => sizeRow(v, T[v][3])).join("")}</div></div>`;
  }).join("");

  // ---- 查看：点页面元素，列出它的样式用到的变量 ----
  let picking = false;
  let picked = null;
  const describe = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + [...el.classList].filter((c) => !/^dsp-/.test(c)).map((c) => "." + c).join("");
  const declarations = (text) => [...String(text).matchAll(/([\w-]+)\s*:\s*([^;]+)/g)].map((m) => [m[1], m[2].trim()]);
  const matches = (el, selector) => { try { return el.matches(selector); } catch (e) { return false; } };
  const STATES = [[/:hover/, "悬停时 "], [/:active/, "按下时 "], [/:focus/, "聚焦时 "], [/:checked/, "选中时 "]];
  /** 从样式表里找命中这个元素的规则，取出每个属性引用的 var(--…)；同一属性留样式表里靠后的那条。样式表读不了（file://）时返回 null。 */
  const fromSheets = (el) => {
    const found = new Map();
    let readable = 0;
    const take = (prefix, selector, style) => declarations(style.cssText).forEach(([prop, val]) => {
      const vars = [...new Set([...val.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))];
      if (!vars.length) return;
      found.delete(prefix + prop);
      found.set(prefix + prop, { vars, selector });
    });
    const scan = (rules) => {
      for (const rule of rules) {
        if (rule.cssRules && !rule.selectorText) {
          if (rule.media && !matchMedia(rule.media.mediaText).matches) continue;
          scan(rule.cssRules);
          continue;
        }
        const selector = rule.selectorText;
        if (!selector || !rule.style) continue;
        let prefix = null;
        if (matches(el, selector)) prefix = "";
        else if (selector.includes("::")) {
          for (const part of selector.split(",")) {
            const pseudo = /::?(before|after)\s*$/.exec(part);
            if (pseudo && matches(el, part.slice(0, pseudo.index))) { prefix = `::${pseudo[1]} `; break; }
          }
        }
        if (prefix === null) continue;
        const state = STATES.find(([re]) => re.test(selector));
        take((state ? state[1] : "") + prefix, selector, rule.style);
      }
    };
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode === overrides || (sheet.href && /\/(panel|palettes)\.css$/.test(sheet.href))) continue;
      let rules = null;
      try { rules = sheet.cssRules; } catch (e) { rules = null; }
      if (!rules) continue;
      readable++;
      scan(rules);
    }
    if (!readable) return null;
    declarations(el.getAttribute("style") || "").forEach(([prop, val]) => {
      const vars = [...new Set([...val.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))];
      if (vars.length) found.set(prop, { vars, selector: "style 属性" });
    });
    // 颜色排前面，尺寸其次，动效之类放最后
    const rank = ({ vars }) => Math.min(...vars.map((v) => (T[v] ? ({ color: 0, dimension: 1 })[T[v][2]] ?? 2 : 3)));
    return new Map([...found].sort((a, b) => rank(a[1]) - rank(b[1])));
  };
  // 反查时每个属性只在对口的 token 里找（文字色找 text / icon，圆角找 radius…），免得同值的无关 token 混进来
  const PROBES = [
    ["color", "文字色", /^color\.(text|icon|status)\./],
    ["background-color", "底色", /^color\.(bg|action|status|chart|brand)\./],
    ["border-top-color", "边框色", /^color\.(border|focus|status|action|brand)\./],
    ["fill", "填充", /^color\.(icon|chart|text|brand|action)\./],
    ["stroke", "描线", /^color\.(icon|chart|border|brand)\./],
    ["border-top-left-radius", "圆角", /radius/],
    ["padding-top", "上内边距", /^(space|spacing|table\.cell)\./],
    ["padding-left", "左内边距", /^(space|spacing|table\.cell)\./],
    ["font-size", "字号", /^(font\.size|text\.[\w-]+\.size)/],
    ["height", "高度", /^(size\.control|control\.height|size\.|layout\.)/],
    ["column-gap", "间距", /^(space|spacing)\./],
  ];
  /** 读不了样式表时按算出来的值反查：哪些 token 现在恰好是这个值（只是候选）。 */
  const byValue = (el) => {
    const cs = getComputedStyle(el);
    const rootCs = getComputedStyle(root);
    const found = new Map();
    for (const [prop, label, family] of PROBES) {
      const val = cs.getPropertyValue(prop).trim();
      if (!val || /^(none|auto|normal|0px)$/.test(val) || val === "rgba(0, 0, 0, 0)") continue;
      const color = /color|fill|stroke/.test(prop);
      const want = color ? rgba(val) : null;
      if (color && !want) continue;
      const hits = Object.keys(T).filter((v) => {
        if (T[v][2] !== (color ? "color" : "dimension") || !family.test(T[v][0])) return false;
        const t = read(v, rootCs);
        if (!color) return t === val;
        const c = rgba(t);
        return c && c.every((x, i) => Math.abs(x - want[i]) < (i === 3 ? 0.02 : 1.5));
      }).sort((a, b) => (T[a][1] === T[b][1] ? 0 : T[a][1] === "s" ? -1 : 1));
      if (hits.length) found.set(`${label}（${prop}）`, { vars: hits.slice(0, 4), selector: "按值反查" });
    }
    return found;
  };
  const inspectResult = (el) => {
    if (!el.isConnected) return `<div class="dsp-section"><p class="dsp-hint">刚才点的元素已经不在页面上（换了页面），再点一次。</p></div>`;
    let target = el, found = fromSheets(el), guessed = false, depth = 0;
    if (found === null) { found = byValue(el); guessed = true; }
    while (!guessed && found.size === 0 && target.parentElement && depth < 4) {
      target = target.parentElement;
      found = fromSheets(target);
      depth++;
    }
    const p = current();
    const dark = isDark();
    const cs = getComputedStyle(target);
    const rows = [...found].map(([prop, { vars, selector }]) => `<p class="dsp-prop">${esc(prop)} · ${esc(selector)}</p><div class="dsp-rows">${vars.map((v) => {
      const t = T[v];
      if (!t) return plainRow(v, "局部变量（页面里的中转变量，不是规范 token）", read(v, cs));
      const via = t[1] === "s" ? pointer(t[0], p, dark) : null;
      const desc = [t[1] === "s" ? "语义" : "原语", via ? `→ ${short(via)}` : "", t[3]].filter(Boolean).join(" · ");
      if (t[2] === "color") return colorRow(v, desc);
      if (t[2] === "dimension") return sizeRow(v, desc);
      return plainRow(short(t[0]), desc, read(v));
    }).join("")}</div>`).join("");
    const head = `<div class="dsp-target">${esc(describe(target))}</div>`;
    const note = guessed
      ? `<p class="dsp-hint">本地直接打开（file://）时浏览器不让读样式表，下面是按算出来的值反查到的候选 token；用本地服务器或在线预览打开可以看到准确的引用。</p>`
      : depth ? `<p class="dsp-hint">点的元素本身没写样式，下面是上层 ${esc(describe(target))} 的。</p>` : "";
    return `<div class="dsp-section">${head}${note}${rows || `<p class="dsp-hint">这个元素没有用到规范变量。</p>`}</div>`;
  };
  const inspectPane = () => `
    <div class="dsp-section"><p class="dsp-hint">点「点选」后在页面上点任意元素，列出它的样式用到的规范变量和当前值，可以直接改；Esc 退出点选。</p>
      <button class="btn btn--sm${picking ? " btn--primary" : ""}" type="button" data-inspect aria-pressed="${picking}">${icon("eye", "icon--sm")}${picking ? "点选中，Esc 退出" : "点选页面元素"}</button></div>
    ${picked ? inspectResult(picked) : ""}`;

  // ---- 导出 ----
  const SEED = "morganite/seeds/morganite/design-system/";
  /** 每条改动写回哪里：默认颜色和尺寸改种子 token；其他颜色主题的颜色改调色盘生成器里的 TWEAKS（调色盘文件是生成物）。 */
  const whereOf = (v, layer, p) => {
    const semantic = T[v] && T[v][1] === "s";
    if (T[v] && T[v][2] === "color" && !p.isDefault) return `scripts/import-shadcn-palettes.mjs → TWEAKS["${p.id}"].${layer === "dark" ? "dark" : semantic ? "semantic" : "primitives"}`;
    if (layer === "dark") return `${SEED}themes/dark/tokens/semantic.tokens.json`;
    return `${SEED}tokens/${semantic ? "semantic" : "primitives"}.tokens.json`;
  };
  const changes = () => {
    const p = current();
    return ["core", "dark"].flatMap((layer) => Object.entries(edits[layer]).map(([v, e]) => {
      const base = layer === "core" ? baseOf(v) : null;
      return {
        token: pathOf(v),
        mode: layer === "dark" ? "dark" : "light",
        from: e.from,
        to: e.to,
        where: whereOf(v, layer, p),
        follows: base && edits.core[base] ? pathOf(base) : null,
      };
    }));
  };
  const listText = () => {
    const p = current();
    const list = changes();
    const lines = [`${data.name} · 规范调节清单（种子 ${data.version}）`, `颜色主题：${p.name}（${p.id}，${kindOf(p)}）`];
    if (!list.length) lines.push("没有手调的值。");
    else {
      lines.push(`改动 ${list.length} 处：`);
      list.forEach((c, i) => lines.push(`${i + 1}. ${c.mode === "dark" ? "[暗色] " : ""}${c.token}：${c.from} → ${c.to}${c.follows ? `（跟着 ${c.follows} 自动）` : ""}`));
    }
    return lines.join("\n");
  };
  const aiText = () => {
    const p = current();
    const list = changes();
    const tool = "node <design-system-adopter>/scripts/ds.mjs";
    if (!list.length) {
      if (p.isDefault) return `请按 ${data.name} 的默认颜色（${p.name}）接入：${tool} init；已经接入的项目不用改。`;
      if (p.official) return `请把项目的颜色换成 ${data.name} 官方的「${p.name}」：新项目用 ${tool} init --palette ${p.id}；已接入的项目用 ${tool} palette ${p.id}（会重建 design-system/dist）。之后跑 npm run build 和验收，guard 应为 current；不要手改 dist，也不要在页面上补颜色。`;
      return `「${p.name}」（${p.id}）只在效果预览里，还不是 ${data.name} 的官方颜色：请先在 Design-System 仓库提案，把它加进 morganite/seeds/morganite/design-system.json 的 palettes.official，跑 node scripts/check-palettes.mjs --build 体检通过并发版后，项目里再用 ${tool} palette ${p.id}。`;
    }
    // 调色盘生成器会按基础档重算半透明档，跟着走的那几条不用写进 TWEAKS
    const rows = list.filter((c) => !(c.follows && !p.isDefault)).map(({ follows, ...c }) => c);
    const tweaks = rows.some((c) => c.where.startsWith("scripts/"));
    const json = JSON.stringify({ system: data.system, version: data.version, palette: p.id, changes: rows }, null, 2);
    return `请在 Design-System 仓库里把下面这份清单写回 ${data.name} 规范：每条改 where 指的文件（只改源文件，不改 dist），mode 为 dark 的是暗色值。${tweaks ? `写进 TWEAKS 的，改完重跑 node scripts/import-shadcn-palettes.mjs（palettes/${p.id}.json 是它的生成物）。` : ""}改完跑 steward 的 build 与 guard、node scripts/check-palettes.mjs --build、node scripts/build-palette-preview.mjs，打开效果预览核对，再在 CHANGELOG 记一笔。\n\n${json}`;
  };
  const exportPane = () => {
    const n = editCount();
    return `
      <div class="dsp-section"><h3>改动清单 <span class="dsp-tag${n ? "" : " is-muted"}">${n}</span></h3>
        <p class="dsp-hint">面板里的改动只在这个浏览器里生效，不会改规范；要定下来，把下面的话交给 AI。</p>
        <textarea class="input dsp-out" readonly aria-label="改动清单">${esc(listText())}</textarea>
        <div class="dsp-actions"><button class="btn btn--sm" type="button" data-copy="list">${icon("copy", "icon--sm")}复制清单</button>${n ? `<button class="btn btn--sm btn--quiet" type="button" data-clear>${icon("trash", "icon--sm")}清空改动</button>` : ""}</div></div>
      <div class="dsp-section"><h3>交给 AI 的话</h3>
        <textarea class="input dsp-out" readonly aria-label="交给 AI 的话">${esc(aiText())}</textarea>
        <div class="dsp-actions"><button class="btn btn--sm btn--primary" type="button" data-copy="ai">${icon("copy", "icon--sm")}复制给 AI</button><button class="btn btn--sm" type="button" data-copy="link">复制预览链接</button></div></div>`;
  };
  const copyFallback = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  };
  const copy = (text, what) => {
    const done = () => toast(`已复制${what}`);
    const fallback = () => (copyFallback(text) ? done() : toast("复制失败：请在文本框里手动全选复制"));
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  };

  // ---- 面板骨架 ----
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "btn dsp-fab";
  fab.setAttribute("aria-controls", "dsp");
  fab.setAttribute("aria-expanded", "false");
  const panel = document.createElement("aside");
  panel.className = "dsp";
  panel.id = "dsp";
  panel.hidden = true;
  panel.setAttribute("aria-label", "规范调节面板");
  const TABS = [["color", "颜色"], ["size", "尺寸"], ["inspect", "查看"], ["export", "导出"]];
  panel.innerHTML = `
    <div class="dsp-head"><h2>规范调节</h2>
      <div class="seg" role="group" aria-label="亮色 / 暗色"><button type="button" data-theme-set="light">亮色</button><button type="button" data-theme-set="dark">暗色</button></div>
      <button class="iconbtn" type="button" data-dsp-close aria-label="收起面板">${icon("close")}</button></div>
    <div class="tabs" role="tablist" aria-label="面板分区">${TABS.map(([id, label], i) => `<button class="tab" type="button" role="tab" id="dsp-t-${id}" aria-controls="dsp-p-${id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${label}</button>`).join("")}</div>
    <div class="dsp-body">${TABS.map(([id], i) => `<section role="tabpanel" id="dsp-p-${id}" aria-labelledby="dsp-t-${id}"${i ? " hidden" : ""}></section>`).join("")}</div>`;
  const hl = document.createElement("div");
  hl.className = "dsp-hl";
  hl.hidden = true;
  body.append(fab, panel, hl);
  const panes = Object.fromEntries(TABS.map(([id]) => [id, panel.querySelector(`#dsp-p-${id}`)]));
  const RENDER = { color: colorPane, size: sizePane, inspect: inspectPane, export: exportPane };

  const syncChrome = () => {
    const n = editCount();
    fab.innerHTML = `${icon("sliders", "icon--sm")}<span>规范调节</span>${n ? `<span class="count" aria-label="${n} 处改动">${n}</span>` : ""}`;
    panel.querySelectorAll("[data-theme-set]").forEach((b) => b.classList.toggle("is-on", (b.dataset.themeSet === "dark") === isDark()));
  };
  const render = () => {
    syncChrome();
    if (panel.hidden) return;
    Object.entries(RENDER).forEach(([id, fn]) => { panes[id].innerHTML = fn(); });
  };
  /** 改值后只更新受影响的行和导出，不重画整块（保住正在拖的取色器和输入框焦点）。 */
  const syncValues = () => {
    syncChrome();
    const cs = getComputedStyle(root);
    panel.querySelectorAll("[data-row]").forEach((row) => {
      const v = row.dataset.row;
      const changed = Boolean(editOf(v));
      row.classList.toggle("is-changed", changed);
      const reset = row.querySelector("[data-reset]");
      if (reset) reset.hidden = !changed;
      const val = read(v, cs);
      row.querySelectorAll("input[data-var]").forEach((input) => {
        if (input === document.activeElement && input.type !== "color") return;
        if (input.type === "color") { const h = hex(val); if (h) input.value = h.rgb.toLowerCase(); }
        else if (input.type === "number") input.value = parseFloat(val);
        else input.value = val;
      });
      const show = row.querySelector("[data-show]");
      if (show) show.innerHTML = dot(val) + esc(val);
    });
    panes.export.innerHTML = exportPane();
  };
  const setOpen = (open, focus = true) => {
    panel.hidden = !open;
    fab.hidden = open;
    fab.setAttribute("aria-expanded", String(open));
    store.set(KEYS.open, open ? "1" : null, true);
    if (open) {
      render();
      if (focus) panel.querySelector('[role="tab"][aria-selected="true"]').focus();
    } else {
      setPicking(false);
      if (focus) fab.focus();
    }
  };

  // ---- 点选 ----
  const inPanel = (el) => panel.contains(el) || fab.contains(el);
  const onMove = (e) => {
    const el = e.target;
    if (!(el instanceof Element) || inPanel(el)) { hl.hidden = true; return; }
    const r = el.getBoundingClientRect();
    Object.assign(hl.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    hl.hidden = false;
  };
  const swallow = (e) => {
    if (inPanel(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  const onPick = (e) => {
    if (!(e.target instanceof Element) || inPanel(e.target)) return;
    swallow(e);
    picked = e.target;
    setPicking(false);
    panel.querySelector("#dsp-t-inspect").click();
    render();
  };
  const setPicking = (on) => {
    if (picking === on) return;
    picking = on;
    root.classList.toggle("dsp-picking", on);
    const method = on ? "addEventListener" : "removeEventListener";
    document[method]("mousemove", onMove, true);
    document[method]("click", onPick, true);
    ["mousedown", "pointerdown", "mouseup", "pointerup"].forEach((type) => document[method](type, swallow, true));
    if (!on) hl.hidden = true;
  };

  // ---- 交互 ----
  const commitInput = (input) => {
    const v = input.dataset.var;
    const t = T[v];
    let value = input.value.trim();
    if (input.type === "number") {
      if (value === "" || isNaN(Number(value))) return;
      value = `${Number(value)}px`;
    } else if (input.type === "color") {
      const now = hex(read(v));
      value = value.toUpperCase() + (now ? now.alpha : "");
    } else if (!value || !CSS.supports(t && t[2] === "color" ? "color" : "width", value)) {
      toast(`「${value}」不是有效的${t && t[2] === "color" ? "颜色" : "尺寸"}`);
      input.value = read(v);
      return;
    }
    setVar(v, value);
    syncValues();
  };
  panel.addEventListener("input", (e) => {
    const input = e.target.closest("input[data-var]");
    if (input && input.type !== "text") commitInput(input);
  });
  panel.addEventListener("change", (e) => {
    const input = e.target.closest("input[data-var]");
    if (input && input.type === "text") commitInput(input);
  });
  panel.addEventListener("click", (e) => {
    const t = e.target;
    const pick = t.closest("[data-palette-pick]");
    if (pick) { setPalette(pick.dataset.palettePick); return; }
    const reset = t.closest("[data-reset]");
    if (reset) { setVar(reset.dataset.reset, null); syncValues(); return; }
    const group = t.closest("[data-reset-group]");
    if (group) {
      const g = group.dataset.resetGroup;
      const vars = g === "brand" ? data.brand : data.groups.find((x) => x.id === g).vars;
      dropEdits((v) => vars.includes(v));
      render();
      return;
    }
    if (t.closest("[data-inspect]")) { setPicking(!picking); render(); return; }
    const c = t.closest("[data-copy]");
    if (c) {
      const kind = c.dataset.copy;
      if (kind === "list") copy(listText(), "改动清单");
      else if (kind === "ai") copy(aiText(), "给 AI 的话");
      else copy(location.href, "预览链接");
      return;
    }
    if (t.closest("[data-clear]")) {
      dropEdits(() => true);
      render();
      toast("已清空，回到规范原值");
      return;
    }
    if (t.closest("[data-dsp-close]")) setOpen(false);
  });
  fab.addEventListener("click", () => setOpen(true));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (picking) { setPicking(false); render(); e.stopImmediatePropagation(); return; }
    if (!panel.hidden && panel.contains(document.activeElement)) { setOpen(false); e.stopImmediatePropagation(); }
  }, true);
  // 亮 / 暗或颜色主题变了（顶栏按钮、面板里的切换）就重画：各档的值和「用在哪」跟着变
  let mode = `${isDark()}|${current().id}`;
  new MutationObserver(() => {
    const next = `${isDark()}|${current().id}`;
    if (next === mode) return;
    mode = next;
    render();
  }).observe(root, { attributes: true, attributeFilter: ["class", "data-palette"] });
  window.addEventListener("hashchange", () => { if (!panel.hidden && picked) panes.inspect.innerHTML = inspectPane(); });

  const auto = new URLSearchParams(location.search).get("panel") === "open" || store.get(KEYS.open, true) === "1";
  syncChrome();
  if (auto) setOpen(true, false);
})();
