/* 玫瑰金后台 · 效果预览的壳层与路由：所有页面都在 index.html 里，按 #/路由 切换视图（浏览器前进 / 后退可用）。
   视图是带 data-route 的元素；壳层负责图标表、侧栏、顶栏（工作台显示问候语，其余显示面包屑）、导航高亮与页面标题，以及各页共用的小交互。
   主题跟随 ?theme=light|dark，切换后存进 localStorage（<head> 里的内联脚本负责首屏不闪）；?open=<id> 打开指定弹层，便于截图。 */
(function () {
  "use strict";
  const root = document.documentElement;
  const body = document.body;
  const store = {
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* 隐私模式下不持久化 */ } },
  };

  const ICONS = {
    dash: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    case: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
    trend: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4.5 3 2.5 4.5-6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    swap: '<path d="M4 8.5h15l-3.5-3.5M20 15.5H5l3.5 3.5"/>',
    file: '<path d="M7 3.5h7l4.5 4.5v12.5H7z"/><path d="M14 3.5V8h4.5M10 13h5.5M10 16.5h5.5"/>',
    sliders: '<path d="M4 7h9.5M18.5 7H20M4 17h3.5M12.5 17H20"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
    shapes: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><circle cx="17" cy="7" r="3.5"/><path d="M7 13.5l3.5 7h-7z"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    chat: '<path d="M4 5h16v11H9.5L5 19.5V16H4z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
    down: '<path d="M6 9.5l6 6 6-6"/>',
    left: '<path d="M14.5 6l-6 6 6 6"/>',
    chevron: '<path d="M9.5 6l6 6-6 6"/>',
    more: '<circle cx="12" cy="5.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.5" fill="currentColor" stroke="none"/>',
    right: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    logout: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1v-7.5z"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/>',
    success: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l3 3 5-6"/>',
    warning: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r="1" fill="currentColor" stroke="none"/>',
    error: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17.5h2"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
    shield: '<path d="M12 3.5l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5z"/><path d="M9 12l2 2 4-4"/>',
    refresh: '<path d="M19 12a7 7 0 1 1-2.05-4.95M19 4.5V8h-3.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  };
  const NAV = [
    { group: "概览", items: [
      { key: "dashboard", label: "工作台", href: "#/dashboard", icon: "dash" },
      { key: "portfolio", label: "资产组合", href: "#/empty/portfolio", icon: "case" },
      { key: "market", label: "市场行情", href: "#/empty/market", icon: "trend" },
    ] },
    { group: "交易", items: [
      { key: "transactions", label: "交易记录", href: "#/transactions", icon: "list" },
      { key: "new", label: "新建交易", href: "#/transactions/new", icon: "edit" },
      { key: "transfer", label: "资金划转", href: "#/empty/transfer", icon: "swap" },
    ] },
    { group: "系统", items: [
      { key: "settings", label: "系统设置", href: "#/settings", icon: "sliders" },
      { key: "kitchen", label: "组件走查", href: "#/kitchen", icon: "shapes" },
    ] },
  ];
  // 路由 → 视图（data-route）、导航高亮、顶栏左侧、页面标题；空状态页按模块换文案
  const EMPTY = {
    portfolio: { group: "概览", name: "资产组合", icon: "case", desc: "这个模块还没有接入数据。可以先回工作台看总览，或者去交易记录查明细。" },
    market: { group: "概览", name: "市场行情", icon: "trend", desc: "行情数据源还在对接中，接入后这里会显示指数、板块与自选列表。" },
    transfer: { group: "交易", name: "资金划转", icon: "swap", desc: "划转需要先完成账户绑定。绑定流程上线后，这里会列出可划转的账户与额度。" },
  };
  const ROUTES = {
    dashboard: { nav: "dashboard", title: "工作台", greeting: true },
    transactions: { nav: "transactions", title: "交易记录", crumbs: [["交易"], ["交易记录"]] },
    "transactions/new": { nav: "new", title: "新建交易", crumbs: [["交易"], ["交易记录", "#/transactions"], ["新建交易"]] },
    "transactions/detail": { nav: "transactions", title: "交易详情", crumbs: [["交易"], ["交易记录", "#/transactions"], ["TX20260928001"]] },
    settings: { nav: "settings", title: "系统设置", crumbs: [["系统"], ["系统设置"]] },
    kitchen: { nav: "kitchen", title: "组件走查", crumbs: [["系统"], ["组件走查"]] },
    login: { title: "登录", bare: true },
  };
  Object.entries(EMPTY).forEach(([key, p]) => { ROUTES[`empty/${key}`] = { view: "empty", nav: key, title: p.name, crumbs: [[p.group], [p.name]], empty: p }; });

  const icon = (id, cls) => `<svg class="icon${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  window.MorganiteIcon = icon;
  body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position: absolute" aria-hidden="true">${Object.entries(ICONS).map(([id, d]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${d}</symbol>`).join("")}</svg>`);

  const params = new URLSearchParams(location.search);
  const app = document.querySelector(".app");
  const nav = NAV.map((g) => `<div class="nav-group">${g.group}</div>` + g.items.map((it) => `<a href="${it.href}" data-nav="${it.key}">${icon(it.icon)}<span class="nav-label">${it.label}</span></a>`).join("")).join("");
  app.insertAdjacentHTML("afterbegin", `<aside class="sidebar" id="sidebar"><a class="app-brand" href="#/dashboard"><span class="logo">M</span><span>玫瑰金后台</span></a><nav class="nav" aria-label="主导航">${nav}</nav><div class="sidebar-foot">Morganite 0.1.0 · 效果预览</div></aside><button class="sidebar-mask" type="button" aria-label="关闭导航"></button>`);
  app.querySelector(".main").insertAdjacentHTML("afterbegin", `<header class="topbar">
    <button class="iconbtn menu-btn" type="button" aria-label="打开导航" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button>
    <nav class="crumbs" aria-label="面包屑"></nav>
    <label class="search">${icon("search", "icon--sm")}<input type="search" placeholder="搜索资产、交易、报表…" aria-label="搜索"></label>
    <button class="iconbtn" type="button" aria-label="通知，3 条未读" data-toast="已全部标记为已读">${icon("bell")}<span class="unread">3</span></button>
    <button class="iconbtn" type="button" aria-label="消息，1 条未读" data-toast="消息中心建设中">${icon("chat")}<span class="unread">1</span></button>
    <button class="iconbtn" type="button" id="themeToggle" aria-pressed="false" aria-label="切换到暗色">${icon("moon")}</button>
    <div class="popover-anchor">
      <button class="user" type="button" aria-haspopup="menu" aria-expanded="false"><span class="avatar">王</span><span class="user-name">王晓明</span>${icon("down", "icon--sm user-caret")}</button>
      <div class="menu" role="menu" hidden>
        <a class="menu-item" role="menuitem" href="#/settings">${icon("user")}个人设置</a>
        <a class="menu-item" role="menuitem" href="#/kitchen">${icon("shapes")}组件走查</a>
        <div class="menu-sep" role="separator"></div>
        <a class="menu-item danger" role="menuitem" href="#/login">${icon("logout")}退出登录</a>
      </div>
    </div>
  </header>`);
  const topbar = app.querySelector(".topbar");

  // 主题：激活方式与 theme-map 一致（<html class="dark">）
  const toggle = document.getElementById("themeToggle");
  const syncTheme = () => {
    const dark = root.classList.contains("dark");
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.classList.toggle("is-on", (b.dataset.themeSet === "dark") === dark));
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "切换到亮色" : "切换到暗色");
    toggle.querySelector("use").setAttribute("href", dark ? "#i-sun" : "#i-moon");
  };
  toggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    store.set("morganite-theme", root.classList.contains("dark") ? "dark" : "light");
    syncTheme();
  });
  syncTheme();

  // 手机宽度下侧栏是抽屉：配方只认 .app 上的 .is-nav-open
  const menuBtn = topbar.querySelector(".menu-btn");
  const setNav = (open) => {
    app.classList.toggle("is-nav-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setNav(!app.classList.contains("is-nav-open")));
  app.querySelector(".sidebar-mask").addEventListener("click", () => setNav(false));

  // 下拉菜单：触发按钮 aria-haspopup="menu"，菜单是它的下一个兄弟
  const closeMenus = (except) => document.querySelectorAll('[aria-haspopup="menu"][aria-expanded="true"]').forEach((b) => {
    if (b === except) return;
    b.setAttribute("aria-expanded", "false");
    b.nextElementSibling.hidden = true;
  });

  // 弹窗 / 抽屉：.layer[hidden] 由 data-open="id" 打开，data-close / 点遮罩 / Esc 关闭，关闭后焦点还给触发者
  let lastFocus = null;
  const openLayer = (id) => {
    const layer = document.getElementById(id);
    if (!layer) return;
    lastFocus = document.activeElement;
    layer.hidden = false;
    body.style.overflow = "hidden";
    const first = layer.querySelector("[autofocus], .modal-foot .btn--primary, .drawer-body input, .drawer-body textarea, button");
    if (first) first.focus();
  };
  const closeLayer = (layer) => {
    if (!layer) return;
    layer.hidden = true;
    if (!document.querySelector(".layer:not([hidden])")) body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  const toast = (text) => {
    let host = document.querySelector(".toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-host";
      host.setAttribute("role", "status");
      body.appendChild(host);
    }
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = icon("success", "icon--sm");
    const span = document.createElement("span");
    span.textContent = text;
    item.appendChild(span);
    host.appendChild(item);
    setTimeout(() => item.remove(), 2400);
  };
  window.MorganiteToast = toast;

  const selectTab = (tab) => {
    tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]').forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };

  // 路由：切视图、导航高亮、顶栏左侧、标题；切换时关掉菜单 / 弹层 / 手机抽屉并回到顶部
  const routeKey = () => {
    const key = location.hash.replace(/^#\/?/, "");
    return ROUTES[key] ? key : "dashboard";
  };
  const render = () => {
    const key = routeKey();
    const r = ROUTES[key];
    const view = r.view || key;
    document.querySelectorAll("[data-route]").forEach((el) => { el.hidden = el.dataset.route !== view; });
    app.hidden = Boolean(r.bare);
    app.querySelectorAll(".nav a").forEach((a) => {
      const on = a.dataset.nav === r.nav;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (!r.bare) {
      const lead = topbar.querySelector(".greet, .crumbs");
      lead.outerHTML = r.greeting
        ? '<div class="greet"><span class="greet__hi">2026 年 9 月 29 日 · 周二</span><b class="greet__name">欢迎回来，王晓明</b></div>'
        : `<nav class="crumbs" aria-label="面包屑">${r.crumbs.map(([label, href], i) => (i ? '<span class="sep">/</span>' : "") + (href ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`)).join("")}</nav>`;
    }
    if (r.empty) {
      document.getElementById("empty-title").textContent = `${r.empty.name}正在建设中`;
      document.getElementById("empty-desc").textContent = r.empty.desc;
      document.getElementById("empty-icon").setAttribute("href", `#i-${r.empty.icon}`);
    }
    document.title = `${r.title} · 玫瑰金后台`;
    closeMenus();
    document.querySelectorAll(".layer:not([hidden])").forEach((l) => { l.hidden = true; });
    body.style.overflow = "";
    setNav(false);
    window.scrollTo(0, 0);
  };
  window.addEventListener("hashchange", render);

  document.addEventListener("click", (e) => {
    const t = e.target;
    const trigger = t.closest('[aria-haspopup="menu"]');
    if (trigger) {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      closeMenus(trigger);
      trigger.setAttribute("aria-expanded", String(open));
      trigger.nextElementSibling.hidden = !open;
      return;
    }
    if (!t.closest(".menu") || t.closest(".menu-item")) closeMenus();
    const themeSet = t.closest("[data-theme-set]");
    if (themeSet) {
      root.classList.toggle("dark", themeSet.dataset.themeSet === "dark");
      store.set("morganite-theme", themeSet.dataset.themeSet);
      syncTheme();
    }
    const cell = t.closest(".stat-strip .is-clickable");
    if (cell) cell.parentElement.querySelectorAll(".is-clickable").forEach((c) => c.classList.toggle("is-active", c === cell));
    const page = t.closest(".pagination .page");
    if (page && !page.disabled && /^\d+$/.test(page.textContent.trim())) {
      page.parentElement.querySelectorAll(".page").forEach((p) => p.removeAttribute("aria-current"));
      page.setAttribute("aria-current", "page");
    }
    const opener = t.closest("[data-open]");
    if (opener) { e.preventDefault(); openLayer(opener.dataset.open); return; }
    const closer = t.closest("[data-close]");
    if (closer) { closeLayer(closer.closest(".layer")); return; }
    if (t.classList.contains("layer")) { closeLayer(t); return; }
    const toaster = t.closest("[data-toast]");
    if (toaster) { e.preventDefault(); toast(toaster.dataset.toast); if (toaster.closest(".layer") && toaster.matches("[data-close-after]")) closeLayer(toaster.closest(".layer")); }
    const tab = t.closest('[role="tab"]');
    if (tab) selectTab(tab);
    const seg = t.closest(".seg button");
    if (seg) seg.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === seg));
    const chipX = t.closest(".chip .x");
    if (chipX) chipX.closest(".chip").remove();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const open = [...document.querySelectorAll(".layer:not([hidden])")].pop();
      if (open) { closeLayer(open); return; }
      closeMenus();
      setNav(false);
      return;
    }
    const tab = e.target.closest && e.target.closest('[role="tab"]');
    if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const next = tabs[(tabs.indexOf(tab) + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    }
  });

  // 表格勾选：表头 data-select-all 全选；勾选行加 .is-selected，同卡片里的 .batch 显示已选数量
  const syncBatch = (table) => {
    const rows = [...table.querySelectorAll("tbody input[type=checkbox]")];
    const n = rows.filter((c) => c.checked).length;
    const head = table.querySelector("[data-select-all]");
    if (head) {
      head.checked = n > 0 && n === rows.length;
      head.indeterminate = n > 0 && n < rows.length;
      head.nextElementSibling.classList.toggle("is-mixed", head.indeterminate);
    }
    const bar = table.closest(".panel") && table.closest(".panel").querySelector(".batch");
    if (bar) {
      bar.hidden = n === 0;
      const count = bar.querySelector("[data-selected-count]");
      if (count) count.textContent = n;
    }
  };
  document.addEventListener("change", (e) => {
    const t = e.target;
    const table = t.closest && t.closest("table");
    if (!table || t.type !== "checkbox") return;
    if (t.matches("[data-select-all]")) {
      table.querySelectorAll("tbody input[type=checkbox]").forEach((c) => { c.checked = t.checked; c.closest("tr").classList.toggle("is-selected", t.checked); });
    } else {
      t.closest("tr").classList.toggle("is-selected", t.checked);
    }
    syncBatch(table);
  });
  document.querySelectorAll("table [data-select-all]").forEach((h) => syncBatch(h.closest("table")));

  render();
  const auto = params.get("open");
  if (auto) openLayer(auto);
})();
