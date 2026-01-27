import type { QueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    clearAppCache: () => void;
    queryClient?: QueryClient;
  }
}

export {};

