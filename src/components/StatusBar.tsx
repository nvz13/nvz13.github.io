import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router';
import { clockDate, useClock } from '../lib/useClock';
import { site } from '../content/portfolioData';
import { isMacLike, openCommandPalette } from './CommandPalette';

export function StatusBar() {
  const { route } = useRouter();
  const [progress, setProgress] = useState(0);
  const now = useClock();

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="statusbar">
      <span className="live">
        <span className="dot dot--live" aria-hidden="true" />
        SYSTEM ONLINE
      </span>
      <button
        type="button"
        className="cmdk-hint"
        onClick={openCommandPalette}
        aria-label="Open command palette"
        aria-keyshortcuts={isMacLike() ? 'Meta+K' : 'Control+K'}
        data-cursor="COMMANDS"
      >
        <span className="cmdk-hint__keys" aria-hidden="true">
          <kbd>{isMacLike() ? '⌘' : 'CTRL'}</kbd>
          <kbd>K</kbd>
        </span>
        <span className="cmdk-hint__touch" aria-hidden="true">&gt;_</span>
        <span>COMMANDS</span>
      </button>
      <div className="statusbar__mid">
        <span>
          NODE / <b>{route.code} — {route.label}</b>
        </span>
        <span>{site.location}</span>
        <div className="statusbar__prog" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <span className="statusbar__right">
        {clockDate(now)} · BUILD 4.26
      </span>
    </div>
  );
}
