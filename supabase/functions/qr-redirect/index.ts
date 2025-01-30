import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbmpwcGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NzI5NDcsImV4cCI6MjAyMjQ0ODk0N30.DwwjFr5e7pDrYyhJ6cY8g_RAYhOHGR0Q45yJ9CKqGbY'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

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

    // Query the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('url')
      .eq('id', id)
      .single()

    if (error || !qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Redirect to the URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': qrCode.url
      }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})