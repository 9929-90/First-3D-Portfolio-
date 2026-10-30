"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { INSIGHTS, type Insight } from "@/lib/data";
import { BLOGS, type Blog } from "@/lib/blogs";
import { ContourField } from "./layers";
import ArticleReader from "./ArticleReader";

/* Full essays from the original portfolio, matched to the 12 titles.
   Titles are compared with normalized quotes/apostrophes; the source
   order is identical, so the index is a safe fallback. */
const norm = (s: string) =>
  s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

const ARTICLES: Blog[] = INSIGHTS.map((ins, i) => {
  const src =
    BLOGS.find((b) => norm(b.title) === norm(ins.title)) ?? BLOGS[i];
  return {
    id: i + 1,
    number: String(i + 1).padStart(2, "0"),
    tag: ins.tag,
    title: ins.title,
    summary: src?.summary ?? "",
    readTime: ins.readTime,
    content: src?.content ?? "",
  };
});

export default function Insights() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contourY = useTransform(scrollYProgress, [0, 1], [40, -60]);

  return (
    <section id="insights" ref={sectionRef} className="relative px-5 md:px-10 py-24 md:py-36 overflow-hidden">
      {/* faint topology backdrop */}
      <motion.div aria-hidden="true" style={{ y: contourY, willChange: "transform" }} className="absolute inset-0 opacity-50 pointer-events-none">
        <ContourField seed={31} lines={6} className="w-full h-full" opacity={0.07} />
      </motion.div>

      <div className="relative z-10 flex items-end justify-between mb-12 md:mb-16">
        <div>
          <span className="section-label">05 — Insights</span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Writing & <span className="text-stroke">thinking</span>
          </motion.h2>
        </div>
        <span className="hidden md:block font-mono2 text-[10px] tracking-[0.25em] uppercase text-[#7E8994]">
          (12 Articles)
        </span>
      </div>

      <div className="relative z-10">
        {ARTICLES.map((ins: Insight & Blog, i) => (
          <motion.article
            key={ins.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
            className="group relative border-t border-white/10 last:border-b cursor-pointer overflow-hidden"
            data-cursor="Read"
            role="button"
            tabIndex={0}
            aria-label={`Read essay: ${ins.title}`}
            onClick={() => setOpenIdx(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenIdx(i);
              }
            }}
          >
            {/* hover fill — quiet silver wash instead of loud accent */}
            <div className="absolute inset-0 bg-[#A9B2BC]/[0.05] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />

            <div className="relative flex items-center gap-4 md:gap-8 py-5 md:py-7 px-1 md:px-2 group-hover:px-4 md:group-hover:px-6 transition-all duration-500">
              <span className="font-mono2 text-[10px] text-[#7E8994] group-hover:text-[#536C83] transition-colors duration-300 shrink-0 w-6">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="flex-1 min-w-0 font-display font-medium text-lg md:text-[26px] leading-snug tracking-tight text-[#E6E9ED] group-hover:text-white group-hover:translate-x-1 transition-all duration-400">
                {ins.title}
              </h3>

              <span className="hidden sm:inline-block shrink-0 px-3 py-1 rounded-full border border-white/15 group-hover:border-[#536C83]/40 font-mono2 text-[9px] tracking-[0.16em] uppercase text-[#A9B2BC] group-hover:text-[#536C83] transition-colors duration-300">
                {ins.tag}
              </span>

              <span className="hidden md:block shrink-0 font-mono2 text-[10px] tracking-[0.12em] text-[#7E8994] group-hover:text-[#A9B2BC] transition-colors duration-300">
                {ins.readTime}
              </span>

              <span className="shrink-0 w-9 h-9 rounded-full border border-white/20 group-hover:border-[#536C83] flex items-center justify-center text-[#A9B2BC] group-hover:text-[#536C83] group-hover:rotate-45 transition-all duration-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="8 7 17 7 17 16" />
                </svg>
              </span>
            </div>
          </motion.article>
        ))}
      </div>

      {/* full-essay reader overlay */}
      <AnimatePresence>
        {openIdx !== null && (
          <ArticleReader
            key="article-reader"
            articles={ARTICLES}
            index={openIdx}
            onClose={() => setOpenIdx(null)}
            onNavigate={setOpenIdx}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
