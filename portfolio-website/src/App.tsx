import { useCallback, useEffect, useState } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { ThemeProvider } from './lib/theme';
import { useSmoothScroll } from './lib/smoothScroll';
import { Loader } from './components/Loader';
import { Cursor } from './components/Cursor';
import { Nav } from './components/Nav';
import { StatusBar } from './components/StatusBar';
import { SiteFooter } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import Home from './pages/Home';
import Research from './pages/Research';
import Interface from './pages/Interface';
import Archive from './pages/Archive';
import Signal from './pages/Signal';
import Dossier from './pages/Dossier';

function Site() {
  const { path } = useRouter();
  const [ready, setReady] = useState(false);
  const handleLoaded = useCallback(() => setReady(true), []);
  useSmoothScroll();

  useEffect(() => {
    document.body.classList.toggle('is-loading', !ready);
  }, [ready]);

  const Page =
    path === '/research'
      ? Research
      : path === '/projects'
        ? Interface
        : path === '/archive'
          ? Archive
          : path === '/signal'
            ? Signal
            : path === '/about'
              ? Dossier
              : Home;

  return (
    <>
      <Loader onDone={handleLoaded} />
      <a className="skip-link" href="#main">
        SKIP TO CONTENT
      </a>
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <span className="corner corner--tl" aria-hidden="true" />
      <span className="corner corner--br" aria-hidden="true" />

      {ready && <Cursor />}

      <Nav />

      <main id="main">
        {ready ? (
          <div className="page-stage">
            <Page key={path} />
          </div>
        ) : null}
        {ready && <SiteFooter />}
      </main>

      <StatusBar />
      {ready && <CommandPalette />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <Site />
      </RouterProvider>
    </ThemeProvider>
  );
}
