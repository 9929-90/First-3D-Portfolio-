"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { NAV_LINKS, IDENTITY } from "@/lib/data";
import { scrollToSection, useLocalTimeIST, scrollToTop } from "./hooks";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const time = useLocalTimeIST();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setTimeout(() => scrollToSection(href), open ? 350 : 0);
  };

  return (
    <>
      {/* scroll progress hairline — cyan → lime tip */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[9500] origin-left bg-gradient-to-r from-[#536C83] via-[#46586A] to-[#ccff00]"
        style={{ scaleX: progress }}
      />

      <header
        className={`fixed top-0 inset-x-0 z-[9400] transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-black/55 border-b border-white/[0.07]" : ""
        }`}
      >
        <nav className="flex items-center justify-between px-5 md:px-10 h-16 md:h-[72px]">
          {/* logo */}
          <button
            onClick={scrollToTop}
            data-cursor="Top"
            className="flex items-center gap-2 group"
            aria-label="Back to top"
          >
            <span className="font-display font-bold text-lg tracking-tight lowercase">
              welcome
            </span>
          </button>

          {/* desktop links */}
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <button
                  onClick={() => go(l.href)}
                  className="group relative font-mono2 text-[10.5px] tracking-[0.22em] uppercase text-[#AFB6BE] hover:text-white transition-colors py-2"
                >
                  {l.label}
                  <span className="absolute left-0 bottom-0 w-full h-px bg-[#536C83] scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-400 group-hover:origin-left" />
                </button>
              </li>
            ))}
          </ul>

          {/* right meta */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:block text-right">
              <div className="font-mono2 text-[10px] tracking-[0.18em] text-white tabular-nums">
                {time} <span className="text-[#79828D]">IST</span>
              </div>
              <div className="font-mono2 text-[8.5px] tracking-[0.2em] uppercase text-[#79828D]">
                {IDENTITY.location}
              </div>
            </div>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] border border-white/15 rounded-full hover:border-[#536C83]/60 transition-colors"
            >
              <span
                className={`block w-4 h-px bg-white transition-transform duration-300 ${open ? "rotate-45 translate-y-[3px]" : ""}`}
              />
              <span
                className={`block w-4 h-px bg-white transition-transform duration-300 ${open ? "-rotate-45 -translate-y-[3px]" : ""}`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile overlay menu */}
      <motion.div
        initial={false}
        animate={{ clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[9300] bg-[#070707] lg:hidden flex flex-col justify-center px-8"
      >
        <ul className="flex flex-col gap-2">
          {NAV_LINKS.map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ opacity: 0, y: 24 }}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => go(l.href)}
                className="flex items-baseline gap-4 py-2 text-left"
              >
                <span className="font-display font-bold text-[13vw] leading-[1.05] tracking-tight text-[#E6E9ED]">
                  {l.label}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
        <motion.div
          initial={{ opacity: 0 }}
          animate={open ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-10 left-8 right-8 flex justify-between font-mono2 text-[9px] tracking-[0.25em] uppercase text-[#79828D]"
        >
          <span>{IDENTITY.location}</span>
          <span className="text-[#536C83]">Open to work</span>
        </motion.div>
      </motion.div>
    </>
  );
}
