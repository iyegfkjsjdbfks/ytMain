// Error Types - Minimal Implementation
export interface BaseError {
  name: string;
  message: string;
  code?: string;
  timestamp: number;
}

export interface ApiError extends BaseError {
  method: string;
  url: string;
  status: number;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError extends BaseError {
  field: string;
  value?: unknown;
  constraint?: string;
}

export interface NetworkError extends BaseError {
  url: string;
  timeout?: boolean;
}

export interface YouTubeApiError extends BaseError {
  videoId?: string;
  errorType?: 'unavailable' | 'private' | 'deleted' | 'region_blocked' | 'quota_exceeded';
}

export const createApiError = (
  message: string,
  method: string,
  url: string,
  status: number,
  statusCode?: number,
  details?: Record<string, unknown>
): ApiError => {
  const error: ApiError = {
    name: 'ApiError',
    message,
    method,
    url,
    status,
    statusCode,
    details,
    timestamp: Date.now()
  };
  return error;
};

export const createValidationError = (
  message: string,
  field: string,
  value?: unknown,
  constraint?: string
): ValidationError => ({
  name: 'ValidationError',
  message,
  field,
  value,
  constraint,
  timestamp: Date.now()
});

export const createNetworkError = (
  message: string,
  url: string,
  timeout?: boolean
): NetworkError => ({
  name: 'NetworkError',
  message,
  url,
  timeout,
  timestamp: Date.now()
});

export const createYouTubeError = (
  message: string,
  videoId?: string,
  errorType?: 'unavailable' | 'private' | 'deleted' | 'region_blocked' | 'quota_exceeded'
): YouTubeApiError => {
  return {
    name: 'YouTubeApiError',
    message,
    videoId,
    errorType,
    timestamp: Date.now()
  };
};