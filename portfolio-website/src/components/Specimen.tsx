import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { rng } from '../lib/motion';

const CENTER = { x: 300, y: 372 };
const VIEW = { w: 600, h: 780 };

const deg = (value: number) => (value * Math.PI) / 180;
const polar = (angle: number, radius: number) => ({
  x: CENTER.x + radius * Math.sin(deg(angle)),
  y: CENTER.y - radius * Math.cos(deg(angle)),
});
const pt = (point: { x: number; y: number }) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

const petalPath = (length: number, width: number) =>
  `M${CENTER.x},${CENTER.y} C ${CENTER.x - width},${CENTER.y - length * 0.3} ${
    CENTER.x - width * 0.72
  },${CENTER.y - length * 0.78} ${CENTER.x},${CENTER.y - length} C ${
    CENTER.x + width * 0.72
  },${CENTER.y - length * 0.78} ${CENTER.x + width},${CENTER.y - length * 0.3} ${CENTER.x},${CENTER.y} Z`;

// Three petal layers, each with its own length, width and phase.
const OUTER = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30,
  length: 250 + (i % 3) * 18 + (i % 2) * 8,
  width: 58 + (i % 2) * 16,
}));

const MID = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30 + 15,
  length: 168 + (i % 3) * 14 + (i % 2) * 6,
  width: 40 + (i % 2) * 6,
}));

const INNER = Array.from({ length: 8 }, (_, i) => ({
  angle: i * 45 + 22,
  length: 94 + (i % 2) * 22,
  width: 28,
}));

// Veins: a central midrib plus two pairs of side veins per outer petal.
const veinPaths = (angle: number, length: number) =>
  [0, -14, 14].map((offset, index) => {
    const bend = index === 0 ? 5 : offset * 0.6;
    const reach = index === 0 ? 0.92 : 0.8;
    return `M${CENTER.x},${CENTER.y} Q ${pt(polar(angle + bend, length * 0.5))} ${pt(
      polar(angle + offset * 0.4, length * reach),
    )}`;
  });

// Stamens radiating from the core, each ending in a small pulsing node.
const STAMENS = Array.from({ length: 36 }, (_, i) => {
  const angle = i * 10;
  const outer = 84 + (i % 3) * 24;
  return {
    i,
    d: `M${pt(polar(angle, 30))} Q ${pt(polar(angle + 7, (30 + outer) / 2))} ${pt(polar(angle + 2, outer))}`,
    tip: polar(angle + 2, outer),
  };
});

const SEEDS = Array.from({ length: 48 }, (_, i) => ({
  i,
  at: polar(i * 7.5, 150 + (i % 2) * 8),
}));

const FILAMENTS = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * 360 + 7;
  const radius = 236 + (i % 4) * 22;
  return {
    i,
    d: `M${CENTER.x},${CENTER.y} C ${pt(polar(angle + 38, radius * 0.3))} ${pt(
      polar(angle - 22, radius * 0.72),
    )} ${pt(polar(angle, radius))}`,
  };
});

const PARTICLES = (() => {
  const random = rng(1987);
  return Array.from({ length: 40 }, (_, index) => ({
    index,
    x: CENTER.x + (random() - 0.5) * 500,
    y: CENTER.y + (random() - 0.5) * 640,
    r: 0.8 + random() * 2.2,
  }));
})();

// Hover markers sit on petal tips. Each index is a petal in OUTER.
const MARKER_PETALS = [0, 9, 2, 7];

/** Position of hover marker `index` as percentages of the specimen box. */
export function specimenAnchor(index: number) {
  const petal = OUTER[MARKER_PETALS[index % MARKER_PETALS.length]];
  const tip = polar(petal.angle, petal.length * 0.96);
  return { x: (tip.x / VIEW.w) * 100, y: (tip.y / VIEW.h) * 100 };
}

export function Specimen({ children }: { children?: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      wrap.style.setProperty('--mx', String(Math.max(-1, Math.min(1, x * 2))));
      wrap.style.setProperty('--my', String(Math.max(-1, Math.min(1, y * 2))));
    };
    const onLeave = () => {
      wrap.style.setProperty('--mx', '0');
      wrap.style.setProperty('--my', '0');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const stem = `M${CENTER.x},${CENTER.y} C 312,470 286,566 306,656 C 316,702 300,742 298,776`;

  return (
    <div className="specimen-wrap" ref={wrapRef}>
      <svg
        className="specimen"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label="Abstract neural bloom: a generative specimen mapping the research practice"
      >
        <defs>
          <linearGradient id="petalFill" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" className="stop-c" stopOpacity="0.75" />
            <stop offset="38%" className="stop-b" stopOpacity="0.62" />
            <stop offset="72%" className="stop-d" stopOpacity="0.85" />
            <stop offset="100%" className="stop-a" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="stemFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="stop-b" />
            <stop offset="100%" className="stop-c" stopOpacity="0.5" />
          </linearGradient>

          <radialGradient id="coreFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="stop-core" stopOpacity="1" />
            <stop offset="45%" className="stop-a" stopOpacity="0.9" />
            <stop offset="100%" className="stop-b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="haloFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="stop-a" stopOpacity="0.32" />
            <stop offset="60%" className="stop-b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* halo + orbit rings */}
        <circle cx={CENTER.x} cy={CENTER.y} r="290" fill="url(#haloFill)" filter="url(#softGlow)" />

        <g className="specimen__halo" fill="none" stroke="var(--line-strong)" strokeWidth="0.7">
          <circle cx={CENTER.x} cy={CENTER.y} r="262" strokeDasharray="1 6" />
          <circle cx={CENTER.x} cy={CENTER.y} r="306" strokeDasharray="26 14 2 14" opacity="0.6" />
        </g>

        <g className="specimen__halo-rev" fill="none" stroke="var(--line)" strokeWidth="0.6">
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="312" ry="200" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="200" ry="312" opacity="0.6" />
        </g>

        {/* stem, with a tendril and two leaves */}
        <path d={stem} fill="none" stroke="url(#stemFill)" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
        <path d={stem} fill="none" stroke="var(--spec-vein)" strokeWidth="0.7" strokeDasharray="2 6" />
        <path
          d="M306,640 C 340,616 356,650 336,672 C 322,688 310,672 322,660"
          fill="none"
          stroke="var(--spec-vein)"
          strokeWidth="0.7"
          strokeDasharray="2 4"
        />
        <path
          d="M305,566 C 262,542 232,570 230,606 C 264,614 296,596 305,566 Z"
          fill="url(#petalFill)"
          stroke="var(--spec-vein)"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <path
          d="M306,512 C 350,488 378,512 382,544 C 348,556 318,540 306,512 Z"
          fill="url(#petalFill)"
          stroke="var(--spec-vein)"
          strokeWidth="0.8"
          opacity="0.65"
        />

        <g className="specimen__bloom">
          {/* outer layer */}
          <g className="specimen__layer specimen__layer--outer">
            {OUTER.map((petal, index) => (
              <g key={`outer-${index}`} transform={`rotate(${petal.angle} ${CENTER.x} ${CENTER.y})`}>
                <path
                  d={petalPath(petal.length, petal.width)}
                  fill="url(#petalFill)"
                  stroke="var(--spec-vein)"
                  strokeWidth="0.9"
                />
                {veinPaths(0, petal.length).map((d) => (
                  <path key={d} d={d} fill="none" stroke="var(--spec-vein)" strokeWidth="0.5" opacity="0.7" />
                ))}
              </g>
            ))}
          </g>

          {/* middle layer, offset between the outer petals */}
          <g className="specimen__layer specimen__layer--mid">
            {MID.map((petal, index) => (
              <g key={`mid-${index}`} transform={`rotate(${petal.angle} ${CENTER.x} ${CENTER.y})`}>
                <path
                  d={petalPath(petal.length, petal.width)}
                  fill="url(#petalFill)"
                  stroke="var(--spec-vein)"
                  strokeWidth="0.7"
                  opacity="0.72"
                />
                <path
                  d={`M${CENTER.x},${CENTER.y} Q ${CENTER.x},${CENTER.y - petal.length * 0.5} ${CENTER.x},${
                    CENTER.y - petal.length * 0.9
                  }`}
                  fill="none"
                  stroke="var(--spec-vein)"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </g>
            ))}
          </g>

          {/* inner layer */}
          <g className="specimen__layer specimen__layer--inner">
            {INNER.map((petal, index) => (
              <g key={`inner-${index}`} transform={`rotate(${petal.angle} ${CENTER.x} ${CENTER.y})`}>
                <path
                  d={petalPath(petal.length, petal.width)}
                  fill="url(#petalFill)"
                  stroke="var(--spec-vein)"
                  strokeWidth="0.7"
                  opacity="0.7"
                />
              </g>
            ))}
          </g>
        </g>

        {/* stamens and seeds */}
        <g className="specimen__stamens" fill="none" stroke="var(--spec-vein)" strokeWidth="0.5">
          {STAMENS.map((stamen) => (
            <path key={stamen.i} d={stamen.d} opacity="0.7" />
          ))}
          <g fill="var(--spec-core)" stroke="none">
            {STAMENS.map((stamen) => (
              <circle
                key={`tip-${stamen.i}`}
                className="specimen__node"
                cx={stamen.tip.x}
                cy={stamen.tip.y}
                r="2"
                style={{ '--i': stamen.i } as CSSProperties}
              />
            ))}
          </g>
        </g>

        <g className="specimen__seeds" fill="var(--accent)">
          {SEEDS.map((seed) => (
            <circle key={seed.i} cx={seed.at.x} cy={seed.at.y} r="1.4" opacity="0.6" />
          ))}
        </g>

        {/* filaments / dendrites */}
        <g className="specimen__filaments" fill="none" stroke="var(--spec-vein)" strokeWidth="0.7">
          {FILAMENTS.map((filament) => (
            <path
              key={filament.i}
              className="specimen__filament"
              d={filament.d}
              style={{ animationDelay: `${filament.i * -0.8}s` }}
            />
          ))}
        </g>

        {/* veins over the outer petals' lower halves, for depth */}
        <g fill="none" stroke="var(--spec-vein)" strokeWidth="0.4" opacity="0.5">
          {OUTER.filter((_, index) => index % 3 === 0).map((petal) => (
            <path
              key={`lower-${petal.angle}`}
              d={`M${CENTER.x},${CENTER.y} Q ${pt(polar(petal.angle + 9, petal.length * 0.25))} ${pt(
                polar(petal.angle + 3, petal.length * 0.62),
              )}`}
            />
          ))}
        </g>

        {/* core */}
        <circle cx={CENTER.x} cy={CENTER.y} r="54" fill="url(#coreFill)" />
        <circle cx={CENTER.x} cy={CENTER.y} r="15" fill="none" stroke="var(--spec-core)" strokeWidth="0.9" opacity="0.9" />
        <circle cx={CENTER.x} cy={CENTER.y} r="5" fill="var(--spec-core)" />

        {/* particles */}
        <g fill="var(--accent)">
          {PARTICLES.map((particle) => (
            <circle
              key={particle.index}
              className="specimen__node"
              cx={particle.x}
              cy={particle.y}
              r={particle.r}
              style={{ '--i': particle.index } as CSSProperties}
            />
          ))}
        </g>

        {/* specimen annotation ticks */}
        <g stroke="var(--line-strong)" strokeWidth="0.8" fill="none">
          <rect x="426" y="196" width="7" height="7" />
          <path d="M430 203 v22" strokeDasharray="2 4" />
          <rect x="196" y="500" width="6" height="6" />
          <path d="M199 506 v18" strokeDasharray="2 4" />
        </g>
      </svg>
      {children}
    </div>
  );
}
