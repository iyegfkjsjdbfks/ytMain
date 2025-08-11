import { Link } from 'react-router-dom';

/**
 * YouTube API Type Definitions
 * Comprehensive interfaces for YouTube Data API v3 responses
 */

// Base YouTube API Response
export interface YouTubeApiResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T;
}

// Video Interfaces
export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  tags?: string;
  categoryId: string;
  liveBroadcastContent: 'none' | 'upcoming' | 'live';
  localized: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
  defaultLanguage?: string;
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount: string;
  commentCount?: string;
}

export interface YouTubeVideoContentDetails {
  duration: string;
  dimension: '2d' | '3d';
  definition: 'hd' | 'sd';
  caption: 'true' | 'false';
  licensedContent: boolean;
  regionRestriction?: {
    allowed?: string;
    blocked?: string;
  };
  contentRating?: {
    mpaaRating?: string;
    tvpgRating?: string;
    bbfcRating?: string;
    chvrsRating?: string;
    eirinRating?: string;
    cbfcRating?: string;
    fmocRating?: string;
    icaaRating?: string;
    acbRating?: string;
    oflcRating?: string;
    fskRating?: string;
    kmrbRating?: string;
    djctqRating?: string;
    russiaRating?: string;
    rtcRating?: string;
    ytRating?: string;
  };
  projection: 'rectangular' | '360';
}

export interface YouTubeVideoStatus {
  uploadStatus: 'uploaded' | 'processed' | 'failed' | 'rejected' | 'deleted';
  failureReason?: 'conversion' | 'invalidFile' | 'emptyFile' | 'tooSmall' | 'codec' | 'uploadAborted';
  rejectionReason?: 'copyright' | 'inappropriate' | 'duplicate' | 'termsOfUse' | 'uploaderAccountSuspended' | 'length' | 'claim' | 'uploaderAccountClosed' | 'trademark' | 'legal';
  privacyStatus: 'public' | 'unlisted' | 'private';
  publishAt?: string;
  license: 'youtube' | 'creativeCommon';
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
  selfDeclaredMadeForKids?: boolean;
}

export interface YouTubeVideo {
  kind: 'youtube#video';
  etag: string;
  id: string;
  snippet?: YouTubeVideoSnippet;
  statistics?: YouTubeVideoStatistics;
  contentDetails?: YouTubeVideoContentDetails;
  status?: YouTubeVideoStatus;
  localizations?: Record<string, {
    title: string;
    description: string;
  }>;
  player?: {
    embedHtml: string;
  };
  topicDetails?: {
    topicIds: string;
    relevantTopicIds: string;
    topicCategories: string;
  };
  recordingDetails?: {
    recordingDate: string;
  };
  fileDetails?: {
    fileName: string;
    fileSize: string;
    fileType: string;
    container: string;
    videoStreams: Array<{
      widthPixels: number;
      heightPixels: number;
      frameRateFps: number;
      aspectRatio: number;
      codec: string;
      bitrateBps: string;
      rotation: 'none' | 'clockwise' | 'upsideDown' | 'counterClockwise' | 'other';
      vendor: string;
    }>;
    audioStreams: Array<{
      channelCount: number;
      codec: string;
      bitrateBps: string;
      vendor: string;
    }>;
    durationMs: string;
    bitrateBps: string;
    creationTime: string;
  };
  processingDetails?: {
    processingStatus: 'processing' | 'succeeded' | 'failed' | 'terminated';
    processingProgress: {
      partsTotal: string;
      partsProcessed: string;
      timeLeftMs: string;
    };
    processingFailureReason: 'uploadFailed' | 'transcodeFailed' | 'streamingFailed' | 'other';
    fileDetailsAvailability: 'processing' | 'available' | 'unavailable';
    processingIssuesAvailability: 'processing' | 'available' | 'unavailable';
    tagSuggestionsAvailability: 'processing' | 'available' | 'unavailable';
    editorSuggestionsAvailability: 'processing' | 'available' | 'unavailable';
    thumbnailsAvailability: 'processing' | 'available' | 'unavailable';
  };
  suggestions?: {
    processingErrors: string;
    processingWarnings: string;
    processingHints: string;
    tagSuggestions: Array<{
      tag: string;
      categoryRestricts: string;
    }>;
    editorSuggestions: string;
  };
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    concurrentViewers?: string;
    activeLiveChatId?: string;
  };
}

// Channel Interfaces
export interface YouTubeChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: YouTubeThumbnails;
  defaultLanguage?: string;
  localized: {
    title: string;
    description: string;
  };
  country?: string;
}

export interface YouTubeChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface YouTubeChannelContentDetails {
  relatedPlaylists: {
    likes?: string;
    favorites?: string;
    uploads?: string;
    watchHistory?: string;
    watchLater?: string;
  };
}

export interface YouTubeChannel {
  kind: 'youtube#channel';
  etag: string;
  id: string;
  snippet?: YouTubeChannelSnippet;
  statistics?: YouTubeChannelStatistics;
  contentDetails?: YouTubeChannelContentDetails;
  status?: {
    privacyStatus: 'public' | 'unlisted' | 'private';
    isLinked: boolean;
    longUploadsStatus: 'allowed' | 'eligible' | 'disallowed';
    madeForKids: boolean;
    selfDeclaredMadeForKids?: boolean;
  };
  brandingSettings?: {
    channel: {
      title: string;
      description: string;
      keywords: string;
      trackingAnalyticsAccountId: string;
      moderateComments: boolean;
      unsubscribedTrailer: string;
      defaultLanguage: string;
      country: string;
    };
    watch: {
      textColor: string;
      backgroundColor: string;
      featuredPlaylistId: string;
    };
  };
  auditDetails?: {
    overallGoodStanding: boolean;
    communityGuidelinesGoodStanding: boolean;
    copyrightStrikesGoodStanding: boolean;
    contentIdClaimsGoodStanding: boolean;
  };
  contentOwnerDetails?: {
    contentOwner: string;
    timeLinked: string;
  };
  localizations?: Record<string, {
    title: string;
    description: string;
  }>;
  topicDetails?: {
    topicIds: string;
    topicCategories: string;
  };
}

// Search Result Interfaces
export interface YouTubeSearchResultSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  liveBroadcastContent: 'none' | 'upcoming' | 'live';
  publishTime: string;
}

export interface YouTubeSearchResult {
  kind: 'youtube#searchResult';
  etag: string;
  id: {
    kind: 'youtube#video' | 'youtube#channel' | 'youtube#playlist';
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: YouTubeSearchResultSnippet;
}

// Playlist Interfaces
export interface YouTubePlaylistSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  defaultLanguage?: string;
  localized: {
    title: string;
    description: string;
  };
}

export interface YouTubePlaylistStatus {
  privacyStatus: 'public' | 'unlisted' | 'private';
}

export interface YouTubePlaylistContentDetails {
  itemCount: number;
}

export interface YouTubePlaylist {
  kind: 'youtube#playlist';
  etag: string;
  id: string;
  snippet?: YouTubePlaylistSnippet;
  status?: YouTubePlaylistStatus;
  contentDetails?: YouTubePlaylistContentDetails;
  localizations?: Record<string, {
    title: string;
    description: string;
  }>;
  player?: {
    embedHtml: string;
  };
}

// Playlist Item Interfaces
export interface YouTubePlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: 'youtube#video';
    videoId: string;
  };
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
}

export interface YouTubePlaylistItemContentDetails {
  videoId: string;
  startAt?: string;
  endAt?: string;
  note?: string;
  videoPublishedAt: string;
}

export interface YouTubePlaylistItemStatus {
  privacyStatus: 'public' | 'unlisted' | 'private';
}

export interface YouTubePlaylistItem {
  kind: 'youtube#playlistItem';
  etag: string;
  id: string;
  snippet?: YouTubePlaylistItemSnippet;
  contentDetails?: YouTubePlaylistItemContentDetails;
  status?: YouTubePlaylistItemStatus;
}

// Comment Interfaces
export interface YouTubeCommentSnippet {
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl: string;
  authorChannelId: {
    value: string;
  };
  videoId: string;
  textDisplay: string;
  textOriginal: string;
  canRate: boolean;
  totalReplyCount: number;
  likeCount: number;
  moderationStatus?: 'heldForReview' | 'likelySpam' | 'published';
  publishedAt: string;
  updatedAt: string;
}

export interface YouTubeComment {
  kind: 'youtube#comment';
  etag: string;
  id: string;
  snippet: YouTubeCommentSnippet;
}

export interface YouTubeCommentThreadSnippet {
  channelId?: string;
  videoId: string;
  topLevelComment: YouTubeComment;
  canReply: boolean;
  totalReplyCount: number;
  isPublic: boolean;
}

export interface YouTubeCommentThread {
  kind: 'youtube#commentThread';
  etag: string;
  id: string;
  snippet: YouTubeCommentThreadSnippet;
  replies?: {
    comments: YouTubeComment;
  };
}

// Common Interfaces
export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

// API Response Types
export type YouTubeVideosResponse = YouTubeApiResponse<YouTubeVideo>;
export type YouTubeChannelsResponse = YouTubeApiResponse<YouTubeChannel>;
export type YouTubeSearchResponse = YouTubeApiResponse<YouTubeSearchResult>;
export type YouTubePlaylistsResponse = YouTubeApiResponse<YouTubePlaylist>;
export type YouTubePlaylistItemsResponse = YouTubeApiResponse<YouTubePlaylistItem>;
export type YouTubeCommentThreadsResponse = YouTubeApiResponse<YouTubeCommentThread>;
export type YouTubeCommentsResponse = YouTubeApiResponse<YouTubeComment>;

// Error Interfaces
export interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
    status: string;
    details?: Array<{
      '@type': string;
      reason: string;
      domain: string;
      metadata: Record<string, string>;
    }>;
  };
}

// Player Event Interfaces
export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number;
}

export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds, allowSeekAhead?: boolean): void;
  clearVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume): void;
  getVolume(): number;
  setSize(width, height): object;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate): void;
  getAvailablePlaybackRates(): number;
  setLoop(loopPlaylists): void;
  setShuffle(shufflePlaylist): void;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getVideoStartBytes(): number;
  getVideoBytesLoaded(): number;
  getVideoBytesTotal(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist(): string;
  getPlaylistIndex(): number;
  addEventListener(event, listener: (event: YouTubePlayerEvent) => void): void;
  removeEventListener(event, listener: (event: YouTubePlayerEvent) => void): void;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}

// Player States
export enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5
}

// Player Events
export enum YouTubePlayerEvents {
  READY = 'onReady',
  STATE_CHANGE = 'onStateChange',
  PLAYBACK_QUALITY_CHANGE = 'onPlaybackQualityChange',
  PLAYBACK_RATE_CHANGE = 'onPlaybackRateChange',
  ERROR = 'onError',
  API_CHANGE = 'onApiChange'
}

// Player Error Codes
export enum YouTubePlayerError {
  INVALID_PARAM = 2,
  HTML5_ERROR = 5,
  VIDEO_NOT_FOUND = 100,
  EMBED_NOT_ALLOWED = 101,
  EMBED_NOT_ALLOWED_DISGUISE = 150
}
