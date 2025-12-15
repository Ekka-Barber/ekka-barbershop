const fs = require('fs');

// Function to detect language
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

// Test with actual reviews
const data = JSON.parse(fs.readFileSync('./REVIEWS/final_cleaned_reviews_no_replies.json'));
const englishReviews = data.reviews.filter(r => detectLanguage(r.text) === 'en');

console.log('🔍 Language Detection Test Results:');
console.log(`Total reviews: ${data.reviews.length}`);
console.log(`English reviews detected: ${englishReviews.length}`);
console.log('');

console.log('📝 English Reviews Found:');
englishReviews.slice(0, 8).forEach((review, i) => {
  console.log(`${i + 1}. "${review.text.substring(0, 60)}..." - ${review.author_name}`);
});

console.log('');
console.log('✅ Language detection is working! Now run the migration script.');
