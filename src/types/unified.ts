/**
 * Unified Type Definitions
 * Consolidates all type definitions to prevent conflicts and duplication
 */

// Re-export core types
// Ensure Video type compatibility
import type { Video as CoreVideo } from './core';
import type { Video as RootVideo } from '../../types';

export * from './core';
export * from './video';
export * from './youtube';
export * from './errors';
export * from './livestream';

// Legacy compatibility - re-export from root types
export type { Video, Channel, UserPlaylist } from '../../types';

// Create a unified Video type that combines both definitions
export type UnifiedVideo = CoreVideo & Partial<RootVideo>;

// Default export for backward compatibility
export type { Video } from './core';