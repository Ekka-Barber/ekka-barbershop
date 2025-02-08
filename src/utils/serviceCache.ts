
interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_KEYS = {
  SELECTED_SERVICES: 'selectedServices',
  ACTIVE_CATEGORY: 'activeCategory'
} as const;

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;
const CACHE_VERSION = 1;

const isValidCache = <T>(cachedData: CachedData<T> | null): boolean => {
  if (!cachedData) return false;
  
  const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRATION;
  const isCorrectVersion = cachedData.version === CACHE_VERSION;
  
  return !isExpired && isCorrectVersion;
};

const setCache = <T>(key: string, data: T): void => {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
  }
};

const getCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsedCache: CachedData<T> = JSON.parse(cached);
    
    if (!isValidCache(parsedCache)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedCache.data;
  } catch (error) {
    console.error(`Error retrieving cache for key ${key}:`, error);
    return null;
  }
};

// Public API
export const cacheServices = (services: any[]): void => {
  setCache(CACHE_KEYS.SELECTED_SERVICES, services);
};

export const getCachedServices = (): any[] => {
  return getCache<any[]>(CACHE_KEYS.SELECTED_SERVICES) || [];
};

export const cacheActiveCategory = (categoryId: string): void => {
  setCache(CACHE_KEYS.ACTIVE_CATEGORY, categoryId);
};

export const getCachedActiveCategory = (): string | null => {
  return getCache<string>(CACHE_KEYS.ACTIVE_CATEGORY);
};
