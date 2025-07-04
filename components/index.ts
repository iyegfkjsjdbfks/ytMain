// Layout Components
export { default as Layout } from './Layout';
export { default as Sidebar } from './Sidebar';
export { default as Header } from './Header';
export { default as PageLayout } from './PageLayout';
export { default as StandardPageLayout } from './StandardPageLayout';
export { default as StudioLayout } from './StudioLayout';
export { default as AccountLayout } from './AccountLayout';

// Video Components - Unified and Legacy
export { default as VideoCard } from './VideoCard';
export { default as OptimizedVideoCard } from './OptimizedVideoCard';
export { default as ShortDisplayCard } from './ShortDisplayCard';


export { default as VideoGrid } from './VideoGrid';
export { default as ReusableVideoGrid } from './ReusableVideoGrid';
export { default as VirtualizedVideoGrid } from './VirtualizedVideoGrid';

// Video Player Components
export { default as AdvancedVideoPlayer } from './AdvancedVideoPlayer';

export { default as YouTubePlayerWrapper } from './YouTubePlayerWrapper';
export { default as YouTubePlayer } from './YouTubePlayer';
export { default as VideoDescription } from './VideoDescription';
export { default as RefactoredVideoDescription } from './RefactoredVideoDescription';
export { default as VideoActions } from './VideoActions';

// Navigation and Search
export { default as SearchBar } from './SearchBar';
export { default as SearchSuggestions } from './SearchSuggestions';
export { default as AdvancedSearch } from './AdvancedSearch';

// Comments System
export { default as CommentsSection } from './CommentsSection';
export { default as EnhancedCommentSystem } from './EnhancedCommentSystem';
export { default as AddCommentForm } from './AddCommentForm';

// Content Discovery
export { default as RecommendationEngine } from './RecommendationEngine';
export { default as CategoryChips } from './CategoryChips';
export { default as CategoryTabs } from './CategoryTabs';
export { default as TrendingSection } from './TrendingSection';

// Shorts Components
export { default as ShortsSection } from './ShortsSection';
export { default as ShortsPlayer } from './ShortsPlayer';
export { default as ShortsNavigation } from './ShortsNavigation';
export { default as ShortsFilters } from './ShortsFilters';
export { default as ShortsProgressIndicator } from './ShortsProgressIndicator';

// Subscription Components
export { default as SubscriptionFeed } from './SubscriptionFeed';
export { default as SubscriptionManager } from './SubscriptionManager';
export { default as SubscriptionStats } from './SubscriptionStats';
export { default as SubscriptionVideoCard } from './SubscriptionVideoCard';

// Channel Components
export { default as ChannelHeader } from './ChannelHeader';
export { default as ChannelTabs } from './ChannelTabs';
export { default as ChannelTabContent } from './ChannelTabContent';

// User Interface
export { default as UserMenu } from './UserMenu';
export { default as NotificationsPanel } from './NotificationsPanel';
export { default as NotificationCenter } from './NotificationCenter';
export { default as NotificationSystem } from './NotificationSystem';

// Error and Loading States
export { default as ErrorBoundary } from './ErrorBoundary';
// export { default as LoadingStates } from './LoadingStates'; // No default export
export { default as SuspenseWrapper } from './SuspenseWrapper';

// Media Components
export { default as Miniplayer } from './Miniplayer';
export { default as PictureInPicture } from './PictureInPicture';
export { default as ImageWithFallback } from './ImageWithFallback';

// Modal Components
export { default as Modal } from './Modal';
export { default as CommentModal } from './CommentModal';
// export { default as SaveToPlaylistModal } from './SaveToPlaylistModal'; // File doesn't exist
export { default as RefactoredSaveToPlaylistModal } from './RefactoredSaveToPlaylistModal';

// Form Components
export { default as BaseForm } from './BaseForm';
export {
  FormProvider,
  useFormContext,
  FormField,
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
  UnifiedForm,
} from './forms/UnifiedFormSystem';

// UI Components
export {
  ActionButton,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  ErrorMessage,
  FileUpload,
  LoadingSpinner,
  ProgressBar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  UnifiedButton,
} from './ui';

// Utility Components
export { default as DataWrapper } from './DataWrapper';

// Type exports

export type {
  FormContextValue,
  FormProviderProps,
  FormFieldProps,
  UnifiedInputProps,
  UnifiedTextareaProps,
  UnifiedSelectProps,
  UnifiedFormProps,
} from './forms/UnifiedFormSystem';
export type {
  ActionButtonProps,
  BadgeProps,
  ButtonProps,
  DropdownMenuProps,
  ErrorMessageProps,
  FileUploadProps,
  LoadingSpinnerProps,
  ProgressBarProps,
  TabsProps,
  UnifiedButtonProps,
} from './ui';