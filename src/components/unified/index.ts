/**
 * Unified Components Index
 * Centralized exports for all unified components
 */

// Button Components
export { 
  UnifiedButton,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  GhostButton,
  LinkButton,
  type UnifiedButtonProps,
  type ButtonVariant,
  type ButtonSize
} from './UnifiedButton';

// Video Card Components
export {
  UnifiedVideoCard,
  type UnifiedVideoCardProps,
  type VideoCardVariant,
  type VideoCardSize
} from './UnifiedVideoCard';

// Re-export common types
export type { Video, User, Channel, Playlist, Comment } from '../../types/core';
