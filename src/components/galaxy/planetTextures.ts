import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   PROCEDURAL PLANET TEXTURES — cinematic, restrained, one-time.

   Each planet surface is generated once on an offscreen canvas
   (512×256 equirectangular) with seeded value-noise FBM and then
   uploaded as a single SRGB texture. No runtime cost after init,
   no external image assets, deterministic across reloads.
   Palettes stay inside the site's graphite / steel identity —
   desaturated, dark, with at most one muted hue per planet.
   ═══════════════════════════════════════════════════════════════ */

export type PlanetSurface = "terran" | "banded" | "ice" | "crater" | "marble" | "night";

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* periodic value noise — wraps on x so the equirect seam is invisible */
function makeNoise(seed: number, size = 256) {
  const rnd = mulberry(seed);
  const g = new Float32Array(size * size);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  const at = (x: number, y: number) => g[(y % size) * size + (x % size)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = smooth(x - xi), yf = smooth(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, oct: number, lac = 2.1, gain = 0.55) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm;
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
];
const ramp = (stops: Array<{ at: number; c: RGB }>, t: number): RGB => {
  if (t <= stops[0].at) return stops[0].c;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (t <= b.at) return mix(a.c, b.c, (t - a.at) / (b.at - a.at));
  }
  return stops[stops.length - 1].c;
};
const css = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

/* ── per-type generators (all share the same seam-wrapped noise) ── */

function paintTerran(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const deep: RGB = [22, 30, 42], sea: RGB = [36, 50, 66], shore: RGB = [62, 78, 94],
    land: RGB = [84, 96, 110], high: RGB = [128, 140, 152], cap: RGB = [168, 176, 186];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      let h = fbm(n, u * 9.5, v * 4.6, 6);
      h = (h - 0.5) * 1.35 + 0.5;
      let c: RGB;
      if (h < 0.46) c = mix(deep, sea, h / 0.46);
      else if (h < 0.52) c = mix(sea, shore, (h - 0.46) / 0.06);
      else if (h < 0.62) c = mix(shore, land, (h - 0.52) / 0.1);
      else c = mix(land, high, (h - 0.62) / 0.38);
      /* close-range grain so the surface survives the C1 close-up */
      const grain = fbm(n, u * 34, v * 16, 3);
      c = mix(c, [c[0] * 0.72, c[1] * 0.72, c[2] * 0.75], Math.max(0, grain - 0.55) * 1.1);
      /* polar frost — faint, never bright white */
      const polar = Math.pow(Math.abs(v - 0.5) * 2, 7) * (0.55 + 0.45 * fbm(n, u * 11, v * 6, 3));
      c = mix(c, cap, Math.min(0.85, polar * 1.6));
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function paintBanded(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const bands: Array<{ at: number; c: RGB }> = [
    { at: 0.0, c: [44, 52, 62] }, { at: 0.18, c: [62, 72, 84] }, { at: 0.3, c: [94, 104, 116] },
    { at: 0.42, c: [124, 116, 104] },  /* single muted amber-brown band — the Spark nod */
    { at: 0.5, c: [78, 86, 98] }, { at: 0.62, c: [108, 118, 130] }, { at: 0.74, c: [64, 74, 86] },
    { at: 0.88, c: [50, 58, 70] }, { at: 1.0, c: [42, 50, 60] },
  ];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      /* warp the latitude with fbm → organic banding */
      const warp = (fbm(n, u * 5.5, v * 9, 5) - 0.5) * 0.1;
      let c = ramp(bands, Math.min(1, Math.max(0, v + warp)));
      const fine = fbm(n, u * 34, v * 62, 4);
      c = mix(c, [10, 12, 17], (fine - 0.5) * 0.42 + 0.05);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function paintIce(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const low: RGB = [64, 74, 86], mid: RGB = [124, 134, 146], high: RGB = [178, 186, 196];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const swirl = fbm(n, u * 6.5 + fbm(n, u * 4, v * 4, 4) * 1.7, v * 5.6, 6);
      let c = ramp([{ at: 0, c: low }, { at: 0.55, c: mid }, { at: 1, c: high }], swirl);
      const streak = fbm(n, u * 18, v * 90, 3);
      c = mix(c, high, Math.max(0, streak - 0.62) * 0.7);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function paintCrater(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const base: RGB = [38, 44, 52], rise: RGB = [78, 88, 100], tint: RGB = [100, 120, 142];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const h = (fbm(n, u * 10, v * 5.4, 6) - 0.5) * 1.3 + 0.5;
      let c = mix(base, rise, h);
      c = mix(c, tint, Math.max(0, fbm(n, u * 3 + 9, v * 3, 3) - 0.58) * 0.9);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  /* craters — soft rim shadows, drawn once over the noise */
  const rnd = mulberry(seed ^ 0x9e37);
  for (let k = 0; k < 46; k++) {
    const cx = rnd() * W, cy = H * 0.1 + rnd() * H * 0.8, r = 3 + rnd() * 13;
    const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    g.addColorStop(0, "rgba(10,12,16,0.34)");
    g.addColorStop(0.78, "rgba(14,17,22,0.16)");
    g.addColorStop(0.92, "rgba(120,132,146,0.14)");
    g.addColorStop(1, "rgba(120,132,146,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }
}

function paintMarble(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const deep: RGB = [34, 41, 49], vein: RGB = [86, 102, 118], glow: RGB = [138, 156, 172];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      /* ridged fbm → geological veins */
      const r1 = 1 - Math.abs(fbm(n, u * 8, v * 4.6, 6) * 2 - 1);
      const r2 = 1 - Math.abs(fbm(n, u * 17 + 4, v * 9.5, 5) * 2 - 1);
      let c = mix(deep, vein, Math.pow(r1, 2.6));
      c = mix(c, glow, Math.pow(r2, 5) * 0.55);
      const shade = fbm(n, u * 2.4, v * 1.7, 3);
      c = mix(c, deep, (shade - 0.5) * 0.5 + 0.1);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function paintNight(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const n = makeNoise(seed);
  const base: RGB = [30, 32, 42], ridge: RGB = [58, 58, 76], haze: RGB = [84, 82, 108];
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const h = fbm(n, u * 9, v * 5, 6);
      let c = mix(base, ridge, h);
      c = mix(c, haze, Math.max(0, fbm(n, u * 2.6 + 3, v * 2.2, 3) - 0.6) * 0.8);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  /* sparse settlement lights — graphite silver with two lime micro points */
  const rnd = mulberry(seed ^ 0x51f3);
  for (let k = 0; k < 90; k++) {
    const x = rnd() * W, y = H * 0.16 + rnd() * H * 0.68;
    const lime = k % 38 === 0;
    const r = lime ? 1.6 : 0.7 + rnd() * 0.9;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    const col = lime ? "204,255,0" : "196,206,218";
    g.addColorStop(0, `rgba(${col},${lime ? 0.85 : 0.62})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2); ctx.fill();
  }
}

export function makePlanetTexture(type: PlanetSurface, seed: number, anisotropy: number): THREE.CanvasTexture {
  const W = 512, H = 256;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  switch (type) {
    case "terran": paintTerran(ctx, W, H, seed); break;
    case "banded": paintBanded(ctx, W, H, seed); break;
    case "ice": paintIce(ctx, W, H, seed); break;
    case "crater": paintCrater(ctx, W, H, seed); break;
    case "marble": paintMarble(ctx, W, H, seed); break;
    case "night": paintNight(ctx, W, H, seed); break;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/* ── shared soft radial dot (stars / dust / glow sprites) ── */
export function makeSoftDot(size = 64, inner = 1): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(255,255,255,${inner})`);
  g.addColorStop(0.4, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/* ── wispy nebula blob — very low opacity, additive ── */
export function makeNebulaTexture(seed: number): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const n = makeNoise(seed, 128);
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const dx = u - 0.5, dy = v - 0.5;
      const fall = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 2);
      const wisp = fbm(n, u * 4, v * 4, 5);
      const a = Math.pow(fall, 2.2) * Math.pow(Math.max(0, wisp - 0.32) / 0.68, 1.7);
      const i = (y * S + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255;
      img.data[i + 3] = Math.min(255, a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/* ── ring band texture — 1D radial gradient stretched by RingGeometry UV ── */
export function makeRingTexture(seed: number): THREE.CanvasTexture {
  const W = 256;
  const c = document.createElement("canvas");
  c.width = W; c.height = 2;
  const ctx = c.getContext("2d")!;
  const rnd = mulberry(seed);
  let x = 0;
  while (x < W) {
    const w = 4 + rnd() * 22;
    const a = 0.05 + rnd() * 0.4;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(x, 0, w + 1, 2);
    x += w + 2 + rnd() * 14; /* gaps */
  }
  /* soft inner + outer falloff */
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.12, "rgba(0,0,0,0.55)");
  g.addColorStop(0.85, "rgba(0,0,0,0.3)");
  g.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
