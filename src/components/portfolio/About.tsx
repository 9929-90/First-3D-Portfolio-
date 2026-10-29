"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ABOUT, IDENTITY } from "@/lib/data";
import { useCountUp, useTilt } from "./hooks";

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
  const opacity = useTransform(progress, range, [0.16, 1]);
  const isAccent = children === "Data" || children === "Engineer";
  return (
    <motion.span
      style={{ opacity }}
      className={isAccent ? "text-[#ccff00]" : undefined}
    >
      {children}{" "}
    </motion.span>
  );
}

function Stat({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const n = useCountUp(value, active);
  return (
    <div className="border-t border-white/10 pt-4">
      <div className="font-display font-bold text-4xl md:text-5xl tracking-tight tabular-nums">
        {n}
        <span className="text-[#ccff00]">{suffix}</span>
      </div>
      <div className="mt-1 font-mono2 text-[9.5px] tracking-[0.22em] uppercase text-[#8f8f8f]">{label}</div>
    </div>
  );
}

export default function About() {
  const { ref: imgRef, onMouseMove: onImgMove, onMouseLeave: onImgLeave } = useTilt<HTMLDivElement>(7);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });

  return (
    <section id="about" ref={sectionRef} className="relative px-5 md:px-10 py-24 md:py-36">
      {/* section header */}
      <div className="flex items-end justify-between mb-12 md:mb-20">
        <div>
          <span className="section-label">01 — About</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Behind the <span className="text-stroke-accent">pipelines</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#8f8f8f]">
          (Who is Rohit)
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
        {/* left: statement */}
        <div className="lg:col-span-7">
          <ScrollWords text={ABOUT.statement} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 max-w-xl text-sm md:text-[15px] leading-relaxed text-[#9a9a9a]"
          >
            {ABOUT.secondary}
          </motion.p>

          {/* marquee-ish tool list */}
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

        {/* right: portrait */}
        <div className="lg:col-span-4 lg:col-start-9">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              ref={imgRef}
              onMouseMove={onImgMove}
              onMouseLeave={onImgLeave}
              className="card-shine relative rounded-2xl border border-white/10 overflow-hidden bg-[#0b0b0b] transition-transform duration-200 will-change-transform"
              data-cursor="Hello"
            >
              {/* corner brackets */}
              <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#ccff00]/70 z-10" />
              <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#ccff00]/70 z-10" />
              <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#ccff00]/70 z-10" />
              <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#ccff00]/70 z-10" />

              { }
              <img
                src="/portfolio/Profile.png"
                alt={`${IDENTITY.name} — portrait`}
                className="w-full aspect-[4/5] object-cover grayscale-[0.35] contrast-[1.05] hover:grayscale-0 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/85 to-transparent">
                <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/85">
                  ROHIT_SUTHAR — 2025
                </span>
                <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-[#ccff00]">
                  Udaipur · IN
                </span>
              </div>
            </div>

            {/* floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -mt-16 md:-mt-20 ml-auto mr-4 w-fit flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/12"
              style={{ float: "right" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="font-mono2 text-[9px] tracking-[0.18em] uppercase text-white/85">
                Fresher · Fast learner
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
