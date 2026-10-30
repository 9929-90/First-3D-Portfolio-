/* Extract the 12 full blog articles from the original portfolio source
   (upload/Portfolio_extracted/src/Insights.jsx) into src/lib/blogs.ts */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(
  "/home/z/my-project/upload/Portfolio_extracted/src/Insights.jsx",
  "utf8"
);

const lines = src.split("\n");
const arrStart = lines.findIndex((l) => l.startsWith("const blogs = ["));
const arrEnd = lines.findIndex((l) => l.trim() === "];", arrStart);
if (arrStart < 0 || arrEnd < 0) throw new Error("blogs array boundaries not found");

const firstLine = lines[arrStart].slice(lines[arrStart].indexOf("["));
const literal = [firstLine, ...lines.slice(arrStart + 1, arrEnd)].join("\n") + "\n]";
// The literal is plain JS (template strings + escaped quotes) — evaluate safely in isolation
const blogs = new Function(`"use strict"; return (${literal});`)();

console.log(`Extracted ${blogs.length} blogs`);
for (const b of blogs) {
  const markers = {
    headings: /(^|\n)#{1,4} /.test(b.content),
    bullets: /(^|\n)- /.test(b.content),
    numbered: /(^|\n)\d+\. /.test(b.content),
    bold: /\*\*[^*]+\*\*/.test(b.content),
    italic: /(^|[^*])\*[^*\n]+\*(?!\*)/.test(b.content),
    inlineCode: /`[^`\n]+`/.test(b.content),
    codeFence: /```/.test(b.content),
    quotes: /(^|\n)> /.test(b.content),
  };
  console.log(
    `${b.number} | ${b.title.slice(0, 48).padEnd(50)} | content=${String(b.content.length).padStart(5)}ch |`,
    Object.entries(markers).filter(([, v]) => v).map(([k]) => k).join(",") || "plain"
  );
}

const ts = `/* ─────────────────────────────────────────────────────────────
   BLOG ARTICLES — full content extracted verbatim from the
   original portfolio source (12 articles, unchanged).
   Rendered by components/portfolio/ArticleReader.tsx
   ───────────────────────────────────────────────────────────── */

export interface Blog {
  id: number;
  number: string;
  tag: string;
  title: string;
  summary: string;
  readTime: string;
  content: string;
}

export const BLOGS: Blog[] = ${JSON.stringify(
    blogs.map(({ id, number, tag, title, summary, readTime, content }) => ({
      id,
      number,
      tag,
      title,
      summary,
      readTime,
      content,
    })),
    null,
    2
  )};
`;

writeFileSync("/home/z/my-project/src/lib/blogs.ts", ts);
console.log("Wrote src/lib/blogs.ts");
