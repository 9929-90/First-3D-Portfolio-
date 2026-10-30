import * as THREE from "three";
import { PLANETS, PLANET_WINDOWS, CHAPTERS } from "./galaxyData";

/* ═══════════════════════════════════════════════════════════════
   GALAXY CAMERA PATH — the five chapters of the Skill Galaxy.

   0.00–0.15  C1  extreme close-up on the Languages planet
   0.15–0.35  C2  dolly pullback — the system reveals, orbit lines fade in
   0.35–0.48  C3  cinematic approach — the Python planet
   0.48–0.78  C4  transit — planets 02 → 05, one continuous crane move
   0.78–1.00  C5  the Mobile & AI planet, then the full-system finale

   Same philosophy as the rocket: one CatmullRom crane with per-key
   dwell, so scrolling feels like operating a camera, not zooming.
   ═══════════════════════════════════════════════════════════════ */

export const FINAL_P_GALAXY = 0.94; /* held composition under reduced motion */

/** planet centres on their orbital rings (bob is added at runtime) */
export function planetBasePosition(i: number): THREE.Vector3 {
  const o = PLANETS[i].look.orbit;
  return new THREE.Vector3(Math.cos(o.angle) * o.r, o.y, Math.sin(o.angle) * o.r);
}

interface Key {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

const p1 = planetBasePosition(0);
const p2 = planetBasePosition(1);
const p3 = planetBasePosition(2);
const p4 = planetBasePosition(3);
const p5 = planetBasePosition(4);
const p6 = planetBasePosition(5);

/* sunlit-side portrait poses — every planet is met on its lit limb,
   so no planet ever reads as a black disc. Offset = sun-facing with
   an outward component (system context) + elevation. */
const SUN = new THREE.Vector3(16, 11, 9);
function litPose(planet: THREE.Vector3, dist: number, lift: number, tangent: number): [number, number, number] {
  const toSun = new THREE.Vector3().subVectors(SUN, planet).normalize();
  const outward = new THREE.Vector3(planet.x, 0, planet.z).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const tang = new THREE.Vector3().crossVectors(up, outward).normalize();
  const dir = new THREE.Vector3()
    .addScaledVector(toSun, 0.62)
    .addScaledVector(outward, 0.5)
    .addScaledVector(up, lift * 0.35)
    .addScaledVector(tang, tangent)
    .normalize();
  const pos = new THREE.Vector3().copy(planet).addScaledVector(dir, dist);
  pos.y += lift;
  return [pos.x, pos.y, pos.z];
}

const KEYS: Key[] = [
  /* C1 — surface-scale close-up, terminator across the limb */
  { p: 0.0,  pos: litPose(p1, 2.15, 0.95, -0.45), look: [p1.x, p1.y + 0.5, p1.z],  fov: 40 },
  { p: 0.15, pos: litPose(p1, 4.4, 1.2, -0.15),   look: [p1.x, p1.y, p1.z],       fov: 41 },
  /* C2 — pullback into the wide system view */
  { p: 0.28, pos: [5.2, 5.0, 13.2],                          look: [0.4, -0.2, -0.4],         fov: 46 },
  /* C3 — the Python planet portrait */
  { p: 0.415, pos: litPose(p1, 5.1, 1.35, 0.35),             look: [p1.x, p1.y, p1.z],        fov: 40 },
  /* C4 — transit portraits, planets 02–05 */
  { p: 0.5325, pos: litPose(p2, 8.0, 1.7, 0.4),              look: [p2.x, p2.y, p2.z],        fov: 40 },
  { p: 0.6175, pos: litPose(p3, 5.8, 1.5, -0.35),            look: [p3.x, p3.y, p3.z],        fov: 40 },
  { p: 0.6825, pos: litPose(p4, 6.3, 1.7, 0.35),             look: [p4.x, p4.y, p4.z],        fov: 40 },
  { p: 0.7475, pos: litPose(p5, 7.1, 1.8, -0.35),            look: [p5.x, p5.y, p5.z],        fov: 40 },
  /* C5 — the frontier planet, then the grand finale composition */
  { p: 0.8225, pos: litPose(p6, 6.1, 1.55, -0.35),           look: [p6.x, p6.y, p6.z],        fov: 40 },
  { p: 0.93,  pos: [8.5, 5.2, 17.5],                         look: [1.2, 0.2, -0.8],          fov: 44 },
  { p: 1.0,   pos: [1.5, 7.2, 24.5],                         look: [0, 0, 0],                 fov: 46 },
];

const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.pos)),
  false, "centripetal", 0.3
);
const lookCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.look)),
  false, "centripetal", 0.3
);

function segment(p: number): { a: Key; b: Key; t: number } {
  const n = KEYS.length;
  for (let i = 0; i < n - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (p <= b.p || i === n - 2) {
      return { a, b, t: THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1) };
    }
  }
  return { a: KEYS[n - 2], b: KEYS[n - 1], t: 1 };
}

function progressToU(p: number): number {
  const { a, b, t } = segment(p);
  const n = KEYS.length;
  const i = KEYS.indexOf(a);
  return (i + t) / (n - 1);
}

function fovAt(p: number): number {
  const { a, b, t } = segment(p);
  return THREE.MathUtils.lerp(a.fov, b.fov, t);
}

export interface GalaxySample {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  /** orbit-line opacity target 0..1 */
  orbit: number;
  /** nebula brightness target 0..1 */
  nebula: number;
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

/** orbit rings are invisible until C2 reveals them, luminous at the finale */
function orbitOpacityAt(p: number): number {
  if (p < CHAPTERS.reveal[0]) return 0;
  const rise = THREE.MathUtils.smoothstep(p, CHAPTERS.reveal[0] + 0.02, CHAPTERS.reveal[0] + 0.13);
  const finale = THREE.MathUtils.smoothstep(p, 0.86, 0.97);
  return 0.34 * rise + 0.4 * finale;
}

function nebulaAt(p: number): number {
  const rise = THREE.MathUtils.smoothstep(p, 0.1, 0.3);
  return 0.45 + 0.55 * rise;
}

export function sampleGalaxy(p: number, outS: GalaxySample): GalaxySample {
  posCurve.getPoint(progressToU(p), _pos);
  lookCurve.getPoint(progressToU(p), _look);
  outS.pos.copy(_pos);
  outS.look.copy(_look);
  outS.fov = fovAt(p);
  outS.orbit = orbitOpacityAt(p);
  outS.nebula = nebulaAt(p);
  return outS;
}

export function makeGalaxySample(): GalaxySample {
  return {
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
    fov: 40,
    orbit: 0,
    nebula: 0.45,
  };
}

/* ── focus weights — one bell per planet, drives holo icons + DOM ── */
const smoothstep = THREE.MathUtils.smoothstep;

export function focusWeights(p: number, out: Float32Array): Float32Array {
  for (let i = 0; i < PLANET_WINDOWS.length; i++) {
    const [a, b] = PLANET_WINDOWS[i];
    const rise = smoothstep(p, a - 0.05, a + 0.022);
    const fall = 1 - smoothstep(p, b - 0.018, b + 0.05);
    out[i] = rise * fall;
  }
  /* planet 01 is also the opening star of C1–C2 */
  const open = smoothstep(p, 0.0, 0.05) * (1 - smoothstep(p, 0.3, 0.38));
  out[0] = Math.max(out[0], open * 0.85);
  return out;
}
