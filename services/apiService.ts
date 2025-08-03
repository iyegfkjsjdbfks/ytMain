/**
 * Comprehensive API service with advanced features
 */

import { performanceMonitor } from '../utils/performanceMonitor';
import { securityUtils } from '../utils/securityUtils';

// Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  timestamp: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: number;
  requestId?: string;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  validateStatus?: (status: number) => boolean;
  onUploadProgress?: (progress: number) => void;
  onDownloadProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

// Request/Response interceptors
export type RequestInterceptor = (config: RequestConfig & { url: string }) => RequestConfig & { url: string } | Promise<RequestConfig & { url: string }>;
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// Cache implementation
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number, etag?: string): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      ...(etag && { etag }),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
return null;
}

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  getEntry<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);

    if (!entry) {
return null;
}

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 6;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        } finally {
          this.running--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (request) {
      request();
    }
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }
}

// Main API service class
export class ApiService {
  private baseURL: string;
  private defaultConfig: RequestConfig;
  private cache = new ApiCache();
  private requestQueue = new RequestQueue();
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private rateLimiter = new securityUtils.RateLimiter(100, 60000);

  constructor(baseURL: string = '', defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      cache: false,
      cacheTTL: 5 * 60 * 1000,
      validateStatus: (status) => status >= 200 && status < 300,
      ...defaultConfig,
    };
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  getCacheKeys(): string[] {
    return this.cache.keys();
  }

  // Rate limiting
  setRateLimit(maxRequests: number, windowMs: number): void {
    this.rateLimiter = new securityUtils.RateLimiter(maxRequests, windowMs);
  }

  // Main request method
  async request<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const fullUrl = this.buildUrl(url);
    const requestId = securityUtils.TokenGenerator.generateUUID();

    // Rate limiting check
    if (!this.rateLimiter.isAllowed(fullUrl)) {
      throw this.createError(
        'Rate limit exceeded',
        429,
        'RATE_LIMIT_EXCEEDED',
        { url: fullUrl, requestId },
      );
    }

    // Apply request interceptors
    let interceptedConfig = { ...fullConfig, url: fullUrl };
    for (const interceptor of this.requestInterceptors) {
      interceptedConfig = await interceptor(interceptedConfig);
    }

    // Check cache for GET requests
    if (interceptedConfig.method === 'GET' && interceptedConfig.cache) {
      const cacheKey = this.getCacheKey(interceptedConfig.url, interceptedConfig);
      const cachedResponse = this.cache.get<ApiResponse<T>>(cacheKey);

      if (cachedResponse) {
        performanceMonitor.trackCustomMetric('api_cache_hit', 1);
        return cachedResponse;
      }
    }

    // Add to request queue
    return this.requestQueue.add(async () => {
      const startTime = performance.now();

      try {
        const response = await this.executeRequest<T>(interceptedConfig, requestId);

        // Apply response interceptors
        let interceptedResponse = response;
        for (const interceptor of this.responseInterceptors) {
          interceptedResponse = await interceptor(interceptedResponse);
        }

        // Cache successful GET responses
        if (interceptedConfig.method === 'GET' && interceptedConfig.cache &&
            interceptedResponse.status >= 200 && interceptedResponse.status < 300) {
          const cacheKey = this.getCacheKey(interceptedConfig.url, interceptedConfig);
          const etag = interceptedResponse.headers.get('etag') || undefined;
          this.cache.set(cacheKey, interceptedResponse, interceptedConfig.cacheTTL, etag);
        }

        // Track performance
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall(interceptedConfig.url, duration, interceptedResponse.status);

        return interceptedResponse;
      } catch (error) {
        // Apply error interceptors
        let interceptedError: Error;
        if (error instanceof Error) {
          interceptedError = error;
        } else {
          interceptedError = this.createError(
            'Request failed',
            0,
            'REQUEST_ERROR',
            { originalError: error },
          );
        }

        for (const interceptor of this.errorInterceptors) {
          const result = await interceptor(interceptedError as any);
          if (result instanceof Error) {
            interceptedError = result;
          } else {
            // If interceptor returns non-Error, create a proper Error with name
            interceptedError = this.createError(
              result?.message || 'Intercepted error',
              (result as any)?.status || 0,
              (result as any)?.code || 'INTERCEPTED_ERROR',
              result
            );
          }
        }

        // Track error
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall(interceptedConfig.url, duration, (interceptedError as any).status || 0);

        throw interceptedError;
      }
    });
  }

  // Execute the actual HTTP request
  private async executeRequest<T>(
    config: RequestConfig & { url: string },
    requestId: string,
  ): Promise<ApiResponse<T>> {
    const { url, method = 'GET', headers = {}, body, timeout, retries = 0, retryDelay = 1000 } = config;

    // Prepare headers
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...headers,
    });

    // Add CSRF token for non-GET requests
    if (method !== 'GET') {
      const csrfToken = securityUtils.CSRFProtection.getToken();
      if (csrfToken) {
        requestHeaders.set('X-CSRF-Token', csrfToken);
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: config.signal || null,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        requestOptions.body = body;
        requestHeaders.delete('Content-Type'); // Let browser set it for FormData
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

    // Combine signals
    const combinedSignal = this.combineAbortSignals([
      config.signal,
      timeoutController.signal,
    ].filter(Boolean) as AbortSignal[]);

    requestOptions.signal = combinedSignal;

    let lastError: Error = new Error('Request failed');

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        // Validate status
        if (!config.validateStatus!(response.status)) {
          const errorText = await response.text();
          throw this.createError(
            `Request failed with status ${response.status}`,
            response.status,
            'HTTP_ERROR',
            { responseText: errorText, requestId },
          );
        }

        // Parse response
        const data = await this.parseResponse<T>(response);

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          timestamp: Date.now(),
        };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = this.createError(
              'Request timeout',
              408,
              'TIMEOUT',
              { requestId },
            );
          } else {
            lastError = this.createError(
              error.message,
              0,
              'NETWORK_ERROR',
              { originalError: error, requestId },
            );
          }
        } else {
          lastError = this.createError(
            'Unknown error occurred',
            0,
            'UNKNOWN_ERROR',
            { originalError: error, requestId },
          );
        }

        // Don't retry on certain errors
        if ((lastError as any).status && ((lastError as any).status < 500 || (lastError as any).status === 501)) {
          throw lastError;
        }

        // Wait before retry
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Request failed');
  }

  // Parse response based on content type
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/')) {
      return await response.text() as unknown as T;
    } else if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) {
      return await response.blob() as unknown as T;
    }
      return await response.arrayBuffer() as unknown as T;

  }

  // Utility methods
  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseURL}${url.startsWith('/') ? url : `/${  url}`}`;
  }

  private getCacheKey(url: string, config: RequestConfig): string {
    const params = new URLSearchParams();
    if (config.body && typeof config.body === 'object') {
      params.append('body', JSON.stringify(config.body));
    }
    return `${url}?${params.toString()}`;
  }

  private createError(
    message: string,
    status?: number,
    code?: string,
    details?: any,
  ): Error {
    const error = new Error(message);
    error.name = 'ApiError';
    (error as any).status = status;
    (error as any).code = code;
    (error as any).details = details;
    (error as any).timestamp = Date.now();
    return error;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });

    return controller.signal;
  }

  // Convenience methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body: data });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body: data });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body: data });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // File upload with progress
  async uploadFile<T = any>(
    url: string,
    file: File,
    config?: RequestConfig & {
      fieldName?: string;
      additionalFields?: Record<string, string>;
    },
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(config?.fieldName || 'file', file);

    // Add additional fields
    if (config?.additionalFields) {
      Object.entries(config.additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: formData,
    });
  }

  // Batch requests
  async batch<T = any>(requests: Array<{
    url: string;
    config?: RequestConfig;
  }>): Promise<Array<ApiResponse<T> | ApiError>> {
    const promises = requests.map(({ url, config }) =>
      this.request<T>(url, config).catch(error => error as ApiError),
    );

    return Promise.all(promises);
  }

  // Health check
  async healthCheck(endpoint: string = '/health'): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    timestamp: number;
  }> {
    const startTime = performance.now();

    try {
      await this.get(endpoint, { timeout: 5000, cache: false });
      const responseTime = performance.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        timestamp: Date.now(),
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        timestamp: Date.now(),
      };
    }
  }
}

// Create default instance
export const apiService = new ApiService();

// Setup default interceptors
apiService.addRequestInterceptor(async (config) => {
  // Add authentication token if available
  const token = securityUtils.SecureStorage.getSecureSession('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  return config;
});

apiService.addResponseInterceptor(async (response) => {
  // Log successful responses in development
  if (import.meta.env.DEV) {
    console.log(`API Response: ${response.status} ${response.statusText}`);
  }

  return response;
});

apiService.addErrorInterceptor(async (error) => {
  // Handle authentication errors
  if (error.status === 401) {
    securityUtils.SecureStorage.removeItem('auth_token');
    // Redirect to login or refresh token
  }

  // Log errors
  console.error('API Error:', error);

  return error;
});

export default apiService;