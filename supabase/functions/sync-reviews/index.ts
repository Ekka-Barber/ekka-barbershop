import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googlePlacesApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')!;

// Simple language detection (basic - can be improved)
function detectLanguage(text: string): string {
  // Check for Arabic characters
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) {
    return 'ar';
  }
  // Default to English
  return 'en';
}

Deno.serve(async (req: Request) => {
  try {
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all branches with Google Place IDs
    const { data: branches, error: branchesError } = await supabaseAdmin
      .from('branches')
      .select('id, name, google_place_id')
      .not('google_place_id', 'is', null);

    if (branchesError) {
      throw new Error(`Failed to fetch branches: ${branchesError.message}`);
    }

    if (!branches || branches.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No branches with Google Place IDs found', synced: 0 }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let totalSynced = 0;
    const errors: string[] = [];

    // Fetch reviews for each branch
    for (const branch of branches) {
      if (!branch.google_place_id) continue;

      try {
        // Fetch reviews from Google Places API (no language parameter = get all original reviews)
        const googlePlacesUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        googlePlacesUrl.searchParams.set('place_id', branch.google_place_id);
        googlePlacesUrl.searchParams.set('fields', 'reviews');
        googlePlacesUrl.searchParams.set('key', googlePlacesApiKey);
        // Don't set language parameter - we want original reviews in their original language

        const response = await fetch(googlePlacesUrl.toString());

        if (!response.ok) {
          errors.push(`Failed to fetch reviews for ${branch.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.status !== 'OK' || !data.result?.reviews) {
          continue;
        }

        const reviews = data.result.reviews;
        let branchSynced = 0;

        // Process each review
        for (const review of reviews) {
          try {
            // Detect language
            const detectedLanguage = detectLanguage(review.text || '');

            // Get cached avatar URL if exists
            let cachedAvatarUrl: string | null = null;
            if (review.profile_photo_url) {
              const { data: avatarCache } = await supabaseAdmin
                .from('review_avatar_cache')
                .select('cached_avatar_url')
                .eq('google_avatar_url', review.profile_photo_url)
                .maybeSingle();
              
              cachedAvatarUrl = avatarCache?.cached_avatar_url || null;
            }

            // Upsert review (update if exists, insert if new)
            // First check if review exists
            const { data: existingReview } = await supabaseAdmin
              .from('google_reviews')
              .select('id')
              .eq('google_place_id', branch.google_place_id)
              .eq('author_name', review.author_name)
              .eq('google_review_time', review.time)
              .maybeSingle();

            const reviewData = {
              google_place_id: branch.google_place_id,
              branch_id: branch.id,
              author_name: review.author_name,
              rating: review.rating,
              text: review.text,
              original_text: review.text, // Store original
              language: detectedLanguage,
              profile_photo_url: review.profile_photo_url || null,
              cached_avatar_url: cachedAvatarUrl,
              relative_time_description: review.relative_time_description || null,
              google_review_time: review.time,
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            let upsertError;
            if (existingReview) {
              // Update existing
              const { error } = await supabaseAdmin
                .from('google_reviews')
                .update(reviewData)
                .eq('id', existingReview.id);
              upsertError = error;
            } else {
              // Insert new
              const { error } = await supabaseAdmin
                .from('google_reviews')
                .insert(reviewData);
              upsertError = error;
            }

            if (upsertError) {
              console.error(`Error upserting review for ${branch.name}:`, upsertError);
              errors.push(`Error saving review from ${review.author_name} for ${branch.name}`);
            } else {
              branchSynced++;
            }
          } catch (reviewError) {
            console.error(`Error processing review:`, reviewError);
            errors.push(`Error processing review: ${reviewError instanceof Error ? reviewError.message : 'Unknown'}`);
          }
        }

        totalSynced += branchSynced;
        console.log(`Synced ${branchSynced} reviews for ${branch.name}`);
      } catch (branchError) {
        console.error(`Error syncing reviews for ${branch.name}:`, branchError);
        errors.push(`Error syncing ${branch.name}: ${branchError instanceof Error ? branchError.message : 'Unknown'}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${totalSynced} reviews`,
        synced: totalSynced,
        branches: branches.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Sync reviews error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

