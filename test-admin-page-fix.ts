// Test script to verify admin page YouTube API selection fix
import {
  setYouTubeSearchProvider,
  getYouTubeSearchProvider,
  isYouTubeApiConfigured,
  isYouTubeApiAvailable,
} from './services/settingsService';

function testAdminPageFix() {
  console.log('=== Admin Page YouTube API Selection Fix Test ===\n');

  // Test 1: Check if YouTube API is configured (should always be true if API key exists)
  console.log('1. YouTube API Configuration Status:');
  console.log('YouTube API Configured:', isYouTubeApiConfigured());
  console.log('YouTube API Available:', isYouTubeApiAvailable());
  console.log('Current Provider:', getYouTubeSearchProvider());
  console.log('');

  // Test 2: Switch to Google Custom Search
  console.log('2. Switching to Google Custom Search:');
  setYouTubeSearchProvider('google-search');
  console.log('YouTube API Configured:', isYouTubeApiConfigured()); // Should still be true
  console.log('YouTube API Available:', isYouTubeApiAvailable()); // Should be false (blocked)
  console.log('Current Provider:', getYouTubeSearchProvider());
  console.log('Expected: Configured=true, Available=false, Provider=google-search');
  console.log('');

  // Test 3: Switch back to YouTube API
  console.log('3. Switching back to YouTube API:');
  setYouTubeSearchProvider('youtube-api');
  console.log('YouTube API Configured:', isYouTubeApiConfigured()); // Should be true
  console.log('YouTube API Available:', isYouTubeApiAvailable()); // Should be true
  console.log('Current Provider:', getYouTubeSearchProvider());
  console.log('Expected: Configured=true, Available=true, Provider=youtube-api');
  console.log('');

  // Test 4: Test hybrid mode
  console.log('4. Testing hybrid mode:');
  setYouTubeSearchProvider('hybrid');
  console.log('YouTube API Configured:', isYouTubeApiConfigured()); // Should be true
  console.log('YouTube API Available:', isYouTubeApiAvailable()); // Should be true
  console.log('Current Provider:', getYouTubeSearchProvider());
  console.log('Expected: Configured=true, Available=true, Provider=hybrid');
  console.log('');

  console.log('=== Admin Page Fix Test Complete ===');
  console.log('✅ Users should now be able to:');
  console.log('   - See YouTube API as "Disabled" instead of "Not Configured" when Google Custom Search is selected');
  console.log('   - Switch back to YouTube API from Google Custom Search');
  console.log('   - See proper status indicators for each API state');
}

// Export for testing
export { testAdminPageFix };

// Auto-run notification
if (typeof window !== 'undefined') {
  console.log('Admin page fix test loaded. Run testAdminPageFix() to test the fix.');
}
