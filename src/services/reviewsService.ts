import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  google_place_id: string;
  branch_id: string | null;
  author_name: string;
  rating: number;
  text: string;
  original_text: string;
  language: string | null;
  profile_photo_url: string | null;
  cached_avatar_url: string | null;
  relative_time_description: string | null;
  google_review_time: number;
  branch_name?: string;
  branch_name_ar?: string | null;
}

/**
 * Fetches reviews from database filtered by language
 */
export async function fetchReviewsFromDatabase(language: 'ar' | 'en'): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('google_reviews')
      .select(`
        *,
        branches:branch_id (
          name,
          name_ar
        )
      `)
      .eq('is_active', true)
      .eq('rating', 5) // Only 5-star reviews
      .eq('language', language) // Filter by detected language
      .order('google_review_time', { ascending: false });

    if (error) {
      console.error('Error fetching reviews from database:', error);
      throw error;
    }

    // Map the data to include branch names
    return (data || []).map((review: any) => ({
      ...review,
      branch_name: review.branches?.name || '',
      branch_name_ar: review.branches?.name_ar || null,
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Triggers review sync from Google Places API
 * 
 * ⚠️ SECURITY WARNING: This function should NOT be exposed to public frontend code.
 * It calls an expensive Google Places API endpoint and should only be used:
 * - Server-side (e.g., in admin API routes)
 * - Behind admin authentication
 * - Via scheduled cron jobs
 * 
 * For production use, implement proper access control or remove this export
 * and call the edge function directly from server-side code only.
 */
export async function syncReviewsFromGoogle(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-reviews');

    if (error) {
      throw error;
    }

    return {
      success: data?.success || false,
      message: data?.message || 'Sync completed',
    };
  } catch (error) {
    console.error('Error syncing reviews:', error);
    throw error;
  }
}

