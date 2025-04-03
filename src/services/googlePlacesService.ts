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
    console.log(`Fetching reviews for branch with Place ID: ${placeId}`);
    
    // Call Google Places API directly - Bypassing local proxy which doesn't work in production
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,reviews_sort&key=${encodeURIComponent(apiKey)}&language=${language}&reviews_sort=newest`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`Google API Error response: ${response.status} ${response.statusText}`);
      const errorText = await response.text(); // Attempt to read error text from Google
      console.error(`Google API Error response body: ${errorText}`);
      // Try parsing as JSON in case Google sends structured error
      let googleErrorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        googleErrorMessage = errorJson.error_message || errorJson.status || errorText;
      } catch (parseError) {
        // Ignore if it's not JSON
      }
      return { 
        status: 'ERROR', 
        error: `Google API request failed with status: ${response.status}`,
        error_message: googleErrorMessage
      };
    }

    const data = await response.json();
    console.log("Google Places API response:", data);
    
    if (data.status !== 'OK') {
      console.warn(`Google API responded with non-OK status: ${data.status}`, data.error_message);
      return { 
        status: data.status, 
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
    // Check if it's a JSON parsing error, possibly due to receiving HTML
    if (error instanceof SyntaxError && errorMessage.includes("Unexpected token '<'")) {
       return {
        status: 'ERROR', 
        error: 'Received HTML instead of JSON. Check API Key restrictions (HTTP Referrers) in Google Cloud Console.',
        error_message: errorMessage
       }
    }
    return { 
      status: 'ERROR', 
      error: 'Client-side error during fetch.',
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
