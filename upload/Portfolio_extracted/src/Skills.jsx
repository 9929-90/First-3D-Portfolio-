import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const DEV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const CATEGORIES = [
  {
    id: 'languages',
    label: 'Languages',
    index: '01',
    skills: [
      { name: 'Python', logo: `${DEV}/python/python-original.svg` },
      { name: 'SQL' },
      { name: 'Java',   logo: `${DEV}/java/java-original.svg` },
    ],
  },
  {
    id: 'dataeng',
    label: 'Data Eng.',
    index: '02',
    skills: [
      { name: 'ETL / ELT' },
      { name: 'Data Cleaning' },
      { name: 'Transformation' },
      { name: 'Validation' },
      { name: 'Data Pipelines' },
      { name: 'Streaming Pipelines' },
    ],
  },
  {
    id: 'bigdata',
    label: 'Big Data',
    index: '03',
    skills: [
      { name: 'PySpark',      logo: `${DEV}/apachespark/apachespark-original.svg` },
      { name: 'Apache Spark', logo: `${DEV}/apachespark/apachespark-original.svg` },
      { name: 'Databricks',   logo: `${DEV}/databricks/databricks-original.svg` },
      { name: 'Spark Streaming', logo: `${DEV}/apachespark/apachespark-original.svg` },
      { name: 'Apache Kafka',    logo: `${DEV}/apachekafka/apachekafka-original.svg` },
      { name: 'Delta Lake' },
      { name: 'Parquet' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud',
    index: '04',
    skills: [
      { name: 'Azure Data Factory', logo: `${DEV}/azure/azure-original.svg` },
      { name: 'Azure Blob Storage', logo: `${DEV}/azure/azure-original.svg` },
      { name: 'Azure SQL',          logo: `${DEV}/azure/azure-original.svg` },
      { name: 'AWS Basics',         logo: `${DEV}/amazonwebservices/amazonwebservices-original-wordmark.svg` },
    ],
  },
  {
    id: 'dbtools',
    label: 'DB & Tools',
    index: '05',
    skills: [
      { name: 'PostgreSQL', logo: `${DEV}/postgresql/postgresql-original.svg` },
      { name: 'MySQL',      logo: `${DEV}/mysql/mysql-original.svg` },
      { name: 'DuckDB',     logo: 'https://cdn.simpleicons.org/duckdb/FFF000' },
      { name: 'Git',        logo: `${DEV}/git/git-original.svg` },
      { name: 'GitHub',     logo: `${DEV}/github/github-original.svg` },
      { name: 'Docker',     logo: `${DEV}/docker/docker-original.svg` },
      { name: 'pytest',     logo: `${DEV}/pytest/pytest-original.svg` },
      { name: 'Excel / CSV' },
    ],
  },
  {
    id: 'concepts',
    label: 'Concepts',
    index: '06',
    skills: [
      { name: 'DBMS' },
      { name: 'Joins' },
      { name: 'CTEs' },
      { name: 'Aggregations' },
      { name: 'Window Functions' },
      { name: 'Partitioning' },
      { name: 'Event-Time Windows' },
      { name: 'Watermarking' },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    index: '07',
    skills: [
      { name: 'HTML5',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
      { name: 'CSS3',          logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
      { name: 'JavaScript',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
      { name: 'React.js',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
      { name: 'Next.js',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
      { name: 'Angular',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg' },
      { name: 'Tailwind CSS',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
      { name: 'Material UI',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/materialui/materialui-original.svg' },
      { name: 'Framer Motion', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    index: '08',
    skills: [
      { name: 'Java',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
      { name: 'Spring Boot', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg' },
      { name: 'Hibernate',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hibernate/hibernate-original.svg' },
      { name: 'JDBC',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
      { name: 'Python',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
      { name: 'NestJS',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg' },
      { name: 'FastAPI',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
      { name: 'REST APIs',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg' },
      { name: 'JWT',         logo: 'https://cdn.worldvectorlogo.com/logos/jwt-3.svg' },
      { name: 'OAuth2',      logo: 'https://oauth.net/images/oauth-logo-square.png' },
      { name: 'API Keys' },
      { name: 'Maven',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/maven/maven-original.svg' },
      { name: 'Gradle',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gradle/gradle-original.svg' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    index: '09',
    skills: [
      { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
      { name: 'MySQL',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
      { name: 'NeonDB',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
      { name: 'Firebase',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg' },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    index: '10',
    skills: [
      { name: 'React Native', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
      { name: 'Expo',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/expo/expo-original.svg' },
      { name: 'Android',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg' },
      { name: 'APK Builds',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-plain.svg' },
      { name: 'Deep Linking' },
      { name: 'Push Notif.',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg' },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps',
    index: '11',
    skills: [
      { name: 'Docker',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
      { name: 'Linux',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' },
      { name: 'Bash / CMD',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg' },
      { name: 'PowerShell',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/powershell/powershell-original.svg' },
      { name: 'Networking' },
      { name: 'Render',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/render/render-original.svg' },
      { name: 'Vercel',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg' },
      { name: 'Netlify',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/netlify/netlify-original.svg' },
      { name: 'GitHub Actions', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg' },
      { name: 'Linode',     logo: 'https://cdn.simpleicons.org/linode/00A95C' },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Tools',
    index: '12',
    skills: [
      { name: 'Claude',         logo: 'https://mintlify.s3.us-west-1.amazonaws.com/anthropic/_generated/favicon/apple-touch-icon.png?v=3' },
      { name: 'ChatGPT',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/openai/openai-original.svg' },
      { name: 'Grok' },
      { name: 'Lovable' },
      { name: 'Replit',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/replit/replit-original.svg' },
      { name: 'GitHub Copilot', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
      { name: 'Git',            logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
      { name: 'GitHub',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
      { name: 'Google Colab',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg' },
      { name: 'Kaggle',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kaggle/kaggle-original.svg' },
      { name: 'HuggingFace' },
      { name: 'RAG' },
      { name: 'Prompting' },
      { name: 'Vibe Coding' },
      { name: 'Firebase',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg' },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Logos that are black/dark by default – inverted so they show on the black background
const INVERT = new Set(['GitHub', 'GitHub Copilot', 'Next.js', 'Vercel', 'Expo', 'Apache Kafka', 'ChatGPT']);

// Skills that have no brand logo get a neutral line glyph instead
const GLYPH_BY_NAME = {
  'SQL': 'database', 'Delta Lake': 'layers', 'Parquet': 'layers',
  'Excel / CSV': 'table', 'Streaming Pipelines': 'flow',
  'RAG': 'search', 'API Keys': 'key', 'DuckDB': 'database', 'Linode': 'cloud', 'GitHub Actions': 'flow',
};
const GLYPH_BY_CATEGORY = {
  languages: 'code', dataeng: 'flow', bigdata: 'layers', cloud: 'cloud', dbtools: 'terminal',
  concepts: 'grid', frontend: 'code', backend: 'server', database: 'database',
  mobile: 'phone', devops: 'terminal', ai: 'spark',
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// One flat, de-duplicated list (a skill that appears in several categories shows once)
const ALL_SKILLS = (() => {
  const map = new Map();
  CATEGORIES.forEach((cat) => {
    cat.skills.forEach((sk) => {
      const key = norm(sk.name);
      if (!map.has(key)) {
        map.set(key, { ...sk, glyph: GLYPH_BY_NAME[sk.name] || GLYPH_BY_CATEGORY[cat.id], tags: [cat.label] });
      } else {
        const ex = map.get(key);
        ex.tags.push(cat.label);
        if (!ex.logo && sk.logo) ex.logo = sk.logo;
      }
    });
  });
  return [...map.values()].map((s) => ({ ...s, haystack: [s.name, ...s.tags].map(norm) }));
})();

// ─── ICONS ────────────────────────────────────────────────────────────────────

const GLYPHS = {
  code:     <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  flow:     <><circle cx="5" cy="12" r="2.4" /><circle cx="19" cy="6" r="2.4" /><circle cx="19" cy="18" r="2.4" /><path d="M7.4 12H11M11 12L16.9 7.1M11 12L16.9 16.9" /></>,
  layers:   <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  cloud:    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
  terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>,
  grid:     <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  table:    <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></>,
  server:   <><rect x="2" y="3" width="20" height="8" rx="2" /><rect x="2" y="13" width="20" height="8" rx="2" /><line x1="6" y1="7" x2="6.01" y2="7" /><line x1="6" y1="17" x2="6.01" y2="17" /></>,
  phone:    <><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>,
  spark:    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  search:   <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  key:      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />,
};

const ICON_SIZE = 44;

const SkillIcon = ({ skill }) => {
  const [failed, setFailed] = useState(false);

  if (skill.logo && !failed) {
    return (
      <img
        src={skill.logo}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ objectFit: 'contain', display: 'block', filter: INVERT.has(skill.name) ? 'invert(1)' : 'none' }}
      />
    );
  }
  return (
    <svg
      width={ICON_SIZE} height={ICON_SIZE} viewBox="-6 -6 36 36" fill="none"
      stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      {GLYPHS[skill.glyph] || GLYPHS.grid}
    </svg>
  );
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── SKILL ITEM ───────────────────────────────────────────────────────────────

const SkillItem = ({ skill, index, isMobile }) => (
  <div
    className="skill-item"
    style={{ animationDelay: `${Math.min(index * 14, 420)}ms` }}
  >
    <div className="skill-icon" style={{ width: ICON_SIZE, height: ICON_SIZE }}>
      <SkillIcon skill={skill} />
    </div>
    <span
      className="skill-name"
      style={{ fontSize: isMobile ? '11.5px' : '12.5px' }}
    >
      {skill.name}
    </span>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Skills = () => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setVisible(true);
    // focus search on desktop only (avoids popping the keyboard on phones)
    if (window.innerWidth >= 768) inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return ALL_SKILLS;
    return ALL_SKILLS.filter((s) => s.haystack.some((h) => h.includes(q)));
  }, [query]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: "'Open Sans', sans-serif",
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Helmet>
        <title>Skills | Rohit Suthar</title>
        <meta name="description" content="Technical skills of Rohit Suthar, fresher data engineer — Python, SQL, PySpark, Kafka, Spark Structured Streaming, Databricks, ETL pipelines, Azure and more." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #000; overflow: hidden; }
        ::selection { background: rgba(255,51,51,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .search-wrap {
          display: flex; align-items: center; gap: 12px;
          width: 100%; max-width: 520px;
          padding: 10px 2px;
          border-bottom: 1px solid rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.45);
          transition: border-color 0.2s, color 0.2s;
        }
        .search-wrap:focus-within { border-bottom-color: #ff3333; color: #ff3333; }
        .search-input {
          flex: 1; min-width: 0;
          background: transparent; border: none; outline: none;
          color: #fff; font-family: 'Open Sans', sans-serif; font-weight: 300;
          letter-spacing: 0.04em;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.35); }
        .search-clear {
          background: none; border: none; cursor: pointer; padding: 2px 4px;
          color: rgba(255,255,255,0.5); font-size: 18px; line-height: 1;
          font-family: 'Open Sans', sans-serif; transition: color 0.2s;
        }
        .search-clear:hover { color: #fff; }

        .skill-item {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 6px 4px; text-align: center; cursor: default;
          animation: fade-up 0.45s ease both;
        }
        .skill-icon { display: flex; align-items: center; justify-content: center; transition: transform 0.25s ease; }
        .skill-item:hover .skill-icon { transform: translateY(-4px) scale(1.06); }
        .skill-name {
          font-family: 'Open Sans', sans-serif; font-weight: 500; line-height: 1.35;
          color: rgba(255,255,255,0.78); transition: color 0.2s;
          text-wrap: balance;
        }
        .skill-item:hover .skill-name { color: #fff; }
      `}</style>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isMobile ? '100%' : '1060px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '18px 16px 0' : '36px 32px 0',
        minHeight: 0,
      }}>

        {/* Back link */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            marginBottom: isMobile ? '20px' : '28px',
            color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 400,
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </a>

        {/* Page header */}
        <div style={{
          marginBottom: isMobile ? '22px' : '28px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          flexShrink: 0,
        }}>
          <h1 style={{
            fontSize: isMobile ? 'clamp(26px, 10vw, 42px)' : 'clamp(32px, 4.5vw, 54px)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            margin: 0,
            color: '#fff',
          }}>
            Skills &amp; <span style={{ color: '#ff3333' }}>technologies</span>
          </h1>
          <div style={{ marginTop: '14px', width: '30px', height: '1px', background: '#ff3333' }} />
        </div>

        {/* Search */}
        <div style={{
          flexShrink: 0,
          marginBottom: isMobile ? '22px' : '30px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}>
          <div className="search-wrap">
            <SearchIcon />
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setQuery(''); }}
              placeholder="Search skills — e.g. Spark, Kafka, SQL"
              aria-label="Search skills"
              autoComplete="off"
              spellCheck={false}
              style={{ fontSize: isMobile ? '16px' : '14px' }}
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {filtered.length} {filtered.length === 1 ? 'skill' : 'skills'}{query ? ' found' : ''}
          </div>
        </div>

        {/* Skills grid — scrolls inside its own area */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingBottom: isMobile ? '28px' : '40px',
          paddingRight: '4px',
        }}>
          {filtered.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 124}px, 1fr))`,
              columnGap: isMobile ? '8px' : '16px',
              rowGap: isMobile ? '22px' : '30px',
            }}>
              {filtered.map((skill, i) => (
                <SkillItem key={skill.name} skill={skill} index={i} isMobile={isMobile} />
              ))}
            </div>
          ) : (
            <div style={{
              paddingTop: '48px', textAlign: 'center',
              fontWeight: 300, fontSize: '14px', letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.45)',
            }}>
              No skills match “{query}”.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Skills;