import { Video, VideoMetrics } from '../types';

/**
 * Service for handling video-related API requests
 */
class VideoService {
  private baseUrl: string = '/api/videos';

  /**
   * Fetch a single video by ID
   */
  async getVideo(videoId: string): Promise<Video> {
    const response = await fetch(`${this.baseUrl}/${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Fetch trending videos with optional category filter
   */
  async getTrendingVideos(category?: string, limit: number = 20): Promise<Video[]> {
    const url = new URL(this.baseUrl);
    url.pathname += '/trending';
    
    if (category) {
      url.searchParams.append('category', category);
    }
    
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending videos: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Fetch recommended videos based on a video ID
   */
  async getRecommendedVideos(videoId: string, limit: number = 10): Promise<Video[]> {
    const url = new URL(this.baseUrl);
    url.pathname += '/recommended';
    url.searchParams.append('videoId', videoId);
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recommended videos: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Fetch video metrics
   */
  async getVideoMetrics(videoId: string): Promise<VideoMetrics> {
    const response = await fetch(`${this.baseUrl}/${videoId}/metrics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video metrics: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Search for videos
   */
  async searchVideos(query: string, limit: number = 20): Promise<Video[]> {
    const url = new URL(this.baseUrl);
    url.pathname += '/search';
    url.searchParams.append('q', query);
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to search videos: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export as singleton
export const videoService = new VideoService();
