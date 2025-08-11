// Google Custom Search Video Storage
// This service stores and retrieves individual Google Custom Search video results

import type { GoogleSearchResult } from './googleSearchService';

class GoogleSearchVideoStore {
  private videos: Map<string, GoogleSearchResult> = new Map();
  private readonly storageKey = 'google-search-videos';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Store a Google Custom Search video result
   */
  storeVideo(video: GoogleSearchResult): void {
    this.videos.set(video.id, video);
    this.saveToStorage();
    console.log(`📦 Stored Google Search video: ${video.id} - ${video.title}`);
  }

  /**
   * Store multiple Google Custom Search video results
   */
  storeVideos(videos: GoogleSearchResult): void {
    videos.forEach((video: any) => {
      this.videos.set(video.id, video);
    });
    this.saveToStorage();
    console.log(`📦 Stored ${videos.length} Google Search videos`);
  }

  /**
   * Get a Google Custom Search video by ID
   */
  getVideo(id: string): GoogleSearchResult | null {
    const video = this.videos.get(id);
    if (video) {
      console.log(`✅ Retrieved Google Search video: ${id} - ${video.title}`);
      return video;
    }
    console.log(`❌ Google Search video not found: ${id}`);
    return null;
  }

  /**
   * Check if a video exists in the store
   */
  hasVideo(id: string): boolean {
    return this.videos.has(id);
  }

  /**
   * Get all stored videos
   */
  getAllVideos(): GoogleSearchResult[] {
    return Array.from(this.videos.values());
  }

  /**
   * Clear all stored videos
   */
  clear(): void {
    this.videos.clear();
    this.saveToStorage();
    console.log('🗑️ Cleared all Google Search videos');
  }

  /**
   * Get store statistics
   */
  getStats(): { count: number; size: string } {
    const count = this.videos.size;
    const sizeBytes = JSON.stringify(Array.from(this.videos.entries())).length;
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    return { count, size: `${sizeKB} KB` };
  }

  /**
   * Save videos to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.videos.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save Google Search videos to storage:', error);
    }
  }

  /**
   * Load videos from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const entries: Array<[string, GoogleSearchResult]> = JSON.parse(data);
        this.videos = new Map(entries);
        console.log(`📂 Loaded ${this.videos.size} Google Search videos from storage`);
      }
    } catch (error) {
      console.warn('Failed to load Google Search videos from storage:', error);
      this.videos = new Map();
    }
  }

  /**
   * Clean up old videos (older than 24 hours)
   */
  cleanup(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const [id, video] of this.videos.entries()) {
      if (video.uploadedAt) {
        const videoTime = new Date(video.uploadedAt).getTime();
        if (now - videoTime > oneDayMs) {
          this.videos.delete(id);
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      this.saveToStorage();
      console.log(`🧹 Cleaned up ${cleanedCount} old Google Search videos`);
    }
  }
}

// Create and export singleton instance
export const googleSearchVideoStore = new GoogleSearchVideoStore();

// Auto-cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    googleSearchVideoStore.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}

export default googleSearchVideoStore;
