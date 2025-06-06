/**
 * Base API Service
 * Centralized API configuration and utilities
 */

import { CONSTANTS } from '../../lib/constants';

import type { ApiResponse, PaginationInfo } from '../../types/core';

// API Configuration
export const API_BASE_URL = CONSTANTS.API_CONFIG.BASE_URL;
export const API_TIMEOUT = CONSTANTS.API_CONFIG.TIMEOUT;

// Request types
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Utility functions
export function createApiUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

export function createRequestConfig(config: RequestConfig = {}): RequestInit {
  const {
    timeout = API_TIMEOUT,
    retries,
    retryDelay,
    ...fetchConfig
  } = config;

  return {
    headers: {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    },
    ...fetchConfig,
  };
}

// Request wrapper with timeout and retry logic
export async function apiRequest<T>(
  url: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    timeout = API_TIMEOUT,
    retries = CONSTANTS.API_CONFIG.RETRY_ATTEMPTS,
    retryDelay = CONSTANTS.API_CONFIG.RETRY_DELAY,
    ...fetchConfig
  } = config;

  const requestConfig = createRequestConfig(fetchConfig);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError()), timeout);
      });

      // Make the request
      const response = await Promise.race([
        fetch(url, requestConfig),
        timeoutPromise,
      ]);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details,
        );
      }

      // Parse response
      const data = await response.json();
      return data;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        error instanceof ApiError &&
        (error.status >= 400 && error.status < 500)
      ) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        break;
      }

      // Wait before retrying
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Convert network errors
  if (lastError instanceof TypeError) {
    throw new NetworkError('Failed to fetch data. Please check your connection.');
  }

  throw lastError || new Error('Unknown error occurred');
}

// GET request
export async function get<T>(
  endpoint: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint, params);
  return apiRequest<T>(url, { ...config, method: 'GET' });
}

// POST request
export async function post<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  return apiRequest<T>(url, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : null,
  });
}

// PUT request
export async function put<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  return apiRequest<T>(url, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : null,
  });
}

// PATCH request
export async function patch<T>(
  endpoint: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  return apiRequest<T>(url, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : null,
  });
}

// DELETE request
export async function del<T>(
  endpoint: string,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  return apiRequest<T>(url, { ...config, method: 'DELETE' });
}

// Upload file
export async function upload<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  const formData = new FormData();

  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return apiRequest<T>(url, {
    ...config,
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type for FormData, let browser set it
      ...config?.headers,
    },
  });
}

// Paginated request helper
export async function getPaginated<T>(
  endpoint: string,
  params: PaginatedRequest = {},
  config?: RequestConfig,
): Promise<ApiResponse<T[]> & { pagination: PaginationInfo }> {
  const {
    page = 1,
    limit = CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
    sortBy,
    sortOrder = 'desc',
    ...otherParams
  } = params;

  const queryParams = {
    page,
    limit: Math.min(limit, CONSTANTS.PAGINATION.MAX_PAGE_SIZE),
    ...(sortBy && { sortBy, sortOrder }),
    ...otherParams,
  };

  return get<T[]>(endpoint, queryParams, config) as Promise<
    ApiResponse<T[]> & { pagination: PaginationInfo }
  >;
}

// Export the API client
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  getPaginated,
  createUrl: createApiUrl,
  request: apiRequest,
};

export default api;
