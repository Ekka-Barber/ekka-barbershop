import { supabase } from '@shared/lib/supabase/client';

const BUCKET_NAME = 'review_avatars';
const CACHE_DURATION_DAYS = 30; // Cache avatars for 30 days

export interface AvatarCacheEntry {
  id: string;
  google_avatar_url: string;
  cached_avatar_url: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  access_count: number;
}

/**
 * Gets a cached avatar URL from the database
 */
export async function getCachedAvatar(googleAvatarUrl: string): Promise<string | null> {
  if (!googleAvatarUrl) return null;

  try {
    const { data, error } = await supabase
      .from('review_avatar_cache')
      .select('cached_avatar_url, access_count')
      .eq('google_avatar_url', googleAvatarUrl)
      .single();

    if (error || !data) {
      return null;
    }

    // Type assertion for Supabase query result
    type CacheData = { cached_avatar_url: string; access_count: number };
    const cacheData = data as CacheData;

    // Update last accessed time and increment access count
    await supabase
      .from('review_avatar_cache')
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: (cacheData.access_count || 0) + 1
      })
      .eq('google_avatar_url', googleAvatarUrl);

    return cacheData.cached_avatar_url;
  } catch (error) {
    console.error('Error getting cached avatar:', error);
    return null;
  }
}

/**
 * Downloads and caches an avatar from Google via Edge Function (server-side)
 * This avoids rate limiting and CORS issues
 */
export async function cacheAvatar(
  googleAvatarUrl: string,
  authorName?: string,
  forceRefresh: boolean = false
): Promise<string | null> {
  if (!googleAvatarUrl) return null;

  try {
    // Use Edge Function to cache avatar (server-side download avoids rate limiting)
    const { data, error } = await supabase.functions.invoke('cache-avatar', {
      body: {
        googleAvatarUrl,
        authorName,
        forceRefresh,
      },
    });

    if (error) {
      console.error('Error caching avatar via Edge Function:', error);
      return null;
    }

    if (data?.success && data?.cachedUrl) {
      return data.cachedUrl;
    }

    return null;
  } catch (error) {
    console.error('Error caching avatar:', error);
    return null;
  }
}

/**
 * Gets or caches an avatar (main function to use)
 * Uses Edge Function for server-side caching to avoid rate limiting
 */
export async function getOrCacheAvatar(
  googleAvatarUrl: string,
  authorName?: string,
  forceRefresh: boolean = false
): Promise<string | null> {
  if (!googleAvatarUrl) return null;

  // If forcing refresh, skip cache check
  if (!forceRefresh) {
    // First try to get from cache
    const cached = await getCachedAvatar(googleAvatarUrl);
    if (cached) {
      return cached;
    }
  }

  // If not cached or forcing refresh, use Edge Function to cache it
  // Edge Function handles server-side download (avoids rate limiting)
  return await cacheAvatar(googleAvatarUrl, authorName, forceRefresh);
}

/**
 * Refreshes an avatar (forces update from Google)
 */
export async function refreshAvatar(
  googleAvatarUrl: string,
  authorName?: string
): Promise<string | null> {
  return await getOrCacheAvatar(googleAvatarUrl, authorName, true);
}

/**
 * Cleans up old unused avatars (can be called periodically)
 */
export async function cleanupOldAvatars(): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CACHE_DURATION_DAYS);

    const { data: oldAvatars, error: fetchError } = await supabase
      .from('review_avatar_cache')
      .select('id, cached_avatar_url')
      .lt('last_accessed_at', cutoffDate.toISOString());

    if (fetchError || !oldAvatars) {
      console.error('Error fetching old avatars:', fetchError);
      return;
    }

    // Type assertion for old avatars
    type OldAvatar = { id: string; cached_avatar_url: string };
    const typedOldAvatars = oldAvatars as OldAvatar[];

    // Delete from storage
    for (const avatar of typedOldAvatars) {
      const fileName = avatar.cached_avatar_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      }
    }

    // Delete from database
    await supabase
      .from('review_avatar_cache')
      .delete()
      .lt('last_accessed_at', cutoffDate.toISOString());
  } catch (error) {
    console.error('Error cleaning up old avatars:', error);
  }
}

