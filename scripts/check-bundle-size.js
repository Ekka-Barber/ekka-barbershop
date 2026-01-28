#!/usr/bin/env node
/**
 * Bundle Size Check Script
 * 
 * This script checks the total size of JavaScript assets in the dist folder
 * against a configurable performance budget. It runs after the build to ensure
 * the bundle size doesn't grow beyond acceptable limits.
 * 
 * Usage: node scripts/check-bundle-size.js [options]
 * Options:
 *   --max-size=<kb>    Set maximum allowed size in KB (default: 1000)
 *   --warn=<kb>        Set warning threshold in KB (default: 900)
 *   --verbose          Show detailed breakdown of all files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  maxSizeKB: 1000, // 1MB default limit (uncompressed JS)
  warnThresholdKB: 900,
  verbose: false,
  checkGzip: true,
  checkBrotli: true,
};

args.forEach(arg => {
  if (arg.startsWith('--max-size=')) {
    options.maxSizeKB = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--warn=')) {
    options.warnThresholdKB = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--no-compression-check') {
    options.checkGzip = false;
    options.checkBrotli = false;
  }
});

// Paths
const assetsDir = path.join(__dirname, '../dist/assets');

// Check if dist exists
if (!fs.existsSync(assetsDir)) {
  console.error('❌ dist/assets directory not found. Run npm run build first.');
  process.exit(1);
}

// Get all JS files
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

if (jsFiles.length === 0) {
  console.error('❌ No JavaScript files found in dist/assets');
  process.exit(1);
}

// Calculate sizes
let totalUncompressed = 0;
let totalGzip = 0;
let totalBrotli = 0;
const fileDetails = [];

for (const file of jsFiles) {
  const filePath = path.join(assetsDir, file);
  const stats = fs.statSync(filePath);
  const uncompressedSize = stats.size;
  totalUncompressed += uncompressedSize;

  // Check for compressed versions
  const gzipPath = `${filePath}.gz`;
  const brotliPath = `${filePath}.br`;

  let gzipSize = 0;
  let brotliSize = 0;

  if (options.checkGzip && fs.existsSync(gzipPath)) {
    gzipSize = fs.statSync(gzipPath).size;
    totalGzip += gzipSize;
  }

  if (options.checkBrotli && fs.existsSync(brotliPath)) {
    brotliSize = fs.statSync(brotliPath).size;
    totalBrotli += brotliSize;
  }

  fileDetails.push({
    name: file,
    uncompressed: uncompressedSize,
    gzip: gzipSize,
    brotli: brotliSize,
  });
}

// Convert to KB
const totalUncompressedKB = totalUncompressed / 1024;
const totalGzipKB = totalGzip / 1024;
const totalBrotliKB = totalBrotli / 1024;

// Sort by uncompressed size (largest first)
fileDetails.sort((a, b) => b.uncompressed - a.uncompressed);

// Print results
console.log('\n📦 Bundle Size Report');
console.log('=====================\n');

if (options.verbose) {
  console.log('File Details (Top 15 largest):');
  console.log('----------------------------------------');
  fileDetails.slice(0, 15).forEach(file => {
    const uncompressed = (file.uncompressed / 1024).toFixed(2);
    const gzip = file.gzip ? (file.gzip / 1024).toFixed(2) : 'N/A';
    const brotli = file.brotli ? (file.brotli / 1024).toFixed(2) : 'N/A';
    console.log(`${file.name.slice(0, 40).padEnd(42)} ${uncompressed.padStart(8)} KB (gzip: ${gzip.padStart(6)}, brotli: ${brotli.padStart(6)})`);
  });
  console.log('----------------------------------------\n');
}

console.log('Total Sizes:');
console.log(`  Uncompressed: ${totalUncompressedKB.toFixed(2)} KB`);
if (options.checkGzip) {
  console.log(`  Gzip:         ${totalGzipKB.toFixed(2)} KB`);
}
if (options.checkBrotli) {
  console.log(`  Brotli:       ${totalBrotliKB.toFixed(2)} KB`);
}
console.log();

// Check against budget
const checkSize = options.checkBrotli ? totalBrotliKB : (options.checkGzip ? totalGzipKB : totalUncompressedKB);
const compressionLabel = options.checkBrotli ? 'brotli' : (options.checkGzip ? 'gzip' : 'uncompressed');

if (checkSize > options.maxSizeKB) {
  console.error(`❌ Bundle size (${checkSize.toFixed(2)} KB ${compressionLabel}) exceeds limit (${options.maxSizeKB} KB)`);
  console.error(`   Reduce bundle size or increase limit with --max-size=<kb>`);
  process.exit(1);
} else if (checkSize > options.warnThresholdKB) {
  console.warn(`⚠️  Bundle size (${checkSize.toFixed(2)} KB ${compressionLabel}) exceeds warning threshold (${options.warnThresholdKB} KB)`);
  console.warn(`   Consider optimizing before it exceeds the limit (${options.maxSizeKB} KB)`);
}

console.log(`✅ Bundle size (${checkSize.toFixed(2)} KB ${compressionLabel}) within limit (${options.maxSizeKB} KB)`);
console.log(`   Total files: ${jsFiles.length}`);
console.log();

// Additional insights
const largestFile = fileDetails[0];
console.log('Insights:');
console.log(`  Largest chunk: ${largestFile.name} (${(largestFile.uncompressed / 1024).toFixed(2)} KB uncompressed)`);

// Compression ratio
if (options.checkGzip && totalUncompressed > 0) {
  const gzipRatio = ((1 - totalGzip / totalUncompressed) * 100).toFixed(1);
  console.log(`  Gzip compression saves: ${gzipRatio}%`);
}
if (options.checkBrotli && totalUncompressed > 0) {
  const brotliRatio = ((1 - totalBrotli / totalUncompressed) * 100).toFixed(1);
  console.log(`  Brotli compression saves: ${brotliRatio}%`);
}

console.log();
process.exit(0);
