
const SW_VERSION = '1.0.1'; // Increment this version
const CACHE_NAME = `ekka-v${SW_VERSION}`;

const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

const BYPASS_CACHE_PATTERNS = [
  /\/api\//,
  /supabase/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      initializeCache(),
      self.skipWaiting() // Force activation
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim() // Take control of all pages immediately
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

async function initializeCache() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(INITIAL_CACHED_RESOURCES);
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames
      .filter(name => name !== CACHE_NAME)
      .map(name => caches.delete(name))
  );
}

async function handleFetch(event) {
  const request = event.request;

  // Skip cache for specific patterns
  if (BYPASS_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    return fetch(request);
  }

  try {
    // Try network first
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline');
  }
}

// Force update check every few minutes
setInterval(() => {
  self.registration.update();
}, 5 * 60 * 1000); // Check every 5 minutes
