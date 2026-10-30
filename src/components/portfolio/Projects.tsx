"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PROJECTS, type Project } from "@/lib/data";
import { GridBackdrop } from "./layers";

const STATUS_MAP = {
  live: { label: "Live", cls: "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]" },
  wip: { label: "In Progress", cls: "bg-orange-400/10 border-orange-400/30 text-orange-300" },
  "coming-soon": { label: "Coming Soon", cls: "bg-[#46586A]/20 border-[#46586A]/50 text-[#9FB4C7]" },
} as const;

/* graceful fallback when a screenshot is missing */
function ImageFallback({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#10141A_0%,#161C24_100%)]">
      <div className="grid grid-cols-6 gap-2.5 opacity-[0.14]">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#A9B2BC]" />
        ))}
      </div>
      <span className="font-mono2 text-[10px] tracking-[0.22em] uppercase text-[#A9B2BC]/30">{title}</span>
    </div>
  );
}

/* ── cinematic editorial case study row ── */
function CaseRow({ p, index }: { p: Project; index: number }) {
  const status = STATUS_MAP[p.status];
  const [imgError, setImgError] = useState(false);
  const flipped = index % 2 === 1;

  /* scroll-linked image depth — the frame eases while the plate drifts */
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const frameScale = useTransform(scrollYProgress, [0.05, 0.45], [1.06, 1]);
  const textY = useTransform(scrollYProgress, [0, 1], [26, -26]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid lg:grid-cols-12 gap-8 lg:gap-10 items-center py-14 md:py-20 border-t border-white/[0.06] first:border-t-0"
    >
      {/* ghost stage number */}
      <span
        aria-hidden="true"
        className={`absolute top-6 font-display font-bold text-[26vw] md:text-[15vw] leading-none tracking-tighter text-white/[0.035] select-none pointer-events-none ${
          flipped ? "left-0" : "right-0"
        }`}
      >
        {p.number}
      </span>

      {/* ── image plate ── */}
      <motion.div
        ref={rowRef}
        style={{ scale: frameScale, willChange: "transform" }}
        className={`relative lg:col-span-7 ${flipped ? "lg:order-2" : "lg:order-1"}`}
      >
        {/* offset depth plate */}
        <div
          aria-hidden="true"
          className={`absolute -inset-0 translate-x-3 translate-y-3 border border-[#536C83]/[0.16] bg-[#46586A]/[0.04] rounded-xl pointer-events-none ${
            flipped ? "-translate-x-3" : ""
          }`}
        />
        <div
          className="card-shine group relative rounded-xl border border-white/10 bg-[#10141A] overflow-hidden scanlines"
          data-cursor={p.url ? "Visit" : p.repo ? "Code" : "Soon"}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.div style={{ y: plateY, willChange: "transform" }} className="absolute inset-x-0 -top-[8%] h-[116%]">
              {!imgError ? (
                <img
                  src={p.image}
                  alt={`${p.title} — ${p.subtitle}`}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top brightness-[0.92] contrast-[1.04] group-hover:scale-[1.035] group-hover:brightness-100 transition-[filter,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                />
              ) : (
                <ImageFallback title={p.title} />
              )}
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/85 via-transparent to-transparent pointer-events-none" />

            {/* status + tag rail */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono2 text-[8.5px] tracking-[0.2em] uppercase backdrop-blur-md ${status.cls}`}>
                {p.status === "live" && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
                {status.label}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/12 font-mono2 text-[8.5px] tracking-[0.2em] uppercase text-white/80">
                {p.tag}
              </span>
            </div>

            {/* corner ticks */}
            <span aria-hidden="true" className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-[#536C83]/70" />
            <span aria-hidden="true" className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#536C83]/40" />
          </div>
        </div>
      </motion.div>

      {/* ── text column ── */}
      <motion.div
        style={{ y: textY, willChange: "transform" }}
        className={`relative z-10 lg:col-span-5 ${flipped ? "lg:order-1 lg:pr-4" : "lg:order-2 lg:pl-4"}`}
      >
        <div className="flex items-center gap-3 font-mono2 text-[10px] tracking-[0.24em] uppercase text-[#65717B]">
          <span className="text-[#536C83]">{p.number}</span>
          <span className="block w-8 h-px bg-[#536C83]/50" />
          <span>{p.subtitle}</span>
        </div>

        <h3 className="mt-4 font-display font-bold text-3xl md:text-[40px] leading-[1.05] tracking-tight text-[#E6E9ED]">
          {p.title}
        </h3>

        <p className="mt-5 text-[13px] md:text-[15px] leading-relaxed text-[#939DA8] max-w-md">
          {p.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <span key={`${p.id}-${t}`} className="chip">{t}</span>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Live"
              className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-[13px] hover:bg-[#536C83] hover:text-white transition-colors duration-300"
            >
              Visit live
              <svg className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="8 7 17 7 17 16" />
              </svg>
            </a>
          )}
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Code"
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full border font-display font-medium text-[13px] transition-colors duration-300 ${
                p.url
                  ? "border-white/20 text-[#E6E9ED] hover:border-[#536C83] hover:text-white"
                  : "bg-[#E6E9ED] text-black border-transparent hover:bg-[#536C83] hover:text-white"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Source
            </a>
          )}
          {!p.url && !p.repo && (
            <span className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/12 font-mono2 text-[10px] tracking-[0.2em] uppercase text-[#65717B]">
              Private build — details on request
            </span>
          )}
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function Projects() {
  return (
    <section id="work" className="relative px-5 md:px-10 py-24 md:py-36 bg-[#0B0D10] border-y border-white/[0.06] overflow-hidden">
      <GridBackdrop size={120} opacity={0.03} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_45%_at_78%_18%,rgba(70,88,106,0.08),transparent_64%)]" />

      <div className="relative z-10 flex items-end justify-between mb-10 md:mb-14">
        <div>
          <span className="section-label">04 — Selected Work</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Mission <span className="text-stroke">log</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#7E8994]">
          (8 Projects — 2024/25)
        </span>
      </div>

      <div className="relative z-10">
        {PROJECTS.map((p, i) => (
          <CaseRow key={p.id} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
