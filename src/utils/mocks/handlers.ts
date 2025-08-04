import { http, HttpResponse } from 'msw';


const mockYouTubeVideoResponse = {
  items: [
    {
      id: 'test-video-1',
      snippet: {
        title: 'Test Video 1',
        description: 'Test description 1',
        thumbnails: {
          medium: { url: 'https://example.com/thumb1.jpg' },
          high: { url: 'https://example.com/thumb1_hq.jpg' },
        },
        publishedAt: '2023-01-01T00:00:00Z',
        channelId: 'test-channel-1',
        channelTitle: 'Test Channel 1',
        tags: ['test', 'video'],
        categoryId: '10',
      },
      statistics: {
        viewCount: '1000',
        likeCount: '100',
        dislikeCount: '5',
        commentCount: '20',
      },
      contentDetails: {
        duration: 'PT5M30S',
        dimension: '2d',
        definition: 'hd',
        caption: 'false',
      },
    },
  ],
};

const mockYouTubeChannelResponse = {
  items: [
    {
      id: 'test-channel-1',
      snippet: {
        title: 'Test Channel 1',
        description: 'Test channel description',
        thumbnails: {
          medium: { url: 'https://example.com/channel1.jpg' },
          high: { url: 'https://example.com/channel1_hq.jpg' },
        },
        publishedAt: '2020-01-01T00:00:00Z',
        customUrl: '@testchannel1',
        country: 'US',
      },
      statistics: {
        subscriberCount: '10000',
        videoCount: '50',
        viewCount: '500000',
      },
    },
  ],
};

export const handlers = [
  http.get('https://www.googleapis.com/youtube/v3/videos', () => {
    return HttpResponse.json(mockYouTubeVideoResponse);
  }),

  http.get('https://www.googleapis.com/youtube/v3/search', () => {
    return HttpResponse.json({
      items: [
        {
          id: { videoId: 'test-video-1' },
          snippet: { title: 'Test Search Result' },
        },
      ],
    });
  }),

  http.get('https://www.googleapis.com/youtube/v3/channels', () => {
    return HttpResponse.json(mockYouTubeChannelResponse);
  }),

  http.get('/api/videos', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/videos/:id', () => {
    return HttpResponse.json(null);
  }),

  http.get('/api/channels/:id', () => {
    return HttpResponse.json(null);
  }),
];
