type StorageCache = Map<string, { value: string | null; timestamp: number }>;

const memoryCache: StorageCache = new Map();
const CACHE_TTL = 5000;
const CACHE_PREFIX = 'ekka:';

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

function getCachedItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const fullKey = CACHE_PREFIX + key;
  const cached = memoryCache.get(fullKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.value;
  }

  const value = localStorage.getItem(fullKey);
  memoryCache.set(fullKey, { value, timestamp: Date.now() });

  return value;
}

function setCachedItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const fullKey = CACHE_PREFIX + key;
  localStorage.setItem(fullKey, value);
  memoryCache.set(fullKey, { value, timestamp: Date.now() });
}

export function getStorageItem(key: string, defaultValue: string = ''): string {
  return getCachedItem(key) ?? defaultValue;
}

export function setStorageItem(key: string, value: string): void {
  setCachedItem(key, value);
}
