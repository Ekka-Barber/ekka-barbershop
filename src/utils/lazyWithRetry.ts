import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";
import { logger } from "@/utils/logger";

type AsyncFactory<T extends ComponentType<Record<string, unknown>>> = () => Promise<{
  default: T;
}>;

interface LazyRetryOptions {
  retries?: number;
  delay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
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

const retryImport = <T extends ComponentType<Record<string, unknown>>>(
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

export const lazyWithRetry = <T extends ComponentType<Record<string, unknown>>>(
  factory: AsyncFactory<T>,
  options?: LazyRetryOptions
): LazyExoticComponent<T> => {
  const retries = options?.retries ?? 3;
  const delay = options?.delay ?? 1000;

  return lazy(() => retryImport(factory, 1, retries, delay, options?.onRetry));
};
