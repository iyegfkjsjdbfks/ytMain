#!/usr/bin/env node

// Quick test script to verify the Google Custom Search fallback mechanism
import { fetchSingleVideoFromGoogleSearch } from './services/googleSearchService.js';

async function testGoogleCustomSearchFallback() {
  console.log('🧪 Testing Google Custom Search video fallback...');
  
  const testVideoId = 'bnVUHWCynig'; // The video ID from the user's URL
  
  try {
    console.log(`\n🔍 Testing with video ID: ${testVideoId}`);
    const result = await fetchSingleVideoFromGoogleSearch(testVideoId);
    
    if (result) {
      console.log('\n✅ SUCCESS! Video found via Google Custom Search:');
      console.log(`  Title: ${result.title}`);
      console.log(`  Channel: ${result.channelName}`);
      console.log(`  Video URL: ${result.videoUrl}`);
      console.log(`  ID: ${result.id}`);
      console.log(`  Description: ${result.description?.substring(0, 100)}...`);
    } else {
      console.log('\n❌ FAILED: No video found');
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
  }
}

testGoogleCustomSearchFallback();
