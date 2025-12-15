const fs = require('fs');
const path = require('path');

function cleanFiveStarReviews() {
  const reviewsDir = 'C:/Users/alazi/Downloads/ekka-barbershop-2/REVIEWS';
  const files = fs.readdirSync(reviewsDir).filter(f => f.startsWith('reviews'));
  let allFiveStarReviews = [];
  let stats = {
    totalProcessed: 0,
    fiveStarFound: 0,
    withComments: 0,
    withoutComments: 0,
    withReplies: 0,
    duplicates: 0
  };

  // Track review IDs to detect duplicates
  const reviewIds = new Set();

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(reviewsDir, file), 'utf8');
      const data = JSON.parse(content);

      if (data.reviews) {
        stats.totalProcessed += data.reviews.length;

        const fiveStar = data.reviews.filter(review => review.starRating === 'FIVE');
        stats.fiveStarFound += fiveStar.length;

        fiveStar.forEach(review => {
          // Check for duplicates based on Google review ID
          const reviewId = review.name.split('/').pop();
          if (reviewIds.has(reviewId)) {
            stats.duplicates++;
            return; // Skip duplicate
          }
          reviewIds.add(reviewId);

          // Check if review has comment
          if (review.comment && review.comment.trim()) {
            stats.withComments++;
          } else {
            stats.withoutComments++;
          }

          // Check if review has business reply
          if (review.reviewReply) {
            stats.withReplies++;
          }

          // Clean and structure the review data
          const cleanedReview = {
            google_review_id: reviewId,
            author_name: review.reviewer?.displayName || 'Anonymous',
            rating: 5, // Convert FIVE to 5
            text: review.comment || '',
            original_text: review.comment || '',
            language: 'ar', // Most reviews are Arabic
            google_review_time: Math.floor(new Date(review.createTime).getTime() / 1000), // Convert to Unix timestamp
            createTime: review.createTime,
            updateTime: review.updateTime,
            has_business_reply: !!review.reviewReply,
            business_reply: review.reviewReply ? {
              comment: review.reviewReply.comment,
              updateTime: review.reviewReply.updateTime
            } : null,
            google_place_id: 'ChIJLYIU57Qx6hURhgCtpkWYv2o', // From database analysis
            branch_name: 'Al-Waslyia' // Default branch
          };

          allFiveStarReviews.push(cleanedReview);
        });
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  });

  console.log('=== CLEANING STATISTICS ===');
  console.log(`Total reviews processed: ${stats.totalProcessed}`);
  console.log(`5-star reviews found: ${stats.fiveStarFound}`);
  console.log(`5-star reviews with comments: ${stats.withComments}`);
  console.log(`5-star reviews without comments: ${stats.withoutComments}`);
  console.log(`5-star reviews with business replies: ${stats.withReplies}`);
  console.log(`Duplicate reviews removed: ${stats.duplicates}`);
  console.log(`Final clean 5-star reviews: ${allFiveStarReviews.length}`);

  // Save cleaned data
  const outputPath = path.join(reviewsDir, 'cleaned_5star_reviews.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    metadata: {
      generated_at: new Date().toISOString(),
      total_reviews: allFiveStarReviews.length,
      statistics: stats
    },
    reviews: allFiveStarReviews
  }, null, 2));

  console.log(`\nCleaned data saved to: ${outputPath}`);

  return allFiveStarReviews;
}

cleanFiveStarReviews();
