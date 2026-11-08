import { useEffect, useRef, useState } from 'react';
import { signalNotes, tracks } from '../content/portfolioData';
import { prefersReduced, useReveal } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { Synth } from '../lib/synth';

export default function Signal() {
  useReveal();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthRef = useRef<Synth | null>(null);
  const playingRef = useRef(false);
  const [activeId, setActiveId] = useState(tracks[0].id);
  const [playing, setPlaying] = useState(false);

  const activeTrack = tracks.find((track) => track.id === activeId) ?? tracks[0];

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const synth = new Synth();
    synthRef.current = synth;
    return () => synth.dispose();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent').trim() || '#e8799a';
    const accentDeep = styles.getPropertyValue('--accent-deep').trim() || '#5a0e24';
    const soft = styles.getPropertyValue('--ink-faint').trim() || 'rgba(0,0,0,0.3)';

    const count = 96;
    const levels = new Float32Array(count);
    let frame = 0;
    let t = 0;
    const still = prefersReduced();

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const data = playingRef.current ? (synthRef.current?.levels() ?? null) : null;

      for (let i = 0; i < count; i += 1) {
        const phase = t * 0.018 + i * 0.23;
        const idle =
          0.08 +
          Math.abs(Math.sin(phase)) * 0.16 +
          Math.abs(Math.sin(phase * 0.41 + 1.7)) * 0.08 +
          Math.abs(Math.sin(phase * 0.11)) * 0.05;
        const live = data ? data[Math.floor((i / count) * data.length * 0.6)] / 255 : 0;
        const target = data ? 0.05 + live * 1.7 : idle;
        levels[i] += (target - levels[i]) * 0.16;
      }

      const radius = Math.min(width, height) * 0.25;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const value = levels[i];
        const inner = radius * (0.98 + value * 0.05);
        const outer = radius + value * Math.min(width, height) * 0.26;
        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * outer;
        const y2 = cy + Math.sin(angle) * outer;
        ctx.strokeStyle = i % 8 === 0 ? accent : i % 8 === 4 ? accentDeep : soft;
        ctx.globalAlpha = 0.22 + Math.min(0.75, value * 1.2);
        ctx.lineWidth = i % 8 === 0 ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const points = 220;
      for (let i = 0; i <= points; i += 1) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const amp = levels[Math.floor((i / points) * count)] * Math.min(width, height) * 0.13;
        const wobble = Math.sin(i * 0.14 + t * 0.04) * 4;
        const r = radius * 1.62 + wobble + amp;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = soft;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.62, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.6 + Math.abs(Math.sin(t * 0.03)) * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      t += 1;
      if (!still) frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  const toggle = () => {
    const synth = synthRef.current;
    if (!synth) return;
    if (playing) {
      synth.stop();
      setPlaying(false);
      return;
    }
    synth.start(activeTrack.chord);
    setPlaying(true);
  };

  const select = (id: string) => {
    setActiveId(id);
    const track = tracks.find((item) => item.id === id);
    if (playing && track) synthRef.current?.start(track.chord);
  };

  return (
    <div className="page shell">
      <header className="page-head">
        <div>
          <h1 className="page-title display">
            <small>05 / SIGNAL</small>
            SOUND,
            <br />
            SYNTHESISED.
          </h1>
        </div>
        <div className="page-head__meta mono">
          <span>{tracks.length} SYNTH DEMO</span>
          <span>GENERATED IN-BROWSER</span>
          <span>PLACEHOLDER AUDIO</span>
        </div>
      </header>

      <div className="signal-grid">
        <div data-reveal>
          <div className="signal-stage">
            <div className="signal-stage__rings" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <canvas className="signal-canvas" ref={canvasRef} aria-label="Live audio signal visualiser" />
            <div className="signal-stage__hud">
              <div>
                <span>CH / MONO</span>
                <b>{playing ? 'LIVE INPUT' : 'STANDBY'}</b>
              </div>
              <div>
                <span>FFT 512 · 44.1K</span>
                <span>{activeTrack.bpm} BPM</span>
              </div>
            </div>
          </div>

          <div className="transport">
            <button
              className="play"
              onClick={toggle}
              aria-label={playing ? 'Stop signal' : 'Play signal'}
              data-cursor={playing ? 'STOP' : 'PLAY'}
            >
              {playing ? (
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="2" width="4" height="12" />
                  <rect x="9" y="2" width="4" height="12" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M4 2.4 13.2 8 4 13.6Z" />
                </svg>
              )}
            </button>
            <div className="transport__mid">
              <div className="transport__title">{activeTrack.title}</div>
              <div className="transport__sub">
                {activeTrack.category} · {activeTrack.date} · {activeTrack.length}
              </div>
              <div className="transport__bar">
                <span
                  style={{
                    transform: playing ? 'scaleX(1)' : 'scaleX(0.02)',
                    transition: playing ? 'transform 24s linear' : 'transform .6s ease',
                  }}
                />
              </div>
            </div>
            <span className="transport__time">{activeTrack.length}</span>
          </div>
          <p className="mono quiet" style={{ marginTop: 12 }}>
            [ SYNTHESISED WITH WEB AUDIO — NO AUDIO FILES ]
          </p>
        </div>

        <div data-reveal>
          <div className="section-head" style={{ marginBottom: 6 }}>
            <h2 className="section-head__title display" data-reveal-item>
              <i>—</i> LISTENING LOG
            </h2>
            <span className="mono quiet" data-reveal-item>
              SELECT / PLAY
            </span>
          </div>

          <div className="tracklist">
            {tracks.map((track) => (
              <button
                key={track.id}
                className={`track-row ${activeId === track.id ? 'is-active' : ''}`}
                onClick={() => select(track.id)}
                data-reveal-item
                data-cursor="PLAY"
                aria-pressed={activeId === track.id}
              >
                <span className="track-row__idx">{track.index}</span>
                <span className="track-row__title">{track.title}</span>
                <span className="track-row__genre">{track.category}</span>
                <span className="track-row__bpm">{track.bpm} BPM</span>
                <span className="track-row__len">
                  {activeId === track.id && playing ? '▶ ' : ''}
                  {track.length}
                </span>
              </button>
            ))}
          </div>

          <div className="iface-note" style={{ marginTop: 28 }} data-reveal>
            {signalNotes.map((note) => (
              <div key={note.title} data-reveal-item>
                <span className="mono quiet">[ {note.label} ]</span>
                <h4 style={{ marginTop: 10 }}>{note.title}</h4>
                <p>{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
