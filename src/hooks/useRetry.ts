
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onError?: (error: any, retryCount: number) => void;
  onFinalError?: (error: any) => void;
  onRetry?: (retryCount: number, delay: number) => void;
}

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        factor = 2,
        onError,
        onFinalError,
        onRetry,
      }: RetryOptions = {}
    ): Promise<T> => {
      setIsRetrying(false);
      setRetryCount(0);
      
      let currentRetry = 0;
      let delay = initialDelay;

      while (true) {
        try {
          const result = await fn();
          setIsRetrying(false);
          return result;
        } catch (error) {
          if (onError) {
            onError(error, currentRetry);
          }

          if (currentRetry >= maxRetries) {
            setIsRetrying(false);
            if (onFinalError) {
              onFinalError(error);
            }
            throw error;
          }

          setIsRetrying(true);
          setRetryCount(currentRetry + 1);
          
          if (onRetry) {
            onRetry(currentRetry + 1, delay);
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          
          delay = Math.min(delay * factor, maxDelay);
          currentRetry++;
        }
      }
    },
    []
  );

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
  };
}
