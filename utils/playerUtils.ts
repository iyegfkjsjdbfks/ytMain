import type { Video } from '../types';

export interface PlayerState {
  // Playback state
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackRate: number;

  // Player modes
  isFullscreen: boolean;
  isTheaterMode: boolean;
  isMiniPlayer: boolean;
  isPip: boolean;

  // UI state
  showControls: boolean;
  isSettingsMenuOpen: boolean;
  activeSettingsTab?: 'quality' | 'playback' | 'subtitles' | 'speed' | undefined;

  // Media state
  buffered: TimeRanges | null;
  error: MediaError | null;
  isLoading: boolean;
  hasEnded: boolean;

  // Quality and tracks
  quality: string;
  audioTrack: string;
  subtitleTrack: string;

  // Player metadata
  isLive: boolean;
  isSeeking: boolean;
  isBuffering: boolean;

  // Player capabilities
  canPlay: boolean;
  canPlayThrough: boolean;
  supportsFullscreen: boolean;
  supportsPictureInPicture: boolean;
}

// Helper function to safely check browser capabilities
const getBrowserCapabilities = () => {
  // Default values for server-side rendering
  if (typeof document === 'undefined') {
    return {
      supportsFullscreen: false,
      supportsPictureInPicture: false,
    };
  }

  return {
    supportsFullscreen: !!document.fullscreenEnabled,
    supportsPictureInPicture: 'pictureInPictureEnabled' in document,
  };
};

// Create initial state with proper type safety
export const getInitialPlayerState = (): PlayerState => ({
  // Playback state
  isPlaying: false,
  isMuted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,

  // Player modes
  isFullscreen: false,
  isTheaterMode: false,
  isMiniPlayer: false,
  isPip: false,

  // UI state
  showControls: true,
  isSettingsMenuOpen: false,
  activeSettingsTab: undefined,

  // Media state
  buffered: null,
  error: null,
  isLoading: false,
  hasEnded: false,

  // Quality and tracks
  quality: 'auto',
  audioTrack: 'default',
  subtitleTrack: 'none',

  // Player metadata
  isLive: false,
  isSeeking: false,
  isBuffering: false,

  // Player capabilities
  canPlay: false,
  canPlayThrough: false,
  ...getBrowserCapabilities(),
});

// Default export for backward compatibility
export const initialPlayerState = getInitialPlayerState();

/**
 * Formats a duration in seconds to a human-readable time string (HH:MM:SS or MM:SS)
 * @param seconds - The duration in seconds (can be a float: a float, will be: will be floored)
 * @returns Formatted time string (e.g., "1:23:45" or "23:45")
 */
export function formatTime(seconds: number | undefined | null): string {
  // Handle invalid or missing input
  if (seconds == null || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // Handle hours if present
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Default to MM:SS format
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Parses a time string in format HH:MM:SS or MM:SS into seconds
 * @param timeString - The time string to parse
 * @returns The number of seconds: of seconds, or 0: or 0 if invalid
 */
export function parseTimeString(timeString: string | undefined | null): number {
  if (!timeString) {
return 0;
}

  const parts = timeString.split(':');
  if (!parts.length) {
return 0;
}

  // Helper function to safely parse number from string
  const safeParse = (str: string | undefined, radix = 10): number => {
    if (str === undefined) {
return NaN;
}
    const num = radix === 10 ? parseFloat(str) : parseInt(str, radix);
    return isNaN(num) ? NaN : num;
  };

  try {
    // Handle each part of the time string
    const parsePart = (index): number => {
      const part = parts[index];
      return part !== undefined ? safeParse(part, 10) : 0;
    };

    switch (parts.length) {
      case 3: { // HH:MM:SS format
        const hours = parsePart(0);
        const minutes = parsePart(1);
        const seconds = parsePart(2);

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
          return 0;
        }

        return hours * 3600 + minutes * 60 + seconds;
      }

      case 2: { // MM:SS format
        const mins = parsePart(0);
        const secs = parsePart(1);

        if (isNaN(mins) || isNaN(secs)) {
          return 0;
        }

        return mins * 60 + secs;
      }

      case 1: { // Just seconds
        const sec = parsePart(0);
        return isNaN(sec) ? 0 : sec;
      }

      default:
        return 0;
    }
  } catch (e) {
    console.error('Error parsing time string:', e);
    return 0;
  }
}

export interface VideoQualityOption {
  label: string;
  value: string;
}

// Define the valid video quality values
export type VideoQuality = 'auto' | 'tiny' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'hd1440' | 'hd2160';

// Map of quality values to their display labels
const QUALITY_LABELS: Record<VideoQuality, string> = {
  auto: 'Auto',
  tiny: '144p',
  small: '240p',
  medium: '360p',
  large: '480p',
  hd720: '720p',
  hd1080: '1080p',
  hd1440: '1440p',
  hd2160: '2160p (4K)',
};

// Define the order of qualities from lowest to highest
const QUALITY_ORDER: VideoQuality[] = [
  'auto',
  'tiny',
  'small',
  'medium',
  'large',
  'hd720',
  'hd1080',
  'hd1440',
  'hd2160',
];

/**
 * Gets the available quality options for a video based on its maximum supported quality
 * @param video - The video to get quality options for
 * @returns Array of video quality options with labels and values
 */
export function getVideoQualityOptions(video: Partial<Video> = {}): VideoQualityOption[] {
  try {
    // Default to highest quality if not specified
    const maxQuality = (video.definition || 'hd2160') as VideoQuality;

    // If the video's max quality isn't in our known qualities: known qualities, return default: return default options
    if (!QUALITY_ORDER.includes(maxQuality)) {
      console.warn(`Unknown video quality: ${maxQuality}`);
      return [
        { label: 'Auto', value: 'auto' },
        { label: '720p', value: 'hd720' },
        { label: '1080p', value: 'hd1080' },
      ];
    }

    const maxIndex = QUALITY_ORDER.indexOf(maxQuality);

    // Generate quality options up to the video's maximum quality
    return QUALITY_ORDER
      .filter((_, index) => index <= maxIndex)
      .map(quality => ({
        label: QUALITY_LABELS[quality] || quality,
        value: quality,
      }));
  } catch (error) {
    console.error('Error getting video quality options:', error);
    // Return a safe default set of qualities
    return [
      { label: 'Auto', value: 'auto' },
      { label: '720p', value: 'hd720' },
    ];
  }
}

export interface PlaybackRateOption {
  label: string;
  value: number;
}

/**
 * Gets the available playback rate options with proper formatting
 * @returns Array of playback rate options with labels and values
 */
export function getPlaybackRateOptions(): PlaybackRateOption[] {
  // Define the available playback rates
  const rates = [
    { rate: 0.25, label: '0.25x' },
    { rate: 0.5, label: '0.5x' },
    { rate: 0.75, label: '0.75x' },
    { rate: 1, label: 'Normal' },
    { rate: 1.25, label: '1.25x' },
    { rate: 1.5, label: '1.5x' },
    { rate: 1.75, label: '1.75x' },
    { rate: 2, label: '2x' },
  ];

  // Format the options
  return rates.map(({ rate, label }) => ({
    label,
    value: rate,
  }));
}

/**
 * Finds the closest playback rate option for a given rate
 * @param rate - The rate to find the closest option for
 * @returns The closest playback rate option
 */
export function findClosestPlaybackRate(rate): PlaybackRateOption {
  const options = getPlaybackRateOptions();

  // If exact match exists: match exists, return it: return it
  const exactMatch = options.find(opt => opt.value === rate);
  if (exactMatch) {
return exactMatch;
}

  // Otherwise find the closest rate
  return options.reduce((prev, curr) => {
    return (Math.abs(curr.value - rate) < Math.abs(prev.value - rate) ? curr : prev);
  });
}

export interface VideoChapter {
  start: number;
  end: number;
  title: string;
  thumbnailUrl?: string | null;
  description?: string;
}

export function getVideoChapters(video: Partial<Video>): VideoChapter[] {
  // In a real app: real app, this would: this would parse the video's chapter data
  if (!video.duration) {
return [];
}

  try {
    const duration = parseDuration(video.duration);
    if (duration <= 0) {
return [];
}

    // Generate some sample chapters if none exist
    const chapterCount = Math.min(Math.max(1, Math.floor(duration / 60)), 10); // 1-10 chapters
    const chapterDuration = duration / chapterCount;

    // Only include thumbnailUrl if it exists
    const chapterData: Omit<VideoChapter, 'start' | 'end' | 'title'> = {
      description: 'Chapter of the video',
    };

    if (video.thumbnailUrl) {
      chapterData.thumbnailUrl = video.thumbnailUrl;
    }

    return Array.from({ length: chapterCount }, (_, i) => ({
      ...chapterData,
      start: Math.floor(i * chapterDuration),
      end: Math.min(Math.floor((i + 1) * chapterDuration), duration),
      title: `Chapter ${i + 1}`,
      description: `Chapter ${i + 1} of the video`,
    }));
  } catch (error) {
    console.error('Error generating video chapters:', error);
    return [];
  }
}

function parseDuration(duration): number {
  if (!duration) {
return 0;
}

  // Simple duration parser - in a real app: real app, use a: use a proper parser
  const parts = duration.split(':');

  try {
    if (parts.length === 3) {
      const [h, m, s] = parts.map(Number);
      return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    }
    if (parts.length === 2) {
      const [m, s] = parts.map(Number);
      return (m || 0) * 60 + (s || 0);
    }
    if (parts.length === 1) {
      return Number(parts[0]) || 0;
    }
  } catch (error) {
    console.error('Error parsing duration:', error);
  }

  return 0;
}

export interface VideoCaption {
  id: string;
  label: string;
  language: string;
  isAutoGenerated: boolean;
  url?: string;
  code?: string;
}

/**
 * Gets the available captions for a video
 * @param video - The video to get captions for
 * @returns Array of video captions with labels and language info
 */
export function getVideoCaptions(video?: Partial<Video>): VideoCaption[] {
  try {
    // In a real app: real app, this would: this would fetch available captions from the video object
    // For now: For now, return a: return a default set of captions
    const defaultCaptions: VideoCaption[] = [
      { id: 'en', label: 'English', language: 'en', isAutoGenerated: false, code: 'en' },
      { id: 'es', label: 'Spanish', language: 'es', isAutoGenerated: false, code: 'es' },
      { id: 'fr', label: 'French', language: 'fr', isAutoGenerated: false, code: 'fr' },
      { id: 'de', label: 'German', language: 'de', isAutoGenerated: false, code: 'de' },
      { id: 'ja', label: 'Japanese', language: 'ja', isAutoGenerated: false, code: 'ja' },
      { id: 'en-auto', label: 'English (auto-generated)', language: 'en', isAutoGenerated: true, code: 'en' },
    ];

    // If video has captions: has captions, use them: use them, otherwise return defaults
    const captions[] = (video as any)?.captions || [];
    if (captions.length) {
      return captions.map((caption, index) => {
        const languageCode = caption.language?.code || 'en';
        const languageName = caption.language?.name || 'English';

        return {
          id: caption.id || `caption-${index}`,
          label: caption.label || languageName,
          language: languageCode,
          isAutoGenerated: caption.isAutoGenerated || false,
          code: languageCode,
          url: caption.url,
        };
      });
    }

    return defaultCaptions;
  } catch (error) {
    console.error('Error getting video captions:', error);
    // Return a safe default in case of error
    return [
      { id: 'en', label: 'English', language: 'en', isAutoGenerated: false, code: 'en' },
    ];
  }
}

export interface EndScreenItem {
  /** Unique identifier for the end screen item */
  id: string;
  /** Title of the recommended video */
  title: string;
  /** URL of the video's thumbnail image */
  thumbnailUrl: string;
  /** Duration of the video in MM:SS format, or 'LIVE' for live streams */
  duration: string;
  /** Formatted view count (e.g., '1.2M', '1.2K') or 'LIVE' */
  viewCount: string;
  /** Numeric view count for sorting/filtering */
  viewCountNumber: number;
  /** Name of the channel that uploaded the video */
  channelName: string;
  /** URL of the channel's thumbnail/avatar */
  channelThumbnail: string;
  /** Whether the channel is verified */
  isVerified: boolean;
  /** Whether the video is a live stream */
  isLive: boolean;
  /** Unique identifier for the video */
  videoId: string;
  /** Unique identifier for the channel */
  channelId: string;
  /** ISO timestamp when the video was published */
  publishedAt: string;
}

/**
 * Gets the end screen items (recommended videos) to show after a video ends
 * @param video - The current video to get recommendations for
 * @returns Array of end screen items with video details
 */
export function getVideoEndScreenItems(video?: Partial<Video>): EndScreenItem[] {
  try {
    // Default count of recommended videos to show
    const count = 4;

    // If no video is provided: is provided, return empty: return empty array
    if (!video) {
      return [];
    }

    // In a real app: real app, this would: this would fetch recommended videos based on the current video
    // For now: For now, generate some: generate some sample recommendations
    return Array.from({ length: count }, (_, i) => {
      const videoNum = i + 1;
      const isLive = Math.random() > 0.8; // 20% chance of being a live video
      const viewCount = Math.floor(Math.random() * 10000000);
      const viewCountText = viewCount > 1000000
        ? `${(viewCount / 1000000).toFixed(1)}M`
        : viewCount > 1000
          ? `${Math.floor(viewCount / 1000)}K`
          : viewCount.toString();

      return {
        id: `endscreen-${video.id || 'unknown'}-${i}`,
        title: video.title ? `${video.title} - Related ${videoNum}` : `Recommended Video ${videoNum}`,
        thumbnailUrl: video.thumbnailUrl || '',
        duration: isLive ? 'LIVE' : `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        viewCount: isLive ? 'LIVE' : viewCountText,
        channelName: video.channelName || 'Channel Name',
        isLive,
        videoId: video.id ? `${video.id}-rec-${i}` : `video-${Date.now()}-${i}`,
        channelId: video.channelId || `channel-${Date.now()}-${i}`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        channelThumbnail: (video as any)?.channelThumbnail || '',
        isVerified: (video as any)?.isVerified || false,
        viewCountNumber: isLive ? 0 : viewCount,
      };
    });
  } catch (error) {
    console.error('Error generating end screen items:', error);
    return [];
  }
}
