import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get QR code ID from query params
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const access = url.searchParams.get('access')

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing QR code ID' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get active QR code URL from database
    const { data: qrCode, error } = await supabaseClient
      .from('qr_codes')
      .select('url')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !qrCode) {
      console.error('Error fetching QR code:', error)
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Determine the redirect URL based on access
    let redirectUrl = qrCode.url
    if (access === 'owner123') {
      // If owner access, append the access parameter
      redirectUrl = `${qrCode.url}${qrCode.url.includes('?') ? '&' : '?'}access=owner123`
    }

    // Redirect to the stored URL
    return new Response(null, {
      headers: { 
        ...corsHeaders,
        'Location': redirectUrl
      },
      status: 302
    })

  } catch (error) {
    console.error('Error in QR redirect:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})