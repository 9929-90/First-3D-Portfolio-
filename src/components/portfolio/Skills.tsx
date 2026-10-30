"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILL_CATEGORIES } from "@/lib/data";
import {
  PLANETS, PLANET_WINDOWS, CHAPTERS, TOTAL_SKILLS,
  type PlanetDef,
} from "@/components/galaxy/galaxyData";
import { TECH_ICONS, readableHex } from "@/components/galaxy/techIcons";
import { GridBackdrop } from "./layers";
import { scrollToSection, prefersReducedMotion } from "./hooks";
import type { GalaxyProgress } from "@/components/galaxy/GalaxyStage";

const GalaxyStage = dynamic(() => import("@/components/galaxy/GalaxyStage"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#08090B]" />,
});

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   03 — THE SKILL GALAXY

   A scroll-controlled planetary journey built with the same
   contract as the rocket hero: one tall section, one sticky
   viewport, one ScrollTrigger feeding a progress ref into a
   single WebGL stage, plus one scrubbed DOM timeline for text.
   After the journey, the original full tech-stack index (search
   + grid) is preserved unchanged in normal flow.
   ═══════════════════════════════════════════════════════════════ */

function chapterAt(p: number): string {
  if (p < CHAPTERS.enter[1]) return "01/05 — ENTER";
  if (p < CHAPTERS.reveal[1]) return "02/05 — REVEAL";
  if (p < CHAPTERS.planet1[1]) return "03/05 — APPROACH";
  if (p < CHAPTERS.transit[1]) return "04/05 — TRANSIT";
  return "05/05 — UNIVERSE";
}

function planetAt(p: number): number {
  for (let i = 0; i < PLANET_WINDOWS.length; i++) {
    const [a, b] = PLANET_WINDOWS[i];
    if (p >= a - 0.012 && p <= b + 0.012) return i;
  }
  return -1;
}

/* ── holographic info panel for one planet ── */
function PlanetPanel({ planet }: { planet: PlanetDef }) {
  return (
    <div className="meta-panel tech-ticks rounded-md p-5 md:p-6 max-md:w-auto md:w-full max-md:max-h-[46svh] max-md:overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono2 text-[8.5px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B]">
          Planet {planet.index} / 06 · CAT {planet.categoryIndex}
        </span>
        <span className="block h-px w-10 bg-gradient-to-r from-[#536C83]/70 to-transparent" />
      </div>

      <h3 className="mt-3 font-display font-bold tracking-tight text-[#E6E9ED] text-xl md:text-[1.9vw] md:leading-[1.05]">
        {planet.title}
      </h3>
      <p className="mt-2 text-[11.5px] md:text-[13px] leading-relaxed text-[#939DA8]">
        {planet.kicker}
      </p>

      {/* official SVG technology logos — large, crisp, brand-coloured */}
      <div className="mt-4 grid grid-cols-2 gap-2 md:gap-2.5">
        {planet.iconSet.map((ic) => {
          const def = TECH_ICONS[ic.slug];
          if (!def) return null;
          const col = readableHex(def.hex);
          return (
            <div
              key={ic.slug}
              title={ic.skill}
              className="flex items-center gap-2.5 md:gap-3 rounded border border-white/10 bg-white/[0.04] px-3 py-2.5 hover:border-[#536C83]/50 transition-colors"
            >
              <svg
                viewBox={`0 0 ${def.vw} ${def.vh}`}
                className="shrink-0 w-[26px] h-[26px] md:w-[34px] md:h-[34px]"
                fill={col}
                aria-hidden="true"
                style={{ filter: `drop-shadow(0 0 6px ${col}59)` }}
              >
                <path d={def.path} />
              </svg>
              <span className="font-mono2 text-[11px] md:text-[12px] tracking-wide text-[#C6CDD5] truncate">
                {ic.skill}
              </span>
            </div>
          );
        })}
      </div>

      {/* remaining skills of the mapped categories — exact portfolio data */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {planet.chips.map((c) => (
          <span key={`${planet.id}-${c}`} className="chip">{c}</span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 font-mono2 text-[8.5px] md:text-[9px] tracking-[0.2em] uppercase text-[#65717B]">
        {planet.note}
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<GalaxyProgress>({ target: 0 });

  const progRef = useRef<HTMLSpanElement>(null);
  const planetRef = useRef<HTMLSpanElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);

  const g1Ref = useRef<HTMLDivElement>(null); // C1 title
  const g2Ref = useRef<HTMLDivElement>(null); // C2 system status
  const g4Ref = useRef<HTMLDivElement>(null); // finale
  const hintRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(false);

  /* original section functionality — search state (full index below) */
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SKILL_CATEGORIES;
    return SKILL_CATEGORIES.map((c) => ({
      ...c,
      skills: c.skills.filter((s) => s.toLowerCase().includes(q)),
    })).filter((c) => c.skills.length > 0);
  }, [query]);
  const total = useMemo(
    () => SKILL_CATEGORIES.reduce((acc, c) => acc + c.skills.length, 0),
    []
  );

  useEffect(() => setReduced(prefersReducedMotion()), []);

  /* pause rendering when the galaxy is off-screen / tab hidden */
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
          if (chapterRef.current) {
            const next = chapterAt(p);
            if (chapterRef.current.textContent !== next) chapterRef.current.textContent = next;
          }
          if (planetRef.current) {
            const idx = planetAt(p);
            const next = idx >= 0 ? `${PLANETS[idx].index}/06 — ${PLANETS[idx].title.split(" ")[0].toUpperCase()}` : "—  CRUISE";
            if (planetRef.current.textContent !== next) planetRef.current.textContent = next;
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

      /* C1 → C2 — the opening title exits as the system reveals */
      tl.to(g1Ref.current, { opacity: 0, y: -56, duration: 0.05, ease: "power1.in" }, 0.112);

      /* the engagement hint retires once the journey is underway */
      tl.to(hintRef.current, { opacity: 0, duration: 0.04 }, 0.075);

      /* C2 — system status line drifts through */
      tl.fromTo(
        g2Ref.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.045 },
        0.205
      ).to(g2Ref.current, { opacity: 0, y: -18, duration: 0.04 }, 0.3);

      /* C3–C5 — one panel per planet, inside its focus window */
      PLANET_WINDOWS.forEach(([a, b], i) => {
        const el = panelRefs.current[i];
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.03, ease: "power1.out" },
          Math.max(0.001, a - 0.014)
        ).to(el, { opacity: 0, y: -18, duration: 0.024, ease: "power1.in" }, b - 0.036);
      });

      /* C5 finale — the complete stack statement */
      tl.fromTo(
        g4Ref.current,
        { opacity: 0, y: 46 },
        { opacity: 1, y: 0, duration: 0.055, ease: "power1.out" },
        0.878
      );

      /* pad to exactly 1.0 so scrub maps 1:1 */
      tl.to({}, { duration: 0.067 }, 0.933);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(id);
  }, [reduced]);

  return (
    <section id="skills" ref={sectionRef} aria-label="Skills — the skill galaxy" className="relative">
      {/* ══════════ THE CINEMATIC JOURNEY (pinned) ══════════ */}
      <div
        ref={wrapRef}
        className={`relative ${reduced ? "" : "h-[470vh] md:h-[640vh]"}`}
      >
        <div className={`${reduced ? "relative" : "sticky top-0"} h-[100svh] overflow-hidden bg-[#08090B]`}>
          <GalaxyStage progressRef={progressRef} active={active} reduced={reduced} />

          {/* persistent HUD — same language as the rocket's CAM.DOLLY */}
          <div className="absolute top-[104px] md:top-[126px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            GAL.PROG — <span ref={progRef} className="text-[#A9B2BC] tabular-nums">000</span>%
          </div>
          <div className="absolute top-[122px] md:top-[144px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            PLANET — <span ref={planetRef} className="text-[#A9B2BC]">—  CRUISE</span>
          </div>
          <div className="absolute top-[140px] md:top-[162px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right">
            CH.<span ref={chapterRef} className="text-[#A9B2BC]">01/05 — ENTER</span>
          </div>

          {/* C1 — enter the universe */}
          <div
            ref={g1Ref}
            className="absolute inset-0 z-10 flex flex-col justify-center px-5 md:px-10 pointer-events-none"
          >
            <div className="max-w-[620px]">
              <span className="section-label">The Skill Galaxy</span>
              <h2 className="mt-4 font-display font-bold leading-[0.94] tracking-[-0.03em] select-none">
                <span className="block text-[11.5vw] md:text-[5.6vw] text-[#E6E9ED]">MY SKILL</span>
                <span className="block text-[11.5vw] md:text-[5.6vw] text-stroke">UNIVERSE.</span>
              </h2>
              <div className="mt-5 flex items-center gap-4">
                <span className="block w-12 h-px bg-[#536C83]" />
                <span className="font-mono2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#A9B2BC]">
                  {PLANETS.length} planets · {SKILL_CATEGORIES.length} categories · {TOTAL_SKILLS} skills
                </span>
              </div>
              <p className="mt-5 max-w-sm text-[13px] md:text-sm leading-relaxed text-[#939DA8]">
                Scroll to fall into orbit — every world is a category from my stack,
                rendered live in 3D.
              </p>
            </div>
          </div>

          {/* C2 — system status */}
          <div
            ref={g2Ref}
            className="absolute inset-x-0 bottom-[10%] z-10 flex justify-center px-5 pointer-events-none opacity-0"
          >
            <div className="meta-panel px-4 py-2.5 font-mono2 text-[8.5px] md:text-[9.5px] tracking-[0.22em] uppercase text-[#A9B2BC] tech-ticks">
              system online — 06 planets · orbital paths visible · {TOTAL_SKILLS} skills in orbit
            </div>
          </div>

          {/* C3–C5 — planet panels (right on desktop, lower third on mobile) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {PLANETS.map((planet, i) => (
              <div
                key={planet.id}
                className="absolute max-md:inset-x-4 max-md:bottom-5 md:right-10 md:top-1/2 md:-translate-y-1/2 md:w-[min(430px,38vw)]"
              >
                <div
                  ref={(el) => { panelRefs.current[i] = el; }}
                  className="opacity-0 pointer-events-none"
                >
                  <PlanetPanel planet={planet} />
                </div>
              </div>
            ))}
          </div>

          {/* C5 — the complete stack */}
          <div
            ref={g4Ref}
            className="absolute inset-x-0 bottom-0 z-10 px-5 md:px-10 pb-20 md:pb-14 opacity-0 pointer-events-none"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="block w-12 h-px bg-[#536C83]" />
              <span className="font-mono2 text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[#7E8994]">
                Journey complete — every category in one frame
              </span>
            </div>
            <h3 className="font-display font-bold leading-[0.98] tracking-[-0.02em] select-none">
              <span className="block text-[7.6vw] md:text-[3.9vw] text-[#E6E9ED]">THE COMPLETE</span>
              <span className="block text-[7.6vw] md:text-[3.9vw] text-stroke">TECH STACK.</span>
            </h3>
            <div className="mt-5 flex flex-wrap items-center gap-4 pointer-events-auto">
              <button
                onClick={() => scrollToSection("#skills-index")}
                data-cursor="Index"
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-[13px] hover:bg-[#536C83] hover:text-white transition-colors duration-300"
              >
                Open full index
                <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </button>
              <span className="font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#7E8994]">
                {SKILL_CATEGORIES.length} categories — {TOTAL_SKILLS} skills
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
                Scroll to travel
              </span>
              <span className="block w-px h-10 bg-white/15 overflow-hidden relative">
                <span className="absolute inset-x-0 top-0 h-full bg-[#536C83] animate-scroll-line" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FULL INDEX — the original stack, preserved ══════════ */}
      <div id="skills-index" className="relative px-5 md:px-10 pt-20 md:pt-28 pb-24 md:pb-36">
        <GridBackdrop size={130} opacity={0.03} />
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_42%_at_18%_28%,rgba(83, 108, 131,0.05),transparent_62%)]" />

        <div className="relative z-10 flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="section-label">03 — Arsenal · Full index</span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
            >
              Tech <span className="text-stroke">stack</span>
            </motion.h2>
          </div>

          {/* search — original functionality, untouched */}
          <div className="hidden md:flex items-center gap-3 relative">
            <svg className="absolute left-4 text-[#7E8994]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills… e.g. Spark, Kafka"
              aria-label="Search skills"
              className="w-64 bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-4 py-2.5 font-mono2 text-[11px] tracking-wide text-[#E6E9ED] placeholder:text-[#59636E] outline-none focus:border-[#536C83]/60 focus:bg-white/[0.05] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#536C83] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 mb-8 font-mono2 text-[10px] tracking-[0.22em] uppercase text-[#7E8994]">
          {filtered.reduce((a, c) => a + c.skills.length, 0)} / {total} skills
          {query && <span className="text-[#536C83]"> — matching &quot;{query}&quot;</span>}
        </div>

        <motion.div layout className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((cat, i) => (
            <motion.article
              layout
              key={cat.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group tech-ticks relative rounded-md border border-white/10 bg-[#10141A]/80 p-5 md:p-6 hover:border-[#536C83]/45 hover:bg-[#0d1117] transition-colors duration-400 overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-lg tracking-tight text-[#E6E9ED]">
                  {cat.label}
                </h3>
                <span className="font-mono2 text-[10px] text-[#536C83] group-hover:text-[#536C83] transition-colors">
                  {cat.index}
                </span>
              </div>

              <div className="mt-3 mb-4 h-px bg-white/[0.08] relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + (i % 4) * 0.08 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#536C83]/70 to-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span key={`${cat.id}-${s}`} className="chip">{s}</span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="relative z-10 py-20 text-center font-mono2 text-[11px] tracking-[0.25em] uppercase text-[#7E8994]">
            No skills match &quot;{query}&quot; — try &quot;Spark&quot;, &quot;SQL&quot; or &quot;React&quot;
          </div>
        )}
      </div>
    </section>
  );
}
