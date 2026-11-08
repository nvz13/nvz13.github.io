import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'animejs';
import { blogPosts, type BlogPost } from '../content/portfolioData';
import { archiveCategories, archivePhotos, hasRealPhotos, type ArchivePhoto } from '../content/archive';
import { prefersReduced, useReveal } from '../lib/motion';
import { PlateVisual } from '../components/Plate';
import { ComingSoon } from '../components/ComingSoon';
import { PhotoViewer } from '../components/PhotoViewer';

type Tab = 'photos' | 'blog';

// URL hash: #blog opens the Blog tab, #blog/<post-id> opens that post. (#writing kept for old links.)
const readHash = (): { tab: Tab; postId: string | null } => {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'blog' || hash === 'writing') return { tab: 'blog', postId: null };
  if (hash.startsWith('blog/')) return { tab: 'blog', postId: decodeURIComponent(hash.slice(5)) };
  return { tab: 'photos', postId: null };
};

function PostReader({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    if (ref.current && !prefersReduced()) {
      animate(ref.current, { opacity: [0, 1], y: [16, 0], duration: 700, ease: 'outExpo' });
    }
  }, [post.id]);

  return (
    <article className="post" ref={ref} aria-labelledby="post-title">
      <button className="post__back mono" onClick={onBack}>
        ← ALL POSTS
      </button>
      <header className="post__head">
        <div className="post__meta mono">
          <span>{post.date}</span>
          <span>{post.category}</span>
          {post.readTime && <span>{post.readTime} READ</span>}
        </div>
        <h2 id="post-title" className="post__title display">
          {post.title}
        </h2>
        {post.description && <p className="post__dek">{post.description}</p>}
      </header>
      <div className="post__body">
        {(post.body ?? []).map((para, index) =>
          para.startsWith('## ') ? <h3 key={index}>{para.slice(3)}</h3> : <p key={index}>{para}</p>,
        )}
      </div>
      {post.externalLink && (
        <a className="post__ext mono" href={post.externalLink} target="_blank" rel="noreferrer">
          READ THE FULL POST ↗
        </a>
      )}
      <button className="post__back post__back--end mono" onClick={onBack}>
        ← ALL POSTS
      </button>
    </article>
  );
}
const pad = (value: number) => String(value).padStart(2, '0');

function PhotoTile({ photo, index, onOpen }: { photo: ArchivePhoto; index: number; onOpen: () => void }) {
  // Every grid preview is landscape 4:3 unless a photo sets its own previewRatio.
  // Wider photos keep their real shape; portrait/square ones are cropped to 4:3. The viewer always shows the full image.
  const [ratio, setRatio] = useState<number | null>(null);
  const previewRatio = photo.previewRatio ?? (ratio && ratio > 4 / 3 ? ratio : 4 / 3);
  const label = photo.title || `${photo.category} ${pad(index + 1)}`;

  return (
    <button
      className={`plate${photo.src ? '' : ` plate--${photo.ratio ?? 'tall'}`}`}
      onClick={onOpen}
      data-cursor="VIEW"
      aria-label={`Open ${label}`}
    >
      <div
        className={`plate__visual${photo.src && !ratio ? ' is-loading' : ''}`}
        style={photo.src ? { aspectRatio: previewRatio } : undefined}
      >
        {photo.src ? (
          <img
            className="plate__img"
            src={photo.src}
            style={photo.previewFocus ? { objectPosition: photo.previewFocus } : undefined}
            alt={photo.caption || label}
            loading="lazy"
            decoding="async"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
            }}
          />
        ) : (
          <PlateVisual palette={photo.palette ?? ['#f4ecdf', '#e8799a', '#5a0e24']} seed={photo.seed ?? index} />
        )}
        <div className="plate__grain" aria-hidden="true" />
        <div className="plate__scan" aria-hidden="true" />
        <div className="plate__hover" aria-hidden="true">
          <span>OPEN PLATE ↗</span>
        </div>
      </div>
    </button>
  );
}

/** Small floating "back to top" button; appears once the visitor has scrolled down. */
function BackToTop() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`to-top mono mono--sm${shown ? ' is-shown' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' })}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      data-cursor="TOP"
    >
      <span aria-hidden="true">↑</span> TOP
    </button>
  );
}

export default function Archive() {
  useReveal();
  const [tab, setTab] = useState<Tab>(() => readHash().tab);
  const [postId, setPostId] = useState<string | null>(() => readHash().postId);
  const [filters, setFilters] = useState<string[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (filters.length === 0 ? archivePhotos : archivePhotos.filter((photo) =>
      filters.every((tag) => photo.tags.includes(tag)),
    )),
    [filters],
  );
  const open = openIndex === null ? null : visible[openIndex] ?? null;

  const openPost = blogPosts.find((post) => post.id === postId) ?? null;

  // Sliding pill behind the active Photos / Blog button, plus a short fade-up of the content.
  const tabsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const firstPanel = useRef(true);

  useLayoutEffect(() => {
    const measure = () => {
      const active = tabsRef.current?.querySelector<HTMLElement>('.archive-tab.is-active');
      if (active) setPill({ x: active.offsetLeft, w: active.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab]);

  useEffect(() => {
    if (firstPanel.current) {
      firstPanel.current = false;
      return;
    }
    if (!panelRef.current || prefersReduced()) return;
    animate(panelRef.current, { opacity: [0, 1], y: [10, 0], duration: 480, ease: 'outCubic' });
  }, [tab, postId]);

  const chooseTab = (next: Tab) => {
    setTab(next);
    setPostId(null);
    window.history.replaceState(null, '', next === 'blog' ? '#blog' : window.location.pathname);
  };

  const showPost = (id: string | null) => {
    setPostId(id);
    // pushState so the browser's back button returns to the post list.
    window.history.pushState(null, '', id ? `#blog/${encodeURIComponent(id)}` : '#blog');
  };

  useEffect(() => {
    const sync = () => {
      const next = readHash();
      setTab(next.tab);
      setPostId(next.postId);
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((index) => (index === null ? index : (index + delta + visible.length) % visible.length)),
    [visible.length],
  );

  // Fade the grid in whenever the filter or tab changes.
  useEffect(() => {
    if (prefersReduced() || tab !== 'photos') return;
    const items = gridRef.current?.querySelectorAll('.plate');
    if (!items?.length) return;
    animate(items, {
      opacity: [0, 1],
      y: [20, 0],
      duration: 760,
      // Cap the stagger so a big category doesn't take seconds to appear.
      delay: (_target?: unknown, index = 0) => 120 + Math.min(index, 12) * 45,
      ease: 'outExpo',
    });
  }, [filters, tab]);


  return (
    <div className="page shell">
      <header className="page-head">
        <div>
          <h1 className="page-title display">
            <small>04 / ARCHIVE</small>
            MEMORY,
            <br />
            OFFLOADED.
          </h1>
        </div>
        <div className="page-head__meta mono">
          <span>
            {hasRealPhotos ? `${archivePhotos.length} PHOTOS` : 'PHOTOS COMING SOON'}
          </span>
          <span>{blogPosts.length ? `${blogPosts.length} ${blogPosts.length === 1 ? 'POST' : 'POSTS'}` : 'BLOG COMING SOON'}</span>
        </div>
      </header>

      <div className="archive-tabs" role="tablist" aria-label="Archive sections" data-reveal ref={tabsRef}>
        <span
          className={`archive-tabs__pill${pill ? ' is-ready' : ''}`}
          aria-hidden="true"
          style={pill ? { width: pill.w, transform: `translateX(${pill.x}px)` } : undefined}
        />
        {(
          [
            ['photos', 'PHOTOS'],
            ['blog', 'BLOG'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            id={`archive-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`archive-panel-${key}`}
            className={`archive-tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => chooseTab(key)}
            data-reveal-item
          >
            <span className="archive-tab__label display">{label}</span>
          </button>
        ))}
      </div>

      <div className="archive-panel" ref={panelRef}>
      {tab === 'photos' ? (
        <section id="archive-panel-photos" role="tabpanel" aria-labelledby="archive-tab-photos">
          <div className="filter-row" role="group" aria-label="Filter photos by tags (photos must match every selected tag)">
            {[{ key: 'all', label: 'ALL', count: archivePhotos.length }, ...archiveCategories].map((item) => (
              <button
                key={item.key}
                className={`chip ${(item.key === 'all' ? filters.length === 0 : filters.includes(item.key)) ? 'is-active' : ''}`}
                onClick={() => {
                  setOpenIndex(null);
                  setFilters((current) => item.key === 'all' ? [] :
                    current.includes(item.key) ? current.filter((tag) => tag !== item.key) : [...current, item.key]);
                }}
                aria-pressed={(item.key === 'all' ? filters.length === 0 : filters.includes(item.key))}
              >
                {item.label}
              </button>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="archive-foot mono mono--sm">No photos with these tags yet. Select ALL to reset.</p>
          )}

          <div className="plates" ref={gridRef}>
            {visible.map((photo, index) => (
              <PhotoTile key={photo.id} photo={photo} index={index} onOpen={() => setOpenIndex(index)} />
            ))}
          </div>

          {!hasRealPhotos && (
            <div className="archive-foot mono mono--sm">
              <span>[ PLACEHOLDER ART — PHOTOS ON THE WAY ]</span>
            </div>
          )}
        </section>
      ) : (
        <section id="archive-panel-blog" role="tabpanel" aria-labelledby="archive-tab-blog" className="archive-writing">
          {openPost ? (
            <PostReader post={openPost} onBack={() => showPost(null)} />
          ) : blogPosts.length ? (
            <div className="post-list">
              {blogPosts.map((post) => {
                const inner = (
                  <>
                    <span className="post-row__date mono">{post.date}</span>
                    <span className="post-row__main">
                      <span className="post-row__title display">{post.title}</span>
                      <span className="post-row__desc">{post.description}</span>
                    </span>
                    <span className="post-row__meta mono">
                      <span>{post.category}</span>
                      <span className="post-row__go">{post.body?.length ? 'READ →' : 'READ ↗'}</span>
                    </span>
                  </>
                );
                return post.body?.length || !post.externalLink ? (
                  <button key={post.id} className="post-row" onClick={() => showPost(post.id)} data-cursor="READ">
                    {inner}
                  </button>
                ) : (
                  <a key={post.id} className="post-row" href={post.externalLink} target="_blank" rel="noreferrer" data-cursor="READ">
                    {inner}
                  </a>
                );
              })}
            </div>
          ) : (
            <ComingSoon />
          )}
        </section>
      )}
      </div>

      {tab === 'photos' && <BackToTop />}

      {open && openIndex !== null && (
        <PhotoViewer photos={visible} index={openIndex} onStep={step} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}
