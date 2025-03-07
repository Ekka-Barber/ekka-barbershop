
// Import necessary modules
importScripts('/sw/cacheManager.js');
importScripts('/sw/logger.js');

// Service worker version for tracking
const SW_VERSION = '1.0.0';

// Cache name and critical resources to precache
const CACHE_NAME = 'ekka-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/lovable-uploads/2ea1f72e-efd2-4345-bf4d-957efd873986.png',
  '/index.css'
];

// Install event handler - precache critical resources
self.addEventListener('install', (event) => {
  log('Installing Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      initializeCache(CACHE_NAME, CRITICAL_RESOURCES)
    ])
  );
});

// Activate event handler - clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating Service Worker version ' + SW_VERSION);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      cleanupOldCaches(CACHE_NAME)
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
  event.respondWith(handleFetch(event, CACHE_NAME));
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

// Function to sync bookings from cache
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

// Function to update content in the background
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
