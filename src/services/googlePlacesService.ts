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
    console.log(`Fetching reviews via Supabase Edge Function for Place ID: ${placeId}`);
    
    // Call the deployed Supabase Edge Function
    const supabaseFunctionUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/google-places';
    const apiUrl = `${supabaseFunctionUrl}?placeId=${encodeURIComponent(placeId)}&apiKey=${encodeURIComponent(apiKey)}&language=${language}`;

    const response = await fetch(apiUrl, {
      headers: {
        // Supabase functions often require the Authorization header, even for anon key
        // Pass the anon key - ensure VITE_SUPABASE_ANON_KEY is available
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Supabase Function Error response: ${response.status} ${response.statusText}`);
      const errorText = await response.text(); // Attempt to read error text
      console.error(`Supabase Function Error response body: ${errorText}`);
       // Try parsing as JSON in case the function sends structured error
      let functionErrorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        functionErrorMessage = errorJson.error_message || errorJson.error || errorText;
      } catch (parseError) {
        // Ignore if it's not JSON
      }
      return { 
        status: 'ERROR', 
        error: `Supabase Function request failed with status: ${response.status}`,
        error_message: functionErrorMessage
      };
    }

    // Assuming the Supabase function returns the exact structure we need
    const data = await response.json();
    console.log("Response from Supabase function:", data);
    
    // The function already wraps the Google response, check its status field
    if (data.status !== 'OK') {
      console.warn(`Supabase function reported non-OK status: ${data.status}`, data.error_message);
      return { 
        status: data.status, 
        error_message: data.error_message || 'Unknown error from Supabase function' 
      };
    }

    return { 
      status: 'OK',
      // The function should return Google's reviews inside data.result.reviews
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
