'use client';

import { motion } from 'framer-motion';

const META = {
  'Funnel':              { color: '#10B981', label: 'Funnels' },
  'Loop':                { color: '#7C3AED', label: 'Loops' },
  'Matrix':              { color: '#10B981', label: 'Matrices' },
  'Mind Map':            { color: '#06B6D4', label: 'Mind Maps' },
  'n point infographic': { color: '#F59E0B', label: 'Infographics' },
  'Organizational Tree': { color: '#F59E0B', label: 'Org Trees' },
  'Process & Flow':      { color: '#A855F7', label: 'Process & Flow' },
  'Steps':   { color: '#EF4444', label: 'Steps' },
  'Timeline':            { color: '#6366F1', label: 'Timelines' },
  'Venn Diagram':        { color: '#8B5CF6', label: 'Venn Diagrams' },
  'All':                 { color: '#7C3AED', label: 'Templates' },
};

const ease = [0.22, 1, 0.36, 1];
const popIn = { transformBox: 'fill-box', transformOrigin: 'center' };

function Anim({ category, color }) {
  switch (category) {

    // Funnel: layers stack top to bottom, narrowing
    case 'Funnel': {
      const layers = [
        { y: 10, w: 260, label: 'Awareness' },
        { y: 48, w: 190, label: 'Interest' },
        { y: 86, w: 130, label: 'Decision' },
        { y: 124, w: 70, label: 'Action' },
      ];
      return (
        <svg viewBox="0 0 320 160" className="w-full">
          {layers.map((l, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{ delay: i * 0.15, duration: 0.4, ease }}>
              <rect x={(320 - l.w) / 2} y={l.y} width={l.w} height="30"
                rx="6" fill={`${color}${i === 0 ? '30' : i === 1 ? '50' : i === 2 ? '70' : 'AA'}`}
                stroke={color} strokeWidth="1.5" />
            </motion.g>
          ))}
        </svg>
      );
    }

    // Loop: circle draws itself with arrows suggesting cycle
   case 'Loop': {
  return (
    <svg viewBox="0 0 320 160" className="w-full overflow-visible">
      {/* Background infinity trace */}
      <path
        d="M160 80 C160 50, 200 30, 230 50 C260 70, 260 90, 230 110 C200 130, 160 110, 160 80 C160 50, 120 30, 90 50 C60 70, 60 90, 90 110 C120 130, 160 110, 160 80"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Animated stroke that draws the infinity symbol once */}
      <motion.path
        d="M160 80 C160 50, 200 30, 230 50 C260 70, 260 90, 230 110 C200 130, 160 110, 160 80 C160 50, 120 30, 90 50 C60 70, 60 90, 90 110 C120 130, 160 110, 160 80"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.2 }}
      />

      {/* Dot that travels along the infinity path */}
      <motion.circle
        r="8"
        fill={color}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: '100%' }}
        style={{
          offsetPath: "path('M160 80 C160 50, 200 30, 230 50 C260 70, 260 90, 230 110 C200 130, 160 110, 160 80 C160 50, 120 30, 90 50 C60 70, 60 90, 90 110 C120 130, 160 110, 160 80')",
          offsetRotate: '0deg',
        }}
        transition={{ duration: 1.6, ease: 'linear', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.2 }}
      />
    </svg>
  );
}

    // Matrix: 2x2 grid builds quadrant by quadrant
    case 'Matrix': {
      const quads = [
        { x: 50,  y: 20,  label: 'High / Low' },
        { x: 175, y: 20,  label: 'High / High' },
        { x: 50,  y: 90,  label: 'Low / Low' },
        { x: 175, y: 90,  label: 'Low / High' },
      ];
      const qColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
      return (
        <svg viewBox="0 0 320 160" className="w-full">
          <line x1="160" y1="15" x2="160" y2="155" stroke="#E2E8F0" strokeWidth="2" />
          <line x1="45"  y1="87" x2="275" y2="87" stroke="#E2E8F0" strokeWidth="2" />
          {quads.map((q, i) => (
            <motion.rect key={i} x={q.x} y={q.y} width="110" height="62" rx="10"
              fill={`${qColors[i]}1A`} stroke={qColors[i]} strokeWidth="2" style={popIn}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.13, type: 'spring', stiffness: 280, damping: 18 }} />
          ))}
        </svg>
      );
    }

    // Mind Map: central node with branches radiating out
    case 'Mind Map': {
      const branches = [
        { x: 80,  y: 40  },
        { x: 240, y: 40  },
        { x: 60,  y: 120 },
        { x: 260, y: 120 },
        { x: 160, y: 148 },
      ];
      return (
        <svg viewBox="0 0 320 165" className="w-full">
          {branches.map((b, i) => (
            <motion.line key={i} x1="160" y1="80" x2={b.x} y2={b.y}
              stroke={color} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease }} />
          ))}
          {branches.map((b, i) => (
            <motion.circle key={i} cx={b.x} cy={b.y} r="16"
              fill={`${color}18`} stroke={color} strokeWidth="2" style={popIn}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300, damping: 16 }} />
          ))}
          <motion.circle cx="160" cy="80" r="26"
            fill={color} style={popIn}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0, type: 'spring', stiffness: 260, damping: 16 }} />
        </svg>
      );
    }

    // N-Point Infographic: bullet rows slide in one by one
    case 'n point infographic': {
      const rows = [30, 68, 106, 144];
      return (
        <svg viewBox="0 0 320 180" className="w-full">
          {rows.map((y, i) => (
            <motion.g key={i}
              initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease }}>
              <circle cx="42" cy={y + 14} r="10" fill={`${color}20`} stroke={color} strokeWidth="2" />
              <text x="42" y={y + 19} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{i + 1}</text>
              <rect x="62" y={y + 6} width="180" height="10" rx="5" fill={`${color}25`} />
              <rect x="62" y={y + 22} width="120" height="7" rx="3.5" fill="#E2E8F0" />
            </motion.g>
          ))}
        </svg>
      );
    }

    // Org Tree: top node, connectors draw, child nodes appear
    case 'Organizational Tree': {
      return (
        <svg viewBox="0 0 320 155" className="w-full">
          {['M160 48 C160 75, 90 72, 90 98', 'M160 48 C160 75, 230 72, 230 98'].map((d, i) => (
            <motion.path key={i} d={d} fill="none" stroke={color} strokeWidth="2.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease }} />
          ))}
          {[[160, 32], [90, 114], [230, 114]].map(([cx, cy], i) => (
            <motion.g key={i} style={popIn}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i === 0 ? 0 : 0.55, type: 'spring', stiffness: 300, damping: 16 }}>
              <rect x={cx - 34} y={cy - 17} width="68" height="34" rx="9"
                fill={`${color}18`} stroke={color} strokeWidth="2.5" />
            </motion.g>
          ))}
        </svg>
      );
    }

    // Process & Flow: boxes connected by arrows flowing left to right
    case 'Process & Flow': {
      const steps = [40, 130, 220];
      return (
        <svg viewBox="0 0 320 120" className="w-full">
          {steps.map((x, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.35, ease }}>
              <rect x={x} y="35" width="70" height="50" rx="10"
                fill={`${color}18`} stroke={color} strokeWidth="2.5" />
              {i < steps.length - 1 && (
                <motion.path d={`M${x + 70} 60 L${x + 90} 60`}
                  stroke={color} strokeWidth="2.5" strokeLinecap="round"
                  markerEnd="url(#arrow)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ delay: i * 0.2 + 0.25, duration: 0.2, ease }} />
              )}
            </motion.g>
          ))}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={color} />
            </marker>
          </defs>
        </svg>
      );
    }

    // Steps: rows tick off one by one
    case 'Steps': {
  const stairs = [
    { x: 30,  y: 130, w: 60 },
    { x: 90,  y: 100, w: 60 },
    { x: 150, y: 70,  w: 60 },
    { x: 210, y: 40,  w: 60 },
  ];

  return (
    <svg viewBox="0 0 320 155" className="w-full">
      {stairs.map((s, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.4, ease }}>
          {/* Horizontal step surface */}
          <rect x={s.x} y={s.y} width={s.w} height="8" rx="3"
            fill={color} fillOpacity={0.2 + i * 0.2} stroke={color} strokeWidth="2" />
          {/* Vertical riser */}
          <rect x={s.x} y={s.y + 8} width="8" height={130 - s.y} rx="2"
            fill={color} fillOpacity={0.15} stroke={color} strokeWidth="1.5" />
          {/* Step number */}
          <motion.text x={s.x + 30} y={s.y - 8}
            textAnchor="middle" fontSize="11" fontWeight="800" fill={color}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 + 0.3 }}>
            {i + 1}
          </motion.text>
        </motion.g>
      ))}
      {/* Arrow going up the stairs */}
      <motion.path
        d="M55 126 L115 96 L175 66 L235 36"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray="6 4" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease }} />
    </svg>
  );
}

    // Timeline: horizontal line fills, milestones pop up/down alternately
    case 'Timeline': {
      return (
        <svg viewBox="0 0 320 120" className="w-full">
          <line x1="30" y1="60" x2="290" y2="60" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          <motion.line x1="30" y1="60" x2="290" y2="60" stroke={color} strokeWidth="4" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease }} />
          {[60, 130, 200, 260].map((x, i) => {
            const up = i % 2 === 0;
            return (
              <g key={x}>
                <motion.rect x={x - 2} y={up ? 30 : 60} width="4" height="30" rx="2" fill={color}
                  style={{ transformBox: 'fill-box', transformOrigin: up ? 'bottom' : 'top' }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.18, ease }} />
                <motion.circle cx={x} cy="60" r="8" fill="#fff" stroke={color} strokeWidth="3" style={popIn}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.38 + i * 0.18, type: 'spring', stiffness: 320, damping: 15 }} />
              </g>
            );
          })}
        </svg>
      );
    }

    // Venn Diagram: two circles overlap, intersection highlights
    case 'Venn Diagram': {
      return (
        <svg viewBox="0 0 320 150" className="w-full">
          <motion.circle cx="125" cy="75" r="55"
            fill={`${color}20`} stroke={color} strokeWidth="2.5" style={popIn}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0, type: 'spring', stiffness: 260, damping: 18 }} />
          <motion.circle cx="195" cy="75" r="55"
            fill={`${color}20`} stroke={color} strokeWidth="2.5" style={popIn}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 18 }} />
          <motion.ellipse cx="160" cy="75" rx="26" ry="42"
            fill={`${color}45`} style={popIn}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.38, type: 'spring', stiffness: 280, damping: 18 }} />
        </svg>
      );
    }

    // Default
    default:
      return (
        <svg viewBox="0 0 320 150" className="w-full">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const cx = 30 + (i % 3) * 100;
            const cy = 25 + Math.floor(i / 3) * 65;
            return (
              <motion.rect key={i} x={cx} y={cy} width="80" height="50" rx="10"
                fill={color} fillOpacity={0.85} style={popIn}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }} />
            );
          })}
        </svg>
      );
  }
}

export default function CategoryTransition({ category }) {
  const meta = META[category] || META['All'];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="w-full max-w-sm px-8"
      >
        <Anim category={category} color={meta.color} />
      </motion.div>

      <div className="mt-8 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.color }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <p className="ml-1.5 text-sm font-semibold" style={{ color: meta.color }}>
          Loading {meta.label}…
        </p>
      </div>
    </motion.div>
  );
}