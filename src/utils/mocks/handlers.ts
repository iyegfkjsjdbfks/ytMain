import { http, HttpResponse, delay } from 'msw';
// import type { Video, Channel, Playlist, Comment } from '../../types';

// Temporary type definitions for mock data
type Video = any;
type Channel = any;
type Playlist = any;
type Comment = any;

// Mock data generators
const generateMockVideo = (id: string, overrides: Partial<Video> = {}): Video => ({
  id,
  title: `Mock Video ${id}`,
  description: `This is a mock video description for video ${id}`,
  thumbnail: `https://picsum.photos/320/180?random=${id}`,
  duration: Math.floor(Math.random() * 3600) + 60, // 1 minute to 1 hour
  views: Math.floor(Math.random() * 1000000),
  likes: Math.floor(Math.random() * 10000),
  dislikes: Math.floor(Math.random() * 1000),
  publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  channelId: `channel-${Math.floor(Math.random() * 100)}`,
  channelTitle: `Mock Channel ${Math.floor(Math.random() * 100)}`,
  channelThumbnail: `https://picsum.photos/88/88?random=channel-${Math.floor(Math.random() * 100)}`,
  tags: [`tag${Math.floor(Math.random() * 10)}`, `tag${Math.floor(Math.random() * 10)}`],
  category: ['Music', 'Gaming', 'Education', 'Entertainment', 'Technology'][Math.floor(Math.random() * 5)],
  isLive: Math.random() > 0.9,
  isShort: Math.random() > 0.7,
  ...overrides,
});

const generateMockChannel = (id: string, overrides: Partial<Channel> = {}): Channel => ({
  id,
  title: `Mock Channel ${id}`,
  description: `This is a mock channel description for channel ${id}`,
  thumbnail: `https://picsum.photos/88/88?random=channel-${id}`,
  banner: `https://picsum.photos/1280/720?random=banner-${id}`,
  subscriberCount: Math.floor(Math.random() * 1000000),
  videoCount: Math.floor(Math.random() * 1000),
  viewCount: Math.floor(Math.random() * 10000000),
  isSubscribed: Math.random() > 0.5,
  publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  country: 'US',
  customUrl: `@mockchannel${id}`,
  ...overrides,
});

const generateMockPlaylist = (id: string, overrides: Partial<Playlist> = {}): Playlist => ({
  id,
  title: `Mock Playlist ${id}`,
  description: `This is a mock playlist description for playlist ${id}`,
  thumbnail: `https://picsum.photos/320/180?random=playlist-${id}`,
  channelId: `channel-${Math.floor(Math.random() * 100)}`,
  channelTitle: `Mock Channel ${Math.floor(Math.random() * 100)}`,
  videoCount: Math.floor(Math.random() * 100) + 1,
  publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  privacy: Math.random() > 0.5 ? 'public' : 'private',
  ...overrides,
});

const generateMockComment = (id: string, overrides: Partial<Comment> = {}): Comment => ({
  id,
  text: `This is a mock comment ${id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  authorDisplayName: `Mock User ${Math.floor(Math.random() * 1000)}`,
  authorProfileImageUrl: `https://picsum.photos/40/40?random=user-${Math.floor(Math.random() * 1000)}`,
  authorChannelId: `channel-${Math.floor(Math.random() * 1000)}`,
  likeCount: Math.floor(Math.random() * 100),
  publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  parentId: Math.random() > 0.8 ? `comment-${Math.floor(Math.random() * 100)}` : undefined,
  totalReplyCount: Math.floor(Math.random() * 10),
  ...overrides,
});

// Generate mock data arrays
const mockVideos = Array.from({ length: 100 }, (_, i) => generateMockVideo(`video-${i + 1}`));
const mockChannels = Array.from({ length: 50 }, (_, i) => generateMockChannel(`channel-${i + 1}`));
const mockPlaylists = Array.from({ length: 30 }, (_, i) => generateMockPlaylist(`playlist-${i + 1}`));
const mockComments = Array.from({ length: 200 }, (_, i) => generateMockComment(`comment-${i + 1}`));

// API response helpers
const createYouTubeAPIResponse = <T>(items: T[], pageInfo?: { totalResults: number; resultsPerPage: number }) => ({
  kind: 'youtube#searchListResponse',
  etag: 'mock-etag',
  nextPageToken: 'mock-next-page-token',
  prevPageToken: 'mock-prev-page-token',
  regionCode: 'US',
  pageInfo: pageInfo || {
    totalResults: items.length,
    resultsPerPage: items.length,
  },
  items,
});

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // Using delay from MSW instead

// Request handlers
export const handlers = [
  // YouTube Data API - Search videos
  http.get('https://www.googleapis.com/youtube/v3/search', async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const maxResults = parseInt(url.searchParams.get('maxResults') || '25', 10);
    const pageToken = url.searchParams.get('pageToken');
    // const type = url.searchParams.get('type') || 'video';
    const order = url.searchParams.get('order') || 'relevance';

    // Simulate API delay
    await delay(Math.random() * 500 + 200);

    let filteredVideos = mockVideos;

    // Filter by search query
    if (q) {
      filteredVideos = mockVideos.filter(video =>
        video.title.toLowerCase().includes(q.toLowerCase()) ||
        video.description.toLowerCase().includes(q.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(q.toLowerCase()),
      );
    }

    // Sort by order
    if (order === 'date') {
      filteredVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (order === 'viewCount') {
      filteredVideos.sort((a, b) => b.views - a.views);
    }

    // Paginate
    const startIndex = pageToken ? parseInt(pageToken, 10) * maxResults : 0;
    const endIndex = startIndex + maxResults;
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

    // Transform to YouTube API format
    const items = paginatedVideos.map(video => ({
      kind: 'youtube#searchResult',
      etag: `mock-etag-${video.id}`,
      id: {
        kind: 'youtube#video',
        videoId: video.id,
      },
      snippet: {
        publishedAt: video.publishedAt,
        channelId: video.channelId,
        title: video.title,
        description: video.description,
        thumbnails: {
          default: { url: video.thumbnail, width: 120, height: 90 },
          medium: { url: video.thumbnail, width: 320, height: 180 },
          high: { url: video.thumbnail, width: 480, height: 360 },
        },
        channelTitle: video.channelTitle,
        liveBroadcastContent: video.isLive ? 'live' : 'none',
      },
    }));

    return HttpResponse.json(createYouTubeAPIResponse(items, {
      totalResults: filteredVideos.length,
      resultsPerPage: maxResults,
    }));
  }),

  // YouTube Data API - Get video details
  http.get('https://www.googleapis.com/youtube/v3/videos', async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    // const part = url.searchParams.get('part') || 'snippet,statistics,contentDetails';

    await delay(Math.random() * 300 + 100);

    if (!id) {
      return HttpResponse.json({ error: { message: 'Missing required parameter: id' } }, { status: 400 });
    }

    const videoIds = id.split(',');
    const videos = videoIds.map(videoId => {
      const video = mockVideos.find(v => v.id === videoId) || generateMockVideo(videoId);

      return {
        kind: 'youtube#video',
        etag: `mock-etag-${video.id}`,
        id: video.id,
        snippet: {
          publishedAt: video.publishedAt,
          channelId: video.channelId,
          title: video.title,
          description: video.description,
          thumbnails: {
            default: { url: video.thumbnail, width: 120, height: 90 },
            medium: { url: video.thumbnail, width: 320, height: 180 },
            high: { url: video.thumbnail, width: 480, height: 360 },
            standard: { url: video.thumbnail, width: 640, height: 480 },
            maxres: { url: video.thumbnail, width: 1280, height: 720 },
          },
          channelTitle: video.channelTitle,
          tags: video.tags,
          categoryId: '10',
          liveBroadcastContent: video.isLive ? 'live' : 'none',
        },
        statistics: {
          viewCount: video.views.toString(),
          likeCount: video.likes.toString(),
          dislikeCount: video.dislikes.toString(),
          favoriteCount: '0',
          commentCount: Math.floor(Math.random() * 1000).toString(),
        },
        contentDetails: {
          duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
          dimension: '2d',
          definition: 'hd',
          caption: 'false',
          licensedContent: true,
          projection: 'rectangular',
        },
      };
    });

    return HttpResponse.json(createYouTubeAPIResponse(videos));
  }),

  // YouTube Data API - Get channel details
  http.get('https://www.googleapis.com/youtube/v3/channels', async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const forUsername = url.searchParams.get('forUsername');

    await delay(Math.random() * 300 + 100);

    if (!id && !forUsername) {
      return HttpResponse.json({ error: { message: 'Missing required parameter: id or forUsername' } }, { status: 400 });
    }

    const channelIds = id ? id.split(',') : [forUsername!];
    const channels = channelIds.map(channelId => {
      const channel = mockChannels.find(c => c.id === channelId) || generateMockChannel(channelId);

      return {
        kind: 'youtube#channel',
        etag: `mock-etag-${channel.id}`,
        id: channel.id,
        snippet: {
          title: channel.title,
          description: channel.description,
          customUrl: channel.customUrl,
          publishedAt: channel.publishedAt,
          thumbnails: {
            default: { url: channel.thumbnail, width: 88, height: 88 },
            medium: { url: channel.thumbnail, width: 240, height: 240 },
            high: { url: channel.thumbnail, width: 800, height: 800 },
          },
          country: channel.country,
        },
        statistics: {
          viewCount: channel.viewCount.toString(),
          subscriberCount: channel.subscriberCount.toString(),
          hiddenSubscriberCount: false,
          videoCount: channel.videoCount.toString(),
        },
        brandingSettings: {
          channel: {
            title: channel.title,
            description: channel.description,
            keywords: 'mock, channel, youtube',
            country: channel.country,
          },
          image: {
            bannerExternalUrl: channel.banner,
          },
        },
      };
    });

    return HttpResponse.json(createYouTubeAPIResponse(channels));
  }),

  // YouTube Data API - Get playlists
  http.get('https://www.googleapis.com/youtube/v3/playlists', async ({ request }) => {
    const url = new URL(request.url);
    const channelId = url.searchParams.get('channelId');
    const id = url.searchParams.get('id');
    const maxResults = parseInt(url.searchParams.get('maxResults') || '25', 10);

    await delay(Math.random() * 300 + 100);

    let filteredPlaylists = mockPlaylists;

    if (channelId) {
      filteredPlaylists = mockPlaylists.filter(playlist => playlist.channelId === channelId);
    }

    if (id) {
      const playlistIds = id.split(',');
      filteredPlaylists = mockPlaylists.filter(playlist => playlistIds.includes(playlist.id));
    }

    const paginatedPlaylists = filteredPlaylists.slice(0, maxResults);

    const items = paginatedPlaylists.map(playlist => ({
      kind: 'youtube#playlist',
      etag: `mock-etag-${playlist.id}`,
      id: playlist.id,
      snippet: {
        publishedAt: playlist.publishedAt,
        channelId: playlist.channelId,
        title: playlist.title,
        description: playlist.description,
        thumbnails: {
          default: { url: playlist.thumbnail, width: 120, height: 90 },
          medium: { url: playlist.thumbnail, width: 320, height: 180 },
          high: { url: playlist.thumbnail, width: 480, height: 360 },
        },
        channelTitle: playlist.channelTitle,
      },
      status: {
        privacyStatus: playlist.privacy,
      },
      contentDetails: {
        itemCount: playlist.videoCount,
      },
    }));

    return HttpResponse.json(createYouTubeAPIResponse(items));
  }),

  // YouTube Data API - Get comments
  http.get('https://www.googleapis.com/youtube/v3/commentThreads', async ({ request }) => {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    const maxResults = parseInt(url.searchParams.get('maxResults') || '20', 10);

    await delay(Math.random() * 400 + 200);

    if (!videoId) {
      return HttpResponse.json({ error: { message: 'Missing required parameter: videoId' } }, { status: 400 });
    }

    const videoComments = mockComments
      .filter(comment => !comment.parentId)
      .slice(0, maxResults);

    const items = videoComments.map(comment => ({
      kind: 'youtube#commentThread',
      etag: `mock-etag-${comment.id}`,
      id: comment.id,
      snippet: {
        videoId,
        topLevelComment: {
          kind: 'youtube#comment',
          etag: `mock-etag-comment-${comment.id}`,
          id: comment.id,
          snippet: {
            authorDisplayName: comment.authorDisplayName,
            authorProfileImageUrl: comment.authorProfileImageUrl,
            authorChannelId: {
              value: comment.authorChannelId,
            },
            textDisplay: comment.text,
            textOriginal: comment.text,
            likeCount: comment.likeCount,
            publishedAt: comment.publishedAt,
            updatedAt: comment.updatedAt,
          },
        },
        canReply: true,
        totalReplyCount: comment.totalReplyCount,
        isPublic: true,
      },
    }));

    return HttpResponse.json(createYouTubeAPIResponse(items));
  }),

  // Gemini AI API - Mock responses
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', async ({ request }) => {
    await delay(Math.random() * 1000 + 500);

    const body = await request.json() as any;
    const prompt = body.contents?.[0]?.parts?.[0]?.text || '';

    // Generate mock AI responses based on prompt keywords
    let mockResponse = 'This is a mock AI response. ';

    if (prompt.toLowerCase().includes('title')) {
      mockResponse = 'Here are some engaging video title suggestions: "10 Amazing Tips", "The Ultimate Guide", "You Won\'t Believe What Happens Next"';
    } else if (prompt.toLowerCase().includes('description')) {
      mockResponse = 'Here\'s a compelling video description: This video covers essential topics that will help you understand the subject better. Don\'t forget to like and subscribe!';
    } else if (prompt.toLowerCase().includes('tags')) {
      mockResponse = 'Suggested tags: tutorial, howto, tips, guide, educational, trending, viral, youtube';
    } else if (prompt.toLowerCase().includes('thumbnail')) {
      mockResponse = 'For an effective thumbnail, use bright colors, clear text, and an expressive face. Make sure the text is readable even at small sizes.';
    } else {
      mockResponse = 'I\'m a mock AI assistant. I can help you with content creation, optimization, and analysis for your YouTube videos.';
    }

    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: mockResponse,
              },
            ],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
          safetyRatings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              probability: 'NEGLIGIBLE',
            },
          ],
        },
      ],
      promptFeedback: {
        safetyRatings: [
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            probability: 'NEGLIGIBLE',
          },
        ],
      },
    });
  }),

  // Error simulation handlers
  http.get('https://www.googleapis.com/youtube/v3/error-test', () => {
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
      { status: 403 },
    );
  }),

  // Network error simulation
  http.get('https://www.googleapis.com/youtube/v3/network-error', () => {
    return HttpResponse.error();
  }),
];