
/**
 * File Size Checker Utility
 * 
 * This is a development utility to help identify large files in the codebase
 * that might be candidates for refactoring.
 * 
 * Usage:
 * - Add this file to your project
 * - Run with Node.js: node src/utils/fileSizeChecker.js
 * - Optionally specify a threshold: node src/utils/fileSizeChecker.js 100 (for files over 100 lines)
 */

const fs = require('fs');
const path = require('path');

// Default threshold (lines of code)
const DEFAULT_THRESHOLD = 150;

// File extensions to check
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

function checkDirectory(dir, threshold, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        checkDirectory(filePath, threshold, results);
      }
    } else {
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        const lineCount = countLines(filePath);
        if (lineCount >= threshold) {
          results.push({ 
            path: filePath, 
            lines: lineCount 
          });
        }
      }
    }
  }
  
  return results;
}

function run() {
  // Get threshold from command line args or use default
  const threshold = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_THRESHOLD;
  console.log(`Checking for files with more than ${threshold} lines of code...\n`);
  
  try {
    const root = process.cwd();
    const results = checkDirectory(root, threshold);
    
    // Sort by line count (descending)
    results.sort((a, b) => b.lines - a.lines);
    
    if (results.length === 0) {
      console.log(`No files found with more than ${threshold} lines of code.`);
    } else {
      console.log(`Found ${results.length} files with more than ${threshold} lines of code:\n`);
      
      // Display table of results
      console.log('Lines | File Path');
      console.log('------|----------');
      results.forEach(({ path: filePath, lines }) => {
        const relativePath = filePath.replace(root + '/', '');
        console.log(`${lines.toString().padEnd(6)} | ${relativePath}`);
      });
      
      console.log('\nThese files might be good candidates for refactoring.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
run();
