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
import { animate } from 'animejs';
import { prefersReduced } from './motion';
import { routes } from '../content/portfolioData';

const ROUTE_REGISTRY = routes;
export const ROUTES = ROUTE_REGISTRY.filter((route) => route.path !== '/signal');

export type RoutePath = (typeof ROUTE_REGISTRY)[number]['path'];
export type RouteInfo = (typeof ROUTE_REGISTRY)[number];

const isRoute = (value: string): value is RoutePath =>
  ROUTE_REGISTRY.some((route) => route.path === value);

const routeForPath = (path: RoutePath) =>
  ROUTE_REGISTRY.find((route) => route.path === path) ?? ROUTE_REGISTRY[0];

// Old route names, so existing links and bookmarks still resolve.
const LEGACY_PATHS: Record<string, RoutePath> = {
  '/dossier': '/about',
  '/interface': '/projects',
};

const currentRoute = (): RoutePath => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (LEGACY_PATHS[path]) {
    const target = LEGACY_PATHS[path];
    window.history.replaceState({}, '', target);
    return target;
  }
  return isRoute(path) ? path : '/';
};

type RouterValue = {
  path: RoutePath;
  route: RouteInfo;
  navigate: (to: RoutePath) => void;
};

const RouterCtx = createContext<RouterValue>({
  path: '/',
  route: ROUTE_REGISTRY[0],
  navigate: () => {},
});

export const useRouter = () => useContext(RouterCtx);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<RoutePath>(currentRoute);
  const busyRef = useRef(false);

  useEffect(() => {
    const onPop = () => setPath(currentRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback(
    (to: RoutePath) => {
      if (busyRef.current) return;
      if (to === path) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      window.history.pushState({}, '', to);

      const stage = document.querySelector<HTMLElement>('.page-stage');
      if (!stage || prefersReduced()) {
        setPath(to);
        window.scrollTo(0, 0);
        return;
      }

      // Cross-fade: ease the current page out, swap it while invisible,
      // then ease the next page in. No overlay, no hard cut.
      busyRef.current = true;
      animate(stage, {
        opacity: [1, 0],
        translateY: [0, -6],
        duration: 260,
        ease: 'inOutSine',
        onComplete: () => {
          flushSync(() => setPath(to));
          window.scrollTo(0, 0);
          animate(stage, {
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 640,
            ease: 'outCubic',
            onComplete: () => {
              // Clear the transform so fixed-position children aren't trapped.
              stage.style.transform = '';
              busyRef.current = false;
            },
          });
        },
      });
    },
    [path],
  );

  return (
    <RouterCtx.Provider
      value={{ path, route: routeForPath(path), navigate }}
    >
      {children}
    </RouterCtx.Provider>
  );
}
