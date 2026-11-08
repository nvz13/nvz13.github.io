import { useEffect } from 'react';

/**
 * Smooth wheel scrolling with a gentle spring and a soft rubber-band
 * at the top and bottom of the page.
 *
 * - Mouse wheel / trackpad only. Touch keeps the device's own scrolling
 *   (iOS already has its native bounce).
 * - Off when the visitor prefers reduced motion.
 * - Leaves alone: locked pages (boot loader, menu, palette, lightbox all set
 *   body overflow hidden), inner scroll areas such as the ⌘K list, pinch-zoom
 *   and sideways scrolling. Anchor links, keyboard scrolling and the router's
 *   own scrollTo calls stay native; the loop just re-syncs to them.
 */

// Scroll spring: how firmly the page follows the wheel, and how much give
// it has when it settles (1 = no overshoot; lower = more springy).
const SCROLL_STIFFNESS = 120;
const SCROLL_DAMPING = 0.78;

// End-of-page rubber band.
const BOUNCE_MAX = 54; // px the page can stretch past an end
const BOUNCE_STIFFNESS = 240;
const BOUNCE_DAMPING = 0.58; // < 1 so it springs back with a small rebound

const LINE_PX = 40;

const reducedQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isLocked = () =>
  document.body.classList.contains('is-loading') ||
  getComputedStyle(document.body).overflowY === 'hidden' ||
  getComputedStyle(document.documentElement).overflowY === 'hidden';

/** True when the wheel is over something that scrolls on its own. */
const insideScroller = (start: EventTarget | null) => {
  let node = start instanceof Element ? start : null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      if (node.hasAttribute('data-native-scroll')) return true;
      const overflowY = getComputedStyle(node).overflowY;
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return false;
};

export function useSmoothScroll() {
  useEffect(() => {
    const query = reducedQuery();
    let stop: (() => void) | null = null;

    const start = () => {
      let pos = window.scrollY;
      let vel = 0;
      let target = pos;
      let lastSet = pos;

      let pull = 0; // raw wheel push past an end (signed)
      let over = 0; // displayed stretch in px (signed, same sign as pull)
      let overVel = 0;

      let frame = 0;
      let lastTime = 0;
      let lastWheel = 0;

      const stage = () => document.getElementById('main');

      const applyStretch = () => {
        const el = stage();
        if (!el) return;
        el.style.transform = Math.abs(over) > 0.1 ? `translate3d(0, ${-over}px, 0)` : '';
      };

      const halt = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        vel = 0;
        pull = 0;
        over = 0;
        overVel = 0;
        applyStretch();
      };

      const tick = (now: number) => {
        const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
        lastTime = now;

        // Someone else moved the page (anchor link, keyboard, router): step aside.
        if (Math.abs(window.scrollY - lastSet) > 2) {
          pos = target = lastSet = window.scrollY;
          halt();
          return;
        }

        const max = maxScroll();
        target = clamp(target, 0, max);

        const scrollDamp = 2 * SCROLL_DAMPING * Math.sqrt(SCROLL_STIFFNESS);
        vel += (SCROLL_STIFFNESS * (target - pos) - scrollDamp * vel) * dt;
        pos += vel * dt;
        if (pos < 0 || pos > max) {
          pos = clamp(pos, 0, max);
          vel = 0;
        }
        window.scrollTo({ top: pos, behavior: 'instant' });
        lastSet = window.scrollY;

        // Rubber band: stretch while being pushed, spring back when released.
        pull *= Math.exp(-dt * 7);
        const pushing = now - lastWheel < 90;
        const goal =
          Math.abs(pull) < 0.5
            ? 0
            : Math.sign(pull) * BOUNCE_MAX * (1 - Math.exp(-Math.abs(pull) / (BOUNCE_MAX * 2.4)));
        const k = pushing ? BOUNCE_STIFFNESS * 1.6 : BOUNCE_STIFFNESS;
        const zeta = pushing ? 1 : BOUNCE_DAMPING;
        overVel += (k * (goal - over) - 2 * zeta * Math.sqrt(k) * overVel) * dt;
        over += overVel * dt;
        applyStretch();

        const settled =
          Math.abs(target - pos) < 0.4 &&
          Math.abs(vel) < 0.4 &&
          Math.abs(over) < 0.15 &&
          Math.abs(overVel) < 0.5 &&
          Math.abs(pull) < 0.5;

        if (settled) {
          pos = target;
          window.scrollTo({ top: pos, behavior: 'instant' });
          lastSet = window.scrollY;
          halt();
          return;
        }
        frame = requestAnimationFrame(tick);
      };

      const onWheel = (event: WheelEvent) => {
        if (event.defaultPrevented || event.ctrlKey) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        if (isLocked() || insideScroller(event.target)) return;

        let dy = event.deltaY;
        if (event.deltaMode === 1) dy *= LINE_PX;
        else if (event.deltaMode === 2) dy *= window.innerHeight;
        if (!dy) return;

        event.preventDefault();

        if (!frame) {
          // Starting fresh: pick up wherever the page is now.
          pos = target = lastSet = window.scrollY;
        }

        const max = maxScroll();
        const next = target + dy;
        target = clamp(next, 0, max);

        // Only stretch once the page has actually arrived at the end.
        const atTop = next < 0 && pos <= 2;
        const atBottom = next > max && pos >= max - 2;
        if (atTop || atBottom) pull += next - target;

        lastWheel = performance.now();
        if (!frame) frame = requestAnimationFrame(tick);
      };

      const onScroll = () => {
        if (!frame) pos = target = lastSet = window.scrollY;
      };

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('scroll', onScroll);
        halt();
      };
    };

    const sync = () => {
      stop?.();
      stop = query.matches ? null : start();
    };

    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      stop?.();
    };
  }, []);
}
