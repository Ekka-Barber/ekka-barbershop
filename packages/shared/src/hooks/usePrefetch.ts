import { useCallback, useRef } from 'react';

const prefetchedModules = new Set<string>();

interface PrefetchOptions {
  delay?: number;
}

export function usePrefetch(options: PrefetchOptions = {}) {
  const { delay = 50 } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback(
    (moduleLoader: () => Promise<unknown>, key: string) => {
      if (prefetchedModules.has(key)) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (!prefetchedModules.has(key)) {
          prefetchedModules.add(key);
          moduleLoader().catch(() => {
            prefetchedModules.delete(key);
          });
        }
      }, delay);
    },
    [delay]
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const isPrefetched = useCallback((key: string) => {
    return prefetchedModules.has(key);
  }, []);

  return {
    prefetch,
    cancelPrefetch,
    isPrefetched,
  };
}

export function createRoutePrefetch(
  routeKey: string,
  loader: () => Promise<unknown>
) {
  let prefetched = false;

  return {
    key: routeKey,
    preload: () => {
      if (!prefetched) {
        prefetched = true;
        loader().catch(() => {
          prefetched = false;
        });
      }
    },
    isLoaded: () => prefetched,
  };
}
