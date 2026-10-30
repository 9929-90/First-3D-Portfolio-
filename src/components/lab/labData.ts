import { PROJECTS, type Project } from "@/lib/data";

/* ═══════════════════════════════════════════════════════════════
   PROJECT HOLOGRAM — THE DIGITAL LABORATORY · station registry.

   Eight holographic workstations, mapped 1:1 from the real PROJECTS
   array in src/lib/data.ts. Nothing is invented — every title,
   summary, technology, link and screenshot comes from the portfolio
   data. The look fields only control how each station is staged in
   the 3D laboratory (subtle layout variation, one design language).
   ═══════════════════════════════════════════════════════════════ */

export type PedestalKind = "slab" | "pylon" | "ring";

export interface StationDef {
  p: Project;
  /* 3D staging */
  accent: string;        // muted blue / cyan / violet rotation
  lateral: number;       // corridor x offset
  z: number;             // corridor depth position
  yaw: number;           // screen facing variation
  pitch: number;         // screen tilt variation
  screenW: number;       // hologram width (world units)
  pedestal: PedestalKind;
  phase: number;         // bob / pulse phase
}

/* muted accent rotation — steel cyan, deep blue (site), quiet violet */
const ACCENTS = ["#5E8FA8", "#536C83", "#6B6478"] as const;

const CORRIDOR_START = -7;
const CORRIDOR_GAP = 7.6;

export const STATIONS: StationDef[] = PROJECTS.map((p, i) => {
  const lateral = (i % 2 === 0 ? -1 : 1) * (2.15 + (i % 3) * 0.28);
  return {
    p,
    accent: ACCENTS[i % ACCENTS.length],
    lateral,
    z: CORRIDOR_START - i * CORRIDOR_GAP,
    yaw: -lateral * 0.055 + (i % 2 === 0 ? 0.05 : -0.06),
    pitch: (i % 2 === 0 ? -1 : 1) * (0.02 + (i % 3) * 0.012),
    screenW: [2.7, 2.95, 2.45][i % 3],
    pedestal: (["slab", "pylon", "ring"] as PedestalKind[])[i % 3],
    phase: i * 1.31,
  };
});

/** holographic screen centre in world space (before bob/sway) */
export function stationScreenPos(i: number): [number, number, number] {
  const s = STATIONS[i];
  return [s.lateral, 1.95, s.z];
}

export const TOTAL_STATIONS = STATIONS.length;

/* ── the four scenes over the master scroll progress 0..1 ── */
export const SCENES = {
  enter: [0.0, 0.12],    // SCN.01 — entering the laboratory
  first: [0.12, 0.28],   // SCN.02 — first project reveal
  journey: [0.28, 0.85], // SCN.03 — the laboratory journey
  finale: [0.85, 1.0],   // SCN.04 — final laboratory overview
} as const;

/** per-station focus windows inside the master timeline */
export const STATION_WINDOWS: Array<[number, number]> = (() => {
  const windows: Array<[number, number]> = [[SCENES.first[0], SCENES.first[1]]];
  const span = (SCENES.journey[1] - SCENES.journey[0]) / (PROJECTS.length - 1);
  for (let k = 0; k < PROJECTS.length - 1; k++) {
    windows.push([SCENES.journey[0] + k * span, SCENES.journey[0] + (k + 1) * span]);
  }
  return windows;
})();

/** the real account behind every repo link in src/lib/data.ts */
export const GITHUB_PROFILE = "https://github.com/9929-90";
