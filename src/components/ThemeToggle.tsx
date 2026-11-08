import { useTheme } from '../lib/theme';

export function ThemeToggle({ withLabel = true }: { withLabel?: boolean }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      className="reality"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      data-cursor={theme === 'light' ? 'GO DARK' : 'GO LIGHT'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title="Change reality"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="12" cy="12" r="4.4" />
        <path d="M12 2.4v3.2M12 18.4v3.2M2.4 12h3.2M18.4 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M18.8 5.2l-2.3 2.3M7.5 16.5l-2.3 2.3" />
      </svg>
      {withLabel && <span className="long">CHANGE REALITY</span>}
      <span className="dot" aria-hidden="true" />
    </button>
  );
}
