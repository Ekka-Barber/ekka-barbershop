
// Define constants
const SW_VERSION = '1.0.0';
const CACHE_NAME = 'ekka-v1';

// Cache initialization
async function initializeCache() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll([
    '/',
    '/index.html',
    '/manifest.json'
  ]);
}

// Cache cleanup
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName))
  );
}

// Fetch handler
async function handleFetch(event) {
  return fetch(event.request)
    .catch(() => {
      return caches.match(event.request);
    });
}

// Logging utilities
function log(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, data);
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, error);
}

// Install event
self.addEventListener('install', (event) => {
  log('Installing service worker');
  self.skipWaiting();
  event.waitUntil(initializeCache());
});

// Activate event
self.addEventListener('activate', (event) => {
  log('Activating service worker');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanupOldCaches()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

// Error handling
self.addEventListener('error', (event) => {
  logError('Service worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
  logError('Unhandled promise rejection:', event.reason);
});
