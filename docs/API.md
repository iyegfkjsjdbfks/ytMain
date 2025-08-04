# API Documentation

Comprehensive API documentation for the YouTubeX Studio Clone application, covering both internal services and external API integrations.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base Configuration](#base-configuration)
- [Error Handling](#error-handling)
- [YouTube Data API Integration](#youtube-data-api-integration)
- [Google Gemini AI Integration](#google-gemini-ai-integration)
- [Internal Services](#internal-services)
- [Data Models](#data-models)
- [Usage Examples](#usage-examples)
- [Rate Limiting](#rate-limiting)
- [Caching Strategy](#caching-strategy)

## Overview

The YouTubeX application integrates with multiple APIs and provides internal services for:

- **YouTube Data API v3**: Video data, channel information, playlists
- **Google Gemini AI**: Content enhancement and AI-powered features  
- **Unified Data Service**: Consolidated data access layer
- **Live Streaming API**: Real-time streaming capabilities
- **Metadata Normalization**: Consistent data formatting

## Authentication

### YouTube OAuth 2.0

The application uses YouTube's OAuth 2.0 for authenticated requests:

#### Authorization Flow

1. **Redirect to YouTube OAuth**
   ```
   GET https://accounts.google.com/o/oauth2/v2/auth
   ```
   
   Parameters:
   - `client_id`: Your YouTube API client ID
   - `redirect_uri`: Application callback URL
   - `scope`: `https://www.googleapis.com/auth/youtube`
   - `response_type`: `code`
   - `access_type`: `offline`

2. **Exchange Code for Token**
   ```
   POST https://oauth2.googleapis.com/token
   ```
   
   Body:
   ```json
   {
     "client_id": "your_client_id",
     "client_secret": "your_client_secret", 
     "code": "authorization_code",
     "grant_type": "authorization_code",
     "redirect_uri": "your_redirect_uri"
   }
   ```

### API Key Authentication

For public data access:

```typescript
// Environment variable
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Usage in requests
const response = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&...`
);
```

### Google Gemini AI Authentication

```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

## Base Configuration

### API URLs
```typescript
// External APIs
const GOOGLE_API_URL = 'https://www.googleapis.com/youtube/v3';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Application configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Request Configuration
```typescript
interface RequestConfig extends RequestInit {
  timeout?: number;        // Request timeout (default: 30000ms)
  retries?: number;        // Retry attempts (default: 3)
  retryDelay?: number;     // Delay between retries (default: 1000ms)
}

// Default configuration
const API_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;
```

## Error Handling

### Error Classes
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}
```

### Error Response Format
```json
{
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": {
      "field": "videoId",
      "issue": "Video ID is required"
    },
    "timestamp": "2024-12-04T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (Invalid API key)
- `403` - Forbidden (Quota exceeded)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## YouTube Data API Integration

### Video Service

The `youtubeService` provides access to YouTube Data API v3:

```typescript
import { youtubeService } from '../services/api/youtubeService';

// Get trending videos
const trendingVideos = await youtubeService.getTrendingVideos({
  limit: 50,
  category: 'music'
});

// Search videos
const searchResults = await youtubeService.searchVideos({
  query: 'javascript tutorial',
  limit: 25,
  type: 'video'
});

// Get video details
const videoDetails = await youtubeService.getVideoDetails('dQw4w9WgXcQ');

// Get channel information
const channelInfo = await youtubeService.getChannelInfo('UCdBK94X6GiZhWYxr8XnQ_YQ');
```

### Available Methods

#### Videos
```typescript
interface YoutubeService {
  // Get trending videos
  getTrendingVideos(options?: {
    limit?: number;
    category?: string;
    regionCode?: string;
  }): Promise<Video[]>;

  // Search videos
  searchVideos(options: {
    query: string;
    limit?: number;
    type?: 'video' | 'channel' | 'playlist';
    order?: 'relevance' | 'date' | 'rating' | 'viewCount';
  }): Promise<Video[]>;

  // Get video details
  getVideoDetails(videoId: string): Promise<Video>;

  // Get multiple videos
  getVideosByIds(videoIds: string[]): Promise<Video[]>;

  // Get related videos
  getRelatedVideos(videoId: string): Promise<Video[]>;
}
```

#### Channels
```typescript
interface ChannelService {
  // Get channel information
  getChannelInfo(channelId: string): Promise<Channel>;

  // Get channel videos
  getChannelVideos(channelId: string, options?: {
    limit?: number;
    order?: 'date' | 'title' | 'viewCount';
  }): Promise<Video[]>;

  // Get channel playlists
  getChannelPlaylists(channelId: string): Promise<Playlist[]>;
}
```

### Response Data Models

#### Video Model
```typescript
interface Video {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    medium: { url: string };
    high?: { url: string };
  };
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  category: string;
  isLive?: boolean;
}
```

#### Channel Model
```typescript
interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    medium: { url: string };
    high?: { url: string };
  };
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  customUrl?: string;
  country?: string;
}
```

## Google Gemini AI Integration

### AI Content Service

```typescript
import { geminiService } from '../services/geminiService';

// Generate content suggestions
const suggestions = await geminiService.generateContentSuggestions({
  topic: 'web development',
  type: 'video',
  targetAudience: 'beginners'
});

// Enhance video metadata
const enhancedMetadata = await geminiService.enhanceVideoMetadata({
  title: 'My Video',
  description: 'Basic description',
  tags: ['coding']
});
```

### Available AI Features

#### Content Generation
```typescript
interface GeminiService {
  // Generate title suggestions
  generateTitles(options: {
    topic: string;
    style: 'engaging' | 'educational' | 'entertaining';
    count?: number;
  }): Promise<string[]>;

  // Generate descriptions
  generateDescription(options: {
    title: string;
    keywords: string[];
    length: 'short' | 'medium' | 'long';
  }): Promise<string>;

  // Generate tags
  generateTags(options: {
    title: string;
    description: string;
    category: string;
  }): Promise<string[]>;

  // Content analysis
  analyzeContent(content: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    readabilityScore: number;
  }>;
}
```

## Internal Services

### Unified Data Service

Provides a consolidated interface for accessing data from multiple sources:

```typescript
import { unifiedDataService } from '../services/unifiedDataService';

// Get videos from multiple sources
const videos = await unifiedDataService.getVideos({
  sources: {
    local: true,
    youtube: true
  },
  limits: {
    local: 10,
    youtube: 40,
    total: 50
  },
  caching: {
    enabled: true,
    ttl: 300000 // 5 minutes
  }
});
```

### Live Streaming Service

Handles live streaming functionality:

```typescript
import { liveStreamService } from '../services/liveStreamService';

// Start a live stream
const stream = await liveStreamService.startStream({
  title: 'My Live Stream',
  description: 'Live coding session',
  privacy: 'public'
});

// Get stream status
const status = await liveStreamService.getStreamStatus(streamId);

// End stream
await liveStreamService.endStream(streamId);
```

### Metadata Normalization Service

Ensures consistent data formatting across different sources:

```typescript
import { metadataNormalizationService } from '../services/metadataNormalizationService';

// Normalize video metadata
const normalizedVideo = metadataNormalizationService.normalizeVideoMetadata(rawVideoData);

// Normalize channel metadata
const normalizedChannel = metadataNormalizationService.normalizeChannelMetadata(rawChannelData);
```

## Rate Limiting

### YouTube Data API Limits

- **Daily Quota**: 10,000 units per day
- **Queries per 100 seconds**: 100
- **Queries per 100 seconds per user**: 100

### Common Operations Cost
- Search: 100 units
- Video details: 1 unit per video
- Channel details: 1 unit
- Playlist items: 1 unit

### Application Rate Limiting

```typescript
// Built-in rate limiting
const rateLimiter = {
  youtube: {
    requests: 100,
    window: 100000, // 100 seconds
    perUser: 100
  },
  gemini: {
    requests: 60,
    window: 60000, // 1 minute
    perUser: 20
  }
};
```

## Caching Strategy

### Cache Configuration

```typescript
export const CACHE_CONFIG = {
  // Video data caching
  VIDEOS: {
    TTL: 15 * 60 * 1000, // 15 minutes
    MAX_SIZE: 1000
  },
  
  // Channel data caching
  CHANNELS: {
    TTL: 60 * 60 * 1000, // 1 hour
    MAX_SIZE: 500
  },
  
  // Search results caching
  SEARCH: {
    TTL: 10 * 60 * 1000, // 10 minutes
    MAX_SIZE: 200
  }
};
```

### Cache Implementation

```typescript
// Automatic caching with TanStack Query
const { data: videos, isLoading } = useQuery({
  queryKey: ['videos', 'trending'],
  queryFn: () => youtubeService.getTrendingVideos(),
  staleTime: CACHE_CONFIG.VIDEOS.TTL,
  cacheTime: CACHE_CONFIG.VIDEOS.TTL * 2
});
```

## Usage Examples

### Complete Video Fetching Example

```typescript
import { youtubeService } from '../services/api/youtubeService';
import { unifiedDataService } from '../services/unifiedDataService';

// Function to get comprehensive video data
async function getVideoData(videoId: string) {
  try {
    // Get basic video details
    const video = await youtubeService.getVideoDetails(videoId);
    
    // Get related videos
    const relatedVideos = await youtubeService.getRelatedVideos(videoId);
    
    // Get channel information
    const channel = await youtubeService.getChannelInfo(video.channelId);
    
    // Normalize all data
    const normalizedData = unifiedDataService.normalizeVideoData({
      video,
      relatedVideos,
      channel
    });
    
    return normalizedData;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.status, error.message);
      // Handle API-specific errors
    } else if (error instanceof NetworkError) {
      console.error('Network Error:', error.message);
      // Handle network issues
    } else {
      console.error('Unexpected Error:', error);
      // Handle other errors
    }
    throw error;
  }
}
```

### Search with Pagination

```typescript
async function searchVideosWithPagination(query: string, page: number = 1) {
  const limit = 25;
  const offset = (page - 1) * limit;
  
  const results = await youtubeService.searchVideos({
    query,
    limit,
    offset,
    order: 'relevance'
  });
  
  return {
    videos: results,
    pagination: {
      page,
      limit,
      hasNext: results.length === limit,
      total: results.length > 0 ? 'unknown' : 0
    }
  };
}
```

### Error Handling with Retry

```typescript
async function robustApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
  }
  
  throw lastError!;
}
```

## Data Models

### Core Types

```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}

// Pagination information
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Unified video metadata
interface UnifiedVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channel: {
    id: string;
    title: string;
    thumbnails: ThumbnailSet;
  };
  tags: string[];
  category: string;
  language?: string;
  isLive: boolean;
  source: 'youtube' | 'local' | 'external';
}

// Thumbnail set
interface ThumbnailSet {
  default?: { url: string; width?: number; height?: number };
  medium?: { url: string; width?: number; height?: number };
  high?: { url: string; width?: number; height?: number };
  maxres?: { url: string; width?: number; height?: number };
}
```

---

*For additional API information and updates, refer to the [YouTube Data API v3 documentation](https://developers.google.com/youtube/v3) and [Google Gemini AI documentation](https://ai.google.dev/docs).*