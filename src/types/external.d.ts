// External library type declarations
declare module 'lucide-react' {
  export const Download: React.ComponentType<any>;
  export const X: React.ComponentType<any>;
  export const Check: React.ComponentType<any>;
  export const AlertCircle: React.ComponentType<any>;
  export const Loader2: React.ComponentType<any>;
  export const Play: React.ComponentType<any>;
  export const Pause: React.ComponentType<any>;
  export const Volume2: React.ComponentType<any>;
  export const VolumeX: React.ComponentType<any>;
  export const Maximize: React.ComponentType<any>;
  export const Minimize: React.ComponentType<any>;
  export const Settings: React.ComponentType<any>;
  export const MoreHorizontal: React.ComponentType<any>;
}

declare module '@heroicons/react/24/outline' {
  export const HeartIcon: React.ComponentType<any>;
  export const ChatBubbleLeftIcon: React.ComponentType<any>;
  export const ShareIcon: React.ComponentType<any>;
  export const BookmarkIcon: React.ComponentType<any>;
  export const EllipsisHorizontalIcon: React.ComponentType<any>;
  export const PlayIcon: React.ComponentType<any>;
  export const PauseIcon: React.ComponentType<any>;
  export const SpeakerWaveIcon: React.ComponentType<any>;
  export const SpeakerXMarkIcon: React.ComponentType<any>;
  export const ArrowsPointingOutIcon: React.ComponentType<any>;
  export const Cog6ToothIcon: React.ComponentType<any>;
}

declare module 'class-variance-authority' {
  export function cva(base: string, options?: any): any;
  export type VariantProps<T> = any;
}

declare module '@/lib/utils' {
  export function cn(...classes: any[]): string;
}

declare module '@/utils/errorUtils' {
  export function handleError(error: any): void;
  export function logError(error: any): void;
}

declare module './icons' {
  export const LikeIcon: React.ComponentType<any>;
  export const DislikeIcon: React.ComponentType<any>;
  export const CommentIcon: React.ComponentType<any>;
  export const ShareIcon: React.ComponentType<any>;
}