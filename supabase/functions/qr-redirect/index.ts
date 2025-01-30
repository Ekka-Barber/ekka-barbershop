import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the QR code ID from the URL
    const url = new URL(req.url)
    const qrId = url.searchParams.get('id')

    if (!qrId) {
      return new Response(
        JSON.stringify({ error: 'No QR code ID provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get the redirect URL from the database
    const { data: qrCode, error } = await supabaseClient
      .from('qr_codes')
      .select('url')
      .eq('is_active', true)
      .single()

    if (error || !qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Redirect to the stored URL
    return new Response(null, {
      headers: { 
        ...corsHeaders,
        'Location': qrCode.url
      },
      status: 302
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})