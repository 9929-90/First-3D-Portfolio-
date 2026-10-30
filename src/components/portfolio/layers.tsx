"use client";

import { useMemo } from "react";

/* ────────────────────────────────────────────────────────────
   Shared 2D visual layers — all SVG/CSS generated (zero image
   downloads), deterministic, low opacity, GPU-composited by the
   parallax wrappers that position them.
   ──────────────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Topographic contour field — reads as data topology / elevation. */
export function ContourField({
  seed = 11,
  lines = 10,
  className,
  opacity = 0.12,
}: {
  seed?: number;
  lines?: number;
  className?: string;
  opacity?: number;
}) {
  const paths = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: string[] = [];
    for (let c = 0; c < lines; c++) {
      const cx = 200 + rnd() * 800;
      const cy = 150 + rnd() * 600;
      const baseR = 60 + rnd() * 160;
      const steps = 14;
      const pts: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const ang = (i / steps) * Math.PI * 2;
        const r = baseR * (0.72 + 0.5 * Math.abs(Math.sin(ang * (2 + c * 0.7) + seed)));
        pts.push([cx + Math.cos(ang) * r * 1.6, cy + Math.sin(ang) * r * 0.8]);
      }
      let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
      }
      out.push(d + " Z");
    }
    return out;
  }, [seed, lines]);

  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          strokeWidth="1"
          stroke={
            i % 3 === 0 ? "rgba(83, 108, 131,0.8)" : i % 3 === 1 ? "rgba(70, 88, 106,0.7)" : "rgba(86, 96, 108,0.7)"
          }
        />
      ))}
    </svg>
  );
}

/** Fine architectural grid with radial mask. */
export function GridBackdrop({ size = 84, opacity = 0.05 }: { size?: number; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(168,176,187,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,176,187,1) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        opacity,
        maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 78%)",
      }}
    />
  );
}

/** Circuit trace fragment — short L-shaped technical traces with nodes. */
export function CircuitFragment({
  className,
  opacity = 0.14,
  color = "rgba(83, 108, 131,1)",
  flip = false,
}: {
  className?: string;
  opacity?: number;
  color?: string;
  flip?: boolean;
}) {
  return (
    <svg viewBox="0 0 300 200" className={className} style={{ opacity, transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <g stroke={color} strokeWidth="1" fill="none">
        <path d="M10 40 H90 L120 70 H210" />
        <path d="M40 90 H140 L170 120 H260" />
        <path d="M20 150 H80 L110 180 H190" />
        <path d="M250 30 V80 L280 110 V170" />
        <circle cx="90" cy="40" r="2.5" />
        <circle cx="210" cy="70" r="2.5" />
        <circle cx="140" cy="90" r="2.5" />
        <circle cx="260" cy="120" r="2.5" />
        <circle cx="110" cy="180" r="2.5" />
        <circle cx="280" cy="170" r="2.5" />
      </g>
    </svg>
  );
}

/** Floating telemetry fragment — abstract system metrics. */
export function TelemetryCard({
  lines,
  accent = "#536C83",
  className,
}: {
  lines: [string, string, string?][];
  accent?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`tech-ticks absolute px-3 py-2.5 bg-[#10141A]/55 border border-[rgba(168,176,187,0.12)] rounded-sm font-mono2 text-[9px] leading-[1.9] tracking-[0.14em] pointer-events-none ${className ?? ""}`}
    >
      {lines.map(([k, v, c]) => (
        <div key={k} className="flex gap-2.5 justify-between min-w-[130px]">
          <span className="text-[#65717B]">{k}</span>
          <span style={{ color: c || accent }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
