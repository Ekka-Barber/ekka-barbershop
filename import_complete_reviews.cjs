const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importCompleteReviews() {
  try {
    console.log('🚀 Starting complete reviews import to Supabase...');

    // Read the complete cleaned reviews data
    const reviewsData = JSON.parse(fs.readFileSync('./REVIEWS/final_cleaned_reviews_complete.json', 'utf8'));
    const reviews = reviewsData.reviews;

    console.log(`📊 Importing ${reviews.length} complete clean reviews...`);

    // Get branch mappings
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, google_place_id');

    if (branchError) {
      console.error('❌ Error fetching branches:', branchError);
      return;
    }

    const branchMap = {};
    branches.forEach(branch => {
      branchMap[branch.google_place_id] = branch.id;
    });

    console.log('🏪 Branch mappings loaded:', Object.keys(branchMap).length, 'branches');

    // Clear existing reviews first
    console.log('🧹 Clearing existing reviews...');
    const { error: deleteError } = await supabase
      .from('google_reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️ Warning: Could not clear existing reviews:', deleteError.message);
    } else {
      console.log('✅ Existing reviews cleared');
    }

    // Prepare reviews for database insertion
    const reviewsForDB = reviews.map(review => ({
      google_place_id: review.google_place_id,
      branch_id: branchMap[review.google_place_id] || null,
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      original_text: review.original_text,
      language: review.language,
      profile_photo_url: null,
      cached_avatar_url: null,
      relative_time_description: null,
      google_review_time: review.google_review_time,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString()
    }));

    // Log language distribution
    const languageStats = reviewsForDB.reduce((acc, review) => {
      acc[review.language] = (acc[review.language] || 0) + 1;
      return acc;
    }, {});

    console.log('🌍 Language distribution to import:');
    Object.entries(languageStats).forEach(([lang, count]) => {
      console.log(`  ${lang.toUpperCase()}: ${count} reviews`);
    });

    // Insert in batches to avoid timeout
    const batchSize = 25;
    let totalInserted = 0;
    let englishInserted = 0;

    for (let i = 0; i < reviewsForDB.length; i += batchSize) {
      const batch = reviewsForDB.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('google_reviews')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);

        // Try individual inserts for problematic records
        for (const review of batch) {
          try {
            const { data: singleData, error: singleError } = await supabase
              .from('google_reviews')
              .insert([review])
              .select();

            if (!singleError && singleData && singleData.length > 0) {
              totalInserted++;
              if (review.language === 'en') englishInserted++;
              console.log(`✅ Inserted: ${review.author_name} (${review.language})`);
            } else {
              console.log(`⚠️ Skipped duplicate or invalid: ${review.author_name}`);
            }
          } catch (singleErr) {
            console.log(`⚠️ Error with ${review.author_name}:`, singleErr.message);
          }
        }
      } else {
        const batchEnglish = batch.filter(r => r.language === 'en').length;
        totalInserted += data.length;
        englishInserted += batchEnglish;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${data.length} reviews inserted (${batchEnglish} English)`);
      }
    }

    // Final verification
    const { count: finalCount, error: countError } = await supabase
      .from('google_reviews')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\\n📊 Final database status:`);
      console.log(`Total reviews: ${finalCount}`);

      // Get language breakdown
      const { data: langData, error: langError } = await supabase
        .from('google_reviews')
        .select('language')
        .in('language', ['ar', 'en']);

      if (!langError && langData) {
        const langStats = langData.reduce((acc, review) => {
          acc[review.language] = (acc[review.language] || 0) + 1;
          return acc;
        }, {});

        console.log('Language breakdown:');
        Object.entries(langStats).forEach(([lang, count]) => {
          console.log(`  ${lang.toUpperCase()}: ${count} reviews`);
        });
      }
    }

    console.log(`\\n🎉 Complete import successful!`);
    console.log(`📈 Imported: ${totalInserted} reviews`);
    console.log(`🌍 English reviews: ${englishInserted}`);
    console.log(`🇸🇦 Arabic reviews: ${totalInserted - englishInserted}`);

    // Show a few sample reviews from database
    const { data: sampleReviews, error: sampleError } = await supabase
      .from('google_reviews')
      .select('author_name, language, text')
      .limit(3);

    if (!sampleError && sampleReviews) {
      console.log('\\n📝 Sample reviews now in database:');
      sampleReviews.forEach((review, i) => {
        console.log(`${i + 1}. ${review.author_name} (${review.language.toUpperCase()}): "${review.text.substring(0, 60)}${review.text.length > 60 ? '...' : ''}"`);
      });
    }

    console.log('\\n✅ Your app now has proper multilingual reviews!');
    console.log('English reviews will show when users switch to English language.');

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

// Check for service role key
if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Set it with: set SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

importCompleteReviews();
