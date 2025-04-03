
import { supabase } from '@/types/supabase';

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
}

/**
 * Fetches Google Reviews for a given branch
 */
export async function fetchBranchReviews(placeId: string, apiKey: string, language: string = 'en'): Promise<ReviewsResponse> {
  try {
    console.log(`Fetching reviews for place ID ${placeId} with language ${language}`);
    
    // Use Supabase edge function instead of proxy
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: { placeId, apiKey, language },
      method: 'GET',
      query: {
        placeId,
        apiKey,
        language
      }
    });
    
    if (error) {
      console.error("Error from edge function:", error);
      return { 
        status: 'ERROR', 
        error: `Edge function error: ${error.message}`
      };
    }
    
    console.log("Google Places API response from edge function:", data);
    
    if (data.status !== 'OK') {
      console.warn(`API responded with non-OK status: ${data.status}`);
      return { 
        status: data.status, 
        error_message: data.error_message || 'Unknown error' 
      };
    }

    return { 
      status: 'OK',
      reviews: data.result?.reviews || []
    };
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return { 
      status: 'ERROR', 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetches all branches with Google Places configuration
 */
export async function fetchBranchesWithGooglePlaces() {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .not('google_places_api_key', 'is', null)
      .not('google_place_id', 'is', null);
      
    if (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchBranchesWithGooglePlaces:", error);
    throw error;
  }
}
