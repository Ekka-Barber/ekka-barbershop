const fs = require('fs');
const path = require('path');

function filterReviewsWithComments() {
  const inputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/cleaned_5star_reviews.json';
  const outputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/cleaned_5star_reviews_with_comments_only.json';

  try {
    // Read the cleaned data
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // Filter reviews that have comments (non-empty text)
    const reviewsWithComments = data.reviews.filter(review =>
      review.text && review.text.trim().length > 0
    );

    // Update metadata
    const newMetadata = {
      ...data.metadata,
      total_reviews: reviewsWithComments.length,
      statistics: {
        ...data.metadata.statistics,
        final_reviews_with_comments: reviewsWithComments.length,
        reviews_without_comments_removed: data.metadata.total_reviews - reviewsWithComments.length
      }
    };

    // Create new filtered dataset
    const filteredData = {
      metadata: newMetadata,
      reviews: reviewsWithComments
    };

    // Save filtered data
    fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2));

    console.log('=== FILTERING RESULTS ===');
    console.log(`Original reviews: ${data.metadata.total_reviews}`);
    console.log(`Reviews with comments: ${reviewsWithComments.length}`);
    console.log(`Reviews without comments removed: ${data.metadata.total_reviews - reviewsWithComments.length}`);
    console.log(`\nFiltered data saved to: ${outputPath}`);

    // Show sample of filtered reviews
    console.log('\n=== SAMPLE OF FILTERED REVIEWS ===');
    console.log(JSON.stringify(reviewsWithComments.slice(0, 2), null, 2));

    return filteredData;

  } catch (err) {
    console.error('Error processing reviews:', err.message);
    return null;
  }
}

filterReviewsWithComments();
