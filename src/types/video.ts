export interface VideoQuality {
 name: string;
 value: string;
 resolution: string;
 bitrate: string;

export interface Subtitle {
 language: string;
 languageCode: string;
 url: string;
 isDefault: boolean;

export interface Chapter {
 start: number;
 title: string;
 thumbnail?: string;

export interface Video {
 id: string;
 title: string;
 description: string;
 duration: number;
 thumbnailUrl: string;
 channelId: string;
 channelName: string;
 channelAvatarUrl?: string;
 viewCount: number;
 likeCount: number;
 dislikeCount: number;
 commentCount: number;
 publishedAt: string;
 tags: string;
 category: string;
 license: string;
 visibility: 'public' | 'private' | 'unlisted';
 isLive: boolean;
 isUpcoming?: boolean;
 scheduledStartTime?: string;
 concurrentViewers?: number;
 isLiveContent?: boolean;
 isFamilySafe: boolean;
 allowedRegions?: string;
 blockedRegions?: string;
 isAgeRestricted: boolean;
 embeddable: boolean;
 defaultLanguage?: string;
 defaultAudioLanguage?: string;
 recordingStatus?: 'none' | 'recorded' | 'not_recorded';
 uploadStatus?: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
 privacyStatus?: 'private' | 'public' | 'unlisted';
 publishAt?: string;
 selfDeclaredMadeForKids?: boolean;
 statistics?: {
 viewCount: string;
 likeCount: string;
 dislikeCount: string;
 favoriteCount: string;
 commentCount: string;
 topicDetails?: {
 topicIds: string;
 relevantTopicIds: string;
 topicCategories: string;
 contentDetails?: {
 duration: string;
 dimension: string;
 definition: string;
 caption: string;
 licensedContent: boolean;
 regionRestriction?: {
 allowed?: string;
 blocked?: string;
 contentRating?: Record<string, string>
 projection?: string;
 hasCustomThumbnail?: boolean;
 player?: {
 embedHtml: string;
 embedHeight?: number;
 embedWidth?: number;
 status?: {
 uploadStatus: string;
 failureReason?: string;
 rejectionReason?: string;
 privacyStatus: string;
 publishAt?: string;
 license: string;
 embeddable: boolean;
 publicStatsViewable: boolean;
 madeForKids: boolean;
 selfDeclaredMadeForKids?: boolean;
 fileDetails?: {
 fileName: string;
 fileSize: string;
 fileType: string;
 container: string;
 videoStreams: Array<{
 widthPixels: number;
 heightPixels: number;
 frameRateFps: number;
 aspectRatio: number;
 codec: string;
 bitrateBps: string;
 rotation: string;
 vendor: string;
 }>
 audioStreams: Array<{
 channelCount: number;
 codec: string;
 bitrateBps: string;
 vendor: string;
 }>
 durationMs: string;
 bitrateBps: string;
 creationTime: string;
 processingDetails?: {
 processingStatus: string;
 processingProgress?: {
 partsTotal: string;
 partsProcessed: string;
 timeLeftMs: string;
 processingFailureReason?: string;
 fileDetailsAvailability?: string;
 processingIssuesAvailability?: string;
 tagSuggestionsAvailability?: string;
 editorSuggestionsAvailability?: string;
 thumbnailsAvailability?: string;
 suggestions?: {
 processingErrors?: string;
 processingWarnings?: string;
 processingHints?: string;
 tagSuggestions?: Array<{
 tag: string;
 categoryRestricts: string;
 }>
 editorSuggestions?: string;
 liveStreamingDetails?: {
 actualStartTime?: string;
 actualEndTime?: string;
 scheduledStartTime?: string;
 scheduledEndTime?: string;
 concurrentViewers?: string;
 activeLiveChatId?: string;
 localizations?: Record<;
 string,
 {
 title: string;
 description: string;
 >
 // Required timestamp fields,
 createdAt: string;
 updatedAt: string;
