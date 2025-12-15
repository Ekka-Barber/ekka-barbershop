const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jfnjvphxhzxojxgptmtu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to detect language for proper app display
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar';

  // Extract text before Google translation marker
  const translationMarker = '\n\n(Translated by Google)\n';
  const originalText = text.split(translationMarker)[0];

  // Check if original text contains Arabic characters
  const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicChars.test(originalText)) {
    return 'ar';
  }

  // Check if original text starts with English capital letter
  if (/^[A-Z][a-z]/.test(originalText.trim())) {
    return 'en';
  }

  // Check for English words in original text only
  const englishIndicators = /\b(the|and|is|are|was|were|has|have|had|will|would|can|could|should|may|might|must|do|does|did|make|made|get|got|go|went|come|came|see|saw|know|knew|think|thought|say|said|tell|told|work|worked|help|helped|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no|service|professional|barber|haircut|beard|shop|time|always|never|first|second|best)\b/gi;

  if (englishIndicators.test(originalText)) {
    return 'en';
  }

  // Default to Arabic for Saudi market
  return 'ar';
}

async function migrateReviews() {
  try {
    console.log('🚀 Starting final reviews migration with language detection...');

    // Read your cleaned reviews data
    const reviewsData = JSON.parse(fs.readFileSync('./REVIEWS/final_cleaned_reviews_no_replies.json', 'utf8'));
    const reviews = reviewsData.reviews;

    console.log(`📊 Processing ${reviews.length} reviews...`);

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

    // Prepare reviews for database insertion
    const reviewsForDB = reviews.map(review => {
      const detectedLanguage = detectLanguage(review.text);

      return {
        google_place_id: review.google_place_id,
        branch_id: branchMap[review.google_place_id] || null,
        author_name: review.author_name,
        rating: review.rating,
        text: review.text,
        original_text: review.original_text,
        language: detectedLanguage, // CRITICAL: For app language switching
        profile_photo_url: null,
        cached_avatar_url: null,
        relative_time_description: null,
        google_review_time: review.google_review_time,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };
    });

    // Log language distribution
    const languageStats = reviewsForDB.reduce((acc, review) => {
      acc[review.language] = (acc[review.language] || 0) + 1;
      return acc;
    }, {});

    console.log('🌍 Language distribution:');
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
    const { data: finalCount, error: countError } = await supabase
      .from('google_reviews')
      .select('language', { count: 'exact' });

    if (!countError) {
      console.log(`\\n📊 Final database status:`);
      console.log(`Total reviews: ${finalCount.length}`);
      console.log(`English reviews: ${englishInserted}`);
      console.log(`Arabic reviews: ${finalCount.length - englishInserted}`);
    }

    console.log(`\\n🎉 Migration complete! Successfully imported ${totalInserted} reviews.`);
    console.log(`🌍 English reviews now available for language switching!`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Check for required environment variables
if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Please set it with: export SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
  process.exit(1);
}

// Run migration
migrateReviews();
