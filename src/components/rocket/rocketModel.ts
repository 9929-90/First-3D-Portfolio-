import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   PROCEDURAL LAUNCH VEHICLE — "RS-01"
   A fully procedural, PBR-lit two-stage rocket built for extreme
   close-ups: canvas-generated livery / roughness / bump maps,
   lathe ogive nose, extruded graphite fins, bell nozzles,
   instanced rivet rings + panel greebles, plumbing, porthole.

   Everything is deterministic (seeded PRNG) and disposes cleanly.
   ═══════════════════════════════════════════════════════════════ */

export type RocketQuality = "high" | "low";

export interface RocketBuild {
  group: THREE.Group;
  /** per-frame updates (beacon pulse) — call from useFrame */
  update: (elapsed: number) => void;
  dispose: () => void;
}

/* deterministic PRNG so the livery is identical every reload */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── body livery texture (unwrapped cylinder: u = around, v = up) ── */
function makeBodyMaps(res: number) {
  const S = res;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const rnd = mulberry32(20250);

  /* roughness */
  const rc = document.createElement("canvas");
  rc.width = S;
  rc.height = S;
  const rx = rc.getContext("2d")!;

  /* bump */
  const bc = document.createElement("canvas");
  bc.width = S;
  bc.height = S;
  const bx = bc.getContext("2d")!;

  /* base coats */
  ctx.fillStyle = "#39414B";
  ctx.fillRect(0, 0, S, S);
  rx.fillStyle = "#8A8A8A"; // ~0.54 roughness
  rx.fillRect(0, 0, S, S);
  bx.fillStyle = "#808080";
  bx.fillRect(0, 0, S, S);

  const px = S / 8; // one panel width (8 panels around)
  const py = S / 6; // six panel rows over the body

  /* per-panel tonal variation — large machined plates */
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 6; j++) {
      const v = (rnd() - 0.5) * 0.075;
      const warm = rnd() > 0.72 ? 4 : 0;
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 - warm : 0},${Math.abs(v)})`;
      ctx.fillRect(i * px + 2, j * py + 2, px - 4, py - 4);
      /* roughness variation per plate */
      const rv = 0.55 + (rnd() - 0.5) * 0.14;
      rx.fillStyle = `rgba(${rv * 255},${rv * 255},${rv * 255},1)`;
      rx.fillRect(i * px + 2, j * py + 2, px - 4, py - 4);
      /* faint panel groove into bump */
      bx.strokeStyle = "#606060";
      bx.lineWidth = Math.max(1, S / 1024);
      bx.strokeRect(i * px + 2, j * py + 2, px - 4, py - 4);
    }
  }

  /* vertical panel seams */
  for (let i = 0; i <= 8; i++) {
    const x = (i * px) % S;
    ctx.fillStyle = "rgba(10,12,14,0.85)";
    ctx.fillRect(x - S / 1024, 0, S / 512, S);
    ctx.fillStyle = "rgba(190,198,206,0.10)";
    ctx.fillRect(x + S / 512, 0, S / 1024, S);
    bx.fillStyle = "#3E3E3E";
    bx.fillRect(x - S / 1024, 0, S / 512, S);
    /* grime streak bleeding from seam */
    const g = ctx.createLinearGradient(x, 0, x + px * 0.16, 0);
    g.addColorStop(0, "rgba(8,9,11,0.10)");
    g.addColorStop(1, "rgba(8,9,11,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, px * 0.16, S);
  }

  /* horizontal weld lines + rivet rows */
  for (let j = 0; j <= 6; j++) {
    const y = (j * py) % S;
    ctx.fillStyle = "rgba(10,12,14,0.7)";
    ctx.fillRect(0, y - S / 1365, S, S / 682);
    bx.fillStyle = "#484848";
    bx.fillRect(0, y - S / 1365, S, S / 682);
    /* rivets */
    for (let i = 0; i < S; i += S / 48) {
      const r = S / 340;
      ctx.fillStyle = "rgba(12,14,16,0.55)";
      ctx.beginPath();
      ctx.arc(i, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(205,212,220,0.28)";
      ctx.beginPath();
      ctx.arc(i, y - r * 0.5, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      bx.fillStyle = "#B8B8B8";
      bx.beginPath();
      bx.arc(i, y, r * 1.4, 0, Math.PI * 2);
      bx.fill();
    }
    /* grime wash under each weld */
    const gr = ctx.createLinearGradient(0, y, 0, y + py * 0.5);
    gr.addColorStop(0, "rgba(6,7,9,0.12)");
    gr.addColorStop(1, "rgba(6,7,9,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, y, S, py * 0.5);
    const rr = rx.createLinearGradient(0, y, 0, y + py * 0.5);
    rr.addColorStop(0, "rgba(96,96,96,0.5)");
    rr.addColorStop(1, "rgba(96,96,96,0)");
    rx.fillStyle = rr;
    rx.fillRect(0, y, S, py * 0.5);
  }

  /* scratches — thin bright scuffs, mostly horizontal */
  for (let i = 0; i < 70; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const len = (0.01 + rnd() * 0.05) * S;
    const ang = (rnd() - 0.5) * 0.7;
    ctx.strokeStyle = `rgba(196,204,212,${0.03 + rnd() * 0.05})`;
    ctx.lineWidth = Math.max(1, S / 1400);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
    rx.strokeStyle = `rgba(170,170,170,${0.25 + rnd() * 0.2})`;
    rx.lineWidth = Math.max(1, S / 1400);
    rx.beginPath();
    rx.moveTo(x, y);
    rx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    rx.stroke();
  }

  /* soot wisps — soft dark vertical smudges */
  for (let i = 0; i < 26; i++) {
    const x = rnd() * S;
    const y = rnd() * S * 0.9;
    const h = (0.06 + rnd() * 0.16) * S;
    const w = (0.008 + rnd() * 0.03) * S;
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "rgba(5,6,8,0.10)");
    g.addColorStop(1, "rgba(5,6,8,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  /* ── identity band: Rohit Suthar livery ── */
  const bandY = S * 0.335;
  const bandH = S * 0.062;
  ctx.fillStyle = "rgba(83,108,131,0.44)";
  ctx.fillRect(0, bandY, S, bandH);
  ctx.fillStyle = "rgba(230,233,237,0.5)";
  ctx.fillRect(0, bandY, S, Math.max(1, S / 1024));
  ctx.fillRect(0, bandY + bandH - Math.max(1, S / 1024), S, Math.max(1, S / 1024));
  rx.fillStyle = "rgba(105,105,105,1)"; // band is glossier
  rx.fillRect(0, bandY, S, bandH);

  ctx.fillStyle = "#DFE5EB";
  ctx.font = `700 ${Math.round(S * 0.037)}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.textBaseline = "middle";
  ctx.fillText("ROHIT SUTHAR", S * 0.055, bandY + bandH * 0.44);
  ctx.fillText("ROHIT SUTHAR", S * 0.62, bandY + bandH * 0.44);
  ctx.fillStyle = "rgba(222,229,236,0.82)";
  ctx.font = `400 ${Math.round(S * 0.0165)}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.fillText("ASPIRING DATA ENGINEER — UDAIPUR · IN", S * 0.055, bandY + bandH * 0.8);
  ctx.fillText("ETL · PIPELINES · SYSTEMS", S * 0.62, bandY + bandH * 0.8);

  /* registration marking above band */
  ctx.fillStyle = "rgba(169,178,188,0.5)";
  ctx.font = `500 ${Math.round(S * 0.017)}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.fillText("RS-01 // DATA BUS", S * 0.055, bandY - S * 0.028);
  ctx.fillText("24.585°N 073.712°E", S * 0.62, bandY - S * 0.028);

  /* micro status dot — the single lime accent */
  ctx.fillStyle = "rgba(204,255,0,0.85)";
  ctx.beginPath();
  ctx.arc(S * 0.52, bandY - S * 0.028, Math.max(2, S / 340), 0, Math.PI * 2);
  ctx.fill();

  /* ghost stage numbers — huge, barely-there plate markings */
  ctx.fillStyle = "rgba(220,227,234,0.05)";
  ctx.font = `700 ${Math.round(S * 0.2)}px ui-monospace, "JetBrains Mono", Menlo, monospace`;
  ctx.fillText("02", S * 0.13, S * 0.56);
  ctx.fillText("01", S * 0.64, S * 0.81);

  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(rc);
  const bumpMap = new THREE.CanvasTexture(bc);
  return { map, roughnessMap, bumpMap };
}

/* ── nose cone texture — smoother graphite ── */
function makeNoseMaps(res: number) {
  const S = res;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S / 2;
  const ctx = cv.getContext("2d")!;
  const rnd = mulberry32(7);

  ctx.fillStyle = "#343B44";
  ctx.fillRect(0, 0, S, S / 2);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const v = (rnd() - 0.5) * 0.06;
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},255,${Math.abs(v)})`;
      ctx.fillRect((i * S) / 4, (j * S) / 8, S / 4, S / 8);
    }
  }
  /* longitudinal seams */
  for (let i = 0; i <= 4; i++) {
    ctx.fillStyle = "rgba(10,12,14,0.7)";
    ctx.fillRect((i * S) / 4 - 1, 0, 2, S / 2);
  }
  /* ring seam at base */
  ctx.fillStyle = "rgba(10,12,14,0.6)";
  ctx.fillRect(0, S / 2 - S / 102, S, S / 102);

  /* scratches */
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = `rgba(196,204,212,${0.02 + rnd() * 0.04})`;
    ctx.lineWidth = 1;
    const x = rnd() * S;
    const y = rnd() * (S / 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rnd() - 0.5) * 40, y + (rnd() - 0.5) * 14);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

function latheFrom(pts: [number, number][], segments: number): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    segments
  );
}

export function buildRocket(quality: RocketQuality, maxAniso: number): RocketBuild {
  const res = quality === "high" ? 2048 : 1024;
  const seg = quality === "high" ? 72 : 40;
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  const group = new THREE.Group();

  /* ── materials ── */
  const bodyMaps = makeBodyMaps(res);
  track(bodyMaps.map);
  track(bodyMaps.roughnessMap);
  track(bodyMaps.bumpMap);
  [bodyMaps.map, bodyMaps.roughnessMap, bodyMaps.bumpMap].forEach((t) => {
    t.anisotropy = maxAniso;
  });

  const noseMap = track(makeNoseMaps(res));
  noseMap.anisotropy = maxAniso;

  const matBody = track(
    new THREE.MeshPhysicalMaterial({
      map: bodyMaps.map,
      roughnessMap: bodyMaps.roughnessMap,
      bumpMap: bodyMaps.bumpMap,
      bumpScale: 0.012,
      metalness: 0.78,
      roughness: 1.0,
      clearcoat: 0.32,
      clearcoatRoughness: 0.42,
      envMapIntensity: 1.55,
    })
  );

  const matNose = track(
    new THREE.MeshPhysicalMaterial({
      map: noseMap,
      metalness: 0.8,
      roughness: 0.42,
      clearcoat: 0.4,
      clearcoatRoughness: 0.35,
      envMapIntensity: 1.45,
      bumpScale: 0.006,
    })
  );

  const matDark = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#161B21"),
      metalness: 0.86,
      roughness: 0.4,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.9,
    })
  );

  const matNozzle = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1B2026"),
      metalness: 0.94,
      roughness: 0.34,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2,
    })
  );

  const matSteel = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#65717B"),
      metalness: 0.92,
      roughness: 0.36,
      envMapIntensity: 1.0,
    })
  );

  const matFin = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#20262C"),
      metalness: 0.85,
      roughness: 0.46,
      clearcoat: 0.3,
      clearcoatRoughness: 0.45,
      envMapIntensity: 1.05,
      side: THREE.DoubleSide,
    })
  );

  const matGlass = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0B0E12"),
      metalness: 0.6,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.6,
    })
  );

  const matBeacon = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1A1D22"),
      emissive: new THREE.Color("#C9D2DC"),
      emissiveIntensity: 0.3,
      roughness: 0.5,
    })
  );

  /* ── geometry ── */

  /* main tank body: y 0.9 → 5.9 (r 0.55) */
  const bodyGeo = track(new THREE.CylinderGeometry(0.55, 0.55, 5.0, seg, 1, true));
  const body = new THREE.Mesh(bodyGeo, matBody);
  body.position.y = 3.4;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  /* nose ogive: y 5.9 → 7.35 */
  const nosePts: [number, number][] = [];
  const noseH = 1.45;
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    nosePts.push([0.55 * Math.sqrt(Math.max(0, 1 - t * t)) || 0.012, t * noseH]);
  }
  nosePts.push([0.012, noseH]);
  const noseGeo = track(latheFrom(nosePts, seg));
  const nose = new THREE.Mesh(noseGeo, matNose);
  nose.position.y = 5.9;
  nose.castShadow = true;
  nose.receiveShadow = true;
  group.add(nose);

  /* tip + antenna + beacon */
  const tipGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 12));
  const tip = new THREE.Mesh(tipGeo, matSteel);
  tip.position.y = 5.9 + noseH + 0.02;
  group.add(tip);

  const antGeo = track(new THREE.CylinderGeometry(0.004, 0.011, 0.3, 8));
  const ant = new THREE.Mesh(antGeo, matSteel);
  ant.position.y = 5.9 + noseH + 0.2;
  group.add(ant);

  const beaconGeo = track(new THREE.SphereGeometry(0.021, 12, 8));
  const beacon = new THREE.Mesh(beaconGeo, matBeacon);
  beacon.position.y = 5.9 + noseH + 0.06;
  group.add(beacon);

  /* porthole window — close-up detail near nose */
  const winAngle = 0.55;
  const winGroup = new THREE.Group();
  const ringGeo = track(new THREE.TorusGeometry(0.082, 0.015, 10, 28));
  const ring = new THREE.Mesh(ringGeo, matSteel);
  winGroup.add(ring);
  const glassGeo = track(new THREE.CircleGeometry(0.072, 24));
  const glass = new THREE.Mesh(glassGeo, matGlass);
  glass.position.z = -0.006;
  winGroup.add(glass);
  winGroup.position.set(Math.cos(winAngle) * 0.552, 6.18, Math.sin(winAngle) * 0.552);
  winGroup.rotation.y = Math.PI / 2 - winAngle;
  group.add(winGroup);

  /* engine skirt: y 0.35 → 0.9 */
  const skirtPts: [number, number][] = [
    [0.475, 0.3],
    [0.5, 0.34],
    [0.528, 0.46],
    [0.545, 0.62],
    [0.55, 0.78],
    [0.55, 0.9],
  ];
  const skirtGeo = track(latheFrom(skirtPts, seg));
  const skirt = new THREE.Mesh(skirtGeo, matDark);
  skirt.castShadow = true;
  skirt.receiveShadow = true;
  group.add(skirt);

  /* thrust plate */
  const plateGeo = track(new THREE.CylinderGeometry(0.5, 0.5, 0.05, seg));
  const plate = new THREE.Mesh(plateGeo, matDark);
  plate.position.y = 0.92;
  plate.castShadow = true;
  group.add(plate);

  /* nozzles — 4 outer + 1 center */
  const bellPts: [number, number][] = [
    [0.062, 0],
    [0.066, -0.07],
    [0.082, -0.15],
    [0.108, -0.25],
    [0.142, -0.35],
    [0.176, -0.44],
    [0.205, -0.51],
    [0.212, -0.56],
  ];
  const bellGeo = track(latheFrom(bellPts, 40));

  const nozzleAngle = (i: number) => (i * Math.PI) / 2 + Math.PI / 4;
  for (let i = 0; i < 4; i++) {
    const a = nozzleAngle(i);
    const bell = new THREE.Mesh(bellGeo, matNozzle);
    bell.position.set(Math.cos(a) * 0.325, 0.86, Math.sin(a) * 0.325);
    bell.castShadow = true;
    group.add(bell);
  }
  const centerPts: [number, number][] = bellPts.map(([x, y]) => [x * 1.42, y * 1.06]) as [number, number][];
  const centerGeo = track(latheFrom(centerPts, 40));
  const center = new THREE.Mesh(centerGeo, matNozzle);
  center.position.y = 0.84;
  center.castShadow = true;
  group.add(center);

  /* plumbing — feed lines around thrust structure */
  const feedGeo = track(new THREE.CylinderGeometry(0.024, 0.024, 0.52, 10));
  const elbowGeo = track(new THREE.SphereGeometry(0.026, 10, 8));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const feed = new THREE.Mesh(feedGeo, matSteel);
    feed.position.set(Math.cos(a) * 0.44, 0.66, Math.sin(a) * 0.44);
    feed.rotation.z = Math.cos(a) * 0.12;
    feed.rotation.x = Math.sin(a) * -0.12;
    group.add(feed);
    const elbow = new THREE.Mesh(elbowGeo, matSteel);
    elbow.position.set(Math.cos(a) * 0.44, 0.94, Math.sin(a) * 0.44);
    group.add(elbow);
  }
  const ringPipeGeo = track(new THREE.TorusGeometry(0.43, 0.02, 10, 48));
  const ringPipe = new THREE.Mesh(ringPipeGeo, matSteel);
  ringPipe.rotation.x = Math.PI / 2;
  ringPipe.position.y = 0.97;
  group.add(ringPipe);

  /* interstage bands — dark welded rings */
  const bandGeo = track(new THREE.CylinderGeometry(0.554, 0.554, 0.17, seg, 1, true));
  [2.66, 4.36].forEach((y) => {
    const band = new THREE.Mesh(bandGeo, matDark);
    band.position.y = y;
    band.castShadow = true;
    band.receiveShadow = true;
    group.add(band);
  });

  /* steel trim strips */
  const stripGeo = track(new THREE.CylinderGeometry(0.557, 0.557, 0.022, seg, 1, true));
  [1.16, 2.56, 3.42, 5.16, 5.88].forEach((y) => {
    const strip = new THREE.Mesh(stripGeo, matSteel);
    strip.position.y = y;
    group.add(strip);
  });

  /* rivet rings — instanced domes */
  const rivetGeo = track(new THREE.SphereGeometry(0.011, 8, 6));
  const rivetStations = [1.24, 2.58, 2.76, 3.5, 4.28, 4.46, 5.24, 5.86];
  const perRing = quality === "high" ? 44 : 30;
  const rivets = new THREE.InstancedMesh(rivetGeo, matSteel, rivetStations.length * perRing);
  const dummy = new THREE.Object3D();
  let ri = 0;
  for (const y of rivetStations) {
    for (let i = 0; i < perRing; i++) {
      const a = (i / perRing) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * 0.552, y, Math.sin(a) * 0.552);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      rivets.setMatrixAt(ri++, dummy.matrix);
    }
  }
  rivets.instanceMatrix.needsUpdate = true;
  rivets.castShadow = true;
  group.add(rivets);

  /* greeble panels — instanced conduit boxes + junction plates */
  const greebleGeo = track(new THREE.BoxGeometry(1, 1, 1));
  const greebleMat = track(
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.42, envMapIntensity: 1.0 })
  );
  const gCount = quality === "high" ? 84 : 52;
  const greebles = new THREE.InstancedMesh(greebleGeo, greebleMat, gCount);
  const grnd = mulberry32(314);
  const tint = new THREE.Color();
  for (let i = 0; i < gCount; i++) {
    const a = grnd() * Math.PI * 2;
    const y = 1.05 + grnd() * 4.7;
    const w = 0.05 + grnd() * 0.16;
    const h = 0.03 + grnd() * 0.16;
    const d = 0.012 + grnd() * 0.02;
    dummy.position.set(Math.cos(a) * 0.557, y, Math.sin(a) * 0.557);
    dummy.rotation.set(0, Math.PI / 2 - a, 0);
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    greebles.setMatrixAt(i, dummy.matrix);
    const c = grnd();
    tint.set(c < 0.5 ? "#5B6770" : c < 0.85 ? "#3E4750" : "#77828C");
    greebles.setColorAt(i, tint);
  }
  greebles.instanceMatrix.needsUpdate = true;
  if (greebles.instanceColor) greebles.instanceColor.needsUpdate = true;
  greebles.castShadow = true;
  group.add(greebles);

  /* vertical conduits */
  const condGeo = track(new THREE.CylinderGeometry(0.016, 0.016, 2.1, 8));
  const conduits: [number, number][] = [
    [0.9, 1.9],
    [2.4, 3.6],
    [4.1, 5.3],
  ];
  conduits.forEach(([a, y], i) => {
    const c = new THREE.Mesh(condGeo, matSteel);
    c.position.set(Math.cos(a) * 0.562, y, Math.sin(a) * 0.562);
    c.rotation.z = Math.cos(a) * 0.02;
    group.add(c);
    void i;
  });

  /* RCS thruster blocks near upper interstage */
  const rcsBoxGeo = track(new THREE.BoxGeometry(0.085, 0.07, 0.05));
  const rcsJetGeo = track(new THREE.CylinderGeometry(0.014, 0.02, 0.045, 8));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    const blk = new THREE.Mesh(rcsBoxGeo, matDark);
    blk.position.set(Math.cos(a) * 0.56, 4.62, Math.sin(a) * 0.56);
    blk.rotation.y = Math.PI / 2 - a;
    group.add(blk);
    const jet = new THREE.Mesh(rcsJetGeo, matSteel);
    jet.position.set(Math.cos(a) * 0.585, 4.66, Math.sin(a) * 0.585);
    jet.rotation.z = Math.PI / 2;
    jet.rotation.y = -a;
    group.add(jet);
  }

  /* ── fins — swept graphite stabilizers ── */
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0.5);
  finShape.lineTo(0.74, 0.66);
  finShape.lineTo(0.92, 1.52);
  finShape.lineTo(0, 1.98);
  finShape.closePath();
  const finGeo = track(
    new THREE.ExtrudeGeometry(finShape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.016,
      bevelSegments: 2,
      steps: 1,
    })
  );
  finGeo.translate(0, 0, -(0.045 + 0.014) / 2);
  const finGeoLow = quality === "high" ? finGeo : finGeo; // same geometry reused
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const fin = new THREE.Mesh(finGeoLow, matFin);
    fin.position.set(Math.cos(a) * 0.5, 0.55, Math.sin(a) * 0.5);
    fin.rotation.y = -a;
    fin.castShadow = true;
    fin.receiveShadow = true;
    group.add(fin);

    /* fin root fairing */
    const fair = new THREE.Mesh(track(new THREE.BoxGeometry(0.1, 1.5, 0.09)), matDark);
    fair.position.set(Math.cos(a) * 0.545, 1.3, Math.sin(a) * 0.545);
    fair.rotation.y = Math.PI / 2 - a;
    group.add(fair);
  }

  /* slight static poise — nose tilted a touch toward camera start */
  group.rotation.z = 0.0;

  /* ── per-frame beacon pulse ── */
  const update = (t: number) => {
    const pulse = Math.pow(Math.max(0, Math.sin(t * 1.9)), 12);
    matBeacon.emissiveIntensity = 0.18 + pulse * 1.5;
  };

  /* ── dispose ── */
  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return { group, update, dispose };
}
