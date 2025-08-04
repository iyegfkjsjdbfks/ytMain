import type { Video as CoreVideo } from './core';
import type { Video as RootVideo } from '../../types';
import { /**
 * Unified Type Definitions
 * Consolidates all type definitions to prevent conflicts and duplication
 */

// Re-export core types
// Ensure Video type compatibility

export * from './core';
export * from './video';
// Export specific types from youtube to avoid conflicts
export type { YouTubeVideo, YouTubeChannel, YouTubePlaylist } from './youtube';
import { // Export specific types from errors to avoid YouTubeApiError conflict
export type {
  BaseError,
  ApiError,
  NetworkError,
  ValidationError,
  FormValidationError,
  AuthError,
  StorageError,
  MediaError,
  VideoPlayerError,
  PerformanceError,
  ServiceWorkerError,
  CacheError,
  ErrorCode, } from './errors';
import React from "react";
import { export * from './livestream';

// Legacy compatibility - re-export from root types (excluding Video to avoid conflict)
export type { Channel, UserPlaylist } from '../../types';
import { // Create a unified Video type that combines both definitions
export type UnifiedVideo = CoreVideo & Partial<RootVideo>;

// Use the core Video type as the primary export
export type { Video } from './core';