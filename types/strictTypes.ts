import type { Video } from '../types';
import type { Channel } from '../types';
import React, { ReactNode, KeyboardEvent, MouseEvent } from 'react';
import { MouseEvent } from 'react';
import { KeyboardEvent } from 'react';
import { ReactNode } from 'react';
// Strict Type Definitions to Replace 'any' Types

// Video Related Types
export interface VideoMetadata {
  title: string;
  description: string;
  tags: string;
  category: string;
  language: string;
  duration: number;
  thumbnailUrl: string;
  uploadDate: string;
  lastModified: string
}

export interface VideoStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  watchTime: number;
  averageViewDuration: number
}

export interface VideoFile {
  url: string;
  quality: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';
  format: 'mp4' | 'webm' | 'avi' | 'mov';
  size: number;
  bitrate: number;
  codec: string
}

export interface StrictVideo {
  id: string;
  channelId: string;
  metadata: VideoMetadata;
  stats: VideoStats;
  files: VideoFile;
  status: 'draft' | 'published' | 'unlisted' | 'private' | 'deleted';
  monetization: {
    enabled: boolean;
    adTypes: string;
    revenue: number
  };
  analytics: {
    impressions: number;
    clickThroughRate: number;
    retentionRate: number;
    engagementRate: number
  };
}

// Channel Related Types
export interface ChannelBranding {
  bannerUrl: string;
  logoUrl: string;
  watermarkUrl: string;
  primaryColor: string;
  secondaryColor: string
}

export interface ChannelStats {
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  averageViews: number;
  engagementRate: number
}

export interface StrictChannel {
  id: string;
  name: string;
  description: string;
  branding: ChannelBranding;
  stats: ChannelStats;
  verified: boolean;
  monetized: boolean;
  createdAt: string;
  country: string;
  language: string;
  categories: string
}

// Playlist Related Types
export interface PlaylistSettings {
  privacy: 'public' | 'unlisted' | 'private';
  allowComments: boolean;
  allowRatings: boolean;
  defaultLanguage: string
}

export interface StrictPlaylist {
  id: string;
  title: string;
  description: string;
  channelId: string;
  videoIds: string;
  thumbnailUrl: string;
  settings: PlaylistSettings;
  createdAt: string;
  updatedAt: string;
  stats: {
    views: number;
    likes: number;
    shares: number
  };
}

// Comment Related Types
export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  channelUrl: string;
  verified: boolean
}

export interface StrictComment {
  id: string;
  videoId: string;
  author: CommentAuthor;
  text: string;
  timestamp: string;
  likes: number;
  replies: StrictComment;
  edited: boolean;
  pinned: boolean;
  heartedByCreator: boolean
}

// Notification Types
export interface NotificationData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface StrictNotification {
  id: string;
  type: "info" as const | 'success' | 'warning' | 'error';
  data: NotificationData;
  timestamp: string;
  read: boolean;
  persistent: boolean
}

// Miniplayer Types
export interface MiniplayerVideo {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: number;
  currentTime: number;
  quality: string
}

// Form Types
export interface FormFieldValue {
  value: string | number | boolean | string;
  error?: string;
  touched: boolean;
  dirty: boolean
}

export interface StrictFormState {
  fields: Record<string, FormFieldValue>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: Record<string, string>;
}

export interface FormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: FormFieldValue['value']) => string | undefined
}

export interface FormFieldConfig {
  defaultValue: FormFieldValue['value'];
  validation?: FormValidationRule;
  dependencies?: string;
}

// API Types
export interface ApiRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: Record<string, unknown> | FormData;
  timeout?: number;
  retries?: number;
}

export interface ApiErrorDetails {
  field?: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface StrictApiError {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetails;
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean
  };
  metadata?: Record<string, string | number | boolean>;
}

// Cache Types
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  tags?: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
  enableCompression: boolean
}

// Event Types
export interface CustomEventData {
  source: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}

export interface StrictCustomEvent {
  type: string;
  data: CustomEventData;
  timestamp: string;
  id: string
}

// Storage Types
export interface StorageItem {
  value: string | number | boolean | object;
  timestamp: number;
  expiry?: number;
}

export interface StorageConfig {
  prefix: string;
  enableEncryption: boolean;
  compressionThreshold: number
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  category: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
  userId?: string;
  sessionId: string
}

export interface AnalyticsConfig {
  trackingId: string;
  enableDebug: boolean;
  sampleRate: number;
  cookieExpiry: number
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type StrictRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

export type NonEmptyArray<T> = [T, ...T[]];

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Function Types
export type AsyncFunction<T extends unknown, R> = (...args: T) => Promise<R>;
export type SyncFunction<T extends unknown, R> = (...args: T) => R;
export type AnyFunction<T extends unknown, R> = AsyncFunction<T, R> | SyncFunction<T, R>;

export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

export type Validator<T> = (value: T) => string | undefined;
export type AsyncValidator<T> = (value: T) => Promise<string | undefined>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: EventHandler<React.MouseEvent>;
  onKeyDown?: EventHandler<React.KeyboardEvent>;
}

export interface FormComponentProps extends InteractiveComponentProps {
  name: string;
  value?: FormFieldValue['value'];
  error?: string;
  required?: boolean;
  onChange?: (value: FormFieldValue['value']) => void;
  onBlur?: EventHandler<React.FocusEvent>;
  onFocus?: EventHandler<React.FocusEvent>;
}

// All types are already exported above with their definitions