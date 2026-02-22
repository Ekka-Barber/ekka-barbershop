type PreloadFn = () => Promise<void>;

const preloadRegistry = new Map<string, PreloadFn>();

export const registerPreloader = (path: string, preload: PreloadFn) => {
  preloadRegistry.set(path, preload);
};

export const getPreloader = (path: string): PreloadFn | null => {
  const exactMatch = preloadRegistry.get(path);
  if (exactMatch) return exactMatch;

  for (const [key, fn] of preloadRegistry) {
    if (path.startsWith(key) && key !== '/') {
      return fn;
    }
  }

  return preloadRegistry.get('/') || null;
};
