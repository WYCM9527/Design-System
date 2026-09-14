#!/usr/bin/env node
// 预览 E（手写 token）与 S（种子构建产物 seed-dist）逐像素一致：admin 亮 / 暗 + stress 亮。
// 像素比对在浏览器 canvas 里完成，不依赖图像库。顶部 130px 的预览条（方案名与高亮）必然不同，跳过；
// 骨架屏流光与转圈有动画相位差，允许显著差异像素占比 ≤ 0.6%。
// 用法：node tools/diff-previews.mjs   退出码：任一组超阈值为 1。
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './lib/cdp.mjs';
import { serve } from './lib/serve.mjs';
import { PREVIEWS, outDir } from './lib/paths.mjs';

const OUT = outDir('previews');
const THRESHOLD = 0.006;
const server = await serve(PREVIEWS);
const browser = await launch({ width: 1440, height: 1000 });
const SHOTS = [['admin-light', 'admin.html?plan=', ''], ['admin-dark', 'admin.html?plan=', '&dark=1'], ['stress-light', 'stress.html?plan=', '']];
let failed = false;
try {
  const images = {};
  for (const [name, path, extra] of SHOTS) {
    for (const plan of ['e', 's']) {
      await browser.goto(`${server.url}/${path}${plan}${extra}`); await sleep(1500);
      const h = await browser.evalJs('document.documentElement.scrollHeight');
      await browser.setViewport(1440, Math.min(h, 4000)); await sleep(400);
      const png = await browser.screenshot();
      writeFileSync(`${OUT}/${name}-${plan}.png`, png);
      images[`${name}-${plan}`] = png.toString('base64');
    }
  }
  // 在浏览器里比对：两张图画到 canvas，统计通道差 ≥ 8 的像素
  await browser.goto('about:blank', 'true'); await sleep(200);
  for (const [name] of SHOTS) {
    const r = await browser.evalJs(`(async () => {
      const load = (b64) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/png;base64,' + b64; });
      const [a, b] = await Promise.all([load(${JSON.stringify(images[name + '-e'])}), load(${JSON.stringify(images[name + '-s'])})]);
      const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height), top = 130;
      const draw = (im) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.drawImage(im, 0, 0); return ctx.getImageData(0, top, w, h - top).data; };
      const da = draw(a), db = draw(b); let diff = 0, minX = w, minY = h, maxX = 0, maxY = 0;
      for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (d >= 8) { diff++; const p = i / 4, x = p % w, y = top + Math.floor(p / w); if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; } }
      return { diff, total: w * (h - top), ratio: diff / (w * (h - top)), bbox: diff ? [minX, minY, maxX, maxY] : null, sizeE: [a.width, a.height], sizeS: [b.width, b.height] };
    })()`);
    const ok = r.ratio <= THRESHOLD && r.sizeE[1] === r.sizeS[1];
    if (!ok) failed = true;
    console.log(`${ok ? 'ok  ' : 'FAIL'} E/S ${name.padEnd(13)} 差异像素 ${r.diff} / ${r.total}（${(r.ratio * 100).toFixed(3)}%） bbox=${JSON.stringify(r.bbox)} 高度 E ${r.sizeE[1]} / S ${r.sizeS[1]}`);
  }
} finally { browser.close(); server.close(); }
console.log(`\n截图 → ${OUT}`);
if (failed) process.exit(1); console.log('通过：预览 E 与 S 逐像素一致（动画相位差在阈值内）。');
