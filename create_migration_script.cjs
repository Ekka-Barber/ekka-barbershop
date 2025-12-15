const fs = require('fs');
const path = require('path');

function createMigrationScript() {
  const migrationScript = `const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importReviews() {
  try {
    // Read the cleaned reviews data
    const reviewsData = JSON.parse(fs.readFileSync('./REVIEWS/final_cleaned_reviews_no_replies.json', 'utf8'));

    console.log(\`Importing \${reviewsData.reviews.length} reviews...\`);

    // Prepare reviews for insertion (map to database schema)
    const reviewsForDB = reviewsData.reviews.map(review => ({
      google_place_id: review.google_place_id,
      branch_id: null, // Will be set based on google_place_id lookup
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      original_text: review.original_text,
      language: review.language,
      profile_photo_url: null, // Not available in export
      cached_avatar_url: null, // Will be set by system
      relative_time_description: null, // Can be calculated
      google_review_time: review.google_review_time,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString()
    }));

    // First, map google_place_id to branch_id
    const branches = await supabase.from('branches').select('id, google_place_id');
    const branchMap = {};
    branches.data.forEach(branch => {
      branchMap[branch.google_place_id] = branch.id;
    });

    // Update branch_id in reviews
    reviewsForDB.forEach(review => {
      review.branch_id = branchMap[review.google_place_id] || null;
    });

    // Insert reviews in batches to avoid timeout
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < reviewsForDB.length; i += batchSize) {
      const batch = reviewsForDB.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('google_reviews')
        .insert(batch)
        .select();

      if (error) {
        console.error(\`Error importing batch \${Math.floor(i/batchSize) + 1}:\`, error);
        // Continue with next batch despite errors
      } else {
        imported += data.length;
        console.log(\`Imported batch \${Math.floor(i/batchSize) + 1}: \${data.length} reviews\`);
      }
    }

    console.log(\`\\n✅ Migration complete! Imported \${imported} reviews successfully.\`);

    // Verify import
    const { data: verifyData, error: verifyError } = await supabase
      .from('google_reviews')
      .select('count', { count: 'exact' });

    if (!verifyError) {
      console.log(\`Total reviews in database: \${verifyData.length}\`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\\nPlease set these environment variables before running the migration.');
  process.exit(1);
}

importReviews();`;

  fs.writeFileSync('import_reviews_to_supabase.cjs', migrationScript);

  console.log('✅ Migration script created: import_reviews_to_supabase.cjs');
  console.log('\\n📋 To run the migration:');
  console.log('1. Set environment variables:');
  console.log('   export SUPABASE_URL="your_supabase_url"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  console.log('2. Run: node import_reviews_to_supabase.cjs');
  console.log('\\n⚠️  Make sure final_cleaned_reviews_no_replies.json exists in REVIEWS/ folder');
}

createMigrationScript();
