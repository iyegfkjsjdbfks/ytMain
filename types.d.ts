import type { VideoVisibility } from 'src/types/core.ts';
export type { VideoVisibility };
export interface PlaylistSummary {
    id: string;
    title: string;
    videoCount: number;
    thumbnailUrl?: string;
}
export interface CommunityPost {
    id: string;
    type: "text" | 'image' | 'poll';
    content: string;
    imageUrl?: string;
    pollOptions?: Array<{
        id: string;
        text: string;
        votes: number;
    }>;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    createdAt: Date;
    engagement: {
        views: number;
        clickThroughRate: number;
    };
    channelName?: string;
    channelAvatarUrl?: string;
    timestamp?: string;
    textContent?: string;
    commentsCount?: number;
}
export type { Video, ContentItem } from './src/types/core';
export interface ExtendedVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    thumbnail?: string;
    channelName: string;
    channelAvatarUrl: string;
    channelAvatar?: string;
    views: string;
    viewCount?: number;
    uploadedAt: string;
    duration: string;
    videoUrl: string;
    description: string;
    category: string;
    isShort?: boolean;
    isLiveNow?: boolean;
    scheduledStartTime?: string;
    viewerCount?: string;
    likes?: number;
    dislikes?: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    isSaved?: boolean;
    commentCount?: number;
    tags?: string;
    privacyStatus?: 'public' | 'private' | 'unlisted';
    publishedAt?: string;
    createdAt?: string;
    visibility?: VideoVisibility;
    channelId?: string;
    aspectRatio?: number;
    definition?: 'hd' | 'sd';
    dimension?: '2d' | '3d';
    caption?: boolean;
    licensedContent?: boolean;
    contentRating?: Record<string, any>;
    projection?: 'rectangular' | '360' | '3d';
    likeCount?: number;
    favoriteCount?: number;
    uploadStatus?: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
    failureReason?: string;
    rejectionReason?: string;
    monetizationDetails?: {
        access?: {
            allowed: boolean;
            exception?: string;
        };
        monetizationStatus?: 'monetized' | 'ineligible' | 'limited';
        adFormats?: string;
    };
    defaultAudioLanguage?: string;
    defaultLanguage?: string;
    localized?: {
        title: string;
        description: string;
    };
}
export type { Channel } from './src/types/core';
export interface ExtendedChannel {
    id: string;
    name: string;
    avatarUrl: string;
    subscribers: string;
    subscriberCount?: string;
    videoCount?: number;
    isVerified?: boolean;
    description?: string;
    joinDate?: string;
    totalViews?: string;
    channelDescription?: string;
    playlists?: PlaylistSummary;
    communityPosts?: CommunityPost;
}
export type { Comment } from './src/types/core';
export interface UserPlaylist {
    id: string;
    title: string;
    description?: string;
    videoIds: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserPlaylistDetails extends UserPlaylist {
    videoCount: number;
    thumbnailUrl?: string;
}
export interface VideoIdeaResponse {
    ideas: string;
    titles: string;
    concept: string;
    talkingPoints: string;
    tags: string;
    error?: string;
}
export interface VideoUploadData {
    title: string;
    description: string;
    category: string;
    tags: string;
    visibility: 'public' | 'unlisted' | 'private';
    videoFile: File | null;
    thumbnailFile: File | null;
    isShorts: boolean;
}
export interface UploadProgress {
    percentage: number;
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    message: string;
}
export type Short = Omit<ExtendedVideo, 'isShort'> & {
    isShort: true;
    isVertical?: boolean;
    musicInfo?: {
        title: string;
        artist: string;
        coverUrl?: string;
    };
    shares?: number;
    saves?: number;
    hasCaptions?: boolean;
    hasAudio?: boolean;
    viewDuration?: number;
    swipeAwayRate?: number;
    createdTime?: string;
    modifiedTime?: string;
    visibility?: VideoVisibility;
    isMonetized?: boolean;
    hasInteractiveElements?: boolean;
    thumbnailOverlays?: Array<{
        type: "text" | 'image' | 'time';
        content: string;
        position: 'top' | 'bottom' | 'left' | 'right';
        style?: Record<string, any>;
    }>;
};
//# sourceMappingURL=types.d.ts.map