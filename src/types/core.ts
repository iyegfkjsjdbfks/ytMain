/**
 * Core Type Definitions
 * Centralized, strict type definitions for the YouTube clone application
 */

// Base Entity Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User extends BaseEntity {
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  channelId?: string;
  isVerified: boolean;
  subscriberCount: number;
  description?: string;
  bannerImage?: string;
  socialLinks?: SocialLinks;
  preferences: UserPreferences;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoplay: boolean;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  subscriptions: boolean;
  comments: boolean;
  likes: boolean;
  mentions: boolean;
}

export interface PrivacySettings {
  showSubscriptions: boolean;
  showLikedVideos: boolean;
  showWatchHistory: boolean;
  allowComments: boolean;
}

// Video Types
export interface Video extends BaseEntity {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: number;
  dislikes: number;
  uploadedAt: string;
  channelName: string;
  channelId: string;
  channelAvatar?: string;
  category: string;
  tags: string[];
  isLive: boolean;
  isShort: boolean;
  visibility: VideoVisibility;
  monetization?: MonetizationSettings;
  analytics?: VideoAnalytics;
}

export type VideoVisibility = 'public' | 'unlisted' | 'private' | 'scheduled';

export interface MonetizationSettings {
  enabled: boolean;
  adBreaks: AdBreak[];
  sponsorships: Sponsorship[];
}

export interface AdBreak {
  timestamp: number;
  duration: number;
  type: 'pre-roll' | 'mid-roll' | 'post-roll';
}

export interface Sponsorship {
  brand: string;
  startTime: number;
  endTime: number;
  message: string;
}

export interface VideoAnalytics {
  totalViews: number;
  uniqueViews: number;
  averageWatchTime: number;
  clickThroughRate: number;
  engagement: EngagementMetrics;
  demographics: DemographicData;
  trafficSources: TrafficSource[];
}

export interface EngagementMetrics {
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
  countries: Record<string, number>;
}

export interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
}

// Short Video Types
export interface Short extends Omit<Video, 'duration'> {
  duration: number; // Duration in seconds for shorts
  isVertical: boolean;
  effects?: ShortEffect[];
  music?: ShortMusic;
}

export interface ShortEffect {
  type: string;
  name: string;
  parameters: Record<string, any>;
}

export interface ShortMusic {
  title: string;
  artist: string;
  duration: number;
  startTime: number;
}

// Channel Types
export interface Channel extends BaseEntity {
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner?: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  isVerified: boolean;
  joinedDate: string;
  country?: string;
  links: SocialLinks;
  playlists: Playlist[];
  sections: ChannelSection[];
}

export interface ChannelSection {
  id: string;
  title: string;
  type: 'videos' | 'playlists' | 'channels';
  items: string[]; // IDs of videos, playlists, or channels
  order: number;
}

// Playlist Types
export interface Playlist extends BaseEntity {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount: number;
  totalDuration: string;
  visibility: PlaylistVisibility;
  ownerId: string;
  ownerName: string;
  videos: PlaylistVideo[];
  tags: string[];
}

export type PlaylistVisibility = 'public' | 'unlisted' | 'private';

export interface PlaylistVideo {
  videoId: string;
  addedAt: string;
  order: number;
  note?: string;
}

// Comment Types
export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  videoId: string;
  parentId?: string; // For replies
  likes: number;
  dislikes: number;
  replies: Comment[];
  isEdited: boolean;
  isPinned: boolean;
  isHearted: boolean; // Hearted by video owner
}

// Subscription Types
export interface Subscription extends BaseEntity {
  subscriberId: string;
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  notificationsEnabled: boolean;
  subscribedAt: string;
}

// Search Types
export interface SearchResult {
  type: 'video' | 'channel' | 'playlist';
  item: Video | Channel | Playlist;
  relevanceScore: number;
}

export interface SearchFilters {
  type?: 'video' | 'channel' | 'playlist' | 'all';
  duration?: 'short' | 'medium' | 'long';
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'upload_date' | 'view_count' | 'rating';
  features?: ('live' | 'hd' | 'subtitles' | 'creative_commons')[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

// Event Types
export interface VideoEvent {
  type: 'play' | 'pause' | 'seek' | 'ended' | 'error';
  timestamp: number;
  data?: Record<string, any>;
}

export interface UserEvent {
  type: 'click' | 'view' | 'search' | 'subscribe' | 'like' | 'comment';
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Export utility types
export type VideoCardVariant = 'default' | 'compact' | 'list' | 'grid';
export type VideoCardSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ThemeMode = 'light' | 'dark' | 'system';
