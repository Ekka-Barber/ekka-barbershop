
import { log, logError } from './logger.js';

const QUEUE_NAME = 'notification-queue';
let notificationQueue = [];

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sw-store', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUE_NAME)) {
        db.createObjectStore(QUEUE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const initializeQueue = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    notificationQueue = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    log('Notification queue initialized', { queueSize: notificationQueue.length });
  } catch (error) {
    logError('Failed to initialize queue', error);
  }
};

export const addToQueue = async (notification) => {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_NAME, 'readwrite');
    const store = tx.objectStore(QUEUE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.add({
        ...notification,
        timestamp: Date.now(),
        retryCount: 0
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    log('Added notification to queue', notification);
  } catch (error) {
    logError('Failed to add notification to queue', error);
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
      request.onerror = () => reject(request.error);
    });
    log('Removed notification from queue', { id });
  } catch (error) {
    logError('Failed to remove notification from queue', error);
  }
};
