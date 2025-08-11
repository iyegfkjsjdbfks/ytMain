/// <reference types="react/jsx-runtime" />
import { useState, useEffect, type FC } from 'react';
import React from 'react';
import { fetchSingleVideoFromGoogleSearch } from '../../services/googleSearchService';
import { googleSearchVideoStore } from '../../services/googleSearchVideoStore';
import { logger } from '../utils/logger';

const GoogleSearchStoreDebug: FC = () => {
  const [storeVideos, setStoreVideos] = useState<any[]>([]);
  const [testVideoId, setTestVideoId] = useState('bnVUHWCynig');
  const [unifiedServiceTest, setUnifiedServiceTest] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load videos from store
    const videos = googleSearchVideoStore.getAllVideos();
    setStoreVideos(videos);
  }, []);

  const handleTestFetch = async () => {
    setLoading(true);
    try {
      logger.debug(`🧪 Testing fetch for video ID: ${testVideoId}`);

      // Check environment variables first
      const searchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
      const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
      logger.debug('🔑 API Key available:', !!searchApiKey);
      logger.debug('🔍 Search Engine ID available:', !!searchEngineId);

      if (!searchApiKey || !searchEngineId) {
        setTestResult({
          error: 'Google Custom Search API not configured',
          details: {
            apiKey: !!searchApiKey,
            engineId: !!searchEngineId,
          },
        });
        return;
      }

      const result = await fetchSingleVideoFromGoogleSearch(testVideoId);
      setTestResult(result);

      // Refresh store videos
      const videos = googleSearchVideoStore.getAllVideos();
      setStoreVideos(videos);
    } catch (error) {
      logger.error('Test fetch error:', error);
      setTestResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearStore = () => {
    googleSearchVideoStore.clear();
    setStoreVideos([]);
  };

  const handleTestUnifiedService = async () => {
    setLoading(true);
    try {
      logger.debug(
        `🧪 Testing unified service for video ID: google-search-${testVideoId}`
      );

      // Import unified data service
      const { unifiedDataService } = await import(
        '../services/unifiedDataService'
      );

      // Clear cache first
      unifiedDataService.clearCache(`video:google-search-${testVideoId}`);

      // Test the unified service
      const result = await unifiedDataService.getVideoById(
        `google-search-${testVideoId}`
      );
      setUnifiedServiceTest(result);

      logger.debug('🧪 Unified service result:', result);
    } catch (error) {
      logger.error('Unified service test error:', error);
      setUnifiedServiceTest({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Google Search Store Debug</h1>

      {/* API Configuration Check */}
      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6'>
        <h2 className='text-lg font-semibold mb-2'>API Configuration</h2>
        <div className='space-y-1 text-sm'>
          <div>
            Google Search API Key:{' '}
            {import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
              ? '✅ Set'
              : '❌ Missing'}
          </div>
          <div>
            Google Search Engine ID:{' '}
            {import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
              ? '✅ Set'
              : '❌ Missing'}
          </div>
          <div>
            YouTube API Key:{' '}
            {import.meta.env.VITE_YOUTUBE_API_KEY ? '✅ Set' : '❌ Missing'}
          </div>
        </div>
      </div>

      {/* Store Statistics */}
      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Store Statistics</h2>
        <p>Videos in store: {storeVideos.length}</p>
        <button
          onClick={handleClearStore}
          className='mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
        >
          Clear Store
        </button>
      </div>

      {/* Test Video Fetch */}
      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Test Video Fetch</h2>
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            value={testVideoId}
            onChange={e => setTestVideoId(e.target.value)}
            placeholder='YouTube Video ID'
            className='flex-1 px-3 py-2 border rounded'
          />
          <button
            onClick={handleTestFetch}
            disabled={loading}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
          >
            {loading ? 'Testing...' : 'Test Direct Fetch'}
          </button>
          <button
            onClick={handleTestUnifiedService}
            disabled={loading}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2'
          >
            {loading ? 'Testing...' : 'Test Unified Service'}
          </button>
        </div>

        {testResult && (
          <div className='mt-4 p-3 bg-white dark:bg-gray-700 rounded'>
            <h3 className='font-semibold mb-2'>Direct Fetch Result:</h3>
            <pre className='text-sm overflow-auto'>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {unifiedServiceTest && (
          <div className='mt-4 p-3 bg-white dark:bg-gray-700 rounded'>
            <h3 className='font-semibold mb-2'>Unified Service Result:</h3>
            <pre className='text-sm overflow-auto'>
              {JSON.stringify(unifiedServiceTest, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Store Contents */}
      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
        <h2 className='text-lg font-semibold mb-4'>Videos in Store</h2>
        {storeVideos.length === 0 ? (
          <p className='text-gray-500'>No videos in store</p>
        ) : (
          <div className='space-y-3'>
            {storeVideos.map((video, index) => (
              <div
                key={index}
                className='bg-white dark:bg-gray-700 p-3 rounded'
              >
                <div className='font-medium'>{video.title}</div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  ID: {video.id}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Channel: {video.channelName}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  URL: {video.videoUrl}
                </div>
                {video.viewCount && (
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Views: {video.viewCount.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSearchStoreDebug;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
