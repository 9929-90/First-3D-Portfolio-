import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stars, Float, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Helmet } from "react-helmet-async";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 22, delay: d },
  }),
};

// ===== CONTENT =====
const stackTags = ['Python', 'SQL', 'PySpark', 'Databricks', 'ETL'];

const tabs = [['story', 'Story'], ['exp', 'Experience'], ['edu', 'Education']];

const experience = [
  {
    role: 'AI/ML Engineer Intern',
    company: 'PAPASIDDHI Technologies',
    period: 'May 2026 – Sep 2026',
    place: 'Udaipur, Rajasthan',
    points: [
      'Built a voice-based conversational AI using Python, RAG and data pipelines.',
      'Handled data ingestion, cleaning, transformation and retrieval, with SQL for structured data.',
      'Explored PySpark and Databricks; improved data quality, pipeline reliability and response accuracy.',
    ],
  },
  {
    role: 'Web Support Executive',
    company: 'FBSPL',
    period: 'Jun 2025 – May 2026',
    place: 'Udaipur, Rajasthan',
    points: [
      'Managed production websites and monitored live performance.',
      'Cleaned and organized thousands of prospect records in CSV/Excel using Python.',
      'Built Python/AI automation for repetitive tasks; handled client queries and escalations.',
    ],
  },
];

const contactLinks = [
  { label: 'Email', href: 'mailto:rohitsuthar410@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/rohitsuthar09' },
  { label: 'GitHub', href: 'https://github.com/9929-90' },
];

const JavaModel = () => {
  const { scene } = useGLTF('/java.glb');
  const modelRef = useRef();
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);
  useFrame((state) => {
    if (modelRef.current) modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });
  return <primitive ref={modelRef} object={scene} scale={0.4} position={[0, -0.2, 0]} />;
};

const Tag = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '4px 10px',
    border: '1px solid rgba(255,255,255,0.22)', borderRadius: '2px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#ddd',
    fontFamily: "'Open Sans',sans-serif",
  }}>{children}</span>
);

const StatItem = ({ n, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: "'Open Sans',sans-serif", lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: '9px', fontWeight: 600, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Open Sans',sans-serif", marginTop: '4px' }}>{label}</div>
  </div>
);

const ContactLinks = ({ align = 'flex-start' }) => (
  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: align }}>
    {contactLinks.map(l => (
      <a key={l.label} href={l.href}
        target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#888', textDecoration: 'none', fontFamily: "'Open Sans',sans-serif", transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff3333'}
        onMouseLeave={e => e.currentTarget.style.color = '#888'}
      >{l.label}</a>
    ))}
  </div>
);

const TabButtons = ({ activeTab, setActiveTab, mobile }) => (
  <div style={{
    display: 'flex', gap: mobile ? '20px' : '16px',
    marginBottom: mobile ? '14px' : '12px',
    borderBottom: mobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
    paddingBottom: mobile ? 0 : '8px', flexWrap: 'wrap',
  }}>
    {tabs.map(([id, label]) => (
      <button key={id} onClick={() => setActiveTab(id)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 4px',
        fontSize: mobile ? '12px' : '11px', fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', fontFamily: "'Open Sans',sans-serif",
        color: activeTab === id ? '#fff' : '#555',
        borderBottom: activeTab === id ? '1px solid #ff3333' : '1px solid transparent',
        transition: 'color 0.2s',
      }}>{label}</button>
    ))}
  </div>
);

const TabContent = ({ activeTab, mobile }) => {
  const body = mobile ? '13px' : '12px';
  const small = mobile ? '12px' : '11px';
  const anim = {
    initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }, transition: { duration: 0.15 },
  };
  const sfx = mobile ? '-m' : '';

  return (
    <AnimatePresence mode="wait">
      {activeTab === 'story' && (
        <motion.p key={`story${sfx}`} {...anim}
          style={{ margin: 0, fontSize: body, color: '#ccc', lineHeight: 1.85, fontFamily: "'Open Sans',sans-serif" }}>
          <strong style={{ color: '#fff' }}>Fresher Data Engineer</strong> with hands-on experience in Python, SQL, PySpark, Databricks, ETL pipelines and data transformation, gained through AI/ML internship work and end-to-end data projects. Strong foundation in <strong style={{ color: '#fff' }}>SQL, DBMS, Apache Spark, Delta Lake</strong> and cloud data pipelines.
        </motion.p>
      )}

      {activeTab === 'exp' && (
        <motion.div key={`exp${sfx}`} {...anim}
          style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '16px' : '12px' }}>
          {experience.map((e, i) => (
            <div key={e.role} style={{ borderLeft: `2px solid ${i === 0 ? '#ff3333' : 'rgba(255,255,255,0.15)'}`, paddingLeft: mobile ? '12px' : '10px' }}>
              <div style={{ fontSize: mobile ? '14px' : '12px', fontWeight: 700, color: '#fff', fontFamily: "'Open Sans',sans-serif" }}>{e.role}</div>
              <div style={{ fontSize: small, color: '#aaa', fontFamily: "'Open Sans',sans-serif", marginTop: '2px' }}>{e.company} · {e.place}</div>
              <div style={{ fontSize: '10px', color: '#ff3333', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Open Sans',sans-serif", marginTop: '3px', fontWeight: 600 }}>{e.period}</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: '14px', color: '#bbb', fontSize: small, lineHeight: 1.6, fontFamily: "'Open Sans',sans-serif" }}>
                {e.points.map(p => <li key={p} style={{ marginBottom: '2px' }}>{p}</li>)}
              </ul>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'edu' && (
        <motion.div key={`edu${sfx}`} {...anim}
          style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '12px' : '10px' }}>
          <div style={{ borderLeft: '2px solid #ff3333', paddingLeft: mobile ? '12px' : '10px' }}>
            <div style={{ fontSize: mobile ? '14px' : '12px', fontWeight: 700, color: '#fff', fontFamily: "'Open Sans',sans-serif" }}>Mohanlal Sukhadia Univ.</div>
            <div style={{ fontSize: small, color: '#aaa', fontFamily: "'Open Sans',sans-serif", marginTop: '2px' }}>B.Sc. Computer Science · 60%</div>
            <div style={{ fontSize: '10px', color: '#ff3333', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Open Sans',sans-serif", marginTop: '3px', fontWeight: 600 }}>2022 – 2025</div>
          </div>
          <div style={{ borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: mobile ? '12px' : '10px' }}>
            <div style={{ fontSize: mobile ? '14px' : '12px', fontWeight: 700, color: '#fff', fontFamily: "'Open Sans',sans-serif" }}>The Stanvard Sr. Sec.</div>
            <div style={{ fontSize: small, color: '#aaa', fontFamily: "'Open Sans',sans-serif", marginTop: '2px' }}>Science &amp; Mathematics · 71%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const glass = {
  background: 'rgba(0,0,0,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: '3px',
};

const About = () => {
  const ref = useRef();
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const [activeTab, setActiveTab] = useState('story');

  return (
    <section ref={ref} style={{
      position: 'relative', width: '100vw',
      backgroundColor: '#000', color: '#fff',
      fontFamily: "'Open Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #000; margin: 0; padding: 0; }

        /* ── DESKTOP ── */
        .about-section-inner { height: 100vh; overflow: hidden; position: relative; }
        .about-canvas-wrap { position: absolute; inset: 0; z-index: 0; }

        .corner-tl { position: absolute; top: clamp(20px,3vw,38px); left: clamp(20px,3vw,38px); max-width: 240px; z-index: 10; }
        .corner-tr { position: absolute; top: clamp(20px,3vw,38px); right: clamp(20px,3vw,38px); max-width: 230px; z-index: 10; text-align: right; }
        .corner-bl { position: absolute; bottom: clamp(20px,3vw,38px); left: clamp(20px,3vw,38px); max-width: 340px; z-index: 10; }
        .corner-br { position: absolute; bottom: clamp(20px,3vw,38px); right: clamp(20px,3vw,38px); max-width: 250px; z-index: 10; }

        .mobile-stack { display: none; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .about-section-inner { height: auto !important; min-height: 0 !important; overflow: visible !important; }
          .about-canvas-wrap { display: none !important; }
          .corner-tl, .corner-tr, .corner-bl, .corner-br { display: none !important; }
          .mobile-stack {
            display: flex !important;
            flex-direction: column;
            position: relative;
            z-index: 10;
            padding: 20px 16px 36px;
          }
          .mob-sep { height: 1px; background: rgba(255,255,255,0.08); margin: 0; }
        }
      `}</style>

      <Helmet>
        <title>About | Rohit Suthar</title>
        <meta name="description" content="Rohit Suthar – fresher data engineer from Udaipur with experience in Python, SQL, PySpark, Databricks and ETL pipelines." />
      </Helmet>

      <div className="about-section-inner">

        {/* 3D Canvas */}
        <div className="about-canvas-wrap">
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
            style={{ background: 'transparent' }}>
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
              <ambientLight intensity={2.5} />
              <directionalLight position={[5, 5, 5]} intensity={3} />
              <directionalLight position={[-5, -5, -5]} intensity={1.5} />
              <pointLight position={[0, 5, 3]} intensity={4} color="#ffffff" />
              <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
                <JavaModel />
              </Float>
              <OrbitControls enableZoom={false} enablePan={false} />
              <Environment preset="dawn" />
              <Preload all />
            </Suspense>
          </Canvas>
        </div>

        {/* ── DESKTOP CORNERS ── */}

        {/* TOP-LEFT: Back + Name */}
        <motion.div className="corner-tl"
          custom={0} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#555', textDecoration: 'none', fontSize: '11px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: "'Open Sans',sans-serif", fontWeight: 600,
            transition: 'color 0.2s', marginBottom: '10px',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </a>
          <div style={{ ...glass, padding: '14px 18px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ff3333', marginBottom: '6px', fontWeight: 700, fontFamily: "'Open Sans',sans-serif" }}>About</div>
            <div style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: "'Open Sans',sans-serif" }}>
              Rohit <span style={{ color: '#ff3333' }}>Suthar</span>
            </div>
          </div>
        </motion.div>

        {/* TOP-RIGHT: Stack + location + contact */}
        <motion.div className="corner-tr"
          custom={0.1} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '9px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', fontFamily: "'Open Sans',sans-serif", fontWeight: 600 }}>Stack</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {stackTags.map(t => <Tag key={t}>{t}</Tag>)}
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontFamily: "'Open Sans',sans-serif", lineHeight: 1.7 }}>
              Udaipur, Rajasthan<br />
              <span style={{ color: '#ff3333', fontWeight: 700 }}>Data Engineer</span>
            </div>
            <ContactLinks align="flex-end" />
          </div>
        </motion.div>

        {/* BOTTOM-LEFT: Tabs */}
        <motion.div className="corner-bl"
          custom={0.2} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <div style={{ ...glass, padding: '14px 16px' }}>
            <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabContent activeTab={activeTab} />
          </div>
        </motion.div>

        {/* BOTTOM-RIGHT: Stats + CTAs */}
        <motion.div className="corner-br"
          custom={0.3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <div style={{ ...glass, padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '8px' }}>
            <StatItem n="1+" label="Yrs" />
            <StatItem n="2" label="Roles" />
            <StatItem n="2025" label="Grad" />
            <StatItem n="Data" label="Focus" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/projects" style={{
              flex: 1, textAlign: 'center', padding: '11px 0',
              background: '#fff', color: '#000', borderRadius: '2px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', textDecoration: 'none',
              fontFamily: "'Open Sans',sans-serif", transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e0e0e0'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Projects</a>
            <a href="/skills" style={{
              flex: 1, textAlign: 'center', padding: '11px 0',
              border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', borderRadius: '2px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', textDecoration: 'none',
              fontFamily: "'Open Sans',sans-serif", transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#ccc'; }}
            >Skills</a>
          </div>
        </motion.div>

      </div>{/* end .about-section-inner */}

      {/* ════════════════════════════
          MOBILE — single column
          (hidden on desktop via CSS)
      ════════════════════════════ */}
      <motion.div className="mobile-stack"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        initial="hidden" animate={isInView ? 'visible' : 'hidden'}>

        {/* Back */}
        <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#555', textDecoration: 'none', fontSize: '11px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: "'Open Sans',sans-serif", fontWeight: 600,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </a>
        </motion.div>

        {/* Name */}
        <motion.div variants={fadeUp} style={{ paddingBottom: '18px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ff3333', marginBottom: '5px', fontWeight: 700, fontFamily: "'Open Sans',sans-serif" }}>About</div>
          <div style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: "'Open Sans',sans-serif" }}>
            Rohit <span style={{ color: '#ff3333' }}>Suthar</span>
          </div>
        </motion.div>
        <hr className="mob-sep" />

        {/* Stack */}
        <motion.div variants={fadeUp} style={{ padding: '18px 0' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', fontFamily: "'Open Sans',sans-serif", fontWeight: 600, marginBottom: '10px' }}>Stack</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {stackTags.map(t => <Tag key={t}>{t}</Tag>)}
          </div>
          <div style={{ fontSize: '13px', color: '#888', fontFamily: "'Open Sans',sans-serif", lineHeight: 1.7, marginTop: '10px' }}>
            Udaipur, Rajasthan &nbsp;·&nbsp; <span style={{ color: '#ff3333', fontWeight: 700 }}>Data Engineer</span>
          </div>
          <div style={{ marginTop: '10px' }}><ContactLinks /></div>
        </motion.div>
        <hr className="mob-sep" />

        {/* Story / Experience / Education tabs */}
        <motion.div variants={fadeUp} style={{ padding: '18px 0' }}>
          <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} mobile />
          <TabContent activeTab={activeTab} mobile />
        </motion.div>
        <hr className="mob-sep" />

        {/* Stats */}
        <motion.div variants={fadeUp} style={{ padding: '18px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          <StatItem n="1+" label="Yrs" />
          <StatItem n="2" label="Roles" />
          <StatItem n="2025" label="Grad" />
          <StatItem n="Data" label="Focus" />
        </motion.div>
        <hr className="mob-sep" />

        {/* CTAs */}
        <motion.div variants={fadeUp} style={{ paddingTop: '18px', display: 'flex', gap: '8px' }}>
          <a href="/projects" style={{
            flex: 1, textAlign: 'center', padding: '14px 0',
            background: '#fff', color: '#000', borderRadius: '2px',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: "'Open Sans',sans-serif",
          }}>Projects</a>
          <a href="/skills" style={{
            flex: 1, textAlign: 'center', padding: '14px 0',
            border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', borderRadius: '2px',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: "'Open Sans',sans-serif",
          }}>Skills</a>
        </motion.div>

      </motion.div>

    </section>
  );
};

export default About;