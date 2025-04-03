
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const placeId = url.searchParams.get('placeId');
    const apiKey = url.searchParams.get('apiKey');
    const language = url.searchParams.get('language') || 'en';
    
    if (!placeId || !apiKey) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ 
          status: 'ERROR', 
          error: 'Missing required parameters' 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    console.log(`Fetching Google Places details for place_id: ${placeId} in language: ${language}`);
    
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=${language}`;
    const response = await fetch(googleApiUrl);
    
    if (!response.ok) {
      console.error(`Google API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Response body: ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          status: 'ERROR', 
          error: `API request failed with status: ${response.status}`,
          error_message: errorText
        }),
        { 
          status: response.status, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    const data = await response.json();
    console.log("Google Places API response status:", data.status);
    
    if (data.status !== 'OK') {
      console.warn(`API responded with non-OK status: ${data.status}`);
      return new Response(
        JSON.stringify({ 
          status: data.status, 
          error_message: data.error_message || 'Unknown error' 
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: 'OK',
        result: data.result 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in google-places function:", error);
    return new Response(
      JSON.stringify({ 
        status: 'ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
