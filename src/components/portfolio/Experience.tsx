"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { EXPERIENCE, EDUCATION } from "@/lib/data";

function ExperienceRow({
  exp,
  index,
  open,
  onToggle,
}: {
  exp: (typeof EXPERIENCE)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  /* progressive entry reveal tied to its own scroll position */
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 0.92", "start 0.55"],
  });
  const entryOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const entryX = useTransform(scrollYProgress, [0, 1], [22, 0]);

  return (
    <motion.div ref={rowRef} style={{ opacity: entryOpacity, x: entryX, willChange: "transform, opacity" }} className="relative">
      {/* timeline node */}
      <span aria-hidden="true" className="absolute -left-[29px] md:-left-[37px] top-9 hidden md:flex items-center justify-center w-[13px] h-[13px]">
        <span className={`w-[5px] h-[5px] rounded-full ${exp.current ? "bg-[#ccff00]" : "bg-[#536C83]"}`} />
        <span className="absolute inset-0 rounded-full border border-[#536C83]/35" />
      </span>

      <div className="border-t border-white/10 last:border-b">
        <button
          onClick={onToggle}
          data-cursor={open ? "Less" : "More"}
          aria-expanded={open}
          className="group w-full flex items-center justify-between gap-4 py-6 md:py-8 text-left"
        >
          <div className="flex items-baseline gap-4 md:gap-8 min-w-0">
            <span className="font-mono2 text-[10px] text-[#536C83] shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-display font-semibold text-xl md:text-3xl tracking-tight text-[#E6E9ED] group-hover:translate-x-1 transition-transform duration-400">
                  {exp.role}
                </h3>
                {exp.current && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 font-mono2 text-[8.5px] tracking-[0.18em] uppercase text-[#ccff00]">
                    <span className="w-1 h-1 rounded-full bg-[#ccff00] animate-pulse" />
                    Latest
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-mono2 text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-[#7E8994]">
                {exp.company} · {exp.place}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <span className="hidden sm:block font-mono2 text-[10px] tracking-[0.14em] uppercase text-[#A9B2BC]">
              {exp.period}
            </span>
            <span
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-400 ${
                open
                  ? "border-[#536C83] bg-[#536C83] text-black rotate-45"
                  : "border-white/20 text-white group-hover:border-[#536C83] group-hover:text-[#536C83]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="8 7 17 7 17 16" />
              </svg>
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-8 pl-8 md:pl-16 grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  {exp.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed text-[#B9C1CA]">
                      <span className="mt-[7px] w-1 h-1 rounded-full bg-[#536C83] shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="md:text-right">
                  <div className="font-mono2 text-[10px] tracking-[0.2em] uppercase text-[#7E8994]">Period</div>
                  <div className="mt-1 font-display text-lg text-[#E6E9ED]">{exp.period}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  /* scroll-drawn spine across the experience block */
  const spineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="relative px-5 md:px-10 py-24 md:py-36 bg-[#0B0D10] border-y border-white/[0.06] overflow-hidden">
      {/* quiet atmosphere */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_45%_at_50%_62%,rgba(70, 88, 106,0.05),transparent_64%)]" />

      <div className="relative z-10 flex items-end justify-between mb-12 md:mb-16">
        <div>
          <span className="section-label">02 — Journey</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Experience & <span className="text-stroke">Education</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#7E8994]">
          (2022 — Present)
        </span>
      </div>

      {/* experience — technical timeline */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="mb-4 font-mono2 text-[10px] tracking-[0.26em] uppercase text-[#7E8994]">
            / Work Experience
          </div>
          <div ref={spineRef} className="relative md:pl-10">
            {/* track + scroll-drawn spine (no glow) */}
            <div aria-hidden="true" className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.08] hidden md:block" />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: spineScale, willChange: "transform" }}
              className="absolute left-[5px] top-2 bottom-2 w-px hidden md:block origin-top bg-gradient-to-b from-[#536C83]/70 via-[#46586A]/45 to-[#56606C]/25"
            />
            {/* reading head */}
            <motion.div
              aria-hidden="true"
              style={{ y: headY, willChange: "transform" }}
              className="absolute left-[1.5px] top-2 w-[9px] h-[9px] -mt-[4px] rounded-full border border-[#ccff00] bg-[#08090B] hidden md:block"
            />

            {EXPERIENCE.map((exp, i) => (
              <ExperienceRow
                key={exp.role}
                exp={exp}
                index={i}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>

        {/* education */}
        <div className="lg:col-span-4">
          <div className="mb-4 font-mono2 text-[10px] tracking-[0.26em] uppercase text-[#7E8994]">
            / Education
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            {EDUCATION.map((e, i) => (
              <div
                key={e.school}
                className="group tech-ticks relative rounded-md border border-white/10 bg-[#10141A]/70 p-6 hover:border-[#536C83]/40 hover:-translate-y-1 transition-all duration-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono2 text-[10px] text-[#536C83]">{String(i + 1).padStart(2, "0")}</span>
                  {e.period && (
                    <span className="font-mono2 text-[9px] tracking-[0.16em] uppercase text-[#7E8994]">{e.period}</span>
                  )}
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg md:text-xl tracking-tight text-[#E6E9ED]">{e.school}</h3>
                <p className="mt-1 text-sm text-[#939DA8]">{e.degree}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: e.score }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 bg-[#536C83]"
                    />
                  </div>
                  <span className="font-mono2 text-[10px] text-[#536C83] tabular-nums">{e.score}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
