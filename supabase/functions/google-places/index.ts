
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    // Get API key from environment variables instead of request
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY environment variable');
      return new Response(JSON.stringify({
        status: 'ERROR',
        error: 'Server configuration error: Missing API key'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500
      });
    }
    
    // Parse the request body for POST requests or URL for GET requests
    let placeId;

    if (req.method === 'POST') {
      const body = await req.json();
      placeId = body.placeId;
    } else {
      // Parse the request URL to extract query parameters
      const url = new URL(req.url);
      placeId = url.searchParams.get('placeId');
    }

    // Validate required parameters
    if (!placeId) {
      return new Response(JSON.stringify({
        status: 'ERROR',
        error: 'Missing required parameter: placeId'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 400
      });
    }

    // Construct the Google Places API URL
    // NOTE: No language parameter to ensure original reviews are returned
    const googlePlacesUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    googlePlacesUrl.searchParams.set('place_id', placeId);
    googlePlacesUrl.searchParams.set('fields', 'reviews');
    googlePlacesUrl.searchParams.set('key', apiKey);
    
    // Fetch reviews from Google Places API
    const response = await fetch(googlePlacesUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Handle API response
    if (!response.ok) {
      console.error('Google Places API error:', response.statusText, response.status);
      return new Response(JSON.stringify({
        status: 'ERROR',
        error: 'Failed to fetch reviews',
        details: response.statusText
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: response.status
      });
    }

    const data = await response.json();

    // Return the response
    return new Response(JSON.stringify({
      status: data.status,
      reviews: data.result?.reviews || []
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({
      status: 'ERROR',
      error: error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500
    });
  }
});
