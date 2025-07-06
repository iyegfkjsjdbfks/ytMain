// Test script to verify YouTube Data API is being used for metadata enrichment
// Run this in the browser console at http://localhost:3000/search?q=halo

console.log('🧪 Testing Search Metadata Configuration');
console.log('========================================');

// Check environment variables
const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
const googleSearchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const googleSearchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

console.log('🔑 API Keys Configuration:');
console.log(`  YouTube Data API v3 Key: ${youtubeApiKey ? '✅ Available' : '❌ Missing'}`);
console.log(`  Google Custom Search API Key: ${googleSearchApiKey ? '✅ Available' : '❌ Missing'}`);
console.log(`  Google Search Engine ID: ${googleSearchEngineId ? '✅ Available' : '❌ Missing'}`);

// Check settings service
import('./services/settingsService.js').then((settingsModule) => {
  const provider = settingsModule.getYouTubeSearchProvider();
  const isGoogleSearchAvailable = settingsModule.isGoogleSearchAvailable();
  const isYouTubeApiConfigured = settingsModule.isYouTubeApiConfigured();
  const isYouTubeApiAvailable = settingsModule.isYouTubeApiAvailable();
  
  console.log('⚙️ Current Settings:');
  console.log(`  YouTube Search Provider: ${provider}`);
  console.log(`  Google Custom Search Available: ${isGoogleSearchAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`  YouTube API Configured: ${isYouTubeApiConfigured ? '✅ Yes' : '❌ No'}`);
  console.log(`  YouTube API Available: ${isYouTubeApiAvailable ? '✅ Yes' : '❌ No'}`);
  
  console.log('📋 Expected Behavior:');
  console.log('  1. Use Google Custom Search API for video discovery');
  console.log('  2. Use YouTube Data API v3 for metadata enrichment (view counts, etc.)');
  console.log('  3. Fallback to Google Custom Search metadata if YouTube API fails');
  
  if (provider === 'google-search' && isGoogleSearchAvailable && isYouTubeApiAvailable) {
    console.log('✅ CONFIGURATION CORRECT: Using Google Custom Search for discovery + YouTube API for metadata');
  } else {
    console.log('⚠️ CONFIGURATION ISSUE DETECTED');
    if (provider !== 'google-search') {
      console.log(`  - Search provider should be 'google-search', currently: ${provider}`);
    }
    if (!isGoogleSearchAvailable) {
      console.log('  - Google Custom Search API not properly configured');
    }
    if (!isYouTubeApiAvailable) {
      console.log('  - YouTube Data API not properly configured');
    }
  }
}).catch(console.error);

// Test actual search functionality
console.log('🔍 Testing Search Function...');
import('./services/googleSearchService.js').then(async (searchModule) => {
  try {
    console.log('Testing Google Custom Search with "halo" query...');
    const results = await searchModule.searchYouTubeWithGoogleSearch('halo');
    
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results from Google Custom Search`);
      const firstResult = results[0];
      
      console.log('📊 First Result Metadata:');
      console.log(`  Title: ${firstResult.title}`);
      console.log(`  Channel: ${firstResult.channelName}`);
      console.log(`  View Count: ${firstResult.viewCount ? firstResult.viewCount.toLocaleString() : 'Not available'}`);
      console.log(`  Like Count: ${firstResult.likeCount ? firstResult.likeCount.toLocaleString() : 'Not available'}`);
      console.log(`  Duration: ${firstResult.duration || 'Not available'}`);
      console.log(`  Thumbnail: ${firstResult.thumbnailUrl ? '✅ Available' : '❌ Missing'}`);
      
      // Check if metadata came from YouTube API
      if (firstResult.viewCount && firstResult.viewCount > 0) {
        console.log('✅ Rich metadata available - likely from YouTube Data API v3');
      } else {
        console.log('⚠️ Limited metadata - possibly only from Google Custom Search');
      }
    } else {
      console.log('❌ No results returned from Google Custom Search');
    }
  } catch (error) {
    console.error('❌ Error testing search:', error);
  }
}).catch(console.error);

console.log('🎯 To verify correct behavior:');
console.log('1. Open browser DevTools Network tab');
console.log('2. Search for "halo" at /search?q=halo');
console.log('3. Look for calls to:');
console.log('   - googleapis.com/customsearch/v1 (for discovery)');
console.log('   - googleapis.com/youtube/v3/videos (for metadata)');
console.log('4. Check that view counts are accurate/real numbers');
