"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { buildGalaxy, nebulaTargetRef, type GalaxyHandle } from "./galaxyScene";
import { sampleGalaxy, makeGalaxySample, focusWeights, FINAL_P_GALAXY } from "./galaxyPath";
import { prepareIconTextures, disposeIconTextures } from "./iconTextures";
import { PLANETS } from "./galaxyData";

/* ═══════════════════════════════════════════════════════════════
   GALAXY STAGE — one WebGL context for the Skill Galaxy.
   Same contract as the rocket stage: scroll progress arrives via a
   mutable ref (zero re-renders), the rig smooths it into a single
   continuous camera crane, rendering pauses off-screen / hidden.
   ═══════════════════════════════════════════════════════════════ */

export interface GalaxyProgress {
  /** scroll target 0..1 (written by ScrollTrigger) */
  target: number;
}

const ALL_ICON_SLUGS = PLANETS.flatMap((p) => p.iconSet.map((i) => i.slug));

/* ── camera crane — reads scroll progress, never re-renders ── */
function Rig({
  progressRef,
  reduced,
  isMobile,
}: {
  progressRef: React.RefObject<GalaxyProgress>;
  reduced: boolean;
  isMobile: boolean;
}) {
  const { camera, size } = useThree();
  const smooth = useRef(-1);
  const mouse = useRef({ x: 0, y: 0 });
  const sample = useMemo(() => makeGalaxySample(), []);
  const lookCur = useRef(new THREE.Vector3());
  const weights = useMemo(() => new Float32Array(PLANETS.length), []);
  const handleRef = useRef<GalaxyHandle | null>(null);
  const [iconTexs, setIconTexs] = useState<Map<string, THREE.Texture> | null>(null);

  useEffect(() => {
    let live = true;
    prepareIconTextures(ALL_ICON_SLUGS).then((m) => {
      if (live) setIconTexs(m);
    });
    return () => {
      live = false;
    };
  }, []);

  const galaxy = useMemo(
    () => (iconTexs ? buildGalaxy(isMobile, iconTexs) : null),
    [iconTexs, isMobile]
  );

  useEffect(() => {
    handleRef.current = galaxy;
    return () => {
      if (galaxy) {
        galaxy.dispose();
        handleRef.current = null;
      }
    };
  }, [galaxy]);

  /* reduced motion — render the settled composition once */
  useEffect(() => {
    if (!reduced || !galaxy) return;
    const id = setTimeout(() => invalidateRef.current?.(), 60);
    return () => clearTimeout(id);
  }, [reduced, galaxy]);

  const invalidateRef = useRef<(() => void) | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  invalidateRef.current = invalidate;

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  useFrame((state, delta) => {
    const galaxyH = handleRef.current;
    if (!galaxyH) return;
    const dt = Math.min(delta, 0.05);

    const target = reduced ? FINAL_P_GALAXY : (progressRef.current?.target ?? 0);
    if (smooth.current < 0) {
      smooth.current = target;
      const first = sampleGalaxy(target, sample);
      camera.position.copy(first.pos);
      lookCur.current.copy(first.look);
      camera.lookAt(lookCur.current);
      (camera as THREE.PerspectiveCamera).fov = first.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 3.6));
    const p = smooth.current;

    sampleGalaxy(p, sample);

    /* portrait framing — dolly out along the view axis on narrow screens */
    const aspect = size.width / Math.max(1, size.height);
    const m = aspect < 0.75 ? 1.58 : aspect < 1.05 ? 1.26 : 1;
    if (m !== 1) {
      _dir.subVectors(sample.pos, sample.look).multiplyScalar(m);
      sample.pos.copy(sample.look).add(_dir);
    }

    /* micro life — breathing drift + mouse parallax */
    if (!reduced) {
      const t = state.clock.elapsedTime;
      sample.pos.x += Math.sin(t * 0.11) * 0.035 + mouse.current.x * (isMobile ? 0 : 0.09);
      sample.pos.y += Math.cos(t * 0.085) * 0.025 - mouse.current.y * (isMobile ? 0 : 0.06);
    }

    const k = 1 - Math.exp(-dt * 7.5);
    camera.position.lerp(sample.pos, k);
    lookCur.current.lerp(sample.look, k);
    camera.lookAt(lookCur.current);

    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - sample.fov) > 0.005) {
      cam.fov += (sample.fov - cam.fov) * (1 - Math.exp(-dt * 5));
      cam.updateProjectionMatrix();
    }

    focusWeights(p, weights);
    nebulaTargetRef.value = sample.nebula;
    galaxyH.setOrbitTarget(sample.orbit);
    galaxyH.update(delta, p, weights, camera);
  });

  if (!galaxy) return null;
  return <primitive object={galaxy.group} />;
}

const _dir = new THREE.Vector3();

/* ── public component ── */
export default function GalaxyStage({
  progressRef,
  active,
  reduced,
}: {
  progressRef: React.RefObject<GalaxyProgress>;
  active: boolean;
  reduced: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1.6);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => () => disposeIconTextures(), []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true" style={{ pointerEvents: "none" }}>
      <Canvas
        frameloop={reduced ? "demand" : active ? "always" : "never"}
        dpr={isMobile ? [1, 1.4] : [1, dpr]}
        camera={{ position: [0, 1.5, 4], fov: 40, near: 0.1, far: 220 }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        style={{ background: "transparent" }}
      >
        <PerformanceMonitor
          ms={250}
          iterations={8}
          onDecline={() => setDpr(1)}
          onFallback={() => setDpr(1)}
        />
        <fog attach="fog" args={["#08090B", 50, 135]} />
        <Rig progressRef={progressRef} reduced={reduced} isMobile={isMobile} />
      </Canvas>

      {/* readability gradients — planets stay the focus, text stays legible */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(8,9,11,0.42)_86%,rgba(8,9,11,0.8)_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[34%] pointer-events-none bg-gradient-to-l from-[#08090B]/55 via-[#08090B]/15 to-transparent max-md:w-full max-md:bg-gradient-to-t max-md:from-[#08090B]/75 max-md:via-[#08090B]/28 max-md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#08090B] via-[#08090B]/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#08090B]/80 to-transparent" />
    </div>
  );
}
