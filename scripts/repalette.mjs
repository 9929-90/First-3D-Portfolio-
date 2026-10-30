#!/usr/bin/env node
/* One-shot palette migration: old desaturated-cyan/lime scheme →
   new restrained cinematic steel palette. Case-insensitive hex swap. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = "/home/z/my-project/src";

// old → new mapping (case-insensitive)
const MAP = [
  ["#050505", "#08090B"], // deep black
  ["#07090d", "#0B0D10"],
  ["#0a0d12", "#10141A"],
  ["#12161d", "#141922"],
  ["#171c24", "#161C24"],
  ["#5c9ead", "#536C83"], // restrained cool blue (primary tint)
  ["#5277a5", "#46586A"], // darker steel blue
  ["#75658f", "#56606C"], // violet → cool graphite-steel
  ["#a8b0bb", "#A9B2BC"], // silver
  ["#8b94a0", "#7E8994"], // muted labels
  ["#b3bac3", "#B9C1CA"],
  ["#b5b5b5", "#AFB6BE"],
  ["#8f8f8f", "#79828D"],
  ["#9aa3af", "#939DA8"],
  ["#e8eaee", "#E6E9ED"], // ink
  ["#ededed", "#E6E9ED"],
  ["#d7dde4", "#DCE1E6"],
  ["#5d6670", "#59636E"],
  ["#232a33", "#242B33"],
  ["#39424e", "#3A4550"],
  ["rgba(92, 158, 173", "rgba(83, 108, 131"],
  ["rgba(82,119,165", "rgba(70, 88, 106"],
  ["rgba(92,158,173", "rgba(83, 108, 131"],
  ["rgba(117,101,143", "rgba(86, 96, 108"],
  ["rgba(168, 176, 187", "rgba(169, 178, 188"],
  ["rgba(200, 214, 224", "rgba(198, 205, 212"],
];

let fileCount = 0;
let hitCount = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|css|mjs)$/.test(name)) {
      const src = readFileSync(p, "utf8");
      let out = src;
      let hits = 0;
      for (const [from, to] of MAP) {
        const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        out = out.replace(re, () => {
          hits++;
          return to;
        });
      }
      if (hits > 0) {
        writeFileSync(p, out);
        fileCount++;
        hitCount += hits;
        console.log(`${p.replace(ROOT, "")} — ${hits} replacements`);
      }
    }
  }
}

walk(ROOT);
console.log(`\nDone: ${hitCount} replacements across ${fileCount} files`);
