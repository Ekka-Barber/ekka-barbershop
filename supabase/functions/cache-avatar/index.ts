import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BUCKET_NAME = 'review_avatars';
const REFRESH_INTERVAL_DAYS = 7; // Refresh avatars every 7 days

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request
    const { googleAvatarUrl, authorName, forceRefresh } = await req.json();

    if (!googleAvatarUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing googleAvatarUrl' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Check if already cached
    const { data: existing } = await supabaseAdmin
      .from('review_avatar_cache')
      .select('cached_avatar_url, last_refreshed_at, refresh_interval_days, access_count')
      .eq('google_avatar_url', googleAvatarUrl)
      .maybeSingle();

    // If cached and not forcing refresh, check if refresh is needed
    if (existing && !forceRefresh) {
      const refreshInterval = existing.refresh_interval_days || REFRESH_INTERVAL_DAYS;
      const lastRefreshed = existing.last_refreshed_at 
        ? new Date(existing.last_refreshed_at)
        : new Date(0);
      
      const daysSinceRefresh = (Date.now() - lastRefreshed.getTime()) / (1000 * 60 * 60 * 24);
      
      // If recently refreshed, return cached URL
      if (daysSinceRefresh < refreshInterval) {
        // Update access stats
        await supabaseAdmin
          .from('review_avatar_cache')
          .update({
            last_accessed_at: new Date().toISOString(),
            access_count: (existing.access_count || 0) + 1
          })
          .eq('google_avatar_url', googleAvatarUrl);

        return new Response(
          JSON.stringify({ 
            success: true, 
            cachedUrl: existing.cached_avatar_url,
            fromCache: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Download avatar from Google (server-side, avoids rate limiting)
    let imageResponse: Response;
    try {
      imageResponse = await fetch(googleAvatarUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Supabase-Edge-Function/1.0)',
          'Accept': 'image/*',
        },
      });
    } catch (fetchError) {
      console.error('Error fetching avatar:', fetchError);
      // If fetch fails and we have cached version, return it
      if (existing?.cached_avatar_url) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            cachedUrl: existing.cached_avatar_url,
            fromCache: true,
            warning: 'Failed to refresh, using cached version'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      throw fetchError;
    }

    if (!imageResponse.ok) {
      // If rate limited or error, return cached version if available
      if (existing?.cached_avatar_url) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            cachedUrl: existing.cached_avatar_url,
            fromCache: true,
            warning: `Google returned ${imageResponse.status}, using cached version`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch avatar: ${imageResponse.status} ${imageResponse.statusText}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: imageResponse.status
        }
      );
    }

    // Get image data
    const imageBlob = await imageResponse.blob();
    const contentType = imageBlob.type || 'image/jpeg';
    const fileExt = contentType.split('/')[1] || 'jpg';
    
    // Generate unique filename
    const fileName = existing 
      ? existing.cached_avatar_url.split('/').pop() || `${crypto.randomUUID()}.${fileExt}`
      : `${crypto.randomUUID()}.${fileExt}`;

    // Upload to Supabase Storage (upsert to replace if exists)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageBlob, {
        contentType,
        upsert: true, // Replace if exists (for refresh)
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      // If upload fails but we have cached version, return it
      if (existing?.cached_avatar_url) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            cachedUrl: existing.cached_avatar_url,
            fromCache: true,
            warning: 'Upload failed, using cached version'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const cachedUrl = urlData.publicUrl;

    // Save or update in database
    if (existing) {
      // Update existing record
      await supabaseAdmin
        .from('review_avatar_cache')
        .update({
          cached_avatar_url: cachedUrl,
          last_refreshed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: (existing.access_count || 0) + 1
        })
        .eq('google_avatar_url', googleAvatarUrl);
    } else {
      // Insert new record
      await supabaseAdmin
        .from('review_avatar_cache')
        .insert({
          google_avatar_url: googleAvatarUrl,
          cached_avatar_url: cachedUrl,
          author_name: authorName || null,
          last_refreshed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: 1,
          refresh_interval_days: REFRESH_INTERVAL_DAYS,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cachedUrl,
        fromCache: false,
        refreshed: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

