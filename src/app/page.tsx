"use client";

import { useState } from "react";
import Preloader from "@/components/portfolio/Preloader";
import Cursor from "@/components/portfolio/Cursor";
import Navbar from "@/components/portfolio/Navbar";
import Hero from "@/components/portfolio/Hero";
import Marquee from "@/components/portfolio/Marquee";
import About from "@/components/portfolio/About";
import Experience from "@/components/portfolio/Experience";
import Skills from "@/components/portfolio/Skills";
import Projects from "@/components/portfolio/Projects";
import Insights from "@/components/portfolio/Insights";
import Contact from "@/components/portfolio/Contact";
import MusicPlayer from "@/components/portfolio/MusicPlayer";
import { useSmoothScroll } from "@/components/portfolio/hooks";

export default function Home() {
  const [ready, setReady] = useState(false);
  useSmoothScroll();

  return (
    <div className="grain relative min-h-screen bg-[#050505] text-[#ededed] selection:bg-[#ccff00] selection:text-black">
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <Navbar />
      <MusicPlayer />

      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Insights />
        <Contact />
      </main>
    </div>
  );
}
