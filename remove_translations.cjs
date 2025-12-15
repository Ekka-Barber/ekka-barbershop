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

  // Check if text contains Arabic characters
  const arabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicChars.test(text)) {
    return 'ar';
  }

  // Check if text starts with English capital letter
  if (/^[A-Z][a-z]/.test(text.trim())) {
    return 'en';
  }

  // Check for English words
  const englishIndicators = /\b(the|and|is|are|was|were|has|have|had|will|would|can|could|should|may|might|must|do|does|did|make|made|get|got|go|went|come|came|see|saw|know|knew|think|thought|say|said|tell|told|work|worked|help|helped|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no|service|professional|barber|haircut|beard|shop|time|always|never|first|second|best)\b/gi;

  if (englishIndicators.test(text)) {
    return 'en';
  }

  // Default to Arabic for Saudi market
  return 'ar';
}

function removeTranslationsFromReviews() {
  const inputPath = './REVIEWS/final_cleaned_reviews_no_replies.json';
  const outputPath = './REVIEWS/cleaned_reviews_no_translations.json';

  try {
    console.log('🧹 Removing Google translations from reviews...');

    // Read the current cleaned reviews
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`📊 Processing ${data.reviews.length} reviews...`);

    // Process each review to remove translations
    const reviewsWithoutTranslations = data.reviews.map(review => {
      const originalText = removeGoogleTranslations(review.text);
      const detectedLanguage = detectLanguage(originalText);

      return {
        ...review,
        text: originalText,
        original_text: originalText, // Also update original_text to match
        language: detectedLanguage // Re-detect language without translations
      };
    });

    // Update metadata
    const newMetadata = {
      ...data.metadata,
      generated_at: new Date().toISOString(),
      translations_removed: true,
      final_reviews_without_translations: reviewsWithoutTranslations.length
    };

    // Create new dataset
    const cleanedData = {
      metadata: newMetadata,
      reviews: reviewsWithoutTranslations
    };

    // Save cleaned data
    fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2));

    // Show statistics
    const languageStats = reviewsWithoutTranslations.reduce((acc, review) => {
      acc[review.language] = (acc[review.language] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Language distribution after removing translations:');
    Object.entries(languageStats).forEach(([lang, count]) => {
      console.log(`  ${lang.toUpperCase()}: ${count} reviews`);
    });

    // Show sample of cleaned reviews
    console.log('\n📝 Sample reviews without translations:');
    reviewsWithoutTranslations.slice(0, 3).forEach((review, i) => {
      console.log(`${i + 1}. "${review.text.substring(0, 80)}${review.text.length > 80 ? '...' : ''}"`);
      console.log(`   Language: ${review.language.toUpperCase()}`);
      console.log('');
    });

    console.log(`✅ Translations removed! Saved to: ${outputPath}`);

    return cleanedData;

  } catch (error) {
    console.error('❌ Error removing translations:', error.message);
    return null;
  }
}

removeTranslationsFromReviews();
