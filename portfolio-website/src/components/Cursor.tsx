import { useEffect, useRef } from 'react';

/** Custom reticle cursor. Labels come from [data-cursor] on any element. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;

    document.body.classList.add('has-custom-cursor');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let active = false;

    const render = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      const holder = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      const next = holder?.dataset.cursor ?? '';
      if (next !== label.textContent) label.textContent = next;
      const shouldBeActive = next.length > 0;
      if (shouldBeActive !== active) {
        active = shouldBeActive;
        el.classList.toggle('is-active', active);
      }
    };

    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');
    const onLeave = () => {
      el.style.opacity = '0';
    };
    const onEnter = () => {
      el.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__ring">
        <span className="cursor__label" ref={labelRef} />
      </span>
      <span className="cursor__dot" />
    </div>
  );
}
