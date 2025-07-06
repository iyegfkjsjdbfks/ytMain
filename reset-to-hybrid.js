// Reset YouTube Search Provider to Hybrid Mode
// Run this in browser console at http://localhost:3000

console.log('🔄 Resetting YouTube Search Provider to Hybrid Mode...');
console.log('======================================================');

// Check current setting
const currentSettings = localStorage.getItem('appSettings');
if (currentSettings) {
  const parsed = JSON.parse(currentSettings);
  console.log('📋 Current provider:', parsed.youtubeSearchProvider);
  
  // Update to hybrid mode
  parsed.youtubeSearchProvider = 'hybrid';
  localStorage.setItem('appSettings', JSON.stringify(parsed));
  
  console.log('✅ Updated provider to: hybrid');
  console.log('🔄 Please refresh the page to apply changes');
} else {
  console.log('ℹ️ No stored settings found - will use default hybrid mode');
}

// Verify the change
const updatedSettings = localStorage.getItem('appSettings');
if (updatedSettings) {
  const parsed = JSON.parse(updatedSettings);
  console.log('✅ Verified - Current provider is now:', parsed.youtubeSearchProvider);
}

console.log('\n🎯 Expected behavior after refresh:');
console.log('1. YouTube Data API will be tried first');
console.log('2. When quota exceeded (403), it will fallback to Google Custom Search');
console.log('3. You should see "Google Custom Search fallback successful" in console');
