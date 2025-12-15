const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to properly detect language
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar';

  // Check if text contains NO Arabic characters at all
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hasArabic = arabicRegex.test(text);

  // If no Arabic characters, it's English
  if (!hasArabic) {
    return 'en';
  }

  // If it has Arabic characters, it's Arabic (Saudi market default)
  return 'ar';
}

async function updateAllLanguages() {
  try {
    console.log('🔄 Updating language detection for all reviews...');

    // Get all reviews
    const { data: reviews, error: fetchError } = await supabase
      .from('google_reviews')
      .select('id, text');

    if (fetchError) {
      console.error('❌ Error fetching reviews:', fetchError);
      return;
    }

    console.log(`📊 Processing ${reviews.length} reviews for language detection...`);

    let updated = 0;
    let englishCount = 0;

    for (const review of reviews) {
      const correctLanguage = detectLanguage(review.text);

      // Only update if the language is wrong
      const { error: updateError } = await supabase
        .from('google_reviews')
        .update({ language: correctLanguage })
        .eq('id', review.id);

      if (updateError) {
        console.log(`⚠️ Failed to update review ${review.id}:`, updateError.message);
      } else {
        updated++;
        if (correctLanguage === 'en') englishCount++;
      }
    }

    // Verify the results
    const { data: langStats, error: statsError } = await supabase
      .from('google_reviews')
      .select('language')
      .in('language', ['ar', 'en']);

    if (!statsError && langStats) {
      const stats = langStats.reduce((acc, review) => {
        acc[review.language] = (acc[review.language] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Final Language Distribution:');
      console.log(`Arabic (AR): ${stats.ar || 0} reviews`);
      console.log(`English (EN): ${stats.en || 0} reviews`);
    }

    // Show some English reviews to verify
    const { data: englishReviews, error: englishError } = await supabase
      .from('google_reviews')
      .select('author_name, text')
      .eq('language', 'en')
      .limit(5);

    if (!englishError && englishReviews) {
      console.log('\n🇬🇧 Sample English Reviews:');
      englishReviews.forEach((review, i) => {
        console.log(`${i + 1}. ${review.author_name}: "${review.text.substring(0, 60)}${review.text.length > 60 ? '...' : ''}"`);
      });
    }

    console.log(`\n✅ Language detection updated! ${updated} reviews processed.`);
    console.log(`🌍 Now you have ${englishCount} proper English reviews!`);

  } catch (error) {
    console.error('💥 Update failed:', error);
  }
}

// Check for service role key
if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Set it with: set SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

updateAllLanguages();
