import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmbmp2cGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MjgyMDksImV4cCI6MjA1MjMwNDIwOX0.D7fqEZPOOvqVnrtLPwAJ4tqGyTPY8uXjBejgU8Vshd4'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    console.log('Received request for QR code ID:', id)

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing QR code ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Set owner access before querying
    const { error: accessError } = await supabase.rpc('set_owner_access', { value: 'owner123' })
    if (accessError) {
      console.error('Error setting owner access:', accessError)
      return new Response(
        JSON.stringify({ error: 'Error setting owner access' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Query the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('url, is_active')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle()

    console.log('QR code lookup result:', { qrCode, error })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Error fetching QR code' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code not found or inactive' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Redirecting to:', qrCode.url)

    // Redirect to the URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrCode.url
      }
    })

  } catch (error) {
    console.error('Error in QR redirect:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})