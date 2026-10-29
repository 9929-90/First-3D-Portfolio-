"use client";

import { motion } from "framer-motion";
import { PROJECTS, type Project } from "@/lib/data";
import { useTilt } from "./hooks";

const STATUS_MAP = {
  live: { label: "Live", cls: "bg-[#ccff00]/12 border-[#ccff00]/35 text-[#ccff00]" },
  wip: { label: "In Progress", cls: "bg-orange-400/10 border-orange-400/30 text-orange-300" },
  "coming-soon": { label: "Coming Soon", cls: "bg-white/[0.06] border-white/20 text-white/70" },
} as const;

function ProjectCard({ p, large, index }: { p: Project; large: boolean; index: number }) {
  const { ref: tiltRef, onMouseMove: onTiltMove, onMouseLeave: onTiltLeave } = useTilt<HTMLDivElement>(4);
  const status = STATUS_MAP[p.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.08 }}
      className={large ? "lg:col-span-7" : "lg:col-span-5"}
    >
      <div
        ref={tiltRef}
        onMouseMove={onTiltMove}
        onMouseLeave={onTiltLeave}
        className="card-shine group relative h-full rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden hover:border-[#ccff00]/40 transition-colors duration-500 will-change-transform"
      >
        {/* image */}
        <div className={`relative overflow-hidden ${large ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
          { }
          <img
            src={p.image}
            alt={`${p.title} — ${p.subtitle}`}
            loading="lazy"
            className="w-full h-full object-cover scale-[1.03] group-hover:scale-[1.09] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

          {/* number watermark */}
          <span className="absolute top-4 left-5 font-display font-bold text-5xl md:text-6xl text-white/10 tracking-tighter select-none">
            {p.number}
          </span>

          {/* status */}
          <span className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono2 text-[8.5px] tracking-[0.2em] uppercase backdrop-blur-md ${status.cls}`}>
            {p.status === "live" && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
            {status.label}
          </span>

          {/* tag */}
          <span className="absolute bottom-4 left-5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 font-mono2 text-[8.5px] tracking-[0.2em] uppercase text-white/85">
            {p.tag}
          </span>
        </div>

        {/* body */}
        <div className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-2xl md:text-[28px] tracking-tight text-[#ededed] group-hover:text-[#ccff00] transition-colors duration-300">
                {p.title}
              </h3>
              <p className="mt-1 font-mono2 text-[10px] tracking-[0.18em] uppercase text-[#8f8f8f]">
                {p.subtitle}
              </p>
            </div>

            {/* links */}
            <div className="flex items-center gap-2 shrink-0">
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Live"
                  aria-label={`${p.title} — live demo`}
                  className="w-10 h-10 rounded-full bg-[#ccff00] text-black flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
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
                  aria-label={`${p.title} — GitHub repository`}
                  className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-[#ccff00] hover:text-[#ccff00] transition-colors duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <p className="mt-4 text-[13px] md:text-sm leading-relaxed text-[#9a9a9a]">
            {p.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {p.tech.map((t) => (
              <span key={`${p.id}-${t}`} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  return (
    <section id="work" className="relative px-5 md:px-10 py-24 md:py-36 bg-[#070707] border-y border-white/[0.06]">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <span className="section-label">04 — Selected Work</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Things I&apos;ve <span className="text-stroke">built</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#8f8f8f]">
          (8 Projects — 2024/25)
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-5 md:gap-6">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.id} p={p} large={i % 4 === 0 || i % 4 === 3} index={i} />
        ))}
      </div>
    </section>
  );
}
