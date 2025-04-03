
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
  debug_info?: Record<string, any>;
}

/**
 * Fetches Google Reviews for a given branch
 */
export async function fetchBranchReviews(placeId: string, apiKey: string, language: string = 'en'): Promise<ReviewsResponse> {
  try {
    console.log(`Fetching reviews for Place ID: ${placeId}, language: ${language}`);
    
    // Use the Supabase Edge Function to avoid CORS issues
    const apiUrl = `/api/places?placeId=${encodeURIComponent(placeId)}&apiKey=${encodeURIComponent(apiKey)}&language=${language}`;

    console.log(`Making request to: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    // Log response status for debugging
    console.log(`Response status: ${response.status} ${response.statusText}`);

    // Get the response text first to check if it's valid JSON
    const responseText = await response.text();
    
    // Check if response is not JSON (like HTML error page)
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.log('Response text first 100 chars:', responseText.substring(0, 100));
      
      // Check if we received HTML instead of JSON (common when API key referrer restrictions issue)
      if (responseText.startsWith('<!DOCTYPE') || responseText.includes('<html')) {
        return { 
          status: 'ERROR', 
          error: 'API access error',
          error_message: 'Received HTML instead of JSON. Check API Key restrictions (HTTP Referrers) in Google Cloud Console.',
          debug_info: {
            response_preview: responseText.substring(0, 200),
            status: response.status,
            statusText: response.statusText
          }
        };
      }
      
      return { 
        status: 'ERROR', 
        error: 'Response parsing error',
        error_message: `Failed to parse API response: ${parseError.message}`,
        debug_info: {
          response_preview: responseText.substring(0, 200)
        }
      };
    }
    
    // Now that we have valid JSON, check for API-level errors
    if (responseData.status !== 'OK') {
      console.warn(`Google Places API responded with non-OK status: ${responseData.status}`);
      console.warn('Error details:', responseData.error_message || 'No specific error message');
      
      return { 
        status: responseData.status || 'ERROR', 
        error_message: responseData.error_message || 'Unknown Google API error',
        debug_info: {
          api_status: responseData.status,
          api_response: responseData
        }
      };
    }

    // Success case
    console.log(`Successfully fetched ${responseData.reviews?.length || 0} reviews for Place ID: ${placeId}`);
    return { 
      status: 'OK',
      reviews: responseData.reviews || []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error fetching Google reviews:", error);
    
    return { 
      status: 'ERROR', 
      error: 'Error fetching Google reviews',
      error_message: errorMessage,
      debug_info: {
        place_id: placeId,
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
    console.log("Fetching branches with Google Places configuration");
    
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .not('google_places_api_key', 'is', null)
      .not('google_place_id', 'is', null);
      
    if (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
    
    console.log(`Found ${data.length} branches with Google Places configuration`);
    
    // Verify that API keys and place IDs are present
    data.forEach((branch, index) => {
      if (!branch.google_places_api_key || !branch.google_place_id) {
        console.warn(`Branch ${branch.name} (${index}) has incomplete Google Places configuration`);
      }
    });
    
    return data;
  } catch (error) {
    console.error("Error in fetchBranchesWithGooglePlaces:", error);
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
        console.error(`Max retries (${maxRetries}) reached. Giving up.`);
        throw error;
      }
      
      console.log(`Attempt ${retries} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
