
// Import the cache manager
importScripts('/sw/cacheManager.js');

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

// Listen for messages from the client
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
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
