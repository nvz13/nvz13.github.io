import { useEffect, useState, type CSSProperties } from 'react';
import { animate, stagger } from 'animejs';
import { prefersReduced, useReveal } from '../lib/motion';
import {
  homeModules,
  site,
  specimenAnnotations,
  threads,
} from '../content/portfolioData';
import { useRouter } from '../lib/router';
import { Specimen, specimenAnchor } from '../components/Specimen';

// Abstract line drawings, one per thread, in the same ink-and-accent language as the specimen.
function ThreadGlyph({ code }: { code: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' } as const;
  if (code === '01') {
    // Neuron: soma with dendrites reaching out to terminal nodes.
    return (
      <svg viewBox="0 0 200 110" aria-hidden="true">
        <circle cx="100" cy="55" r="34" {...common} strokeDasharray="2 5" opacity="0.5" />
        <path d="M100 55 L56 22 M100 55 L146 18 M100 55 L60 92 M100 55 L150 94 M100 55 L100 6" {...common} />
        <path d="M56 22 L30 14 M146 18 L172 30 M60 92 L36 100 M150 94 L176 84" {...common} />
        {[[56, 22], [146, 18], [60, 92], [150, 94], [100, 6]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" />
        ))}
        {[[30, 14], [172, 30], [36, 100], [176, 84]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" {...common} />
        ))}
        <circle cx="100" cy="55" r="7" fill="var(--accent)" />
      </svg>
    );
  }
  if (code === '02') {
    // Person-to-screen loop: a node, a signal arc, a display and a pointer.
    return (
      <svg viewBox="0 0 200 110" aria-hidden="true">
        <circle cx="34" cy="55" r="13" {...common} />
        <circle cx="34" cy="55" r="4" fill="currentColor" />
        <path d="M50 46 C 80 8, 116 8, 136 40" {...common} strokeDasharray="3 4" />
        <path d="M50 64 C 80 102, 116 102, 136 70" {...common} strokeDasharray="3 4" opacity="0.6" />
        <rect x="136" y="24" width="50" height="40" rx="3" {...common} />
        <path d="M146 58 L152 42 L158 52 L164 46" {...common} />
        <path d="M172 72 L168 80 L166 74 L160 76 Z" fill="var(--accent)" stroke="none" />
      </svg>
    );
  }
  // Overlap of three disciplines.
  return (
    <svg viewBox="0 0 200 110" aria-hidden="true">
      <circle cx="78" cy="42" r="30" {...common} fill="currentColor" fillOpacity="0.08" />
      <circle cx="112" cy="42" r="30" {...common} fill="var(--accent)" fillOpacity="0.14" />
      <circle cx="95" cy="68" r="30" {...common} fill="currentColor" fillOpacity="0.06" />
      <circle cx="95" cy="55" r="46" {...common} strokeDasharray="1 5" opacity="0.4" />
    </svg>
  );
}

function ThreadsPanel() {
  return (
    <section className="readout panel home-signal" aria-label="Research threads">
      <div className="readout__head mono mono--sm">
        <span>[ THREADS ]</span>
        <span className="dot dot--live" aria-hidden="true" />
      </div>
      <ol className="home-threads">
        {threads.map((thread) => (
          <li className="home-threads__item" key={thread.code}>
            <div className="home-threads__glyph">
              <ThreadGlyph code={thread.code} />
            </div>
            <div className="home-threads__text">
              <div className="home-threads__top mono">
                <span className="home-threads__code">{thread.code}</span>
              </div>
              <h3 className="home-threads__title">{thread.title}</h3>
              <p className="home-threads__body">{thread.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Home() {
  const { navigate } = useRouter();
  useReveal();
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  const [pinnedAnnotation, setPinnedAnnotation] = useState<number | null>(null);
  const taglineBreak = site.tagline.lastIndexOf(' ');
  const taglineLines =
    taglineBreak > -1
      ? [site.tagline.slice(0, taglineBreak), site.tagline.slice(taglineBreak + 1)]
      : [site.tagline, ''];

  useEffect(() => {
    if (prefersReduced()) return;

    const entrance = animate('.hero__title .line > span', {
      opacity: [0, 1],
      y: [42, 0],
      duration: 1100,
      delay: stagger(120, { start: 160 }),
      ease: 'outExpo',
    });

    animate('.hero__eyebrow, .hero__sub', {
      opacity: [0, 1],
      y: [18, 0],
      duration: 900,
      delay: stagger(80, { start: 360 }),
      ease: 'outExpo',
    });

    animate('.hero__threads, .home-signal, .idcard', {
      opacity: [0, 1],
      y: [26, 0],
      duration: 950,
      delay: stagger(100, { start: 540 }),
      ease: 'outExpo',
    });

    animate('.specimen', {
      opacity: [0, 1],
      scale: [0.93, 1],
      duration: 1700,
      delay: 220,
      ease: 'outExpo',
    });

    animate('.anno--a, .anno--b', {
      opacity: [0, 1],
      duration: 900,
      delay: stagger(140, { start: 1000 }),
      ease: 'outExpo',
    });
    return () => {
      entrance.revert();
    };
  }, []);

  const renderAnnotation = (annotation: (typeof specimenAnnotations)[number], index: number) => {
    // Pin each marker to its petal tip. Right-side markers anchor by their right edge
    // so the expanded card opens inward, toward the flower.
    const anchor = specimenAnchor(index);
    const markerStyle: CSSProperties =
      anchor.x > 50
        ? { right: `calc(${(100 - anchor.x).toFixed(2)}% - 12px)`, left: 'auto', top: `calc(${anchor.y.toFixed(2)}% - 12px)` }
        : { left: `calc(${anchor.x.toFixed(2)}% - 12px)`, top: `calc(${anchor.y.toFixed(2)}% - 12px)` };
    return (
        <button
          className={`anno anno--${String.fromCharCode(97 + index)} ${
            hoveredAnnotation === index || pinnedAnnotation === index ? 'is-expanded' : ''
          }`}
          key={annotation.label}
          style={markerStyle}
          type="button"
          aria-label={`${annotation.label} annotation`}
          aria-expanded={hoveredAnnotation === index || pinnedAnnotation === index}
          onPointerEnter={() => setHoveredAnnotation(index)}
          onPointerLeave={() => setHoveredAnnotation(null)}
          onFocus={() => setHoveredAnnotation(index)}
          onBlur={() => setHoveredAnnotation(null)}
          onClick={() => setPinnedAnnotation(pinnedAnnotation === index ? null : index)}
        >
          <span className="anno__label">
            <span className="anno__label-text">{annotation.label}</span>
          </span>
          <span className="anno__line" />
          <span className="anno__body">
            {annotation.body}
            <br />
            {annotation.detail}
          </span>
        </button>
    );
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__grid">
          <div className="hero__left">
            <div>
              <h1 className="hero__title display">
                {taglineLines.map((line, index) => (
                  <span className="line" key={line}>
                    <span>{index === 1 ? <em>{line}</em> : line}</span>
                  </span>
                ))}
              </h1>

              <p className="hero__sub">{site.shortBio}</p>
            </div>

            <nav className="hero__threads home-index panel" aria-label="Portfolio sections" data-reveal>
              <div className="hero__threads-head mono mono--sm" data-reveal-item>
                <span>[ EXPLORE ]</span>
                <span className="quiet">PORTFOLIO / 04</span>
              </div>
              {homeModules.map((module) => (
                <a
                  className="home-index__link"
                  href={module.to}
                  key={module.code}
                  data-reveal-item
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(module.to);
                  }}
                >
                  <span className="home-index__code">{module.code}</span>
                  <span>{module.title}</span>
                  <span className="home-index__arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="hero__center">
            <div className="hero__gridlines" aria-hidden="true" />
            <Specimen>
              <div className="hero__specimen-annotations">
                {specimenAnnotations.map((annotation, index) => renderAnnotation(annotation, index))}
              </div>
            </Specimen>
          </div>

          <div className="hero__right">
            <div className="hero__right-top">
              <div className="hero__coords mono mono--sm">
                <span>FIELD / 01</span>
              </div>
            </div>

            <ThreadsPanel />

            <div className="idcard panel">
              <div className="idcard__head">
                <span className="idcard__avatar">
                  <span>{site.mark}</span>
                </span>
                <div>
                  <div className="idcard__name">{site.name}</div>
                  <div className="idcard__role">{site.role}</div>
                </div>
              </div>
              <dl className="idcard__fields">
                <div className="idcard__field">
                  <dt>Institution</dt>
                  <dd>Virginia Tech</dd>
                </div>
                <div className="idcard__field">
                  <dt>Program</dt>
                  <dd>B.S.&nbsp;Neuroscience +&nbsp;HCI</dd>
                </div>
                <div className="idcard__field">
                  <dt>Class</dt>
                  <dd>2030</dd>
                </div>
              </dl>
              <div className="barcode" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
