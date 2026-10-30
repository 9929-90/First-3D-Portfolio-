"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { buildLab, weightRef, type LabHandle } from "./labScene";
import { sampleLab, makeLabSample, focusWeights, FINAL_P_LAB } from "./labPath";
import { loadScreenTextures, disposeScreenTextures } from "./labTextures";
import { STATIONS } from "./labData";

/* ═══════════════════════════════════════════════════════════════
   LAB STAGE — one WebGL context for the Digital Laboratory.
   Same contract as the rocket and galaxy stages: scroll progress
   arrives via a mutable ref (zero re-renders), the rig smooths it
   into a single continuous camera crane, rendering pauses
   off-screen / hidden, and everything is disposed on unmount.
   ═══════════════════════════════════════════════════════════════ */

export interface LabProgress {
  /** scroll target 0..1 (written by ScrollTrigger) */
  target: number;
}

/* ── camera crane — reads scroll progress, never re-renders ── */
function Rig({
  progressRef,
  reduced,
  isMobile,
}: {
  progressRef: React.RefObject<LabProgress>;
  reduced: boolean;
  isMobile: boolean;
}) {
  const { camera, size } = useThree();
  const smooth = useRef(-1);
  const mouse = useRef({ x: 0, y: 0 });
  const sample = useMemo(() => makeLabSample(), []);
  const lookCur = useRef(new THREE.Vector3());
  const handleRef = useRef<LabHandle | null>(null);
  const [screenTexs, setScreenTexs] = useState<Map<number, THREE.Texture> | null>(null);

  useEffect(() => {
    let live = true;
    loadScreenTextures().then((m) => {
      if (live) setScreenTexs(m);
      else for (const t of m.values()) t.dispose();
    });
    return () => {
      live = false;
    };
  }, []);

  /* real screenshot textures live with the Rig — disposed on unmount */
  useEffect(() => {
    return () => {
      if (screenTexs) disposeScreenTextures(screenTexs);
    };
  }, [screenTexs]);

  const lab = useMemo(
    () => (screenTexs ? buildLab(isMobile, screenTexs) : null),
    [screenTexs, isMobile]
  );

  useEffect(() => {
    handleRef.current = lab;
    return () => {
      if (lab) {
        lab.dispose();
        handleRef.current = null;
      }
    };
  }, [lab]);

  /* reduced motion — render the settled composition once */
  const invalidate = useThree((s) => s.invalidate);
  const invalidateRef = useRef<(() => void) | null>(null);
  invalidateRef.current = invalidate;
  useEffect(() => {
    if (!reduced || !lab) return;
    const id = setTimeout(() => invalidateRef.current?.(), 60);
    return () => clearTimeout(id);
  }, [reduced, lab]);

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
    const labH = handleRef.current;
    if (!labH) return;
    const dt = Math.min(delta, 0.05);

    const target = reduced ? FINAL_P_LAB : (progressRef.current?.target ?? 0);
    if (smooth.current < 0) {
      smooth.current = target;
      const first = sampleLab(target, sample);
      camera.position.copy(first.pos);
      lookCur.current.copy(first.look);
      camera.lookAt(lookCur.current);
      (camera as THREE.PerspectiveCamera).fov = first.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 3.6));
    const p = smooth.current;

    sampleLab(p, sample);

    /* portrait framing — dolly out along the view axis on narrow screens */
    const aspect = size.width / Math.max(1, size.height);
    const m = aspect < 0.75 ? 1.42 : aspect < 1.05 ? 1.2 : 1;
    if (m !== 1) {
      _dir.subVectors(sample.pos, sample.look).multiplyScalar(m);
      sample.pos.copy(sample.look).add(_dir);
    }

    /* micro life — breathing drift + mouse parallax */
    if (!reduced) {
      const t = state.clock.elapsedTime;
      sample.pos.x += Math.sin(t * 0.1) * 0.03 + mouse.current.x * (isMobile ? 0 : 0.07);
      sample.pos.y += Math.cos(t * 0.08) * 0.02 - mouse.current.y * (isMobile ? 0 : 0.05);
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

    focusWeights(p, weightRef.w);
    labH.update(delta, p);
  });

  if (!lab) return null;
  return <primitive object={lab.group} />;
}

const _dir = new THREE.Vector3();

/* ── public component ── */
export default function LabStage({
  progressRef,
  active,
  reduced,
}: {
  progressRef: React.RefObject<LabProgress>;
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

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true" style={{ pointerEvents: "none" }}>
      <Canvas
        frameloop={reduced ? "demand" : active ? "always" : "never"}
        dpr={isMobile ? [1, 1.4] : [1, dpr]}
        camera={{ position: [0, 2.08, 12.6], fov: 42, near: 0.1, far: 240 }}
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
        <fog attach="fog" args={["#0B0D10", 26, 105]} />
        <Rig progressRef={progressRef} reduced={reduced} isMobile={isMobile} />
      </Canvas>

      {/* readability gradients — the lab stays the focus, text stays legible */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_54%,rgba(11,13,16,0.4)_86%,rgba(11,13,16,0.78)_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[34%] pointer-events-none bg-gradient-to-l from-[#0B0D10]/55 via-[#0B0D10]/15 to-transparent max-md:w-full max-md:bg-gradient-to-t max-md:from-[#0B0D10]/75 max-md:via-[#0B0D10]/26 max-md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#0B0D10]/80 to-transparent" />
    </div>
  );
}
