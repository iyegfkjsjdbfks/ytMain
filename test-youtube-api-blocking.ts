// Test script to verify YouTube Data API blocking functionality
import { setYouTubeSearchProvider, getYouTubeSearchProvider } from './services/settingsService';
import { youtubeSearchService } from './services/youtubeSearchService';
import { youtubeService } from './src/services/api/youtubeService';
import { isYouTubeDataApiBlocked, isYouTubeDataApiAllowed } from './src/utils/youtubeApiUtils';

async function testYouTubeApiBlocking() {
  console.log('=== YouTube Data API Blocking Test ===\n');

  // Test 1: Default state (should allow YouTube API)
  console.log('1. Default provider state:');
  console.log('Provider:', getYouTubeSearchProvider());
  console.log('API Blocked:', isYouTubeDataApiBlocked());
  console.log('API Allowed:', isYouTubeDataApiAllowed());
  console.log('');

  // Test 2: Set to Google Custom Search (should block YouTube API)
  console.log('2. Setting provider to Google Custom Search:');
  setYouTubeSearchProvider('google-search');
  console.log('Provider:', getYouTubeSearchProvider());
  console.log('API Blocked:', isYouTubeDataApiBlocked());
  console.log('API Allowed:', isYouTubeDataApiAllowed());
  console.log('');

  // Test 3: Try to use YouTube API when blocked
  console.log('3. Testing YouTube API call when blocked:');
  try {
    const result = await youtubeService.fetchVideos(['dQw4w9WgXcQ']);
    console.log('YouTube API result (should be empty):', result);
  } catch (error) {
    console.error('YouTube API error:', error);
  }
  console.log('');

  // Test 4: Test Google Custom Search (should work)
  console.log('4. Testing Google Custom Search when provider is google-search:');
  try {
    const results = await youtubeSearchService.searchVideos('test query', 5);
    console.log('Google Custom Search results count:', results.length);
    console.log('First result has google-search prefix:', results[0]?.id?.startsWith('google-search-'));
  } catch (error) {
    console.error('Google Custom Search error:', error);
  }
  console.log('');

  // Test 5: Switch back to YouTube API (should allow)
  console.log('5. Setting provider back to YouTube API:');
  setYouTubeSearchProvider('youtube-api');
  console.log('Provider:', getYouTubeSearchProvider());
  console.log('API Blocked:', isYouTubeDataApiBlocked());
  console.log('API Allowed:', isYouTubeDataApiAllowed());
  console.log('');

  // Test 6: Try YouTube API when allowed
  console.log('6. Testing YouTube API call when allowed:');
  try {
    const result = await youtubeService.fetchVideos(['dQw4w9WgXcQ']);
    console.log('YouTube API result (should have data):', result.length > 0 ? 'Has data' : 'Empty');
  } catch (error) {
    console.error('YouTube API error:', error);
  }
  console.log('');

  // Test 7: Test hybrid mode
  console.log('7. Testing hybrid mode:');
  setYouTubeSearchProvider('hybrid');
  console.log('Provider:', getYouTubeSearchProvider());
  console.log('API Blocked:', isYouTubeDataApiBlocked());
  console.log('API Allowed:', isYouTubeDataApiAllowed());
  console.log('');

  console.log('=== Test Complete ===');
}

// Export for use in browser console or test runner
export { testYouTubeApiBlocking };

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  console.log('YouTube API Blocking Test loaded. Run testYouTubeApiBlocking() to test.');
}
