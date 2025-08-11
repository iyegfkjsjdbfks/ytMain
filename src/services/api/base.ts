
import { CONSTANTS } from '../../lib/constants';
import type { ApiResponse, PaginationInfo } from '../../types/core';

/**
 * Base API Service
 * Centralized API configuration and utilities
 */



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
    message: any,
    public status: any,
    public code?: string,
    public details?,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Utility functions
export function createApiUrl(endpoint: any, params?: Record<string, any>): string {
  let fullUrl: string;

  // Handle relative base URLs (like '/api/youtube/v3') and absolute URLs
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    // Absolute URL - use new URL() constructor
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    const relativeEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(relativeEndpoint, baseUrl);

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
    // Relative URL - use string concatenation
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    fullUrl = `${baseUrl}${cleanEndpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    return fullUrl;

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
  url: any,
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
  endpoint: any,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint, params);
  return apiRequest<T>(url, { ...config, method: 'GET' });
}

// POST request
export async function post<T>(
  endpoint: any,
  data?,
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
  endpoint: any,
  data?,
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
  endpoint: any,
  data?,
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
  endpoint: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const url = createApiUrl(endpoint);
  return apiRequest<T>(url, { ...config, method: 'DELETE' });
}

// Upload file
export async function upload<T>(
  endpoint: any,
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
  endpoint: any,
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
