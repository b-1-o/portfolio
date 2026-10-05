import { useEffect, useRef, useState, useCallback } from 'react';
import RippleDistortion from './RippleDistortion';
import FlexCarousel from './FlexCarousel';
import autoProjects from './projects.auto.json';
import { fetchLiveProjects } from './githubProjects';

import pageBg from '../assets/page.png';
import sfxClick from '../assets/Cough_Nothing_Phone_2_Stock_Notification-649463-mobiles24.mp3';
import sfxNav from '../assets/Squiggle_Nothing_Phone_1_Stock_Notification-645458-mobiles24.mp3';
import sfxRefresh from '../assets/Bulb_One_Nothing_Phone_2_Stock_Notification-649453-mobiles24.mp3';
import sfxError from '../assets/Lonba_Nothing_Phone_2_Stock_Notification-649461-mobiles24.mp3';

const ICON_PATHS = {
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  linux: '<path d="M4 17h16M6 17l1.5-9.5a4.5 4.5 0 0 1 9 0L18 17"/><path d="M9 8.5c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5"/><circle cx="9.5" cy="11" r=".6" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r=".6" fill="currentColor" stroke="none"/>',
  fog: '<path d="M4 14c2-4 4-6 8-6s6 2 8 6"/><path d="M4 10c2.5-3 5-4.5 8-4.5s5.5 1.5 8 4.5"/><path d="M6 18c1.5-2 3.5-3 6-3s4.5 1 6 3"/>',
  forest: '<path d="M12 22v-6"/><path d="M8 22h8"/><path d="M12 3l5 8H7l5-8z"/><path d="M12 9l4.5 7h-9L12 9z"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>',
  sleep: '<path d="M12 3a9 9 0 1 0 9 9c0-4-3-7-7-8 1 2 1 4 0 6a5 5 0 0 1-6-6c2 1 4 1 6 0z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.5 15.5M8.5 8.5L20 20"/>',
  brand: '<path d="M12 2l3 7h7l-5.5 4.5L18.5 22 12 17l-6.5 5 1.5-8.5L2 9h7l3-7z"/>',
  build: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  agent: '<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2M9 13h.01M15 13h.01M10 16h4"/>',
};

function projectIcon(iconKey) {
  const glyph = ICON_PATHS[iconKey] || ICON_PATHS.web;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>
      <stop offset="35%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(200,195,220,0.06)"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0.2" y1="0" x2="0.8" y2="0.55">
      <stop offset="0%" stop-color="rgba(255,255,255,0.42)"/>
      <stop offset="55%" stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <filter id="soft" x="-8%" y="-8%" width="116%" height="116%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
      <feOffset dy="1" result="o"/>
      <feFlood flood-color="rgba(0,0,0,0.25)"/>
      <feComposite in2="o" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="28" y="28" width="664" height="844" rx="48" fill="url(#glass)" stroke="rgba(255,255,255,0.38)" stroke-width="1.25" filter="url(#soft)"/>
  <rect x="28" y="28" width="664" height="300" rx="48" fill="url(#sheen)"/>
  <rect x="36" y="36" width="648" height="1.5" fill="rgba(255,255,255,0.35)" opacity="0.7"/>
  <g transform="translate(360 430) scale(9.2) translate(-12 -12)" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
    ${glyph}
  </g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SFX = {
  click: sfxClick,
  navigation: sfxNav,
  refresh: sfxRefresh,
  error: sfxError,
};

const initialProjects = Array.isArray(autoProjects) ? autoProjects : [];

const services = [
  { title: 'Product UI', text: 'Interfaces for real products — dashboards, booking flows, music tools and command centers with clear hierarchy.' },
  { title: 'Immersive web', text: 'Atmospheric experiences with WebGL, motion and custom interaction models that still stay usable.' },
  { title: 'Frontend systems', text: 'React + TypeScript apps with solid structure, Vite builds and attention to performance on real devices.' },
  { title: 'Freelance delivery', text: 'Available on Fiverr and Contra for focused builds, redesigns and interactive portfolio pieces.' },
];

const timeline = [
  { year: '2026', title: 'Immersive portfolio system', text: 's1eep, fog, forest, music — a shared visual language across experiments.' },
  { year: '2025', title: 'Tools & native', text: 'biohub, Biogram, remote agent work — Linux productivity and iOS architecture.' },
  { year: 'Now', title: 'Open for work', text: 'Frontend / UI freelance and product collaboration from Los Angeles.' },
];

const skills = {
  frontend: ['React', 'TypeScript', 'JavaScript', 'Vite', 'CSS', 'Motion'],
  graphics: ['WebGL', 'ogl', 'Shaders', '3D CSS', 'Ripple / distortion'],
  other: ['Python', 'FastAPI', 'Swift / iOS', 'Bazel', 'Node', 'UI design'],
};

const makeCarouselItems = list => list.map(p => ({
  src: projectIcon(p.icon || 'web'),
  alt: p.name,
  title: p.name,
  subtitle: p.kind,
}));

const socials = [
  { label: 'GitHub', href: 'https://github.com/b-1-o', note: '@b-1-o' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/b1o/', note: 'b1o' },
  { label: 'Fiverr', href: 'https://www.fiverr.com/webbio/', note: 'webbio' },
  { label: 'Contra', href: 'https://contra.com/erik_868bxnxk', note: 'Erik' },
  { label: 'Mail', href: 'mailto:l.biodev.l@gmail.com', note: 'l.biodev.l@gmail.com' },
];

function ProjectPanel({ project, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="project-panel-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
      <section className="project-panel hud" role="dialog" aria-modal="true" aria-label={project.name}>
        <div className="project-panel-top">
          <span className="hud-copy">PROJECT / {project.id}</span>
          <button type="button" className="panel-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <span className="work-kind">{project.kind}</span>
        <h3>{project.name}</h3>
        <p>{project.blurb}</p>
        {project.detail ? <p className="panel-detail">{project.detail}</p> : null}
        <div className="work-stack">{project.stack.map(t => <span key={t}>{t}</span>)}</div>
        <div className="project-panel-actions">
          <a className="panel-btn" href={project.repo} target="_blank" rel="noreferrer">REPOSITORY</a>
          {project.site ? <a className="panel-btn panel-btn-solid" href={project.site} target="_blank" rel="noreferrer">LIVE SITE</a> : null}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [time, setTime] = useState(() => new Date());
  const audioRef = useRef({});
  const [openProject, setOpenProject] = useState(null);
  const [rippleReady, setRippleReady] = useState(false);
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveProjects(controller.signal)
      .then(setProjects)
      .catch(error => {
        if (error?.name !== 'AbortError') console.warn('Using cached project catalog:', error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setRippleReady(true), 200);
    return () => clearTimeout(id);
  }, []);

  const playSfx = useCallback(type => {
    const src = SFX[type];
    if (!src) return Promise.resolve(null);
    let audio = audioRef.current[type];
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = type === 'click' ? 0.85 : 0.72;
      audioRef.current[type] = audio;
    }
    if (type === 'click' || (!audio.paused && audio.currentTime > 0.02)) {
      const clone = new Audio(src);
      clone.volume = audio.volume;
      const result = clone.play();
      return result && typeof result.then === 'function' ? result.then(() => clone).catch(() => null) : Promise.resolve(clone);
    }
    try { audio.currentTime = 0; } catch { /* ignore */ }
    const result = audio.play();
    return result && typeof result.then === 'function' ? result.then(() => audio).catch(() => null) : Promise.resolve(audio);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let mx = 50, my = 50, raf = 0;
    const flush = () => { raf = 0; root.style.setProperty('--mx', mx + '%'); root.style.setProperty('--my', my + '%'); };
    const onPointerMove = event => {
      mx = (event.clientX / window.innerWidth) * 100;
      my = (event.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onClick = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('[data-refresh]')) return;
      const anchor = target.closest('a[href]');
      const href = anchor?.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) { playSfx('navigation'); return; }
      if (target.closest('button') || target.closest('[role="button"]') || target.closest('[data-project]')) playSfx('click');
    };
    const onInvalid = () => playSfx('error');
    const onError = () => playSfx('error');
    const onUnhandledRejection = () => playSfx('error');
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('click', onClick, true);
    document.addEventListener('invalid', onInvalid, true);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('invalid', onInvalid, true);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [playSfx]);

  const refreshPage = async event => {
    event.preventDefault();
    event.stopPropagation();
    const audio = await playSfx('refresh');
    const duration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
    const wait = Math.min(Math.max(duration * 1000, 420), 1100);
    window.setTimeout(() => window.location.reload(), wait);
  };

  const openPanel = project => {
    playSfx('click');
    setOpenProject(project);
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const CAROUSEL_ITEMS = makeCarouselItems(projects);

  return (
    <main className="page">
      <div className="visual-stage" aria-hidden="true">
        {rippleReady ? (
          <RippleDistortion
            src={pageBg}
            brushSize={80}
            strength={0.12}
            swirl={0.7}
            rings={3}
            grayscale
            spacing={10}
            tint="#8300ff"
            quality="low"
            spread={3.5}
            fade={1.8}
            dispersion={0}
            glint={0}
            tintAmount={0.08}
            highlightColor="#ffffff"
            trigger="hover"
            clickStrength={1.4}
            enabled
          />
        ) : (
          <div className="static-bg" style={{ backgroundImage: `url(${pageBg})` }} />
        )}
        <div className="image-dimmer" />
        <div className="pointer-halo" />
        <div className="vignette" />
      </div>

      <header className="topbar hud">
        <a className="brand" href="#home" aria-label="b-1-o home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>b-1-o</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#work">WORK</a>
          <a href="#services">SERVICES</a>
          <a href="#connect">CONNECT</a>
        </nav>
        <button type="button" className="refresh-button" data-refresh onClick={refreshPage} aria-label="Refresh page">
          <span className="refresh-glyph">↻</span>
          REFRESH
        </button>
      </header>

      <section id="home" className="hero-copy">
        <div className="system-code hud-copy">
          <span>SYS.B1O</span>
          <span>LA / FRONTEND</span>
          <span>{formattedTime}</span>
        </div>
        <p className="eyebrow">ERIK · B-1-O · FRONTEND DEVELOPER & UI DESIGNER</p>
        <h1>Interfaces that<br /><span>feel alive.</span></h1>
        <p className="intro">
          I design and build modern React & TypeScript surfaces — atmospheric web experiences,
          product UIs and tools with motion, depth and quiet detail. Based in Los Angeles.
          Open for freelance on Fiverr and Contra.
        </p>
        <div className="hero-actions">
          <a href="#work" className="enter-link"><span>VIEW WORK</span><span className="enter-glyph">↘</span></a>
          <a href="#connect" className="enter-link enter-link-ghost"><span>HIRE ME</span><span className="enter-glyph">→</span></a>
        </div>
        <div className="hero-stats hud-copy">
          <div><strong>12+</strong><span>PUBLIC PROJECTS</span></div>
          <div><strong>REACT</strong><span>PRIMARY STACK</span></div>
          <div><strong>LA</strong><span>BASED</span></div>
        </div>
      </section>

      <aside className="surface-hud hud-copy">
        <div className="surface-index">01 / SURFACE</div>
        <div className="surface-copy">
          <span className="crosshair" />
          MOVE YOUR CURSOR
          <small>RIPPLE DISTORTION · REACT BITS</small>
        </div>
      </aside>

      <section id="about" className="about-section hud">
        <div className="about-label">02 / ABOUT</div>
        <div>
          <h2>Erik.<br /><span>Frontend & UI.</span></h2>
          <p>
            I ship immersive web experiences, music tools, iOS experiments and local productivity systems.
            Clean TypeScript, deliberate motion, low-light aesthetics. The same visual grammar runs through
            fog, forest, music and this surface — interaction as atmosphere, not decoration.
          </p>
          <p className="about-extra">
            Outside the browser: Python tooling (biohub, agents), Swift/iOS (Biogram) and product UIs
            for real service flows. Available for focused freelance builds and longer product collaboration.
          </p>
        </div>
        <div className="about-meta">
          <span>REACT / TS</span>
          <span>WEBGL · CSS</span>
          <span>SWIFT · PYTHON</span>
          <span>FIVERR · CONTRA</span>
        </div>
      </section>

      <section className="skills-section" aria-label="Skills">
        <div className="skills-label hud-copy">03 / SKILLS</div>
        <div className="skills-grid">
          <div className="skills-block hud">
            <h4>Frontend</h4>
            <ul className="skills-list">{skills.frontend.map(s => <li key={s} className="skill-chip">{s}</li>)}</ul>
          </div>
          <div className="skills-block hud">
            <h4>Graphics</h4>
            <ul className="skills-list">{skills.graphics.map(s => <li key={s} className="skill-chip">{s}</li>)}</ul>
          </div>
          <div className="skills-block hud">
            <h4>Systems</h4>
            <ul className="skills-list">{skills.other.map(s => <li key={s} className="skill-chip">{s}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="work" className="work-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">04 / SELECTED WORK</span>
          <h2>portfolio</h2>
          <p>Scroll or drag the row — click a card to open the project panel.</p>
        </div>
        <div className="work-carousel hud">
          <FlexCarousel
            items={CAROUSEL_ITEMS}
            preset="liquid"
            intro="rise"
            cardHeight={0.55}
            gap={14}
            radius={22}
            squeeze={0.15}
            focusOnClick={false}
            captions
            captureWheel={true}
            autoplay={false}
            dispersion={0.25}
            onSelect={index => {
              const p = projects[index];
              if (p) openPanel(p);
            }}
          />
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">05 / SERVICES</span>
          <h2>What I build</h2>
          <p>Product surfaces, immersive pages and frontend systems — shipped with care.</p>
        </div>
        <div className="services-grid">
          {services.map(s => (
            <article key={s.title} className="service-card hud">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">06 / PATH</span>
          <h2>Timeline</h2>
        </div>
        <ol className="timeline-list">
          {timeline.map(t => (
            <li key={t.year} className="timeline-item hud">
              <span className="timeline-year">{t.year}</span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="connect" className="connect-section hud">
        <div className="connect-label">07 / CONNECT</div>
        <div>
          <h2>Find me<br /><span>online.</span></h2>
          <p>Open to freelance and product work. Reach out on Fiverr, Contra, LinkedIn or GitHub — or email me directly.</p>
        </div>
        <ul className="social-list">
          {socials.map(s => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                <span>{s.label}</span>
                <small>{s.note}</small>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer hud-copy">
        <span>B-1-O / ERIK</span>
        <span>LA · 2026</span>
        <span>REACT BITS · RIPPLE</span>
      </footer>

      {openProject ? <ProjectPanel project={openProject} onClose={() => setOpenProject(null)} /> : null}
    </main>
  );
}

export default App;
