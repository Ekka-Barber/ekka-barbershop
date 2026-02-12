import { supabase } from '@shared/lib/supabase/client';

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
      throw error;
    }

    // Map the data to include branch names
    type ReviewWithBranches = Omit<Review, 'branch_name' | 'branch_name_ar'> & {
      branches?: { name?: string; name_ar?: string } | null;
    };
    
    return (data || []).map((review: ReviewWithBranches): Review => ({
      ...review,
      branch_name: review.branches?.name || '',
      branch_name_ar: review.branches?.name_ar || null,
    }));
  } catch {
    return [];
  }
}

