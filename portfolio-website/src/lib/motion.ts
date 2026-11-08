import { useEffect, useLayoutEffect } from 'react';
import { animate, stagger, utils } from 'animejs';

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Deterministic pseudo-random generator so generated artwork is stable. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scroll-triggered reveals for every [data-reveal] element on the page.
 * Children marked [data-reveal-item] are staggered individually.
 */
export function useReveal() {
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]'));
      utils.set(items.length ? items : [el], { opacity: 0, y: 24 });
    });
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (prefersReduced()) {
      els.forEach((el) => {
        utils.set(el, { opacity: 1, y: 0 });
        utils.set(el.querySelectorAll('[data-reveal-item]'), { opacity: 1, y: 0 });
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]'));
          animate(items.length ? items : [el], {
            opacity: [0, 1],
            y: [24, 0],
            duration: 900,
            delay: stagger(65, { start: 250 }),
            ease: 'outExpo',
          });
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
