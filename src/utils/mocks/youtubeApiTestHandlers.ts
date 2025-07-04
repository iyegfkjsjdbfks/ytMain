import { http, HttpResponse, delay } from 'msw';

/**
 * Enhanced MSW handlers specifically for testing YouTube API scenarios
 * Including error conditions, rate limiting, and graceful fallbacks
 */

export const youtubeApiTestHandlers = [
  // YouTube Data API - Videos endpoint with error scenarios
  http.get('https://www.googleapis.com/youtube/v3/videos', async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const testMode = url.searchParams.get('test-mode');

    // Simulate network delay
    await delay(100 + Math.random() * 300);

    // Test different error scenarios based on test-mode parameter
    switch (testMode) {
      case 'quota-exceeded':
        return HttpResponse.json(
          {
            error: {
              code: 403,
              message: 'The request cannot be completed because you have exceeded your quota.',
              errors: [
                {
                  message: 'The request cannot be completed because you have exceeded your quota.',
                  domain: 'youtube.quota',
                  reason: 'quotaExceeded',
                },
              ],
            },
          },
          { status: 403 }
        );

      case 'api-key-invalid':
        return HttpResponse.json(
          {
            error: {
              code: 400,
              message: 'API key not valid. Please pass a valid API key.',
              errors: [
                {
                  message: 'API key not valid. Please pass a valid API key.',
                  domain: 'global',
                  reason: 'badRequest',
                },
              ],
            },
          },
          { status: 400 }
        );

      case 'video-not-found':
        return HttpResponse.json({
          kind: 'youtube#videoListResponse',
          etag: 'mock-etag',
          items: [],
          pageInfo: {
            totalResults: 0,
            resultsPerPage: 0,
          },
        });

      case 'network-error':
        return HttpResponse.error();

      case 'slow-response':
        await delay(5000); // 5 second delay
        break;

      case 'partial-data':
        return HttpResponse.json({
          kind: 'youtube#videoListResponse',
          etag: 'mock-etag',
          items: [
            {
              id: id?.split(',')[0] || 'test-video',
              snippet: {
                title: 'Partial Data Video',
                description: 'Video with missing statistics',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb.jpg' },
                },
                publishedAt: '2023-01-01T00:00:00Z',
                channelId: 'test-channel',
                channelTitle: 'Test Channel',
                categoryId: '10',
              },
              // Missing statistics and contentDetails
            },
          ],
        });

      default:
        // Normal successful response
        const videoIds = id ? id.split(',') : ['default-video'];
        const items = videoIds.map((videoId) => ({
          kind: 'youtube#video',
          etag: `mock-etag-${videoId}`,
          id: videoId,
          snippet: {
            publishedAt: '2023-01-01T00:00:00Z',
            channelId: 'test-channel',
            title: `Mock Video ${videoId}`,
            description: `Mock description for video ${videoId}`,
            thumbnails: {
              default: { url: `https://example.com/${videoId}_default.jpg`, width: 120, height: 90 },
              medium: { url: `https://example.com/${videoId}_medium.jpg`, width: 320, height: 180 },
              high: { url: `https://example.com/${videoId}_high.jpg`, width: 480, height: 360 },
            },
            channelTitle: 'Mock Channel',
            tags: ['test', 'mock', videoId],
            categoryId: '10',
            liveBroadcastContent: 'none',
          },
          statistics: {
            viewCount: Math.floor(Math.random() * 1000000).toString(),
            likeCount: Math.floor(Math.random() * 10000).toString(),
            dislikeCount: Math.floor(Math.random() * 1000).toString(),
            favoriteCount: '0',
            commentCount: Math.floor(Math.random() * 5000).toString(),
          },
          contentDetails: {
            duration: 'PT5M30S',
            dimension: '2d',
            definition: 'hd',
            caption: 'false',
            licensedContent: true,
            projection: 'rectangular',
          },
        }));

        return HttpResponse.json({
          kind: 'youtube#videoListResponse',
          etag: 'mock-etag',
          items,
          pageInfo: {
            totalResults: items.length,
            resultsPerPage: items.length,
          },
        });

      default:
        // Default case - return empty response
        return HttpResponse.json({
          kind: 'youtube#videoListResponse',
          etag: 'mock-etag',
          items: [],
          pageInfo: {
            totalResults: 0,
            resultsPerPage: 0,
          },
        });
    }
  }),

  // YouTube Data API - Channels endpoint with error scenarios
  http.get('https://www.googleapis.com/youtube/v3/channels', async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const testMode = url.searchParams.get('test-mode');

    await delay(100 + Math.random() * 200);

    switch (testMode) {
      case 'channel-not-found':
        return HttpResponse.json({
          kind: 'youtube#channelListResponse',
          etag: 'mock-etag',
          items: [],
          pageInfo: {
            totalResults: 0,
            resultsPerPage: 0,
          },
        });

      case 'rate-limited':
        return HttpResponse.json(
          {
            error: {
              code: 429,
              message: 'Too Many Requests',
              errors: [
                {
                  message: 'Too Many Requests',
                  domain: 'global',
                  reason: 'rateLimitExceeded',
                },
              ],
            },
          },
          { status: 429 }
        );

      default:
        const channelIds = id ? id.split(',') : ['default-channel'];
        const items = channelIds.map((channelId) => ({
          kind: 'youtube#channel',
          etag: `mock-etag-${channelId}`,
          id: channelId,
          snippet: {
            title: `Mock Channel ${channelId}`,
            description: `Mock description for channel ${channelId}`,
            customUrl: `@mockchannel${channelId}`,
            publishedAt: '2020-01-01T00:00:00Z',
            thumbnails: {
              default: { url: `https://example.com/channel_${channelId}_default.jpg`, width: 88, height: 88 },
              medium: { url: `https://example.com/channel_${channelId}_medium.jpg`, width: 240, height: 240 },
              high: { url: `https://example.com/channel_${channelId}_high.jpg`, width: 800, height: 800 },
            },
            country: 'US',
          },
          statistics: {
            viewCount: Math.floor(Math.random() * 10000000).toString(),
            subscriberCount: Math.floor(Math.random() * 1000000).toString(),
            hiddenSubscriberCount: false,
            videoCount: Math.floor(Math.random() * 1000).toString(),
          },
        }));

        return HttpResponse.json({
          kind: 'youtube#channelListResponse',
          etag: 'mock-etag',
          items,
          pageInfo: {
            totalResults: items.length,
            resultsPerPage: items.length,
          },
        });
    }
  }),

  // YouTube Data API - Search endpoint with error scenarios
  http.get('https://www.googleapis.com/youtube/v3/search', async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const testMode = url.searchParams.get('test-mode');
    const maxResults = parseInt(url.searchParams.get('maxResults') || '25', 10);

    await delay(200 + Math.random() * 300);

    switch (testMode) {
      case 'no-results':
        return HttpResponse.json({
          kind: 'youtube#searchListResponse',
          etag: 'mock-etag',
          items: [],
          pageInfo: {
            totalResults: 0,
            resultsPerPage: 0,
          },
        });

      case 'forbidden':
        return HttpResponse.json(
          {
            error: {
              code: 403,
              message: 'Forbidden',
              errors: [
                {
                  message: 'Forbidden',
                  domain: 'youtube',
                  reason: 'forbidden',
                },
              ],
            },
          },
          { status: 403 }
        );

      case 'timeout':
        await delay(10000); // 10 second timeout
        return HttpResponse.error();

      default:
        // Generate mock search results
        const mockResults = Array.from({ length: Math.min(maxResults, 10) }, (_, i) => ({
          kind: 'youtube#searchResult',
          etag: `mock-search-etag-${i}`,
          id: {
            kind: 'youtube#video',
            videoId: `search-result-${q}-${i}`,
          },
          snippet: {
            publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            channelId: `search-channel-${i}`,
            title: `Search Result ${i + 1} for "${q}"`,
            description: `Mock search result description for query "${q}"`,
            thumbnails: {
              default: { url: `https://example.com/search_${i}_default.jpg`, width: 120, height: 90 },
              medium: { url: `https://example.com/search_${i}_medium.jpg`, width: 320, height: 180 },
              high: { url: `https://example.com/search_${i}_high.jpg`, width: 480, height: 360 },
            },
            channelTitle: `Search Channel ${i + 1}`,
            liveBroadcastContent: 'none',
          },
        }));

        return HttpResponse.json({
          kind: 'youtube#searchListResponse',
          etag: 'mock-etag',
          nextPageToken: 'mock-next-page-token',
          regionCode: 'US',
          pageInfo: {
            totalResults: mockResults.length,
            resultsPerPage: mockResults.length,
          },
          items: mockResults,
        });
    }
  }),

  // Test handler for checking API health
  http.get('https://www.googleapis.com/youtube/v3/status', async ({ request }) => {
    const url = new URL(request.url);
    const testMode = url.searchParams.get('test-mode');

    switch (testMode) {
      case 'api-down':
        return HttpResponse.json(
          {
            error: {
              code: 503,
              message: 'Service Temporarily Unavailable',
            },
          },
          { status: 503 }
        );

      default:
        return HttpResponse.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        });
    }
  }),
];

// Helper function to create test URLs with specific error modes
export const createTestUrl = (baseUrl: string, testMode?: string, additionalParams?: Record<string, string>) => {
  const url = new URL(baseUrl);
  
  if (testMode) {
    url.searchParams.set('test-mode', testMode);
  }
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Test scenarios for different error conditions
export const testScenarios = {
  // Video API scenarios
  video: {
    quotaExceeded: (videoIds: string[]) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/videos', 'quota-exceeded', { 
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
    
    invalidApiKey: (videoIds: string[]) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/videos', 'api-key-invalid', { 
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
    
    videoNotFound: (videoIds: string[]) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/videos', 'video-not-found', { 
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
    
    networkError: (videoIds: string[]) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/videos', 'network-error', { 
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
    
    partialData: (videoIds: string[]) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/videos', 'partial-data', { 
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
  },

  // Channel API scenarios
  channel: {
    channelNotFound: (channelId: string) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/channels', 'channel-not-found', { 
        id: channelId,
        part: 'snippet,statistics'
      }),
    
    rateLimited: (channelId: string) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/channels', 'rate-limited', { 
        id: channelId,
        part: 'snippet,statistics'
      }),
  },

  // Search API scenarios
  search: {
    noResults: (query: string) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/search', 'no-results', { 
        q: query,
        part: 'snippet',
        type: 'video'
      }),
    
    forbidden: (query: string) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/search', 'forbidden', { 
        q: query,
        part: 'snippet',
        type: 'video'
      }),
    
    timeout: (query: string) => 
      createTestUrl('https://www.googleapis.com/youtube/v3/search', 'timeout', { 
        q: query,
        part: 'snippet',
        type: 'video'
      }),
  },
};

export default youtubeApiTestHandlers;
