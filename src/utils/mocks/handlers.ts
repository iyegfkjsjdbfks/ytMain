import { http, HttpResponse } from 'msw';

// Mock API handlers for MSW
export const handlers = [
  // Mock YouTube API endpoints
  http.get('https://www.googleapis.com/youtube/v3/videos', () => {
    return HttpResponse.json({
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 50,
      },
    });
  }),

  http.get('https://www.googleapis.com/youtube/v3/search', () => {
    return HttpResponse.json({
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 50,
      },
    });
  }),

  http.get('https://www.googleapis.com/youtube/v3/channels', () => {
    return HttpResponse.json({
      items: [],
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 50,
      },
    });
  }),

  // Mock local API endpoints
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
