import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/data";

/* ═══════════════════════════════════════════════════════════════
   THE SKILL GALAXY — planet registry.

   Six planets, mapped strictly from the twelve SKILL_CATEGORIES
   already published on the site. Every skill name below is pulled
   out of the real data through pick() — if a string ever drifts
   from src/lib/data.ts the build fails, so nothing can be invented.
   ═══════════════════════════════════════════════════════════════ */

const cat = (id: string): SkillCategory => {
  const c = SKILL_CATEGORIES.find((c) => c.id === id);
  if (!c) throw new Error(`unknown skill category: ${id}`);
  return c;
};

/** resolve exact skill names from a category — invents nothing */
function pick(catId: string, names: string[]): string[] {
  const pool = cat(catId).skills;
  return names.map((n) => {
    const hit = pool.find((s) => s.toLowerCase() === n.toLowerCase());
    if (!hit) throw new Error(`"${n}" is not in category "${catId}" — check src/lib/data.ts`);
    return hit;
  });
}

export interface PlanetIcon {
  skill: string; // exact skill name from the portfolio
  slug: string;  // key into TECH_ICONS
}

export interface PlanetDef {
  id: string;
  index: string;      // planet number in the journey
  categoryIndex: string; // original section index, e.g. "01"
  title: string;      // category label(s) from the site
  kicker: string;     // one-line sub text
  iconSet: PlanetIcon[];
  chips: string[];    // remaining exact skills
  note: string;       // small footer line in the panel
  /* 3D look */
  look: {
    type: "terran" | "banded" | "ice" | "crater" | "marble" | "night";
    atmosphere: string;  // rim colour
    atmoIntensity: number;
    ring?: { inner: number; outer: number; tiltX: number; tiltZ: number; opacity: number };
    radius: number;
    orbit: { r: number; angle: number; y: number; incline: number };
    spin: number; // self-rotation speed rad/s
  };
}

export const PLANETS: PlanetDef[] = [
  {
    id: "languages",
    index: "01",
    categoryIndex: "01",
    title: "Languages",
    kicker: "Where every pipeline begins — core programming bedrock.",
    iconSet: [
      { skill: pick("languages", ["Python"])[0], slug: "python" },
      { skill: pick("languages", ["Java"])[0], slug: "openjdk" },
    ],
    chips: pick("languages", ["SQL"]),
    note: "Python · SQL · Java — three languages, one orbit.",
    look: {
      type: "terran",
      atmosphere: "#536C83",
      atmoIntensity: 0.55,
      radius: 1.18,
      orbit: { r: 6.6, angle: 3.6, y: 0.4, incline: 0.06 },
      spin: 0.05,
    },
  },
  {
    id: "dataeng",
    index: "02",
    categoryIndex: "02–03",
    title: "Data Engineering · Big Data",
    kicker: "Batch and streaming pipelines, engineered at scale.",
    iconSet: [
      { skill: pick("bigdata", ["Apache Spark"])[0], slug: "apachespark" },
      { skill: pick("bigdata", ["Apache Kafka"])[0], slug: "apachekafka" },
      { skill: pick("bigdata", ["Databricks"])[0], slug: "databricks" },
      { skill: pick("bigdata", ["Delta Lake"])[0], slug: "deltalake" },
      { skill: pick("bigdata", ["Parquet"])[0], slug: "apacheparquet" },
    ],
    chips: pick("dataeng", ["ETL / ELT", "Data Cleaning", "Transformation", "Validation", "Data Pipelines", "Streaming Pipelines"])
      .concat(pick("bigdata", ["PySpark", "Spark Streaming"])),
    note: "Categories 02 + 03 — nine pipeline technologies in one system.",
    look: {
      type: "banded",
      atmosphere: "#5E6E7E",
      atmoIntensity: 0.45,
      ring: { inner: 1.55, outer: 2.35, tiltX: -1.05, tiltZ: 0.22, opacity: 0.72 },
      radius: 1.95,
      orbit: { r: 9.2, angle: 2.5, y: -0.8, incline: -0.05 },
      spin: 0.075,
    },
  },
  {
    id: "clouddevops",
    index: "03",
    categoryIndex: "04 · 11",
    title: "Cloud & DevOps",
    kicker: "Deployments, storage and automation — the launch infrastructure.",
    iconSet: [
      { skill: pick("cloud", ["Azure Data Factory"])[0], slug: "azure" },
      { skill: pick("cloud", ["AWS Basics"])[0], slug: "amazonwebservices" },
      { skill: pick("devops", ["Docker"])[0], slug: "docker" },
      { skill: pick("devops", ["Linux"])[0], slug: "linux" },
      { skill: pick("devops", ["GitHub Actions"])[0], slug: "githubactions" },
      { skill: pick("devops", ["Vercel"])[0], slug: "vercel" },
      { skill: pick("devops", ["Netlify"])[0], slug: "netlify" },
    ],
    chips: pick("cloud", ["Azure Blob Storage", "Azure SQL"]).concat(
      pick("devops", ["Render", "Bash / CMD", "PowerShell", "Networking", "Linode"])
    ),
    note: "Categories 04 + 11 — from ADF pipelines to edge deploys.",
    look: {
      type: "ice",
      atmosphere: "#8E9BA8",
      atmoIntensity: 0.5,
      radius: 1.34,
      orbit: { r: 11.8, angle: 4.9, y: 1.6, incline: 0.1 },
      spin: 0.06,
    },
  },
  {
    id: "databases",
    index: "04",
    categoryIndex: "05 · 06 · 09",
    title: "Databases & SQL",
    kicker: "Relational cores, cloud data stores and the SQL craft around them.",
    iconSet: [
      { skill: pick("dbtools", ["PostgreSQL"])[0], slug: "postgresql" },
      { skill: pick("dbtools", ["MySQL"])[0], slug: "mysql" },
      { skill: pick("dbtools", ["DuckDB"])[0], slug: "duckdb" },
      { skill: pick("database", ["Firebase"])[0], slug: "firebase" },
      { skill: pick("database", ["NeonDB"])[0], slug: "neon" },
    ],
    chips: pick("concepts", ["DBMS", "Joins", "CTEs", "Aggregations", "Window Functions", "Partitioning", "Event-Time Windows", "Watermarking"])
      .concat(pick("dbtools", ["Excel / CSV"])),
    note: "Categories 05 + 06 + 09 — storage engines and query craft.",
    look: {
      type: "crater",
      atmosphere: "#4E5D6E",
      atmoIntensity: 0.42,
      ring: { inner: 1.6, outer: 2.15, tiltX: -1.25, tiltZ: -0.28, opacity: 0.6 },
      radius: 1.5,
      orbit: { r: 14.4, angle: 1.35, y: 2.1, incline: 0.12 },
      spin: 0.045,
    },
  },
  {
    id: "development",
    index: "05",
    categoryIndex: "07 · 08",
    title: "Development",
    kicker: "Frontend, backend and the tooling that holds them together.",
    iconSet: [
      { skill: pick("backend", ["Spring Boot"])[0], slug: "springboot" },
      { skill: pick("backend", ["FastAPI"])[0], slug: "fastapi" },
      { skill: pick("frontend", ["React.js"])[0], slug: "react" },
      { skill: pick("frontend", ["Next.js"])[0], slug: "nextdotjs" },
      { skill: pick("frontend", ["JavaScript"])[0], slug: "javascript" },
      { skill: pick("dbtools", ["Git"])[0], slug: "git" },
      { skill: pick("dbtools", ["GitHub"])[0], slug: "github" },
    ],
    chips: pick("backend", ["Java", "Hibernate", "JDBC", "NestJS", "REST APIs", "JWT", "OAuth2", "Maven", "Gradle"])
      .concat(pick("frontend", ["HTML5", "CSS3", "Angular", "Tailwind CSS", "Material UI", "Framer Motion"]))
      .concat(pick("dbtools", ["Docker", "pytest"])),
    note: "Categories 07 + 08 — plus tooling from 05.",
    look: {
      type: "marble",
      atmosphere: "#536C83",
      atmoIntensity: 0.48,
      radius: 1.72,
      orbit: { r: 17.0, angle: 5.9, y: -1.7, incline: -0.08 },
      spin: 0.055,
    },
  },
  {
    id: "mobileai",
    index: "06",
    categoryIndex: "10 · 12",
    title: "Mobile & AI",
    kicker: "Cross-platform apps and applied AI tooling on the outer rim.",
    iconSet: [
      { skill: pick("mobile", ["Flutter"])[0], slug: "flutter" },
      { skill: pick("mobile", ["Android"])[0], slug: "android" },
      { skill: pick("mobile", ["Expo"])[0], slug: "expo" },
      { skill: pick("ai", ["GitHub Copilot"])[0], slug: "githubcopilot" },
      { skill: pick("ai", ["HuggingFace"])[0], slug: "huggingface" },
      { skill: pick("ai", ["Kaggle"])[0], slug: "kaggle" },
      { skill: pick("ai", ["Google Colab"])[0], slug: "googlecolab" },
    ],
    chips: pick("mobile", ["React Native", "APK Builds", "Deep Linking", "Push Notifications"]).concat(
      pick("ai", ["Claude", "ChatGPT", "Grok", "Lovable", "Replit", "RAG", "Prompting", "Vibe Coding"])
    ),
    note: "Categories 10 + 12 — the frontier of the universe.",
    look: {
      type: "night",
      atmosphere: "#6B6478",
      atmoIntensity: 0.5,
      radius: 1.42,
      orbit: { r: 19.6, angle: 0.4, y: 0.2, incline: 0.07 },
      spin: 0.065,
    },
  },
];

/** chapter windows over the master scroll progress 0..1 */
export const CHAPTERS = {
  enter: [0.0, 0.15],     // C1 — extreme close-up on planet 01
  reveal: [0.15, 0.35],   // C2 — pull back, system + orbit lines appear
  planet1: [0.35, 0.48],  // C3 — the Python planet
  transit: [0.48, 0.78],  // C4 — planets 02–05
  finale: [0.78, 1.0],    // C5 — planet 06, then the full system
} as const;

/** per-planet focus windows inside the master timeline */
export const PLANET_WINDOWS: Array<[number, number]> = [
  [0.35, 0.48],                    // 01 languages
  [0.48, 0.585],                   // 02 data engineering
  [0.585, 0.65],                   // 03 cloud & devops
  [0.65, 0.715],                   // 04 databases
  [0.715, 0.78],                   // 05 development
  [0.78, 0.865],                   // 06 mobile & ai
];

export const TOTAL_SKILLS = SKILL_CATEGORIES.reduce((a, c) => a + c.skills.length, 0);
