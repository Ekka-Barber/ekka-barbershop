
// Define constants
const SW_VERSION = '1.0.0';
const CACHE_NAME = 'ekka-v1';

// Files to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Cache initialization
async function initializeCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
  } catch (error) {
    logError('Cache initialization failed:', error);
  }
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

// Check if a request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Fetch handler with improved response handling
async function handleFetch(event) {
  try {
    const request = event.request;

    // For navigation requests, respond with index.html from cache or network
    if (isNavigationRequest(request)) {
      const response = await fetch(request);
      if (response.ok) return response;

      // If network request fails, try cache
      const cachedResponse = await caches.match('/index.html');
      if (cachedResponse) return cachedResponse;

      // If both fail, return a basic response with error message
      return new Response('Navigation failed. Please check your connection.', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // For non-navigation requests, try network first
    try {
      const response = await fetch(request);
      if (response.ok) {
        // Clone the response before putting it in the cache
        const responseToCache = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseToCache);
        return response;
      }
    } catch (error) {
      // If network request fails, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
    }

    // If both network and cache fail, return a basic response
    return new Response('Resource not available', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    logError('Fetch handler error:', error);
    return new Response('Service worker error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
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
