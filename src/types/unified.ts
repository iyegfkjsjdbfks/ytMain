// Unified type exports for the application
// Core types
export * from './core';

// Video and media types  
export * from './video';
export * from './playlist';
export * from './channel';

// Error types
export type {
  ErrorInfo,
  ErrorBoundaryState,
  ErrorCode,
} from './errors';

// Livestream types
export * from './livestream';

// Unified type definitions
export type UnifiedVideo = any; // TODO: Define proper type
export type UnifiedChannel = any; // TODO: Define proper type
export type UnifiedPlaylist = any; // TODO: Define proper type
