
import { initializeQueue, addToQueue, removeFromQueue } from '../notificationQueue.js';

describe('NotificationQueue', () => {
  let mockDB;
  
  beforeEach(() => {
    // Mock IndexedDB
    mockDB = {
      transaction: jest.fn(),
      objectStoreNames: { contains: jest.fn() },
      createObjectStore: jest.fn()
    };

    global.indexedDB = {
      open: jest.fn().mockImplementation(() => {
        const request = {};
        setTimeout(() => {
          request.onsuccess?.({ target: { result: mockDB } });
        }, 0);
        return request;
      })
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initializeQueue', () => {
    it('should initialize the queue from IndexedDB', async () => {
      const mockStore = {
        getAll: jest.fn().mockImplementation(() => {
          const request = {};
          setTimeout(() => {
            request.onsuccess?.({ target: { result: [] } });
          }, 0);
          return request;
        })
      };

      mockDB.transaction.mockReturnValue({ objectStore: () => mockStore });
      
      await initializeQueue();
      expect(mockDB.transaction).toHaveBeenCalledWith('notification-queue', 'readonly');
    });
  });

  describe('addToQueue', () => {
    it('should add notification to IndexedDB queue', async () => {
      const mockStore = {
        add: jest.fn().mockImplementation(() => {
          const request = {};
          setTimeout(() => {
            request.onsuccess?.();
          }, 0);
          return request;
        })
      };

      mockDB.transaction.mockReturnValue({ objectStore: () => mockStore });
      
      const notification = {
        title: 'Test',
        body: 'Test notification'
      };
      
      await addToQueue(notification);
      expect(mockStore.add).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test',
        body: 'Test notification',
        timestamp: expect.any(Number),
        retryCount: 0
      }));
    });
  });

  describe('removeFromQueue', () => {
    it('should remove notification from IndexedDB queue', async () => {
      const mockStore = {
        delete: jest.fn().mockImplementation(() => {
          const request = {};
          setTimeout(() => {
            request.onsuccess?.();
          }, 0);
          return request;
        })
      };

      mockDB.transaction.mockReturnValue({ objectStore: () => mockStore });
      
      await removeFromQueue(1);
      expect(mockStore.delete).toHaveBeenCalledWith(1);
    });
  });
});
