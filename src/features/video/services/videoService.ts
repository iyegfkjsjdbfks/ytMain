import { Video, VideoMetrics, VideoEngagement, VideoStats } from '../types';

interface VideoInteractionResponse {
  isLiked: boolean;
  isDisliked: boolean;
  isSaved: boolean;
  likes: number;
  dislikes: number;
}

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
    
    return response.json() as Promise<Video[]>;
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
    
    return response.json() as Promise<Video[]>;
  }

  /**
   * Fetch video metrics
   */
  async getVideoMetrics(videoId: string): Promise<VideoMetrics> {
    const response = await fetch(`${this.baseUrl}/${videoId}/metrics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video metrics: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoMetrics>;
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
    
    return response.json() as Promise<Video[]>;
  }

  /**
   * Toggle like on a video
   */
  async toggleLike(videoId: string): Promise<VideoInteractionResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to toggle like: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoInteractionResponse>;
  }

  /**
   * Toggle dislike on a video
   */
  async toggleDislike(videoId: string): Promise<VideoInteractionResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to toggle dislike: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoInteractionResponse>;
  }

  /**
   * Toggle save on a video
   */
  async toggleSave(videoId: string): Promise<VideoInteractionResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to toggle save: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoInteractionResponse>;
  }

  /**
   * Report a video
   */
  async reportVideo(videoId: string, reason: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${videoId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to report video: ${response.statusText}`);
    }
  }

  /**
   * Get video interactions (likes, dislikes, saves)
   */
  async getVideoInteractions(videoId: string): Promise<VideoInteractionResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}/interactions`);
    
    if (!response.ok) {
      throw new Error(`Failed to get video interactions: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoInteractionResponse>;
  }

  /**
   * Get video statistics
   */
  async getVideoStats(videoId: string): Promise<VideoStats> {
    const response = await fetch(`${this.baseUrl}/${videoId}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to get video stats: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoStats>;
  }

  /**
   * Get video engagement metrics
   */
  async getVideoEngagement(videoId: string): Promise<VideoEngagement> {
    const response = await fetch(`${this.baseUrl}/${videoId}/engagement`);
    
    if (!response.ok) {
      throw new Error(`Failed to get video engagement: ${response.statusText}`);
    }
    
    return response.json() as Promise<VideoEngagement>;
  }
}

// Export as singleton
export const videoService = new VideoService();
