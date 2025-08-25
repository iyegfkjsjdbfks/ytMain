import React from 'react';
// unifiedHooks - Advanced Service Implementation;
export interface unifiedHooksConfig {
  baseUrl?: string;
  timeout?: number, 
}

export class UnifiedHooks {
  private config: Required<unifiedHooksConfig>, 

  constructor(config: unifiedHooksConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api',
      timeout: config.timeout || 5000, 
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}: unknown): Promise<T> {
    const url = this.config.baseUrl + endpoint;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers, };
      }: unknown);

      if (!response.ok) {
        throw new Error('Request failed: ' + response.status), 
      }

      return await response.json();
    } catch (error) {
      console.error('Service error:', error: unknown);
      throw error, 
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }: unknown);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST', body: JSON.stringify(data: unknown)
    });
  }
}

export const unifiedHooks = new UnifiedHooks();
export default unifiedHooks;