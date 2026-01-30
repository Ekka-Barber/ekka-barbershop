import { useState, useEffect } from 'react';

import { getOrCacheAvatar } from '@shared/services/avatarCacheService';

/**
 * Hook to get or cache an avatar URL
 * Returns the cached URL if available, otherwise tries to cache it
 */
export function useCachedAvatar(googleAvatarUrl: string | null | undefined, authorName?: string) {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!googleAvatarUrl) {
      setCachedUrl(null);
      setIsLoading(false);
      return;
    }

    const urlToCache = googleAvatarUrl; // now string
    let cancelled = false;

    async function fetchCachedAvatar() {
      setIsLoading(true);
      try {
        const url = await getOrCacheAvatar(urlToCache, authorName);
        if (!cancelled) {
          setCachedUrl(url);
        }
      } catch {
        if (!cancelled) {
          setCachedUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCachedAvatar();

    return () => {
      cancelled = true;
    };
  }, [googleAvatarUrl, authorName]);

  return { cachedUrl, isLoading };
}
