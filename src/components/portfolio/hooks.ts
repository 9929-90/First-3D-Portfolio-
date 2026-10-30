"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* shared motion preference — read once, reused by every animated module */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Lenis smooth scroll driven by the GSAP ticker ────────────
   One clock for the whole page: Lenis feeds ScrollTrigger.update,
   gsap.ticker drives Lenis. No competing rAF loops. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let lenis: import("lenis").default | null = null;
    let tick: ((time: number) => void) | null = null;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });

      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    });

    return () => {
      cancelled = true;
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      (window as unknown as { __lenis?: unknown }).__lenis = undefined;
    };
  }, []);
}

export function scrollToTop() {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: Record<string, unknown>) => void } }).__lenis;
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToSection(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: Record<string, unknown>) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/* ── Magnetic hover wrapper ────────────────────────────────── */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  function animate() {
    const el = ref.current;
    if (!el) return;
    pos.current.x += (0 - pos.current.x) * 0.12;
    pos.current.y += (0 - pos.current.y) * 0.12;
    el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    if (Math.abs(pos.current.x) > 0.05 || Math.abs(pos.current.y) > 0.05) {
      raf.current = requestAnimationFrame(animate);
    } else {
      el.style.transform = "";
    }
  }

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      pos.current.x = relX * strength;
      pos.current.y = relY * strength;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(animate);
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { ref, onMouseMove, onMouseLeave };
}

/* ── Live IST clock ────────────────────────────────────────── */
export function useLocalTimeIST() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          }).format(new Date())
        );
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── 3D tilt for cards ─────────────────────────────────────── */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(hover: none)").matches) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1100px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-4px)`;
    },
    [max]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1100px) rotateY(0deg) rotateX(0deg)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

/* ── Count-up number on inview ─────────────────────────────── */
export function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}
