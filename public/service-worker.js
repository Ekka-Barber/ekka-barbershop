const SW_VERSION = '1.0.0';

const CACHE_NAME = 'ekka-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.ar.json',
  '/offline.html',
  '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png'
];

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

async function initializeCache() {
  log('Initializing cache');
  const cache = await caches.open(CACHE_NAME);
  
  const successfulCaches = [];
  const failedCaches = [];
  
  for (const resource of CRITICAL_RESOURCES) {
    try {
      await cache.add(resource);
      successfulCaches.push(resource);
    } catch (error) {
      failedCaches.push({ resource, error: error.message });
      logError(`Failed to cache: ${resource}`, error);
    }
  }
  
  log('Cache initialization completed', { 
    successful: successfulCaches.length, 
    failed: failedCaches.length 
  });
  
  return { successfulCaches, failedCaches };
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
  if (event.request.mode === 'navigate') {
    log('Handling navigation request', event.request.url);
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) return indexResponse;
  }
  
  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) {
    log('Serving from cache', event.request.url);
    revalidateCache(event.request);
    return cachedResponse;
  }
  
  log('Fetching from network', event.request.url);
  try {
    const networkResponse = await fetch(event.request);
    if (shouldCache(event.request)) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    logError('Network fetch failed', error);
    
    if (event.request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    
    if (event.request.destination === 'image') {
      const placeholderResponse = await caches.match('/placeholder.svg');
      if (placeholderResponse) return placeholderResponse;
    }
    
    throw error;
  }
}

function shouldCache(request) {
  const url = new URL(request.url);
  
  if (url.origin !== location.origin) {
    return false;
  }
  
  if (request.method !== 'GET') {
    return false;
  }
  
  if (url.pathname.startsWith('/api/')) {
    return false;
  }
  
  return true;
}

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

async function syncBookings() {
  log('Syncing bookings');
  
  try {
    return Promise.resolve();
  } catch (error) {
    logError('Sync failed', error);
    return Promise.reject(error);
  }
}

async function updateContent() {
  log('Updating content');
  
  try {
    return Promise.resolve();
  } catch (error) {
    logError('Content update failed', error);
    return Promise.reject(error);
  }
}

self.addEventListener('install', (event) => {
  log('Installing Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      initializeCache()
    ])
  );
});

self.addEventListener('activate', (event) => {
  log('Activating Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      cleanupOldCaches()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(handleFetch(event));
});

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

self.addEventListener('sync', (event) => {
  log('Background sync event: ' + event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

self.addEventListener('periodicsync', (event) => {
  log('Periodic sync event: ' + event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});
