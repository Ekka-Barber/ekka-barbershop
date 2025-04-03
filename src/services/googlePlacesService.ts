
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
    // Use the Vite dev server proxy endpoint
    const response = await fetch(`/api/places/reviews?placeId=${encodeURIComponent(placeId)}&apiKey=${encodeURIComponent(apiKey)}&language=${language}`);
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      return { 
        status: 'ERROR', 
        error: `API request failed with status: ${response.status}`,
        error_message: errorText
      };
    }

    const data = await response.json();
    console.log("Google Places API response:", data);
    
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
