const fs = require('fs');
const path = require('path');

function extractEnglishReviews() {
  const inputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/final_cleaned_reviews_no_replies.json';
  const outputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/english_reviews_only.json';

  try {
    // Read the cleaned data
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // Filter reviews that start with English (capital letter followed by lowercase)
    const englishReviews = data.reviews.filter(review =>
      review.text && /^[A-Z][a-z]/.test(review.text.trim())
    );

    // Update metadata
    const newMetadata = {
      ...data.metadata,
      english_reviews_count: englishReviews.length,
      english_reviews_percentage: ((englishReviews.length / data.metadata.total_reviews) * 100).toFixed(2) + '%'
    };

    // Create English-only dataset
    const englishData = {
      metadata: newMetadata,
      english_reviews: englishReviews
    };

    // Save English reviews
    fs.writeFileSync(outputPath, JSON.stringify(englishData, null, 2));

    console.log('=== ENGLISH REVIEWS EXTRACTION ===');
    console.log(`Total 5-star reviews: ${data.metadata.total_reviews}`);
    console.log(`English reviews found: ${englishReviews.length}`);
    console.log(`Percentage: ${((englishReviews.length / data.metadata.total_reviews) * 100).toFixed(2)}%`);

    console.log('\n=== ENGLISH REVIEWS CONTENT ===');
    englishReviews.forEach((review, index) => {
      console.log(`${index + 1}. "${review.text}"`);
      console.log(`   Author: ${review.author_name}`);
      console.log(`   Date: ${new Date(review.google_review_time * 1000).toLocaleDateString()}`);
      console.log('');
    });

    return englishReviews;

  } catch (err) {
    console.error('Error processing reviews:', err.message);
    return null;
  }
}

extractEnglishReviews();
