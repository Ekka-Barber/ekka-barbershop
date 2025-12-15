const fs = require('fs');
const path = require('path');

function cleanupFiles() {
  const reviewsDir = 'REVIEWS';
  const rootDir = '.';

  console.log('🧹 Starting file cleanup process...\n');

  // Files to keep
  const filesToKeep = [
    'REVIEWS/final_cleaned_reviews_no_replies.json',
    'REVIEWS/english_reviews_only.json'
  ];

  // Get all files in REVIEWS directory
  const reviewFiles = fs.readdirSync(reviewsDir);

  console.log('📁 Files in REVIEWS directory:');
  reviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ${file} (${sizeMB} MB)`);
  });

  // Files to remove in REVIEWS directory
  const filesToRemove = reviewFiles.filter(file => {
    const fullPath = path.join(reviewsDir, file);
    return !filesToKeep.includes(fullPath);
  });

  console.log('\n❌ Files to be removed from REVIEWS/:');
  filesToRemove.forEach(file => {
    console.log(`  ${file}`);
  });

  // Get script files in root directory
  const rootFiles = fs.readdirSync(rootDir);
  const scriptFiles = rootFiles.filter(file =>
    file.endsWith('.cjs') || file.endsWith('.js')
  ).filter(file =>
    file.includes('clean') ||
    file.includes('extract') ||
    file.includes('filter') ||
    file.includes('remove') ||
    file.includes('cleanup')
  );

  console.log('\n❌ Script files to be removed from root:');
  scriptFiles.forEach(file => {
    console.log(`  ${file}`);
  });

  // Confirm before deletion
  console.log('\n⚠️  This will permanently delete the following files:');
  [...filesToRemove.map(f => path.join(reviewsDir, f)), ...scriptFiles].forEach(file => {
    console.log(`  ${file}`);
  });

  console.log('\n✅ Files to keep:');
  filesToKeep.forEach(file => {
    console.log(`  ${file}`);
  });

  // Ask for confirmation (in a real scenario, you'd want user confirmation)
  console.log('\n🔄 Starting deletion process...\n');

  // Remove files from REVIEWS directory
  let removedCount = 0;
  filesToRemove.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
      removedCount++;
    } catch (err) {
      console.log(`❌ Failed to remove: ${filePath} - ${err.message}`);
    }
  });

  // Remove script files from root
  scriptFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
      removedCount++;
    } catch (err) {
      console.log(`❌ Failed to remove: ${filePath} - ${err.message}`);
    }
  });

  console.log(`\n🎉 Cleanup complete! Removed ${removedCount} files.`);

  // Show final state
  console.log('\n📋 Final file structure:');
  const finalReviewFiles = fs.readdirSync(reviewsDir);
  console.log('REVIEWS/');
  finalReviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ├── ${file} (${sizeMB} MB)`);
  });

  console.log('\n✅ Ready for database migration!');
  console.log('Use: REVIEWS/final_cleaned_reviews_no_replies.json');
}

cleanupFiles();
