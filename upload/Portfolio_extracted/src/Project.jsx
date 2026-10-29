import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const projects = [
  {
    id: 7,
    number: '01',
    status: 'live',
    title: 'Azure E-Commerce Pipeline',
    subtitle: 'Azure Data Engineering Pipeline',
    summary: 'End-to-end Azure ETL pipeline for e-commerce customer, product and order data',
    description:
      'Built an end-to-end Azure ETL pipeline to ingest, process, transform, and store e-commerce customer, product, and order data. Uses a Bronze-Silver-Gold architecture on Azure Blob Storage, Data Factory, and Databricks for organized, scalable processing.',
    url: 'https://9929-90.github.io/E-commerce-Analytics-Pipeline/',
    repo: 'https://github.com/9929-90/E-commerce-Analytics-Pipeline',
    image: '/databricks.png',
    tech: ['Azure Data Factory', 'Azure Blob Storage', 'Databricks', 'PySpark', 'SQL', 'Delta Lake'],
    highlights: [
      'Bronze-Silver-Gold architecture on Azure Blob Storage',
      'Azure Data Factory pipelines orchestrating ingestion and transformation stages',
      'PySpark joins, aggregations and window functions',
      'Data cleaning and validation for reliable datasets',
      'Optimized Delta Lake Gold tables for customer, product and sales analytics',
      'SQL + PySpark business-ready datasets and metrics',
      'Customer, product and order data processed end to end',
      'Live analytics dashboard',
    ],
    tag: 'Data Engineering',
  },
  {
    id: 8,
    number: '02',
    status: 'wip',
    title: 'UPI Transaction Monitor',
    subtitle: 'Real-Time Streaming Analytics Pipeline',
    summary: 'Kafka + Spark Structured Streaming pipeline that validates, routes and monitors UPI-style payment events in real time',
    description:
      'Built a real-time streaming data pipeline that ingests synthetic UPI transaction events through Apache Kafka and processes them continuously with PySpark Structured Streaming. Validates every record, quarantines invalid data, flags high-value transactions and detects repeated user activity with event-time sliding windows, with live metrics served to an HTML dashboard.',
    url: null,
    repo: 'https://github.com/9929-90/UPI-Transactions-Monitor',
    image: '/upi-monitor.png', // place your screenshot at public/upi-monitor.png
    tech: ['Apache Kafka', 'PySpark', 'Structured Streaming', 'Python', 'Parquet', 'Docker', 'pytest', 'HTML / JavaScript'],
    highlights: [
      'Kafka ingestion (3-partition topic, Dockerized broker)',
      'PySpark Structured Streaming micro-batch processing',
      'Validation layer with quarantine path for invalid records',
      'High-value transaction routing (INR 50,000+ threshold)',
      'Velocity detection with 1-min / 10-sec event-time sliding windows',
      'Watermarking and checkpointed state for reliable recovery',
      'Parquet outputs for normal, flagged and quarantined data',
      'Local API + live HTML dashboard, 32 automated pytest tests',
    ],
    tag: 'Data Engineering',
  },
  {
    id: 1,
    number: '03',
    status: 'live',
    title: 'AapnoKaam',
    subtitle: 'Local Skilled Workers Marketplace',
    summary: 'Full-stack service marketplace connecting consumers with local workers',
    description:
      'Built and deployed a full-stack service marketplace connecting consumers with local workers (plumbers, electricians, carpenters) using Java 17, Spring Boot 3, React (Vite), and PostgreSQL.',
    url: 'https://aapnokaam.netlify.app',
    image: '/aapnokaam.png', // place your screenshot at public/images/aapnokaam.png
    tech: ['Java 17', 'Spring Boot 3', 'React', 'Vite', 'PostgreSQL', 'WebSocket', 'Razorpay', 'JWT'],
    highlights: [
      'JWT + Spring Security & Google OAuth2',
      'Booking lifecycle state machine',
      'Haversine location-based worker search',
      'Real-time chat via WebSocket (STOMP)',
      'Razorpay payment + HMAC verification',
      'Admin dashboard & worker approval flow',
      'Email notifications & file uploads',
      'Reviews, ratings & admin panel',
    ],
    tag: 'Java Full-Stack',
  },
  {
    id: 2,
    number: '04',
    status: 'live',
    title: 'SQLPilot',
    subtitle: 'AI SQL Query Generator',
    summary: 'AI-powered platform that converts natural language into SQL queries with execution support',
    description:
      'Built and deployed a full-stack AI SQL query generation platform using Spring Boot 3.4.5 (Java 21), React 18 (Vite), PostgreSQL (Neon), and Redis. Deployed via Docker → GitHub → Render (backend) + Netlify (frontend).',
    url: 'https://sqlpilott.netlify.app',
    image: '/sqlpilot.png',
    tech: ['Java 21', 'Spring Boot 3.4.5', 'React 18', 'Vite', 'PostgreSQL', 'Redis', 'Gemini AI', 'Docker', 'JWT'],
    highlights: [
      'JWT auth with BCrypt & role-based access (USER / ADMIN)',
      'Project & DB schema management with JSON upload',
      'Visual table preview for uploaded schemas',
      'Natural language → Gemini AI → SQL with explanation',
      'Auto LIMIT 100 & blocks destructive queries',
      'Execute SQL against connected DB with table results',
      'Paginated query history with expandable SQL view',
      'Admin dashboard with area/bar/pie charts & user management',
    ],
    tag: 'AI Full-Stack',
  },
  {
    id: 3,
    number: '05',
    status: 'coming-soon',
    title: 'OpsSafe',
    subtitle: 'AI Automation Monitoring SaaS',
    summary: 'Real-time monitoring platform for n8n workflows, APIs, and automation scripts',
    description:
      'Designed and developed a full-stack SaaS platform that monitors automation workflows in real time — detecting failures, delays, missed runs, and data issues before they impact the business. Built with Java 21, Spring Boot 3.3, PostgreSQL, and React.js.',
    url: '',
    image: '/opssafe.png',
    tech: ['React.js', 'Java 21', 'Spring Boot', 'PostgreSQL', 'Spring Security', 'JWT', 'Stripe', 'Micrometer', 'Prometheus', 'Flyway', 'Caffeine', 'ShedLock', 'WebFlux', 'Hibernate'],
    highlights: [
      'Custom Rule Engine — TIME / STATUS / DATA conditions with JSONPath extractor',
      'Distributed SLA detection via ShedLock (cluster-safe scheduled jobs)',
      'Dual auth: JWT for users + API Key filter for n8n webhook integrations',
      'Async alert dispatch with bounded ThreadPoolTaskExecutor',
      'Observability stack — Spring Actuator + Micrometer + Prometheus metrics',
      'Multi-tenant org model with RBAC, invite flows, and audit logs',
      'Stripe billing integration with webhook signature verification',
      'JSONB output validation via Hypersistence Utils + Hibernate 6',
    ],
    tag: 'Full Stack',
  },
  {
    id: 4,
    number: '06',
    status: 'live',
    title: "Rohit's Foundation",
    subtitle: 'Blog Publishing Platform',
    summary: 'Blog platform with admin and user roles',
    description:
      'A blog posting platform with distinct admin and user roles, built using React, Java Spring Boot, Tailwind CSS, and Framer Motion.',
    url: 'https://rohitsfoundation.netlify.app',
    image: '/rohitsfoundation.png',
    tech: ['React', 'Spring Boot', 'Tailwind CSS', 'Framer Motion', 'Java'],
    highlights: [
      'Role-based access (Admin & User)',
      'Blog post creation & management',
      'Rich content editor',
      'Framer Motion page transitions',
      'Responsive design',
      'Admin content moderation',
    ],
    tag: 'Full-Stack',
  },
  {
    id: 5,
    number: '07',
    status: 'wip',
    title: 'DeepVision AI',
    subtitle: 'AI-Powered Surveillance Platform',
    summary: 'Production-grade real-time computer vision platform for object detection, tracking, and intelligent alerting',
    description:
      'Built a production-grade real-time computer vision surveillance system using Python, FastAPI, YOLOv8, and PostgreSQL. Supports up to 16 concurrent RTSP/webcam streams with persistent object tracking, configurable alert zones, and a full REST API.',
    url: null,
    image: '/images/deepvision.png',
    tech: ['Python', 'FastAPI', 'YOLOv8', 'PostgreSQL', 'Redis', 'Docker', 'CUDA', 'Prometheus', 'Grafana', 'SQLAlchemy'],
    highlights: [
      'Up to 16 concurrent RTSP / webcam streams',
      'YOLOv8 object detection — 80 classes',
      'SORT tracking with Kalman filter + Hungarian algorithm',
      'Intrusion zones, people counting & loitering detection',
      'Email (SMTP) + Webhook alerts with retry & cooldown',
      'FastAPI async REST API with OpenAPI docs',
      'Server-Sent Events + MJPEG live debug streams',
      'Redis pub/sub result caching & rate-limiting',
    ],
    tag: 'AI / CV',
  },
  {
    id: 6,
    number: '08',
    status: 'live',
    title: 'Pinora',
    subtitle: 'Secure Credentials Vault App',
    summary: 'Secure credential manager with JWT authentication and vault-based password protection',
    description:
      'Built a full-stack secure credentials vault application using Spring Boot and React Native (Expo). The system implements JWT-based authentication with a vault PIN layer for protected access to stored passwords.',
    url: 'https://pinorabyrohit.netlify.app/',
    image: '/pinora.png',
    tech: ['Spring Boot', 'React Native', 'Expo', 'JWT', 'REST APIs', 'PostgreSQL'],
    highlights: [
      'JWT-based authentication system for secure user sessions',
      'Vault PIN protection layer for sensitive credential access',
      'Store and manage credentials with custom labels',
      'Secure retrieval flow: Enter vault PIN → decrypt and access data',
      'One-click copy functionality for passwords',
      'RESTful backend APIs built with Spring Boot',
      'Cross-platform mobile app built using React Native (Expo)',
      'Optimised UX flow for fast credential retrieval',
    ],
    tag: 'Full Stack / Security',
  },
];

const statusConfig = {
  live:          { label: 'Live',         color: '#4ade80' },
  wip:           { label: 'Not Deployed', color: '#fbbf24' },
  'coming-soon': { label: 'Coming Soon',  color: '#60a5fa' },
};

// ─── RIGHT PANEL — IMAGE PREVIEW ──────────────────────────────────────────────

const RightPanel = ({ project }) => {
  const st = statusConfig[project.status] || { label: 'Unknown', color: '#888' };
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.024)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '350px',
        position: 'relative',
      }}
    >
      {/* Watermark number */}
      <div style={{
        position: 'absolute',
        top: '-0.5rem',
        right: '1rem',
        fontSize: '8rem',
        fontWeight: 800,
        fontFamily: "'Open Sans', sans-serif",
        color: 'rgba(255,255,255,0.03)',
        lineHeight: 1,
        userSelect: 'none',
        letterSpacing: '-0.05em',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        {project.number}
      </div>

      {/* Image area */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        background: '#111',
        flexShrink: 0,
      }}>
        {!imgError ? (
          <img
            src={project.image}
            alt={`${project.title} screenshot`}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block',
              transition: 'transform 0.6s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          /* Fallback placeholder when image not found */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
              opacity: 0.15,
            }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{
                  width: '3px', height: '3px', borderRadius: '50%', background: '#fff',
                }} />
              ))}
            </div>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              {project.title}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom of image */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,0.9))',
          pointerEvents: 'none',
        }} />

        {/* Status badge over image */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.68rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          color: st.color,
          background: 'rgba(10,10,10,0.8)',
          border: `1px solid ${st.color}44`,
          padding: '4px 10px',
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: st.color, boxShadow: `0 0 6px ${st.color}`,
          }} />
          {st.label}
        </div>

        {/* Tag badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          color: '#888',
          background: 'rgba(10,10,10,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '4px 10px',
          backdropFilter: 'blur(4px)',
        }}>
          {project.tag}
        </div>
      </div>

      {/* Bottom info strip */}
      <div style={{
        padding: '1.25rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flex: 1,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Title + subtitle */}
        <div>
          <h3 style={{
            margin: '0 0 0.25rem',
            fontSize: '1.1rem',
            fontWeight: 400,
            color: '#fff',
            fontFamily: "'Open Sans', sans-serif",
            letterSpacing: '-0.01em',
          }}>
            {project.title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#555',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
          }}>
            {project.subtitle}
          </p>
        </div>

        {/* Visit link */}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.2rem',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              transition: 'border-color 0.2s, background 0.2s',
              alignSelf: 'flex-start',
              marginTop: 'auto',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ff3333';
              e.currentTarget.style.background = 'rgba(255,51,51,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            
          </a>
        )}
      </div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Projects() {
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const hasSelection = selected !== null;
  const activeProject = hasSelection ? projects[selected] : null;

  const toggle = (i) => setSelected(prev => (prev === i ? null : i));

  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: "'Open Sans', sans-serif",
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      <Helmet>
        <title>Projects | Rohit Suthar</title>
        <meta name="description" content="Explore projects built by Rohit Suthar — an Azure data engineering pipeline plus full-stack and AI applications." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        ::selection { background: rgba(255,51,51,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

        .proj-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.6rem 0;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 1rem;
          transition: border-color 0.3s;
        }
        .proj-title-row:hover .proj-title-text {
          color: #fff !important;
        }
        .proj-close-btn {
          width: 2.2rem; height: 2.2rem;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-size: 1.4rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          flex-shrink: 0;
          line-height: 1;
        }
        .proj-close-btn:hover {
          border-color: #ff3333;
          color: #ff3333;
          background: rgba(255,51,51,0.08);
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '1.5rem 1.25rem 4rem' : '2.5rem 3rem 5rem',
      }}>

        {/* Back */}
        <motion.a
          href="/"
          whileHover={{ x: -3 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '2rem',
            color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
            fontSize: '0.82rem', fontFamily: 'monospace', letterSpacing: '0.14em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
        >
          ← Back to Home
        </motion.a>

        {/* Notice banner */}
        <div style={{
          marginBottom: '2.5rem',
          padding: '0.85rem 1.1rem',
          background: 'rgba(251,191,36,0.05)',
          border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
        }}>
          <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
          <p style={{
            margin: 0, fontSize: '0.82rem', color: 'rgba(212,168,67,0.85)',
            fontFamily: "'Open Sans', sans-serif", lineHeight: 1.6,
          }}>
            <strong style={{ color: '#fbbf24' }}>Heads up!</strong> Backend servers on Render's free tier may take{' '}
            <strong style={{ color: '#fbbf24' }}>5–10 min to cold-start</strong> on first load. <strong style={{ color: '#fbbf24' }}>DeepVision AI</strong> is not deployed yet.
          </p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <div style={{
            fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase',
            color: '#555', fontFamily: 'monospace',
          }}>
            Selected Work — {String(projects.length).padStart(2, '0')} Projects
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{
          display: 'flex',
          gap: isMobile ? 0 : '4rem',
          alignItems: 'flex-start',
        }}>

          {/* LEFT: title list */}
          <div style={{ flex: isMobile ? '1' : '0 0 54%', minWidth: 0 }}>
            {projects.map((proj, i) => {
              const isActive  = selected === i;
              const isDimmed  = hasSelection && !isActive;
              const st        = statusConfig[proj.status] || { label: 'Unknown', color: '#888' };

              return (
                <div key={proj.id}>
                  {/* ── Title row ── */}
                  <div
                    className="proj-title-row"
                    onClick={() => toggle(i)}
                    style={{
                      opacity: isDimmed ? 0.07 : 1,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: isDimmed ? 'none' : 'auto',
                      borderBottomColor: isActive ? 'rgba(255,51,51,0.2)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'baseline',
                      gap: isMobile ? '0.85rem' : '1.25rem',
                      minWidth: 0,
                    }}>
                      {/* Number */}
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.72rem',
                        color: isActive ? '#ff3333' : '#444',
                        letterSpacing: '0.08em', flexShrink: 0,
                        transition: 'color 0.3s',
                      }}>
                        {proj.number}
                      </span>

                      {/* Title — reduced by 8px from original clamp values */}
                      <h2
                        className="proj-title-text"
                        style={{
                          margin: 0,
                          fontSize: isMobile
                            ? 'clamp(1.5rem, 7.5vw, 2.7rem)'   /* was clamp(2rem, 9vw, 3.2rem) */
                            : 'clamp(2.1rem, 3.6vw, 4.7rem)',   /* was clamp(2.6rem, 4.2vw, 5.2rem) */
                          fontWeight: 300,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.05,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.78)',
                          fontFamily: "'Open Sans', sans-serif",
                          transition: 'color 0.3s',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {proj.title}
                      </h2>

                      {/* Status badge — shown when active */}
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                            fontFamily: 'monospace', color: st.color,
                            border: `1px solid ${st.color}33`,
                            padding: '3px 9px',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: st.color, boxShadow: `0 0 6px ${st.color}`,
                          }} />
                          {st.label}
                        </motion.span>
                      )}
                    </div>

                    {/* Close (×) button */}
                    {isActive && (
                      <motion.button
                        className="proj-close-btn"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                      >
                        ×
                      </motion.button>
                    )}
                  </div>

                  {/* ── Expanded detail (below title) ── */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: isMobile ? '1.5rem 0 2rem 0' : '1.75rem 0 2.5rem 0',
                          display: 'flex', flexDirection: 'column', gap: '1.5rem',
                        }}>
                          {/* Subtitle + description */}
                          <div>
                            <p style={{
                              margin: '0 0 0.65rem',
                              fontFamily: 'monospace', fontSize: '0.85rem',
                              color: '#666', letterSpacing: '0.06em',
                            }}>
                              {proj.subtitle}
                            </p>
                            <p style={{
                              margin: 0, fontSize: '0.95rem',
                              color: 'rgba(255,255,255,0.62)', lineHeight: 1.78,
                              fontFamily: "'Open Sans', sans-serif",
                            }}>
                              {proj.description}
                            </p>
                          </div>

                          {/* Tech pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {proj.tech.map((t, idx) => (
                              <span key={idx} style={{
                                padding: '0.28rem 0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.75rem', fontFamily: 'monospace',
                                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em',
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Highlights grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: '0.5rem 1.5rem',
                          }}>
                            {proj.highlights.map((h, idx) => (
                              <div key={idx} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                                fontSize: '0.86rem', color: 'rgba(255,255,255,0.58)',
                                fontFamily: "'Open Sans', sans-serif", lineHeight: 1.55,
                              }}>
                                <span style={{ color: '#ff3333', marginTop: '2px', flexShrink: 0 }}>→</span>
                                {h}
                              </div>
                            ))}
                          </div>

                          {/* CTA row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                            {proj.url ? (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                  padding: '0.6rem 1.4rem',
                                  border: '1px solid rgba(255,255,255,0.22)',
                                  color: '#fff', textDecoration: 'none',
                                  fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.12em',
                                  transition: 'border-color 0.2s, background 0.2s',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = '#ff3333';
                                  e.currentTarget.style.background = 'rgba(255,51,51,0.08)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                ↗ Visit Project
                              </a>
                            ) : (
                              <span style={{
                                fontSize: '0.78rem', fontFamily: 'monospace',
                                color: '#555', letterSpacing: '0.1em',
                              }}>
                                Not deployed yet
                              </span>
                            )}

                            {proj.repo && (
                              <a
                                href={proj.repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                  padding: '0.6rem 1.4rem',
                                  border: '1px solid rgba(255,255,255,0.22)',
                                  color: '#fff', textDecoration: 'none',
                                  fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.12em',
                                  transition: 'border-color 0.2s, background 0.2s',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = '#ff3333';
                                  e.currentTarget.style.background = 'rgba(255,51,51,0.08)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                ↗ View Code
                              </a>
                            )}

                            {/* Prev / Next */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                              <button
                                onClick={() => setSelected((selected - 1 + projects.length) % projects.length)}
                                style={{
                                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.45)', padding: '0.45rem 0.9rem',
                                  fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '0.1em',
                                  cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              >
                                ← prev
                              </button>
                              <button
                                onClick={() => setSelected((selected + 1) % projects.length)}
                                style={{
                                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.45)', padding: '0.45rem 0.9rem',
                                  fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '0.1em',
                                  cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              >
                                next →
                              </button>
                            </div>
                          </div>

                          {/* Mobile: image panel inline */}
                          {isMobile && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <RightPanel project={proj} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* RIGHT: sticky image panel (desktop only) */}
          {!isMobile && (
            <div style={{
              flex: '0 0 38%',
              position: 'sticky',
              top: '2.5rem',
              alignSelf: 'flex-start',
            }}>
              <AnimatePresence mode="wait">
                {activeProject ? (
                  <RightPanel key={activeProject.id} project={activeProject} />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      width: '100%', minHeight: '420px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '1rem',
                    }}
                  >
                    {/* Dot grid placeholder */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: '14px',
                      opacity: 0.12,
                    }}>
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} style={{
                          width: '3px', height: '3px', borderRadius: '50%',
                          background: '#fff',
                        }} />
                      ))}
                    </div>
                    <p style={{
                      margin: 0, fontFamily: 'monospace', fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.2)', letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                    }}>
                      Select a project
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}