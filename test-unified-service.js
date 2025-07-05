// Test the unified data service google-search video handling
const testVideoId = 'google-search-bnVUHWCynig';

console.log('🧪 Testing Unified Data Service for Google Custom Search video...');
console.log(`Testing with ID: ${testVideoId}`);

// Check if environment variables are available
console.log('\n📋 Environment Check:');
console.log('VITE_GOOGLE_SEARCH_API_KEY:', process.env.VITE_GOOGLE_SEARCH_API_KEY ? '✅ Set' : '❌ Missing');
console.log('VITE_GOOGLE_SEARCH_ENGINE_ID:', process.env.VITE_GOOGLE_SEARCH_ENGINE_ID ? '✅ Set' : '❌ Missing');

// Import and test the unified data service
import('./src/services/unifiedDataService.js').then(async ({ unifiedDataService }) => {
  try {
    console.log('\n🔍 Calling unifiedDataService.getVideoById...');
    const result = await unifiedDataService.getVideoById(testVideoId);
    
    if (result) {
      console.log('\n✅ SUCCESS! Video found:');
      console.log(`  Title: ${result.title}`);
      console.log(`  Channel: ${result.channel?.name}`);
      console.log(`  Source: ${result.source}`);
      console.log(`  Views: ${result.viewsFormatted}`);
    } else {
      console.log('\n❌ FAILED: No video found');
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.error(error.stack);
  }
}).catch(err => {
  console.error('Failed to import unified data service:', err);
});
