'use client';
import './index.css';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

import { Canvas, useThree, useFrame, extend } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

extend({ MeshLineGeometry, MeshLineMaterial });

const GLTF_PATH = '/assets/kartufix.glb';
const TEXTURE_PATH = '/assets/bandd.png';

useGLTF.preload(GLTF_PATH);
useTexture.preload(TEXTURE_PATH);

/* =============== Reveal =============== */
function Reveal({ children, as:Tag='div', className='', delay=0, y=20, threshold=0.15, rootMargin='-6% 0px -6% 0px' }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { threshold, root: null, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);
  return (
    <Tag ref={ref} className={`reveal ${show ? 'reveal-show' : ''} ${className}`} style={{ transitionDelay: `${delay}ms`, '--reveal-y': `${y}px` }}>
      {children}
    </Tag>
  );
}

/* =============== Icons kecil =============== */
const IconSend = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M2 21l21-9L2 3l3 7 9 2-9 2-3 7z"/></svg>);
const IconUser = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" d="M12 12a5 5 0 100-10 5 5 0 000 10zm7 10H5a1 1 0 01-1-1 7 7 0 0114 0 1 1 0 01-1 1z"/></svg>);
const IconMail = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" d="M4 6h16v12H4z"/><path strokeWidth="2" d="M22 6l-10 7L2 6"/></svg>);
const IconMsg  = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" d="M21 15a4 4 0 01-4 4H8l-5 4V5a4 4 0 014-4h10a4 4 0 014 4z"/></svg>);
const IconLinkedIn = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.98h5V24H0zM8 8.98h4.8v2.05h.07c.67-1.2 2.3-2.47 4.73-2.47C21.4 8.56 24 10.7 24 15.1V24h-5v-7.9c0-1.89-.03-4.33-2.64-4.33-2.64 0-3.04 2.06-3.04 4.2V24H8z"/></svg>);
const IconWhatsApp = (p) => (<svg viewBox="0 0 32 32" fill="currentColor" {...p}><path d="M19.11 17.21c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.2.32-.82 1.03-1 .99-.18-.04-1.08-.39-2.06-1.24-.76-.68-1.28-1.52-1.43-1.77-.15-.26-.02-.4.14-.56.14-.14.32-.37.47-.56.16-.18.2-.32.3-.53.1-.21.05-.4-.02-.56-.07-.16-.71-1.7-.97-2.33-.26-.63-.53-.53-.71-.53-.18 0-.4-.03-.61-.03-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.67 0 1.57 1.16 3.09 1.32 3.3.16.21 2.31 3.52 5.6 4.92.78.34 1.39.55 1.86.7.78.25 1.49.22 2.05.13.63-.09 1.87-.76 2.13-1.49.26-.73.26-1.36.18-1.49-.07-.14-.27-.21-.58-.37z"/><path d="M27.27 4.73C24.37 1.82 20.42.29 16.26.29 7.67.29.65 7.31.65 15.9c0 2.73.72 5.38 2.09 7.72L.29 31.71l8.33-2.18c2.28 1.24 4.86 1.9 7.64 1.9 8.59 0 15.61-7.02 15.61-15.61 0-4.16-1.53-8.11-4.6-11.09zM16.26 29.1c-2.49 0-4.87-.67-6.97-1.95l-.5-.3-4.94 1.3 1.32-4.82-.33-.5c-1.28-2.02-1.95-4.39-1.95-6.93C2.9 8.39 8.75 2.54 16.26 2.54c3.62 0 7.02 1.41 9.58 3.96 2.56 2.56 3.96 5.96 3.96 9.58 0 7.51-6.85 13.36-13.54 13.36z"/></svg>);
const IconGitHub = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.15 8.96 7.51 10.41.55.1.75-.24.75-.53v-1.86c-3.06.67-3.7-1.3-3.7-1.3-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.67.08-.67 1.1.08 1.67 1.13 1.67 1.13.98 1.67 2.57 1.19 3.2.9.1-.71.38-1.19.69-1.46-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.19 1.13-2.97-.11-.28-.49-1.42.11-2.96 0 0 .93-.3 3.04 1.13.89-.25 1.85-.37 2.8-.37.95 0 1.91.12 2.8.37 2.1-1.43 3.03-1.13 3.03-1.13.61 1.54.23 2.68.12 2.96.7.78 1.13 1.77 1.13 2.97 0 4.22-2.57 5.15-5.02 5.43.39.33.73.98.73 1.98v2.94c0 .29.2.64.76.53 4.35-1.45 7.5-5.56 7.5-10.41C23.03 5.24 18.28.5 12 .5z"/></svg>);
const IconEye = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/><circle cx="12" cy="12" r="2.5" fill="#fff"/></svg>);
const IconSun = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v-2h-3v2h3zm-2.05 6.95l1.41-1.41-1.79-1.8-1.41 1.42 1.79 1.79zM17.24 4.84l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM12 6a6 6 0 100 12 6 6 0 000-12zM4.22 18.36l1.79-1.79-1.41-1.42-1.79 1.8 1.41 1.41z"/></svg>);
const IconMoon = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M21 12.79A9 9 0 1111.21 3c.16 0 .32.01.48.02a7 7 0 109.29 9.77 9.05 9.05 0 01-.98.0z"/></svg>);

/* =============================== APP =============================== */
export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll-spy
  useEffect(() => {
    const ids = ['about', 'projects', 'contact'];
    const ratios = Object.fromEntries(ids.map(id => [id, 0]));
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { ratios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
        let best = ''; let bestVal = 0;
        for (const id of ids) { const v = ratios[id] || 0; if (v > bestVal) { bestVal = v; best = id; } }
        setActive(best);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: thresholds }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative w-screen h-screen">
      {/* NAV */}
      <div className="fixed top-4 inset-x-0 z-30 flex justify-center md:top-6 md:justify-end md:pr-8">
        <nav className="flex items-center gap-4 md:gap-8 text-base md:text-lg font-semibold bg-black/60 px-4 md:px-5 py-2 rounded-full backdrop-blur-md shadow-md text-white">
          <a href="#about" className={`transition-colors duration-300 ${active==='about' ? 'text-[#00ffff]' : ''} hover:[color:#00ffff]`}>About</a>
          <a href="#projects" className={`transition-colors duration-300 ${active==='projects' ? 'text-[#00ffff]' : ''} hover:[color:#00ffff]`}>Projects</a>
          <a href="#contact" className={`transition-colors duration-300 ${active==='contact' ? 'text-[#00ffff]' : ''} hover:[color:#00ffff]`}>Contact</a>
        </nav>
      </div>

      {/* HERO */}
      <h1 className="absolute text-4xl sm:text-5xl md:text-[120px] top-24 md:top-[47%] left-1/2 md:left-[35%] -translate-x-1/2 md:-translate-y-1/2 font-serif font-bold text-white tracking-wider pointer-events-none select-none z-30 md:z-10 text-center">
        PORTOFOLIO
      </h1>

      {/* 3D */}
      <div className="h-screen relative z-10 md:z-0">
        <Canvas
          camera={{ position: isMobile ? [0, 0.5, 16] : [3, 0, 13], fov: isMobile ? 28 : 25 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={Math.PI} />
          <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band isMobile={isMobile} minSpeed={isMobile ? 16 : 10} maxSpeed={isMobile ? 60 : 50} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer intensity={2} position={[0, -1, 5]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} position={[-1, -1, 1]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} position={[1, 1, 1]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={10} position={[-10, 0, 14]} scale={[100, 10, 1]} />
          </Environment>
        </Canvas>
      </div>

      {/* =================== ABOUT =================== */}
      <section
        id="about"
        className="relative z-20 w-full min-h-[92vh] md:min-h-[78vh] px-4 sm:px-6 md:px-12 xl:px-20 flex items-center justify-center text-white scroll-mt-24 md:scroll-mt-24"
      >
        <div className="w-full md:max-w-[1200px] xl:max-w-[1400px]">
          <Reveal as="h2" className="text-center text-4xl md:text-6xl font-extrabold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)] mb-8 md:mb-14">
            About Me
          </Reveal>

          {/* Dua elemen terpisah: kiri (teks) dan kanan (education), sama-sama kartu opaque */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* LEFT — Card teks (OPAQUE) */}
            <Reveal className="w-full rounded-2xl p-6 md:p-8 bg-neutral-900 border border-neutral-800" delay={40}>
              <p className="text-base md:text-[19px] leading-relaxed tracking-wide text-white/90">
                Hello, I'm Ariel Saradilla from the Data Science Faculty of Informatics. I have a strong interest in technology
                and programming. As a Data Science student, I’m driven by curiosity and the desire to continually learn and
                improve my skills.
              </p>
              <p className="text-base md:text-[19px] leading-relaxed tracking-wide text-white/90 mt-4">
                Throughout my journey, I embrace challenges with enthusiasm, finding joy in solving problems analytically and
                collaborating with others. I believe that every positive step — no matter how small — brings us closer to
                personal growth, stronger capabilities, and meaningful experience.
              </p>
            </Reveal>

            {/* RIGHT — Card Education (OPAQUE) */}
            <Reveal
              className="w-full rounded-2xl p-6 md:p-8 bg-neutral-900 border border-neutral-800"
              delay={80}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-cyan-400 text-xl font-semibold">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.058M12 14v6.058M12 14L5.84 10.578A12.083 12.083 0 006 20.058" />
                  </svg>
                  Academic Education
                </div>
                <ul className="list-disc list-inside text-gray-200 text-lg space-y-1 pl-2">
                  <li>
                    University of Telkom Bandung – Data Science <br />
                    <span className="text-sm text-gray-400">2023 – Present</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-3 text-cyan-400 text-xl font-semibold">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m-3-8h.01M12 12v.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Non-Formal Education
                </div>
                <ul className="list-disc list-inside text-gray-200 text-lg space-y-1 pl-2">
                  <li>
                    Bootcamp Dibimbing <br />
                    <span className="text-sm text-gray-400">March 2025 – September 2025</span>
                  </li>
                </ul>
              </div>

              <div className="group cursor-pointer flex items-center gap-1 mt-4 justify-end">
                <span className="text-white transition-colors duration-300 group-hover:text-cyan-400 text-sm">View Full Education</span>
                <span className="text-cyan-400 opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-sm">→</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================== PROJECTS =================== */}
      <section
        id="projects"
        className="relative z-20 w-full min-h-[92vh] md:min-h-[78vh] px-4 sm:px-6 md:px-12 xl:px-20 flex items-center justify-center text-white scroll-mt-24 md:scroll-mt-24"
      >
        <div className="w-full text-center space-y-6 md:space-y-8 md:max-w-[1200px] xl:max-w-[1400px] pb-12 md:pb-16">
          <Reveal as="h2" className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
            Projects
          </Reveal>

          <Reveal className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6 shadow-lg max-w-md md:max-w-3xl lg:max-w-4xl mx-auto" delay={80}>
            <img src="/images/promo-analysis-cover.png" alt="Promo Analysis Project" className="w-full rounded-md mb-4 md:mb-5" />
            <h3 className="text-xl md:text-2xl font-semibold text-white">Data Analysis: Retail Store Forecasting</h3>
            <p className="text-sm md:text-base text-gray-300 mt-2">
              Built with Python, Prophet, and Power BI to optimize sales strategies by analyzing
              promotion effectiveness and seasonal product performance.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <a
              href="https://www.canva.com/design/DAGrqaPmIh0/zlUdCxxKa6SFQZPeFTsSYQ/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-cyan-400 transition-colors duration-300 text-sm inline-block mb-12 md:mb-14"
            >
              Click to View Full Project
            </a>
          </Reveal>
        </div>
      </section>

      {/* =================== CONTACT =================== */}
      <ContactSection />

      {/* =================== FOOTER STATS =================== */}
      <FooterStats />

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        canvas { touch-action: pan-y; }

        /* Grid kecil konsisten, tanpa kotak besar */
        body {
          background-color: #000;
          background-image:
            linear-gradient(to right, rgba(34,211,238,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34,211,238,.06) 1px, transparent 1px),
            linear-gradient(to right, rgba(34,211,238,.12) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(34,211,238,.12) 2px, transparent 2px);
          background-size: 24px 24px, 24px 24px, 120px 120px, 120px 120px;
          background-attachment: fixed, fixed, fixed, fixed;
        }

        .reveal {
          opacity: 0;
          transform: translateY(var(--reveal-y, 20px));
          transition: opacity 650ms cubic-bezier(.2,.65,.3,1), transform 650ms cubic-bezier(.2,.65,.3,1);
          will-change: opacity, transform;
        }
        .reveal-show { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}

/* ================== CONTACT SECTION ================== */
function ContactSection() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const [comments, setComments] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { const saved = localStorage.getItem('comments'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('comments', JSON.stringify(comments)); } catch {} }, [comments]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert('Max file size 5MB'); return; }
    setFile(Object.assign(f, { preview: URL.createObjectURL(f) }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      photo: file?.preview
    }]);
    setName(''); setMessage(''); setFile(null);
  };

  return (
    <section
      id="contact"
      className="relative z-20 w-full min-h-[92vh] md:min-h-[78vh] px-4 sm:px-6 md:px-12 xl:px-20 flex flex-col items-center justify-center text-white scroll-mt-24 md:scroll-mt-24"
    >
      <div className="w-full md:max-w-[1200px] xl:max-w-[1400px] p-4 md:p-8 xl:p-10">
        <Reveal as="div" className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">Contact Me</h2>
          <p className="text-white/60 mt-2">Got a question? Send me a message, and I'll get back to you soon.</p>
        </Reveal>

        <div className="grid md:grid-cols-[460px,1fr] gap-6 md:gap-8">
          {/* LEFT (OPAK) */}
          <Reveal className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Get in Touch</h3>
              <span className="text-cyan-400">⋯</span>
            </div>

            <form className="space-y-3">
              <label className="relative block">
                <input
                  value={name} onChange={(e)=>setName(e.target.value)}
                  type="text" placeholder="Your Name"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-3 outline-none
                             focus:border-cyan-400 hover:border-cyan-400/70"
                />
                <IconUser className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              </label>
              <label className="relative block">
                <input
                  type="email" placeholder="Your Email"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-3 outline-none
                             focus:border-cyan-400 hover:border-cyan-400/70"
                />
                <IconMail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              </label>
              <label className="relative block">
                <textarea
                  placeholder="Your Message" rows={5}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-3 py-3 outline-none
                             focus:border-cyan-400 hover:border-cyan-400/70 resize-none"
                />
                <IconMsg className="w-5 h-5 absolute left-3 top-3 text-white/60" />
              </label>

              <button
                type="button"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-lg
                           bg-gradient-to-r from-cyan-500 to-cyan-400 text-white
                           hover:brightness-110 transition shadow-[0_0_16px_rgba(34,211,238,0.35)]"
              >
                <IconSend className="w-5 h-5" />
                <span className="font-semibold">Send Message</span>
              </button>
            </form>

            {/* Connect with me */}
            <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-white/70 mb-3 font-medium">Connect With Me</p>
              <div className="space-y-3">
                <a href="https://www.linkedin.com/in/osasariel-saradilla/" target="_blank" className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 hover:border-cyan-400/70 transition">
                  <span className="p-2 rounded-lg bg-neutral-900"><IconLinkedIn className="w-5 h-5 text-sky-400" /></span>
                  <div><div className="font-semibold">LinkedIn</div><div className="text-xs text-white/60">in/jasoneml</div></div>
                </a>
                <a href="https://wa.me/6281260000488" target="_blank" className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 hover:border-cyan-400/70 transition">
                  <span className="p-2 rounded-lg bg-neutral-900"><IconWhatsApp className="w-5 h-5 text-green-400" /></span>
                  <div><div className="font-semibold">WhatsApp</div><div className="text-xs text-white/60">+62 812-6000-0488</div></div>
                </a>
                <a href="https://github.com/osas" target="_blank" className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 hover:border-cyan-400/70 transition">
                  <span className="p-2 rounded-lg bg-neutral-900"><IconGitHub className="w-5 h-5 text-white" /></span>
                  <div><div className="font-semibold">GitHub</div><div className="text-xs text-white/60">@namakdm</div></div>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right column - Comments (OPAK) */}
          <CommentsCard
            name={name} setName={setName}
            message={message} setMessage={setMessage}
            file={file} setFile={setFile}
            onPick={onPick} onSubmit={onSubmit}
            comments={comments}
          />
        </div>
      </div>
    </section>
  );
}

function CommentsCard({name,setName,message,setMessage,file,setFile,onPick,onSubmit,comments}){
  return (
    <Reveal className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-800 text-cyan-300">💬</span>
        <h3 className="text-lg font-semibold">Comments <span className="text-white/50">({comments.length})</span></h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid md:grid-cols-1 gap-3">
          <div>
            <label className="text-sm text-white/70">Name <span className="text-cyan-300">*</span></label>
            <input
              value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter your name"
              className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 outline-none
                         focus:border-cyan-400 hover:border-cyan-400/70"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Message <span className="text-cyan-300">*</span></label>
            <textarea
              value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write your message here..." rows={4}
              className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 outline-none
                         focus:border-cyan-400 hover:border-cyan-400/70 resize-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Profile Photo <span className="text-white/40">(optional)</span></label>
          <label className="mt-1 block cursor-pointer bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 hover:border-cyan-400/70 transition">
            <input type="file" accept="image/*" onChange={onPick} className="hidden" />
            <div className="flex items-center justify-between text-white/70">
              <span className="text-sm">{file ? file.name : 'Choose Profile Photo'}</span>
              <span className="text-xs text-white/50">Max file size: 5MB</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg
                     bg-gradient-to-r from-cyan-500 to-cyan-400 text-white
                     hover:brightness-110 transition shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        >
          <IconSend className="w-5 h-5" />
          <span className="font-semibold">Post Comment</span>
        </button>
      </form>

      {comments.length === 0 ? (
        <div className="mt-5 border border-dashed border-neutral-700 rounded-lg p-6 text-center text-white/60">
          Belum ada komentar. Jadilah yang pertama!
        </div>
      ) : (
        <div className="mt-5 max-h-[480px] lg:max-h-[560px] overflow-y-auto pr-1 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3">
              <div className="flex items-start gap-3">
                {c.photo ? (
                  <img src={c.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold">
                    {c.name?.slice(0,2)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{c.name}</span>
                    <span className="ml-auto text-xs text-white/50">{c.date}</span>
                  </div>
                  <p className="text-white/80 mt-1">{c.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Reveal>
  );
}

/* ======== Waktu Indonesia + tema langit ======== */
function nowIn(timeZone) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  }).formatToParts(now);
  const map = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return new Date(`${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`);
}
function hexToRgb(hex){ const h=hex.replace('#',''); const n=parseInt(h,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
function rgbToHex({r,g,b}){ const h=v=>v.toString(16).padStart(2,'0'); return `#${h(Math.round(r))}${h(Math.round(g))}${h(Math.round(b))}`; }
function lerp(a,b,t){ return a+(b-a)*t; }
function lerpColor(c1,c2,t){ const A=hexToRgb(c1),B=hexToRgb(c2); return rgbToHex({r:lerp(A.r,B.r,t),g:lerp(A.g,B.g,t),b:lerp(A.b,B.b,t)}); }
function getSkyTheme(date) {
  const mins = date.getHours()*60 + date.getMinutes();
  const stops = [
    { t:   0, from:'#020617', to:'#0b132b' },
    { t: 270, from:'#050816', to:'#0f172a' },
    { t: 360, from:'#f97316', to:'#f43f5e' },
    { t: 540, from:'#22d3ee', to:'#38bdf8' },
    { t: 690, from:'#f59e0b', to:'#fbbf24' },
    { t: 780, from:'#fbbf24', to:'#fde68a' },
    { t: 930, from:'#60a5fa', to:'#3b82f6' },
    { t:1065, from:'#f59e0b', to:'#fb7185' },
    { t:1140, from:'#7c3aed', to:'#4f46e5' },
    { t:1260, from:'#111827', to:'#0b1020' },
    { t:1440, from:'#020617', to:'#0b132b' },
  ];
  let i = stops.findIndex((s, idx) => mins >= s.t && mins < stops[idx + 1].t);
  if (i < 0) i = stops.length - 2;
  const a = stops[i], b = stops[i+1];
  const t = (mins - a.t) / (b.t - a.t);
  const from = lerpColor(a.from, b.from, t);
  const to   = lerpColor(a.to,   b.to,   t);

  const h = date.getHours();
  let greeting = 'Good Night', icon='moon';
  if (h >= 5 && h < 12) { greeting='Good Morning';  icon='sun'; }
  else if (h >= 12 && h < 17) { greeting='Good Afternoon'; icon='sun'; }
  else if (h >= 17 && h < 20) { greeting='Good Evening';   icon='sun'; }
  return { from, to, greeting, icon };
}

/* ================== Footer Stats (Visitors + Dynamic Sky) ================== */
function FooterStats() {
  const [visitors, setVisitors] = useState(null);
  const [now, setNow] = useState(() => nowIn('Asia/Jakarta'));

  useEffect(() => {
    const timer = setInterval(() => setNow(nowIn('Asia/Jakarta')), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const NAMESPACE = 'osas-portfolio';
    const key = (typeof window !== 'undefined' ? window.location.hostname : 'local') + '-main';
    const encodedKey = encodeURIComponent(key);
    const hit = async () => {
      try {
        const counted = sessionStorage.getItem('visited_session');
        if (!counted) {
          const r = await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${encodedKey}`);
          const d = await r.json();
          setVisitors(d.value ?? null);
          sessionStorage.setItem('visited_session', '1');
        } else {
          const r = await fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${encodedKey}`);
          const d = await r.json();
          setVisitors(d.value ?? null);
        }
      } catch {
        try {
          const cur = Number(localStorage.getItem('visitors_fallback') || '0') + 1;
          localStorage.setItem('visitors_fallback', String(cur));
          setVisitors(cur);
        } catch { setVisitors(null); }
      }
    };
    hit();
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const sky = getSkyTheme(now);

  return (
    <div className="relative z-20 w-full px-4 sm:px-6 md:px-12 xl:px-20 py-12">
      <div className="mx-auto w-full md:max-w-[1200px] xl:max-w-[1400px] flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 bg-gradient-to-r from-cyan-700 to-sky-600 shadow-lg text-white">
          <IconEye className="w-5 h-5" />
          <span className="font-semibold">{visitors === null ? '—' : visitors.toLocaleString()} Visitors</span>
        </div>
        <div
          className="inline-flex items-center gap-3 rounded-full px-6 py-3 shadow-lg text-white font-semibold transition-[background] duration-500"
          style={{ backgroundImage: `linear-gradient(90deg, ${sky.from}, ${sky.to})` }}
        >
          {sky.icon === 'moon' ? <IconMoon className="w-5 h-5" /> : <IconSun className="w-5 h-5" />}
          <span>{sky.greeting} – {hh}:{mm}</span>
        </div>
      </div>
    </div>
  );
}

/* ================== 3D Name Tag ================== */
function Band({ maxSpeed = 50, minSpeed = 10, isMobile = false }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();

  const baseLinDamp = isMobile ? 1.2 : 4;
  const baseAngDamp = isMobile ? 1.2 : 4;
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: baseAngDamp, linearDamping: baseLinDamp };

  const { nodes, materials } = useGLTF(GLTF_PATH);
  const texture = useTexture(TEXTURE_PATH);
  const { width, height } = useThree((s) => s.size);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragOffset, setDragOffset] = useState(null);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], isMobile ? 0.8 : 1]);
  useRopeJoint(j1, j2,   [[0, 0, 0], [0, 0, 0], isMobile ? 0.8 : 1]);
  useRopeJoint(j2, j3,   [[0, 0, 0], [0, 0, 0], isMobile ? 0.8 : 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) { document.body.style.cursor = dragOffset ? 'grabbing' : 'grab'; return () => void (document.body.style.cursor = 'auto'); }
  }, [hovered, dragOffset]);

  useFrame((state, delta) => {
    if (dragOffset) {
      const v2 = new THREE.Vector3().set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(v2).sub(state.camera.position).normalize();
      v2.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: v2.x - dragOffset.x, y: v2.y - dragOffset.y, z: v2.z - dragOffset.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const d = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + d * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  const groupPos = isMobile ? [0, 2.4, 0] : [3, 4, 0];
  const j1Pos   = isMobile ? [0, -0.22, 0] : [0.5, 0, 0];
  const j2Pos   = isMobile ? [0, -0.45, 0] : [1.0, 0, 0];
  const j3Pos   = isMobile ? [0, -0.68, 0] : [1.5, 0, 0];
  const cardPos = isMobile ? [0, -0.98, 0] : [2.0, 0, 0];

  const onDown = (e) => { e.target.setPointerCapture?.(e.pointerId); setDragOffset(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))); 
    if (isMobile) { [card, j1, j2, j3].forEach((rb) => { rb.current?.setLinearDamping?.(0.6); rb.current?.setAngularDamping?.(0.6); }); }
  };
  const onUp = (e) => { e.target.releasePointerCapture?.(e.pointerId); setDragOffset(null);
    [card, j1, j2, j3].forEach((rb) => { rb.current?.setLinearDamping?.(baseLinDamp); rb.current?.setAngularDamping?.(baseAngDamp); });
  };

  return (
    <>
      <group position={groupPos}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={j1Pos} ref={j1} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={j2Pos} ref={j2} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={j3Pos} ref={j3} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>

        <RigidBody position={cardPos} ref={card} {...segmentProps} type={dragOffset ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, isMobile ? -1.05 : -1.2, -0.05] }
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            {...(!isMobile ? { onPointerDown: onDown, onPointerUp: onUp } : {})}
          >
            {isMobile && (
              <mesh position={[0, 0.35, 0]} onPointerDown={onDown} onPointerUp={onUp}>
                <circleGeometry args={[0.32, 24]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}

            <mesh geometry={nodes.card.geometry}>
              <meshBasicMaterial map={materials.base.map} toneMapped={false} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}
