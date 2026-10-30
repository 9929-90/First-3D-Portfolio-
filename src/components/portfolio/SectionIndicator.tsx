"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "./hooks";

/* ═══════════════════════════════════════════════════════════════
   SEGMENTED MISSION RAIL — thin technical progress indicator.
   One IntersectionObserver, state changes only on section change.
   Desktop (≥1280px) only — mobile keeps native simplicity.
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: "home", index: "00", label: "Launch" },
  { id: "about", index: "01", label: "Origin" },
  { id: "journey", index: "02", label: "Journey" },
  { id: "skills", index: "03", label: "Stack" },
  { id: "work", index: "04", label: "Work" },
  { id: "insights", index: "05", label: "Signal" },
  { id: "contact", index: "06", label: "Contact" },
] as const;

export default function SectionIndicator() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const visible = new Map<Element, number>();
    const compute = () => {
      let best = -1;
      let bestRatio = 0;
      visible.forEach((idx, el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(mid - window.innerHeight / 2);
        const score = 1 / (1 + dist / 300);
        if (score > bestRatio) {
          bestRatio = score;
          best = idx;
        }
      });
      if (best >= 0) setActiveIdx(best);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = SECTIONS.findIndex((s) => s.id === e.target.id);
          if (e.isIntersecting) visible.set(e.target, idx);
          else visible.delete(e.target);
        });
        compute();
      },
      { rootMargin: "-20% 0px -20% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="seg-rail" aria-label="Section progress">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => scrollToSection(`#${s.id}`)}
          className={`seg-rail__item ${i === activeIdx ? "is-active" : i < activeIdx ? "is-done" : ""}`}
          aria-label={`Go to ${s.label}`}
          aria-current={i === activeIdx ? "true" : undefined}
        >
          <span className="seg-rail__bar" />
          <span className="seg-rail__label">
            {s.index} — {s.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
