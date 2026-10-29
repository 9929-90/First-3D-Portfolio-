"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SKILL_CATEGORIES } from "@/lib/data";

export default function Skills() {
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

  return (
    <section id="skills" className="relative px-5 md:px-10 py-24 md:py-36 overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-[#ccff00]/[0.035] blur-[120px] rounded-full pointer-events-none" />

      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div>
          <span className="section-label">03 — Arsenal</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Tech <span className="text-stroke-accent">stack</span>
          </motion.h2>
        </div>

        {/* search */}
        <div className="hidden md:flex items-center gap-3 relative">
          <svg className="absolute left-4 text-[#8f8f8f]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills… e.g. Spark, Kafka"
            aria-label="Search skills"
            className="w-64 bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-4 py-2.5 font-mono2 text-[11px] tracking-wide text-[#ededed] placeholder:text-[#6a6a6a] outline-none focus:border-[#ccff00]/60 focus:bg-white/[0.05] transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#ccff00] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 font-mono2 text-[10px] tracking-[0.22em] uppercase text-[#8f8f8f]">
        {filtered.reduce((a, c) => a + c.skills.length, 0)} / {total} skills
        {query && <span className="text-[#ccff00]"> — matching &quot;{query}&quot;</span>}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((cat, i) => (
          <motion.article
            layout
            key={cat.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="group relative rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-5 md:p-6 hover:border-[#ccff00]/45 hover:bg-[#0d0d0d] transition-colors duration-400 overflow-hidden"
          >
            {/* index + label */}
            <div className="flex items-start justify-between">
              <h3 className="font-display font-semibold text-lg tracking-tight text-[#ededed]">
                {cat.label}
              </h3>
              <span className="font-mono2 text-[10px] text-[#ccff00]/80 group-hover:text-[#ccff00] transition-colors">
                {cat.index}
              </span>
            </div>

            {/* count hairline */}
            <div className="mt-3 mb-4 h-px bg-white/8 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + (i % 4) * 0.08 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ccff00]/70 to-transparent"
              />
            </div>

            {/* chips */}
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((s) => (
                <span key={`${cat.id}-${s}`} className="chip">{s}</span>
              ))}
            </div>

            {/* hover glow */}
            <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-[#ccff00]/0 blur-2xl group-hover:bg-[#ccff00]/10 transition-all duration-500 pointer-events-none" />
          </motion.article>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="py-20 text-center font-mono2 text-[11px] tracking-[0.25em] uppercase text-[#8f8f8f]">
          No skills match &quot;{query}&quot; — try &quot;Spark&quot;, &quot;SQL&quot; or &quot;React&quot;
        </div>
      )}
    </section>
  );
}
