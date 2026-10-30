import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC CAMERA PATH — the four reveal phases
   0.00–0.16  extreme close-up (upper body / nose, surface scale)
   0.16–0.46  dolly pullback past interstage, orbit drift
   0.46–0.78  descend along the body → fins → engine section
   0.78–1.00  pull back into the full-vehicle reveal composition
   The path is a CatmullRom dolly with per-keyframe dwell, so the
   scroll feels like operating a real camera crane, not a zoom.
   ═══════════════════════════════════════════════════════════════ */

interface Key {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

const KEYS: Key[] = [
  { p: 0.0,  pos: [1.15, 6.02, 1.38], look: [-0.26, 5.78, 0], fov: 40 },
  { p: 0.13, pos: [1.06, 5.32, 1.52], look: [-0.24, 5.08, 0], fov: 40 },
  { p: 0.28, pos: [1.36, 4.44, 2.16], look: [-0.2, 4.28, 0],  fov: 42 },
  { p: 0.46, pos: [1.86, 3.34, 2.76], look: [-0.05, 3.08, 0], fov: 44 },
  { p: 0.63, pos: [2.3, 1.9, 2.5],    look: [0, 1.55, 0],     fov: 46 },
  { p: 0.78, pos: [2.62, 0.98, 2.2],  look: [0.05, 0.85, 0],  fov: 48 },
  { p: 0.9,  pos: [3.6, 3.0, 7.0],    look: [0.08, 3.15, 0],  fov: 44 },
  { p: 1.0,  pos: [3.35, 3.75, 12.0], look: [0.05, 3.55, 0],  fov: 43 },
];

/** scroll progress held at the final composition when motion is reduced */
export const FINAL_P = 1;

const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.pos)),
  false,
  "centripetal",
  0.35
);
const lookCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.look)),
  false,
  "centripetal",
  0.35
);

/** map scroll progress → curve parameter, preserving keyframe dwell */
function progressToU(p: number): number {
  const n = KEYS.length;
  for (let i = 0; i < n - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b.p || i === n - 2) {
      const t = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
      return (i + t) / (n - 1);
    }
  }
  return 1;
}

function fovAt(p: number): number {
  const n = KEYS.length;
  for (let i = 0; i < n - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b.p || i === n - 2) {
      const t = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
      return THREE.MathUtils.lerp(a.fov, b.fov, t);
    }
  }
  return KEYS[n - 1].fov;
}

/** rocket body yaw across the journey — panels catch light differently */
export function rocketYawAt(p: number): number {
  return -0.22 + (1 - p) * 0.32;
}

export interface CameraSample {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function sampleCamera(p: number, out: CameraSample): CameraSample {
  const u = progressToU(p);
  posCurve.getPoint(u, _pos);
  lookCurve.getPoint(u, _look);
  out.pos.copy(_pos);
  out.look.copy(_look);
  out.fov = fovAt(p);
  return out;
}

export function makeCameraSample(): CameraSample {
  return { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 40 };
}
