// Debug script for testing hover autoplay on search results page
// Run this in browser console at http://localhost:3001/search?q=halo

console.log('🔍 Debug: Hover Autoplay on Search Results Page');
console.log('================================================');

// Wait for page to load
setTimeout(() => {
  console.log('🎯 Step 1: Checking page status...');
  console.log('Current URL:', window.location.href);
  
  // Check if we're on search page
  const isSearchPage = window.location.pathname.includes('/search');
  const searchQuery = new URLSearchParams(window.location.search).get('q');
  
  console.log(`Is Search Page: ${isSearchPage ? '✅' : '❌'}`);
  console.log(`Search Query: ${searchQuery || 'None'}`);
  
  if (!isSearchPage) {
    console.log('❌ Please navigate to search page: http://localhost:3001/search?q=halo');
    return;
  }
  
  console.log('🎯 Step 2: Finding video cards...');
  
  // Look for HoverAutoplayVideoCard components
  const videoCards = document.querySelectorAll('[class*="group cursor-pointer"]');
  console.log(`Video cards found: ${videoCards.length}`);
  
  if (videoCards.length === 0) {
    console.log('❌ No HoverAutoplayVideoCard components found');
    console.log('🔍 Checking for any video elements...');
    
    const anyVideos = document.querySelectorAll('img[alt*=""], video, iframe[src*="youtube"]');
    console.log(`Any video-related elements: ${anyVideos.length}`);
    return;
  }
  
  console.log('✅ Found video cards, analyzing first card...');
  
  const firstCard = videoCards[0];
  console.log('🎯 Step 3: Analyzing video card structure...');
  
  // Check video card structure
  const thumbnail = firstCard.querySelector('img[alt]');
  const videoContainer = firstCard.querySelector('[style*="height: 250px"]');
  const link = firstCard.querySelector('a[href*="/watch/"]');
  
  console.log(`Thumbnail found: ${!!thumbnail}`);
  console.log(`Video container found: ${!!videoContainer}`);
  console.log(`Watch link found: ${!!link}`);
  
  if (link) {
    const videoId = link.href.match(/\/watch\/(.+)$/)?.[1];
    console.log(`Video ID: ${videoId}`);
    
    // Check if it's a valid YouTube video ID
    if (videoId) {
      console.log('🎯 Step 4: Testing video ID extraction...');
      
      // Test the component's video ID logic
      let extractedId = null;
      if (videoId.startsWith('youtube-')) {
        extractedId = videoId.replace('youtube-', '');
      } else if (videoId.startsWith('google-search-')) {
        extractedId = videoId.replace('google-search-', '');
      } else if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        extractedId = videoId;
      }
      
      console.log(`Extracted YouTube ID: ${extractedId}`);
      console.log(`Valid YouTube ID: ${extractedId && extractedId.length === 11 ? '✅' : '❌'}`);
      
      if (extractedId && extractedId.length === 11) {
        console.log('🎯 Step 5: Testing hover functionality...');
        console.log('Manual test instructions:');
        console.log('1. Hover over the first video card');
        console.log('2. Wait 0.5 seconds');
        console.log('3. Look for:');
        console.log('   - "Preview" badge (red background) in top-left');
        console.log('   - YouTube iframe replacing thumbnail');
        console.log('   - Autoplay starting (muted)');
        console.log('4. Move mouse away to see it return to thumbnail');
        
        // Test hover programmatically
        console.log('🔄 Simulating hover...');
        firstCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        
        setTimeout(() => {
          const previewBadge = firstCard.querySelector('[class*="bg-red-600"]');
          console.log(`Preview badge appeared: ${!!previewBadge}`);
          
          setTimeout(() => {
            const iframe = firstCard.querySelector('iframe[src*="youtube-nocookie.com"]');
            console.log(`YouTube iframe loaded: ${!!iframe}`);
            
            if (iframe) {
              console.log('✅ SUCCESS: Hover autoplay is working!');
              console.log('📺 Iframe src:', iframe.src);
            } else {
              console.log('❌ ISSUE: Iframe not found after hover delay');
              console.log('🔍 Debugging info:');
              console.log('- Check browser console for errors');
              console.log('- Verify YouTube iframe embed is not blocked');
              console.log('- Check if YouTube video is embeddable');
            }
            
            // Clean up
            firstCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
          }, 600);
        }, 200);
      } else {
        console.log('❌ ISSUE: Invalid video ID - hover autoplay won\'t work');
      }
    }
  }
  
  console.log('🎯 Step 6: Environment checks...');
  console.log(`User agent: ${navigator.userAgent}`);
  console.log(`Browser allows autoplay: Checking...`);
  
  // Test if browser allows video autoplay
  const testVideo = document.createElement('video');
  testVideo.muted = true;
  testVideo.autoplay = true;
  testVideo.style.display = 'none';
  document.body.appendChild(testVideo);
  
  const testPlay = testVideo.play();
  if (testPlay instanceof Promise) {
    testPlay.then(() => {
      console.log('✅ Browser allows muted autoplay');
      document.body.removeChild(testVideo);
    }).catch(() => {
      console.log('❌ Browser blocks autoplay (even muted)');
      document.body.removeChild(testVideo);
    });
  }
  
}, 2000);
