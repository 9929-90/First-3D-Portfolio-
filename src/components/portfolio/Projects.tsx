"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, type Project } from "@/lib/data";
import {
  STATIONS, STATION_WINDOWS, TOTAL_STATIONS, GITHUB_PROFILE,
  type StationDef,
} from "@/components/lab/labData";
import { stationAt, sceneAt } from "@/components/lab/labPath";
import type { LabProgress } from "@/components/lab/LabStage";
import { GridBackdrop } from "./layers";
import { scrollToSection, prefersReducedMotion } from "./hooks";

const LabStage = dynamic(() => import("@/components/lab/LabStage"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0B0D10]" />,
});

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   04 — PROJECT HOLOGRAM · THE DIGITAL LABORATORY

   The third cinematic scroll experience, built on the same contract
   as the rocket hero and the skill galaxy: one tall section, one
   sticky viewport, one ScrollTrigger feeding a progress ref into a
   single WebGL stage, plus one scrubbed DOM timeline for the
   holographic project panels. Every project, link, technology and
   screenshot below comes verbatim from src/lib/data.ts.

   After the journey, the full project ledger stays in normal flow —
   every station remains directly accessible at all times.
   ═══════════════════════════════════════════════════════════════ */

const STATUS_MAP = {
  live: { label: "Live", cls: "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]" },
  wip: { label: "In Progress", cls: "bg-orange-400/10 border-orange-400/30 text-orange-300" },
  "coming-soon": { label: "Coming Soon", cls: "bg-[#46586A]/20 border-[#46586A]/50 text-[#9FB4C7]" },
} as const;

/* ── holographic info panel for one workstation ── */
function StationPanel({ station }: { station: StationDef }) {
  const p: Project = station.p;
  const status = STATUS_MAP[p.status];
  return (
    <div className="meta-panel tech-ticks rounded-md p-5 md:p-6 max-md:w-auto md:w-full max-md:max-h-[46svh] max-md:overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono2 text-[8.5px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B]">
          Station {p.number} / {String(TOTAL_STATIONS).padStart(2, "0")} · {p.tag}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono2 text-[8px] tracking-[0.18em] uppercase ${status.cls}`}>
          {p.status === "live" && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
          {status.label}
        </span>
      </div>

      <h3 className="mt-3 font-display font-bold tracking-tight text-[#E6E9ED] text-xl md:text-[1.75vw] md:leading-[1.08]">
        {p.title}
      </h3>
      <p className="mt-1 font-mono2 text-[9.5px] md:text-[10px] tracking-[0.2em] uppercase text-[#536C83]">
        {p.subtitle}
      </p>
      <p className="mt-2.5 text-[11.5px] md:text-[12.5px] leading-relaxed text-[#939DA8]">
        {p.summary}
      </p>

      {/* real technology stack */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.tech.map((t) => (
          <span key={`${p.id}-${t}`} className="chip">{t}</span>
        ))}
      </div>

      {/* real actions — live demo / repository / private build */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Live"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-[12px] hover:bg-[#536C83] hover:text-white transition-colors duration-300"
          >
            View project
            <svg className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
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
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-display font-medium text-[12px] transition-colors duration-300 ${
              p.url
                ? "border-white/20 text-[#E6E9ED] hover:border-[#536C83] hover:text-white"
                : "bg-[#E6E9ED] text-black border-transparent hover:bg-[#536C83] hover:text-white"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Source
          </a>
        )}
        {!p.url && !p.repo && (
          <span className="inline-flex items-center px-4 py-2.5 rounded-full border border-white/12 font-mono2 text-[9px] tracking-[0.2em] uppercase text-[#65717B]">
            Private build — details on request
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 font-mono2 text-[8.5px] md:text-[9px] tracking-[0.2em] uppercase text-[#65717B]">
        hologram {String(p.id).padStart(2, "0")} · {p.tech.length} technologies · lab feed active
      </div>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<LabProgress>({ target: 0 });

  const progRef = useRef<HTMLSpanElement>(null);
  const stationRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HTMLSpanElement>(null);

  const g1Ref = useRef<HTMLDivElement>(null); // SCN.01 title
  const g4Ref = useRef<HTMLDivElement>(null); // SCN.04 finale
  const hintRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(false);

  /* pause rendering when the lab is off-screen / tab hidden */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let inView = false;
    let visible = !document.hidden;
    const apply = () => setActive(inView && visible && !reduced);
    const io = new IntersectionObserver(
      ([e]) => { inView = e.isIntersecting; apply(); },
      { threshold: 0 }
    );
    io.observe(el);
    const onVis = () => { visible = !document.hidden; apply(); };
    document.addEventListener("visibilitychange", onVis);
    apply();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  /* scroll choreography — one master trigger + one scrubbed DOM timeline */
  useEffect(() => {
    const wrap = wrapRef.current;
    const section = sectionRef.current;
    if (!wrap || !section || reduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progressRef.current.target = self.progress;
          const p = self.progress;
          if (progRef.current) {
            progRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
          }
          if (sceneRef.current) {
            const next = sceneAt(p);
            if (sceneRef.current.textContent !== next) sceneRef.current.textContent = next;
          }
          if (stationRef.current) {
            const idx = stationAt(p);
            const next = idx >= 0
              ? `${STATIONS[idx].p.number}/${String(TOTAL_STATIONS).padStart(2, "0")} — ${STATIONS[idx].p.title.split(" ")[0].toUpperCase()}`
              : "— STANDBY";
            if (stationRef.current.textContent !== next) stationRef.current.textContent = next;
          }
        },
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      /* SCN.01 — the title retires as the first workstation approaches */
      tl.to(g1Ref.current, { opacity: 0, y: -56, duration: 0.045, ease: "power1.in" }, 0.092);

      /* the engagement hint retires once the journey is underway */
      tl.to(hintRef.current, { opacity: 0, duration: 0.035 }, 0.055);

      /* SCN.02–03 — one holographic panel per station, inside its window */
      STATION_WINDOWS.forEach(([a, b], i) => {
        const el = panelRefs.current[i];
        if (!el) return;
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.028, ease: "power1.out" },
          Math.max(0.001, a - 0.012)
        ).to(el, { autoAlpha: 0, y: -18, duration: 0.022, ease: "power1.in" }, b - 0.032);
      });

      /* SCN.04 — the closing statement */
      tl.fromTo(
        g4Ref.current,
        { autoAlpha: 0, y: 46 },
        { autoAlpha: 1, y: 0, duration: 0.055, ease: "power1.out" },
        0.885
      );

      /* pad to exactly 1.0 so scrub maps 1:1 */
      tl.to({}, { duration: 0.06 }, 0.94);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(id);
  }, [reduced]);

  return (
    <section id="work" ref={sectionRef} aria-label="Projects — the digital laboratory" className="relative bg-[#0B0D10] border-y border-white/[0.06]">
      {/* ══════════ THE DIGITAL LABORATORY (pinned) ══════════ */}
      <div
        ref={wrapRef}
        className={`relative ${reduced ? "" : "h-[520vh] md:h-[720vh]"}`}
      >
        <div className={`${reduced ? "relative" : "sticky top-0"} h-[100svh] overflow-hidden bg-[#0B0D10]`}>
          <LabStage progressRef={progressRef} active={active} reduced={reduced} />

          {/* persistent HUD — same language as GAL.PROG / CAM.DOLLY */}
          <div className="absolute top-[104px] md:top-[126px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            LAB.PROG — <span ref={progRef} className="text-[#A9B2BC] tabular-nums">000</span>%
          </div>
          <div className="absolute top-[122px] md:top-[144px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            STATION — <span ref={stationRef} className="text-[#A9B2BC]">— STANDBY</span>
          </div>
          <div className="absolute top-[140px] md:top-[162px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            <span ref={sceneRef}>SCN.01/04 — ENTER</span>
          </div>

          {/* SCN.01 — entering the laboratory */}
          <div
            ref={g1Ref}
            className="absolute inset-0 z-10 flex flex-col justify-center px-5 md:px-10 pointer-events-none"
          >
            <div className="max-w-[640px]">
              <span className="section-label">04 — Selected Work · The Digital Laboratory</span>
              <h2 className="mt-4 font-display font-bold leading-[0.94] tracking-[-0.03em] select-none">
                <span className="block text-[11.5vw] md:text-[5.6vw] text-[#E6E9ED]">PROJECT</span>
                <span className="block text-[11.5vw] md:text-[5.6vw] text-stroke">HOLOGRAM.</span>
              </h2>
              <div className="mt-5 flex items-center gap-4">
                <span className="block w-12 h-px bg-[#536C83]" />
                <span className="font-mono2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#A9B2BC]">
                  A collection of things I&apos;ve engineered.
                </span>
              </div>
              <p className="mt-5 max-w-sm text-[13px] md:text-sm leading-relaxed text-[#939DA8]">
                Walk the lab — every workstation is a real build,
                rendered live in 3D with its actual stack and links.
              </p>
            </div>
          </div>

          {/* SCN.02–03 — station panels (right on desktop, lower third on mobile) */}
          <div className="absolute inset-0 z-10">
            {STATIONS.map((station, i) => (
              <div
                key={station.p.id}
                className="absolute max-md:inset-x-4 max-md:bottom-5 md:right-10 md:top-1/2 md:-translate-y-1/2 md:w-[min(440px,38vw)]"
              >
                <div
                  ref={(el) => { panelRefs.current[i] = el; }}
                  className="invisible max-md:pointer-events-none"
                >
                  <StationPanel station={station} />
                </div>
              </div>
            ))}
          </div>

          {/* SCN.04 — the laboratory overview */}
          <div
            ref={g4Ref}
            className="absolute inset-x-0 bottom-0 z-10 px-5 md:px-10 pb-20 md:pb-14 invisible"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="block w-12 h-px bg-[#536C83]" />
              <span className="font-mono2 text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[#7E8994]">
                End of the corridor — every station in one frame
              </span>
            </div>
            <h3 className="font-display font-bold leading-[0.98] tracking-[-0.02em] select-none">
              <span className="block text-[7.6vw] md:text-[3.9vw] text-[#E6E9ED]">MORE IDEAS.</span>
              <span className="block text-[7.6vw] md:text-[3.9vw] text-stroke">MORE THINGS TO BUILD.</span>
            </h3>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollToSection("#work-ledger")}
                data-cursor="Ledger"
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-[13px] hover:bg-[#536C83] hover:text-white transition-colors duration-300"
              >
                Open project ledger
                <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </button>
              <a
                href={GITHUB_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="GitHub"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/20 text-[#E6E9ED] font-display font-medium text-[13px] hover:border-[#536C83] hover:text-white transition-colors duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                All projects on GitHub
              </a>
              <span className="font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#7E8994]">
                {TOTAL_STATIONS} stations — every link live
              </span>
            </div>
          </div>

          {/* scroll hint — mirrors the rocket's engagement hint */}
          <div
            ref={hintRef}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:block"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono2 text-[8.5px] tracking-[0.34em] uppercase text-[#7E8994]">
                Scroll to enter the lab
              </span>
              <span className="block w-px h-10 bg-white/15 overflow-hidden relative">
                <span className="absolute inset-x-0 top-0 h-full bg-[#536C83] animate-scroll-line" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FULL LEDGER — every project directly accessible ══════════ */}
      <div id="work-ledger" className="relative px-5 md:px-10 pt-20 md:pt-28 pb-24 md:pb-36">
        <GridBackdrop size={120} opacity={0.03} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_45%_at_78%_18%,rgba(70,88,106,0.08),transparent_64%)]" />

        <div className="relative z-10 flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="section-label">04 — Selected Work · Full ledger</span>
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
          {PROJECTS.map((p) => {
            const status = STATUS_MAP[p.status];
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative grid grid-cols-[auto_1fr] md:grid-cols-[64px_1fr_auto] gap-x-5 md:gap-x-8 gap-y-3 items-center py-6 md:py-7 border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-300 px-2 -mx-2 rounded"
              >
                <span className="font-mono2 text-[11px] text-[#536C83] pt-0.5">{p.number}</span>

                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg md:text-xl tracking-tight text-[#E6E9ED] leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[12px] md:text-[13px] text-[#939DA8] leading-relaxed max-w-2xl">
                    {p.summary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono2 text-[8px] tracking-[0.18em] uppercase ${status.cls}`}>
                      {p.status === "live" && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
                      {status.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full border border-white/10 font-mono2 text-[8px] tracking-[0.18em] uppercase text-[#9FB4C7]">
                      {p.tag}
                    </span>
                    {p.tech.slice(0, 5).map((t) => (
                      <span key={`${p.id}-${t}`} className="chip">{t}</span>
                    ))}
                    {p.tech.length > 5 && (
                      <span className="font-mono2 text-[8.5px] tracking-[0.14em] text-[#65717B]">
                        +{p.tech.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex flex-wrap items-center gap-2.5">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="Live"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-[12px] hover:bg-[#536C83] hover:text-white transition-colors duration-300"
                    >
                      Visit live
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
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
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-[#E6E9ED] font-display font-medium text-[12px] hover:border-[#536C83] hover:text-white transition-colors duration-300"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      Source
                    </a>
                  )}
                  {!p.url && !p.repo && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/12 font-mono2 text-[9px] tracking-[0.2em] uppercase text-[#65717B]">
                      Private build
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
