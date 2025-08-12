import React, {} from 'react';
/**
 * Unified Error Type Definitions
 * Standardized error interfaces for consistent error handling
 */

// Base Error Interface
export interface BaseError {
  code: string;
  message: string;
  timestamp: Date;
  source?: string;
  details?: Record<string, unknown>;
}

// API Error Types
export interface ApiError extends BaseError {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode?: number;
  response?: unknown;
  requestId?: string;
}

export interface NetworkError extends BaseError {
  url: string;
  timeout?: boolean;
  offline?: boolean;
  retryCount?: number;
}

export interface YouTubeApiError extends ApiError {
  quotaExceeded?: boolean;
  rateLimited?: boolean;
  videoUnavailable?: boolean;
  regionBlocked?: boolean;
  embedDisabled?: boolean;
}

// Validation Error Types
export interface ValidationError extends BaseError {
  field: string;
  value?: unknown;
  constraint: string;
  expectedType?: string;
}

export interface FormValidationError extends BaseError {
  fields: ValidationError;
  formId?: string;
}

// Authentication Error Types
export interface AuthError extends BaseError {
  authType: 'oauth' | 'apikey' | 'session';
  expired?: boolean;
  invalid?: boolean;
  missing?: boolean;
}

// Storage Error Types
export interface StorageError extends BaseError {
  storageType: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'cache';
  operation: 'read' | 'write' | 'delete' | 'clear';
  key?: string;
  quotaExceeded?: boolean;
}

// Media Error Types
export interface MediaError extends BaseError {
  mediaType: 'video' | 'audio' | 'image';
  url?: string;
  duration?: number;
  networkState?: number;
  readyState?: number;
}

export interface VideoPlayerError extends MediaError {
  playerId?: string;
  videoId?: string;
  playerState?: number;
  errorCode?: number;
}

// Performance Error Types
export interface PerformanceError extends BaseError {
  metric: 'loadTime' | 'renderTime' | 'memoryUsage' | 'bundleSize';
  threshold: number;
  actual: number;
  component?: string;
}

// Service Worker Error Types
export interface ServiceWorkerError extends BaseError {
  swState:
    | 'installing'
    | 'installed'
    | 'activating'
    | 'activated'
    | 'redundant';
  operation: 'install' | 'activate' | 'fetch' | 'message';
  url?: string;
}

// Cache Error Types
export interface CacheError extends BaseError {
  cacheType: 'memory' | 'disk' | 'network' | 'browser';
  operation: 'get' | 'set' | 'delete' | 'clear' | 'invalidate';
  key?: string;
  ttl?: number;
}

// Search Error Types
export interface SearchError extends BaseError {
  query: string;
  searchType: 'video' | 'channel' | 'playlist' | 'live';
  filters?: Record<string, unknown>;
  resultsCount?: number;
}

// Component Error Types
export interface ComponentError extends BaseError {
  componentName: string;
  componentStack?: string;
  props?: Record<string, unknown>;
  lifecycle?: 'mount' | 'update' | 'unmount' | 'render';
}

// Hook Error Types
export interface HookError extends BaseError {
  hookName: string;
  dependencies?: unknown;
  state?: unknown;
}

// Configuration Error Types
export interface ConfigError extends BaseError {
  configKey: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  configFile?: string;
}

// Database Error Types
export interface DatabaseError extends BaseError {
  database: 'indexedDB' | 'localStorage' | 'sessionStorage';
  table?: string;
  operation: 'create' | 'read' | 'update' | 'delete' | 'query';
  query?: string;
}

// Analytics Error Types
export interface AnalyticsError extends BaseError {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical' }

// Error Categories
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  STORAGE = 'storage',
  MEDIA = 'media',
  PERFORMANCE = 'performance',
  CONFIGURATION = 'configuration',
  COMPONENT = 'component',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service' }

// Enhanced Error Interface with Metadata
export interface EnhancedError extends BaseError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  userMessage?: string;
  technicalMessage?: string;
  helpUrl?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  innerError?: Error;
}

// Error Context for Better Debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number
  };
  network: {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
  };
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
  performance?: {
    navigation?: PerformanceNavigationTiming;
    resources?: PerformanceResourceTiming;
  };
}

// Error Handler Function Types
export type ErrorHandler<T extends BaseError = BaseError> = (,
  error: T,
  context?: ErrorContext
) => void;
export type AsyncErrorHandler<T extends BaseError = BaseError> = (,
  error: T,
  context?: ErrorContext
) => Promise<void>;

// Error Recovery Strategy
export interface ErrorRecoveryStrategy {
  canRecover: (error: BaseError) => boolean;
  recover: (error: BaseError, context?: ErrorContext) => Promise<boolean>;
  maxRetries?: number;
  retryDelay?: number;
}

// Error Reporting Configuration
export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  includeStack: boolean;
  includeContext: boolean;
  samplingRate: number;
  ignoredErrors: string;
  beforeSend?: (,
  error: EnhancedError,
    context?: ErrorContext
  ) => EnhancedError | null;
}

// Common Error Codes
export const ERROR_CODES = {
  // Network Errors,
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // API Errors,
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',
  API_FORBIDDEN: 'API_FORBIDDEN',
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  API_BAD_REQUEST: 'API_BAD_REQUEST',

  // YouTube Specific,
  YOUTUBE_VIDEO_UNAVAILABLE: 'YOUTUBE_VIDEO_UNAVAILABLE',
  YOUTUBE_EMBED_DISABLED: 'YOUTUBE_EMBED_DISABLED',
  YOUTUBE_REGION_BLOCKED: 'YOUTUBE_REGION_BLOCKED',
  YOUTUBE_PRIVATE_VIDEO: 'YOUTUBE_PRIVATE_VIDEO',
  YOUTUBE_DELETED_VIDEO: 'YOUTUBE_DELETED_VIDEO',

  // Validation Errors,
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_INVALID_TYPE: 'VALIDATION_INVALID_TYPE',

  // Storage Errors,
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
  STORAGE_PERMISSION_DENIED: 'STORAGE_PERMISSION_DENIED',

  // Media Errors,
  MEDIA_LOAD_ERROR: 'MEDIA_LOAD_ERROR',
  MEDIA_DECODE_ERROR: 'MEDIA_DECODE_ERROR',
  MEDIA_NETWORK_ERROR: 'MEDIA_NETWORK_ERROR',
  MEDIA_SRC_NOT_SUPPORTED: 'MEDIA_SRC_NOT_SUPPORTED',

  // Component Errors,
  COMPONENT_RENDER_ERROR: 'COMPONENT_RENDER_ERROR',
  COMPONENT_MOUNT_ERROR: 'COMPONENT_MOUNT_ERROR',
  COMPONENT_UPDATE_ERROR: 'COMPONENT_UPDATE_ERROR',

  // Configuration Errors,
  CONFIG_MISSING: 'CONFIG_MISSING',
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_LOAD_ERROR: 'CONFIG_LOAD_ERROR',

  // Performance Errors,
  PERFORMANCE_SLOW_LOAD: 'PERFORMANCE_SLOW_LOAD',
  PERFORMANCE_MEMORY_LEAK: 'PERFORMANCE_MEMORY_LEAK',
  PERFORMANCE_LARGE_BUNDLE: 'PERFORMANCE_LARGE_BUNDLE',

  // Generic Errors,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  FEATURE_NOT_SUPPORTED: 'FEATURE_NOT_SUPPORTED' } as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Error Factory Functions
export const createApiError = (,
  message: any,
  endpoint: any,
  method: ApiError['method'],
  statusCode?: number,
  details?: Record<string, unknown>
): ApiError => {
  const error: ApiError = {
    code: ERROR_CODES.API_SERVER_ERROR,
    message,
    endpoint,
    method,
    timestamp: new Date() };

  if (statusCode !== undefined) {
    error.statusCode = statusCode;
  }

  if (details !== undefined) {
    error.details = details;
  }

  return error;
};

export const createValidationError = (,
  field: any,
  message: any,
  value?: unknown,
  constraint?: string
): ValidationError => ({
  code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
  message,
  field,
  value,
  constraint: constraint || 'unknown',
  timestamp: new Date() });

export const createNetworkError = (,
  message: any,
  url: any,
  timeout = false,
  offline = false
): NetworkError => ({
  code: timeout ? ERROR_CODES.NETWORK_TIMEOUT : ERROR_CODES.NETWORK_ERROR,
  message,
  url,
  timeout,
  offline,
  timestamp: new Date() });

export const createYouTubeError = (,
  message: any,
  endpoint: any,
  videoId?: string,
  errorType?:
    | 'unavailable'
    | 'embed_disabled'
    | 'region_blocked'
    | 'private'
    | 'deleted'
): YouTubeApiError => {
  let code: ErrorCode = ERROR_CODES.API_SERVER_ERROR;

  switch (errorType) {
    case 'unavailable':
      code = ERROR_CODES.YOUTUBE_VIDEO_UNAVAILABLE;
      break;
    case 'embed_disabled':
      code = ERROR_CODES.YOUTUBE_EMBED_DISABLED;
      break;
    case 'region_blocked':
      code = ERROR_CODES.YOUTUBE_REGION_BLOCKED;
      break;
    case 'private':
      code = ERROR_CODES.YOUTUBE_PRIVATE_VIDEO;
      break;
    case 'deleted':
      code = ERROR_CODES.YOUTUBE_DELETED_VIDEO;
      break;
  }

  const error: YouTubeApiError = {
    code,
    message,
    endpoint,
    method: 'GET',
    timestamp: new Date(),
    videoUnavailable: errorType === 'unavailable',
    embedDisabled: errorType === 'embed_disabled',
    regionBlocked: errorType === 'region_blocked' };

  if (videoId) {
    error.details = { videoId };
  }

  return error;
};
