import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ArchivePhoto } from '../content/archive';
import { categoryLabels } from '../archive/archiveInfo';
import { PlateVisual } from './Plate';
import { prefersReduced } from '../lib/motion';

const pad = (n: number) => String(n).padStart(2, '0');

export function PhotoViewer({ photos, index, onStep, onClose }: {
  photos: ArchivePhoto[]; index: number; onStep: (delta: number) => void; onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const closeAction = useRef(onClose);
  closeAction.current = onClose;
  const photo = photos[index];
  const close = useCallback(() => {
    if (timer.current) return;
    setClosing(true);
    timer.current = setTimeout(() => closeAction.current(), prefersReduced() ? 0 : 220);
  }, []);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Keep the page behind the portal out of the keyboard and accessibility tree.
    const root = document.getElementById('root');
    const wasInert = root?.inert ?? false;
    if (root) root.inert = true;
    closeButton.current?.focus();
    return () => {
      clearTimeout(timer.current);
      document.body.style.overflow = overflow;
      if (root) root.inert = wasInert;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (!closing) onStep(event.key === 'ArrowRight' ? 1 : -1);
      }
      if (event.key === 'Tab') {
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [close, closing, onStep]);

  useEffect(() => {
    for (const offset of [-1, 1]) {
      const next = photos[(index + offset + photos.length) % photos.length];
      if (next.src) { const image = new Image(); image.src = next.src; }
    }
  }, [index, photos]);

  return createPortal(
    <div className={`lightbox${closing ? ' is-closing' : ''}`} onClick={close}>
      <div className="lightbox__figure" ref={dialog} role="dialog" aria-modal="true" aria-label="Photo viewer"
        onClick={event => event.stopPropagation()}>
        <header className="lightbox__bar">
          <span className="lightbox__label"><i /> VISUAL ARCHIVE <span>/ VIEWFINDER</span></span>
          <button ref={closeButton} className="lightbox__close" onClick={close} aria-label="Close photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="lightbox__stage"
          onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={event => {
            if (!touch.current || closing) return;
            const dx = event.changedTouches[0].clientX - touch.current.x;
            const dy = event.changedTouches[0].clientY - touch.current.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) onStep(dx < 0 ? 1 : -1);
            touch.current = null;
          }} onTouchCancel={() => { touch.current = null; }}>
          <div className="lightbox__corners" aria-hidden="true" />
          {photo.src ? <>
            {loaded !== photo.id && failed !== photo.id && <span className="lightbox__status" role="status">LOADING FRAME…</span>}
            {failed === photo.id && <span className="lightbox__status" role="status">Image unavailable. Try the next frame.</span>}
            <img key={photo.id} className={`lightbox__photo${loaded === photo.id ? ' is-ready' : ''}`}
              src={photo.src} alt={photo.caption || photo.title || photo.category}
              onLoad={() => setLoaded(photo.id)} onError={() => setFailed(photo.id)} decoding="async" />
          </> : <PlateVisual palette={photo.palette ?? ['#f4ecdf', '#e8799a', '#5a0e24']} seed={photo.seed ?? index} />}
          {photos.length > 1 && <>
            <button className="lightbox__nav lightbox__nav--prev" onClick={() => onStep(-1)} aria-label="Previous photo">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <button className="lightbox__nav lightbox__nav--next" onClick={() => onStep(1)} aria-label="Next photo">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
            </button>
          </>}
        </div>
        <footer className="lightbox__cap" aria-live="polite" aria-atomic="true">
          <div className="lightbox__details">
            <ul className="lightbox__tags" aria-label="Photo tags">
              {photo.tags.map(tag => <li key={tag}>{categoryLabels[tag] ?? tag.replace(/-/g, ' ')}</li>)}
            </ul>
            {photo.date && <span>{photo.date}</span>}
            {photo.caption && <p>{photo.caption}</p>}
          </div>
          <div className="lightbox__position"><span>{pad(index + 1)} <i>/ {pad(photos.length)}</i></span>
            <div className="lightbox__progress" aria-hidden="true"><span style={{ width: `${((index + 1) / photos.length) * 100}%` }} /></div>
          </div>
        </footer>
        <div className="lightbox__hint" aria-hidden="true">← → EXPLORE <span>SWIPE TO NAVIGATE</span> ESC TO CLOSE</div>
      </div>
    </div>, document.body,
  );
}
