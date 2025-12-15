const fs = require('fs');
const path = require('path');

// Function to detect if text is primarily English
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar'; // Default to Arabic

  // Remove Arabic characters and check what's left
  const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const englishText = text.replace(arabicChars, '').trim();

  // If there's substantial English content without Arabic, it's English
  if (englishText.length > 10 && englishText.split(' ').length > 3) {
    return 'en';
  }

  // Check for common English indicators
  const englishIndicators = /\b(the|and|is|are|was|were|has|have|had|will|would|can|could|should|may|might|must|do|does|did|make|made|get|got|go|went|come|came|see|saw|know|knew|think|thought|say|said|tell|told|work|worked|help|helped|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no)\b/gi;

  if (englishIndicators.test(text)) {
    return 'en';
  }

  // Default to Arabic for Saudi/Middle East market
  return 'ar';
}

// Sample review data - replace with your actual data
const sampleReviews = [
  {
    google_review_id: "sample-1",
    author_name: "أحمد محمد",
    rating: 5,
    text: "تجربة رائعة وخدمة ممتازة 👍",
    original_text: "تجربة رائعة وخدمة ممتازة 👍",
    google_review_time: Math.floor(Date.now() / 1000),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    google_place_id: "ChIJLYIU57Qx6hURhgCtpkWYv2o",
    branch_name: "Al-Waslyia"
  },
  {
    google_review_id: "sample-2",
    author_name: "John Smith",
    rating: 5,
    text: "Excellent service and very professional staff. Highly recommended!",
    original_text: "Excellent service and very professional staff. Highly recommended!",
    google_review_time: Math.floor(Date.now() / 1000),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    google_place_id: "ChIJLYIU57Qx6hURhgCtpkWYv2o",
    branch_name: "Al-Waslyia"
  }
];

function prepareReviewsForMigration(reviews) {
  return reviews.map(review => {
    const detectedLanguage = detectLanguage(review.text);

    return {
      google_place_id: review.google_place_id,
      branch_id: null, // Will be set based on google_place_id lookup
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      original_text: review.original_text,
      language: detectedLanguage, // Key for language switching in app
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
}

function createMigrationScript() {
  const preparedReviews = prepareReviewsForMigration(sampleReviews);

  const migrationCode = `const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to detect language for proper app display
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar';

  // Remove Arabic characters and check what's left
  const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const englishText = text.replace(arabicChars, '').trim();

  // If there's substantial English content without Arabic, it's English
  if (englishText.length > 10 && englishText.split(' ').length > 3) {
    return 'en';
  }

  // Check for common English indicators
  const englishIndicators = /\b(the|and|is|are|was|were|has|have|had|will|would|can|could|should|may|might|must|do|does|did|make|made|get|got|go|went|come|came|see|saw|know|knew|think|thought|say|said|tell|told|work|worked|help|helped|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no)\b/gi;

  if (englishIndicators.test(text)) {
    return 'en';
  }

  return 'ar'; // Default for Saudi market
}

async function migrateReviews() {
  try {
    console.log('🚀 Starting reviews migration with language detection...');

    // Read your cleaned reviews data (replace with actual file path)
    // const reviewsData = JSON.parse(fs.readFileSync('./REVIEWS/final_cleaned_reviews_no_replies.json', 'utf8'));
    // const reviews = reviewsData.reviews;

    // For now, using sample data - replace with your actual reviews
    const reviews = ${JSON.stringify(preparedReviews, null, 2)};

    console.log(\`📊 Processing \${reviews.length} reviews...\`);

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
      console.log(\`  \${lang.toUpperCase()}: \${count} reviews\`);
    });

    // Insert in batches
    const batchSize = 10;
    let totalInserted = 0;

    for (let i = 0; i < reviewsForDB.length; i += batchSize) {
      const batch = reviewsForDB.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('google_reviews')
        .insert(batch)
        .select();

      if (error) {
        console.error(\`❌ Batch \${Math.floor(i/batchSize) + 1} failed:\`, error);

        // Try individual inserts for problematic records
        for (const review of batch) {
          try {
            const { data: singleData, error: singleError } = await supabase
              .from('google_reviews')
              .insert([review])
              .select();

            if (!singleError) {
              totalInserted++;
              console.log(\`✅ Inserted: \${review.author_name} (\${review.language})\`);
            } else {
              console.log(\`⚠️ Skipped duplicate or invalid: \${review.author_name}\`);
            }
          } catch (singleErr) {
            console.log(\`⚠️ Error with \${review.author_name}:\`, singleErr.message);
          }
        }
      } else {
        totalInserted += data.length;
        console.log(\`✅ Batch \${Math.floor(i/batchSize) + 1}: \${data.length} reviews inserted\`);
      }
    }

    // Verification
    const { data: finalCount, error: countError } = await supabase
      .from('google_reviews')
      .select('count', { count: 'exact' });

    if (!countError) {
      console.log(\`\\n📊 Final database count: \${finalCount.length} reviews\`);
    }

    console.log(\`\\n🎉 Migration complete! Successfully processed \${totalInserted} reviews.\`);

    // Show language filtering examples
    console.log('\\n🔄 Language filtering for your app:');
    console.log('Arabic reviews: SELECT * FROM google_reviews WHERE language = \\'ar\\'');
    console.log('English reviews: SELECT * FROM google_reviews WHERE language = \\'en\\'');

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Run migration
migrateReviews();`;

  fs.writeFileSync('migrate_reviews_with_proper_language.cjs', migrationCode);

  console.log('✅ Enhanced migration script created: migrate_reviews_with_proper_language.cjs');
  console.log('\n📋 This script includes:');
  console.log('  • Automatic language detection (Arabic vs English)');
  console.log('  • Proper language tagging for app switching');
  console.log('  • Branch ID mapping');
  console.log('  • Batch processing with error handling');
  console.log('  • Duplicate handling');

  console.log('\n🚀 To run migration:');
  console.log('1. Replace sample data with your actual reviews');
  console.log('2. Set environment variables:');
  console.log('   export SUPABASE_URL="your_supabase_url"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  console.log('3. Run: node migrate_reviews_with_proper_language.cjs');
}

// Test the language detection
console.log('🧪 Testing language detection:');
sampleReviews.forEach(review => {
  const detected = detectLanguage(review.text);
  console.log(`"${review.text.substring(0, 50)}..." → ${detected.toUpperCase()}`);
});

console.log('\n📝 Creating migration script...');
createMigrationScript();
