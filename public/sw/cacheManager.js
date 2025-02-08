
const CACHE_NAME = 'ekka-v1';

export const initializeCache = async () => {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll([
    '/',
    '/index.html',
    '/manifest.json'
  ]);
};

export const cleanupOldCaches = async () => {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName))
  );
};

export const handleFetch = async (event) => {
  return fetch(event.request)
    .catch(() => {
      return caches.match(event.request);
    });
};
