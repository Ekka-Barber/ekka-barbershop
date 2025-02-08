
import { initializeQueue, addToQueue, removeFromQueue, getQueueStats } from '../notificationQueue.js';

describe('NotificationQueue', () => {
  let mockDB;
  let mockStore;
  let mockIndex;
  
  beforeEach(() => {
    // Mock IndexedDB store operations
    mockStore = {
      add: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      getAll: jest.fn(),
      index: jest.fn()
    };
    
    mockIndex = {
      count: jest.fn(),
      getAll: jest.fn()
    };
    
    mockStore.index.mockReturnValue(mockIndex);
    
    // Mock IndexedDB transaction
    const mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockStore)
    };
    
    // Mock IndexedDB database
    mockDB = {
      transaction: jest.fn().mockReturnValue(mockTransaction),
      objectStoreNames: { contains: jest.fn() },
      createObjectStore: jest.fn().mockReturnValue({
        createIndex: jest.fn()
      })
    };

    // Mock IndexedDB open request
    global.indexedDB = {
      open: jest.fn().mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onsuccess?.({ target: { result: mockDB } });
        }, 0);
        return request;
      })
    };

    // Mock navigator online status
    global.navigator = {
      onLine: true
    };

    // Mock service worker registration
    global.registration = {
      showNotification: jest.fn().mockResolvedValue(undefined)
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initializeQueue', () => {
    it('should initialize the queue and process pending notifications', async () => {
      mockStore.getAll.mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onsuccess?.({ target: { result: [] } });
        }, 0);
        return request;
      });
      
      await initializeQueue();
      expect(mockDB.transaction).toHaveBeenCalledWith('notification-queue', 'readonly');
    });

    it('should handle initialization errors', async () => {
      mockStore.getAll.mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onerror?.({ target: { error: new Error('DB Error') } });
        }, 0);
        return request;
      });
      
      await expect(initializeQueue()).rejects.toThrow('Queue initialization failed');
    });
  });

  describe('addToQueue', () => {
    it('should add notification to queue with retry metadata', async () => {
      mockStore.add.mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onsuccess?.();
        }, 0);
        return request;
      });
      
      const notification = {
        title: 'Test',
        options: { body: 'Test notification' }
      };
      
      await addToQueue(notification);
      
      expect(mockStore.add).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test',
        status: 'pending',
        retryCount: 0,
        errors: []
      }));
    });

    it('should handle add errors', async () => {
      mockStore.add.mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onerror?.({ target: { error: new Error('Add Error') } });
        }, 0);
        return request;
      });
      
      await expect(addToQueue({})).rejects.toThrow('Failed to queue notification');
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      mockIndex.count.mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onsuccess?.({ target: { result: 1 } });
        }, 0);
        return request;
      });
      
      const stats = await getQueueStats();
      
      expect(stats).toEqual({
        pending: 1,
        failed: 1
      });
    });

    it('should handle stats error gracefully', async () => {
      mockIndex.count.mockImplementation(() => {
        throw new Error('Stats Error');
      });
      
      const stats = await getQueueStats();
      
      expect(stats).toEqual({
        pending: 0,
        failed: 0
      });
    });
  });
});
