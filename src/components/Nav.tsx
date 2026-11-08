import { useEffect, useState } from 'react';
import { ROUTES, useRouter } from '../lib/router';
import { site } from '../content/portfolioData';
import { clockTime, useClock } from '../lib/useClock';
import { ThemeToggle } from './ThemeToggle';

export function Nav() {
  const { path, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const now = useClock();
  // The bar only lives at the top of the page: it slides away as soon as the
  // visitor scrolls down and comes back when they return to the top.
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setAtTop(window.scrollY <= 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const hidden = !atTop && !open;

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${hidden ? 'nav--hidden' : ''}`}>
        <div className="nav__inner">
          <a
            className="brand"
            href="/"
            data-cursor="SYSTEM"
            onClick={(event) => {
              event.preventDefault();
              navigate('/');
            }}
          >
            <span className="brand__mark" aria-hidden="true">
              <span />
            </span>
            <span>
              <span className="brand__name">{site.brand}</span>
              <span className="brand__sub">NEUROTECH // CREATIVE</span>
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {ROUTES.map((route) => (
              <a
                key={route.path}
                className={`nav__link ${path === route.path ? 'is-active' : ''}`}
                href={route.path}
                aria-current={path === route.path ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(route.path);
                }}
              >
                <i>{route.code}</i>
                {route.label}
              </a>
            ))}
          </nav>

          <div className="nav__right">
            <span className="clock mono--sm">
              <span className="dot dot--live" aria-hidden="true" />
              <b>{clockTime(now)}</b>
              LOCAL
            </span>
            <ThemeToggle withLabel={false} />
            <button
              className="nav__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button className="menu__close" onClick={() => setOpen(false)} aria-label="Close menu">
          ✕
        </button>
        <nav className="menu__links" aria-label="Mobile">
          {ROUTES.map((route, index) => (
            <a
              key={route.path}
              className="menu__link"
              href={route.path}
              style={{ transitionDelay: open ? `${120 + index * 55}ms` : '0ms' }}
              onClick={(event) => {
                event.preventDefault();
                setOpen(false);
                navigate(route.path);
              }}
            >
              <i>{route.code}</i>
              {route.label}
            </a>
          ))}
        </nav>
        <div className="menu__foot mono">
          <span>{site.location}</span>
          <span>{site.email || 'ADD EMAIL IN PORTFOLIO DATA'}</span>
        </div>
      </div>
    </>
  );
}
