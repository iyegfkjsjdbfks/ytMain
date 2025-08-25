// Comprehensive type declarations;
declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | { [key: string] } | ClassValue[];
  export function clsx(...inputs: ClassValue[]): string;
}

declare module 'class-variance-authority' {
  export interface VariantProps<T> {
    [key: string];
  }
  
  export function cva(
    base: string | string[],
    config?: {
      variants?: Record<string, Record<string, string>>;
      defaultVariants?: Record<string, string>;
    }
  ): (props?: Record<string, any>) => string;
}

declare module 'lucide-react' {
  import { ComponentType } from 'react';
  
  export const Download: ComponentType<{ className?: string; size?: number }>;
  export const X: ComponentType<{ className?: string; size?: number }>;
  export const Check: ComponentType<{ className?: string; size?: number }>;
  export const AlertCircle: ComponentType<{ className?: string; size?: number }>;
  export const Loader2: ComponentType<{ className?: string; size?: number }>;
  export const Play: ComponentType<{ className?: string; size?: number }>;
  export const Pause: ComponentType<{ className?: string; size?: number }>;
  export const Volume2: ComponentType<{ className?: string; size?: number }>;
  export const VolumeX: ComponentType<{ className?: string; size?: number }>;
  export const Maximize: ComponentType<{ className?: string; size?: number }>;
  export const Minimize: ComponentType<{ className?: string; size?: number }>;
  export const Settings: ComponentType<{ className?: string; size?: number }>;
  export const MoreHorizontal: ComponentType<{ className?: string; size?: number }>;
}

declare module '@heroicons/react/24/outline' {
  import { ComponentType } from 'react';
  
  export const HeartIcon: ComponentType<{ className?: string }>;
  export const ChatBubbleLeftIcon: ComponentType<{ className?: string }>;
  export const ShareIcon: ComponentType<{ className?: string }>;
  export const BookmarkIcon: ComponentType<{ className?: string }>;
  export const EllipsisHorizontalIcon: ComponentType<{ className?: string }>;
  export const PlayIcon: ComponentType<{ className?: string }>;
  export const PauseIcon: ComponentType<{ className?: string }>;
  export const SpeakerWaveIcon: ComponentType<{ className?: string }>;
  export const SpeakerXIcon: ComponentType<{ className?: string }>;
  export const ArrowsPointingOutIcon: ComponentType<{ className?: string }>;
  export const Cog6ToothIcon: ComponentType<{ className?: string }>;
}