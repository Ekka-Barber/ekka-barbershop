// Service Worker for Ekka Barbershop PWA
// Version: 1.0.2 - Enhanced caching and prefetching

// Cache name - update this when making significant changes
const CACHE_NAME = 'ekka-v1.2';

// Resources to cache immediately on service worker install
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/placeholder.svg'
];

// Critical resources to prefetch for better performance
const CRITICAL_RESOURCES = [
  '/fonts/IBMPlexSansArabic-Regular.ttf',
  '/logos/logo-192.png',
  '/logos/badge-96.png'
];

// Initialize the cache with important resources
const initializeCache = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Cache initial resources
    const initialPromises = INITIAL_CACHED_RESOURCES.map(async (resource) => {
      try {
        const response = await fetch(resource, { cache: 'reload' });
        if (response.ok) {
          return cache.put(resource, response);
        }
      } catch (error) {
        // Silent fail for initial resources
      }
    });

    // Cache critical resources with lower priority
    const criticalPromises = CRITICAL_RESOURCES.map(async (resource) => {
      try {
        const response = await fetch(resource, { cache: 'default' });
        if (response.ok) {
          return cache.put(resource, response);
        }
      } catch (error) {
        // Silent fail for critical resources
      }
    });

    return Promise.allSettled([...initialPromises, ...criticalPromises]);
  } catch (error) {
    console.warn('Failed to initialize cache:', error);
    // Try to clear corrupted cache and retry once
    try {
      await caches.delete(CACHE_NAME);
      const cache = await caches.open(CACHE_NAME);
      console.log('Cache reinitialized after clearing corrupted data');
      return cache;
    } catch (retryError) {
      console.error('Failed to reinitialize cache:', retryError);
      return null;
    }
  }
};

// Clean up old caches
const cleanupOldCaches = async () => {
  const cacheKeys = await caches.keys();
  const cacheCleanupPromises = cacheKeys
    .filter(key => key !== CACHE_NAME)
    .map(key => caches.delete(key));
  
  return Promise.all(cacheCleanupPromises);
};

// Handle fetch requests with a cache-first, network-fallback strategy
// Changed from network-first to cache-first for improved mobile experience
const handleFetch = async (event) => {
  // Skip caching for non-GET requests (POST, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return fetch(event.request);
  }
  
  // First check if the request is a navigation request
  if (event.request.mode === 'navigate') {
    try {
      // Try network first to ensure bots and users get fresh content
      const networkResponse = await fetch(event.request);
      
      // Cache the response for next time
      if (networkResponse.ok) {
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clonedResponse);
        });
      }
      
      return networkResponse;
    } catch (error) {
      // Network failed, try cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Both network and cache failed, show offline page
      return caches.match('/offline.html');
    }
  }
  
  // For other GET requests like assets, API calls, etc.
  try {
    // Handle API requests with network-first strategy
    if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
      try {
        // Try network first for API calls
        const networkResponse = await fetch(event.request);

        // Cache successful API responses for offline use
        if (networkResponse.ok && networkResponse.status !== 204) {
          const clonedResponse = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          // Add cache control header for API responses
          const responseToCache = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: {
              ...Object.fromEntries(clonedResponse.headers.entries()),
              'sw-cache-time': Date.now().toString()
            }
          });
          cache.put(event.request, responseToCache);
        }

        return networkResponse;
      } catch (networkError) {
        // Network failed, try cache for API requests
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw networkError;
      }
    }

    // For assets and other resources, use cache-first with background update
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      // Return cached response and update cache in background
      if (navigator.onLine && event.request.mode !== 'navigate') {
        fetch(event.request)
          .then(response => {
            if (response.ok) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clonedResponse);
              }).catch(error => {
                console.warn('Failed to update cache in background:', error);
              });
            }
          })
          .catch(() => {/* ignore fetch errors */});
      }

      return cachedResponse;
    }

    // Not in cache, fetch from network
    const response = await fetch(event.request);

    // Cache successful responses
    if (response.ok) {
      const clonedResponse = response.clone();
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, clonedResponse);
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
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
      // Silent fail
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
  // Silent install
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      initializeCache()
    ])
  );
});

self.addEventListener('activate', (event) => {
  // Silent activate
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

// Prefetch common routes and resources for better performance
const prefetchCommonResources = async () => {
  const commonResources = [
    '/customer',
    '/menu',
    '/offers'
  ];

  const cachePromises = commonResources.map(async (resource) => {
    try {
      const response = await fetch(resource, { cache: 'default' });
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME).catch(error => {
          console.warn('Failed to open cache for prefetching:', error);
          return null;
        });
        if (cache) {
          return cache.put(resource, response);
        }
      }
    } catch (error) {
      // Silent fail for prefetching
    }
  });

  return Promise.allSettled(cachePromises);
};

// Handle messages from the window
self.addEventListener('message', (event) => {
  // Silent message handling

  if (!event.data) return;

  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.payload;
    event.waitUntil(cacheUrls(urls));
    return;
  }

  if (event.data.type === 'CLEAR_ITEMS') {
    const urls = event.data.payload;
    event.waitUntil(clearCachedItems(urls));
    return;
  }

  if (event.data.type === 'PREFETCH_COMMON') {
    event.waitUntil(prefetchCommonResources());
    return;
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  // Silent push handling
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Ekka Barbershop',
      icon: '/logos/logo-192.png',
      badge: '/logos/badge-96.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Ekka Barbershop', options)
    );
  } catch (error) {
    // Silent fail
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  // Silent notification click handling
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already a window open
      const hadWindowToFocus = windowClients.some((windowClient) => {
        if (windowClient.url === urlToOpen) {
          windowClient.focus();
          return true;
        }
        return false;
      });
      
      // If not, open a new window
      if (!hadWindowToFocus) {
        clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  // Silent sync handling
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  try {
    // Get stored bookings from IndexedDB
    // Actual implementation would synchronize offline bookings
    // with server once online
    
    // Clear synced items from offline storage
    return true;
  } catch (error) {
    // Silent fail
    return false;
  }
}

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  // Silent periodic sync handling
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    // Update cached content, e.g., pre-cache latest price list
    return true;
  } catch (error) {
    // Silent fail
    return false;
  }
}
