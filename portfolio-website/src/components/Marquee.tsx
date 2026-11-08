import { academicInterests, creativeInterests } from '../content/portfolioData';

const ITEMS = [...academicInterests, ...creativeInterests].map((interest) => interest.toUpperCase());

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy}>
            {ITEMS.map((item) => (
              <span key={`${copy}-${item}`}>
                {item} <i>✳</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
