const fs = require('fs');
const path = require('path');

function removeBusinessReplies() {
  const inputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/cleaned_5star_reviews_with_comments_only.json';
  const outputPath = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS/final_cleaned_reviews_no_replies.json';

  try {
    // Read the cleaned data
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    // Remove business reply fields from each review
    const reviewsWithoutReplies = data.reviews.map(review => {
      // Create a new object without business reply fields
      const {
        business_reply,
        has_business_reply,
        ...reviewWithoutReply
      } = review;

      return reviewWithoutReply;
    });

    // Update metadata
    const newMetadata = {
      ...data.metadata,
      total_reviews: reviewsWithoutReplies.length,
      statistics: {
        ...data.metadata.statistics,
        business_replies_removed: true,
        final_reviews_without_business_replies: reviewsWithoutReplies.length
      }
    };

    // Create final dataset
    const finalData = {
      metadata: newMetadata,
      reviews: reviewsWithoutReplies
    };

    // Save final data
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    console.log('=== BUSINESS REPLIES REMOVAL RESULTS ===');
    console.log(`Original reviews: ${data.metadata.total_reviews}`);
    console.log(`Business replies removed from all reviews`);
    console.log(`Final clean reviews (customer only): ${reviewsWithoutReplies.length}`);
    console.log(`\nFinal data saved to: ${outputPath}`);

    // Show sample of final reviews
    console.log('\n=== SAMPLE OF FINAL REVIEWS ===');
    console.log(JSON.stringify(reviewsWithoutReplies.slice(0, 2), null, 2));

    return finalData;

  } catch (err) {
    console.error('Error processing reviews:', err.message);
    return null;
  }
}

removeBusinessReplies();
