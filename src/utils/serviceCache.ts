
interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_KEYS = {
  SELECTED_SERVICES: 'selectedServices',
  ACTIVE_CATEGORY: 'activeCategory'
} as const;

// Cache expiration time (24 hours)
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
    // If localStorage is full, clear old caches
    clearOldCaches();
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

const clearOldCaches = (): void => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.timestamp && Date.now() - parsed.timestamp > CACHE_EXPIRATION) {
              localStorage.removeItem(key);
            }
          } catch {
            // If we can't parse the value, it's not our cache data, skip it
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error clearing old caches:', error);
  }
};

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

export const clearServiceCache = (): void => {
  localStorage.removeItem(CACHE_KEYS.SELECTED_SERVICES);
  localStorage.removeItem(CACHE_KEYS.ACTIVE_CATEGORY);
};

// New function to sync cache with server state if needed
export const syncCacheWithServer = async (services: any[]): Promise<void> => {
  const cachedServices = getCachedServices();
  
  // If cached services exist, validate them against server data
  if (cachedServices.length > 0) {
    const validServiceIds = new Set(services.map(s => s.id));
    const validCachedServices = cachedServices.filter(s => validServiceIds.has(s.id));
    
    if (validCachedServices.length !== cachedServices.length) {
      // Some cached services are no longer valid, update cache
      cacheServices(validCachedServices);
    }
  }
};
