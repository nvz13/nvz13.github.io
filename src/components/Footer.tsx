import { footerHeadline, site } from '../content/portfolioData';
import { useRouter } from '../lib/router';

export function SiteFooter() {
  const { navigate, path } = useRouter();

  if (path === '/') {
    return (
      <footer className="site-foot site-foot--compact">
        <div className="shell site-foot__compact-inner mono mono--sm">
          <span>NIA ZAGAR / PORTFOLIO</span>
          <span>NEUROSCIENCE × CREATIVE EXPRESSION</span>
          <span>END / 2026</span>
        </div>
      </footer>
    );
  }

  // The big contact section only appears on About; other pages get the slim bar.
  if (path !== '/about') {
    return (
      <footer className="site-foot site-foot--slim">
        <div className="shell">
          <div className="site-foot__bottom">
            <span>© {new Date().getFullYear()} {site.name} — ALL SIGNALS RESERVED</span>
            <span>{site.location}</span>
            <span>DESIGNED IN THE OPEN · v4.26</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-foot" data-reveal>
      <div className="shell">
        <div className="site-foot__top" id="contact">
          <div className="mono quiet site-foot__label">[ OPEN CHANNEL ]</div>
          <div>
            <h2 className="site-foot__big">
              {footerHeadline.map((line, index) => (
                <span key={line}>
                  {index === 1 ? <em>{line}</em> : line}
                  {index < footerHeadline.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </div>
          <div className="site-foot__cta">
            <a
              className="btn btn--solid"
              href={site.email ? `mailto:${site.email}` : '/about'}
              data-cursor="WRITE"
              data-reveal-item
              onClick={(event) => {
                if (!site.email) {
                  event.preventDefault();
                  navigate('/about');
                }
              }}
            >
              <span>{site.email || 'ADD EMAIL ADDRESS'}</span>
              <span aria-hidden="true">↗</span>
            </a>
            <div className="site-foot__links">
              {site.links
                .filter((link) => link.href && link.label !== 'SCHOLAR')
                .map((link) => (
                <a
                  key={link.label}
                  href={link.href || '#contact'}
                  target={link.href ? '_blank' : undefined}
                  rel={link.href ? 'noreferrer' : undefined}
                  title={link.href ? link.label : `Add your ${link.label} URL in portfolioData.ts`}
                  data-reveal-item
                >
                  {link.href ? link.label : `ADD ${link.label} URL`} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="site-foot__bottom">
          <span>© {new Date().getFullYear()} {site.name} — ALL SIGNALS RESERVED</span>
          <span>{site.location}</span>
          <span>DESIGNED IN THE OPEN · v4.26</span>
        </div>
      </div>
    </footer>
  );
}
