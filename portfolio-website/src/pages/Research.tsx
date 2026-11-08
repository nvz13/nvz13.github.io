import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { projects } from '../content/portfolioData';
import { useReveal } from '../lib/motion';
import { PlateVisual } from '../components/Plate';
import { ResearchInProgress } from '../components/ResearchInProgress';

export default function Research() {
  useReveal();
  const [openId, setOpenId] = useState<string | null>(projects[0]?.id ?? null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  const hovered = projects.find((project) => project.id === hoverId) ?? null;

  const trackPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const plate = plateRef.current;
    if (!plate) return;
    plate.style.left = `${event.clientX + 22}px`;
    plate.style.top = `${event.clientY + 18}px`;
  };

  // Until a project is added to portfolioData.ts, show the full-page
  // "research in progress" screen instead of the empty list.
  if (projects.length === 0) {
    return (
      <div className="page rip-page">
        <ResearchInProgress />
      </div>
    );
  }

  return (
    <div className="page shell">
      <header className="page-head">
        <div>
          <h1 className="page-title display">
            <small>02 / RESEARCH</small>
            RESEARCH,
            <br />
            IN RECORD.
          </h1>
        </div>
        <div className="page-head__meta mono">
          <span>{projects.length} PROJECTS</span>
          <span>ADD VERIFIED PROJECT DETAILS</span>
          <span>EDITABLE CONTENT</span>
        </div>
      </header>

      <div className="research-toolbar mono mono--sm">
        <span>[ SELECT A RECORD TO EXPAND ]</span>
        <span className="quiet">METHODS, METRICS &amp; STATUS</span>
      </div>

      <div className="research-list" onPointerMove={trackPointer}>
        {projects.length === 0 && (
          <p className="r-detail__summary">No projects added yet. Add verified entries to projects in src/content/portfolioData.ts.</p>
        )}
        {projects.map((project, index) => {
          const isOpen = openId === project.id;
          const indexLabel = String(index + 1).padStart(2, '0');
          const palette: [string, string, string] = ['#f7afc4', '#f4ecdf', '#5a0e24'];
          return (
            <article
              className={`r-row ${isOpen ? 'is-open' : ''}`}
              key={project.id}
              data-reveal
            >
              <button
                className="r-head"
                onClick={() => setOpenId(isOpen ? null : project.id)}
                onPointerEnter={() => setHoverId(project.id)}
                onPointerLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(project.id)}
                onBlur={() => setHoverId(null)}
                aria-expanded={isOpen}
                data-cursor={isOpen ? 'CLOSE' : 'EXPAND'}
              >
                <span className="r-idx">{indexLabel}</span>
                <span className="r-title">{project.title}</span>
                <span className="r-field">{project.category}</span>
                <span className="r-year">{project.date}</span>
                <span className="r-plus" aria-hidden="true">
                  +
                </span>
              </button>

              <div className="r-detail">
                <div className="r-detail__clip">
                  <div className="r-detail__inner">
                    <div>
                      <div className="r-detail__label">Abstract</div>
                      <p className="r-detail__summary">{project.description}</p>
                      <div className="r-tags" style={{ marginTop: 16 }}>
                        <span className="tag">{project.category}</span>
                      </div>
                    </div>

                    <div>
                      <div className="r-detail__label">Metrics</div>
                      <div className="r-metrics">
                        <div className="r-metric">
                          <b>{project.date}</b>
                          <span>DATE</span>
                        </div>
                        <div className="r-metric">
                          <b>{project.externalLink ? 'YES' : '—'}</b>
                          <span>LINK</span>
                        </div>
                      </div>
                      <div className="r-detail__label" style={{ marginTop: 20 }}>
                        Category
                      </div>
                      <div className="mono">{project.category}</div>
                      {project.externalLink && (
                        <a className="ulink mono" href={project.externalLink} target="_blank" rel="noreferrer">
                          OPEN PROJECT ↗
                        </a>
                      )}
                    </div>

                    <div>
                      <div className="r-detail__label">Palette</div>
                      <div className="r-swatches" aria-hidden="true">
                        {palette.map((color) => (
                          <span key={color} style={{ background: color }} />
                        ))}
                      </div>
                      <div className="r-detail__label" style={{ marginTop: 18 }}>
                        Record
                      </div>
                      <div className="mono quiet">NZ—{indexLabel} / {project.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={`r-hoverplate ${hovered ? 'is-on' : ''}`} ref={plateRef} aria-hidden="true">
        {hovered && (
          <>
            <PlateVisual palette={['#f7afc4', '#f4ecdf', '#5a0e24']} seed={projects.findIndex((project) => project.id === hovered.id) + 11} />
            <span className="r-hoverplate__tag">
              {String(projects.findIndex((project) => project.id === hovered.id) + 1).padStart(2, '0')} / {hovered.category}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
