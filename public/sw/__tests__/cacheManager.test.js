
import { initializeCache, cleanupOldCaches, handleFetch } from '../cacheManager.js';

describe('CacheManager', () => {
  beforeEach(() => {
    // Mock caches API
    global.caches = {
      open: jest.fn(() => Promise.resolve({
        addAll: jest.fn(() => Promise.resolve()),
        match: jest.fn()
      })),
      keys: jest.fn(() => Promise.resolve(['old-cache', 'ekka-v1'])),
      delete: jest.fn(() => Promise.resolve())
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initializeCache', () => {
    it('should open cache and add initial resources', async () => {
      await initializeCache();
      expect(global.caches.open).toHaveBeenCalledWith('ekka-v1');
      const cache = await global.caches.open('ekka-v1');
      expect(cache.addAll).toHaveBeenCalledWith([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    });
  });

  describe('cleanupOldCaches', () => {
    it('should remove old caches', async () => {
      await cleanupOldCaches();
      expect(global.caches.keys).toHaveBeenCalled();
      expect(global.caches.delete).toHaveBeenCalledWith('old-cache');
      expect(global.caches.delete).not.toHaveBeenCalledWith('ekka-v1');
    });
  });

  describe('handleFetch', () => {
    it('should try network first then fallback to cache', async () => {
      const mockRequest = new Request('https://example.com');
      const mockEvent = { request: mockRequest };

      // Mock successful fetch
      global.fetch = jest.fn(() => Promise.resolve(new Response('content')));
      
      const response = await handleFetch(mockEvent);
      expect(fetch).toHaveBeenCalledWith(mockRequest);
      expect(response).toBeDefined();
    });

    it('should fallback to cache when network fails', async () => {
      const mockRequest = new Request('https://example.com');
      const mockEvent = { request: mockRequest };

      // Mock failed fetch
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      
      await handleFetch(mockEvent);
      expect(global.caches.match).toHaveBeenCalledWith(mockRequest);
    });
  });
});
