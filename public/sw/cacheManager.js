
// Cache name - update this when making significant changes
const CACHE_NAME = 'ekka-v1';

// Resources to cache immediately on service worker install
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Initialize the cache with important resources
export const initializeCache = async () => {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(INITIAL_CACHED_RESOURCES);
};

// Clean up old caches
export const cleanupOldCaches = async () => {
  const cacheKeys = await caches.keys();
  const cacheCleanupPromises = cacheKeys
    .filter(key => key !== CACHE_NAME)
    .map(key => caches.delete(key));
  
  return Promise.all(cacheCleanupPromises);
};

// Handle fetch requests with a network-first, cache-fallback strategy
export const handleFetch = async (event) => {
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
export const cacheUrls = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(urls);
};

// Clear specific cached items (useful for forced refresh)
export const clearCachedItems = async (urls) => {
  const cache = await caches.open(CACHE_NAME);
  return Promise.all(urls.map(url => cache.delete(url)));
};
