import { QueryClient } from '@tanstack/react-query';

import { TIME } from '@shared/constants/time';
import { errorHandler } from '@shared/services/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * TIME.SECOND_IN_MS, // 30s — realtime subscriptions invalidate on DB change
      gcTime: 10 * TIME.SECONDS_PER_MINUTE * TIME.SECOND_IN_MS, // 10 minutes
      retry: (failureCount, error) => {
        // Log error through our error handler
        errorHandler.handle(error, { source: 'query' });

        // Don't retry on authentication errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        Math.min(TIME.SECOND_IN_MS * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Log error through our error handler
        errorHandler.handle(error, { source: 'mutation' });

        // Don't retry mutations on client errors (4xx)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: TIME.SECOND_IN_MS,
    },
  },
});
