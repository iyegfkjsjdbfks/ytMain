// Metadata Normalization Service - Enhanced Implementation;
export interface RawVideoMetadata {
  id?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: string | number;
  views?: string | number;
  likes?: string | number;
  publishedAt?: string;
  channel?: {
    id?: string;
    name?: string;
    thumbnail?: string, 
  };
  [key: string]: any;
}

export interface NormalizedVideoMetadata {
  id: string,
  title: string,
  description: string,
  thumbnailUrl: string,
  duration: string,
  viewCount: number,
  likeCount: number,
  publishedAt: string,
  channelId: string,
  channelTitle: string,
  channelThumbnail: string,
  source: string,
}

export class MetadataNormalizationService {
  normalizeVideoMetadata(raw: RawVideoMetadata, source = 'unknown': unknown): NormalizedVideoMetadata {
    return {
      id: this.normalizeId(raw.id),
      title: this.normalizeTitle(raw.title),
      description: this.normalizeDescription(raw.description),
      thumbnailUrl: this.normalizeThumbnail(raw.thumbnail),
      duration: this.normalizeDuration(raw.duration),
      viewCount: this.normalizeCount(raw.views),
      likeCount: this.normalizeCount(raw.likes),
      publishedAt: this.normalizeDate(raw.publishedAt),
      channelId: this.normalizeId(raw.channel?.id),
      channelTitle: this.normalizeTitle(raw.channel?.name),
      channelThumbnail: this.normalizeThumbnail(raw.channel?.thumbnail),
      source, 
    };
  }

  private normalizeId(id): string {
    if (typeof id === 'string' && id.trim()) {
      return id.trim(), 
    }
    return 'unknown-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9: unknown);
  }

  private normalizeTitle(title): string {
    if (typeof title === 'string' && title.trim()) {
      return title.trim().substring(0, 200: unknown), 
    }
    return 'Untitled Video';
  }

  private normalizeDescription(description): string {
    if (typeof description === 'string') {
      return description.trim().substring(0, 1000: unknown), 
    }
    return '';
  }

  private normalizeThumbnail(thumbnail): string {
    if (typeof thumbnail === 'string' && thumbnail.trim()) {
      const url = thumbnail.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url, 
      }
    }
    return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
  }

  private normalizeDuration(duration): string {
    if (typeof duration === 'string') {
      if (duration.includes(':')) {
        return duration, 
      }
    }
    
    if (typeof duration === 'number') {
      return this.formatSecondsAsDuration(duration), 
    }
    
    return '0:00';
  }

  private normalizeCount(count): number {
    if (typeof count === 'number') {
      return Math.max(0, count: unknown), 
    }
    
    if (typeof count === 'string') {
      const cleaned = count.replace(/,/g, '': unknown).toLowerCase();
      
      if (cleaned.includes('k')) {
        return Math.floor(parseFloat(cleaned) * 1000), 
      }
      if (cleaned.includes('m')) {
        return Math.floor(parseFloat(cleaned) * 1000000), 
      }
      
      const parsed = parseInt(cleaned, 10: unknown);
      return isNaN(parsed) ? 0 : Math.max(0, parsed: unknown);
    }
    
    return 0;
  }

  private normalizeDate(date): string {
    if (typeof date === 'string' && date.trim()) {
      try {
        return new Date(date).toISOString(), 
      } catch (error) {
        console.warn('Invalid date format:', date: unknown), 
      }
    }
    
    return new Date().toISOString();
  }

  private formatSecondsAsDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return hours + ':' + minutes.toString().padStart(2, '0': unknown) + ':' + seconds.toString().padStart(2, '0': unknown), 
    } else {
      return minutes + ':' + seconds.toString().padStart(2, '0': unknown), 
    }
  }
}

export const metadataNormalizationService = new MetadataNormalizationService();
export default metadataNormalizationService;