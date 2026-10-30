"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { IDENTITY, SOCIALS } from "@/lib/data";
import { scrollToSection, useMagnetic } from "./hooks";
import { ContourField, GridBackdrop, TelemetryCard, CircuitFragment } from "./layers";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-[#5277a5]/[0.05] blur-3xl" />
    </div>
  ),
});

/* animated headline word */
function RevealWord({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
      <motion.span
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-block will-change-transform ${className ?? ""}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const { ref: cvRef, onMouseMove: onCvMove, onMouseLeave: onCvLeave } = useMagnetic<HTMLDivElement>(0.25);
  const { ref: workRef, onMouseMove: onWorkMove, onMouseLeave: onWorkLeave } = useMagnetic<HTMLDivElement>(0.3);

  /* ── scroll-driven layer choreography ─────────────────────── */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* content rises and fades first */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  /* scene lingers — slow zoom out */
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.12]);
  /* backdrop layers move at different speeds = depth */
  const contourY = useTransform(scrollYProgress, [0, 1], [30, -90]);
  const contourRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const gridY = useTransform(scrollYProgress, [0, 1], [10, -50]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.25]);
  const fragX1 = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const fragX2 = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section id="home" ref={sectionRef} className="relative min-h-[100svh] flex flex-col overflow-hidden">
      {/* ── LAYER 1 · contour topology (slowest) ── */}
      <motion.div
        aria-hidden="true"
        style={{ y: contourY, rotate: contourRotate, opacity: 0.55, willChange: "transform" }}
        className="absolute -inset-[6%] z-0"
      >
        <ContourField seed={11} lines={10} className="w-full h-full" opacity={0.11} />
      </motion.div>

      {/* ── LAYER 2 · strata infrastructure scene ── */}
      <motion.div aria-hidden="true" style={{ scale: sceneScale, opacity: sceneOpacity, willChange: "transform, opacity" }} className="absolute inset-0 z-0">
        <HeroScene />
      </motion.div>

      {/* ── LAYER 3 · floating telemetry fragments (desktop) ── */}
      <motion.div aria-hidden="true" style={{ x: fragX1, opacity: 0.5, willChange: "transform" }} className="absolute top-[21%] left-[4%] z-[1] hidden lg:block">
        <TelemetryCard
          className="rotate-[-1.2deg]"
          lines={[
            ["etl.status", "RUNNING", "#ccff00"],
            ["queue.depth", "0421"],
            ["sync.latency", "42ms"],
          ]}
        />
      </motion.div>
      <motion.div aria-hidden="true" style={{ x: fragX2, opacity: 0.45, willChange: "transform" }} className="absolute bottom-[31%] right-[5%] z-[1] hidden lg:block">
        <TelemetryCard
          className="rotate-[1.4deg]"
          accent="#75658f"
          lines={[
            ["bronze.silver.gold", "ΔLake"],
            ["jobs.queued", "07"],
            ["cluster.nodes", "12"],
          ]}
        />
      </motion.div>
      <motion.div aria-hidden="true" style={{ x: fragX2, opacity: 0.4, willChange: "transform" }} className="absolute top-[56%] left-[9%] z-[1] hidden xl:block w-[220px] h-[150px] relative">
        <CircuitFragment className="w-full h-full absolute inset-0" opacity={0.4} />
      </motion.div>

      {/* ── LAYER 4 · fine grid (fastest, fades first) ── */}
      <motion.div aria-hidden="true" style={{ y: gridY, opacity: gridOpacity, willChange: "transform, opacity" }} className="absolute inset-0 z-0">
        <GridBackdrop size={84} opacity={0.05} />
      </motion.div>

      {/* ── corner coordinates ── */}
      <span aria-hidden="true" className="absolute top-[76px] md:top-[88px] left-5 md:left-10 z-[2] font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#a8b0bb]/30 pointer-events-none select-none">
        24.585°N / 73.712°E
      </span>
      <span aria-hidden="true" className="absolute top-[76px] md:top-[88px] right-5 md:right-10 z-[2] font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#a8b0bb]/30 pointer-events-none select-none hidden sm:block">
        SYS.PORTFOLIO_v2
      </span>

      {/* top meta row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 0.35, duration: 0.8 }}
        className="relative z-10 flex justify-between px-5 md:px-10 pt-24 md:pt-28 font-mono2 text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-[#8b94a0]"
      >
        <span>Portfolio © 2025</span>
        <span className="hidden md:inline">{IDENTITY.role}</span>
        <span className="text-right">Udaipur — India</span>
      </motion.div>

      {/* main display type — scroll-fading foreground */}
      <motion.div style={{ y: contentY, opacity: contentOpacity, willChange: "transform, opacity" }} className="relative z-10 flex-1 flex flex-col justify-center px-5 md:px-10 mt-4 md:mt-0">
        <h1 className="font-display font-bold leading-[0.88] tracking-[-0.03em] select-none">
          <span className="block text-[17.5vw] md:text-[15vw] text-[#ededed]">
            {ready ? <RevealWord delay={0.15}>{IDENTITY.firstName}</RevealWord> : <span className="opacity-0">{IDENTITY.firstName}</span>}
          </span>
          <span className="block text-[17.5vw] md:text-[15vw] md:pl-[12vw]">
            {ready ? (
              <RevealWord delay={0.28} className="text-stroke">
                {IDENTITY.lastName}
              </RevealWord>
            ) : (
              <span className="opacity-0">{IDENTITY.lastName}</span>
            )}
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={ready ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-block align-top mt-[0.12em] ml-[0.06em] w-[3.2vw] h-[3.2vw] min-w-4 min-h-4 md:w-[2.6vw] md:h-[2.6vw] rounded-full bg-[#ccff00]"
            />
          </span>
        </h1>

        {/* role + intro */}
        <div className="mt-8 md:mt-10 grid md:grid-cols-12 gap-6 items-end">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#ccff00] animate-ping-soft" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ccff00]" />
              </span>
              <span className="font-mono2 text-[10px] tracking-[0.26em] uppercase text-[#ccff00]">
                Open to opportunities
              </span>
            </div>
            <p className="font-display text-xl md:text-2xl font-medium text-[#ededed] leading-snug">
              {IDENTITY.role} — building{" "}
              <span className="text-gradient-tech font-semibold">reliable pipelines</span>, not just apps.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.68, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-4 md:col-start-6 text-[13px] md:text-sm leading-relaxed text-[#9aa3af] max-w-md"
          >
            {IDENTITY.intro}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-3 flex md:flex-col gap-3 md:items-end"
          >
            <div ref={workRef} onMouseMove={onWorkMove} onMouseLeave={onWorkLeave}>
              <button
                onClick={() => scrollToSection("#work")}
                data-cursor="Explore"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#e8eaee] text-black font-display font-semibold text-sm hover:bg-[#5c9ead] hover:text-white transition-colors duration-300"
              >
                View my work
                <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </button>
            </div>
            <div ref={cvRef} onMouseMove={onCvMove} onMouseLeave={onCvLeave}>
              <a
                href={IDENTITY.cv}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="CV"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/20 text-[#e8eaee] font-display font-medium text-sm hover:border-[#5c9ead] hover:text-[#5c9ead] transition-colors duration-300"
              >
                Download CV
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 flex items-center justify-between px-5 md:px-10 pb-6 md:pb-8"
      >
        <button
          onClick={() => scrollToSection("#about")}
          className="flex items-center gap-3 group"
          aria-label="Scroll to about"
        >
          <span className="block w-px h-10 bg-white/20 overflow-hidden relative">
            <span className="absolute inset-x-0 top-0 h-full bg-[#5c9ead] animate-scroll-line" />
          </span>
          <span className="font-mono2 text-[9px] tracking-[0.3em] uppercase text-[#8b94a0] group-hover:text-white transition-colors [writing-mode:vertical-rl] rotate-180">
            Scroll
          </span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {SOCIALS.slice(0, 4).map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor={s.short}
              aria-label={s.label}
              className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center font-mono2 text-[9px] tracking-wider text-[#a8b0bb] hover:border-[#5c9ead] hover:text-[#5c9ead] hover:-translate-y-1 transition-all duration-300"
            >
              {s.short}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
