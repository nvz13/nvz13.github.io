import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { prefersReduced } from '../lib/motion';
import { site } from '../content/portfolioData';

const BOOT_LOG = [
  ['CORTICAL STACK', 'ONLINE'],
  ['SENSOR ARRAY', 'CALIBRATED'],
  ['SIGNAL FILTER', 'STABLE'],
  ['VISUAL CORTEX', 'LINKED'],
  ['REALITY BUFFER', 'READY'],
] as const;

const GLYPHS = ['◢◤', '01 10 11', '◤ ◥', 'NEURO//OS', '0x4F2A', '◣◢', '101 001', 'SYS.OK'];

export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();

    const root = rootRef.current;
    if (!root || prefersReduced()) {
      setGone(true);
      return;
    }

    animate(root.querySelectorAll('.boot__top, .boot__center, .boot__bottom'), {
      opacity: [1, 0],
      y: [0, -16],
      duration: 380,
      delay: stagger(45),
      ease: 'inQuad',
    });
    animate(root, {
      opacity: [1, 0],
      duration: 600,
      delay: 160,
      ease: 'inOutQuart',
      onComplete: () => setGone(true),
    });
  }, [onDone]);

  useEffect(() => {
    if (prefersReduced()) {
      const timer = window.setTimeout(finish, 450);
      return () => window.clearTimeout(timer);
    }

    const counter = { value: 0 };
    const animation = animate(counter, {
      value: 100,
      duration: 2200,
      ease: 'inOutQuart',
      onUpdate: () => setPct(Math.round(counter.value)),
      onComplete: finish,
    });

    return () => {
      animation.pause();
    };
  }, [finish]);

  if (gone) return null;

  return (
    <div className="boot" ref={rootRef} role="status" aria-label="Initialising interface">
      <div className="boot__top">
        <div className="boot__brand">
          <span />
          {site.brand}
        </div>
        <div className="boot__top-right">
          <span>PERSONAL PORTFOLIO // BOOT</span>
          <span>LOCAL NODE · {site.location}</span>
          <button className="boot__skip" onClick={finish} data-cursor="SKIP">
            SKIP SEQUENCE ↗
          </button>
        </div>
      </div>

      <div className="boot__center">
        <div className="boot__rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="boot__pct">
          {String(pct).padStart(3, '0')}
        </div>
        <div className="boot__label">
          {pct < 100 ? 'ASSEMBLING REALITY' : 'REALITY READY'}
        </div>
        <div className="boot__bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>

      <div className="boot__bottom">
        <div>
          <div className="boot__log">
            {BOOT_LOG.map(([name, state], index) => {
              const threshold = index * 18;
              return (
                <div key={name} style={{ opacity: pct > threshold ? 1 : 0, transition: 'opacity .35s' }}>
                  <b>{String(index + 1).padStart(2, '0')}</b> {name} … {pct > threshold + 12 ? state : '···'}
                </div>
              );
            })}
          </div>
        </div>
        <div className="boot__glyphs" aria-hidden="true">
          {GLYPHS.map((glyph) => (
            <span key={glyph}>{glyph}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
