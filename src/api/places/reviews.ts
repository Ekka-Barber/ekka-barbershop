
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get('placeId');
  const apiKey = url.searchParams.get('apiKey');
  const language = url.searchParams.get('language') || 'en'; // Default to English if no language specified

  if (!placeId || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Add language parameter to the Google Places API request
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=${language}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch reviews',
        details: data.status,
        language: language
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      reviews: data.result.reviews || [],
      language: language // Include language in response for debugging
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error fetching Google Reviews (language: ${language}):`, error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      language: language
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
