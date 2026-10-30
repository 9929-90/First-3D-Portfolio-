/* ─────────────────────────────────────────────────────────────
   PORTFOLIO DATA — Rohit Suthar
   All content extracted from the original portfolio source.
   ───────────────────────────────────────────────────────────── */

export const IDENTITY = {
  name: "Rohit Suthar",
  firstName: "ROHIT",
  lastName: "SUTHAR",
  role: "Aspiring Data Engineer",
  location: "Udaipur, Rajasthan, IN",
  email: "rohitsuthar410@gmail.com",
  phone: "+91 77374 38464",
  phoneRaw: "+917737438464",
  cv: "/portfolio/Rohit_Suthar_CV.pdf",
  intro:
    "As an AI/ML Engineer Intern at PAPASIDDHI Technologies, I built a voice-based conversational AI using Python and RAG — improving data quality and pipeline reliability with SQL, PySpark and Databricks. Now building my career in data engineering.",
  tagline: "I turn raw data into reliable pipelines.",
} as const;

export const SOCIALS = [
  { label: "GitHub", short: "GH", href: "https://github.com/9929-90", handle: "@9929-90" },
  { label: "LinkedIn", short: "LI", href: "https://linkedin.com/in/rohitsuthar09", handle: "rohitsuthar09" },
  { label: "X / Twitter", short: "X", href: "https://x.com/RohitttSuthar", handle: "@RohitttSuthar" },
  { label: "WhatsApp", short: "WA", href: "https://wa.me/7737438464", handle: "+91 77374 38464" },
  { label: "Email", short: "EM", href: "mailto:rohitsuthar410@gmail.com", handle: "rohitsuthar410@gmail.com" },
  { label: "Phone", short: "TL", href: "tel:+917737438464", handle: "+91 77374 38464" },
] as const;

export const ABOUT = {
  statement:
    "I am a Fresher Data Engineer with hands-on experience in Python, SQL, PySpark, Databricks, ETL pipelines and data transformation — gained through AI/ML internship work and end-to-end data projects. Strong foundation in SQL, DBMS, Apache Spark, Delta Lake and cloud data pipelines.",
  secondary:
    "Through self-paced learning, I also built various apps and websites across different tech stacks and applied SEO. I communicate clearly and collaborate well.",
  stats: [
    { value: 8, suffix: "+", label: "Projects Shipped" },
    { value: 93, suffix: "+", label: "Skills Mastered" },
    { value: 12, suffix: "", label: "Insights Written" },
    { value: 2, suffix: "", label: "Industry Roles" },
  ],
} as const;

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  place: string;
  points: string[];
  current?: boolean;
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: "AI/ML Engineer Intern",
    company: "PAPASIDDHI Technologies",
    period: "May 2026 — Sep 2026",
    place: "Udaipur, Rajasthan",
    current: true,
    points: [
      "Built a voice-based conversational AI using Python, RAG and data pipelines.",
      "Handled data ingestion, cleaning, transformation and retrieval, with SQL for structured data.",
      "Explored PySpark and Databricks; improved data quality, pipeline reliability and response accuracy.",
    ],
  },
  {
    role: "Web Support Executive",
    company: "FBSPL",
    period: "Jun 2025 — May 2026",
    place: "Udaipur, Rajasthan",
    points: [
      "Managed production websites and monitored live performance.",
      "Cleaned and organized thousands of prospect records in CSV/Excel using Python.",
      "Built Python/AI automation for repetitive tasks; handled client queries and escalations.",
    ],
  },
];

export const EDUCATION = [
  {
    school: "Mohanlal Sukhadia University",
    degree: "B.Sc. Computer Science",
    score: "60%",
    period: "2022 — 2025",
  },
  {
    school: "The Stanvard Sr. Sec.",
    degree: "Science & Mathematics",
    score: "71%",
    period: "",
  },
] as const;

export interface SkillCategory {
  id: string;
  index: string;
  label: string;
  skills: readonly string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    index: "01",
    label: "Languages",
    skills: ["Python", "SQL", "Java"],
  },
  {
    id: "dataeng",
    index: "02",
    label: "Data Engineering",
    skills: ["ETL / ELT", "Data Cleaning", "Transformation", "Validation", "Data Pipelines", "Streaming Pipelines"],
  },
  {
    id: "bigdata",
    index: "03",
    label: "Big Data",
    skills: ["PySpark", "Apache Spark", "Databricks", "Spark Streaming", "Apache Kafka", "Delta Lake", "Parquet"],
  },
  {
    id: "cloud",
    index: "04",
    label: "Cloud",
    skills: ["Azure Data Factory", "Azure Blob Storage", "Azure SQL", "AWS Basics"],
  },
  {
    id: "dbtools",
    index: "05",
    label: "DB & Tools",
    skills: ["PostgreSQL", "MySQL", "DuckDB", "Git", "GitHub", "Docker", "pytest", "Excel / CSV"],
  },
  {
    id: "concepts",
    index: "06",
    label: "Concepts",
    skills: ["DBMS", "Joins", "CTEs", "Aggregations", "Window Functions", "Partitioning", "Event-Time Windows", "Watermarking"],
  },
  {
    id: "frontend",
    index: "07",
    label: "Frontend",
    skills: ["HTML5", "CSS3", "JavaScript", "React.js", "Next.js", "Angular", "Tailwind CSS", "Material UI", "Framer Motion"],
  },
  {
    id: "backend",
    index: "08",
    label: "Backend",
    skills: ["Java", "Spring Boot", "Hibernate", "JDBC", "Python", "NestJS", "FastAPI", "REST APIs", "JWT", "OAuth2", "API Keys", "Maven", "Gradle"],
  },
  {
    id: "database",
    index: "09",
    label: "Database",
    skills: ["PostgreSQL", "MySQL", "NeonDB", "Firebase"],
  },
  {
    id: "mobile",
    index: "10",
    label: "Mobile App",
    skills: ["React Native", "Expo", "Flutter", "Android", "APK Builds", "Deep Linking", "Push Notifications"],
  },
  {
    id: "devops",
    index: "11",
    label: "DevOps",
    skills: ["Docker", "Linux", "Bash / CMD", "PowerShell", "Networking", "Render", "Vercel", "Netlify", "GitHub Actions", "Linode"],
  },
  {
    id: "ai",
    index: "12",
    label: "AI & Tools",
    skills: ["Claude", "ChatGPT", "Grok", "Lovable", "Replit", "GitHub Copilot", "Google Colab", "Kaggle", "HuggingFace", "RAG", "Prompting", "Vibe Coding"],
  },
];

export const MARQUEE_SKILLS = [
  "Python",
  "SQL",
  "PySpark",
  "Databricks",
  "Apache Kafka",
  "Apache Spark",
  "Azure",
  "Delta Lake",
  "Docker",
  "ETL Pipelines",
  "Streaming",
  "PostgreSQL",
];

export type ProjectStatus = "live" | "wip" | "coming-soon";

export interface Project {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  tag: string;
  status: ProjectStatus;
  url: string | null;
  repo: string | null;
  image: string;
  tech: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    number: "01",
    title: "Azure E-Commerce Pipeline",
    subtitle: "Azure Data Engineering Pipeline",
    summary:
      "End-to-end Azure ETL pipeline to ingest, process, transform and store e-commerce customer, product and order data — organized with a Bronze–Silver–Gold architecture for scalable analytics.",
    tag: "Data Engineering",
    status: "live",
    url: "https://9929-90.github.io/E-commerce-Analytics-Pipeline/",
    repo: "https://github.com/9929-90/E-commerce-Analytics-Pipeline",
    image: "/portfolio/databricks.png",
    tech: ["Azure Data Factory", "Azure Blob Storage", "Databricks", "PySpark", "SQL", "Delta Lake"],
  },
  {
    id: 2,
    number: "02",
    title: "UPI Transaction Monitor",
    subtitle: "Real-Time Streaming Analytics Pipeline",
    summary:
      "Kafka + PySpark Structured Streaming pipeline that validates, routes and monitors UPI-style payment events in real time — quarantine paths, high-value routing, velocity detection with event-time sliding windows and a live metrics dashboard.",
    tag: "Data Engineering",
    status: "wip",
    url: null,
    repo: "https://github.com/9929-90/UPI-Transactions-Monitor",
    image: "/portfolio/upi-monitor.png",
    tech: ["Apache Kafka", "PySpark", "Structured Streaming", "Python", "Parquet", "Docker", "pytest"],
  },
  {
    id: 3,
    number: "03",
    title: "AapnoKaam",
    subtitle: "Local Skilled Workers Marketplace",
    summary:
      "Full-stack service marketplace connecting consumers with local skilled workers — real-time chat, payments and role-based dashboards.",
    tag: "Java Full-Stack",
    status: "live",
    url: "https://aapnokaam.netlify.app",
    repo: null,
    image: "/portfolio/aapnokaam.png",
    tech: ["Java 17", "Spring Boot 3", "React", "Vite", "PostgreSQL", "WebSocket", "Razorpay", "JWT"],
  },
  {
    id: 4,
    number: "04",
    title: "SQLPilot",
    subtitle: "AI SQL Query Generator",
    summary:
      "AI-powered platform that converts natural language into SQL queries with execution support — schema-aware prompting, Redis caching and secure multi-user sessions.",
    tag: "AI Full-Stack",
    status: "live",
    url: "https://sqlpilott.netlify.app",
    repo: null,
    image: "/portfolio/sqlpilot.png",
    tech: ["Java 21", "Spring Boot 3.4.5", "React 18", "Vite", "PostgreSQL", "Redis", "Gemini AI", "Docker", "JWT"],
  },
  {
    id: 5,
    number: "05",
    title: "OpsSafe",
    subtitle: "AI Automation Monitoring SaaS",
    summary:
      "Real-time monitoring platform for n8n workflows, APIs and automation scripts — with metrics, alerting and subscription billing built in.",
    tag: "Full Stack",
    status: "coming-soon",
    url: null,
    repo: null,
    image: "/portfolio/opssafe.png",
    tech: ["React.js", "Java 21", "Spring Boot", "PostgreSQL", "Spring Security", "JWT", "Stripe", "Prometheus", "Flyway"],
  },
  {
    id: 6,
    number: "06",
    title: "Blog Publishing Platform",
    subtitle: "Blog Publishing Platform",
    summary:
      "Blog platform with admin and user roles — publishing workflow, rich content management and a motion-rich reading experience.",
    tag: "Full-Stack",
    status: "live",
    url: "https://rohitsfoundation.netlify.app",
    repo: null,
    image: "/portfolio/rohitsfoundation.png",
    tech: ["React", "Spring Boot", "Tailwind CSS", "Framer Motion", "Java"],
  },
  {
    id: 7,
    number: "07",
    title: "DeepVision AI",
    subtitle: "AI-Powered Surveillance Platform",
    summary:
      "Production-grade real-time computer vision platform for object detection, tracking and intelligent alerting — GPU-accelerated inference with observability baked in.",
    tag: "AI / CV",
    status: "wip",
    url: null,
    repo: null,
    image: "/portfolio/deepvision.png",
    tech: ["Python", "FastAPI", "YOLOv8", "PostgreSQL", "Redis", "Docker", "CUDA", "Prometheus", "Grafana"],
  },
  {
    id: 8,
    number: "08",
    title: "Pinora",
    subtitle: "Secure Credentials Vault App",
    summary:
      "Secure credential manager with JWT authentication and vault-based password protection — cross-platform mobile app with a hardened API layer.",
    tag: "Full Stack / Security",
    status: "live",
    url: "https://pinorabyrohit.netlify.app/",
    repo: null,
    image: "/portfolio/pinora.png",
    tech: ["Spring Boot", "React Native", "Expo", "JWT", "REST APIs", "PostgreSQL"],
  },
];

export interface Insight {
  title: string;
  tag: string;
  readTime: string;
}

export const INSIGHTS: Insight[] = [
  { title: "Why System Design Still Humbles Me", tag: "Architecture", readTime: "4 min read" },
  { title: "Prompting Is a Skill, Not a Trick", tag: "AI / Prompting", readTime: "3 min read" },
  { title: "CPU, GPU, TPU, NPU — What Actually Matters", tag: "Hardware / ML", readTime: "5 min read" },
  { title: 'What "Full-Stack" Actually Means in 2025', tag: "Full-Stack", readTime: "4 min read" },
  { title: "FAANG Interviews Are a Game — Learn the Rules", tag: "Career", readTime: "5 min read" },
  { title: "Vibe Coding Will Break Your Production", tag: "Dev Culture", readTime: "3 min read" },
  { title: "Vibe Coding Is Real — And It's Changing Engineering", tag: "AI / Software", readTime: "6 min read" },
  { title: "Why Every Startup Suddenly Wants Microservices", tag: "Cloud / Backend", readTime: "5 min read" },
  { title: "The Scariest Hacker Isn't Breaking In Anymore", tag: "Cybersecurity", readTime: "6 min read" },
  { title: "Why AI Companies Are Obsessed With Energy Now", tag: "AI / Hardware", readTime: "5 min read" },
  { title: "People Don't Want More Features Anymore", tag: "Frontend / UX", readTime: "4 min read" },
  { title: "The Real Race in Tech Isn't AI vs Humans", tag: "Future Tech", readTime: "6 min read" },
];

export const NAV_LINKS = [
  { label: "Work", href: "#work", index: "01" },
  { label: "About", href: "#about", index: "02" },
  { label: "Journey", href: "#journey", index: "03" },
  { label: "Skills", href: "#skills", index: "04" },
  { label: "Insights", href: "#insights", index: "05" },
  { label: "Contact", href: "#contact", index: "06" },
] as const;
