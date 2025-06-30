import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';

import { YouTubePlayer } from '../../../../components/YouTubePlayer';
import { getYouTubeVideoId, isYouTubeUrl } from '../../../lib/youtube-utils';
import VideoCard from '../components/VideoCard';
import { VideoPlayer } from '../components/VideoPlayer';

import type { Video } from '../../../types/core';

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  const [_recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(true);
  const [_showFullDescription, _setShowFullDescription] = useState(false);
  // const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
    if (videoId) {
      loadVideoData(videoId);
      // loadComments(videoId); // Removed as comments are handled by CommentSection component
      loadRecommendations();
    }
  }, [videoId]);

  const loadVideoData = async (id: string) => {
    setLoading(true);
    try {
      // Mock video data with enhanced metadata
      const mockVideo: Video = {
        id,
        title: 'Advanced React Patterns and Best Practices 2024',
        description: `In this comprehensive tutorial, we'll explore advanced React patterns that every developer should know in 2024. We'll cover:

🔥 Key Topics:
• Custom Hooks and Advanced Hook Patterns
• Compound Components
• Render Props vs Children as Functions
• Higher-Order Components (HOCs)
• Context API Best Practices
• Performance Optimization Techniques
• Error Boundaries and Suspense
• TypeScript Integration

⏰ Timestamps:
0:00 Introduction
2:30 Custom Hooks Deep Dive
8:15 Compound Components Pattern
15:45 Render Props Explained
22:10 HOCs in Modern React
28:30 Context API Mastery
35:20 Performance Tips
42:15 Error Handling
48:30 TypeScript Best Practices
55:00 Conclusion

📚 Resources:
• GitHub Repository: https://github.com/example/react-patterns
• Documentation: https://reactpatterns.dev
• Discord Community: https://discord.gg/reactdev

🏷️ Tags: #React #JavaScript #WebDevelopment #Programming #Tutorial`,
        thumbnailUrl: 'https://picsum.photos/seed/react-tutorial/1280/720',
        videoUrl: '/api/placeholder/video',
        duration: 3420, // 57 minutes in seconds
        views: 125847, // Legacy field
        viewCount: 125847,
        likes: 8934, // Legacy field
        likeCount: 8934,
        dislikeCount: 127,
        commentCount: 342,
        dislikes: 127,
        uploadedAt: '2024-01-15T10:30:00Z',
        publishedAt: '2024-01-15T10:30:00Z',
        channelName: 'Tech Insights',
        channelId: 'tech-insights',
        channelAvatarUrl: 'https://picsum.photos/seed/tech-insights/150/150',
        tags: ['React', 'JavaScript', 'Web Development', 'Programming', 'Tutorial'],
        category: 'Education',
        isLive: false,
        isShort: false,
        visibility: 'public' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        // Enhanced metadata fields
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
          viewCount: 125847,
          likeCount: 8934,
          dislikeCount: 127,
          favoriteCount: 0,
          commentCount: 342,
        },
        topicDetails: {
          topicIds: [],
          relevantTopicIds: [],
          topicCategories: [],
        },
        contentDetails: {
          duration: 'PT57M0S',
          dimension: '2d',
          definition: 'hd',
          caption: 'false',
          licensedContent: false,
          contentRating: {},
          projection: 'rectangular',
        },
      };
      setVideo(mockVideo);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };


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
          duration: 1725,
          views: 67000,
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

              {/* Video Stats and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{(video.viewCount || video.views || 0).toLocaleString()} views</span>
                  <span>•</span>
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
                <Link to={`/channel/${video.channelId}`} className="flex-shrink-0">
                  <img
                    src={video.channelAvatarUrl || 'https://picsum.photos/seed/default-channel/150/150'}
                    alt={video.channelName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/channel/${video.channelId}`}
                        className="font-semibold text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        {video.channelName}
                      </Link>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {video.statistics?.viewCount ? `${video.statistics.viewCount.toLocaleString()} total views` : 'Channel'}
                      </p>
                    </div>

                    <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium">
                      Subscribe
                    </button>
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
                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                      <div>
                        <span className="font-medium">Category:</span> {video.category}
                      </div>
                      {video.commentCount && (
                        <div>
                          <span className="font-medium">Comments:</span> {video.commentCount.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">License:</span> {video.license || 'Standard YouTube License'}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {typeof video.duration === 'number' ?
                          `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` :
                          video.duration
                        }
                      </div>
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
