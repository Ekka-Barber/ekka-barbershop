import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Deno.serve(async (_req: Request) => {
  try {
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket('review_avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      // If bucket already exists, that's okay
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Bucket already exists',
            bucket: 'review_avatars'
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bucket created successfully',
        bucket: data
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

