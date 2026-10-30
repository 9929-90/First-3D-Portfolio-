"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ABOUT, IDENTITY } from "@/lib/data";
import { useCountUp, useTilt } from "./hooks";
import { ContourField, CircuitFragment, GridBackdrop } from "./layers";

/* word-by-word scroll reveal paragraph */
function ScrollWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display font-medium text-[26px] leading-[1.3] md:text-[44px] md:leading-[1.25] tracking-tight">
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {w}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const isAccent = children === "Data" || children === "Engineer" || children === "pipelines";
  return (
    <motion.span style={{ opacity }} className={isAccent ? "text-[#536C83]" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

function Stat({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const n = useCountUp(value, active);
  return (
    <div className="border-t border-white/10 pt-4">
      <div className="font-display font-bold text-4xl md:text-5xl tracking-tight tabular-nums text-[#E6E9ED]">
        {n}
        <span className="text-[#536C83]">{suffix}</span>
      </div>
      <div className="mt-1 font-mono2 text-[9.5px] tracking-[0.22em] uppercase text-[#7E8994]">{label}</div>
    </div>
  );
}

export default function About() {
  const { ref: imgRef, onMouseMove: onImgMove, onMouseLeave: onImgLeave } = useTilt<HTMLDivElement>(7);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });

  /* layered parallax within the section */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contourY = useTransform(scrollYProgress, [0, 1], [50, -70]);
  const fragY1 = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const fragY2 = useTransform(scrollYProgress, [0, 1], [110, -50]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <section id="about" ref={sectionRef} className="relative px-5 md:px-10 py-24 md:py-36 overflow-hidden">
      {/* ── backdrop layers ── */}
      <motion.div aria-hidden="true" style={{ y: contourY, willChange: "transform" }} className="absolute inset-0 opacity-[0.55] pointer-events-none">
        <ContourField seed={23} lines={8} className="w-full h-full" opacity={0.09} />
      </motion.div>
      <GridBackdrop size={110} opacity={0.03} />

      {/* drifting circuit fragments — desktop only */}
      <motion.div aria-hidden="true" style={{ y: fragY1, willChange: "transform" }} className="absolute top-[12%] right-[6%] w-[260px] h-[180px] hidden lg:block opacity-60 pointer-events-none">
        <CircuitFragment className="w-full h-full" opacity={0.13} />
      </motion.div>
      <motion.div aria-hidden="true" style={{ y: fragY2, willChange: "transform" }} className="absolute bottom-[8%] left-[2%] w-[300px] h-[200px] hidden lg:block opacity-50 pointer-events-none">
        <CircuitFragment className="w-full h-full" opacity={0.1} color="rgba(86, 96, 108,1)" flip />
      </motion.div>

      {/* section header */}
      <div className="relative z-10 flex items-end justify-between mb-12 md:mb-20">
        <div>
          <span className="section-label">01 — About</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Behind the <span className="text-stroke">pipelines</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#7E8994]">
          (Who is Rohit)
        </span>
      </div>

      <div className="relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-8">
        {/* left: statement */}
        <div className="lg:col-span-7">
          <ScrollWords text={ABOUT.statement} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 max-w-xl text-sm md:text-[15px] leading-relaxed text-[#939DA8]"
          >
            {ABOUT.secondary}
          </motion.p>

          {/* core stack chips */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {["Python", "SQL", "PySpark", "Databricks", "Kafka", "Azure", "Delta Lake", "Docker", "Spring Boot", "React"].map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </motion.div>

          {/* stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {ABOUT.stats.map((s) => (
              <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={inView} />
            ))}
          </div>
        </div>

        {/* right: portrait composition */}
        <motion.div style={{ y: portraitY, willChange: "transform" }} className="lg:col-span-4 lg:col-start-9 relative">
          {/* rotating coordinate ring behind */}
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            style={{ rotate: ringRotate, willChange: "transform" }}
            className="absolute -top-[13%] -right-[9%] w-[58%] opacity-35 z-0"
          >
            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(83, 108, 131,0.25)" strokeWidth="0.5" strokeDasharray="2 5" />
            <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(86, 96, 108,0.3)" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="100" y2="14" stroke="rgba(204,255,0,0.6)" strokeWidth="1" />
            <line x1="100" y1="186" x2="100" y2="200" stroke="rgba(204,255,0,0.6)" strokeWidth="1" />
          </motion.svg>

          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {/* offset back plate — depth layer */}
            <div aria-hidden="true" className="absolute inset-0 translate-x-3.5 translate-y-3.5 border border-[#536C83]/20 bg-[#46586A]/[0.04] rounded-2xl pointer-events-none" />

            <div
              ref={imgRef}
              onMouseMove={onImgMove}
              onMouseLeave={onImgLeave}
              className="card-shine scanlines tech-ticks relative rounded-2xl border border-white/10 overflow-hidden bg-[#10141A] transition-transform duration-200 will-change-transform"
              data-cursor="Hello"
            >
              <img
                src="/portfolio/Profile.webp"
                alt={`${IDENTITY.name} — portrait`}
                className="w-full aspect-[4/5] object-cover grayscale contrast-[1.06] brightness-[0.88] hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                loading="lazy"
              />
              {/* metadata rail on image */}
              <div className="absolute top-3 right-3 z-[2] text-right font-mono2 text-[8px] tracking-[0.2em] uppercase text-[#A9B2BC] leading-[2.1]">
                <div>ROI — DATA</div>
                <div>EXP — 1+ YRS</div>
                <div className="text-[#ccff00]">STATUS — OPEN</div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/85 to-transparent z-[2]">
                <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white">
                  ROHIT_SUTHAR — 2025
                </span>
                <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-[#536C83]">
                  Udaipur · IN
                </span>
              </div>
            </div>

            {/* floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -mt-16 md:-mt-20 ml-auto mr-4 w-fit flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#10141A]/90 backdrop-blur-xl border border-white/12"
              style={{ float: "right" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="font-mono2 text-[9px] tracking-[0.18em] uppercase text-white">
                Fresher · Fast learner
              </span>
            </motion.div>

            {/* location strip under the frame */}
            <div className="mt-[-14px] relative z-10 ml-0 md:ml-6 mr-0 md:mr-10 flex items-center justify-between px-4 py-3 rounded-md bg-[#10141A]/95 border border-white/[0.08]">
              <div>
                <div className="font-mono2 text-[8px] tracking-[0.22em] uppercase text-[#7E8994]">Based in</div>
                <div className="font-body text-[13px] text-white mt-0.5">Udaipur, Rajasthan</div>
              </div>
              <div className="text-right">
                <div className="font-mono2 text-[8px] tracking-[0.22em] uppercase text-[#7E8994]">Role</div>
                <div className="font-mono2 text-[10px] tracking-[0.1em] text-[#536C83] mt-0.5">DATA ENGINEER</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
