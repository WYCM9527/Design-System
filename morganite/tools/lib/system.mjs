// 项目所用设计系统的验收口径从哪来（品牌色审计 brand.mjs 与对比度例外 approved.mjs 共用）：
//   接入过的项目：design-system/.adopter.json → 快照里的身份文件 design-system.json（accept.brand / accept.approvedContrast）
//                 + 清单记的颜色 palette → 快照里的 palettes/<id>.json（accept.brand / accept.approvedContrast）；
//   非 Node 项目（ds.mjs export 出来的 CSS）：--tokens 目录里的 design-system.export.json（export 时已按颜色合并好的 accept 段）。
// 都读不到返回 null（老项目，按 Citrine 处理）。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };

/** { id, brand, approvedContrast, palette: { id, name, found, brand, approvedContrast } | null } */
export function systemOf(appDir, tokensDir) {
  const manifest = readJson(join(appDir, 'design-system/.adopter.json'));
  if (manifest) {
    const snap = manifest.snapshot ? join(appDir, manifest.snapshot) : null;
    const identity = snap ? readJson(join(snap, 'design-system.json')) : null;
    const file = manifest.palette && snap ? readJson(join(snap, identity?.palettes?.dir || 'palettes', `${manifest.palette}.json`)) : null;
    return {
      id: manifest.system || identity?.id || null,
      brand: identity?.accept?.brand || null,
      approvedContrast: identity?.accept?.approvedContrast || [],
      palette: manifest.palette ? { id: manifest.palette, name: file?.name || manifest.palette, found: !!file, brand: file?.accept?.brand || null, approvedContrast: file?.accept?.approvedContrast || [] } : null,
    };
  }
  const exported = tokensDir ? readJson(join(tokensDir, 'design-system.export.json')) : null;
  if (exported?.system) return { id: exported.system, brand: exported.accept?.brand || null, approvedContrast: exported.accept?.approvedContrast || [], palette: exported.palette ? { id: exported.palette, name: exported.accept?.paletteName || exported.palette, found: true, brand: null, approvedContrast: null } : null };
  return null;
}

/** 当前颜色的已批准对比度例外：换过颜色用调色盘登记的，否则用身份文件里默认颜色的。 */
export const colorApproved = (sys) => (sys?.palette?.approvedContrast ?? sys?.approvedContrast) || [];
