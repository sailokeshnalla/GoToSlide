'use client';

import { useRef, useEffect } from 'react'; // ← added useEffect
import SearchBar from './SearchBar';
import { motion } from 'framer-motion';

const TRENDING = ['Loop', 'Mind Map', 'Timeline', 'Venn Diagram'];

// ── Particle config ─────────────────────────────────────────────
const DOT_SPACING = 26;
const DOT_R       = 1.1;
const DOT_PALETTE = [
  [241, 105, 23],
  [252, 189, 36],
  [255, 165, 0],
  [250, 128, 114],
  [255, 215, 0],
];
const P_COUNT     = 58;
const LINK_DIST   = 115;
const P_COLORS = [
  'rgba(241,105,23,',
  'rgba(252,189,36,',
  'rgba(255,165,0,',
  'rgba(250,128,114,',
];
// ────────────────────────────────────────────────────────────────

export default function HeroSection({ searchQuery, setSearchQuery, onSearch }) {
  const inputRef  = useRef(null);
  const canvasRef = useRef(null); // ← added
  const wrapRef   = useRef(null); // ← added

  // ── Particle canvas effect ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');

    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;
    let W, H, pts, dotField, time = 0, raf;

    function resize() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
      buildDotField();
    }

    function buildDotField() {
      dotField = [];
      const cols = Math.ceil(W / DOT_SPACING) + 1;
      const rows = Math.ceil(H / DOT_SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotField.push({
            cx:    c * DOT_SPACING + (r % 2 === 0 ? 0 : DOT_SPACING * 0.5),
            cy:    r * DOT_SPACING,
            pal:   DOT_PALETTE[Math.floor(Math.random() * DOT_PALETTE.length)],
            phase: rand(0, Math.PI * 2),
            speed: rand(0.006, 0.016),
          });
        }
      }
    }

    function initParticles() {
      pts = Array.from({ length: P_COUNT }, () => ({
        x:      rand(0, W),
        y:      rand(0, H),
        r:      rand(1.4, 3.0),
        vx:     rand(-0.20, 0.20),
        vy:     rand(-0.16, 0.16),
        col:    P_COLORS[Math.floor(Math.random() * P_COLORS.length)],
        alpha:  rand(0.22, 0.52),
        pulse:  rand(0, Math.PI * 2),
        pspeed: rand(0.008, 0.020),
      }));
    }

    function drawDots() {
      const cx = W * 0.5, cy = H * 0.5;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      for (const d of dotField) {
        d.phase += d.speed;
        const dist = Math.sqrt((d.cx - cx) ** 2 + (d.cy - cy) ** 2);
        const radialFade = 1 - (dist / maxDist) * 0.55;
        const wave = 0.5 + 0.5 * Math.sin(
          d.phase + (d.cx / W) * 3.5 + (d.cy / H) * 2.5 + time * 0.6
        );
        const [r, g, b] = d.pal;
        ctx.beginPath();
        ctx.arc(d.cx, d.cy, DOT_R + wave * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${lerp(0.06, 0.22, wave) * radialFade})`;
        ctx.fill();
      }
    }

    function drawParticles() {
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        a.x += a.vx; a.y += a.vy; a.pulse += a.pspeed;
        if (a.x < -10) a.x = W + 10;
        if (a.x > W + 10) a.x = -10;
        if (a.y < -10) a.y = H + 10;
        if (a.y > H + 10) a.y = -10;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + Math.sin(a.pulse) * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = a.col + (a.alpha * (0.72 + 0.28 * Math.sin(a.pulse))) + ')';
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(241, 105, 23,${0.10 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      time += 0.012;
      drawDots();
      drawParticles();
      raf = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    const ro = new ResizeObserver(() => { resize(); initParticles(); });
    ro.observe(wrap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  // ────────────────────────────────────────────────────────────

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch(searchQuery);
  };

  const handleTrending = (tag) => {
    setSearchQuery(tag);
    onSearch(tag);
  };

  return (
    <section ref={wrapRef} className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white"> {/* ← added ref={wrapRef} */}

      {/* ── Particle canvas (added) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Floating orb background — UNTOUCHED */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="float-orb orb-1" />
        <div className="float-orb orb-2" />
        <div className="float-orb orb-3" />
        <div className="float-orb orb-4" />
        <div className="float-orb orb-5" />
        <div className="float-orb orb-6" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: 14, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.05, ease: [0.2, 0.6, 0.2, 1] }}
          className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-[#fcbd24]/30 text-[#f16917] text-[13px] font-medium mb-8 bg-white/50 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcbd24] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f16917]" />
          </span>
          <em className="font-serif italic font-normal tracking-wide">Next-Gen Graphic Intelligence</em>
        </motion.span>

        {/* Heading */}
        <h1
          className="text-[clamp(40px,6.2vw,64px)] font-bold tracking-tight mb-6 leading-[1.06] text-[#0f0f1a]"
        >
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 14, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.15, ease: [0.2, 0.6, 0.2, 1] }}
          >
            Elevate your vision
          </motion.span>

          <motion.span
            className="block mt-1"
            initial={{ opacity: 0, y: 14, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.25, ease: [0.2, 0.6, 0.2, 1] }}
          >
            with <span className="shine-text font-extrabold tracking-tight">GoToSlide</span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.6, 0.2, 1] }}
          className="text-[clamp(15px,1.5vw,17px)] font-medium leading-[1.6] tracking-tight text-slate-500 max-w-[720px] mx-auto mb-10"
        >
          Turn your ideas into polished, presentation-ready visuals with AI-powered templates for funnels, timelines, organizational charts, and more. Create, customize, and download professional slides in minutes.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.45, ease: [0.2, 0.6, 0.2, 1] }}
        >
          <div onKeyDown={handleKeyDown}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>

          {/* Trending tags */}
          <div
            className="mt-6 flex flex-wrap justify-center items-center gap-2 text-[13px]"
          >
            <span className="font-medium text-slate-400 mr-2">Trending searches:</span>
            {TRENDING.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTrending(tag)}
                className="relative overflow-hidden inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-slate-500 transition-colors duration-150 ease-in-out hover:bg-[#f16917]/10 hover:text-[#f16917] bg-[#f16917]/5 backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=EB+Garamond:wght@400;500&display=swap');

        .shine-text {
          background: linear-gradient(
            110deg,
            #f16917 0%,
            #f16917 40%,
            #fff 50%,
            #f16917 60%,
            #fcbd24 100%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3.5s linear infinite;
        }

        @keyframes shine {
          to {
            background-position: -200% center;
          }
        }

        .float-orb {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }
        .orb-1 {
          top: -120px; left: -80px;
          width: clamp(260px, 40vw, 420px);
          height: clamp(260px, 40vw, 420px);
          background: radial-gradient(circle at 38% 38%, rgba(241, 105, 23, 0.15), rgba(252, 189, 36, 0.1) 55%, transparent 75%);
          animation: floatOrb1 18s ease-in-out infinite;
        }
        .orb-2 {
          top: -60px; right: -60px;
          width: clamp(200px, 34vw, 340px);
          height: clamp(200px, 34vw, 340px);
          background: radial-gradient(circle at 60% 40%, rgba(252, 189, 36, 0.15), rgba(241, 105, 23, 0.1) 55%, transparent 75%);
          animation: floatOrb2 22s ease-in-out infinite;
        }
        .orb-3 {
          bottom: -80px; left: 10%;
          width: clamp(180px, 28vw, 280px);
          height: clamp(180px, 28vw, 280px);
          background: radial-gradient(circle at 50% 50%, rgba(252, 189, 36, 0.12), rgba(241, 105, 23, 0.08) 55%, transparent 75%);
          animation: floatOrb3 26s ease-in-out infinite;
        }
        .orb-4 {
          top: 30%; right: 8%;
          width: clamp(140px, 22vw, 220px);
          height: clamp(140px, 22vw, 220px);
          background: radial-gradient(circle at 45% 55%, rgba(241, 105, 23, 0.12), rgba(252, 189, 36, 0.08) 60%, transparent 80%);
          animation: floatOrb4 20s ease-in-out infinite;
        }
        .orb-5 {
          bottom: 10%; right: 20%;
          width: 160px; height: 160px;
          background: radial-gradient(circle at 40% 40%, rgba(252, 189, 36, 0.12), transparent 70%);
          animation: floatOrb5 15s ease-in-out infinite;
        }
        .orb-6 {
          top: 55%; left: 5%;
          width: 100px; height: 100px;
          background: radial-gradient(circle at 50% 50%, rgba(241, 105, 23, 0.12), transparent 70%);
          animation: floatOrb6 12s ease-in-out infinite;
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30%       { transform: translate(28px, 22px) scale(1.06); }
          65%       { transform: translate(-18px, 14px) scale(0.96); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-24px, 18px) scale(0.94); }
          70%       { transform: translate(16px, -20px) scale(1.05); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(32px, -26px) scale(1.08); }
        }
        @keyframes floatOrb4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          35%       { transform: translate(-20px, 16px) scale(0.93); }
          70%       { transform: translate(14px, -12px) scale(1.04); }
        }
        @keyframes floatOrb5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-16px, 20px) scale(1.1); }
        }
        @keyframes floatOrb6 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(12px, -14px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .float-orb { animation: none; }
        }
      `}</style>
    </section>
  );
}