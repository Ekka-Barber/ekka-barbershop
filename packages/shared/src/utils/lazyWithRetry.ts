import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

import { logger } from "@shared/utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFactory<T extends ComponentType<any>> = () => Promise<{
  default: T;
}>;

interface LazyRetryOptions {
  retries?: number;
  delay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LazyWithPreload<T extends ComponentType<any>> {
  Component: LazyExoticComponent<T>;
  preload: () => Promise<void>;
}

const CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Loading chunk",
  "Failed to fetch dynamically imported module",
  "Importing a module failed",
  "Importing a module script failed",
];

const isChunkLoadError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const retryImport = <T extends ComponentType<any>>(
  factory: AsyncFactory<T>,
  attempt: number,
  maxAttempts: number,
  delay: number,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<{ default: T }> => {
  return factory().catch((error) => {
    if (!isChunkLoadError(error)) {
      throw error;
    }

    if (attempt >= maxAttempts) {
      logger.error(
        `Lazy chunk failed after ${maxAttempts} attempts. Triggering full reload.`,
        error
      );
      onRetry?.(attempt, error);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
      throw error;
    }

    const nextAttempt = attempt + 1;
    logger.warn(
      `Lazy chunk failed to load (attempt ${attempt} of ${maxAttempts}). Retrying in ${delay}ms.`,
      error
    );
    onRetry?.(attempt, error);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          retryImport(factory, nextAttempt, maxAttempts, delay, onRetry)
        );
      }, delay);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyWithRetry = <T extends ComponentType<any>>(
  factory: AsyncFactory<T>,
  options?: LazyRetryOptions
): LazyExoticComponent<T> => {
  const retries = options?.retries ?? 3;
  const delay = options?.delay ?? 1000;

  return lazy(() => retryImport(factory, 1, retries, delay, options?.onRetry));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyWithPreload = <T extends ComponentType<any>>(
  factory: AsyncFactory<T>,
  options?: LazyRetryOptions
): LazyWithPreload<T> => {
  const retries = options?.retries ?? 3;
  const delay = options?.delay ?? 1000;

  const Component = lazy(() => retryImport(factory, 1, retries, delay, options?.onRetry));

  const preload = async () => {
    try {
      await factory();
    } catch (error) {
      if (!isChunkLoadError(error)) {
        throw error;
      }
      logger.warn('Preload failed for lazy component', error);
    }
  };

  return { Component, preload };
};
