import * as THREE from "three";
import { STATIONS, STATION_WINDOWS, SCENES, TOTAL_STATIONS, stationScreenPos } from "./labData";

/* ═══════════════════════════════════════════════════════════════
   LAB CAMERA PATH — the four scenes of the Digital Laboratory.

   0.00–0.12  SCN.01  entering the laboratory — slow dolly down the
                      corridor, particles wake, title on screen
   0.12–0.28  SCN.02  first workstation reveal — cinematic approach
   0.28–0.85  SCN.03  the journey — one continuous crane through
                      every workstation, dwell at each
   0.85–1.00  SCN.04  pull back + rise — the full laboratory overview

   Same philosophy as the rocket and the galaxy: one CatmullRom crane
   with per-key dwell, so scrolling operates a camera, not a zoom.
   ═══════════════════════════════════════════════════════════════ */

export const FINAL_P_LAB = 0.965; /* held composition under reduced motion */

interface Key {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

/* off-axis cinematic pose for one workstation — alternating side and
   elevation so no two approaches feel identical */
function stationPose(i: number): { pos: [number, number, number]; look: [number, number, number] } {
  const [x, y, z] = stationScreenPos(i);
  const side = i % 2 === 0 ? 0.95 : -0.95;
  const lift = i % 3 === 0 ? 0.18 : i % 3 === 1 ? -0.08 : 0.05;
  return {
    pos: [x * 0.34 + side, 2.02 + lift, z + 5.15],
    look: [x * 0.86, y - 0.05, z + 0.2],
  };
}

const KEYS: Key[] = [
  /* SCN.01 — the dark corridor, particles only */
  { p: 0.0,  pos: [0.0, 2.08, 12.6], look: [0.0, 1.75, -6.0],  fov: 43 },
  { p: 0.06, pos: [0.3, 2.02, 10.6], look: [-0.5, 1.82, -8.5], fov: 42 },
  /* SCN.02 — first workstation dwell (window centre) */
  { p: 0.2,  ...stationPose(0), fov: 40 },
  /* SCN.03 — one dwell key per remaining workstation */
  ...STATIONS.slice(1).map((_, k) => ({
    p: (STATION_WINDOWS[k + 1][0] + STATION_WINDOWS[k + 1][1]) / 2,
    ...stationPose(k + 1),
    fov: 40,
  })),
  /* SCN.04 — pull back, rise, the whole laboratory */
  { p: 0.9,  pos: [0.0, 5.4, 9.5],   look: [0.0, 1.3, -23.0], fov: 45 },
  { p: 1.0,  pos: [0.0, 11.2, 16.5], look: [0.0, 0.3, -28.0], fov: 50 },
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
  const { a, t } = segment(p);
  return (KEYS.indexOf(a) + t) / (KEYS.length - 1);
}

function fovAt(p: number): number {
  const { a, b, t } = segment(p);
  return THREE.MathUtils.lerp(a.fov, b.fov, t);
}

export interface LabSample {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  /** lab lights / pads intensity 0..1 — wakes during the entry */
  glow: number;
  /** overview blend 0..1 — finale wide framing effects */
  overview: number;
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function sampleLab(p: number, outS: LabSample): LabSample {
  posCurve.getPoint(progressToU(p), _pos);
  lookCurve.getPoint(progressToU(p), _look);
  outS.pos.copy(_pos);
  outS.look.copy(_look);
  outS.fov = fovAt(p);
  outS.glow = THREE.MathUtils.smoothstep(p, 0.02, 0.16);
  outS.overview = THREE.MathUtils.smoothstep(p, SCENES.finale[0], SCENES.finale[0] + 0.1);
  return outS;
}

export function makeLabSample(): LabSample {
  return {
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
    fov: 42,
    glow: 0,
    overview: 0,
  };
}

/* ── focus weights — one bell per workstation, drives holograms + DOM ── */
const smoothstep = THREE.MathUtils.smoothstep;

export function focusWeights(p: number, out: Float32Array): Float32Array {
  for (let i = 0; i < TOTAL_STATIONS; i++) {
    const [a, b] = STATION_WINDOWS[i];
    const rise = smoothstep(p, a - 0.045, a + 0.02);
    const fall = 1 - smoothstep(p, b - 0.016, b + 0.045);
    out[i] = rise * fall;
  }
  return out;
}

/** which station window contains p (−1 while cruising) */
export function stationAt(p: number): number {
  for (let i = 0; i < TOTAL_STATIONS; i++) {
    const [a, b] = STATION_WINDOWS[i];
    if (p >= a - 0.012 && p <= b + 0.012) return i;
  }
  return -1;
}

/** HUD scene label for a progress value */
export function sceneAt(p: number): string {
  if (p < SCENES.first[0]) return "SCN.01/04 — ENTER";
  if (p < SCENES.journey[0]) return "SCN.02/04 — APPROACH";
  if (p < SCENES.finale[0]) return "SCN.03/04 — JOURNEY";
  return "SCN.04/04 — OVERVIEW";
}
