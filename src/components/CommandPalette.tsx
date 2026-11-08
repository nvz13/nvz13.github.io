import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ROUTES, useRouter, type RoutePath } from '../lib/router';
import { useTheme } from '../lib/theme';
import { prefersReduced } from '../lib/motion';
import { site } from '../content/portfolioData';

/** Fire this from anywhere (e.g. the status-bar hint) to open the palette. */
export const OPEN_PALETTE_EVENT = 'vesper:palette-open';
export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

export const isMacLike = () =>
  typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

type Command = {
  id: string;
  group: 'GO TO' | 'SYSTEM' | 'LINKS';
  label: string;
  /** Terminal-style command shown on the left, e.g. `cd /about`. */
  cmd: string;
  keywords: string;
  run: () => void;
};

/** Every typed word must start a word in the command (or appear inside its label / command). */
const matches = (command: Command, query: string) => {
  const words = `${command.cmd} ${command.label} ${command.keywords}`.toLowerCase().split(/[\s/~@.-]+/);
  const direct = `${command.cmd} ${command.label}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => direct.includes(token) || words.some((w) => w.startsWith(token)));
};

export function CommandPalette() {
  const { path, navigate } = useRouter();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to whatever had it before the palette opened.
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target && document.contains(target)) window.setTimeout(() => target.focus(), 0);
  }, []);

  const show = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (to: RoutePath) => () => navigate(to);
    const external = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer');
    const list: Command[] = ROUTES.map((route) => ({
      id: `go-${route.path}`,
      group: 'GO TO',
      label: route.label.charAt(0) + route.label.slice(1).toLowerCase(),
      cmd: `cd ${route.path === '/' ? '~' : route.path}`,
      keywords: `${route.label} ${route.code} page go open`,
      run: go(route.path),
    }));
    list.push({
      id: 'theme',
      group: 'SYSTEM',
      label: theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
      cmd: `theme --${theme === 'light' ? 'dark' : 'light'}`,
      keywords: 'theme toggle dark light mode reality colour color',
      run: () => toggle({ x: window.innerWidth / 2, y: window.innerHeight / 2 }),
    });
    if (site.email) {
      list.push({
        id: 'email',
        group: 'SYSTEM',
        label: `Email ${site.email}`,
        cmd: 'mail',
        keywords: 'email contact mail message',
        run: () => {
          window.location.href = `mailto:${site.email}`;
        },
      });
    }
    site.links
      .filter((link) => link.href)
      .forEach((link) => {
        list.push({
          id: `link-${link.label}`,
          group: 'LINKS',
          label: link.label.charAt(0) + link.label.slice(1).toLowerCase(),
          cmd: `open ${link.label.toLowerCase()}`,
          keywords: `${link.label} link social external`,
          run: external(link.href),
        });
      });
    return list;
  }, [navigate, theme, toggle]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    return commands.filter((c) => matches(c, q));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const run = useCallback(
    (command: Command | undefined) => {
      if (!command) return;
      close();
      // Let the dialog unmount before navigating or starting the theme reveal.
      window.setTimeout(command.run, 30);
    },
    [close],
  );

  // Global shortcut: ⌘K / Ctrl+K toggles. Also listens for the hint button.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) close();
        else show();
      }
    };
    const onOpen = () => {
      if (!open) show();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, [open, show, close]);

  // Focus the prompt, lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close if the route changes underneath (e.g. browser back).
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const count = results.length;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (count) setActive((activeIndex + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) setActive((activeIndex - 1 + count) % count);
        break;
      case 'Home':
        if (event.target !== inputRef.current || !query) {
          event.preventDefault();
          setActive(0);
        }
        break;
      case 'End':
        if (event.target !== inputRef.current || !query) {
          event.preventDefault();
          setActive(Math.max(count - 1, 0));
        }
        break;
      case 'Enter':
        event.preventDefault();
        run(results[activeIndex]);
        break;
      case 'Tab': {
        // Focus trap: cycle between the focusable controls inside the dialog.
        const focusables = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>('input, button') ?? [],
        ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
    }
  };

  let lastGroup = '';
  const mod = isMacLike() ? '⌘' : 'CTRL';

  return (
    <div
      className={`cmdk ${prefersReduced() ? 'cmdk--still' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="cmdk__dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
      >
        <div className="cmdk__bar mono mono--sm" aria-hidden="true">
          <span>[ COMMAND ]</span>
          <span className="cmdk__bar-right">
            <span className="dot dot--live" />
            NIA@VESPER
          </span>
        </div>
        <div className="cmdk__prompt">
          <span className="cmdk__ps1" aria-hidden="true">
            ~ $
          </span>
          <input
            ref={inputRef}
            className="cmdk__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
            aria-label="Type a command or page name"
            placeholder="type a command…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
          />
          <button type="button" className="cmdk__esc mono mono--sm" onClick={close} aria-label="Close command palette">
            ESC
          </button>
        </div>

        <ul className="cmdk__list" id={listId} role="listbox" aria-label="Commands" ref={listRef}>
          {results.map((command, index) => {
            const header = command.group !== lastGroup ? command.group : null;
            lastGroup = command.group;
            const isCurrent = command.id === `go-${path}`;
            return (
              <li key={command.id} role="presentation">
                {header && (
                  <div className="cmdk__group mono mono--sm" role="presentation" aria-hidden="true">
                    {header}
                  </div>
                )}
                <div
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`cmdk__item ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseMove={() => index !== activeIndex && setActive(index)}
                  onClick={() => run(command)}
                >
                  <span className="cmdk__cmd mono" aria-hidden="true">
                    {command.cmd}
                  </span>
                  <span className="cmdk__label">
                    {command.label}
                    {isCurrent && <span className="cmdk__here mono mono--sm"> · you are here</span>}
                  </span>
                  <span className="cmdk__enter mono mono--sm" aria-hidden="true">
                    ↵
                  </span>
                </div>
              </li>
            );
          })}
          {!results.length && (
            <li className="cmdk__empty mono mono--sm" role="presentation">
              command not found: {query}
            </li>
          )}
        </ul>

        <div className="cmdk__foot mono mono--sm" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> run
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
          <span className="cmdk__foot-right">
            <kbd>{mod}</kbd>
            <kbd>K</kbd>
          </span>
        </div>
        <div className="sr-only" aria-live="polite">
          {results.length} {results.length === 1 ? 'command' : 'commands'}
        </div>
      </div>
    </div>
  );
}
