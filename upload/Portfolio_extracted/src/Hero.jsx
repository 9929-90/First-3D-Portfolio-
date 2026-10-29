import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useReducedMotion, animate } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';

// ===== CV LINK =====
// Put your CV link here. Either:
//   • a file in your /public folder, e.g. '/Rohit_Suthar_CV.pdf'
//   • or a full URL, e.g. a Google Drive / hosted PDF link
const CV_LINK = '/Rohit_Suthar_CV.pdf';

// ===== MOTION CONSTANTS =====
export const softSpring = { type: 'spring', stiffness: 200, damping: 30, mass: 1 };
export const quickSpring = { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 };
export const idleSpring = { type: 'spring', stiffness: 50, damping: 20 };

const baseVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: softSpring },
  idle: {
    y: [-2, 2, -2],
    transition: { ...idleSpring, duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 1 }
  }
};

// ===== DOWNLOAD ICON =====
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ===== SOCIAL ICONS =====
const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const socialLinks = [
  { name: 'Twitter',   href: 'https://x.com/RohitttSuthar',              icon: TwitterIcon,   hoverColor: '#1DA1F2' },
  { name: 'WhatsApp',  href: 'https://wa.me/7737438464',                  icon: WhatsAppIcon,  hoverColor: '#25D366' },
  { name: 'LinkedIn',  href: 'http://www.linkedin.com/in/rohitsuthar09',  icon: LinkedInIcon,  hoverColor: '#0A66C2' },
  { name: 'GitHub',    href: 'https://github.com/9929-90',                icon: GitHubIcon,    hoverColor: '#ffffff' },
];

const SocialIcon = ({ name, href, icon: Icon, hoverColor, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay: 0.6 + index * 0.07 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.9 }}
      style={{ color: isHovered ? hoverColor : 'rgba(255,255,255,0.45)' }}
      className="relative flex items-center justify-center w-9 h-9 transition-colors duration-200"
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${hoverColor}` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 0.35 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={quickSpring}
      />
      <Icon />
    </motion.a>
  );
};

// ===== SCRAMBLE TEXT HOOK =====
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

function useScramble(text, isHovered) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!isHovered) { setDisplay(text); return; }
    iterRef.current = 0;
    const scramble = () => {
      const iter = iterRef.current;
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iter) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      iterRef.current += 0.5;
      if (iterRef.current < text.length) frameRef.current = requestAnimationFrame(scramble);
      else setDisplay(text);
    };
    frameRef.current = requestAnimationFrame(scramble);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isHovered, text]);

  return display;
}

// ===== NAV LINK =====
const NavLink = ({ children, href, index: idx }) => {
  const [isHovered, setIsHovered] = useState(false);
  const label = children.toUpperCase();
  const scrambled = useScramble(label, isHovered);
  const num = String(idx + 1).padStart(2, '0');

  return (
    <motion.a
      href={href}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay: 0.1 + idx * 0.08 }}
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <motion.span
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -4 }}
        transition={quickSpring}
        style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 300, fontSize: '0.55rem', letterSpacing: '0.08em', color: '#ff3333' }}
      >
        {num}
      </motion.span>
      <span style={{
        fontFamily: "'Open Sans', sans-serif", fontWeight: isHovered ? 400 : 300,
        fontSize: '0.68rem', letterSpacing: '0.22em',
        color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.55)',
        transition: 'color 0.2s ease, font-weight 0.1s',
        display: 'inline-block', minWidth: `${label.length * 0.5}rem`,
      }}>
        {scrambled}
      </span>
      <motion.span
        style={{ position: 'absolute', bottom: '-3px', left: '50%', height: '1px', background: 'linear-gradient(90deg, transparent, #ff3333, transparent)', translateX: '-50%' }}
        initial={{ width: '0%' }}
        animate={{ width: isHovered ? '100%' : '0%' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </motion.a>
  );
};

// ===== MOBILE MENU LINK =====
const MobileMenuLink = ({ children, href, index: idx, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const label = children.toUpperCase();
  const scrambled = useScramble(label, isHovered);

  return (
    <motion.a
      href={href} onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ...softSpring, delay: 0.05 + idx * 0.07 }}
    >
      <span style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em', color: '#ff3333', marginTop: '6px' }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
      <span style={{
        fontFamily: "'Open Sans', sans-serif", fontWeight: 200,
        fontSize: 'clamp(2rem, 8vw, 3.5rem)', letterSpacing: '0.15em',
        color: isHovered ? '#ff3333' : '#ffffff', transition: 'color 0.2s ease', lineHeight: 1,
      }}>
        {scrambled}
      </span>
    </motion.a>
  );
};

// ===== SLIDING FILL BUTTON =====
const SlideButton = ({ children, href, onClick, variant = 'outline', icon, delay = 0, target, rel, download }) => {
  const [hovered, setHovered] = useState(false);
  const isSolid = variant === 'solid';

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      download={download}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 22px',
        borderRadius: '2px',
        border: isSolid ? 'none' : '1px solid rgba(255,255,255,0.3)',
        background: isSolid ? '#ffffff' : 'transparent',
        cursor: 'pointer',
        textDecoration: 'none',
        overflow: 'hidden',
        userSelect: 'none',
        flex: '1 1 auto',
        minWidth: 0,
        maxWidth: '180px',
      }}
    >
      <motion.span
        style={{
          position: 'absolute', inset: 0,
          background: isSolid ? '#ff3333' : '#ffffff',
          originX: 0, zIndex: 0,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      />
      {icon && (
        <motion.span
          animate={{ color: isSolid ? (hovered ? '#fff' : '#000') : (hovered ? '#000' : '#fff') }}
          transition={{ duration: 0.15, delay: hovered ? 0.1 : 0 }}
          style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}
        >
          {icon}
        </motion.span>
      )}
      <motion.span
        animate={{ color: isSolid ? (hovered ? '#fff' : '#000') : (hovered ? '#000' : 'rgba(255,255,255,0.9)') }}
        transition={{ duration: 0.15, delay: hovered ? 0.1 : 0 }}
        style={{
          position: 'relative', zIndex: 1,
          fontFamily: "'Open Sans', sans-serif",
          fontWeight: 600,
          fontSize: '0.68rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </motion.span>
    </motion.a>
  );
};

// ===== HIGHLIGHT CHIP =====
const HighlightChip = ({ children, index = 0, accent = false }) => (
  <motion.span
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...softSpring, delay: 0.55 + index * 0.06 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 10px',
      border: `1px solid ${accent ? 'rgba(255,51,51,0.5)' : 'rgba(255,255,255,0.15)'}`,
      borderRadius: '2px',
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 400,
      fontSize: '0.62rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: accent ? '#ff6666' : 'rgba(255,255,255,0.7)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </motion.span>
);

// ===== CONTACT BUTTON + DROPDOWN =====
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ContactItem = ({ label, value, href, icon: Icon, index }) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ ...softSpring, delay: 0.06 * index }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <motion.span
        style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', originX: 0, zIndex: 0 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      />
      <a href={href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', position: 'relative', zIndex: 1 }}>
        <motion.span
          animate={{ color: hovered ? '#ff3333' : 'rgba(255,255,255,0.4)' }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, display: 'flex' }}
        >
          <Icon />
        </motion.span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', fontFamily: "'Open Sans',sans-serif", fontWeight: 600, marginBottom: '2px' }}>{label}</div>
          <motion.div
            animate={{ color: hovered ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '12px', fontFamily: "'Open Sans',sans-serif", fontWeight: 400, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {value}
          </motion.div>
        </div>
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.85 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)', flexShrink: 0, display: 'flex' }}
          title="Copy"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </motion.button>
      </a>
    </motion.div>
  );
};

const ContactButton = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const contacts = [
    { label: 'Call',  value: '+91 7737438464',          href: 'tel:+917737438464',             icon: PhoneIcon },
    { label: 'Email', value: 'rohitsuthar410@gmail.com', href: 'mailto:rohitsuthar410@gmail.com', icon: MailIcon  },
  ];

  return (
    <div ref={dropRef} style={{ position: 'relative', display: 'inline-block' }}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.42 }}
        style={{
          position: 'relative',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px',
          border: '1px solid',
          borderColor: open ? '#ff3333' : (hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'),
          borderRadius: '2px',
          background: 'transparent',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.25s ease',
        }}
      >
        <motion.span
          style={{ position: 'absolute', inset: 0, background: '#ffffff', originX: 0, zIndex: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered && !open ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.span
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
          style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff3333', flexShrink: 0, position: 'relative', zIndex: 1 }}
        />
        <motion.span
          animate={{ color: hovered && !open ? '#000000' : 'rgba(255,255,255,0.8)' }}
          transition={{ duration: 0.15, delay: hovered ? 0.1 : 0 }}
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}
        >
          Let's Talk
        </motion.span>
        <motion.span
          animate={{ rotate: open ? 180 : 0, color: hovered && !open ? '#000' : 'rgba(255,255,255,0.5)' }}
          transition={{ ...quickSpring }}
          style={{ display: 'flex', position: 'relative', zIndex: 1 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={quickSpring}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '240px',
              background: 'rgba(10,10,10,0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444', fontFamily: "'Open Sans',sans-serif", fontWeight: 600 }}>
                Reach out
              </span>
            </div>
            {contacts.map((c, i) => (
              <ContactItem key={c.label} {...c} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== UTILITIES =====
const TextReveal = ({ text, delay = 0, className = '' }) => {
  const reducedMotion = useReducedMotion();
  const chars = text.split('');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.03, delayChildren: delay } }
  };
  const charVariants = {
    hidden: { opacity: 0, y: 15, filter: reducedMotion ? 'blur(0px)' : 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: reducedMotion ? { duration: 0 } : softSpring }
  };
  return (
    <motion.span className={`inline-block ${className}`} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {chars.map((char, i) => (
        <motion.span key={i} variants={charVariants} className="inline-block will-change-transform">
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const WordReveal = ({ text, delay = 0 }) => {
  const reducedMotion = useReducedMotion();
  const words = text.split(' ');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: delay } }
  };
  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: reducedMotion ? { duration: 0 } : softSpring }
  };
  return (
    <motion.span variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariants} className="inline-block mr-2 will-change-transform">{word}</motion.span>
      ))}
    </motion.span>
  );
};

const MagneticButton = ({ children, strength = 0.4 }) => {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, quickSpring); const sy = useSpring(y, quickSpring);
  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(((clientX - left - width / 2) / width) * 20 * strength);
    y.set(((clientY - top - height / 2) / height) * 20 * strength);
  };
  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: sx, y: sy }} className="inline-block will-change-transform">
      {children}
    </motion.div>
  );
};

const TiltCard = ({ children, maxTilt = 10 }) => {
  const reducedMotion = useReducedMotion();
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, quickSpring); const sry = useSpring(ry, quickSpring);
  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    ry.set(((clientX - left) / width - 0.5) * maxTilt * 2);
    rx.set(((clientY - top) / height - 0.5) * maxTilt * -2);
  };
  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { rx.set(0); ry.set(0); }} style={{ perspective: 1200, rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }} className="will-change-transform">
      {children}
    </motion.div>
  );
};

// ===== HERO =====
const Hero = ({ profileImage = '/Profile.png' }) => {
  const reducedMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const imageRef = useRef(null);
  const isImageInView = useInView(imageRef, { once: true, amount: 0.1 });
  const bgX = useMotionValue(0);

  // Detect viewport size for adaptive layout
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallMobile(window.innerWidth < 400);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const controls = animate(bgX, [0, 100, 0], { duration: 20, repeat: Infinity, ease: 'linear' });
    return controls.stop;
  }, [reducedMotion, bgX]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const menuItems = [
    { label: 'About',    href: '/about'    },
    { label: 'Projects', href: '/projects' },
    { label: 'Skills',   href: '/skills'   },
    { label: 'Insights',   href: '/insights'   },
  ];

  return (
    <div
      style={{
        minHeight: '100svh',
        width: '100%',
        backgroundColor: '#000',
        color: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Open Sans', sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,200;0,300;0,400;0,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background-color: #000; color: white; margin: 0; padding: 0; }
        ::selection { background: rgba(255,51,51,0.25); }
      `}</style>

      {/* ── NAV ── */}
      <motion.nav
        style={{
          width: '100%',
          zIndex: 50,
          padding: isMobile ? '16px 20px' : '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.05 }}
      >
        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {menuItems.map((item, i) => (
              <NavLink key={item.label} href={item.href} index={i}>{item.label}</NavLink>
            ))}
          </div>
        )}

        {/* Mobile: logo/name on left */}
        {isMobile && (
          <span style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            RS
          </span>
        )}

        {/* Contact button — desktop */}
        {!isMobile && <ContactButton />}

        {/* Hamburger — mobile */}
        {isMobile && (
          <motion.button
            style={{ width: '32px', height: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 60, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            <motion.span style={{ width: '24px', height: '1px', display: 'block', background: '#fff' }}
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 5 : 0, background: isMenuOpen ? '#ff3333' : '#ffffff' }}
              transition={quickSpring}
            />
            <motion.span style={{ width: '16px', height: '1px', display: 'block', background: '#fff', alignSelf: 'flex-start' }}
              animate={{ opacity: isMenuOpen ? 0 : 1, x: isMenuOpen ? -8 : 0 }}
              transition={quickSpring}
            />
            <motion.span style={{ width: '24px', height: '1px', display: 'block', background: '#fff' }}
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -5 : 0, background: isMenuOpen ? '#ff3333' : '#ffffff' }}
              transition={quickSpring}
            />
          </motion.button>
        )}
      </motion.nav>

      {/* ── MOBILE FULLSCREEN MENU ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '0 40px',
              backgroundColor: '#000',
            }}
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 36px) 36px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 36px) 36px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 36px) 36px)' }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,51,51,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,51,1) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              {menuItems.map((item, i) => (
                <MobileMenuLink key={item.label} href={item.href} index={i} onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </MobileMenuLink>
              ))}
            </div>
            <motion.div
              style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#444', fontFamily: "'Open Sans',sans-serif", textTransform: 'uppercase' }}>
                Rohit Suthar · Portfolio
              </span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <a href="tel:+917737438464" style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Open Sans',sans-serif" }}>
                  +91 7737438464
                </a>
                <a href="mailto:rohitsuthar410@gmail.com" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#ff3333', textDecoration: 'none', fontFamily: "'Open Sans',sans-serif" }}>
                  Email →
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding: isMobile ? '0 20px 32px' : '0 40px',
          overflowY: isMobile ? 'auto' : 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '32px' : '48px',
            alignItems: 'center',
            maxWidth: '1100px',
            width: '100%',
          }}
        >

          {/* ── LEFT: text content ── */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}
            variants={baseVariants}
            initial="hidden"
            animate={['visible', 'idle']}
          >
            {/* Heading */}
            <motion.h1
              style={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 300,
                fontSize: isSmallMobile ? '1.6rem' : isMobile ? '2rem' : 'clamp(1.75rem, 3.5vw, 2.8rem)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
                margin: 0,
              }}
              variants={baseVariants}
            >
              <TextReveal text="Aspiring " delay={0.4} className="block" />
              <TextReveal text="Data " className="block" />
              <TextReveal text="Engineer" delay={0.4} className="block" />
            </motion.h1>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
              <motion.p
                style={{
                  fontFamily: "'Open Sans', sans-serif", fontWeight: 300,
                  fontSize: isSmallMobile ? '0.82rem' : isMobile ? '0.88rem' : 'clamp(0.88rem, 1.4vw, 1rem)',
                  color: '#d1d5db', lineHeight: 1.8, margin: 0,
                }}
                variants={baseVariants}
              >
                <WordReveal text="As an AI/ML Engineer Intern at PAPASIDDHI Technologies, I built a voice-based conversational AI using Python and RAG, improving data quality and pipeline reliability with SQL, PySpark and Databricks. Now building my career in data engineering." />
              </motion.p>
              <motion.p
                style={{
                  fontFamily: "'Open Sans', sans-serif", fontWeight: 300,
                  fontSize: isSmallMobile ? '0.76rem' : isMobile ? '0.8rem' : 'clamp(0.78rem, 1.1vw, 0.88rem)',
                  color: '#9ca3af', lineHeight: 1.8, margin: 0,
                }}
                variants={baseVariants}
              >
               <WordReveal text="Through self-paced learning, I also built various apps and websites across different tech stacks and applied SEO. I communicate clearly and collaborate well." delay={0.3} />
              </motion.p>
            </div>

            {/* Highlights */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <HighlightChip index={0} accent>Recent AI/ML Intern</HighlightChip>
              <HighlightChip index={1}>Excellent Communication</HighlightChip>
              <HighlightChip index={2}>Multi-Stack Builder</HighlightChip>
              <HighlightChip index={3}>Apps, Websites & SEO</HighlightChip>
            </div>

            {/* Buttons */}
            <motion.div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}
              variants={baseVariants}
            >
              <SlideButton href="/projects" variant="solid" delay={0.45}>View Projects</SlideButton>
              <SlideButton href="/about" variant="outline" delay={0.52}>About Me</SlideButton>
              <SlideButton
                href={CV_LINK}
                variant="outline"
                delay={0.59}
                icon={<DownloadIcon />}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download CV
              </SlideButton>
            </motion.div>

            {/* Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '0px' }}>
              {socialLinks.map((social, index) => (
                <SocialIcon key={social.name} {...social} index={index} />
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: profile image ── */}
          <motion.div
            ref={imageRef}
            style={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-end',
              order: isMobile ? -1 : 0, // image on top on mobile
            }}
            variants={baseVariants}
            initial="hidden"
            animate={isImageInView ? ['visible', 'idle'] : 'hidden'}
          >
            <TiltCard>
              <motion.div
                style={{
                  position: 'relative',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  width: isSmallMobile ? '160px' : isMobile ? '200px' : '100%',
                  maxWidth: isMobile ? '200px' : '340px',
                }}
              >
                <div style={{ aspectRatio: '4/5', position: 'relative' }}>
                  <img
                    src={profileImage}
                    alt="Rohit Suthar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black 0%, transparent 60%)', opacity: 0.85 }} />
                  <div style={{ position: 'absolute', bottom: isMobile ? '16px' : '28px', left: 0, right: 0, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: isMobile ? '3px 10px' : '4px 12px',
                      background: '#fff',
                      color: '#000',
                      fontSize: isMobile ? '0.52rem' : '0.6rem',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                    }}>
                      Data & AI Engineering
                    </span>
                    <h2 style={{
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: 300,
                      fontSize: isMobile ? '0.85rem' : 'clamp(1rem, 2vw, 1.5rem)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      margin: 0,
                    }}>
                      Rohit Suthar
                    </h2>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Hero;