
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Parse the request URL to extract query parameters
    const url = new URL(req.url)
    const placeId = url.searchParams.get('placeId')
    const apiKey = url.searchParams.get('apiKey')
    const language = url.searchParams.get('language') || 'en'

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
      })
    }

    // Construct the Google Places API URL
    const googlePlacesUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    googlePlacesUrl.searchParams.set('place_id', placeId)
    googlePlacesUrl.searchParams.set('fields', 'reviews')
    googlePlacesUrl.searchParams.set('key', apiKey)
    googlePlacesUrl.searchParams.set('language', language)

    // Fetch reviews from Google Places API
    const response = await fetch(googlePlacesUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Handle API response
    if (!response.ok) {
      console.error('Google Places API error:', response.statusText)
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
      })
    }

    const data = await response.json()

    // Log and return the response
    console.log('Google Places API Response:', JSON.stringify(data))
    return new Response(JSON.stringify({
      status: data.status,
      reviews: data.result?.reviews || []
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      }
    })

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ 
      status: 'ERROR', 
      error: error.message 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      },
      status: 500
    })
  }
})
