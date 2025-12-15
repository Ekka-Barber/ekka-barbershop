const fs = require('fs');
const path = require('path');

// Function to remove Google translations from review text
function removeGoogleTranslations(text) {
  if (!text || typeof text !== 'string') return text;

  // Split by the Google translation marker and keep only the first part
  const translationMarker = '\n\n(Translated by Google)\n';
  const parts = text.split(translationMarker);

  // Return only the original text (before translation)
  return parts[0].trim();
}

// Function to detect language (improved to work with original text only)
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar';

  // Remove Arabic characters and check what's left
  const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const englishText = text.replace(arabicChars, '').trim();

  // If there's substantial English content without Arabic, it's English
  if (englishText.length > 5 && englishText.split(' ').length > 2) {
    return 'en';
  }

  // Check for common English indicators
  const englishIndicators = /\b(the|and|is|are|was|were|has|have|had|will|would|can|could|should|may|might|must|do|does|did|make|made|get|got|go|went|come|came|see|saw|know|knew|think|thought|say|said|tell|told|work|worked|help|helped|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no|service|professional|barber|haircut|beard|shop|time|always|never|first|second|best)\b/gi;

  if (englishIndicators.test(text)) {
    return 'en';
  }

  // Check if text starts with English capital letter (strong indicator)
  if (/^[A-Z][a-z]/.test(text.trim())) {
    return 'en';
  }

  // Default to Arabic for Saudi market
  return 'ar';
}

function completeReviewCleaning() {
  const reviewsDir = './REVIEWS';
  const outputPath = './REVIEWS/final_cleaned_reviews_complete.json';

  console.log('🧹 Starting complete review cleaning process...\n');

  // Get all review files
  let reviewFiles = [];
  try {
    reviewFiles = fs.readdirSync(reviewsDir).filter(file =>
      file.startsWith('reviews') && file.endsWith('.json')
    );
  } catch (error) {
    console.error('❌ REVIEWS directory not found. Please ensure the REVIEWS folder is attached.');
    return;
  }

  console.log(`📁 Found ${reviewFiles.length} review files to process\n`);

  let totalReviewsProcessed = 0;
  let fiveStarReviews = 0;
  let reviewsWithComments = 0;
  let reviewsAfterRemovingReplies = 0;
  let reviewsAfterRemovingTranslations = 0;
  let finalCleanReviews = [];

  // Process each file
  reviewFiles.forEach(file => {
    try {
      const filePath = path.join(reviewsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (data.reviews && Array.isArray(data.reviews)) {
        totalReviewsProcessed += data.reviews.length;

        // Step 1: Filter for 5-star reviews only
        const fiveStarOnly = data.reviews.filter(review => review.starRating === 'FIVE');
        fiveStarReviews += fiveStarOnly.length;

        // Step 2: Remove reviews without comments
        const withComments = fiveStarOnly.filter(review => {
          return review.comment && review.comment.trim().length > 0;
        });
        reviewsWithComments += withComments.length;

        // Step 3: Remove business replies
        const withoutReplies = withComments.map(review => {
          // Remove reviewReply field if it exists
          const { reviewReply, ...reviewWithoutReply } = review;
          return reviewWithoutReply;
        });
        reviewsAfterRemovingReplies += withoutReplies.length;

        // Step 4: Remove Google translations and prepare for database
        const cleanedReviews = withoutReplies.map(review => {
          const originalText = removeGoogleTranslations(review.comment);
          const detectedLanguage = detectLanguage(originalText);

          return {
            google_review_id: review.name ? review.name.split('/').pop() : `review_${Date.now()}_${Math.random()}`,
            author_name: review.reviewer?.displayName || 'Anonymous',
            rating: 5,
            text: originalText,
            original_text: originalText,
            language: detectedLanguage,
            google_review_time: review.createTime ? Math.floor(new Date(review.createTime).getTime() / 1000) : Math.floor(Date.now() / 1000),
            createTime: review.createTime || new Date().toISOString(),
            updateTime: review.updateTime || new Date().toISOString(),
            google_place_id: 'ChIJLYIU57Qx6hURhgCtpkWYv2o',
            branch_name: 'Al-Waslyia'
          };
        });

        finalCleanReviews = finalCleanReviews.concat(cleanedReviews);
        reviewsAfterRemovingTranslations += cleanedReviews.length;

        console.log(`✅ Processed ${file}: ${cleanedReviews.length} clean reviews`);
      }
    } catch (error) {
      console.log(`⚠️ Error processing ${file}: ${error.message}`);
    }
  });

  // Create final output
  const finalData = {
    metadata: {
      generated_at: new Date().toISOString(),
      processing_summary: {
        total_files_processed: reviewFiles.length,
        total_reviews_processed: totalReviewsProcessed,
        five_star_reviews: fiveStarReviews,
        reviews_with_comments: reviewsWithComments,
        reviews_after_removing_replies: reviewsAfterRemovingReplies,
        final_clean_reviews: finalCleanReviews.length
      },
      cleaning_steps_applied: [
        '✅ Filtered 5-star reviews only',
        '✅ Removed reviews without comments',
        '✅ Removed business replies',
        '✅ Removed Google translations',
        '✅ Added language detection',
        '✅ Prepared for database insertion'
      ]
    },
    reviews: finalCleanReviews
  };

  // Save cleaned data
  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

  console.log('\n🎉 COMPLETE CLEANING FINISHED!\n');

  console.log('📊 FINAL STATISTICS:');
  console.log(`   Files processed: ${reviewFiles.length}`);
  console.log(`   Total reviews found: ${totalReviewsProcessed}`);
  console.log(`   5-star reviews: ${fiveStarReviews}`);
  console.log(`   With comments: ${reviewsWithComments}`);
  console.log(`   After removing replies: ${reviewsAfterRemovingReplies}`);
  console.log(`   Final clean reviews: ${finalCleanReviews.length}`);

  // Language distribution
  const languageStats = finalCleanReviews.reduce((acc, review) => {
    acc[review.language] = (acc[review.language] || 0) + 1;
    return acc;
  }, {});

  console.log('\n🌍 LANGUAGE DISTRIBUTION:');
  Object.entries(languageStats).forEach(([lang, count]) => {
    const percentage = ((count / finalCleanReviews.length) * 100).toFixed(1);
    console.log(`   ${lang.toUpperCase()}: ${count} reviews (${percentage}%)`);
  });

  console.log(`\n💾 Cleaned data saved to: ${outputPath}`);

  // Show sample reviews
  console.log('\n📝 SAMPLE CLEAN REVIEWS:');
  finalCleanReviews.slice(0, 3).forEach((review, i) => {
    console.log(`${i + 1}. ${review.author_name} (${review.language.toUpperCase()}):`);
    console.log(`   "${review.text.substring(0, 80)}${review.text.length > 80 ? '...' : ''}"`);
    console.log('');
  });

  console.log('🚀 Ready for database migration!');
  console.log('Run migration script to import these reviews to Supabase.');

  return finalData;
}

completeReviewCleaning();
