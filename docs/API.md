# API Documentation

This document provides comprehensive information about the YouTube Studio Clone API endpoints, authentication, and integration patterns.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [YouTube Data API Integration](#youtube-data-api-integration)
- [Gemini AI Integration](#gemini-ai-integration)
- [Endpoints](#endpoints)
- [WebSocket Events](#websocket-events)
- [SDK Usage](#sdk-usage)

## Authentication

### YouTube OAuth 2.0

The application uses YouTube's OAuth 2.0 for user authentication and API access.

#### Authorization Flow

1. **Redirect to YouTube OAuth**
   ```
   GET https://accounts.google.com/o/oauth2/v2/auth
   ```
   
   Parameters:
   - `client_id`: Your YouTube API client ID
   - `redirect_uri`: Callback URL
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

3. **Use Access Token**
   ```
   Authorization: Bearer {access_token}
   ```

### API Key Authentication

For public data access, use API key authentication:

```
GET /api/videos?key={api_key}
```

## Base URL

- **Production**: `https://ytastudio.vercel.app/api`
- **Development**: `http://localhost:5173/api`

## Rate Limiting

### YouTube Data API Limits

- **Quota**: 10,000 units per day
- **Queries per 100 seconds**: 100
- **Queries per 100 seconds per user**: 100

### Application Rate Limits

- **General API**: 1000 requests per hour per IP
- **Upload API**: 10 uploads per hour per user
- **Analytics API**: 100 requests per hour per user

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": {
      "field": "title",
      "issue": "Title cannot be empty"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Types

#### Authentication Errors
```json
{
  "error": {
    "code": 401,
    "message": "Invalid or expired access token",
    "type": "AUTHENTICATION_ERROR"
  }
}
```

#### Validation Errors
```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

#### Rate Limit Errors
```json
{
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "type": "RATE_LIMIT_ERROR",
    "retryAfter": 3600
  }
}
```

## YouTube Data API Integration

### Quota Management

The application implements intelligent quota management:

- **Caching**: Aggressive caching to reduce API calls
- **Batching**: Batch multiple requests when possible
- **Prioritization**: Critical operations get priority
- **Fallback**: Graceful degradation when quota is exceeded

### Supported Operations

#### Videos
- List videos
- Get video details
- Update video metadata
- Delete videos
- Get video statistics

#### Channels
- Get channel information
- Update channel metadata
- Get channel statistics
- Manage channel sections

#### Playlists
- Create playlists
- Update playlists
- Add/remove videos
- Reorder playlist items

#### Comments
- List comments
- Reply to comments
- Moderate comments
- Get comment threads

#### Live Streaming
- Create live broadcasts
- Start/stop streaming
- Get stream health
- Manage chat messages

## Gemini AI Integration

### Content Analysis

#### Analyze Video Content
```
POST /api/ai/analyze-video
```

Request:
```json
{
  "videoId": "abc123",
  "analysisType": "content",
  "options": {
    "includeThumbnails": true,
    "includeTranscript": true
  }
}
```

Response:
```json
{
  "analysis": {
    "contentType": "educational",
    "topics": ["technology", "programming", "tutorial"],
    "sentiment": "positive",
    "complexity": "intermediate",
    "suggestions": {
      "title": "Learn React Hooks in 10 Minutes - Complete Tutorial",
      "description": "Master React Hooks with this comprehensive tutorial...",
      "tags": ["react", "hooks", "tutorial", "javascript"]
    }
  }
}
```

#### Generate Thumbnails
```
POST /api/ai/generate-thumbnail
```

Request:
```json
{
  "videoId": "abc123",
  "style": "modern",
  "includeText": true,
  "colorScheme": "vibrant"
}
```

Response:
```json
{
  "thumbnails": [
    {
      "url": "https://example.com/thumb1.jpg",
      "style": "modern",
      "confidence": 0.95
    }
  ]
}
```

## Endpoints

### Videos

#### List Videos
```
GET /api/videos
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `sort` (string): Sort order (`created`, `updated`, `views`, `likes`)
- `order` (string): Sort direction (`asc`, `desc`)
- `status` (string): Video status (`public`, `private`, `unlisted`)
- `search` (string): Search query

Response:
```json
{
  "videos": [
    {
      "id": "abc123",
      "title": "My Video Title",
      "description": "Video description",
      "thumbnails": {
        "default": "https://example.com/thumb.jpg",
        "medium": "https://example.com/thumb_medium.jpg",
        "high": "https://example.com/thumb_high.jpg"
      },
      "status": "public",
      "duration": "PT10M30S",
      "publishedAt": "2024-01-15T10:30:00Z",
      "statistics": {
        "viewCount": 1000,
        "likeCount": 50,
        "commentCount": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get Video Details
```
GET /api/videos/{videoId}
```

Response:
```json
{
  "id": "abc123",
  "title": "My Video Title",
  "description": "Detailed video description",
  "thumbnails": {
    "default": "https://example.com/thumb.jpg",
    "medium": "https://example.com/thumb_medium.jpg",
    "high": "https://example.com/thumb_high.jpg"
  },
  "status": "public",
  "duration": "PT10M30S",
  "publishedAt": "2024-01-15T10:30:00Z",
  "statistics": {
    "viewCount": 1000,
    "likeCount": 50,
    "dislikeCount": 2,
    "commentCount": 10,
    "favoriteCount": 5
  },
  "contentDetails": {
    "duration": "PT10M30S",
    "dimension": "2d",
    "definition": "hd",
    "caption": "false",
    "licensedContent": true
  },
  "snippet": {
    "categoryId": "22",
    "defaultLanguage": "en",
    "tags": ["tutorial", "programming", "react"]
  }
}
```

#### Update Video
```
PUT /api/videos/{videoId}
```

Request:
```json
{
  "title": "Updated Video Title",
  "description": "Updated description",
  "tags": ["updated", "tags"],
  "categoryId": "22",
  "status": "public"
}
```

Response:
```json
{
  "id": "abc123",
  "title": "Updated Video Title",
  "description": "Updated description",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### Delete Video
```
DELETE /api/videos/{videoId}
```

Response:
```json
{
  "message": "Video deleted successfully",
  "deletedAt": "2024-01-15T11:00:00Z"
}
```

### Analytics

#### Channel Overview
```
GET /api/analytics/overview
```

Query Parameters:
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `metrics` (string): Comma-separated metrics

Response:
```json
{
  "overview": {
    "totalViews": 100000,
    "totalSubscribers": 5000,
    "totalVideos": 50,
    "totalWatchTime": "PT1000H",
    "averageViewDuration": "PT5M30S",
    "subscriberGrowth": {
      "current": 5000,
      "previous": 4800,
      "change": 200,
      "changePercent": 4.17
    }
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

#### Video Analytics
```
GET /api/analytics/videos/{videoId}
```

Response:
```json
{
  "videoId": "abc123",
  "metrics": {
    "views": 1000,
    "watchTime": "PT50H",
    "averageViewDuration": "PT3M",
    "impressions": 5000,
    "clickThroughRate": 0.2,
    "likes": 50,
    "dislikes": 2,
    "comments": 10,
    "shares": 5,
    "subscribersGained": 10
  },
  "demographics": {
    "ageGroups": {
      "13-17": 10,
      "18-24": 30,
      "25-34": 40,
      "35-44": 15,
      "45-54": 5
    },
    "gender": {
      "male": 60,
      "female": 40
    },
    "geography": {
      "US": 50,
      "UK": 20,
      "CA": 15,
      "AU": 10,
      "other": 5
    }
  },
  "traffic": {
    "sources": {
      "youtube_search": 40,
      "suggested_videos": 30,
      "external": 20,
      "direct": 10
    }
  }
}
```

### Upload

#### Upload Video
```
POST /api/upload
```

Request (multipart/form-data):
- `video` (file): Video file
- `title` (string): Video title
- `description` (string): Video description
- `tags` (string): Comma-separated tags
- `categoryId` (string): Category ID
- `status` (string): Privacy status

Response:
```json
{
  "uploadId": "upload_123",
  "videoId": "abc123",
  "status": "processing",
  "progress": 0,
  "estimatedProcessingTime": "PT5M"
}
```

#### Upload Status
```
GET /api/upload/{uploadId}/status
```

Response:
```json
{
  "uploadId": "upload_123",
  "videoId": "abc123",
  "status": "processing",
  "progress": 75,
  "estimatedTimeRemaining": "PT1M15S",
  "processingSteps": {
    "upload": "completed",
    "processing": "in_progress",
    "thumbnail_generation": "pending",
    "publishing": "pending"
  }
}
```

### Comments

#### List Comments
```
GET /api/videos/{videoId}/comments
```

Query Parameters:
- `page` (number): Page number
- `limit` (number): Items per page
- `order` (string): Sort order (`time`, `relevance`)

Response:
```json
{
  "comments": [
    {
      "id": "comment_123",
      "text": "Great video!",
      "authorDisplayName": "John Doe",
      "authorProfileImageUrl": "https://example.com/avatar.jpg",
      "publishedAt": "2024-01-15T10:30:00Z",
      "likeCount": 5,
      "replyCount": 2,
      "moderationStatus": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Moderate Comment
```
PUT /api/comments/{commentId}/moderate
```

Request:
```json
{
  "action": "approve",
  "reason": "Content is appropriate"
}
```

Response:
```json
{
  "commentId": "comment_123",
  "status": "approved",
  "moderatedAt": "2024-01-15T11:00:00Z"
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://ytastudio.vercel.app/ws');
```

### Events

#### Upload Progress
```json
{
  "type": "upload_progress",
  "data": {
    "uploadId": "upload_123",
    "progress": 75,
    "status": "processing"
  }
}
```

#### Live Stream Status
```json
{
  "type": "stream_status",
  "data": {
    "streamId": "stream_123",
    "status": "live",
    "viewerCount": 150,
    "health": "good"
  }
}
```

#### New Comment
```json
{
  "type": "new_comment",
  "data": {
    "videoId": "abc123",
    "comment": {
      "id": "comment_456",
      "text": "New comment",
      "author": "Jane Doe"
    }
  }
}
```

## SDK Usage

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @ytastudio/sdk
```

#### Basic Usage
```typescript
import { YouTubeStudioClient } from '@ytastudio/sdk';

const client = new YouTubeStudioClient({
  apiKey: 'your_api_key',
  accessToken: 'user_access_token'
});

// List videos
const videos = await client.videos.list({
  page: 1,
  limit: 20
});

// Get video details
const video = await client.videos.get('abc123');

// Update video
const updatedVideo = await client.videos.update('abc123', {
  title: 'New Title',
  description: 'New Description'
});

// Get analytics
const analytics = await client.analytics.getVideoAnalytics('abc123', {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

#### Error Handling
```typescript
try {
  const video = await client.videos.get('invalid_id');
} catch (error) {
  if (error instanceof YouTubeStudioError) {
    console.error('API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Details:', error.details);
  }
}
```

#### Pagination
```typescript
const paginator = client.videos.listPaginated({
  limit: 20
});

for await (const page of paginator) {
  console.log('Videos:', page.videos);
  console.log('Page:', page.pagination.page);
}
```

### React Hooks

```typescript
import { useVideos, useVideo, useVideoAnalytics } from '@ytastudio/react';

function VideoList() {
  const { data: videos, loading, error } = useVideos({
    page: 1,
    limit: 20
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoDetails({ videoId }: { videoId: string }) {
  const { data: video } = useVideo(videoId);
  const { data: analytics } = useVideoAnalytics(videoId, {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  return (
    <div>
      <h1>{video?.title}</h1>
      <p>Views: {analytics?.metrics.views}</p>
    </div>
  );
}
```

## Best Practices

### API Usage

1. **Caching**: Implement aggressive caching to reduce API calls
2. **Batching**: Batch multiple requests when possible
3. **Error Handling**: Always handle errors gracefully
4. **Rate Limiting**: Respect rate limits and implement backoff
5. **Pagination**: Use pagination for large datasets

### Security

1. **API Keys**: Never expose API keys in client-side code
2. **Access Tokens**: Store access tokens securely
3. **HTTPS**: Always use HTTPS for API requests
4. **Validation**: Validate all input data
5. **Sanitization**: Sanitize user-generated content

### Performance

1. **Compression**: Use gzip compression for responses
2. **CDN**: Use CDN for static assets
3. **Caching**: Implement proper caching strategies
4. **Lazy Loading**: Load data only when needed
5. **Optimization**: Optimize images and videos

## Support

For API support and questions:

- **Documentation**: [docs/API.md](./API.md)
- **Issues**: [GitHub Issues](https://github.com/username/ytastudioaug2/issues)
- **Email**: api-support@example.com
- **Discord**: [Join our Discord](https://discord.gg/example)