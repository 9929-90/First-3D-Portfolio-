"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = new THREE.Color("#ccff00");

function Knot() {
  const knot = useRef<THREE.Mesh>(null);
  const points = useRef<THREE.Points>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (knot.current) {
      knot.current.rotation.x += delta * 0.14;
      knot.current.rotation.y += delta * 0.1;
    }
    if (points.current) {
      points.current.rotation.y -= delta * 0.05;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.2;
      ring.current.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={knot}>
        <torusKnotGeometry args={[1.7, 0.5, 180, 24]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.16} />
      </mesh>
      <points ref={points}>
        <icosahedronGeometry args={[3.2, 1]} />
        <pointsMaterial color={ACCENT} size={0.03} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>
      <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.9, 0.006, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function CTAScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Knot />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050505_88%)]" />
    </div>
  );
}
