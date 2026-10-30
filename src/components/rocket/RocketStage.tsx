"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { buildRocket } from "./rocketModel";
import {
  FINAL_P,
  makeCameraSample,
  rocketYawAt,
  sampleCamera,
  type CameraSample,
} from "./cameraPath";

/* ═══════════════════════════════════════════════════════════════
   ROCKET STAGE — single WebGL context for the whole experience.
   Scroll progress arrives through a mutable ref (zero React
   re-renders per frame); the rig smooths it into a cinematic
   camera crane. Rendering pauses off-screen and on hidden tabs.
   ═══════════════════════════════════════════════════════════════ */

export interface StageProgress {
  /** scroll target 0..1 (written by ScrollTrigger) */
  target: number;
  /** 0→1 intro settle once the preloader lifts */
  intro: number;
}

/* ── custom studio environment — controlled cinematic reflections ── */
function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();

    const room = new THREE.Mesh(
      new THREE.SphereGeometry(18, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#0B0E13"), side: THREE.BackSide })
    );
    envScene.add(room);

    const panel = (
      w: number,
      h: number,
      color: string,
      intensity: number,
      pos: [number, number, number]
    ) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      envScene.add(m);
    };

    panel(9, 14, "#DEE6EE", 4.4, [-7, 11, 7]); // key — soft white, upper left
    panel(2.6, 17, "#536C83", 6.5, [9, 5, -7]); // cool rim strip, right rear
    panel(1.4, 19, "#E8EFF6", 7.2, [-2.5, 13, 1.5]); // top specular streak
    panel(12, 7, "#1A212B", 2.2, [0, -9, 5]); // dim bottom fill

    const rt = pmrem.fromScene(envScene, 0.045);
    scene.environment = rt.texture;

    envScene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    pmrem.dispose();

    return () => {
      scene.environment = null;
      rt.texture.dispose();
      rt.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* ── rocket + framing-critical lights ── */
function Vehicle({ isMobile, reduced, shadows }: { isMobile: boolean; reduced: boolean; shadows: boolean }) {
  const { gl } = useThree();
  const rocket = useMemo(
    () => buildRocket(isMobile ? "low" : "high", gl.capabilities.getMaxAnisotropy()),
    [isMobile, gl]
  );

  useEffect(() => () => rocket.dispose(), [rocket]);

  useFrame((state) => {
    rocket.update(state.clock.elapsedTime);
  });

  return (
    <>
      {/* key — soft studio white, casts the fin/body self-shadow */}
      <directionalLight
        position={[5, 9.5, 6]}
        intensity={2.9}
        color="#E9EEF4"
        castShadow={!isMobile && shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={9}
        shadow-camera-bottom={-1}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0001}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      {/* cool rim from behind right — separates graphite from void */}
      <directionalLight position={[-6, 4.5, -6]} intensity={1.7} color="#536C83" />
      {/* faint ambient floor bounce */}
      <pointLight position={[0, -1.2, 3.4]} intensity={0.5} color="#2A333D" distance={12} />
      <ambientLight intensity={0.16} color="#39424E" />

      <primitive object={rocket.group} rotation={[0, reduced ? rocketYawAt(FINAL_P) : 0, 0]} />
    </>
  );
}

/* ── atmosphere: sparse dust + backdrop glow ── */
function makeSoftDot(size = 64): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function Atmosphere({ isMobile }: { isMobile: boolean }) {
  const dustRef = useRef<THREE.Points>(null);
  const dot = useMemo(() => makeSoftDot(), []);

  const count = isMobile ? 60 : 130;
  const dustGeo = useMemo(() => {
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 2.4 + rnd() * 5.5;
      pts[i * 3] = Math.cos(a) * r;
      pts[i * 3 + 1] = rnd() * 9.5;
      pts[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [count]);

  useEffect(() => {
    return () => {
      dustGeo.dispose();
      dot.dispose();
    };
  }, [dustGeo, dot]);

  useFrame((_, delta) => {
    if (dustRef.current) {
      dustRef.current.rotation.y += Math.min(delta, 0.05) * 0.006;
    }
  });

  /* backdrop halo — barely-there steel atmosphere behind the vehicle */
  const halo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(83,108,131,0.16)");
    g.addColorStop(0.55, "rgba(83,108,131,0.05)");
    g.addColorStop(1, "rgba(83,108,131,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => halo.dispose(), [halo]);

  return (
    <>
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          map={dot}
          color="#7E93A8"
          size={0.032}
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh position={[-1.2, 4.4, -10]} scale={[30, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={halo} transparent opacity={0.6} depthWrite={false} fog={false} />
      </mesh>
    </>
  );
}

/* ── camera crane — reads scroll progress, never re-renders ── */
function Rig({
  progressRef,
  reduced,
}: {
  progressRef: React.RefObject<StageProgress>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const smooth = useRef(-1);
  const mouse = useRef({ x: 0, y: 0 });
  const sample = useMemo<CameraSample>(() => makeCameraSample(), []);
  const lookCur = useRef(new THREE.Vector3(-0.26, 5.78, 0));

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
    const dt = Math.min(delta, 0.05);
    const prog = progressRef.current ?? { target: 0, intro: 1 };
    const target = reduced ? FINAL_P : prog.target;

    if (smooth.current < 0) smooth.current = target;
    smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 3.8));
    const p = smooth.current;

    sampleCamera(p, sample);

    /* portrait framing — keep the vehicle dominant on narrow screens */
    const aspect = size.width / Math.max(1, size.height);
    const m = aspect < 0.75 ? 1.62 : aspect < 1.05 ? 1.28 : 1;
    sample.pos.x *= m;
    sample.pos.z *= m;
    sample.look.x *= m * 0.45;

    /* intro settle — camera drifts in once the preloader lifts */
    const intro = reduced ? 1 : prog.intro;
    if (intro < 1) {
      const k = 1 - intro;
      sample.pos.x += -0.45 * k;
      sample.pos.y += 0.4 * k;
      sample.pos.z += -0.75 * k;
    }

    /* micro life — handheld breathing + mouse parallax */
    if (!reduced) {
      const t = state.clock.elapsedTime;
      sample.pos.x += Math.sin(t * 0.12) * 0.02 + mouse.current.x * 0.075;
      sample.pos.y += Math.cos(t * 0.09) * 0.015 - mouse.current.y * 0.05;
    }

    const k = 1 - Math.exp(-dt * 7.5);
    camera.position.lerp(sample.pos, k);
    lookCur.current.lerp(sample.look, k);
    camera.lookAt(lookCur.current);

    const cam = camera as THREE.PerspectiveCamera;
    const targetFov = sample.fov + (1 - intro) * 4;
    if (Math.abs(cam.fov - targetFov) > 0.005) {
      cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-dt * 5));
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/* yaw the vehicle subtly across the journey + mouse influence */
function VehicleYaw({
  progressRef,
  reduced,
  children,
}: {
  progressRef: React.RefObject<StageProgress>;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const smooth = useRef(-1);
  const mouse = useRef({ x: 0 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const prog = progressRef.current;
    const target = reduced ? FINAL_P : (prog?.target ?? 0);
    if (smooth.current < 0) smooth.current = target;
    smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 3.8));
    const yaw = rocketYawAt(smooth.current) + (reduced ? 0 : mouse.current.x * 0.035);
    ref.current.rotation.y += (yaw - ref.current.rotation.y) * (1 - Math.exp(-dt * 4));
  });

  return <group ref={ref}>{children}</group>;
}

/* ── public component ── */
export default function RocketStage({
  progressRef,
  active,
  reduced,
}: {
  progressRef: React.RefObject<StageProgress>;
  active: boolean;
  reduced: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1.6);
  const [shadows, setShadows] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={isMobile ? [1, 1.5] : [1, dpr]}
        camera={{ position: [1.15, 6.02, 1.38], fov: 40, near: 0.1, far: 60 }}
        shadows={isMobile || !shadows ? false : { type: THREE.PCFShadowMap }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
        style={{ background: "transparent" }}
      >
        {/* adaptive quality — sustained long frames drop DPR, then shadows */}
        <PerformanceMonitor
          ms={250}
          iterations={8}
          onDecline={() => setDpr(1)}
          onFallback={() => {
            setDpr(1);
            setShadows(false);
          }}
        />
        <fog attach="fog" args={["#08090B", 13, 30]} />
        <StudioEnv />
        <Rig progressRef={progressRef} reduced={reduced} />
        <VehicleYaw progressRef={progressRef} reduced={reduced}>
          <Vehicle isMobile={isMobile} reduced={reduced} shadows={shadows} />
        </VehicleYaw>
        <Atmosphere isMobile={isMobile} />
      </Canvas>

      {/* readability gradients — rocket stays the hero, text stays legible */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(8,9,11,0.55)_82%,#08090B_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[46%] pointer-events-none bg-gradient-to-r from-[#08090B]/85 via-[#08090B]/25 to-transparent max-md:w-full max-md:from-[#08090B]/55" />
      <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none bg-gradient-to-t from-[#08090B] via-[#08090B]/55 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#08090B]/85 to-transparent" />
    </div>
  );
}
