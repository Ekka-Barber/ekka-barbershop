
import { initializeCache, cleanupOldCaches, handleFetch } from './sw/cacheManager.js';
import { log, logError } from './sw/logger.js';

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

