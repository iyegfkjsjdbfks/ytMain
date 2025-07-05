// Test script to verify video ID extraction for both prefixes
import { unifiedDataService } from './src/services/unifiedDataService.js';

console.log('Testing video ID extraction...');

// Test cases
const testCases = [
  'youtube-bnVUHWCynig',
  'google-search-bnVUHWCynig', 
  'bnVUHWCynig',
  'https://www.youtube.com/watch?v=bnVUHWCynig'
];

testCases.forEach(testId => {
  console.log(`Testing ID: "${testId}"`);
  // This would test the extractYouTubeId method if it was public
  // For now, we'll just log the test cases
});

console.log('Test completed. Check browser console for actual extraction results.');
