
import { log, logError } from './logger.js';

/**
 * Initialize the cache with important resources
 * @param {string} cacheName - The name of the cache to use
 * @param {string[]} resources - Array of URLs to cache
 * @returns {Promise<void>}
 */
export const initializeCache = async (cacheName, resources) => {
  try {
    const cache = await caches.open(cacheName);
    log(`Precaching ${resources.length} resources`);
    await cache.addAll(resources);
    log('Precaching complete');
  } catch (error) {
    logError('Failed to initialize cache', error);
    throw error;
  }
};

/**
 * Clean up old caches
 * @param {string} currentCacheName - The name of the current cache to keep
 * @returns {Promise<void>}
 */
export const cleanupOldCaches = async (currentCacheName) => {
  try {
    const cacheKeys = await caches.keys();
    log(`Found ${cacheKeys.length} caches, keeping: ${currentCacheName}`);
    
    const deletePromises = cacheKeys
      .filter(key => key !== currentCacheName)
      .map(key => {
        log(`Deleting old cache: ${key}`);
        return caches.delete(key);
      });
    
    await Promise.all(deletePromises);
    log('Cache cleanup complete');
  } catch (error) {
    logError('Failed to clean up caches', error);
    throw error;
  }
};

/**
 * Handles fetch requests using stale-while-revalidate strategy
 * @param {FetchEvent} event - The fetch event
 * @param {string} cacheName - The name of the cache to use
 * @returns {Promise<Response>}
 */
export const handleFetch = async (event, cacheName) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    try {
      // Try network first
      log(`Navigation request for: ${url.pathname}`);
      const networkResponse = await fetch(request);
      
      // Cache the response for future use
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      
      return networkResponse;
    } catch (error) {
      logError(`Navigation request failed for: ${url.pathname}`, error);
      
      // Network failed, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        log(`Serving cached navigation response for: ${url.pathname}`);
        return cachedResponse;
      }
      
      // If cache fails too, show offline page
      log(`Serving offline page for: ${url.pathname}`);
      return caches.match('/offline.html');
    }
  }
  
  // For API requests - Network first, no cache
  if (url.pathname.includes('/api/')) {
    try {
      log(`API request for: ${url.pathname}`);
      return await fetch(request);
    } catch (error) {
      logError(`API request failed for: ${url.pathname}`, error);
      return new Response(JSON.stringify({
        error: 'You are offline and API requests cannot be served from cache.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For static assets - Stale while revalidate
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      log(`Cache hit for: ${url.pathname}`);
      
      // Fetch a fresh version in the background
      event.waitUntil(
        fetch(request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              const cache = caches.open(cacheName);
              return cache.then(cache => {
                log(`Updating cache for: ${url.pathname}`);
                return cache.put(request, networkResponse.clone());
              });
            }
          })
          .catch(err => logError(`Background fetch failed for: ${url.pathname}`, err))
      );
      
      return cachedResponse;
    }
    
    // Not in cache, get from network
    log(`Cache miss for: ${url.pathname}, fetching from network`);
    const networkResponse = await fetch(request);
    
    // Add to cache if successful
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      event.waitUntil(
        caches.open(cacheName).then(cache => {
          log(`Caching new resource: ${url.pathname}`);
          return cache.put(request, clonedResponse);
        })
      );
    }
    
    return networkResponse;
  } catch (error) {
    logError(`Failed to fetch resource: ${url.pathname}`, error);
    
    // Both network and cache failed
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      // Return a placeholder for images
      log(`Serving placeholder for: ${url.pathname}`);
      return caches.match('/placeholder.svg');
    }
    
    // For other resources
    return new Response('Resource unavailable offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

/**
 * Cache a list of URLs
 * @param {string} cacheName - The name of the cache to use
 * @param {string[]} urls - List of URLs to cache
 * @returns {Promise<void>}
 */
export const cacheUrls = async (cacheName, urls) => {
  try {
    const cache = await caches.open(cacheName);
    log(`Adding ${urls.length} URLs to cache`);
    await cache.addAll(urls);
    log('URLs cached successfully');
  } catch (error) {
    logError('Failed to cache URLs', error);
    throw error;
  }
};

/**
 * Clear specific cached items
 * @param {string} cacheName - The name of the cache to use
 * @param {string[]} urls - List of URLs to remove from cache
 * @returns {Promise<boolean[]>}
 */
export const clearCachedItems = async (cacheName, urls) => {
  try {
    const cache = await caches.open(cacheName);
    log(`Removing ${urls.length} URLs from cache`);
    const results = await Promise.all(urls.map(url => cache.delete(url)));
    log('Cache items cleared successfully');
    return results;
  } catch (error) {
    logError('Failed to clear cached items', error);
    throw error;
  }
};
