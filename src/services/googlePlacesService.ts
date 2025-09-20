
import { supabase } from '@/integrations/supabase/client';

// Interface for Google Reviews
export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description?: string;
}

export interface ReviewsResponse {
  status: string;
  reviews?: GoogleReview[];
  error?: string;
  error_message?: string;
  debug_info?: Record<string, unknown>;
}

/**
 * Fetches Google Reviews for a given branch
 */
export async function fetchBranchReviews(placeId: string, language: string = 'en'): Promise<ReviewsResponse> {
  try {
    // Call the Supabase Edge Function directly without passing an API key
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: {
        placeId,
        language
      },
    });

    if (error) {
      return {
        status: 'ERROR',
        error: 'API call failed',
        error_message: error.message
      };
    }

    // Return the response
    return {
      status: data.status || 'OK',
      reviews: data.reviews || []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      status: 'ERROR',
      error: 'Error fetching Google reviews',
      error_message: errorMessage,
      debug_info: {
        place_id: placeId,
        language: language,
        error_name: error instanceof Error ? error.name : 'Unknown',
        error_stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
}

/**
 * Fetches all branches with Google Places configuration
 */
export async function fetchBranchesWithGooglePlaces() {
  const { data, error } = await supabase
    .from('branches')
    .select('id, name, google_place_id, name_ar')
    .not('google_place_id', 'is', null);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
