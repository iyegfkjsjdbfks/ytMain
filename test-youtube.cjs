const { youtubeService } = require('./src/services/api/youtubeService.ts');

async function testYouTubeService() {
  console.log('Testing YouTube service...');
  
  const testVideoId = 'YQHsXMglC9A';
  
  try {
    console.log(`Fetching video: ${testVideoId}`);
    const videos = await youtubeService.fetchVideos([testVideoId]);
    
    if (videos.length > 0) {
      console.log('✅ Successfully fetched video:', {
        id: videos[0].id,
        title: videos[0].title,
        channelTitle: videos[0].snippet.channelTitle,
        viewCount: videos[0].statistics?.viewCount,
        duration: videos[0].contentDetails?.duration
      });
    } else {
      console.log('❌ No videos returned');
    }
  } catch (error) {
    console.error('❌ Error fetching video:', error.message);
  }
}

testYouTubeService();
