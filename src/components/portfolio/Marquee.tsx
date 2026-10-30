"use client";

import { MARQUEE_SKILLS } from "@/lib/data";

/* Quiet technical ticker — mono micro-labels with slash separators,
   replacing the previous loud rotated display-type marquee. */
export default function Marquee() {
  const items = [...MARQUEE_SKILLS, ...MARQUEE_SKILLS];
  return (
    <div
      className="relative py-3 my-6 md:my-10 border-y border-white/[0.06] bg-[#07090d] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform">
        {items.map((s, i) => (
          <span key={i} className="flex items-center">
            <span className="font-mono2 text-[11px] md:text-xs tracking-[0.3em] uppercase px-7 text-[#a8b0bb]/55">
              {s}
            </span>
            <span className="text-[#5c9ead]/50 text-[9px]">{"//"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
