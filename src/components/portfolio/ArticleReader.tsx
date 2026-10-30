"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { Blog } from "@/lib/blogs";

/* ── inline markdown: **bold**, *italic*, `code` ────────────── */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
  return parts.filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="font-code px-1.5 py-0.5 rounded-sm bg-white/[0.06] border border-white/10 text-[0.85em] text-[#C9D1D9] whitespace-nowrap"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

/* ── block-level markdown: ##/### headings, lists, fences, paragraphs ── */
function ArticleBody({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());

        if (block.startsWith("```")) {
          const code = block.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i}>
              <code>{code}</code>
            </pre>
          );
        }
        if (block.startsWith("### ")) {
          return <h3 key={i}>{renderInline(block.slice(4), `h${i}`)}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h3 key={i}>{renderInline(block.slice(3), `h${i}`)}</h3>;
        }
        if (lines.every((l) => /^[-•] /.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.slice(2), `li${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\.\s/, ""), `ol${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(block, `p${i}`)}</p>;
      })}
    </>
  );
}

interface ArticleReaderProps {
  articles: Blog[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/* ═══════════════════════════════════════════════════════════════
   FULL-ESSAY READER — portal overlay with its own scroll context.
   The main site's scroll (Lenis) is stopped while open; the reader
   scrolls natively inside via data-lenis-prevent, so nothing leaks
   into the page behind. Escape / Back / × close it.
   ═══════════════════════════════════════════════════════════════ */
export default function ArticleReader({
  articles,
  index,
  onClose,
  onNavigate,
}: ArticleReaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const blog = articles[index];
  const prev = articles[(index - 1 + articles.length) % articles.length];
  const next = articles[(index + 1) % articles.length];

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  /* freeze the page behind + Escape key + initial focus */
  useEffect(() => {
    const lenis = (
      window as unknown as { __lenis?: { stop(): void; start(): void } }
    ).__lenis;
    lenis?.stop();
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /* switching essays → return to the top of the piece */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  if (!blog) return null;

  const ease = [0.22, 1, 0.36, 1] as const;
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.5, ease };

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={blog.title}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
      transition={transition}
      className="fixed inset-0 z-[9600] bg-[#08090B]"
    >
      {/* reading progress hairline — same language as the main nav */}
      <div className="absolute top-0 inset-x-0 h-[2px] z-20 bg-white/[0.05]">
        <motion.div
          style={{ scaleX: progress }}
          className="h-full w-full origin-left bg-gradient-to-r from-[#536C83] via-[#46586A] to-[#ccff00]"
        />
      </div>

      <div
        ref={scrollRef}
        data-lenis-prevent
        className="h-[100dvh] overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* sticky reader bar — back / counter / close */}
        <div className="sticky top-0 z-10 bg-[#08090B]/[0.92] backdrop-blur-md border-b border-white/[0.06]">
          <div className="flex items-center justify-between gap-4 px-5 md:px-10 h-14 md:h-16">
            <button
              onClick={onClose}
              data-cursor="Back"
              className="group flex items-center gap-3 font-mono2 text-[10px] tracking-[0.24em] uppercase text-[#A9B2BC] hover:text-white transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to all writing
            </button>

            <span className="hidden md:block font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#65717B] tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(articles.length).padStart(2, "0")} — Insights
            </span>

            <button
              ref={closeRef}
              onClick={onClose}
              data-cursor="Close"
              aria-label="Close article"
              className="w-10 h-10 shrink-0 rounded-full border border-white/15 flex items-center justify-center text-[#A9B2BC] hover:border-[#536C83] hover:text-white hover:rotate-90 transition-all duration-300 focus:outline-none"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── the essay ── */}
        <article className="mx-auto max-w-[720px] px-5 md:px-8 pt-12 md:pt-20 pb-4">
          <div className="flex items-center gap-3 font-mono2 text-[10px] tracking-[0.26em] uppercase">
            <span className="text-[#536C83]">Essay — {String(index + 1).padStart(2, "0")}</span>
            <span aria-hidden="true" className="block w-8 h-px bg-[#536C83]/50" />
            <span className="text-[#A9B2BC]">{blog.tag}</span>
          </div>

          <h2 className="mt-5 font-display font-bold text-[32px] leading-[1.06] md:text-[52px] md:leading-[1.03] tracking-[-0.02em] text-[#E6E9ED] text-balance">
            {blog.title}
          </h2>

          <p className="mt-5 text-[15px] md:text-base leading-relaxed text-[#A9B2BC]">
            {blog.summary}
          </p>

          <div className="mt-7 pb-8 border-b border-white/[0.08] flex flex-wrap items-center gap-x-4 gap-y-1 font-mono2 text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-[#7E8994]">
            <span>{blog.readTime}</span>
            <span aria-hidden="true" className="text-[#46586A]">/</span>
            <span>Rohit Suthar</span>
            <span aria-hidden="true" className="text-[#46586A]">/</span>
            <span>Udaipur — IN</span>
          </div>

          <div className="article-body pt-9 md:pt-11">
            <ArticleBody content={blog.content} />
          </div>

          <div className="mt-12 flex items-center gap-3 font-mono2 text-[9px] tracking-[0.3em] uppercase text-[#65717B]">
            <span aria-hidden="true" className="block w-2 h-2 border border-[#536C83]" />
            End of essay
          </div>
        </article>

        {/* ── continue reading ── */}
        <nav
          aria-label="More essays"
          className="mx-auto max-w-[720px] px-5 md:px-8 pt-10 pb-16 md:pb-24"
        >
          <div className="border-t border-white/[0.08] grid sm:grid-cols-2">
            <button
              onClick={() => onNavigate((index - 1 + articles.length) % articles.length)}
              data-cursor="Prev"
              className="group text-left py-6 sm:pr-8 sm:border-r border-white/[0.08] focus:outline-none"
            >
              <span className="font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#7E8994] group-hover:text-[#536C83] transition-colors">
                ← Previous essay
              </span>
              <span className="mt-2 block font-display font-semibold text-base md:text-lg tracking-tight text-[#E6E9ED] group-hover:text-white transition-colors">
                {prev.title}
              </span>
            </button>
            <button
              onClick={() => onNavigate((index + 1) % articles.length)}
              data-cursor="Next"
              className="group text-left sm:text-right py-6 sm:pl-8 border-t sm:border-t-0 border-white/[0.08] focus:outline-none"
            >
              <span className="font-mono2 text-[9px] tracking-[0.26em] uppercase text-[#7E8994] group-hover:text-[#536C83] transition-colors">
                Next essay →
              </span>
              <span className="mt-2 block font-display font-semibold text-base md:text-lg tracking-tight text-[#E6E9ED] group-hover:text-white transition-colors">
                {next.title}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </motion.div>,
    document.body
  );
}
