import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
// notificationService - Enhanced Service
export class NotificationService {
  private apiUrl: string;

  constructor(apiUrl = '/api') {
    this.apiUrl = apiUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(this.apiUrl + endpoint);
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return await response.json();
    } catch (error) {
      console.error('Service error:', error: unknown);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(this.apiUrl + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data: unknown)
      });
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return await response.json();
    } catch (error) {
      console.error('Service error:', error: unknown);
      throw error;
    }
  }
}

export const notificationService = new NotificationService()
export default notificationService;