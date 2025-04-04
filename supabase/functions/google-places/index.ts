
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
    // Parse the request body for POST requests or URL for GET requests
    let placeId, apiKey, language;
    
    if (req.method === 'POST') {
      const body = await req.json();
      placeId = body.placeId;
      apiKey = body.apiKey;
      language = body.language || 'en';
      console.log('Received POST request with body:', JSON.stringify({
        placeId,
        language,
        hasApiKey: !!apiKey
      }));
    } else {
      // Parse the request URL to extract query parameters
      const url = new URL(req.url);
      placeId = url.searchParams.get('placeId');
      apiKey = url.searchParams.get('apiKey');
      language = url.searchParams.get('language') || 'en';
      console.log('Received GET request with query params:', placeId, language);
    }

    // Validate required parameters
    if (!placeId || !apiKey) {
      return new Response(JSON.stringify({
        status: 'ERROR',
        error: 'Missing required parameters: placeId or apiKey'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 400
      });
    }

    console.log(`Processing request for placeId: ${placeId}, language: ${language}`);
    
    // Construct the Google Places API URL
    const googlePlacesUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    googlePlacesUrl.searchParams.set('place_id', placeId);
    googlePlacesUrl.searchParams.set('fields', 'reviews');
    googlePlacesUrl.searchParams.set('key', apiKey);
    googlePlacesUrl.searchParams.set('language', language);

    console.log(`Calling Google Places API at: ${googlePlacesUrl.toString().replace(apiKey, 'API_KEY_REDACTED')}`);
    
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
    
    // Log and return the response
    console.log('Google Places API Response status:', data.status);
    console.log('Reviews count:', data.result?.reviews?.length || 0);
    
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
