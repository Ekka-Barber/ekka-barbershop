import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Review {
  id: string;
  author_name: string;
}

// DiceBear styles - male/neutral only (men's barbershop)
const DICEBEAR_STYLES = [
  'personas',     // Professional male avatars
  'avataaars',    // Customizable cartoon avatars (neutral)
  'pixel-art',    // Fun pixel art (neutral)
  'bottts',       // Robot avatars (neutral)
  'shapes',       // Abstract geometric (neutral)
  'thumbs'        // Simple thumbs up style (neutral)
];

// Generate a consistent style for each author (deterministic)
function getStyleForAuthor(authorName: string): string {
  const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DICEBEAR_STYLES[hash % DICEBEAR_STYLES.length];
}

Deno.serve(async () => {
  try {
    // Validate environment variables
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all reviews that need avatars (no profile photo AND no cached avatar)
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('google_reviews')
      .select('id, author_name')
      .is('profile_photo_url', null)
      .is('cached_avatar_url', null)
      .eq('is_active', true);

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All reviews already have avatars', processed: 0 }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${reviews.length} reviews needing avatars`);

    let processed = 0;
    let errors = 0;

    // Process reviews in batches to avoid rate limits
    const BATCH_SIZE = 10;

    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      const batch = reviews.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(reviews.length / BATCH_SIZE)}`);

      // Process batch concurrently
      const batchPromises = batch.map(async (review: Review) => {
        try {
          // Generate avatar using DiceBear API
          const style = getStyleForAuthor(review.author_name);
          const dicebearUrl = `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(review.author_name)}&size=256&backgroundColor=transparent`;

          // Download the avatar
          const avatarResponse = await fetch(dicebearUrl);
          if (!avatarResponse.ok) {
            throw new Error(`DiceBear API error: ${avatarResponse.status}`);
          }

          const avatarBlob = await avatarResponse.blob();

          // Generate unique filename
          const fileName = `review-avatar-${review.id}-${Date.now()}.png`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabaseAdmin.storage
            .from('review_avatars')
            .upload(fileName, avatarBlob, {
              contentType: 'image/png',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Upload error: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabaseAdmin.storage
            .from('review_avatars')
            .getPublicUrl(fileName);

          if (!urlData.publicUrl) {
            throw new Error('Failed to get public URL');
          }

          // Create cache entry
          const { error: cacheError } = await supabaseAdmin
            .from('review_avatar_cache')
            .insert({
              google_avatar_url: dicebearUrl, // Store the DiceBear URL as "source"
              cached_avatar_url: urlData.publicUrl,
              author_name: review.author_name,
              last_accessed_at: new Date().toISOString(),
              access_count: 1,
              last_refreshed_at: new Date().toISOString(),
              refresh_interval_days: 365 // DiceBear avatars don't change
            });

          if (cacheError && !cacheError.message.includes('duplicate key')) {
            console.warn(`Cache insert warning for ${review.author_name}: ${cacheError.message}`);
          }

          // Update the review with cached avatar URL
          const { error: updateError } = await supabaseAdmin
            .from('google_reviews')
            .update({
              cached_avatar_url: urlData.publicUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', review.id);

          if (updateError) {
            throw new Error(`Review update error: ${updateError.message}`);
          }

          console.log(`✅ Generated avatar for ${review.author_name}`);
          return true;

        } catch (error) {
          console.error(`❌ Failed to generate avatar for ${review.author_name}:`, error);
          errors++;
          return false;
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      processed += batchResults.filter(Boolean).length;

      // Small delay between batches to be respectful to DiceBear API
      if (i + BATCH_SIZE < reviews.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated avatars for ${processed} reviews`,
        processed,
        errors,
        total_reviews: reviews.length
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Avatar generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
