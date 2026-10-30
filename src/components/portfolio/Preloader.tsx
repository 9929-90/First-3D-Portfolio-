"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IDENTITY } from "@/lib/data";

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 300 : 1900;
    const start = performance.now();

    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 2);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setExiting(true);
        setTimeout(() => {
          setGone(true);
          onDone();
        }, 850);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {exiting && (
        <motion.div
          className="fixed inset-0 z-[10000] pointer-events-none"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="w-full h-full bg-[#050505] border-b border-[#5c9ead]/25" />
        </motion.div>
      )}
      <motion.div
        key="preloader-content"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* corner meta */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 font-mono2 text-[10px] tracking-[0.3em] text-[#8f8f8f] uppercase">
          Portfolio © 2025
        </div>
        <div className="absolute top-6 right-6 md:top-8 md:right-10 font-mono2 text-[10px] tracking-[0.3em] text-[#8f8f8f] uppercase">
          Udaipur — IN
        </div>
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10 font-mono2 text-[10px] tracking-[0.3em] text-[#8f8f8f] uppercase">
          Loading Assets
        </div>
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 font-mono2 text-[10px] tracking-[0.3em] uppercase text-[#5c9ead]">
          {IDENTITY.role}
        </div>

        {/* giant counter */}
        <div className="relative overflow-hidden">
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold leading-none text-[26vw] md:text-[16vw] tracking-tighter text-[#ededed] tabular-nums"
          >
            {String(count).padStart(3, "0")}
            <span className="text-[#5c9ead]">%</span>
          </motion.div>
        </div>

        {/* progress hairline */}
        <div className="absolute bottom-[16vh] left-1/2 -translate-x-1/2 w-[min(420px,70vw)] h-px bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#5c9ead] to-[#ccff00] transition-[width] duration-100 ease-linear"
            style={{ width: `${count}%` }}
          />
        </div>

        {/* name watermark */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 font-display font-bold text-[11vw] whitespace-nowrap tracking-tight text-white/[0.035] select-none pointer-events-none"
        >
          {IDENTITY.firstName} {IDENTITY.lastName}
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
