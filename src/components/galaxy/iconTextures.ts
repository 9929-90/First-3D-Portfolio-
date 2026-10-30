import * as THREE from "three";
import { TECH_ICONS, readableHex } from "./techIcons";

/* ═══════════════════════════════════════════════════════════════
   HOLOGRAPHIC MARKER TEXTURES — official SVG paths rendered once
   onto small canvases (128px), used by the 3D orbiting markers.
   DOM panels draw the same paths inline as crisp SVG at any size.
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

/** draws one holographic marker: faint glow disc + hairline ring + logo */
function drawMarker(img: HTMLImageElement, color: string, S = 128): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;

  /* soft holographic backdrop */
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(83,108,131,0.30)");
  g.addColorStop(0.62, "rgba(83,108,131,0.10)");
  g.addColorStop(1, "rgba(83,108,131,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  /* hairline orbit ring */
  ctx.strokeStyle = "rgba(169,178,188,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.435, 0, Math.PI * 2);
  ctx.stroke();
  /* the brand glyph */
  const pad = S * 0.27;
  ctx.drawImage(img, pad, pad, S - pad * 2, S - pad * 2);
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
        tex.anisotropy = 2;
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
