// Test script to check Google Custom Search API response
const API_KEY = 'AIzaSyDo2zq98fZbNEgjkdsYGAZs-CJcfSBz9OQ';
const ENGINE_ID = '61201925358ea4e83';
const YOUTUBE_API_KEY = 'AIzaSyBUsybQzukGdy3O6a7_IT2DFJVAnPYlF0U';

async function testGoogleCustomSearch() {
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', API_KEY);
    searchUrl.searchParams.set('cx', ENGINE_ID);
    searchUrl.searchParams.set('q', 'javascript tutorial site:youtube.com');
    searchUrl.searchParams.set('num', '3');

    console.log('Testing Google Custom Search API...');
    console.log('URL:', searchUrl.toString());
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('\n=== Google Custom Search Response ===');
    console.log('Total Results:', data.searchInformation?.totalResults);
    console.log('Items found:', data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        console.log(`\n--- Item ${index + 1} ---`);
        console.log('Title:', item.title);
        console.log('Link:', item.link);
        console.log('Snippet:', item.snippet);
        console.log('Pagemap:', JSON.stringify(item.pagemap, null, 2));
      });
    }
  } catch (error) {
    console.error('Error testing Google Custom Search:', error);
  }
}

async function testYouTubeAPI() {
  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', 'javascript tutorial');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '3');

    console.log('\n\nTesting YouTube Data API...');
    console.log('URL:', searchUrl.toString());
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('\n=== YouTube API Response ===');
    console.log('Items found:', data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map(item => item.id.videoId);
      console.log('Video IDs:', videoIds);
      
      // Test video details API
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);
      detailsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      
      const detailsResponse = await fetch(detailsUrl.toString());
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log('\n=== Video Details ===');
        detailsData.items.forEach((video, index) => {
          console.log(`\n--- Video ${index + 1} ---`);
          console.log('Title:', video.snippet.title);
          console.log('View Count:', video.statistics.viewCount);
          console.log('Like Count:', video.statistics.likeCount);
          console.log('Comment Count:', video.statistics.commentCount);
          console.log('Duration:', video.contentDetails.duration);
        });
      }
    }
  } catch (error) {
    console.error('Error testing YouTube API:', error);
  }
}

// Run tests
testGoogleCustomSearch();
testYouTubeAPI();