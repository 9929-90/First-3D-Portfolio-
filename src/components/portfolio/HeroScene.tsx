"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

const ACCENT = new THREE.Color("#ccff00");

/* ────────────────────────────────────────────────────────────
   Particle field — custom GPU shader, ~6500 points
   ──────────────────────────────────────────────────────────── */
function ParticleField({ count = 6500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // spherical shell distribution with noise
      const r = 3.2 + Math.pow(Math.random(), 2.2) * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.75) },
      uSize: { value: size.width < 768 ? 26 : 34 },
    }),
    []
  );

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.028;
      pointsRef.current.rotation.x =
        state.pointer.y * 0.08 + Math.sin(uniforms.uTime.value * 0.1) * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aSeed;
          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uSize;
          varying float vSeed;
          void main() {
            vSeed = aSeed;
            vec3 p = position;
            // slow orbital drift per particle
            float t = uTime * (0.12 + aSeed * 0.22);
            p.x += sin(t + aSeed * 40.0) * 0.28;
            p.y += cos(t * 0.8 + aSeed * 60.0) * 0.28;
            p.z += sin(t * 0.6 + aSeed * 80.0) * 0.22;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z) * (0.5 + aSeed * 0.8);
          }
        `}
        fragmentShader={`
          varying float vSeed;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.0, d);
            // accent for 12% of particles, dim white for the rest
            vec3 white = vec3(0.62, 0.65, 0.62);
            vec3 accent = vec3(0.80, 1.0, 0.0);
            vec3 col = mix(white, accent, step(0.88, vSeed));
            gl_FragColor = vec4(col, alpha * 0.55 * (0.35 + vSeed * 0.65));
          }
        `}
      />
    </points>
  );
}

/* ────────────────────────────────────────────────────────────
   Data core — distorted icosahedron + orbit rings
   ──────────────────────────────────────────────────────────── */
function DataCore() {
  const group = useRef<THREE.Group>(null);
  const wire = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.z = Math.sin(t * 0.18) * 0.08;
      group.current.position.y = Math.sin(t * 0.5) * 0.12;
      // mouse parallax
      group.current.rotation.x += (state.pointer.y * 0.22 - group.current.rotation.x) * 0.04;
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.16;
      wire.current.rotation.x = Math.sin(t * 0.24) * 0.2;
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.035;
      inner.current.scale.setScalar(s);
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.3;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.22;
  });

  return (
    <group ref={group}>
      {/* glowing wireframe shell */}
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial
          color={ACCENT}
          wireframe
          transparent
          opacity={0.32}
        />
      </mesh>
      {/* dark solid core */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.25}
          metalness={0.9}
          emissive="#1a1d05"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* accent halo points on core vertices */}
      <mesh>
        <icosahedronGeometry args={[1.46, 1]} />
        <pointsMaterial
          color={ACCENT}
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      {/* orbit rings */}
      <mesh ref={ring1} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.7, 0.006, 8, 128]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 1.7, -0.4, 0.5]}>
        <torusGeometry args={[3.15, 0.004, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
      {/* key light for the core sheen */}
      <pointLight position={[4, 3, 5]} intensity={18} color="#e8ffd0" />
      <pointLight position={[-4, -2, -3]} intensity={10} color="#3a4005" />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Camera rig — drifts with pointer + scroll
   ──────────────────────────────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  useFrame((state) => {
    const scrollP = Math.min(
      1,
      (window.scrollY || 0) / Math.max(1, window.innerHeight)
    );
    const targetX = state.pointer.x * 0.55;
    const targetY = 0.25 + state.pointer.y * 0.35 + scrollP * 1.2;
    const targetZ = 7.2 - scrollP * 1.6;
    camera.position.x += (targetX - camera.position.x) * 0.045;
    camera.position.y += (targetY - camera.position.y) * 0.045;
    camera.position.z += (targetZ - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.3, 7.2], fov: 42, near: 0.1, far: 40 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#050505", 8, 18]} />
        <ambientLight intensity={0.25} />
        <ParticleField />
        <DataCore />
        <CameraRig />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.75}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.35}
            mipmapBlur
            radius={0.72}
          />
          <Vignette eskil={false} offset={0.18} darkness={0.86} />
        </EffectComposer>
      </Canvas>
      {/* readability gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,#050505_92%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#050505] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-[#050505]/80 to-transparent" />
    </div>
  );
}
