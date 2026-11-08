import { useEffect, useRef } from 'react';
import { prefersReduced } from '../lib/motion';

/*
 * Full-page "research in progress" screen, shown on /research while
 * `projects` in portfolioData.ts is empty. A small spiking network forms
 * on load, then occasional neurons fire and a few signals travel along
 * their synapses. Kept deliberately sparse and slow so it stays calm.
 */

type Node = { hx: number; hy: number; x: number; y: number; ph: number; last: number; glow: number };
type Edge = { a: number; b: number; len: number; order: number; ph: number; glow: number };
type Spike = { e: number; from: number; t0: number };

const STAGES = ['DATA ACQUISITION', 'SIGNAL PROCESSING', 'ANALYSIS', 'WRITE-UP'];

export function ResearchInProgress() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reduced = prefersReduced();
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let adj: number[][] = [];
    let spikes: Spike[] = [];
    let w = 0;
    let h = 0;
    let start = performance.now();
    let raf = 0;
    let nextFire = 0;
    const colors = { line: '', accent: '', node: '', glow: '' };

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors.line = cs.getPropertyValue('--line-strong').trim() || 'rgba(90,14,36,.34)';
      colors.accent = cs.getPropertyValue('--accent').trim() || '#e8799a';
      colors.node = cs.getPropertyValue('--ink-faint').trim() || 'rgba(61,7,24,.58)';
      colors.glow = cs.getPropertyValue('--glow').trim() || 'rgba(232,121,154,.4)';
    };

    const build = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // jittered grid so the network covers the page evenly
      const target = Math.max(16, Math.min(56, Math.round((w * h) / 30000)));
      const cell = Math.sqrt((w * h) / target);
      const cols = Math.max(2, Math.round(w / cell));
      const rows = Math.max(2, Math.round(h / cell));
      const cw = w / cols;
      const ch = h / rows;
      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const hx = (i + 0.15 + Math.random() * 0.7) * cw;
          const hy = (j + 0.15 + Math.random() * 0.7) * ch;
          nodes.push({ hx, hy, x: hx, y: hy, ph: Math.random() * Math.PI * 2, last: -1e9, glow: 0 });
        }
      }

      // connect each neuron to its 2 nearest neighbours
      const seen = new Set<string>();
      edges = [];
      adj = nodes.map(() => []);
      const cx = w / 2;
      const cy = h / 2;
      nodes.forEach((n, i) => {
        const near = nodes
          .map((m, j) => ({ j, d: Math.hypot(m.hx - n.hx, m.hy - n.hy) }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2);
        near.forEach(({ j, d }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          const mx = (n.hx + nodes[j].hx) / 2;
          const my = (n.hy + nodes[j].hy) / 2;
          edges.push({
            a: i,
            b: j,
            len: d,
            order: Math.hypot(mx - cx, my - cy) / Math.hypot(cx, cy),
            ph: Math.random() * Math.PI * 2,
            glow: 0,
          });
          adj[i].push(edges.length - 1);
          adj[j].push(edges.length - 1);
        });
      });
      spikes = [];
    };

    const fire = (i: number, now: number) => {
      const n = nodes[i];
      if (now - n.last < 2500) return; // refractory period
      n.last = now;
      n.glow = 1;
      adj[i].forEach((e) => spikes.push({ e, from: i, t0: now }));
    };

    const FORM = 3200; // ms for the network to grow in
    const SPEED = 0.11; // px per ms

    const draw = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);

      // slow, organic drift: two layered sine waves per neuron so the
      // network gently "floats" without any obvious looping pattern
      for (const n of nodes) {
        n.x = n.hx + Math.sin(t / 7400 + n.ph) * 7 + Math.sin(t / 3100 + n.ph * 1.7) * 2;
        n.y = n.hy + Math.cos(t / 8300 + n.ph) * 7 + Math.cos(t / 3700 + n.ph * 1.3) * 2;
        n.glow *= 0.965;
      }

      // synapses (grow outward from the centre while forming). Each one
      // slowly breathes in and out, and briefly brightens after a signal
      // has passed along it.
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = colors.line;
      for (const e of edges) {
        const grow = reduced ? 1 : Math.min(1, Math.max(0, (t / FORM - e.order * 0.7) / 0.3));
        if (grow <= 0) continue;
        const a = nodes[e.a];
        const b = nodes[e.b];
        const breathe = reduced ? 0 : Math.sin(t / 2200 + e.ph) * 0.15;
        ctx.globalAlpha = 0.75 + breathe;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * grow, a.y + (b.y - a.y) * grow);
        ctx.stroke();
        if (e.glow > 0.02) {
          ctx.globalAlpha = e.glow * 0.45;
          ctx.strokeStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.strokeStyle = colors.line;
        }
        e.glow *= 0.975;
      }
      ctx.globalAlpha = 1;

      // spikes travelling along synapses
      if (!reduced) {
        const alive: Spike[] = [];
        ctx.fillStyle = colors.accent;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.95;
        for (const s of spikes) {
          const e = edges[s.e];
          const p = ((now - s.t0) * SPEED) / e.len;
          const to = e.a === s.from ? e.b : e.a;
          if (p >= 1) {
            if (Math.random() < 0.12) fire(to, now);
            else nodes[to].glow = Math.max(nodes[to].glow, 0.35);
            continue;
          }
          alive.push(s);
          e.glow = 1;
          const a = nodes[s.from];
          const b = nodes[to];
          const x = a.x + (b.x - a.x) * p;
          const y = a.y + (b.y - a.y) * p;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          // short trailing tail
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const tp = Math.max(0, p - 26 / e.len);
          ctx.moveTo(a.x + (b.x - a.x) * tp, a.y + (b.y - a.y) * tp);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        spikes = alive.length > 60 ? alive.slice(-60) : alive;
      }

      // neurons
      for (const n of nodes) {
        const appear = reduced ? 1 : Math.min(1, Math.max(0, t / 900 - Math.hypot(n.hx - w / 2, n.hy - h / 2) / Math.hypot(w, h)));
        if (appear <= 0) continue;
        ctx.globalAlpha = appear * 0.95;
        ctx.fillStyle = colors.node;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        if (n.glow > 0.03) {
          ctx.globalAlpha = n.glow * 0.9;
          ctx.fillStyle = colors.accent;
          ctx.shadowColor = colors.glow;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 3.5 + n.glow * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = n.glow * 0.45;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6 + (1 - n.glow) * 16, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (reduced) return;

      // spontaneous activity once the network has formed
      if (t > FORM * 0.8 && now > nextFire) {
        fire(Math.floor(Math.random() * nodes.length), now);
        nextFire = now + 800 + Math.random() * 1100;
      }
      raf = requestAnimationFrame(draw);
    };

    readColors();
    build();
    if (reduced) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduced) draw(performance.now());
    });
    ro.observe(wrap);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      start = 0;
    };
  }, []);

  return (
    <div className="rip" ref={wrapRef}>
      <canvas className="rip__net" ref={canvasRef} aria-hidden="true" />
      <div className="rip__core">
        <div className="rip__label mono mono--sm">
          <span className="rip__dot" aria-hidden="true" />
          02 / RESEARCH · STATUS: ACTIVE
        </div>
        <h1 className="rip__title display">
          <span className="rip__line">RESEARCH</span>
          <span className="rip__line rip__line--accent">
            <span className="rip__glitch" data-text="IN PROGRESS">
              IN PROGRESS
            </span>
            <span className="rip__caret" aria-hidden="true" />
          </span>
        </h1>
        <p className="rip__lede" role="status">
          Experiments are running. Findings will be published here once they are ready.
        </p>

        <ol className="rip__pipeline mono mono--sm" aria-label="Research pipeline">
          {STAGES.map((stage, i) => (
            <li key={stage} style={{ ['--i' as string]: i }}>
              <span className="rip__pip" aria-hidden="true" />
              <b>{String(i + 1).padStart(2, '0')}</b> {stage}
            </li>
          ))}
        </ol>
        <div className="rip__scan" aria-hidden="true" />
      </div>

    </div>
  );
}
