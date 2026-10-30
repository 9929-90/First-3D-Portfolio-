import * as THREE from "three";
import { PLANETS } from "./galaxyData";
import { planetBasePosition, FINAL_P_GALAXY } from "./galaxyPath";
import {
  makePlanetTexture, makeSoftDot, makeNebulaTexture, makeRingTexture,
} from "./planetTextures";
import { readableHex } from "./techIcons";

/* ═══════════════════════════════════════════════════════════════
   GALAXY SCENE — one imperative build, zero per-frame allocation.

   Contents
   · 6 procedural planets (shared unit sphere, canvas-baked surfaces)
   · fresnel atmosphere shells (additive, backside)
   · ring systems on two planets (1D radial band texture)
   · central data-core + a single lime micro-satellite
   · orbital rings (LineLoops) + faint constellation links
   · 3-layer star field + one distant spiral galaxy
   · low-opacity nebula sprites + near-camera dust
   · holographic SVG technology markers orbiting each planet

   Draw calls ≈ 70 desktop / ≈ 50 mobile. No post-processing,
   no shadow maps, no render targets.
   ═══════════════════════════════════════════════════════════════ */

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vP = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 viewDir = normalize(-vP);
    float f = pow(1.0 - abs(dot(viewDir, normalize(vN))), 3.8);
    gl_FragColor = vec4(uColor, f * uIntensity);
  }
`;

export interface GalaxyHandle {
  group: THREE.Group;
  update(dt: number, p: number, weights: Float32Array, camera: THREE.Camera): void;
  setOrbitTarget(v: number): void;
  dispose(): void;
}

function radialRingGeometry(inner: number, outer: number, segs: number): THREE.RingGeometry {
  const g = new THREE.RingGeometry(inner, outer, segs, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  return g;
}

export function buildGalaxy(
  isMobile: boolean,
  iconTexs: Map<string, THREE.Texture>
): GalaxyHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(d: T): T => { disposables.push(d); return d; };

  const seg = isMobile ? 40 : 56;
  const sphereGeo = track(new THREE.SphereGeometry(1, seg, seg / 2));
  /* oversized holo quads — brand glyphs must read clearly at every distance */
  const holoGeo = track(new THREE.PlaneGeometry(0.8, 0.8));
  const softDot = track(makeSoftDot(64, 1));
  const nebTex = track(makeNebulaTexture(4242));

  /* ── lights ── */
  const key = new THREE.DirectionalLight(0xe9eef4, 2.9);
  key.position.set(16, 11, 9);
  group.add(key);
  const rim = new THREE.DirectionalLight(0x536c83, 1.05);
  rim.position.set(-14, -4, -10);
  group.add(rim);
  group.add(new THREE.AmbientLight(0x424c58, 0.34));
  const coreLight = new THREE.PointLight(0x536c83, 3.2, 70, 1.6);
  group.add(coreLight);

  /* ── central data-core ── */
  const coreGroup = new THREE.Group();
  const coreMesh = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.17, 20, 14)),
    track(new THREE.MeshBasicMaterial({ color: 0xe6e9ed }))
  );
  coreGroup.add(coreMesh);
  const coreGlowMat = track(new THREE.SpriteMaterial({
    map: softDot, color: 0x536c83, transparent: true, opacity: 0.42,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  const coreGlow = new THREE.Sprite(coreGlowMat);
  coreGlow.scale.setScalar(5.2);
  coreGroup.add(coreGlow);
  const coreGlow2 = new THREE.Sprite(track(new THREE.SpriteMaterial({
    map: softDot, color: 0xcfd6de, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));
  coreGlow2.scale.setScalar(1.7);
  coreGroup.add(coreGlow2);
  /* one lime micro-satellite — the only pure accent, like the site */
  const limeSat = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.05, 10, 8)),
    track(new THREE.MeshBasicMaterial({ color: 0xccff00 }))
  );
  coreGroup.add(limeSat);
  group.add(coreGroup);

  /* ── star fields ── */
  const starsGroup = new THREE.Group();
  const starLayer = (
    count: number, rMin: number, rMax: number, size: number,
    opacity: number, color: number, attenuate: boolean
  ) => {
    let seed = 987654;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = rMin + rnd() * (rMax - rMin);
      const s = Math.sqrt(1 - u * u);
      pts[i * 3] = Math.cos(th) * s * r;
      pts[i * 3 + 1] = u * r * 0.82;
      pts[i * 3 + 2] = Math.sin(th) * s * r;
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = track(new THREE.PointsMaterial({
      map: softDot, color, size, transparent: true, opacity,
      sizeAttenuation: attenuate, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    }));
    const p = new THREE.Points(g, m);
    starsGroup.add(p);
    return p;
  };
  if (isMobile) {
    starLayer(1100, 60, 96, 1.6, 0.8, 0xc9d1d9, false);
    starLayer(320, 26, 50, 0.18, 0.42, 0x8fa3b5, true);
  } else {
    starLayer(1500, 60, 98, 1.6, 0.8, 0xc9d1d9, false);
    starLayer(700, 62, 96, 2.5, 0.62, 0xaebdc9, false);
    starLayer(480, 26, 52, 0.18, 0.44, 0x8fa3b5, true);
  }

  /* one distant spiral galaxy — barely there */
  if (!isMobile) {
    const N = 520;
    const pts = new Float32Array(N * 3);
    let seed = 55555;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < N; i++) {
      const arm = i % 2;
      const t = Math.pow(rnd(), 0.6);
      const ang = t * 3.4 + arm * Math.PI + (rnd() - 0.5) * 0.5;
      const r = t * 7.5;
      pts[i * 3] = Math.cos(ang) * r + (rnd() - 0.5) * 0.7;
      pts[i * 3 + 1] = (rnd() - 0.5) * 0.55 * (1.2 - t);
      pts[i * 3 + 2] = Math.sin(ang) * r + (rnd() - 0.5) * 0.7;
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = track(new THREE.PointsMaterial({
      map: softDot, color: 0x8fa3b5, size: 0.5, transparent: true, opacity: 0.4,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    }));
    const galaxy = new THREE.Points(g, m);
    galaxy.position.set(-38, 16, -62);
    galaxy.rotation.set(0.9, 0.4, 0.35);
    starsGroup.add(galaxy);
  }
  group.add(starsGroup);

  /* ── nebulae — extremely faint ── */
  const nebMat = track(new THREE.SpriteMaterial({
    map: nebTex, color: 0x24303e, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  const nebs: Array<{ s: THREE.Sprite; base: number }> = [];
  const nebSpots: Array<[number, number, number, number, number]> = [
    [-52, 14, -70, 88, 0.55], [46, -20, -74, 74, 0.42], [-18, -26, -66, 60, 0.36], [22, 26, -80, 92, 0.4],
  ];
  for (let i = 0; i < (isMobile ? 3 : 4); i++) {
    const [x, y, z, s, o] = nebSpots[i];
    const mat = nebMat.clone();
    track(mat);
    mat.opacity = o;
    const sp = new THREE.Sprite(mat);
    sp.position.set(x, y, z);
    sp.scale.setScalar(s);
    nebs.push({ s: sp, base: o });
    group.add(sp);
  }

  /* ── dust near the camera corridor ── */
  const dustCount = isMobile ? 80 : 160;
  let dust: THREE.Points;
  {
    let seed = 31337;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pts = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 5 + rnd() * 22;
      pts[i * 3] = Math.cos(a) * r;
      pts[i * 3 + 1] = (rnd() - 0.5) * 12;
      pts[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = track(new THREE.PointsMaterial({
      map: softDot, color: 0x7e93a8, size: 0.07, transparent: true, opacity: 0.3,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    dust = new THREE.Points(g, m);
    group.add(dust);
  }

  /* ── orbital rings + constellation links ── */
  const orbitMats: THREE.LineBasicMaterial[] = [];
  for (let i = 0; i < PLANETS.length; i++) {
    const o = PLANETS[i].look.orbit;
    const pts: number[] = [];
    for (let k = 0; k < 160; k++) {
      const a = (k / 160) * Math.PI * 2;
      pts.push(Math.cos(a) * o.r, 0, Math.sin(a) * o.r);
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const m = track(new THREE.LineBasicMaterial({
      color: 0x536c83, transparent: true, opacity: 0, depthWrite: false,
    }));
    orbitMats.push(m);
    const line = new THREE.LineLoop(g, m);
    line.position.y = o.y;
    group.add(line);
  }
  /* connect consecutive planets — the travelled route */
  {
    const pts: number[] = [];
    for (let i = 0; i < PLANETS.length; i++) {
      const v = planetBasePosition(i);
      pts.push(v.x, v.y, v.z);
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const linkMat = track(new THREE.LineBasicMaterial({
      color: 0x8fa3b5, transparent: true, opacity: 0, depthWrite: false,
    }));
    const link = new THREE.Line(g, linkMat);
    orbitMats.push(linkMat);
    link.userData.isLink = true;
    group.add(link);
  }

  /* ── planets ── */
  interface PlanetRig {
    def: (typeof PLANETS)[number];
    mesh: THREE.Mesh;
    atmoMat: THREE.ShaderMaterial;
    holoGroup: THREE.Group;
    holoIcons: THREE.Mesh[];
    ringMat?: THREE.MeshBasicMaterial;
    base: THREE.Vector3;
    phase: number;
  }
  const planets: PlanetRig[] = [];
  const atmoGeo = track(new THREE.SphereGeometry(1.075, 40, 24));

  PLANETS.forEach((def, i) => {
    const base = planetBasePosition(i);
    const anchor = new THREE.Group();
    anchor.position.copy(base);

    const seed = 1717 + i * 991;
    const tex = track(makePlanetTexture(def.look.type, seed, isMobile ? 2 : 4));
    const mat = track(new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.93, metalness: 0.06,
      ...(def.look.type === "night"
        ? { emissiveMap: tex, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.55 }
        : {}),
    }));
    const mesh = new THREE.Mesh(sphereGeo, mat);
    mesh.scale.setScalar(def.look.radius);
    mesh.rotation.z = (i % 2 ? 1 : -1) * (0.08 + i * 0.05);
    mesh.rotation.y = i * 1.7;
    anchor.add(mesh);

    const atmoMat = track(new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(def.look.atmosphere) },
        uIntensity: { value: def.look.atmoIntensity * 1.05 },
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    atmo.scale.setScalar(def.look.radius);
    anchor.add(atmo);

    let ringMat: THREE.MeshBasicMaterial | undefined;
    if (def.look.ring) {
      const rg = def.look.ring;
      const geo = track(radialRingGeometry(rg.inner / def.look.radius, rg.outer / def.look.radius, 110));
      ringMat = track(new THREE.MeshBasicMaterial({
        map: track(makeRingTexture(seed + 7)),
        color: 0x9aa7b4, transparent: true, opacity: rg.opacity,
        side: THREE.DoubleSide, depthWrite: false,
      }));
      const ring = new THREE.Mesh(geo, ringMat);
      ring.rotation.x = rg.tiltX;
      ring.rotation.z = rg.tiltZ;
      anchor.add(ring);
    }

    /* holographic technology markers — official SVG logos on quads */
    const holoGroup = new THREE.Group();
    const holoIcons: THREE.Mesh[] = [];
    const maxIcons = isMobile ? 2 : 4;
    let placed = 0;
    for (const ic of def.iconSet) {
      if (placed >= maxIcons) break;
      const t = iconTexs.get(ic.slug);
      if (!t) continue;
      const m = track(new THREE.MeshBasicMaterial({
        map: t, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
        depthWrite: false, toneMapped: false,
      }));
      const q = new THREE.Mesh(holoGeo, m);
      holoIcons.push(q);
      holoGroup.add(q);
      placed++;
    }
    anchor.add(holoGroup);

    group.add(anchor);
    planets.push({ def, mesh, atmoMat, holoGroup, holoIcons, ringMat, base, phase: i * 1.13 });
  });

  /* ── runtime state ── */
  let orbitCurrent = 0;
  let orbitTarget = 0;
  let nebulaCurrent = 0.45;
  const _v = new THREE.Vector3();

  return {
    group,
    setOrbitTarget(v: number) { orbitTarget = v; },
    update(dt, p, weights, camera) {
      const d = Math.min(dt, 0.05);

      /* planets — self rotation, hover bob, scroll-reactive holo icons */
      for (let i = 0; i < planets.length; i++) {
        const pl = planets[i];
        const w = weights[i];
        pl.mesh.rotation.y += pl.def.look.spin * d * (0.6 + w * 1.4);
        pl.mesh.position.y = Math.sin(performance.now() * 0.00028 + pl.phase) * 0.16;

        /* holographic markers orbit the planet, billboarded to camera */
        pl.holoGroup.rotation.y -= d * (0.1 + w * 0.14);
        for (let k = 0; k < pl.holoIcons.length; k++) {
          const q = pl.holoIcons[k];
          const a = (k / Math.max(1, pl.holoIcons.length)) * Math.PI * 2 + i;
          const R = pl.def.look.radius * (2.05 + (k % 2) * 0.3);
          q.position.set(
            Math.cos(a) * R,
            Math.sin(a * 1.7 + pl.phase) * pl.def.look.radius * 0.42,
            Math.sin(a) * R
          );
          const targetO = 0.46 + 0.54 * w;
          const m = q.material as THREE.MeshBasicMaterial;
          m.opacity += (targetO - m.opacity) * (1 - Math.exp(-d * 6));
          /* small screens sit further back (portrait dolly) — nudge badges up */
          const sc = pl.def.look.radius * (0.6 + w * 0.12) * (isMobile ? 1.18 : 1);
          q.scale.setScalar(sc);
          q.lookAt(_v.setFromMatrixPosition(camera.matrixWorld));
        }

        if (pl.ringMat) {
          const base = pl.def.look.ring!.opacity;
          const target = base * (0.72 + orbitCurrent * 0.6) + w * 0.1;
          pl.ringMat.opacity += (Math.min(0.85, target) - pl.ringMat.opacity) * (1 - Math.exp(-d * 5));
        }
      }

      /* core — slow pulse + lime satellite */
      const pulse = 1 + Math.sin(performance.now() * 0.0011) * 0.06;
      coreGlow.scale.setScalar(5.2 * pulse);
      const la = performance.now() * 0.0007;
      limeSat.position.set(Math.cos(la) * 0.95, Math.sin(la * 2) * 0.12, Math.sin(la) * 0.95);

      /* orbit lines fade with the reveal, links stay fainter */
      orbitCurrent += (orbitTarget - orbitCurrent) * (1 - Math.exp(-d * 3.2));
      for (const m of orbitMats) {
        const cap = m.userData.isLink ? 0.12 : 0.62;
        m.opacity = orbitCurrent * cap;
      }

      /* nebula breathing */
      nebulaCurrent += (nebulaTargetRef.value - nebulaCurrent) * (1 - Math.exp(-d * 2.5));
      for (const n of nebs) n.s.material.opacity = n.base * nebulaCurrent * 2;

      /* ambient drift */
      starsGroup.rotation.y += d * 0.0021;
      dust.rotation.y -= d * 0.005;

      /* reduced-motion still frame — settle once */
      if (p >= FINAL_P_GALAXY - 0.001) {
        for (const pl of planets) pl.mesh.rotation.y += d * 0.01;
      }
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}

/* nebula target is written by the rig each frame */
export const nebulaTargetRef = { value: 0.45 };
