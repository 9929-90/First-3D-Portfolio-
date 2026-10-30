import * as THREE from "three";
import { TECH_ICONS, readableHex } from "./techIcons";

/* ═══════════════════════════════════════════════════════════════
   HOLOGRAPHIC MARKER TEXTURES — official SVG paths rendered once
   onto crisp canvases (256px), used by the 3D orbiting markers.
   Each logo's artwork bounds are measured (alpha scan) so internal
   SVG whitespace is stripped and the glyph fills ~70% of the badge
   — centered, contain-fit (never stretched) — on a faint dark
   glass disc so it never washes out. DOM panels draw the same
   paths inline as crisp SVG at any size.
   ═══════════════════════════════════════════════════════════════ */

function svgToImage(path: string, vw: number, vh: number, color: string): Promise<HTMLImageElement> {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">` +
    `<path fill="${color}" d="${path}"/></svg>`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("svg load failed"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** draws one holographic marker: dark glass disc + glow + ring + LARGE logo */
function drawMarker(img: HTMLImageElement, color: string, S = 256): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;

  /* faint dark glass backing — guarantees contrast on any background */
  ctx.fillStyle = "rgba(8,9,11,0.42)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.485, 0, Math.PI * 2);
  ctx.fill();

  /* soft holographic backdrop */
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(83,108,131,0.34)");
  g.addColorStop(0.62, "rgba(83,108,131,0.12)");
  g.addColorStop(1, "rgba(83,108,131,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  /* hairline orbit ring */
  ctx.strokeStyle = "rgba(169,178,188,0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.462, 0, Math.PI * 2);
  ctx.stroke();
  /* the brand glyph — measured bounds, contain-fit, centered, LARGE.
     Strips each logo's internal SVG whitespace so padded marks like
     MySQL or Kafka render at their true visual size. */
  const GLYPH = 0.7;
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = S;
  const tctx = tmp.getContext("2d")!;
  tctx.drawImage(img, 0, 0, S, S);
  const data = tctx.getImageData(0, 0, S, S).data;
  let minX = S, minY = S, maxX = -1, maxY = -1;
  for (let y = 0; y < S; y++) {
    const row = y * S * 4;
    for (let x = 0; x < S; x++) {
      if (data[row + x * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX > minX && maxY > minY) {
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const s = Math.min((S * GLYPH) / bw, (S * GLYPH) / bh);
    const dw = bw * s;
    const dh = bh * s;
    ctx.drawImage(tmp, minX, minY, bw, bh, (S - dw) / 2, (S - dh) / 2, dw, dh);
  } else {
    /* no measurable bounds — fallback to padded square draw */
    const pad = S * 0.15;
    ctx.drawImage(img, pad, pad, S - pad * 2, S - pad * 2);
  }
  return c;
}

const cache = new Map<string, THREE.CanvasTexture>();

/** all markers needed by the planet registry — call once, before build */
export async function prepareIconTextures(slugs: string[]): Promise<Map<string, THREE.Texture>> {
  const out = new Map<string, THREE.Texture>();
  await Promise.all(
    [...new Set(slugs)].map(async (slug) => {
      const hit = cache.get(slug);
      if (hit) {
        out.set(slug, hit);
        return;
      }
      const def = TECH_ICONS[slug];
      if (!def) return;
      try {
        const img = await svgToImage(def.path, def.vw, def.vh, readableHex(def.hex));
        const tex = new THREE.CanvasTexture(drawMarker(img, readableHex(def.hex)));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        cache.set(slug, tex);
        out.set(slug, tex);
      } catch {
        /* marker simply absent — DOM panel still shows the logo */
      }
    })
  );
  return out;
}

export function disposeIconTextures() {
  for (const t of cache.values()) t.dispose();
  cache.clear();
}
