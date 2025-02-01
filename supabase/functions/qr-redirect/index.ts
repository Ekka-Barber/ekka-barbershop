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

    console.log('🔍 Step 1: Received request for QR code ID:', id)

    if (!id) {
      console.error('❌ Error: Missing QR code ID')
      return new Response(
        JSON.stringify({ error: 'Missing QR code ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    console.log('🔄 Step 2: Initializing Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Set owner access before querying
    console.log('🔑 Step 3: Setting owner access...')
    const { error: accessError } = await supabase.rpc('set_owner_access', { value: 'owner123' })
    if (accessError) {
      console.error('❌ Error setting owner access:', accessError)
      return new Response(
        JSON.stringify({ error: 'Error setting owner access', details: accessError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    console.log('✅ Owner access set successfully')

    // Query the QR code with detailed logging
    console.log('🔍 Step 4: Querying QR code with ID:', id)
    const { data: qrCodeExists, error: existsError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (existsError) {
      console.error('❌ Database error checking QR existence:', existsError)
      return new Response(
        JSON.stringify({ error: 'Error fetching QR code', details: existsError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📊 Raw database response:', qrCodeExists)
    console.log('🔍 QR code lookup result:', { 
      exists: !!qrCodeExists,
      isActive: qrCodeExists?.is_active,
      url: qrCodeExists?.url 
    })

    if (!qrCodeExists) {
      console.log('❌ QR code not found')
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!qrCodeExists.is_active) {
      console.log('❌ QR code is inactive')
      return new Response(
        JSON.stringify({ error: 'QR code is inactive' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Success! Redirecting to:', qrCodeExists.url)

    // Redirect to the URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrCodeExists.url
      }
    })

  } catch (error) {
    console.error('❌ Error in QR redirect:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})