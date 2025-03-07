// Service worker version for tracking
const SW_VERSION = '1.0.0';

// Cache name and critical resources to precache
const CACHE_NAME = 'ekka-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.ar.json',
  '/offline.html',
  '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
  '/index.css'
];

// Logger utility functions
function log(message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[ServiceWorker ${SW_VERSION}] ${timestamp} - `;
  
  if (data) {
    console.log(prefix + message, data);
  } else {
    console.log(prefix + message);
  }
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  const prefix = `[ServiceWorker ${SW_VERSION}] ${timestamp} - `;
  
  console.error(prefix + message, error);
}

// Cache management functions
async function initializeCache() {
  log('Initializing cache');
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(CRITICAL_RESOURCES);
}

async function cleanupOldCaches() {
  log('Cleaning up old caches');
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(cacheName => cacheName !== CACHE_NAME);
  
  return Promise.all(
    cachesToDelete.map(cacheName => {
      log(`Deleting old cache: ${cacheName}`);
      return caches.delete(cacheName);
    })
  );
}

async function handleFetch(event) {
  const requestUrl = new URL(event.request.url);
  
  // For navigate requests, serve index.html
  if (event.request.mode === 'navigate') {
    log('Handling navigation request', event.request.url);
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) return indexResponse;
  }
  
  // Check cache first for all other requests
  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) {
    log('Serving from cache', event.request.url);
    // Revalidate cache in the background
    revalidateCache(event.request);
    return cachedResponse;
  }
  
  // If not in cache, try network
  log('Fetching from network', event.request.url);
  try {
    const networkResponse = await fetch(event.request);
    // Clone and cache the response
    if (shouldCache(event.request)) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    logError('Network fetch failed', error);
    
    // For navigate requests, return offline page
    if (event.request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    
    // For image requests, return a placeholder
    if (event.request.destination === 'image') {
      const placeholderResponse = await caches.match('/placeholder.svg');
      if (placeholderResponse) return placeholderResponse;
    }
    
    // Otherwise just throw the error
    throw error;
  }
}

// Helper function to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Don't cache cross-origin requests
  if (url.origin !== location.origin) {
    return false;
  }
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }
  
  // Don't cache API requests
  if (url.pathname.startsWith('/api/')) {
    return false;
  }
  
  return true;
}

// Helper function to revalidate a cached response
async function revalidateCache(request) {
  if (!shouldCache(request)) {
    return;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse);
      log('Cache revalidated', request.url);
    }
  } catch (error) {
    logError('Revalidation failed', error);
  }
}

// Helper function to sync bookings
async function syncBookings() {
  log('Syncing bookings');
  
  try {
    // Implementation depends on app's data storage strategy
    return Promise.resolve();
  } catch (error) {
    logError('Sync failed', error);
    return Promise.reject(error);
  }
}

// Helper function to update content
async function updateContent() {
  log('Updating content');
  
  try {
    // Fetch new content and update cache
    return Promise.resolve();
  } catch (error) {
    logError('Content update failed', error);
    return Promise.reject(error);
  }
}

// Install event handler - precache critical resources
self.addEventListener('install', (event) => {
  log('Installing Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      initializeCache()
    ])
  );
});

// Activate event handler - clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      cleanupOldCaches()
    ])
  );
});

// Fetch event handler - implement stale-while-revalidate for most resources
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle the fetch event with our caching strategy
  event.respondWith(handleFetch(event));
});

// Push notification handler
self.addEventListener('push', (event) => {
  log('Push notification received');
  
  const title = 'Ekka Barbershop';
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
    badge: '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked', event.notification);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Background sync handler
self.addEventListener('sync', (event) => {
  log('Background sync event: ' + event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Periodic background sync handler
self.addEventListener('periodicsync', (event) => {
  log('Periodic sync event: ' + event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});
