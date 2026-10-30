"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { IDENTITY, SOCIALS } from "@/lib/data";
import { useMagnetic, useLocalTimeIST, scrollToTop } from "./hooks";
import SocialIcon from "./SocialIcon";

const CTAScene = dynamic(() => import("./CTAScene"), { ssr: false });

export default function Contact() {
  const { ref: emailRef, onMouseMove: onEmailMove, onMouseLeave: onEmailLeave } = useMagnetic<HTMLDivElement>(0.22);
  const time = useLocalTimeIST();

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#08090B] border-t border-white/[0.07]">
      <CTAScene />

      <div className="relative z-10 px-5 md:px-10 pt-24 md:pt-36 pb-8 flex flex-col min-h-[92svh]">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="section-label mb-8">06 — Contact</span>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold leading-[0.92] tracking-[-0.03em] text-[13vw] md:text-[9.5vw]"
          >
            LET&apos;S BUILD
            <br />
            <span className="text-stroke">SOMETHING</span>{" "}
            <span className="text-gradient-tech">DATA-DRIVEN</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 max-w-lg text-sm md:text-base leading-relaxed text-[#9a9a9a]"
          >
            Open for data engineering roles, internships and freelance pipelines.
            If you have data, I have a pipeline for it — let&apos;s talk.
          </motion.p>

          {/* magnetic email CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10"
          >
            <div ref={emailRef} onMouseMove={onEmailMove} onMouseLeave={onEmailLeave} className="inline-block">
              <a
                href={`mailto:${IDENTITY.email}`}
                data-cursor="Say hi"
                className="group relative inline-flex items-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-full bg-[#E6E9ED] text-black font-display font-semibold text-base md:text-lg hover:bg-[#536C83] hover:text-white transition-colors duration-300"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] group-hover:animate-ping" />
                {IDENTITY.email}
              </a>
            </div>
          </motion.div>

          {/* social grid */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full max-w-4xl">
            {SOCIALS.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                data-cursor={s.short}
                className="group rounded-xl border border-white/10 bg-[#10141A]/50 backdrop-blur-sm px-4 py-4 text-left hover:border-[#536C83]/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-[#7E8994] group-hover:text-[#536C83] transition-colors">
                    {s.label}
                  </span>
                  <span className="text-[#7E8994] group-hover:text-[#536C83] group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                    <SocialIcon label={s.label} size={17} />
                  </span>
                </div>
                <div className="mt-1.5 font-mono2 text-[10px] text-[#AFB6BE] truncate">{s.handle}</div>
              </motion.a>
            ))}
          </div>
        </div>

          {/* big credit */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 md:mt-28 mb-10 md:mb-14 text-center select-none"
            aria-label="Developed by Rohit"
          >
            <p className="font-display font-bold leading-[0.95] tracking-[-0.03em]">
              <span className="block text-stroke text-[8vw] md:text-[3.4vw] tracking-[0.02em]">
                DEVELOPED BY
              </span>
              <span className="block text-[17vw] md:text-[8.6vw] mt-1">
                <span className="text-gradient-tech">ROHIT</span>
                <span className="text-[#ccff00]">.</span>
              </span>
            </p>
          </motion.div>

          {/* bottom bar */}
          <div className="mt-auto pt-6 pb-20 md:pb-6 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono2 text-[9.5px] tracking-[0.2em] uppercase text-[#79828D]">
              {IDENTITY.name} — All rights reserved
            </div>

          <div className="font-mono2 text-[9.5px] tracking-[0.2em] uppercase text-[#79828D] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
            {time} IST — {IDENTITY.location}
          </div>

          <button
            onClick={scrollToTop}
            data-cursor="Top"
            className="font-mono2 text-[9.5px] tracking-[0.2em] uppercase text-[#AFB6BE] hover:text-[#536C83] transition-colors"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
