import type { CSSProperties } from 'react';
import { rng } from '../lib/motion';

type PlateVisualProps = {
  palette: [string, string, string];
  seed: number;
};

const alpha = (hex: string, value: string) => `${hex}${value}`;

/**
 * Procedural duotone "photograph" — used wherever a real image has not
 * been supplied yet. Pass `src` in the data file to use your own photos.
 */
export function PlateVisual({ palette, seed }: PlateVisualProps) {
  const random = rng(seed);

  const variant = Math.floor(random() * 3);
  const subjectX = Math.round(18 + random() * 64);
  const subjectY = Math.round(16 + random() * 54);
  const subjectR = Math.round(9 + random() * 16);
  const angle = Math.round(random() * 360);
  const horizon = Math.round(38 + random() * 34);
  const accent = palette[Math.floor(random() * 3)];
  const companion = palette[(palette.indexOf(accent) + 1) % 3];

  const blobs = Array.from({ length: 4 }, () => ({
    x: Math.round(6 + random() * 88),
    y: Math.round(4 + random() * 90),
    r: Math.round(24 + random() * 52),
    color: palette[Math.floor(random() * 3)],
    a: random() > 0.5 ? '88' : 'bb',
  }));

  const structure =
    variant === 0
      ? [
          `radial-gradient(circle at ${subjectX}% ${subjectY}%, ${alpha(accent, 'f2')} 0 ${subjectR}%, ${alpha(
            companion,
            '66',
          )} ${subjectR}% ${subjectR + 0.7}%, transparent ${subjectR + 1.6}%)`,
          `radial-gradient(circle at ${subjectX}% ${subjectY}%, transparent 0 ${
            subjectR + 4
          }%, ${alpha(companion, '2e')} ${subjectR + 4}% ${subjectR + 9}%, transparent ${subjectR + 9.6}%)`,
        ]
      : variant === 1
        ? [
            `conic-gradient(from ${angle}deg at ${subjectX}% ${subjectY}%, ${alpha(
              accent,
              'aa',
            )} 0deg 52deg, transparent 52deg 128deg, ${alpha(companion, '77')} 128deg 196deg, transparent 196deg 360deg)`,
            `linear-gradient(${angle}deg, transparent 0 46%, ${alpha(accent, '55')} 46% 46.5%, transparent 46.5% 100%)`,
          ]
        : [
            `repeating-linear-gradient(${angle}deg, ${alpha(accent, '40')} 0 1px, transparent 1px 11px)`,
            `radial-gradient(ellipse at ${subjectX}% ${subjectY}%, ${alpha(
              accent,
              'dd',
            )} 0 ${subjectR - 3}%, ${alpha(companion, '55')} ${subjectR - 3}% ${subjectR}%, transparent ${
              subjectR + 1
            }%)`,
          ];

  const layers = [
    'linear-gradient(0deg, rgba(18,3,9,0.62) 0%, rgba(18,3,9,0.1) 46%, rgba(18,3,9,0) 72%)',
    `radial-gradient(120% 90% at 24% 8%, rgba(255,246,238,0.34) 0%, rgba(255,246,238,0) 58%)`,
    `linear-gradient(180deg, rgba(18,3,9,0) ${horizon - 0.5}%, rgba(18,3,9,0.42) ${
      horizon
    }%, rgba(18,3,9,0) ${horizon + 1.2}%)`,
    ...structure,
    ...blobs.map(
      (blob) =>
        `radial-gradient(${blob.r}% ${blob.r}% at ${blob.x}% ${blob.y}%, ${alpha(
          blob.color,
          blob.a,
        )} 0%, transparent 66%)`,
    ),
    `linear-gradient(154deg, ${palette[2]} 0%, ${palette[1]} 46%, ${palette[0]} 100%)`,
  ];

  const style: CSSProperties = {
    backgroundImage: layers.join(', '),
    backgroundColor: palette[2],
    boxShadow: 'inset 0 0 90px rgba(18,3,9,0.45)',
  };

  return <div className="plate__img" style={style} aria-hidden="true" />;
}
