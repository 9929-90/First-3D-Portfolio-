import * as THREE from "three";
import { STATIONS, type StationDef } from "./labData";
import {
  makeFallbackScreen, makeFloorGridTexture, makeScanTexture,
  makeSoftDot, makeContactShadow,
} from "./labTextures";

/* ═══════════════════════════════════════════════════════════════
   LAB SCENE — one imperative build, zero per-frame allocation.

   Contents
   · dark laboratory floor plate (procedural grid, repeating)
   · 8 holographic workstations — real project screenshot on a glass
     hologram, edge frame, scanline overlay, status light (semantic:
     lime live / orange wip / grey coming-soon), pedestal variant,
     landing pad, fake contact shadow
   · corridor light columns + three wireframe survey shapes
   · floating dust — one Points cloud drifting through the corridor
   · restrained lighting: ambient + key + rim + 3 corridor points

   Draw calls ≈ 95 desktop / ≈ 65 mobile. No shadow maps, no
   post-processing, no render targets. Screens share geometries and
   differ only in material uniforms.
   ═══════════════════════════════════════════════════════════════ */

export interface LabHandle {
  group: THREE.Group;
  update(dt: number, p: number, camera?: THREE.Camera): void;
  dispose(): void;
}

const STATUS_COLOR: Record<string, number> = {
  live: 0xccff00,
  wip: 0xf59e4c,
  "coming-soon": 0x9fb4c7,
};

export function buildLab(
  isMobile: boolean,
  screenTexs: Map<number, THREE.Texture>
): LabHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(d: T): T => { disposables.push(d); return d; };

  /* ── shared canvas textures ── */
  const floorTex = track(makeFloorGridTexture());
  const scanTex = track(makeScanTexture());
  scanTex.repeat.set(2, 3);
  const softDot = track(makeSoftDot());
  const shadowTex = track(makeContactShadow());

  /* ── lighting — restrained, cinematic ── */
  group.add(new THREE.AmbientLight(0x424c58, 0.52));
  const key = new THREE.DirectionalLight(0xdfe6ee, 2.1);
  key.position.set(10, 15, 7);
  group.add(key);
  const rim = new THREE.DirectionalLight(0x536c83, 0.85);
  rim.position.set(-12, -5, -9);
  group.add(rim);
  const corridorZ = isMobile ? [-16, -40] : [-14, -30, -48];
  for (const z of corridorZ) {
    const pl = new THREE.PointLight(0x5e8fa8, 2.3, 30, 1.7);
    pl.position.set(0, 4.6, z);
    group.add(pl);
  }

  /* ── floor plate ── */
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(240, 170)),
    track(new THREE.MeshStandardMaterial({
      map: floorTex, color: 0xb6bec7, roughness: 0.95, metalness: 0.02,
    }))
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -26);
  group.add(floor);

  /* ── corridor light columns ── */
  const colGeo = track(new THREE.BoxGeometry(0.07, 8.5, 0.07));
  const colMat = track(new THREE.MeshStandardMaterial({
    color: 0x1c242e, roughness: 0.5, metalness: 0.55,
  }));
  const colCapGeo = track(new THREE.BoxGeometry(0.1, 0.1, 0.1));
  const colCapMat = track(new THREE.MeshBasicMaterial({ color: 0x5e8fa8 }));
  const colStep = isMobile ? 14 : 10;
  for (let z = 4; z >= -64; z -= colStep) {
    for (const x of [-8.6, 8.6]) {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(x, 4.25, z);
      group.add(col);
      const cap = new THREE.Mesh(colCapGeo, colCapMat);
      cap.position.set(x, 8.52, z);
      group.add(cap);
    }
  }

  /* ── wireframe survey shapes — barely-there depth markers ── */
  const surveys: THREE.LineSegments[] = [];
  if (!isMobile) {
    const sMat = track(new THREE.LineBasicMaterial({
      color: 0x3a4756, transparent: true, opacity: 0.3, depthWrite: false,
    }));
    const spots: Array<[number, number, number, number]> = [
      [-7.2, 3.6, -12, 1.7], [7.4, 4.4, -34, 2.3], [-6.8, 3.2, -54, 2.0],
    ];
    for (const [x, y, z, r] of spots) {
      const g = track(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r, 0)));
      const s = new THREE.LineSegments(g, sMat);
      s.position.set(x, y, z);
      surveys.push(s);
      group.add(s);
    }
  }

  /* ── dust — one Points cloud drifting through the corridor ── */
  const dustCount = isMobile ? 220 : 520;
  let dust: THREE.Points;
  {
    let seed = 90210;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pts = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pts[i * 3] = (rnd() - 0.5) * 18;
      pts[i * 3 + 1] = 0.15 + rnd() * 5.4;
      pts[i * 3 + 2] = 8 - rnd() * 80;
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = track(new THREE.PointsMaterial({
      map: softDot, color: 0x8fa3b5, size: 0.055, transparent: true, opacity: 0.34,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    dust = new THREE.Points(g, m);
    group.add(dust);
  }

  /* ── workstation shared geometry (3 screen sizes) ── */
  const screenGeoByW = new Map<number, THREE.PlaneGeometry>();
  const glowGeoByW = new Map<number, THREE.PlaneGeometry>();
  const edgeGeoByW = new Map<number, THREE.EdgesGeometry>();
  const slabGeo = track(new THREE.BoxGeometry(2.0, 0.42, 1.15));
  const stripGeo = track(new THREE.BoxGeometry(2.06, 0.02, 0.07));
  const pylonGeo = track(new THREE.CylinderGeometry(0.3, 0.38, 1.35, 20));
  const pylonCapGeo = track(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 20));
  const ringGeo = track(new THREE.TorusGeometry(0.82, 0.045, 12, 44));
  const ringColGeo = track(new THREE.CylinderGeometry(0.16, 0.21, 1.5, 14));
  const ringTopGeo = track(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 22));
  const padGeo = track(new THREE.PlaneGeometry(3.3, 0.95));
  const shadowGeo = track(new THREE.PlaneGeometry(3.8, 2.3));
  const statusGeo = track(new THREE.SphereGeometry(0.034, 10, 8));
  const pedestalMat = track(new THREE.MeshStandardMaterial({
    color: 0x171d25, roughness: 0.42, metalness: 0.62,
  }));
  const shadowMat = track(new THREE.MeshBasicMaterial({
    map: shadowTex, transparent: true, opacity: 0.6, depthWrite: false,
  }));

  interface StationRig {
    def: StationDef;
    screenGroup: THREE.Group;
    screenMat: THREE.MeshBasicMaterial;
    glowMat: THREE.MeshBasicMaterial;
    scanMat: THREE.MeshBasicMaterial;
    edgeMat: THREE.LineBasicMaterial;
    padMat: THREE.MeshBasicMaterial;
    statusMat: THREE.MeshBasicMaterial;
    statusSpriteMat: THREE.SpriteMaterial;
  }
  const rigs: StationRig[] = [];

  for (const def of STATIONS) {
    const anchor = new THREE.Group();
    anchor.position.set(def.lateral, 0, def.z);

    /* pedestal — three layout variants, one design language */
    const ped = new THREE.Group();
    if (def.pedestal === "slab") {
      const slab = new THREE.Mesh(slabGeo, pedestalMat);
      slab.position.y = 0.21;
      ped.add(slab);
      const strip = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({
        color: def.accent, transparent: true, opacity: 0.55,
      }));
      strip.position.set(0, 0.435, 0.56);
      track(strip.material as THREE.Material);
      ped.add(strip);
    } else if (def.pedestal === "pylon") {
      const pyl = new THREE.Mesh(pylonGeo, pedestalMat);
      pyl.position.y = 0.675;
      ped.add(pyl);
      const cap = new THREE.Mesh(pylonCapGeo, pedestalMat);
      cap.position.y = 1.38;
      ped.add(cap);
    } else {
      const ring = new THREE.Mesh(ringGeo, pedestalMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      ped.add(ring);
      const col = new THREE.Mesh(ringColGeo, pedestalMat);
      col.position.y = 0.75;
      ped.add(col);
      const top = new THREE.Mesh(ringTopGeo, pedestalMat);
      top.position.y = 1.52;
      ped.add(top);
    }
    anchor.add(ped);

    /* landing pad in front of the station */
    const padMat = track(new THREE.MeshBasicMaterial({
      map: softDot, color: def.accent, transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.013, 2.3);
    anchor.add(pad);

    /* fake contact shadow — grounding without shadow maps */
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.011, 0);
    anchor.add(shadow);

    /* the holographic screen */
    const w = def.screenW;
    const h = w * 0.625;
    if (!screenGeoByW.has(w)) {
      screenGeoByW.set(w, track(new THREE.PlaneGeometry(w, h)));
      glowGeoByW.set(w, track(new THREE.PlaneGeometry(w * 1.42, h * 1.5)));
      edgeGeoByW.set(w, track(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h))));
    }

    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 1.95, 0.55);
    screenGroup.rotation.y = def.yaw;
    screenGroup.rotation.x = def.pitch;
    anchor.add(screenGroup);

    const tex = screenTexs.get(def.p.id);
    const screenMat = track(new THREE.MeshBasicMaterial({
      map: tex ?? track(makeFallbackScreen(def.p.number, def.accent)),
      color: 0xc9d2da, transparent: true, opacity: 0.34, toneMapped: false,
      side: THREE.DoubleSide, depthWrite: false,
    }));
    const screen = new THREE.Mesh(screenGeoByW.get(w)!, screenMat);
    screenGroup.add(screen);

    const glowMat = track(new THREE.MeshBasicMaterial({
      map: softDot, color: def.accent, transparent: true, opacity: 0.05,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const glow = new THREE.Mesh(glowGeoByW.get(w)!, glowMat);
    glow.position.z = -0.02;
    screenGroup.add(glow);

    const scanMat = track(new THREE.MeshBasicMaterial({
      map: scanTex, transparent: true, opacity: 0.1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const scan = new THREE.Mesh(screenGeoByW.get(w)!, scanMat);
    scan.position.z = 0.012;
    screenGroup.add(scan);

    const edgeMat = track(new THREE.LineBasicMaterial({
      color: def.accent, transparent: true, opacity: 0.3, depthWrite: false,
    }));
    const edges = new THREE.LineSegments(edgeGeoByW.get(w)!, edgeMat);
    edges.position.z = 0.014;
    screenGroup.add(edges);

    /* status light — semantic, from the real project status */
    const statusMat = track(new THREE.MeshBasicMaterial({
      color: STATUS_COLOR[def.p.status] ?? 0x9fb4c7,
    }));
    const status = new THREE.Mesh(statusGeo, statusMat);
    status.position.set(w / 2 - 0.09, h / 2 + 0.12, 0.016);
    screenGroup.add(status);
    const statusSpriteMat = track(new THREE.SpriteMaterial({
      map: softDot, color: STATUS_COLOR[def.p.status] ?? 0x9fb4c7,
      transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const statusGlow = new THREE.Sprite(statusSpriteMat);
    statusGlow.scale.setScalar(0.3);
    statusGlow.position.copy(status.position);
    screenGroup.add(statusGlow);

    group.add(anchor);
    rigs.push({
      def, screenGroup, screenMat, glowMat, scanMat, edgeMat, padMat,
      statusMat, statusSpriteMat,
    });
  }

  /* ── runtime state ── */
  const _t0 = performance.now();

  return {
    group,
    update(dt, p) {
      const d = Math.min(dt, 0.05);
      const t = (performance.now() - _t0) / 1000;
      const overview = THREE.MathUtils.smoothstep(p, 0.85, 0.95);

      /* per-station life — bob, sway, focus response */
      for (let i = 0; i < rigs.length; i++) {
        const r = rigs[i];
        const w = weightRef.w[i];
        const def = r.def;

        r.screenGroup.position.y = 1.95 + Math.sin(t * 0.55 + def.phase) * 0.035;
        r.screenGroup.rotation.y = def.yaw + Math.sin(t * 0.23 + def.phase) * 0.012;

        const target = Math.min(1, 0.34 + 0.66 * w + 0.22 * overview);
        r.screenMat.opacity += (target - r.screenMat.opacity) * (1 - Math.exp(-d * 5.5));
        r.glowMat.opacity += (0.05 + 0.24 * w + 0.08 * overview - r.glowMat.opacity) * (1 - Math.exp(-d * 5.5));
        r.scanMat.opacity += (0.09 + 0.13 * w - r.scanMat.opacity) * (1 - Math.exp(-d * 5.5));
        r.edgeMat.opacity += (0.26 + 0.5 * w + 0.12 * overview - r.edgeMat.opacity) * (1 - Math.exp(-d * 5.5));
        r.padMat.opacity += (0.05 + 0.2 * w + 0.06 * overview - r.padMat.opacity) * (1 - Math.exp(-d * 5));

        /* status light semantics — live blinks, wip breathes, soon steady */
        const sc = STATUS_COLOR[def.p.status] ?? 0x9fb4c7;
        if (def.p.status === "live") {
          const blink = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(t * 2.1 + def.phase));
          r.statusSpriteMat.opacity = blink;
          r.statusMat.color.setHex(sc);
        } else if (def.p.status === "wip") {
          r.statusSpriteMat.opacity = 0.4 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.9 + def.phase));
        } else {
          r.statusSpriteMat.opacity = 0.32;
        }
      }

      /* dust bulk drift */
      dust.position.x = Math.sin(t * 0.021) * 0.4;
      dust.position.y = Math.sin(t * 0.017) * 0.25;

      /* survey shapes — slow rotation */
      for (let i = 0; i < surveys.length; i++) {
        surveys[i].rotation.y += d * (0.05 + i * 0.017);
        surveys[i].rotation.x += d * 0.021;
      }
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}

/* weights bridge — LabStage writes each frame before update runs */
export const weightRef = { w: new Float32Array(STATIONS.length) };
