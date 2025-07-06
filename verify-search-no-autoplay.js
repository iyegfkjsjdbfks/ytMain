// Verification script for search page without autoplay
// Run this in browser console at http://localhost:3000/search?q=latest%20news

console.log('🔍 Verifying Search Page - No Autoplay');
console.log('=====================================');

setTimeout(() => {
  console.log('📍 Current URL:', window.location.href);
  
  // Check if we're on search page
  const isSearchPage = window.location.pathname.includes('/search');
  const searchQuery = new URLSearchParams(window.location.search).get('q');
  
  console.log(`✅ Is Search Page: ${isSearchPage}`);
  console.log(`✅ Search Query: ${searchQuery || 'None'}`);
  
  if (!isSearchPage) {
    console.log('❌ Please navigate to search page: http://localhost:3000/search?q=latest%20news');
    return;
  }
  
  // Look for video cards - should NOT have autoplay functionality
  const videoCards = document.querySelectorAll('[class*="group cursor-pointer"]');
  const regularVideoCards = document.querySelectorAll('.mb-4, [class*="mb-4"]');
  
  console.log('📹 HoverAutoplayVideoCard found:', videoCards.length);
  console.log('📺 Regular VideoCard found:', regularVideoCards.length);
  
  if (videoCards.length > 0) {
    console.log('⚠️ WARNING: HoverAutoplayVideoCard components still detected on search page');
    console.log('💡 These should be replaced with regular VideoCard components');
    
    // Test if autoplay still works
    const firstCard = videoCards[0];
    console.log('🧪 Testing if autoplay is disabled...');
    
    firstCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const iframe = firstCard.querySelector('iframe[src*="youtube-nocookie.com"]');
      if (iframe) {
        console.log('❌ ISSUE: Autoplay iframe still appears on search page');
      } else {
        console.log('✅ GOOD: No autoplay iframe appears on hover');
      }
      
      // Clean up
      firstCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 700);
    
  } else {
    console.log('✅ SUCCESS: No HoverAutoplayVideoCard components found');
    
    if (regularVideoCards.length > 0) {
      console.log('✅ SUCCESS: Regular VideoCard components detected');
      console.log('📝 Search page correctly uses static video cards without autoplay');
      
      // Test that hover doesn't trigger autoplay
      const firstRegularCard = regularVideoCards[0];
      if (firstRegularCard) {
        console.log('🧪 Testing regular video card hover...');
        firstRegularCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        
        setTimeout(() => {
          const iframe = firstRegularCard.querySelector('iframe[src*="youtube-nocookie.com"]');
          const muteButton = firstRegularCard.querySelector('button[title*="mute"]');
          
          if (!iframe && !muteButton) {
            console.log('✅ PERFECT: No autoplay functionality on regular video cards');
          } else {
            console.log('⚠️ Unexpected: Found autoplay elements on regular card');
          }
          
          // Clean up
          firstRegularCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        }, 700);
      }
    } else {
      console.log('❌ No video cards found - search results may not have loaded yet');
    }
  }
  
  console.log('\n📋 Expected Behavior:');
  console.log('✅ Search page should use regular VideoCard components');
  console.log('✅ No hover autoplay functionality');
  console.log('✅ No mute/unmute buttons');
  console.log('✅ Static thumbnails only');
  console.log('✅ Click to navigate to watch page');
  
}, 3000);

console.log('✅ Verification script loaded - waiting 3 seconds for page load...');
