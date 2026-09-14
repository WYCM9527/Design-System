// 无头 Chrome + 原生 CDP（WebSocket）。Node ≥ 22（全局 WebSocket / fetch），不依赖 puppeteer。
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function waitFor(fn, tries = 60, interval = 200) {
  let last;
  for (let i = 0; i < tries; i++) { try { return await fn(); } catch (e) { last = e; await sleep(interval); } }
  throw new Error(`waitFor 超时：${last?.message || last || 'unknown'}`);
}

/** 找到 Chrome 可执行文件：优先环境变量 CHROME，其次各平台默认位置。 */
export function findChrome() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('找不到 Chrome：请安装 Google Chrome，或用环境变量 CHROME 指定可执行文件路径');
  return found;
}

/**
 * 启动无头 Chrome 并连上第一个页面目标。
 * @returns {{ send, evalJs, callOn, close, chrome }}
 */
export async function launch({ width = 1600, height = 1000, scale = 1, port = 9222 + Math.floor(Math.random() * 500) } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'citrine-chrome-'));
  const chrome = spawn(findChrome(), [
    `--remote-debugging-port=${port}`, '--headless=new', '--hide-scrollbars', '--no-proxy-server', `--window-size=${width},${height}`,   // 只访问 127.0.0.1：绕开系统代理，否则代理环境下连本机被拒
    `--force-device-scale-factor=${scale}`, '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });
  const targets = await waitFor(async () => { const r = await fetch(`http://127.0.0.1:${port}/json/list`); const j = await r.json(); if (!j.length) throw new Error('no targets'); return j; });
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listeners.forEach((l) => l(m)); };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expression, { byValue = true } = {}) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: byValue, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return byValue ? r.result?.result?.value : r.result?.result;
  };
  const callOn = async (objectId, functionDeclaration) => (await send('Runtime.callFunctionOn', { objectId, functionDeclaration, returnByValue: true })).result?.result?.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  return {
    send, evalJs, callOn, chrome,
    onEvent: (fn) => listeners.push(fn),
    setViewport: (w, h, s = scale) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: s, mobile: false }),
    /** 导航并等待应用挂载（默认等 #app 有内容且正文文本超过 20 字） */
    goto: async (url, ready = "document.readyState === 'complete' && document.body && document.body.innerText.trim().length > 20") => {
      await send('Page.navigate', { url });
      await waitFor(async () => { const ok = await evalJs(ready); if (!ok) throw new Error('not ready'); return true; });
    },
    /** 清掉持久化的角色 / 主题，保证每个状态从干净的 storage 开始 */
    resetStorage: async (originUrl) => { await send('Page.navigate', { url: originUrl }); await sleep(200); try { await evalJs('localStorage.clear(); sessionStorage.clear(); "ok"'); } catch {} await send('Page.navigate', { url: 'about:blank' }); await sleep(80); },
    screenshot: async (opts = {}) => Buffer.from((await send('Page.captureScreenshot', { format: 'png', ...opts })).result.data, 'base64'),
    close: () => { try { ws.close(); } catch {} try { chrome.kill(); } catch {} },
  };
}
