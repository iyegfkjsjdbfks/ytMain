import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../../comments/components/CommentSection';
import { VideoInteractions } from '../components/VideoInteractions';
import { formatCount } from '../../../utils/numberUtils';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  FlagIcon,
  EllipsisHorizontalIcon,
  BellIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  channel: {
    id: string;
    name: string;
    avatar: string;
    subscribers: number;
    isVerified: boolean;
  };
  tags: string[];
  category: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
  isPinned?: boolean;
}

interface RecommendedVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  uploadedAt: string;
  duration: string;
}

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<RecommendedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSortOrder, setCommentSortOrder] = useState<'top' | 'newest'>('top');

  useEffect(() => {
    if (videoId) {
      loadVideoData(videoId);
      loadComments(videoId);
      loadRecommendations();
    }
  }, [videoId]);

  const loadVideoData = async (id: string) => {
    setLoading(true);
    try {
      // Mock video data
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
        thumbnail: 'https://picsum.photos/seed/react-tutorial/1280/720',
        videoUrl: '/api/placeholder/video',
        duration: 3420, // 57 minutes
        views: 125847,
        likes: 8934,
        dislikes: 127,
        uploadDate: '2024-01-15T10:30:00Z',
        channel: {
          id: 'tech-insights',
          name: 'Tech Insights',
          avatar: 'https://picsum.photos/seed/tech-insights/150/150',
          subscribers: 892000,
          isVerified: true
        },
        tags: ['React', 'JavaScript', 'Web Development', 'Programming', 'Tutorial'],
        category: 'Education'
      };
      setVideo(mockVideo);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (id: string) => {
    try {
      // Mock comments data
      const mockComments: Comment[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah Developer',
          userAvatar: 'https://picsum.photos/seed/sarah/150/150',
          content: 'This is exactly what I needed! The custom hooks section was particularly helpful. Thanks for the clear explanations!',
          timestamp: '2024-01-16T14:30:00Z',
          likes: 234,
          isLiked: false,
          isPinned: true,
          replies: [
            {
              id: '1-1',
              userId: 'tech-insights',
              userName: 'Tech Insights',
              userAvatar: 'https://picsum.photos/seed/tech-insights/150/150',
              content: 'Thank you Sarah! Glad it helped. More advanced React content coming soon!',
              timestamp: '2024-01-16T15:45:00Z',
              likes: 45,
              isLiked: false,
              replies: []
            }
          ]
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike Frontend',
          userAvatar: 'https://picsum.photos/seed/mike/150/150',
          content: 'Great tutorial! Could you do a follow-up on React Server Components?',
          timestamp: '2024-01-16T16:20:00Z',
          likes: 89,
          isLiked: false,
          replies: []
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Alex CodeMaster',
          userAvatar: 'https://picsum.photos/seed/alex/150/150',
          content: 'The performance optimization section saved me hours of debugging. Subscribed!',
          timestamp: '2024-01-16T18:10:00Z',
          likes: 156,
          isLiked: false,
          replies: []
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Mock recommended videos
      const mockRecommendations: RecommendedVideo[] = [
        {
          id: 'rec1',
          title: 'Next.js 14 Complete Guide',
          thumbnail: 'https://picsum.photos/seed/nextjs/320/180',
          channelName: 'Web Dev Pro',
          channelAvatar: 'https://picsum.photos/seed/webdevpro/150/150',
          views: '89K views',
          uploadedAt: '3 days ago',
          duration: '45:32'
        },
        {
          id: 'rec2',
          title: 'TypeScript Advanced Types',
          thumbnail: 'https://picsum.photos/seed/typescript/320/180',
          channelName: 'Code Academy',
          channelAvatar: 'https://picsum.photos/seed/codeacademy/150/150',
          views: '156K views',
          uploadedAt: '1 week ago',
          duration: '32:18'
        },
        {
          id: 'rec3',
          title: 'React Testing Library Tutorial',
          thumbnail: 'https://picsum.photos/seed/testing/320/180',
          channelName: 'Testing Guru',
          channelAvatar: 'https://picsum.photos/seed/testingguru/150/150',
          views: '67K views',
          uploadedAt: '5 days ago',
          duration: '28:45'
        }
      ];
      setRecommendedVideos(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://picsum.photos/seed/currentuser/150/150',
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
              <VideoPlayer
                videoId={video.id}
                src={video.videoUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`}
                poster={video.thumbnailUrl}
                title={video.title}
                autoplay={false}
                className="w-full"
                useYouTube={false}
                onTimeUpdate={(currentTime, duration) => {
                  // Track watch progress
                  console.log(`Watch progress: ${currentTime}/${duration}`);
                }}
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
                onEnded={() => console.log('Video ended')}
              />
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {video.title}
              </h1>

              {/* Video Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{formatCount(video.views)} views</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(video.uploadDate))}</span>
                </div>

                <VideoInteractions
                  videoId={video.id}
                  channelId={video.channel.id}
                  initialLikes={video.likes}
                  initialDislikes={video.dislikes}
                  className="flex-wrap"
                />
              </div>

              {/* Channel Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={video.channel.avatar}
                    alt={video.channel.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {video.channel.name}
                      </h3>
                      {video.channel.isVerified && (
                        <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatCount(video.channel.subscribers)} subscribers
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isSubscribed
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellSolidIcon className="w-4 h-4" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-white font-medium">
                    <span>{formatCount(video.views)} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.uploadDate))}</span>
                  </div>
                  <div className={`whitespace-pre-wrap ${
                    showFullDescription ? '' : 'line-clamp-3'
                  }`}>
                    {video.description}
                  </div>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-neutral-900 dark:text-white font-medium mt-2 hover:underline"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection
                videoId={video.id}
                channelId={video.channel.id}
                isChannelOwner={false} // This should be determined based on current user
                className="mt-6"
              />
            </div>
          </div>

          {/* Sidebar - Recommended Videos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              Recommended
            </h3>
            <div className="space-y-3">
              {recommendedVideos.map((video) => (
                <Link
                  key={video.id}
                  to={`/watch/${video.id}`}
                  className="flex gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-white line-clamp-2 mb-1">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1 mb-1">
                      <img
                        src={video.channelAvatar}
                        alt={video.channelName}
                        className="w-4 h-4 rounded-full"
                      />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {video.channelName}
                      </p>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      <span>{video.views}</span>
                      <span className="mx-1">•</span>
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
