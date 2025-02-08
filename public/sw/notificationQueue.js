
import { log, logError } from './logger.js';

const QUEUE_NAME = 'notification-queue';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // Exponential backoff delays in ms

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sw-store', 1);
    
    request.onerror = () => {
      logError('Failed to open IndexedDB', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUE_NAME)) {
        const store = db.createObjectStore(QUEUE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status');
        store.createIndex('retryCount', 'retryCount');
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
};

export const initializeQueue = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    const notificationQueue = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        logError('Failed to get notifications from queue', request.error);
        reject(request.error);
      };
    });
    
    log('Notification queue initialized', { queueSize: notificationQueue.length });
    
    // Process any pending notifications that might have failed during previous session
    await processPendingNotifications();
  } catch (error) {
    logError('Failed to initialize queue', error);
    throw new Error('Queue initialization failed');
  }
};

export const addToQueue = async (notification) => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readwrite');
    const store = tx.objectStore(QUEUE_NAME);
    
    const queueItem = {
      ...notification,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
      lastAttempt: null,
      errors: []
    };

    await new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        logError('Failed to add notification to queue', request.error);
        reject(request.error);
      };
    });
    
    log('Added notification to queue', notification);
    
    // Attempt to process the notification immediately if online
    if (navigator.onLine) {
      await processNotification(queueItem);
    }
  } catch (error) {
    logError('Failed to add notification to queue', error);
    throw new Error('Failed to queue notification');
  }
};

export const removeFromQueue = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readwrite');
    const store = tx.objectStore(QUEUE_NAME);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        logError('Failed to remove notification from queue', request.error);
        reject(request.error);
      };
    });
    
    log('Removed notification from queue', { id });
  } catch (error) {
    logError('Failed to remove notification from queue', error);
    throw new Error('Failed to remove notification from queue');
  }
};

const updateQueueItem = async (id, updates) => {
  const db = await openDB();
  const tx = db.transaction(QUEUE_NAME, 'readwrite');
  const store = tx.objectStore(QUEUE_NAME);
  
  const request = store.get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const item = request.result;
      const updatedItem = { ...item, ...updates };
      const updateRequest = store.put(updatedItem);
      updateRequest.onsuccess = () => resolve(updatedItem);
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

const processNotification = async (queueItem) => {
  try {
    // Attempt to show the notification
    await self.registration.showNotification(queueItem.title, queueItem.options);
    
    // If successful, remove from queue
    await removeFromQueue(queueItem.id);
    log('Successfully processed notification', { id: queueItem.id });
  } catch (error) {
    logError('Error processing notification', error);
    
    const retryCount = queueItem.retryCount + 1;
    const updates = {
      retryCount,
      lastAttempt: Date.now(),
      status: retryCount >= MAX_RETRIES ? 'failed' : 'pending',
      errors: [...queueItem.errors, {
        timestamp: Date.now(),
        message: error.message,
        stack: error.stack
      }]
    };
    
    await updateQueueItem(queueItem.id, updates);
    
    if (retryCount < MAX_RETRIES) {
      // Schedule retry with exponential backoff
      const delay = RETRY_DELAYS[retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      setTimeout(() => processNotification(queueItem), delay);
    }
  }
};

const processPendingNotifications = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    const index = store.index('status');
    
    const pendingNotifications = await new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    log('Processing pending notifications', { count: pendingNotifications.length });
    
    for (const notification of pendingNotifications) {
      if (notification.retryCount < MAX_RETRIES) {
        await processNotification(notification);
      }
    }
  } catch (error) {
    logError('Error processing pending notifications', error);
  }
};

// Listen for online/offline events
self.addEventListener('online', () => {
  log('Device is online, processing pending notifications');
  processPendingNotifications();
});

export const getQueueStats = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    
    const [pending, failed] = await Promise.all([
      new Promise((resolve) => {
        const request = store.index('status').count('pending');
        request.onsuccess = () => resolve(request.result);
      }),
      new Promise((resolve) => {
        const request = store.index('status').count('failed');
        request.onsuccess = () => resolve(request.result);
      })
    ]);
    
    return { pending, failed };
  } catch (error) {
    logError('Error getting queue stats', error);
    return { pending: 0, failed: 0 };
  }
};
