"use client";

import { MARQUEE_SKILLS } from "@/lib/data";

export default function Marquee() {
  const items = [...MARQUEE_SKILLS, ...MARQUEE_SKILLS];
  return (
    <div className="relative py-2 md:py-4 -rotate-1 my-6 md:my-10 border-y border-white/[0.08] bg-[#070707] overflow-hidden select-none" aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform">
        {items.map((s, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display font-semibold text-2xl md:text-4xl tracking-tight px-6 md:px-8 text-[#ededed]/90">
              {s}
            </span>
            <span className="text-[#ccff00] text-xl md:text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
