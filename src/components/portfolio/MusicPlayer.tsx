"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   Generative Ambient Engine (Web Audio API)
   A slow evolving chord progression with pads, sub bass,
   a gentle sparkle arpeggio and convolution reverb.
   Zero audio files — fully generative, license-free.
   ──────────────────────────────────────────────────────────── */

type Chord = { freqs: number[]; bass: number };

// Am9 → Fmaj7 → Cmaj9 → G6 (low register, warm & cinematic)
const PROGRESSION: Chord[] = [
  { freqs: [220.0, 261.63, 329.63, 493.88], bass: 55.0 },   // A3 C4 E4 B4 — A2
  { freqs: [174.61, 220.0, 261.63, 329.63], bass: 43.65 },  // F3 A3 C4 E4 — F1
  { freqs: [196.0, 261.63, 293.66, 392.0], bass: 49.0 },    // G3 C4 D4 G4 — G1
  { freqs: [130.81, 164.81, 196.0, 246.94], bass: 65.41 },  // C3 E3 G3 B3 — C2
];

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private noiseSrc: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private padTimer: ReturnType<typeof setTimeout> | null = null;
  private arpTimer: ReturnType<typeof setInterval> | null = null;
  private chordIdx = 0;
  private activeVoices: { osc: OscillatorNode[]; gain: GainNode }[] = [];
  playing = false;

  private ensureCtx() {
    if (this.ctx) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new AC();

    // master chain
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 24;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.01;
    limiter.release.value = 0.3;
    this.master.connect(limiter);
    limiter.connect(this.ctx.destination);

    // convolution reverb — generated impulse response
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.buildImpulse(3.2, 2.6);
    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.45;
    this.wetGain.connect(this.convolver);
    this.convolver.connect(this.master);
  }

  private buildImpulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const impulse = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return impulse;
  }

  private makeNoiseBed() {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        // brown-ish noise
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    // slow LFO breathing on the noise bed
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    gain.connect(this.wetGain!);
    src.start();
    this.noiseSrc = src;
    this.noiseGain = gain;
  }

  private playPad(chord: Chord, at: number) {
    const ctx = this.ctx!;
    const hold = 9.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.055, at + 3.2); // slow swell
    gain.gain.setValueAtTime(0.055, at + hold - 3);
    gain.gain.linearRampToValueAtTime(0.0001, at + hold);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, at);
    filter.frequency.linearRampToValueAtTime(1500, at + 4.5);
    filter.frequency.linearRampToValueAtTime(600, at + hold);
    filter.Q.value = 0.6;

    filter.connect(gain);
    gain.connect(this.master!);
    gain.connect(this.wetGain!);

    const oscs: OscillatorNode[] = [];
    chord.freqs.forEach((f, i) => {
      for (const detune of [-4, 4]) {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = f;
        osc.detune.value = detune;
        const og = ctx.createGain();
        og.gain.value = i === 0 ? 0.7 : 0.42 / i;
        osc.connect(og);
        og.connect(filter);
        osc.start(at);
        osc.stop(at + hold + 0.2);
        oscs.push(osc);
      }
    });
    this.activeVoices.push({ osc: oscs, gain });
  }

  private playBass(chord: Chord, at: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = chord.bass;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.09, at + 2.4);
    gain.gain.setValueAtTime(0.09, at + 7.2);
    gain.gain.linearRampToValueAtTime(0.0001, at + 9.4);
    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(at);
    osc.stop(at + 9.6);
    this.activeVoices.push({ osc: [osc], gain });
  }

  private sparkle() {
    if (!this.ctx || !this.playing) return;
    const ctx = this.ctx;
    const chord = PROGRESSION[this.chordIdx % PROGRESSION.length];
    const base = chord.freqs[Math.floor(Math.random() * chord.freqs.length)];
    const f = base * (Math.random() > 0.5 ? 4 : 2); // 2 or 4 octaves up
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const gain = ctx.createGain();
    const peak = 0.016 + Math.random() * 0.014;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    osc.connect(gain);
    gain.connect(pan);
    pan.connect(this.master!);
    pan.connect(this.wetGain!);
    osc.start(now);
    osc.stop(now + 2.8);
  }

  private scheduleLoop = () => {
    if (!this.ctx || !this.playing) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chord = PROGRESSION[this.chordIdx % PROGRESSION.length];
    this.playPad(chord, now + 0.05);
    this.playBass(chord, now + 0.05);
    this.chordIdx++;
    this.padTimer = setTimeout(this.scheduleLoop, 8600);
  };

  async start() {
    this.ensureCtx();
    if (!this.ctx || this.playing) return;
    this.playing = true; // set synchronously so the UI reflects intent immediately
    try {
      await this.ctx.resume();
    } catch {
      /* resume can reject if no gesture yet — first interaction will retry */
      this.playing = false;
      return;
    }
    if (!this.noiseSrc) this.makeNoiseBed();
    this.master!.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master!.gain.setValueAtTime(this.master!.gain.value, this.ctx.currentTime);
    this.master!.gain.linearRampToValueAtTime(0.34, this.ctx.currentTime + 2.2);
    this.scheduleLoop();
    this.arpTimer = setInterval(() => {
      if (Math.random() > 0.42) this.sparkle();
    }, 1150);
  }

  pause() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    if (this.padTimer) clearTimeout(this.padTimer);
    if (this.arpTimer) clearInterval(this.arpTimer);
    // release lingering voices
    const voices = this.activeVoices;
    this.activeVoices = [];
    voices.forEach(({ osc }) => {
      osc.forEach((o) => {
        try {
          o.stop(now + 1.0);
        } catch {
          /* already stopped */
        }
      });
    });
  }

  toggle() {
    if (this.playing) this.pause();
    else void this.start();
  }
}

/* ────────────────────────────────────────────────────────────
   Music Player — floating widget
   Autoplays on the visitor's first interaction (browser
   autoplay policy safe), with play / pause control.
   ──────────────────────────────────────────────────────────── */

type PlayerState = "standby" | "playing" | "paused";

export default function MusicPlayer() {
  const engineRef = useRef<AmbientEngine | null>(null);
  const stateRef = useRef<PlayerState>("standby");
  const [state, setState] = useState<PlayerState>("standby");
  const [hintVisible, setHintVisible] = useState(false);

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new AmbientEngine();
    return engineRef.current;
  }, []);

  const tryAutoStart = useCallback(() => {
    const engine = getEngine();
    if (engine.playing || stateRef.current === "playing") return;
    void engine.start();
    stateRef.current = "playing";
    setState("playing");
    setHintVisible(true);
    setTimeout(() => setHintVisible(false), 4200);
  }, [getEngine]);

  useEffect(() => {
    // Browsers require a user gesture before audio can start.
    // The instant the visitor touches / scrolls / clicks anywhere,
    // the ambient score fades in automatically.
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, tryAutoStart, { once: true, passive: true })
    );
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, tryAutoStart));
    };
  }, [tryAutoStart]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const engine = getEngine();
    engine.toggle();
    const next = engine.playing ? "playing" : "paused";
    stateRef.current = next;
    setState(next);
  };

  const playing = state === "playing";

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[9000] flex items-center gap-3">
      {/* status hint */}
      <div
        className={`hidden md:flex items-center gap-2 font-mono2 text-[9px] tracking-[0.22em] uppercase transition-all duration-500 ${
          hintVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
        {playing ? "Soundtrack on — ambient.fm" : "Soundtrack paused"}
      </div>

      <button
        onClick={toggle}
        data-cursor={playing ? "Pause" : "Play"}
        aria-label={playing ? "Pause background music" : "Play background music"}
        className="group relative flex items-center gap-3 h-12 md:h-[52px] pl-2.5 pr-4 md:pl-3 md:pr-5 rounded-full border border-white/15 bg-[#10141A]/70 backdrop-blur-xl hover:border-[#536C83]/60 transition-colors duration-300"
      >
        {/* vinyl disc */}
        <span className="relative block w-8 h-8 md:w-9 md:h-9">
          <span
            className={`absolute inset-0 rounded-full bg-[conic-gradient(#1a1a1a,#3a3a1a,#1a1a1a,#2e2e10,#1a1a1a)] border border-white/20 ${
              playing ? "animate-spin-slow" : ""
            }`}
          />
          <span className="absolute inset-[38%] rounded-full bg-[#ccff00]" />
        </span>

        {/* equalizer bars */}
        <span className="flex items-end gap-[2.5px] h-3.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[2.5px] rounded-sm ${playing ? "bg-[#ccff00] eq-bar" : "bg-white/35"}`}
              style={
                playing
                  ? { height: "100%", animationDelay: `${i * 0.17}s`, animationDuration: `${0.7 + i * 0.13}s` }
                  : { height: "22%" }
              }
            />
          ))}
        </span>

        <span className="font-mono2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white group-hover:text-white transition-colors">
          {playing ? "On Air" : state === "paused" ? "Paused" : "Play"}
        </span>
      </button>
    </div>
  );
}
