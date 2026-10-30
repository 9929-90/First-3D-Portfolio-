"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IDENTITY, SOCIALS } from "@/lib/data";
import { scrollToSection, prefersReducedMotion } from "./hooks";
import type { StageProgress } from "@/components/rocket/RocketStage";

const RocketStage = dynamic(() => import("@/components/rocket/RocketStage"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#08090B]" />,
});

gsap.registerPlugin(ScrollTrigger);

const PHASES = ["CLOSE PASS", "PULLBACK", "DESCENT", "FULL REVEAL"];

function phaseFor(p: number): number {
  if (p < 0.16) return 0;
  if (p < 0.46) return 1;
  if (p < 0.78) return 2;
  return 3;
}

/* ── technical annotation card (phase 2/3) ── */
function Anno({
  className,
  index,
  title,
  sub,
}: {
  className?: string;
  index: string;
  title: string;
  sub: string;
}) {
  return (
    <div className={`absolute pointer-events-none select-none ${className ?? ""}`}>
      <div className="tech-anno flex items-center gap-2">
        <span className="text-[#E6E9ED]/85">{index}</span>
        <span className="block w-10 tech-anno__line" />
        <span className="text-[#A9B2BC]">{title}</span>
      </div>
      <div className="tech-anno mt-1.5 pl-[52px] text-[8px] tracking-[0.2em] text-[#65717B]">{sub}</div>
    </div>
  );
}

export default function RocketHero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<StageProgress>({ target: 0, intro: 0 });

  const g1Ref = useRef<HTMLDivElement>(null);
  const g2Ref = useRef<HTMLDivElement>(null);
  const g3Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const dollyRef = useRef<HTMLSpanElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);

  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const r = prefersReducedMotion();
    setReduced(r);
    if (r) progressRef.current.intro = 1;
  }, []);

  /* pause rendering when the cinematic section is off-screen / tab hidden */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let inView = true;
    let visible = !document.hidden;
    const apply = () => setActive(inView && visible);
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        apply();
      },
      { threshold: 0 }
    );
    io.observe(el);
    const onVis = () => {
      visible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  /* scroll choreography — one master trigger + scrubbed DOM timelines */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progressRef.current.target = self.progress;
          const p = self.progress;
          if (dollyRef.current) {
            dollyRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
          }
          if (phaseLabelRef.current) {
            const ph = phaseFor(p);
            const next = `${String(ph + 1).padStart(2, "0")}/04 — ${PHASES[ph]}`;
            if (phaseLabelRef.current.textContent !== next) {
              phaseLabelRef.current.textContent = next;
            }
          }
        },
      });

      if (reduced) {
        if (g2Ref.current) gsap.set(g2Ref.current, { display: "none" });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      /* phase 1 → identity exits as the pullback begins */
      tl.to(hintRef.current, { opacity: 0, duration: 0.05 }, 0.045).to(
        g1Ref.current,
        { opacity: 0, y: -64, duration: 0.09, ease: "power1.in" },
        0.13
      );

      /* phases 2–3 → annotations drift through */
      tl.fromTo(
        g2Ref.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.08 },
        0.26
      ).to(g2Ref.current, { opacity: 0, y: -26, duration: 0.08 }, 0.6);

      /* phase 4 → the statement + CTAs arrive with the full reveal */
      tl.fromTo(
        g3Ref.current,
        { opacity: 0, y: 64 },
        { opacity: 1, y: 0, duration: 0.1, ease: "power1.out" },
        0.76
      );

      /* pad the timeline to exactly 1.0 so scrub maps 1:1 */
      tl.to({}, { duration: 0.14 }, 0.86);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  /* preloader lift → camera settles + identity rises */
  useEffect(() => {
    if (!ready) return;
    if (!reduced) {
      gsap.to(progressRef.current, { intro: 1, duration: 2.6, ease: "power2.inOut" });
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-rise]",
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.15, stagger: 0.09, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0 },
        { opacity: 1, duration: 1, stagger: 0.12, delay: 0.3 }
      );
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ready, reduced]);

  const metaRow = (
    <div
      data-hero-fade
      className="relative z-10 flex justify-between px-5 md:px-10 pt-20 md:pt-24 font-mono2 text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-[#7E8994]"
    >
      <span>Portfolio © 2025</span>
      <span className="hidden md:inline">{IDENTITY.role}</span>
      <span className="text-right">Udaipur — India</span>
    </div>
  );

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? "100svh" : "460vh" }}
      aria-label="Introduction"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#08090B]">
        <RocketStage progressRef={progressRef} active={active} reduced={reduced} />

        {/* ── persistent technical interface ── */}
        {metaRow}

        <div
          data-hero-fade
          className="absolute top-[104px] md:top-[126px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right"
        >
          CAM.PHASE — <span ref={phaseLabelRef} className="text-[#A9B2BC]">01/04 — CLOSE PASS</span>
        </div>

        <div
          data-hero-fade
          className="absolute top-[122px] md:top-[144px] right-5 md:right-10 z-10 font-mono2 text-[8px] md:text-[9px] tracking-[0.26em] uppercase text-[#65717B] pointer-events-none select-none text-right"
        >
          CAM.DOLLY — <span ref={dollyRef} className="text-[#A9B2BC] tabular-nums">000</span>%
        </div>

        {/* ── PHASE 1 · identity block (left, rocket right) ── */}
        <div
          ref={g1Ref}
          className="absolute inset-0 z-10 flex flex-col justify-center px-5 md:px-10 pointer-events-none"
        >
          <div className="max-w-[560px]">
            <div data-hero-rise className="flex items-center gap-3 mb-5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#ccff00] animate-ping-soft" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ccff00]" />
              </span>
              <span className="font-mono2 text-[10px] tracking-[0.26em] uppercase text-[#A9B2BC]">
                Open to opportunities
              </span>
            </div>

            <h1
              data-hero-rise
              className="font-display font-bold leading-[0.9] tracking-[-0.03em] select-none"
            >
              <span className="block text-[15vw] md:text-[7.4vw] text-[#E6E9ED]">
                {IDENTITY.firstName}
              </span>
              <span className="block text-[15vw] md:text-[7.4vw] text-stroke">
                {IDENTITY.lastName}
              </span>
            </h1>

            <div data-hero-rise className="mt-5 flex items-center gap-4">
              <span className="block w-12 h-px bg-[#536C83]" />
              <span className="font-mono2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#A9B2BC]">
                {IDENTITY.role}
              </span>
            </div>

            <p
              data-hero-rise
              className="mt-6 max-w-sm text-[13px] md:text-sm leading-relaxed text-[#939DA8]"
            >
              {IDENTITY.intro}
            </p>

            <div data-hero-rise className="mt-8 flex flex-wrap gap-3 pointer-events-auto">
              <button
                onClick={() => scrollToSection("#work")}
                data-cursor="Explore"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-sm hover:bg-[#536C83] hover:text-white transition-colors duration-300"
              >
                View my work
                <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </button>
              <a
                href={IDENTITY.cv}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="CV"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/20 text-[#E6E9ED] font-display font-medium text-sm hover:border-[#536C83] hover:text-white transition-colors duration-300"
              >
                Download CV
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── PHASES 2–3 · technical annotations around the vehicle ── */}
        <div ref={g2Ref} className="absolute inset-0 z-10 pointer-events-none opacity-0 max-md:hidden">
          <Anno
            className="top-[22%] right-[6%] text-right [&>div]:justify-end"
            index="FIG.01"
            title="PAYLOAD FAIRING"
            sub="OGIVE — DATA PRODUCTS OUT"
          />
          <Anno
            className="top-[46%] left-[5%]"
            index="FIG.02"
            title="INTERSTAGE"
            sub="STAGE HANDOFF — ETL BOUNDARY"
          />
          <Anno
            className="bottom-[27%] right-[10%] text-right [&>div]:justify-end"
            index="FIG.03"
            title="FIN ARRAY"
            sub="STABILITY — SCHEMA CONTRACTS"
          />
          <Anno
            className="bottom-[20%] left-[7%]"
            index="FIG.04"
            title="THRUST STRUCTURE"
            sub="4× NOZZLES — PARALLEL JOBS"
          />

          {/* telemetry panel */}
          <div className="meta-panel absolute bottom-[26%] left-5 md:left-10 px-3.5 py-3 font-mono2 text-[9px] leading-[2] tracking-[0.16em] uppercase tech-ticks">
            <div className="flex gap-3 justify-between min-w-[210px]">
              <span className="text-[#65717B]">pipeline.status</span>
              <span className="text-[#ccff00]">RUNNING</span>
            </div>
            <div className="flex gap-3 justify-between">
              <span className="text-[#65717B]">stages</span>
              <span className="text-[#A9B2BC]">02 — STACKED</span>
            </div>
            <div className="flex gap-3 justify-between">
              <span className="text-[#65717B]">sys.telemetry</span>
              <span className="text-[#A9B2BC]">NOMINAL</span>
            </div>
          </div>
        </div>

        {/* ── PHASE 4 · final composition ── */}
        <div
          ref={g3Ref}
          className="absolute inset-x-0 bottom-0 z-10 px-5 md:px-10 pb-24 md:pb-16 opacity-0 pointer-events-none"
        >
          <div className="flex items-center gap-4 mb-5" data-hero-fade>
            <span className="block w-12 h-px bg-[#536C83]" />
            <span className="font-mono2 text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[#7E8994]">
              Continue — the portfolio begins
            </span>
          </div>
          <h2 className="font-display font-bold leading-[0.98] tracking-[-0.02em] select-none">
            <span className="block text-[8.4vw] md:text-[4.4vw] text-[#E6E9ED]">BUILDING SYSTEMS.</span>
            <span className="block text-[8.4vw] md:text-[4.4vw] text-stroke">ENGINEERING DATA.</span>
            <span className="block text-[8.4vw] md:text-[4.4vw] text-[#E6E9ED]">
              CREATING <span className="text-gradient-tech">IMPACT.</span>
            </span>
          </h2>

          <div className="mt-7 flex flex-wrap items-center gap-2.5 pointer-events-auto">
            {SOCIALS.slice(0, 4).map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={s.short}
                aria-label={s.label}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center font-mono2 text-[9px] tracking-wider text-[#A9B2BC] hover:border-[#536C83] hover:text-white hover:-translate-y-1 transition-all duration-300"
              >
                {s.short}
              </a>
            ))}
            <span className="mx-1 hidden sm:block w-px h-6 bg-white/10" />
            <button
              onClick={() => scrollToSection("#about")}
              data-cursor="Next"
              className="font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#7E8994] hover:text-white transition-colors"
            >
              About — 01 ↓
            </button>
          </div>
        </div>

        {/* ── scroll hint (phase 1) — outer = scrub, inner = intro ── */}
        <div
          ref={hintRef}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <div data-hero-fade className="flex flex-col items-center gap-3">
            <span className="font-mono2 text-[8.5px] tracking-[0.34em] uppercase text-[#7E8994]">
              Scroll to engage
            </span>
            <span className="block w-px h-10 bg-white/15 overflow-hidden relative">
              <span className="absolute inset-x-0 top-0 h-full bg-[#536C83] animate-scroll-line" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
