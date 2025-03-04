
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Use service role key for internal operations
const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co'
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Define public CORS headers that don't require authentication
const publicCorsHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: publicCorsHeaders })
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    console.log('🔍 Processing QR redirect for ID:', id)

    if (!id) {
      console.error('Missing QR code ID')
      return new Response(
        JSON.stringify({ error: 'Missing QR code ID' }),
        { 
          status: 400,
          headers: { ...publicCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key
    // We use the service role key internally, but the endpoint is public
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Querying QR code:', id)
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id.trim())
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Error fetching QR code' }),
        { 
          status: 500,
          headers: { ...publicCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!qrCode) {
      console.error('QR code not found:', id)
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          status: 404,
          headers: { ...publicCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!qrCode.is_active) {
      console.error('QR code is inactive:', id)
      return new Response(
        JSON.stringify({ error: 'QR code is inactive' }),
        { 
          status: 404,
          headers: { ...publicCorsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Redirecting to:', qrCode.url)

    // Return redirect response with proper headers
    return new Response(null, {
      status: 302,
      headers: {
        ...publicCorsHeaders,
        'Location': qrCode.url,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...publicCorsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
