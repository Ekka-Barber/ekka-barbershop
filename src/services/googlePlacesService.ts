
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
    console.log(`Fetching reviews for Place ID: ${placeId}`);
    
    // Use proxy configured in vite.config.ts
    const apiUrl = `/api/places?placeId=${encodeURIComponent(placeId)}&apiKey=${encodeURIComponent(apiKey)}&language=${language}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`Google Places API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Google Places API response: ${errorText}`);
      
      try {
        const errorJson = JSON.parse(errorText);
        return { 
          status: 'ERROR', 
          error: 'Google API error',
          error_message: errorJson.error || errorText
        };
      } catch (parseError) {
        return {
          status: 'ERROR',
          error: 'Google API error',
          error_message: errorText
        };
      }
    }

    const data = await response.json();
    console.log("Google Places API response:", data);
    
    if (data.status !== 'OK') {
      console.warn(`Google API responded with non-OK status: ${data.status} ${data.error_message}`);
      return { 
        status: data.status || 'ERROR', 
        error_message: data.error_message || 'Unknown Google API error' 
      };
    }

    return { 
      status: 'OK',
      reviews: data.result?.reviews || []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error fetching Google reviews:", error);
    return { 
      status: 'ERROR', 
      error: 'Error fetching Google reviews',
      error_message: errorMessage
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
