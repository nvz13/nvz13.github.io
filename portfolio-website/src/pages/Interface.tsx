import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { projectEntries, type ProjectEntry } from '../content/portfolioData';
import { prefersReduced, useReveal } from '../lib/motion';
import '../styles/projects.css';

const ALL = 'ALL';
const code = (index: number) => `P—${String(index + 1).padStart(2, '0')}`;
const imgSrc = (src: string) =>
  /^(https?:)?\/\//.test(src) || src.startsWith('data:') ? src : `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Rect of `from`, expressed as translate + clip-path inset on the element `to`. */
function morphFrames(from: DOMRect, to: DOMRect) {
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const ix = Math.max(0, (to.width - from.width) / 2);
  const iy = Math.max(0, (to.height - from.height) / 2);
  return [
    { transform: `translate(${dx}px, ${dy}px)`, clipPath: `inset(${iy}px ${ix}px round 16px)` },
    { transform: 'translate(0, 0)', clipPath: 'inset(0px 0px round 16px)' },
  ];
}

function Status({ status }: { status: ProjectEntry['status'] }) {
  const tone = status === 'Complete' ? 'done' : status === 'Planned' ? 'planned' : 'live';
  return (
    <span className={`proj-status proj-status--${tone} mono mono--sm`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}

export default function Interface() {
  useReveal();
  const [filter, setFilter] = useState(ALL);
  const [openId, setOpenId] = useState<string | null>(null);
  const lastCard = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const prevRects = useRef<Map<string, DOMRect> | null>(null);
  const closing = useRef(false);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    projectEntries.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()];
  }, []);

  const visible = filter === ALL ? projectEntries : projectEntries.filter((p) => p.tags.includes(filter));
  const open = projectEntries.find((p) => p.id === openId) ?? null;
  const openIndex = open ? projectEntries.indexOf(open) : -1;
  const visibleIndex = open ? visible.indexOf(open) : -1;

  const openProject = (id: string, el: HTMLElement) => {
    lastCard.current = el;
    setOpenId(id);
  };

  // Card grows into the detail panel (and shrinks back on close).
  useLayoutEffect(() => {
    const el = panel.current;
    const card = lastCard.current;
    if (!el || !card || prefersReduced()) return;
    el.animate(morphFrames(card.getBoundingClientRect(), el.getBoundingClientRect()), {
      duration: 560,
      easing: EASE,
    });
    // only when the panel first opens, not when stepping between projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open !== null]);

  const close = () => {
    const el = panel.current;
    const card = lastCard.current;
    if (closing.current) return;
    if (!el || !card || prefersReduced() || !card.isConnected) {
      setOpenId(null);
      return;
    }
    closing.current = true;
    el.parentElement?.classList.add('is-closing');
    const anim = el.animate(morphFrames(card.getBoundingClientRect(), el.getBoundingClientRect()).reverse(), {
      duration: 380,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'forwards',
    });
    anim.onfinish = () => {
      closing.current = false;
      setOpenId(null);
    };
  };

  // Filter change: cards glide to their new spots, new ones fade up.
  const applyFilter = (tag: string) => {
    if (tag === filter) return;
    if (!prefersReduced() && grid.current) {
      const rects = new Map<string, DOMRect>();
      grid.current.querySelectorAll<HTMLElement>('[data-id]').forEach((li) => {
        rects.set(li.dataset.id!, li.getBoundingClientRect());
      });
      prevRects.current = rects;
    }
    setFilter(tag);
  };

  useLayoutEffect(() => {
    const rects = prevRects.current;
    prevRects.current = null;
    if (!rects || !grid.current) return;
    let fresh = 0;
    grid.current.querySelectorAll<HTMLElement>('[data-id]').forEach((li) => {
      const before = rects.get(li.dataset.id!);
      const now = li.getBoundingClientRect();
      if (before) {
        const dx = before.left - now.left;
        const dy = before.top - now.top;
        if (dx || dy) {
          li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
            duration: 520,
            easing: EASE,
          });
        }
      } else {
        li.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], {
          duration: 480,
          delay: 60 * fresh++,
          easing: EASE,
          fill: 'backwards',
        });
      }
    });
  }, [filter]);
  const step = (dir: 1 | -1) => {
    if (visible.length < 2 || visibleIndex < 0) return;
    const next = visible[(visibleIndex + dir + visible.length) % visible.length];
    setOpenId(next.id);
  };

  // Detail view: Esc closes, arrows step, background scroll locked, focus managed.
  useEffect(() => {
    if (!open) {
      lastCard.current?.focus({ preventScroll: true });
      return;
    }
    closeBtn.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, filter]);

  const statusCounts = (['In progress', 'Complete', 'Planned'] as const)
    .map((s) => [s, projectEntries.filter((p) => p.status === s).length] as const)
    .filter(([, n]) => n > 0);

  return (
    <div className="page shell">
      <header className="page-head">
        <div>
          <h1 className="page-title display">
            <small>03 / PROJECTS</small>
            IDEAS,
            <br />
            IN MOTION.
          </h1>
        </div>
        <div className="page-head__meta mono">
          <span>
            {projectEntries.length} PROJECT{projectEntries.length === 1 ? '' : 'S'}
          </span>
          {statusCounts.map(([s, n]) => (
            <span key={s}>
              {n} {s}
            </span>
          ))}
        </div>
      </header>

      {tags.length > 1 && (
        <div className="proj-filters" role="toolbar" aria-label="Filter projects by tag">
          {[[ALL, projectEntries.length] as const, ...tags].map(([tag, n]) => (
            <button
              key={tag}
              type="button"
              className={`chip ${filter === tag ? 'is-active' : ''}`}
              aria-pressed={filter === tag}
              onClick={() => applyFilter(tag)}
            >
              {tag} <span className="proj-filters__n">{n}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="proj-grid" data-reveal ref={grid}>
        {visible.map((p) => {
          const i = projectEntries.indexOf(p);
          return (
            <li key={p.id} data-id={p.id} data-reveal-item className="proj-cell">
              <button
                type="button"
                className={`proj-card ${p.sample ? 'is-sample' : ''}`}
                onClick={(e) => openProject(p.id, e.currentTarget)}
                aria-haspopup="dialog"
                data-cursor="OPEN"
              >
                <span className="proj-card__top mono mono--sm">
                  <b>{code(i)}</b>
                  {p.sample && <span className="proj-sample">SAMPLE</span>}
                  <span className="proj-card__year">{p.year}</span>
                </span>
                <span className="proj-card__title">{p.title}</span>
                <span className="proj-card__summary">{p.summary}</span>
                <span className="proj-card__tags">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </span>
                <span className="proj-card__foot">
                  <Status status={p.status} />
                  <span className="proj-card__open mono mono--sm" aria-hidden="true">
                    OPEN <span className="proj-card__arrow">→</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {projectEntries.length === 0 && (
        <p className="proj-empty mono">No projects yet. Add one in src/content/portfolioData.ts → projectEntries.</p>
      )}

      {open && (
        <div className="proj-modal" onClick={close}>
          <div className="proj-modal__backdrop" aria-hidden="true" />
          <article
            className="proj-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="proj-detail-title"
            ref={panel}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="proj-detail__bar mono mono--sm">
              <b>{code(openIndex)}</b>
              <span>{open.year}</span>
              <Status status={open.status} />
              <span className="proj-detail__nav">
                {visible.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Previous project">
                      ←
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next project">
                      →
                    </button>
                  </>
                )}
                <button ref={closeBtn} type="button" onClick={close} className="proj-detail__close">
                  CLOSE ✕
                </button>
              </span>
            </header>

            <div className="proj-detail__body" key={open.id}>
              {open.sample && (
                <p className="proj-detail__note mono mono--sm">
                  Sample project · edit or delete it in src/content/portfolioData.ts → projectEntries
                </p>
              )}
              {open.progressNote && (
                <p className="proj-detail__progress mono mono--sm">
                  <i aria-hidden="true" />
                  {open.progressNote}
                </p>
              )}
              <h2 id="proj-detail-title" className="proj-detail__title display">
                {open.title}
              </h2>
              <p className="proj-detail__summary">{open.summary}</p>
              <div className="proj-card__tags">
                {open.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="proj-detail__cols">
                <div className="proj-detail__main">
                  {open.overview?.length ? (
                    <section>
                      <h3 className="mono mono--sm">Overview</h3>
                      {open.overview.map((para, k) => (
                        <p key={k}>{para}</p>
                      ))}
                    </section>
                  ) : null}
                  {open.highlights?.length ? (
                    <section>
                      <h3 className="mono mono--sm">What I'm building</h3>
                      <ul className="proj-highlights">
                        {open.highlights.map((hl, k) => (
                          <li key={hl.title}>
                            <span className="mono mono--sm">{String(k + 1).padStart(2, '0')}</span>
                            <b>{hl.title}</b>
                            <p>{hl.text}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {open.sections?.map((sec) => (
                    <section key={sec.heading}>
                      <h3 className="mono mono--sm">{sec.heading}</h3>
                      {sec.paragraphs?.map((para, k) => (
                        <p key={k}>{para}</p>
                      ))}
                      {sec.bullets?.length ? (
                        <ul className="proj-detail__bullets">
                          {sec.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                  {open.roadmap?.length ? (
                    <section>
                      <h3 className="mono mono--sm">Roadmap</h3>
                      <ol className="proj-roadmap">
                        {(() => {
                          const cur = open.roadmap.findIndex((r) => r.current);
                          return open.roadmap.map((r, k) => {
                            const state = cur === -1 ? 'next' : k < cur ? 'done' : k === cur ? 'now' : 'next';
                            return (
                              <li key={r.stage} className={`proj-roadmap__step is-${state}`}>
                                <span className="proj-roadmap__head mono mono--sm">
                                  <b>{r.stage}</b>
                                  <span>{r.when}</span>
                                  {state === 'now' && <em>NOW</em>}
                                </span>
                                <p>{r.goal}</p>
                                {r.deliverable && <p className="proj-roadmap__out mono mono--sm">→ {r.deliverable}</p>}
                              </li>
                            );
                          });
                        })()}
                      </ol>
                    </section>
                  ) : null}
                  {open.images?.length ? (
                    <section className="proj-detail__images">
                      {open.images.map((img) => (
                        <figure key={img.src}>
                          <img src={imgSrc(img.src)} alt={img.alt} loading="lazy" />
                          {img.caption && <figcaption className="mono mono--sm">{img.caption}</figcaption>}
                        </figure>
                      ))}
                    </section>
                  ) : null}
                </div>

                <aside className="proj-detail__side">
                  {open.role && (
                    <section>
                      <h3 className="mono mono--sm">Role</h3>
                      <p>{open.role}</p>
                    </section>
                  )}
                  {open.tools?.length ? (
                    <section>
                      <h3 className="mono mono--sm">Tools</h3>
                      <p>{open.tools.join(' · ')}</p>
                    </section>
                  ) : null}
                  {open.facts?.map((f) => (
                    <section key={f.label}>
                      <h3 className="mono mono--sm">{f.label}</h3>
                      <p>{f.value}</p>
                    </section>
                  ))}
                  {open.references?.length ? (
                    <section>
                      <h3 className="mono mono--sm">Key references</h3>
                      <ul className="proj-detail__refs">
                        {open.references.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {open.links?.some((l) => l.href) ? (
                    <section>
                      <h3 className="mono mono--sm">Links</h3>
                      <ul className="proj-detail__links">
                        {open.links
                          .filter((l) => l.href)
                          .map((l) => (
                            <li key={l.href}>
                              <a href={l.href} target="_blank" rel="noreferrer" className="mono">
                                {l.label} <span aria-hidden="true">↗</span>
                              </a>
                            </li>
                          ))}
                      </ul>
                    </section>
                  ) : null}
                </aside>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
