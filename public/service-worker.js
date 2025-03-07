// Service Worker for Ekka Barbershop PWA
// Version: 1.0.0

// Cache name - update this when making significant changes
const CACHE_NAME = 'ekka-v1';

// Resources to cache immediately on service worker install
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Initialize the cache with important resources
const initializeCache = async () => {
  const cache = await caches.open(CACHE_NAME);
  
  // Use individual cache adds with error handling instead of addAll
  const cachePromises = INITIAL_CACHED_RESOURCES.map(async (resource) => {
    try {
      const response = await fetch(resource, { cache: 'reload' });
      if (response.ok) {
        return cache.put(resource, response);
      }
      console.log(`[Service Worker] Failed to cache: ${resource}`);
    } catch (error) {
      console.error(`[Service Worker] Error caching ${resource}:`, error);
    }
  });
  
  return Promise.allSettled(cachePromises);
};

// Clean up old caches
const cleanupOldCaches = async () => {
  const cacheKeys = await caches.keys();
  const cacheCleanupPromises = cacheKeys
    .filter(key => key !== CACHE_NAME)
    .map(key => caches.delete(key));
  
  return Promise.all(cacheCleanupPromises);
};

// Handle fetch requests with a network-first, cache-fallback strategy
const handleFetch = async (event) => {
  // For navigation requests, try network first then fallback to cache
  if (event.request.mode === 'navigate') {
    try {
      // Try network first
      const networkResponse = await fetch(event.request);
      return networkResponse;
    } catch (error) {
      // Network failed, try cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If cache fails too, show offline page
      return caches.match('/offline.html');
    }
  }
  
  // For other requests like assets, API calls, etc.
  try {
    // Check cache first for non-API requests
    if (!event.request.url.includes('/api/')) {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(event.request)
          .then(response => {
            if (response.ok) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clonedResponse);
              });
            }
          })
          .catch(() => {/* ignore fetch errors */});
        
        return cachedResponse;
      }
    }
    
    // Not in cache or is API request, try network
    const response = await fetch(event.request);
    
    // Cache successful responses for non-API requests
    if (response.ok && !event.request.url.includes('/api/')) {
      const clonedResponse = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, clonedResponse);
    }
    
    return response;
  } catch (error) {
    // Both network and cache failed
    // For API requests, return a JSON error
    if (event.request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'You are offline and the requested resource is not cached.'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For other assets, try cache again
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort: return a placeholder or error response
    if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      // Return a placeholder image for image requests
      return caches.match('/placeholder.svg');
    }
    
    // For other resources
    return new Response('Resource unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
};

// Cache a list of URLs
const cacheUrls = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  const cachePromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return cache.put(url, response);
      }
    } catch (error) {
      console.error(`[Service Worker] Error caching ${url}:`, error);
    }
  });
  return Promise.allSettled(cachePromises);
};

// Clear specific cached items (useful for forced refresh)
const clearCachedItems = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  return Promise.all(urls.map(url => cache.delete(url)));
};

// Service worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      initializeCache()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      cleanupOldCaches()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

// Add message handler for SKIP_WAITING
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCachedItems(event.data.urls));
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
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

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification);
  event.notification.close();
  
  // This looks for the relevant open window and focuses it,
  // or opens a new window if none is found
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

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Function to sync bookings from cache
async function syncBookings() {
  console.log('[Service Worker] Syncing bookings');
  
  try {
    // Check for cached bookings in IndexedDB or other storage
    // and send them to the server
    // This is just a placeholder implementation
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

// Handle periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic Sync:', event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

// Function to update content in the background
async function updateContent() {
  console.log('[Service Worker] Updating content');
  
  try {
    // Fetch new content and update cache
    // This is just a placeholder implementation
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Content update failed:', error);
    return Promise.reject(error);
  }
}
