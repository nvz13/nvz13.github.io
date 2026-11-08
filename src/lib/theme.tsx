import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { prefersReduced } from './motion';

type Theme = 'light' | 'dark';

/** Screen point the reveal expands from (usually the toggle's centre). */
export type Origin = { x: number; y: number };

const ThemeCtx = createContext<{ theme: Theme; toggle: (origin?: Origin) => void }>({
  theme: 'light',
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

const THEME_COLOR: Record<Theme, string> = { dark: '#140a0f', light: '#f4ecdf' };
const DURATION = 650; // keep in sync with the vt-wipe animation in base.css

const readInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('vesper.theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage may be unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[t]);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const busyRef = useRef(false);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('vesper.theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(
    (origin?: Origin) => {
      if (busyRef.current) return;
      const next: Theme = theme === 'light' ? 'dark' : 'light';
      const root = document.documentElement;

      const swap = () => {
        applyTheme(next);
        flushSync(() => setTheme(next));
      };

      // No View Transitions support, or the visitor asked for less motion:
      // switch instantly (CSS colour transitions still soften it).
      if (prefersReduced() || typeof document.startViewTransition !== 'function') {
        setTheme(next);
        return;
      }

      // Reveal origin + the radius needed to cover the farthest corner.
      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      root.style.setProperty('--vt-x', `${x}px`);
      root.style.setProperty('--vt-y', `${y}px`);
      root.style.setProperty('--vt-r-max', `${Math.ceil(r) + 160}px`);
      root.dataset.themeTo = next;
      // freeze per-element colour transitions so the new snapshot is already final
      root.classList.add('theme-switching');

      busyRef.current = true;
      const vt = document.startViewTransition(swap);
      const done = () => {
        root.classList.remove('theme-switching');
        delete root.dataset.themeTo;
        busyRef.current = false;
      };
      vt.finished.then(done, done);
      // safety net in case the transition is skipped mid-way
      window.setTimeout(() => busyRef.current && done(), DURATION + 600);
    },
    [theme],
  );

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
