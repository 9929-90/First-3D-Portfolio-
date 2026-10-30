"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const enableRaf = requestAnimationFrame(() => setEnabled(true));
    document.documentElement.classList.add("cursor-none-desktop");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as HTMLElement;
      const magnetic = t.closest("[data-cursor]");
      if (magnetic) {
        setHovering(true);
        setLabel(magnetic.getAttribute("data-cursor") || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(enableRaf);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cursor-none-desktop");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 z-[9999] pointer-events-none rounded-full bg-[#ccff00] transition-[width,height,opacity] duration-200 ${
          hovering ? "w-1.5 h-1.5 opacity-100" : "w-2 h-2 opacity-100"
        }`}
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border flex items-center justify-center transition-[width,height,background-color,border-color] duration-300 ${
          label
            ? "w-20 h-20 bg-[#ccff00] border-[#ccff00]"
            : hovering
              ? "w-14 h-14 border-[#5c9ead]/80 bg-[#5c9ead]/10"
              : "w-9 h-9 border-white/35 bg-transparent"
        }`}
      >
        {label && (
          <span className="font-mono2 text-[9px] tracking-[0.18em] uppercase text-black font-medium select-none">
            {label}
          </span>
        )}
      </div>
    </>
  );
}
