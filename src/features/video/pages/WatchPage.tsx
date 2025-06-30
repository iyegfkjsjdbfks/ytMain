import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';

import YouTubePlayer from '../../../../components/YouTubePlayer';
import { getYouTubeVideoId, isYouTubeUrl } from '../../../lib/youtube-utils';
import VideoCard from '../components/VideoCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { useUnifiedVideo } from '../../../hooks/unified/useVideos';

import type { Video } from '../../../types/core';

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { data: unifiedVideo, loading, error } = useUnifiedVideo(videoId);
  const video = unifiedVideo?.data;

  const [_recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [_showFullDescription, _setShowFullDescription] = useState(false);

  useEffect(() => {
    if (videoId) {
      loadRecommendations();
    }
  }, [videoId]);



  const loadRecommendations = async () => {
    try {
      // Mock recommended videos with enhanced metadata
      const mockRecommendations: Video[] = [
        {
          id: 'rec1',
          createdAt: '2024-01-10T14:20:00Z',
          updatedAt: '2024-01-10T14:20:00Z',
          title: 'React Testing Library Complete Guide',
          description: 'Learn how to test React components effectively with React Testing Library and Jest.',
          thumbnailUrl: 'https://picsum.photos/seed/react-testing/1280/720',
          videoUrl: '/api/placeholder/video2',
          duration: '1725',
          views: '67000',
          viewCount: 67000,
          likes: 890,
          likeCount: 890,
          dislikeCount: 12,
          commentCount: 156,
          dislikes: 12,
          uploadedAt: '2024-01-10T14:20:00Z',
          publishedAt: '2024-01-10T14:20:00Z',
          channelName: 'Testing Guru',
          channelId: 'testingguru',
          channelAvatarUrl: 'https://picsum.photos/seed/testingguru/150/150',
          category: 'Education',
          tags: ['react', 'testing', 'javascript'],
          isLive: false,
          isShort: false,
          visibility: 'public',
          license: 'Standard YouTube License',
          isUpcoming: false,
          isLiveContent: false,
          isFamilySafe: true,
          allowedRegions: [],
          blockedRegions: [],
          isAgeRestricted: false,
          embeddable: true,
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
          recordingStatus: 'recorded',
          uploadStatus: 'processed',
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
          statistics: {
            viewCount: 67000,
            likeCount: 890,
            dislikeCount: 12,
            favoriteCount: 0,
            commentCount: 156,
          },
          topicDetails: {
            topicIds: [],
            relevantTopicIds: [],
            topicCategories: [],
          },
          contentDetails: {
            duration: 'PT28M45S',
            dimension: '2d',
            definition: 'hd',
            caption: 'false',
            licensedContent: false,
            contentRating: {},
            projection: 'rectangular',
          },
        },
      ];
      setRecommendedVideos(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };


  // const _handleSubscribe = () => {
  //   setIsSubscribed(!isSubscribed);
  // };


  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Video not found</h1>
          <Link to="/" className="text-red-600 hover:text-red-700">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              {isYouTubeUrl(video.videoUrl || '') ? (
                <YouTubePlayer
                  videoId={getYouTubeVideoId(video.videoUrl || '') || video.id}
                  autoplay={false}
                  width="100%"
                  height={480}
                  controls={true}
                />
              ) : (
                <VideoPlayer
                  videoId={video.id}
                  src={video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  autoplay={false}
                  className="w-full"
                  useYouTube={false}
                  onTimeUpdate={(_currentTime, _duration) => {
                    // Track watch progress
                    }}
                  onPlay={() => {
                    // Handle play event
                  }}
                />
              )}
            </div>

            {/* Video Metadata */}
            <div className="space-y-4">
              {/* Video Title */}
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {video.title}
              </h1>

              {/* Channel Metadata Section - Mirroring search results styling */}
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                {/* Channel Avatar */}
                <Link to={`/channel/${video.channel?.id || video.channelId}`} className="flex-shrink-0">
                  <img
                    src={video.channel?.avatarUrl || video.channelAvatarUrl || 'https://picsum.photos/seed/default-channel/150/150'}
                    alt={video.channel?.name || video.channelName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </Link>
                
                {/* Channel Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/channel/${video.channel?.id || video.channelId}`}
                    className="font-medium text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors block"
                  >
                    {video.channel?.name || video.channelName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {/* Subscriber Count */}
                    <span>
                      {video.channel?.subscribersFormatted || '0 subscribers'}
                    </span>
                    <span>•</span>
                    {/* View Count */}
                    <span>
                      {video.viewsFormatted || '0 views'}
                    </span>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium">
                  Subscribe
                </button>
              </div>

              {/* Video Stats and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{new Date(video.publishedAt || video.uploadedAt || video.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2.5" />
                    </svg>
                    <span>{(video.likeCount || video.likes || 0).toLocaleString()}</span>
                  </button>

                  {/* Dislike Button */}
                  {video.dislikeCount && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2.5" />
                      </svg>
                      <span>{video.dislikeCount.toLocaleString()}</span>
                    </button>
                  )}

                  {/* Share Button */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Channel Information */}
              <div className="flex items-start gap-4">
                <Link to={`/channel/${video.channel?.id || video.channelId}`} className="flex-shrink-0">
                  <img
                    src={video.channel?.avatarUrl || video.channelAvatarUrl || 'https://picsum.photos/seed/default-channel/150/150'}
                    alt={video.channel?.name || video.channelName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div>
                    <Link
                      to={`/channel/${video.channel?.id || video.channelId}`}
                      className="font-semibold text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {video.channel?.name || video.channelName}
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {video.channel?.subscribersFormatted || '0 subscribers'} • {video.viewsFormatted || '0 views'}
                    </p>
                  </div>

                  {/* Video Description */}
                  <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                      {video.description}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Additional Metadata */}
                    <div className="mt-4 space-y-3">
                      {/* Basic Stats */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                        <div>
                          <span className="font-medium">Category:</span> {video.category}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {video.duration || '0:00'}
                        </div>
                        <div>
                          <span className="font-medium">Views:</span> {video.viewsFormatted}
                        </div>
                        <div>
                          <span className="font-medium">Likes:</span> {(video.likes || 0).toLocaleString()}
                        </div>
                        {video.commentCount && (
                          <div>
                            <span className="font-medium">Comments:</span> {video.commentCount.toLocaleString()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Source:</span> {video.source || 'local'}
                        </div>
                      </div>
                      
                      {/* YouTube Specific Metadata */}
                      {video.source === 'youtube' && (
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-600">
                          <h4 className="font-medium text-sm text-neutral-800 dark:text-neutral-200 mb-2">YouTube Metadata</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <div>
                              <span className="font-medium">Published:</span> {video.publishedAtFormatted}
                            </div>
                            <div>
                              <span className="font-medium">Quality:</span> {video.metadata?.definition || 'Unknown'}
                            </div>
                            <div>
                              <span className="font-medium">Captions:</span> {video.metadata?.captions ? 'Available' : 'None'}
                            </div>
                            <div>
                              <span className="font-medium">License:</span> {video.metadata?.license || 'Standard'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Channel Metadata */}
                      {video.channel && (
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-600">
                          <h4 className="font-medium text-sm text-neutral-800 dark:text-neutral-200 mb-2">Channel Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <div>
                              <span className="font-medium">Channel ID:</span> {video.channel.id}
                            </div>
                            <div>
                              <span className="font-medium">Subscribers:</span> {video.channel.subscribersFormatted}
                            </div>
                            <div>
                              <span className="font-medium">Verified:</span> {video.channel.isVerified ? 'Yes' : 'No'}
                            </div>
                            <div>
                              <span className="font-medium">Name:</span> {video.channel.name}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Debug Info */}
                      <details className="pt-3 border-t border-neutral-200 dark:border-neutral-600">
                        <summary className="cursor-pointer text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                          Raw Video Data (Debug)
                        </summary>
                        <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded text-xs overflow-auto max-h-40 text-neutral-700 dark:text-neutral-300">
                          {JSON.stringify(video, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Recommended Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Recommended Videos
            </h3>
            <div className="space-y-4">
              {_recommendedVideos.map((recommendedVideo) => (
                <VideoCard
                  key={recommendedVideo.id}
                  video={recommendedVideo}
                  variant="compact"
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
