// Neural spike train for the "coming soon" divider: [x, tick height] in a 400x40 box.
// Irregular spacing with a burst in the middle, like a single unit's raster.
const SPIKE_TRAIN: [number, number][] = [
  [96, 7], [118, 9], [141, 8], [150, 12], [156, 10], [161, 13], [167, 9],
  [189, 8], [214, 11], [221, 9], [247, 7], [276, 10], [312, 8],
];

/** Animated "COMING SOON" empty state, used where a list has no entries yet. */
export function ComingSoon({ label = 'AWAITING FIRST TRANSMISSION' }: { label?: string }) {
  return (
    <div className="soon" role="status">
      <div className="soon__label mono mono--sm">
        <span className="soon__dot" aria-hidden="true" />
        {label}
      </div>
      <div className="soon__title display">
        <span className="soon__glitch" data-text="COMING SOON">COMING SOON</span>
        <span className="soon__caret" aria-hidden="true" />
      </div>
      <svg className="soon__trace" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <path className="soon__trace-base" d="M0 20 H400" pathLength={100} />
        <g className="soon__spikes">
          {SPIKE_TRAIN.map(([x, h]) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={20}
              y2={20 - h}
              style={{ animationDelay: `${((x / 400) * 3.2).toFixed(2)}s` }}
            />
          ))}
        </g>
        <path className="soon__trace-scan" d="M0 20 H400" pathLength={100} />
      </svg>
    </div>
  );
}
