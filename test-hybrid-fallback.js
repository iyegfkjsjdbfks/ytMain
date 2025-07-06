// Test Hybrid Mode Fallback Mechanism
// Run this in browser console at http://localhost:3001

console.log('🧪 Testing Hybrid Mode Fallback Mechanism');
console.log('==========================================');

// Test the settings service
import('./services/settingsService.js').then((settingsModule) => {
  const provider = settingsModule.getYouTubeSearchProvider();
  const isGoogleSearchAvailable = settingsModule.isGoogleSearchAvailable();
  const isYouTubeApiConfigured = settingsModule.isYouTubeApiConfigured();
  
  console.log('⚙️ Configuration Status:');
  console.log(`  YouTube Search Provider: ${provider}`);
  console.log(`  Google Custom Search Available: ${isGoogleSearchAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`  YouTube API Configured: ${isYouTubeApiConfigured ? '✅ Yes' : '❌ No'}`);
  
  if (provider === 'hybrid') {
    console.log('✅ HYBRID MODE ACTIVE - Fallback mechanism enabled');
    console.log('📋 Expected behavior:');
    console.log('  1. Try YouTube Data API first');
    console.log('  2. When quota exceeded (403), fallback to Google Custom Search');
    console.log('  3. Return Google Custom Search results');
  } else {
    console.log('❌ HYBRID MODE NOT ACTIVE - Current provider:', provider);
  }
  
  // Test the actual search function
  console.log('\n🔍 Testing searchForHomePage function...');
  return import('./services/googleSearchService.js');
}).then((searchModule) => {
  // Mock search local videos function
  const mockSearchLocalVideos = async (query) => {
    console.log(`🔍 Mock local search for: ${query}`);
    return [];
  };
  
  console.log('🚀 Triggering home page search with "trending" query...');
  console.log('Expected: YouTube API fail → Google Custom Search fallback');
  
  // This should trigger the fallback mechanism
  searchModule.searchForHomePage('trending', mockSearchLocalVideos)
    .then((result) => {
      console.log('✅ Search completed successfully');
      console.log(`📊 Results: ${result.youtubeVideos.length} YouTube API, ${result.googleSearchVideos.length} Google Search, ${result.localVideos.length} Local`);
      
      if (result.googleSearchVideos.length > 0) {
        console.log('🎯 SUCCESS: Google Custom Search fallback worked!');
        console.log(`📺 Found ${result.googleSearchVideos.length} videos from Google Custom Search`);
      } else if (result.youtubeVideos.length > 0) {
        console.log('⚠️ YouTube API worked (quota not exceeded yet)');
      } else {
        console.log('❌ Both APIs failed - check configuration');
      }
    })
    .catch((error) => {
      console.error('❌ Search failed:', error.message);
    });
}).catch((error) => {
  console.error('❌ Error importing modules:', error);
});

console.log('\n📝 Monitor the console for:');
console.log('✅ "🔄 Hybrid Mode (Home Page): Trying YouTube Data API first, then Google Custom Search as fallback"');
console.log('✅ "🚨 YouTube Data API failed, falling back to Google Custom Search"');
console.log('✅ "✅ Google Custom Search fallback successful: X results"');
