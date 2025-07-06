// Test Hover Autoplay on Search Results Page
// Run this in browser console at http://localhost:3001/search?q=halo

console.log('🧪 Testing Hover Autoplay on Search Results Page');
console.log('================================================');

// Check if we're on the search page
const isSearchPage = window.location.pathname.includes('/search');
const hasHaloQuery = window.location.search.includes('q=halo');

console.log('📍 Current page verification:');
console.log(`  Is Search Page: ${isSearchPage ? '✅' : '❌'}`);
console.log(`  Has "halo" query: ${hasHaloQuery ? '✅' : '❌'}`);

if (!isSearchPage) {
  console.log('❌ This test should be run on the search results page');
  console.log('🔗 Navigate to: http://localhost:3001/search?q=halo');
} else {
  console.log('✅ On search results page - proceeding with test...');
  
  // Wait for videos to load
  setTimeout(() => {
    // Check for HoverAutoplayVideoCard components
    const videoCards = document.querySelectorAll('[class*="group cursor-pointer"]');
    
    console.log('🎬 Video cards found:', videoCards.length);
    
    if (videoCards.length > 0) {
      console.log('✅ HoverAutoplayVideoCard components detected');
      
      // Test hover functionality on first video
      const firstCard = videoCards[0];
      console.log('🎯 Testing hover on first video card...');
      
      // Check for thumbnail and iframe elements
      const thumbnail = firstCard.querySelector('img[alt*=""]');
      const videoContainer = firstCard.querySelector('[style*="height: 250px"]');
      
      console.log('🖼️ Thumbnail found:', !!thumbnail);
      console.log('📹 Video container found:', !!videoContainer);
      
      if (thumbnail && videoContainer) {
        console.log('✅ Video card structure is correct');
        console.log('🎥 Hover Test Instructions:');
        console.log('1. Hover over the first video for 0.5 seconds');
        console.log('2. You should see:');
        console.log('   - "Preview" badge in top-left corner');
        console.log('   - YouTube iframe replacing thumbnail');
        console.log('   - Autoplay video preview (muted)');
        console.log('3. Move cursor away to see iframe disappear');
        
        // Simulate hover for testing
        console.log('🔄 Simulating hover event...');
        firstCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        
        setTimeout(() => {
          const previewBadge = firstCard.querySelector('[class*="bg-red-600"]');
          console.log('🏷️ Preview badge appeared:', !!previewBadge);
          
          setTimeout(() => {
            const iframe = firstCard.querySelector('iframe[src*="youtube-nocookie.com"]');
            console.log('🎬 YouTube iframe loaded:', !!iframe);
            
            if (iframe) {
              console.log('✅ SUCCESS: Hover autoplay is working!');
              console.log('📺 Iframe src:', iframe.src);
            } else {
              console.log('⚠️ Iframe not found - check if video has valid YouTube ID');
            }
          }, 600); // Wait for iframe to load
        }, 200); // Wait for preview badge
        
      } else {
        console.log('❌ Video card structure issue detected');
      }
    } else {
      console.log('❌ No HoverAutoplayVideoCard components found');
      console.log('🔍 Checking for regular VideoCard components...');
      
      const regularCards = document.querySelectorAll('[class*="mb-4"]');
      console.log('📱 Regular video cards found:', regularCards.length);
      
      if (regularCards.length > 0) {
        console.log('⚠️ Using regular VideoCard instead of HoverAutoplayVideoCard');
        console.log('💡 The SearchResultsPage might not be using the updated component');
      } else {
        console.log('❌ No video cards found at all - check if search results loaded');
      }
    }
  }, 2000); // Wait for search results to load
}

console.log('\n📋 Expected Hover Autoplay Features:');
console.log('✅ 0.5 second hover delay before preview starts');
console.log('✅ YouTube iframe with autoplay, muted, no controls');
console.log('✅ Preview badge indicator');
console.log('✅ Smooth transition between thumbnail and video');
console.log('✅ 30-second video preview loop');
console.log('✅ Hide preview when mouse leaves card');

console.log('\n🎯 Manual Testing:');
console.log('1. Search for "halo" videos');
console.log('2. Hover over any video card');
console.log('3. Wait 0.5 seconds');
console.log('4. Verify autoplay preview starts');
console.log('5. Move cursor away');
console.log('6. Verify preview stops and thumbnail returns');
