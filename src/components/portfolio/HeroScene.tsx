"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────
   HERO SCENE — "STRATA"
   An abstract data-infrastructure cross-section: stacked wireframe
   compute layers, instanced node clusters, thin vertical data paths
   with slow pulse traffic. Desaturated cyan / blue / violet at low
   opacity, no post-processing, ~10 draw calls, instanced geometry.
   Replaces the previous bright icosahedron + orbit rings + bloom.
   ──────────────────────────────────────────────────────────── */

const CYAN = new THREE.Color("#5c9ead");
const BLUE = new THREE.Color("#5277a5");
const VIOLET = new THREE.Color("#75658f");
const SILVER = new THREE.Color("#a8b0bb");

type LayerDef = { y: number; s: number; x: number; z: number; tilt: number };

function useLayerConfig(isMobile: boolean): LayerDef[] {
  return useMemo(() => {
    const layers: LayerDef[] = [
      { y: -1.7, s: 2.6, x: 0.25, z: -0.2, tilt: 0.02 },
      { y: -0.85, s: 2.25, x: -0.2, z: 0.15, tilt: -0.015 },
      { y: 0.0, s: 1.95, x: 0.12, z: 0.05, tilt: 0 },
      { y: 0.85, s: 1.65, x: -0.15, z: -0.12, tilt: 0.018 },
      { y: 1.7, s: 1.3, x: 0.05, z: 0.1, tilt: -0.02 },
    ];
    return isMobile ? layers.slice(0, 4) : layers;
  }, [isMobile]);
}

function plateGeometry(halfSize: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const p = -halfSize + (i / n) * halfSize * 2;
    pts.push(-halfSize, 0, p, halfSize, 0, p);
    pts.push(p, 0, -halfSize, p, 0, halfSize);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/* deterministic PRNG so the layout is stable across reloads */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Strata({ isMobile }: { isMobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const pulsesRef = useRef<THREE.Points>(null);
  const layers = useLayerConfig(isMobile);

  /* instanced node clusters on each plate */
  const nodeData = useMemo(() => {
    const rnd = mulberry32(42);
    const data: { x: number; y: number; z: number; h: number; w: number; color: THREE.Color }[] = [];
    layers.forEach((L, li) => {
      const count = isMobile ? 10 : 16;
      for (let i = 0; i < count; i++) {
        const px = (rnd() - 0.5) * L.s * 1.85;
        const pz = (rnd() - 0.5) * L.s * 1.85;
        const h = 0.05 + rnd() * 0.22;
        const c = rnd();
        data.push({
          x: L.x + px,
          y: L.y + h / 2,
          z: L.z + pz,
          h,
          w: 0.05 + rnd() * 0.06,
          color: c < 0.4 ? CYAN : c < 0.7 ? BLUE : c < 0.9 ? VIOLET : SILVER,
        });
      }
    });
    return data;
  }, [layers, isMobile]);

  useEffect(() => {
    const mesh = nodesRef.current;
    if (!mesh) return;
    const m4 = new THREE.Matrix4();
    const color = new THREE.Color();
    nodeData.forEach((n, i) => {
      m4.makeScale(n.w * 2, n.h, n.w * 2);
      m4.setPosition(n.x, n.y, n.z);
      mesh.setMatrixAt(i, m4);
      mesh.setColorAt(i, color.copy(n.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodeData]);

  /* vertical connection paths between layers + pulse schedule */
  const { lineGeo, pulseGeo, pulses, pulseTexture, segs } = useMemo(() => {
    const rnd = mulberry32(7);
    const segs: { a: THREE.Vector3; b: THREE.Vector3 }[] = [];
    const pulses: { seg: number; t: number; speed: number }[] = [];
    for (let li = 0; li < layers.length - 1; li++) {
      const lower = layers[li];
      const upper = layers[li + 1];
      const count = isMobile ? 4 : 6;
      for (let i = 0; i < count; i++) {
        const x = (rnd() - 0.5) * lower.s * 1.4 + lower.x;
        const z = (rnd() - 0.5) * lower.s * 1.4 + lower.z;
        segs.push({
          a: new THREE.Vector3(x, lower.y, z),
          b: new THREE.Vector3(x + (upper.x - lower.x) * 0.3, upper.y, z + (upper.z - lower.z) * 0.3),
        });
        pulses.push({ seg: segs.length - 1, t: rnd(), speed: 0.05 + rnd() * 0.09 });
      }
    }

    const linePts: number[] = [];
    segs.forEach(({ a, b }) => linePts.push(a.x, a.y, a.z, b.x, b.y, b.z));
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePts, 3));

    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(pulses.length * 3), 3));

    /* soft round sprite for pulses — canvas-generated, lime */
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx2d = c.getContext("2d")!;
    const grad = ctx2d.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(204,255,0,1)");
    grad.addColorStop(0.4, "rgba(204,255,0,0.45)");
    grad.addColorStop(1, "rgba(204,255,0,0)");
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, 32, 32);
    const pulseTexture = new THREE.CanvasTexture(c);

    return { lineGeo, pulseGeo, pulses, pulseTexture, segs };
  }, [layers, isMobile]);

  /* dispose geometries on unmount */
  useEffect(() => {
    return () => {
      lineGeo.dispose();
      pulseGeo.dispose();
      pulseTexture.dispose();
    };
  }, [lineGeo, pulseGeo, pulseTexture]);

  /* plate geometries — created once */
  const plateGeos = useMemo(
    () =>
      layers.map((L) => ({
        grid: plateGeometry(L.s),
        edge: new THREE.EdgesGeometry(new THREE.PlaneGeometry(L.s * 2.16, L.s * 2.16)),
      })),
    [layers]
  );
  useEffect(
    () => () => plateGeos.forEach(({ grid, edge }) => { grid.dispose(); edge.dispose(); }),
    [plateGeos]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05); // tab-switch safe, frame-rate independent
    const t = state.clock.elapsedTime;

    /* hero scroll progress — read directly, no react state */
    const scrollP = Math.min(1, (window.scrollY || 0) / Math.max(1, window.innerHeight));

    if (group.current) {
      group.current.rotation.y = t * 0.032 + scrollP * 0.55;
      group.current.rotation.x = Math.sin(t * 0.11) * 0.012 + scrollP * -0.1;
      group.current.position.y = scrollP * 0.9;
    }

    /* advance pulse traffic along the paths */
    const attr = pulsesRef.current?.geometry?.attributes?.position as THREE.BufferAttribute | undefined;
    if (attr) {
      const arr = attr.array as Float32Array;
      pulses.forEach((p, i) => {
        p.t += dt * p.speed;
        if (p.t > 1) p.t -= 1;
        const { a, b } = segs[p.seg];
        arr[i * 3] = a.x + (b.x - a.x) * p.t;
        arr[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
        arr[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
      });
      attr.needsUpdate = true;
    }
    void t;
  });

  return (
    <group ref={group}>
      {/* wireframe plates */}
      {layers.map((L, i) => (
        <lineSegments
          key={i}
          position={[L.x, L.y, L.z]}
          rotation={[L.tilt, i * 0.09, L.tilt * 0.5]}
          geometry={plateGeos[i].grid}
        >
          <lineBasicMaterial color={i % 2 ? "#5277a5" : "#5c9ead"} transparent opacity={0.14 - i * 0.012} fog />
        </lineSegments>
      ))}

      {/* architectural boundary edges */}
      {layers.map((L, i) => (
        <lineSegments
          key={`e${i}`}
          position={[L.x, L.y, L.z]}
          rotation={[L.tilt, i * 0.09, L.tilt * 0.5]}
          geometry={plateGeos[i].edge}
        >
          <lineBasicMaterial color="#a8b0bb" transparent opacity={0.1 - i * 0.008} fog />
        </lineSegments>
      ))}

      {/* instanced node clusters */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeData.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0.38} vertexColors fog />
      </instancedMesh>

      {/* connection paths */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#5277a5" transparent opacity={0.2} fog />
      </lineSegments>

      {/* pulse traffic */}
      <points ref={pulsesRef} geometry={pulseGeo}>
        <pointsMaterial size={0.09} map={pulseTexture} transparent opacity={0.75} sizeAttenuation depthWrite={false} fog />
      </points>
    </group>
  );
}

/* extremely sparse ambient dust — barely visible depth cue */
function Dust({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const rnd = mulberry32(99);
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pts[i * 3] = (rnd() - 0.5) * 11;
      pts[i * 3 + 1] = (rnd() - 0.5) * 7;
      pts[i * 3 + 2] = (rnd() - 0.5) * 6 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [count]);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.05) * 0.008;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#5277a5" size={0.02} transparent opacity={0.32} sizeAttenuation depthWrite={false} fog />
    </points>
  );
}

/* default export — Canvas wrapper with frameloop gate */
export default function HeroScene() {
  const [active, setActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  /* pause rendering entirely when the hero is off-screen or tab hidden */
  useEffect(() => {
    const el = wrapRef.current;
    let inView = true;
    const apply = () => setActive(inView && document.visibilityState !== "hidden");
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        apply();
      }, { threshold: 0.02 });
      io.observe(el);
    }
    const onVis = () => apply();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={isMobile ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0.2, 6.4], fov: 42, near: 0.1, far: 30 }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0x050505, 7.5, 15);
        }}
        style={{ background: "transparent" }}
      >
        <Strata isMobile={isMobile} />
        <Dust count={isMobile ? 40 : 90} />
      </Canvas>
      {/* readability gradients — kept from the previous version */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_38%,#050505_94%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#050505] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-[#050505]/80 to-transparent" />
    </div>
  );
}
