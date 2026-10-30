import * as THREE from "three";
import { STATIONS } from "./labData";

/* ═══════════════════════════════════════════════════════════════
   LAB TEXTURES — one-time texture preparation for the laboratory.

   · real project screenshots → hologram screen textures (TextureLoader)
   · procedural dark-UI fallback if a screenshot ever fails
   · shared canvas textures: floor grid, hologram scanlines, soft
     particle dot, contact shadow — all tiny, all generated once
   ═══════════════════════════════════════════════════════════════ */

const loader = new THREE.TextureLoader();

/* ── real project screenshots, loaded once, keyed by project id ── */
export async function loadScreenTextures(): Promise<Map<number, THREE.Texture>> {
  const out = new Map<number, THREE.Texture>();
  await Promise.all(
    STATIONS.map(async ({ p }) => {
      try {
        const tex = await loader.loadAsync(p.image);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        out.set(p.id, tex);
      } catch {
        /* screenshot missing — the procedural fallback below is used */
      }
    })
  );
  return out;
}

export function disposeScreenTextures(texs: Map<number, THREE.Texture>) {
  for (const t of texs.values()) t.dispose();
  texs.clear();
}

/* ── procedural fallback: a quiet dark-UI plate with the number ── */
export function makeFallbackScreen(number: string, accent: string, W = 512, H = 320): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#0E1218";
  ctx.fillRect(0, 0, W, H);

  /* faint window chrome */
  ctx.strokeStyle = "rgba(94,143,168,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.beginPath();
  ctx.moveTo(10, 40);
  ctx.lineTo(W - 10, 40);
  ctx.stroke();

  /* data bars — abstract interface, no invented content */
  let seed = 4242 + Number(number) * 17;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  ctx.fillStyle = "rgba(83,108,131,0.4)";
  for (let i = 0; i < 12; i++) {
    const bw = 18 + rnd() * 46;
    ctx.fillRect(28 + i * 38, H - 40 - rnd() * (H * 0.45), bw, 14 + rnd() * (H * 0.4));
  }

  ctx.fillStyle = accent;
  ctx.font = "600 30px monospace";
  ctx.fillText(number, 26, 32);
  ctx.fillStyle = "rgba(169,178,188,0.5)";
  ctx.font = "16px monospace";
  ctx.fillText("HOLOGRAM OFFLINE — SCREENSHOT UNAVAILABLE", 96, 31);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ── floor grid — the laboratory floor plate ── */
export function makeFloorGridTexture(S = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0B0D10";
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = "rgba(83,108,131,0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = (i / 4) * S;
    ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(S, v); ctx.stroke();
  }
  /* micro ticks at intersections */
  ctx.fillStyle = "rgba(94,143,168,0.22)";
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) ctx.fillRect((i / 4) * S - 1, (j / 4) * S - 1, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(46, 30);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ── hologram scanlines — additive overlay on every screen ── */
export function makeScanTexture(S = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < S; y += 4) {
    ctx.fillStyle = "rgba(158,196,214,0.16)";
    ctx.fillRect(0, y, S, 1);
  }
  /* slow vertical sweep band */
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "rgba(158,196,214,0)");
  g.addColorStop(0.5, "rgba(158,196,214,0.12)");
  g.addColorStop(1, "rgba(158,196,214,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ── soft radial dot — dust particles + glows ── */
export function makeSoftDot(S = 64): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

/* ── contact shadow — fake grounding, no shadow maps ── */
export function makeContactShadow(S = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(0,0,0,0.62)");
  g.addColorStop(0.55, "rgba(0,0,0,0.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}
