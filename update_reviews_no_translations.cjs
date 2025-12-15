const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateReviewsWithoutTranslations() {
  try {
    console.log('🔄 Updating reviews in database - removing Google translations...');

    // Read the cleaned reviews without translations
    const cleanedData = JSON.parse(fs.readFileSync('./REVIEWS/cleaned_reviews_no_translations.json', 'utf8'));

    console.log(`📊 Updating ${cleanedData.reviews.length} reviews...`);

    // Update each review in the database
    let updatedCount = 0;
    let englishCount = 0;

    for (const review of cleanedData.reviews) {
      const { data, error } = await supabase
        .from('google_reviews')
        .update({
          text: review.text,
          original_text: review.original_text,
          language: review.language,
          updated_at: new Date().toISOString()
        })
        .eq('author_name', review.author_name)
        .eq('google_review_time', review.google_review_time)
        .select();

      if (error) {
        console.log(`⚠️ Failed to update review for ${review.author_name}:`, error.message);
      } else {
        updatedCount++;
        if (review.language === 'en') englishCount++;
        console.log(`✅ Updated: ${review.author_name} (${review.language})`);
      }
    }

    // Verify the updates by counting each language separately
    const { count: arabicCount, error: arabicError } = await supabase
      .from('google_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('language', 'ar');

    const { count: englishTotalCount, error: englishError } = await supabase
      .from('google_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('language', 'en');

    if (!arabicError && !englishError) {
      console.log('\n📊 Final language distribution in database:');
      console.log(`  AR: ${arabicCount} reviews`);
      console.log(`  EN: ${englishTotalCount} reviews`);
    }

    // Show a few sample reviews from database
    const { data: sampleReviews, error: sampleError } = await supabase
      .from('google_reviews')
      .select('author_name, language, text')
      .limit(5);

    if (!sampleError && sampleReviews) {
      console.log('\n📝 Sample reviews in database (no translations):');
      sampleReviews.forEach((review, i) => {
        console.log(`${i + 1}. ${review.author_name} (${review.language.toUpperCase()}): "${review.text.substring(0, 60)}${review.text.length > 60 ? '...' : ''}"`);
      });
    }

    console.log(`\n🎉 Database updated! ${updatedCount} reviews cleaned of Google translations.`);
    console.log(`🌍 English reviews: ${englishCount}`);
    console.log(`🇸🇦 Arabic reviews: ${updatedCount - englishCount}`);

  } catch (error) {
    console.error('💥 Update failed:', error);
  }
}

// Check for service role key
if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Run: set SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

updateReviewsWithoutTranslations();
