'use client';

import { useEffect, useRef } from 'react';

const DOT_SPACING = 26;
const DOT_R = 1.1;

const DOT_PALETTE = [
  [99, 102, 241],
  [168, 85, 247],
  [236, 72, 153],
  [129, 140, 248],
  [196, 181, 253],
];

const P_COUNT = 58;
const LINK_DIST = 115;

const P_COLORS = [
  'rgba(99,102,241,',
  'rgba(168,85,247,',
  'rgba(236,72,153,',
  'rgba(129,140,248,',
];

export default function PremiumBackground() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;

    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');

    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;

    let W;
    let H;
    let pts;
    let dotField;
    let time = 0;
    let raf;

    function resize() {
      W = canvas.width = wrap.offsetWidth;
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
            cx:
              c * DOT_SPACING +
              (r % 2 === 0 ? 0 : DOT_SPACING * 0.5),
            cy: r * DOT_SPACING,
            pal:
              DOT_PALETTE[
                Math.floor(Math.random() * DOT_PALETTE.length)
              ],
            phase: rand(0, Math.PI * 2),
            speed: rand(0.006, 0.016),
          });
        }
      }
    }

    function initParticles() {
      pts = Array.from({ length: P_COUNT }, () => ({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(1.4, 3.0),
        vx: rand(-0.2, 0.2),
        vy: rand(-0.16, 0.16),
        col:
          P_COLORS[
            Math.floor(Math.random() * P_COLORS.length)
          ],
        alpha: rand(0.22, 0.52),
        pulse: rand(0, Math.PI * 2),
        pspeed: rand(0.008, 0.02),
      }));
    }

    function drawDots() {
      const cx = W * 0.5;
      const cy = H * 0.5;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      for (const d of dotField) {
        d.phase += d.speed;

        const dist = Math.sqrt(
          (d.cx - cx) ** 2 + (d.cy - cy) ** 2
        );

        const radialFade =
          1 - (dist / maxDist) * 0.55;

        const wave =
          0.5 +
          0.5 *
            Math.sin(
              d.phase +
                (d.cx / W) * 3.5 +
                (d.cy / H) * 2.5 +
                time * 0.6
            );

        const [r, g, b] = d.pal;

        ctx.beginPath();
        ctx.arc(
          d.cx,
          d.cy,
          DOT_R + wave * 0.5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(${r},${g},${b},${
          lerp(0.06, 0.22, wave) * radialFade
        })`;

        ctx.fill();
      }
    }

    function drawParticles() {
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];

        a.x += a.vx;
        a.y += a.vy;
        a.pulse += a.pspeed;

        if (a.x < -10) a.x = W + 10;
        if (a.x > W + 10) a.x = -10;
        if (a.y < -10) a.y = H + 10;
        if (a.y > H + 10) a.y = -10;

        ctx.beginPath();

        ctx.arc(
          a.x,
          a.y,
          a.r + Math.sin(a.pulse) * 0.7,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          a.col +
          a.alpha *
            (0.72 + 0.28 * Math.sin(a.pulse)) +
          ')';

        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;

          const dist = Math.sqrt(
            dx * dx + dy * dy
          );

          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            ctx.strokeStyle = `rgba(
              99,
              102,
              241,
              ${0.1 * (1 - dist / LINK_DIST)}
            )`;

            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);

      time += 0.012;

      drawDots();
      drawParticles();

      raf = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    const observer = new ResizeObserver(() => {
      resize();
      initParticles();
    });

    observer.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-[1]"
      />

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="float-orb orb-1" />
        <div className="float-orb orb-2" />
        <div className="float-orb orb-3" />
        <div className="float-orb orb-4" />
        <div className="float-orb orb-5" />
        <div className="float-orb orb-6" />
      </div>

      <style jsx>{`
        .float-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(6px);
          will-change: transform;
        }

        .orb-1 {
          top: -120px;
          left: -80px;
          width: clamp(260px, 40vw, 420px);
          height: clamp(260px, 40vw, 420px);
          background: radial-gradient(
            circle at 38% 38%,
            rgba(167, 139, 250, 0.3),
            rgba(129, 140, 248, 0.13) 55%,
            transparent 75%
          );
          animation: floatOrb1 18s ease-in-out infinite;
        }

        .orb-2 {
          top: -60px;
          right: -60px;
          width: clamp(200px, 34vw, 340px);
          height: clamp(200px, 34vw, 340px);
          background: radial-gradient(
            circle at 60% 40%,
            rgba(240, 171, 252, 0.24),
            rgba(196, 181, 253, 0.11) 55%,
            transparent 75%
          );
          animation: floatOrb2 22s ease-in-out infinite;
        }

        .orb-3 {
          bottom: -80px;
          left: 10%;
          width: clamp(180px, 28vw, 280px);
          height: clamp(180px, 28vw, 280px);
          background: radial-gradient(
            circle at 50% 50%,
            rgba(253, 230, 138, 0.22),
            rgba(251, 207, 232, 0.13) 55%,
            transparent 75%
          );
          animation: floatOrb3 26s ease-in-out infinite;
        }

        .orb-4 {
          top: 30%;
          right: 8%;
          width: clamp(140px, 22vw, 220px);
          height: clamp(140px, 22vw, 220px);
          background: radial-gradient(
            circle at 45% 55%,
            rgba(165, 180, 252, 0.24),
            rgba(221, 214, 254, 0.11) 60%,
            transparent 80%
          );
          animation: floatOrb4 20s ease-in-out infinite;
        }

        .orb-5 {
          bottom: 10%;
          right: 20%;
          width: 160px;
          height: 160px;
          background: radial-gradient(
            circle at 40% 40%,
            rgba(196, 181, 253, 0.26),
            transparent 70%
          );
          animation: floatOrb5 15s ease-in-out infinite;
        }

        .orb-6 {
          top: 55%;
          left: 5%;
          width: 100px;
          height: 100px;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(167, 139, 250, 0.22),
            transparent 70%
          );
          animation: floatOrb6 12s ease-in-out infinite;
        }

        @keyframes floatOrb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          30% { transform: translate(28px,22px) scale(1.06); }
          65% { transform: translate(-18px,14px) scale(0.96); }
        }

        @keyframes floatOrb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-24px,18px) scale(0.94); }
          70% { transform: translate(16px,-20px) scale(1.05); }
        }

        @keyframes floatOrb3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(32px,-26px) scale(1.08); }
        }

        @keyframes floatOrb4 {
          0%,100% { transform: translate(0,0) scale(1); }
          35% { transform: translate(-20px,16px) scale(0.93); }
          70% { transform: translate(14px,-12px) scale(1.04); }
        }

        @keyframes floatOrb5 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-16px,20px) scale(1.1); }
        }

        @keyframes floatOrb6 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(12px,-14px); }
        }
      `}</style>
    </div>
  );
}