
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
export async function fetchBranchReviews(placeId: string, language: string = 'en'): Promise<ReviewsResponse> {
  try {
    console.log(`Fetching reviews for Place ID: ${placeId}, language: ${language}`);
    
    // Get the Google Places API key
    const { data: branchData, error: branchError } = await supabase
      .from('branches')
      .select('google_places_api_key')
      .eq('google_place_id', placeId)
      .single();
      
    if (branchError) {
      console.error('Error fetching branch API key:', branchError);
      return { 
        status: 'ERROR', 
        error: 'Failed to fetch branch data',
        error_message: branchError.message
      };
    }
      
    const apiKey = branchData?.google_places_api_key;
    
    if (!apiKey) {
      console.error("No Google Places API key found for this branch!");
      return { 
        status: 'ERROR', 
        error: 'Configuration error',
        error_message: 'No Google Places API key configured for this branch.' 
      };
    }
    
    // Call the Supabase Edge Function directly with all required parameters
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: { 
        placeId, 
        apiKey,
        language 
      },
    });
    
    if (error) {
      console.error("Error calling Google Places edge function:", error);
      return { 
        status: 'ERROR', 
        error: 'API call failed',
        error_message: error.message
      };
    }
    
    console.log("Successfully fetched reviews:", data);
    
    // Return the response
    return { 
      status: data.status || 'OK',
      reviews: data.reviews || []
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
      .select('id, name, google_place_id, name_ar')
      .not('google_place_id', 'is', null);
      
    if (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
    
    console.log(`Found ${data.length} branches with Google Places configuration`);
    
    data.forEach((branch, index) => {
      if (!branch.google_place_id) {
        console.warn(`Branch ${branch.name} (${index}) is missing Google Place ID`);
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
