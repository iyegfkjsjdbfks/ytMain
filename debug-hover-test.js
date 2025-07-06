// Debug script for hover autoplay on search page
// Run this in browser console at http://localhost:3000/search?q=halo

console.log('🔍 Debugging Hover Autoplay on Search Page');
console.log('===============================================');

// Wait for page to fully load
setTimeout(() => {
  console.log('🎯 Step 1: Page Status Check');
  console.log('Current URL:', window.location.href);
  
  const isSearchPage = window.location.pathname.includes('/search');
  const searchQuery = new URLSearchParams(window.location.search).get('q');
  
  console.log(`✅ Is Search Page: ${isSearchPage}`);
  console.log(`✅ Search Query: ${searchQuery || 'None'}`);
  
  if (!isSearchPage) {
    console.log('❌ Please navigate to: http://localhost:3000/search?q=halo');
    return;
  }
  
  console.log('\n🎯 Step 2: Finding Video Components');
  
  // Look for HoverAutoplayVideoCard components
  const videoCards = document.querySelectorAll('[class*="group cursor-pointer"]');
  const allVideoElements = document.querySelectorAll('img[alt], video, iframe[src*="youtube"]');
  
  console.log(`📹 HoverAutoplayVideoCard found: ${videoCards.length}`);
  console.log(`📺 Total video elements: ${allVideoElements.length}`);
  
  if (videoCards.length === 0) {
    console.log('❌ No HoverAutoplayVideoCard components detected');
    console.log('🔍 Possible issues:');
    console.log('   - Search results haven\'t loaded yet');
    console.log('   - Using wrong video card component');
    console.log('   - CSS classes changed');
    return;
  }
  
  console.log('✅ Found video cards! Analyzing first card...');
  
  const firstCard = videoCards[0];
  console.log('\n🎯 Step 3: Card Structure Analysis');
  
  // Analyze card structure
  const thumbnail = firstCard.querySelector('img[alt]');
  const videoContainer = firstCard.querySelector('[style*="height: 250px"]');
  const watchLink = firstCard.querySelector('a[href*="/watch/"]');
  const title = firstCard.querySelector('h3');
  
  console.log(`🖼️ Thumbnail found: ${!!thumbnail}`);
  console.log(`📦 Video container found: ${!!videoContainer}`);
  console.log(`🔗 Watch link found: ${!!watchLink}`);
  console.log(`📝 Title found: ${!!title}`);
  
  if (watchLink) {
    const videoId = watchLink.href.match(/\/watch\/(.+)$/)?.[1];
    console.log(`🆔 Video ID: ${videoId}`);
    
    // Test video ID extraction logic (same as component)
    let extractedId = null;
    if (videoId) {
      if (videoId.startsWith('youtube-')) {
        extractedId = videoId.replace('youtube-', '');
      } else if (videoId.startsWith('google-search-')) {
        extractedId = videoId.replace('google-search-', '');
      } else if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        extractedId = videoId;
      }
    }
    
    console.log(`🎬 Extracted YouTube ID: ${extractedId}`);
    console.log(`✅ Valid for autoplay: ${extractedId && extractedId.length === 11}`);
    
    if (extractedId && extractedId.length === 11) {
      console.log('\n🎯 Step 4: Testing Hover Functionality');
      console.log('🔄 Manual Test Instructions:');
      console.log('1. Hover over the first video card');
      console.log('2. Wait 0.5 seconds');
      console.log('3. Look for:');
      console.log('   - Red "Preview" badge in top-left corner');
      console.log('   - YouTube iframe replacing thumbnail');
      console.log('   - Video autoplay (muted)');
      console.log('4. Move mouse away to return to thumbnail');
      
      // Programmatic hover test
      console.log('\n🤖 Automated Test Starting...');
      firstCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      setTimeout(() => {
        const previewBadge = firstCard.querySelector('[class*="bg-red-600"]');
        console.log(`🏷️ Preview badge appeared: ${!!previewBadge ? '✅' : '❌'}`);
        
        setTimeout(() => {
          const iframe = firstCard.querySelector('iframe[src*="youtube-nocookie.com"]');
          console.log(`🎬 YouTube iframe loaded: ${!!iframe ? '✅' : '❌'}`);
          
          if (iframe) {
            console.log('🎉 SUCCESS: Hover autoplay is working!');
            console.log('📺 Iframe src:', iframe.src);
          } else {
            console.log('❌ ISSUE: Iframe not found');
            console.log('🔧 Troubleshooting:');
            console.log('   - Check browser console for errors');
            console.log('   - Verify YouTube iframe isn\'t blocked');
            console.log('   - Check if video is embeddable');
            console.log('   - Test with different video');
          }
          
          // Clean up test
          firstCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        }, 700); // Wait for iframe load
      }, 300); // Wait for preview badge
      
    } else {
      console.log('❌ ISSUE: Invalid video ID detected');
      console.log('💡 This will prevent hover autoplay from working');
    }
  }
  
  console.log('\n🎯 Step 5: Environment Checks');
  console.log(`🌐 User Agent: ${navigator.userAgent}`);
  console.log(`📱 Is Mobile: ${/Mobi|Android/i.test(navigator.userAgent)}`);
  
  // Test autoplay capability
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
      console.log('❌ Browser blocks autoplay (this could affect iframe autoplay)');
      document.body.removeChild(testVideo);
    });
  }
  
}, 3000); // Wait 3 seconds for search results to load

console.log('\n📋 Expected Behavior:');
console.log('✅ Hover over video → 0.5s delay → Preview badge → YouTube iframe autoplay');
console.log('✅ Move cursor away → Iframe disappears → Thumbnail returns');
console.log('\n🚨 Common Issues:');
console.log('• Search results not loaded yet (wait longer)');
console.log('• Invalid video IDs (check video sources)');
console.log('• Browser blocking autoplay');
console.log('• YouTube embeds disabled for specific videos');
console.log('• Development server issues');
