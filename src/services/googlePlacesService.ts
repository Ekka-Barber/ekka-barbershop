
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
  debug_info?: Record<string, any>;
}

/**
 * Fetches Google Reviews for a given branch
 */
export async function fetchBranchReviews(placeId: string, language: string = 'en'): Promise<ReviewsResponse> {
  try {
    logger.debug(`Fetching reviews for Place ID: ${placeId}, language: ${language}`);
    
    // Call the Supabase Edge Function directly without passing an API key
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: { 
        placeId, 
        language 
      },
    });
    
    if (error) {
      logger.error("Error calling Google Places edge function:", error);
      return { 
        status: 'ERROR', 
        error: 'API call failed',
        error_message: error.message
      };
    }
    
    logger.debug(`Successfully fetched reviews for language: ${language}, count: ${data.reviews?.length || 0}`);
    
    // Return the response
    return { 
      status: data.status || 'OK',
      reviews: data.reviews || []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error("Error fetching Google reviews:", error);
    
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
  try {
    logger.debug("Fetching branches with Google Places configuration");
    
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, google_place_id, name_ar')
      .not('google_place_id', 'is', null);
      
    if (error) {
      logger.error("Error fetching branches:", error);
      throw error;
    }
    
    logger.debug(`Found ${data.length} branches with Google Places configuration`);
    
    return data;
  } catch (error) {
    logger.error("Error in fetchBranchesWithGooglePlaces:", error);
    throw error;
  }
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
        logger.error(`Max retries (${maxRetries}) reached. Giving up.`);
        throw error;
      }
      
      logger.debug(`Attempt ${retries} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
