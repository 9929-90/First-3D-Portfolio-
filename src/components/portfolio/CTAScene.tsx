"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ────────────────────────────────────────────────────────────
   CTA SCENE — closing environment.
   Previously a bright rotating torus-knot (WebGL). Replaced with
   a restrained SVG "signal field": layered drifting waves, a slow
   orbital ring and a lone pulse. Zero extra WebGL contexts, zero
   post-processing, transform/opacity only.
   ──────────────────────────────────────────────────────────── */

export default function CTAScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  /* layered drift — three paths at different speeds */
  const wave1X = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const wave2X = useTransform(scrollYProgress, [0, 1], [40, -80]);
  const wave3Y = useTransform(scrollYProgress, [0, 1], [30, -40]);

  return (
    <div ref={ref} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* atmosphere wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_62%,rgba(70, 88, 106,0.09),transparent_64%),radial-gradient(ellipse_45%_38%_at_30%_20%,rgba(83, 108, 131,0.05),transparent_60%)]" />

      {/* signal waves */}
      <motion.svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ x: wave1X, willChange: "transform" }}
        className="absolute left-[-4%] top-[24%] w-[108%] h-[42%] opacity-50"
      >
        <path d="M0 160 C 240 90, 480 230, 720 160 S 1200 90, 1440 160" fill="none" stroke="rgba(83, 108, 131,0.22)" strokeWidth="1" />
        <path d="M0 180 C 260 120, 500 250, 740 175 S 1180 110, 1440 185" fill="none" stroke="rgba(70, 88, 106,0.16)" strokeWidth="1" />
      </motion.svg>

      <motion.svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ x: wave2X, y: wave3Y, willChange: "transform" }}
        className="absolute left-[-4%] bottom-[16%] w-[108%] h-[36%] opacity-40"
      >
        <path d="M0 200 C 300 150, 560 240, 860 190 S 1240 140, 1440 200" fill="none" stroke="rgba(86, 96, 108,0.18)" strokeWidth="1" />
      </motion.svg>

      {/* slow orbital ring — top right, barely there */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute -top-10 right-[6%] w-[min(30vw,300px)] opacity-[0.32] animate-rotate-slower"
        style={{ willChange: "transform" }}
      >
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(83, 108, 131,0.25)" strokeWidth="0.5" strokeDasharray="2 5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(86, 96, 108,0.3)" strokeWidth="0.5" />
        <line x1="100" y1="0" x2="100" y2="12" stroke="rgba(204,255,0,0.55)" strokeWidth="1" />
      </motion.svg>

      {/* lone pulse riding the signal */}
      <motion.div
        style={{ x: wave2X }}
        className="absolute top-[38%] left-[12%] w-[5px] h-[5px] rounded-full bg-[#ccff00] opacity-60"
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,#08090B_92%)]" />
    </div>
  );
}
