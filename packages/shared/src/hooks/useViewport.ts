import { useCallback, useSyncExternalStore } from 'react';

type ViewportState = {
  width: number;
  height: number;
};

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

let listeners: Array<(state: ViewportState) => void> = [];
let viewportState: ViewportState = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
};
let isListenerAttached = false;

const updateViewportState = () => {
  viewportState = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  listeners.forEach((listener) => listener(viewportState));
};

const attachResizeListener = () => {
  if (!isListenerAttached && typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewportState, { passive: true });
    isListenerAttached = true;
  }
};

const detachResizeListener = () => {
  if (isListenerAttached && listeners.length === 0) {
    window.removeEventListener('resize', updateViewportState);
    isListenerAttached = false;
  }
};

const subscribe = (listener: (state: ViewportState) => void) => {
  listeners.push(listener);
  attachResizeListener();

  return () => {
    listeners = listeners.filter((l) => l !== listener);
    detachResizeListener();
  };
};

const getSnapshot = (): ViewportState => viewportState;

const getServerSnapshot = (): ViewportState => ({
  width: 1024,
  height: 768,
});

export function useViewport(): ViewportState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useViewportWidth(): number {
  const { width } = useViewport();
  return width;
}

export function useIsMobile(breakpoint: number = 768): boolean {
  const { width } = useViewport();
  return width < breakpoint;
}

export function useBreakpoint(): Breakpoint {
  const { width } = useViewport();

  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

export function useIsAboveBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useViewport();
  return width >= BREAKPOINTS[breakpoint];
}

export function useIsBelowBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useViewport();
  return width < BREAKPOINTS[breakpoint];
}

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  }, []);

  const getServerMatches = useCallback(() => false, []);

  const subscribeMediaQuery = useCallback(
    (listener: (matches: boolean) => void) => {
      if (typeof window === 'undefined') return () => {};

      const mediaQueryList = window.matchMedia(query);
      const handleChange = (e: MediaQueryListEvent) => {
        listener(e.matches);
      };

      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribeMediaQuery,
    () => getMatches(query),
    getServerMatches
  );
}
