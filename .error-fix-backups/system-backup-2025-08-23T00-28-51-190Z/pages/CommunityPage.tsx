import React, { useEffect, useState, FC } from 'react';
import { ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { ShareIcon } from '@heroicons/react/24/outline';
const HeartIconSolid = HeartSolidIcon;

interface CommunityPost {
 id: string;
 type: "text" | 'image' | 'poll' | 'video';
 content: string;
 imageUrl?: string;
 videoUrl?: string;
 pollOptions?: Array<{ id: string; text: string; votes: number }>;
 likes: number;
 comments: number;
 shares: number;
 isLiked: boolean;
 createdAt: Date;
 engagement: {
 views: number;
 clickThroughRate: number;
 };
};
interface CommunityStats {
 totalPosts: number;
 totalEngagement: number;
 averageLikes: number;
 averageComments: number;
 topPerformingPost: string;
 reachGrowth: number;
}

const formatDate = (date: Date) => {
 const now = new Date();
 const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

 if (diffInHours < 1) {
return 'Just now';
}
 if (diffInHours < 24) {
return `${diffInHours}h ago`;
}
 if (diffInHours < 168) {
return `${Math.floor(diffInHours / 24)}d ago`;
}
 return date.toLocaleDateString();
};

const CommunityPage: React.FC = () => {
 const [posts, setPosts] = useState<CommunityPost[]>([]);
 const [newPostContent, setNewPostContent] = useState<string>('');
 const [newPostType, setNewPostType] = useState<'text' | 'image' | 'poll'>('text');
 const [pollOptions, setPollOptions] = useState(['', '']);
 const [showCreatePost, setShowCreatePost] = useState<boolean>(false);
 const [selectedTab, setSelectedTab] = useState<'posts' | 'analytics'>('posts');
 const [loading, setLoading] = useState<boolean>(true);
 const [stats, setStats] = useState<CommunityStats | null>(null);

 const handleCreatePost = () => {
 if (!newPostContent.trim()) {
return;
}

 const newPost: CommunityPost = {
 id: `post-${Date.now()}`,
 type: newPostType,
 content: newPostContent,
 ...(newPostType === 'image' && { imageUrl: '/api/placeholder/600/400' }),
 pollOptions: newPostType === 'poll' ? pollOptions.filter((opt) => opt.trim()).map((opt, idx) => ({
 id: `option-${idx}`,
 text: opt,
 votes: 0 })) : [],
 likes: 0,
 comments: 0,
 shares: 0,
 isLiked: false,
 createdAt: new Date(),
 engagement: {
 views: 0,
 clickThroughRate: 0 }
 };

 setPosts([newPost, ...posts]);
 setNewPostContent('');
 setPollOptions(['', '']);
 setShowCreatePost(false);
 };

 const toggleLike = (postId) => {
 setPosts(posts.map((post) =>
 post.id === postId
 ? { ...post as any, isLiked: !post.isLiked,
 likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
 : post));
 };

 // Generate mock data
 useEffect(() => {
 const generateMockPosts = (): CommunityPost[] => {
 const postTypes: Array<'text' | 'image' | 'poll'> = ['text', 'image', 'poll'];
 const sampleContent = [
 "What's your favorite video editing software? Let me know in the comments!",
 'Behind the scenes of my latest video shoot 📸',
 'Which topic should I cover next?',
 'Thank you for 100K subscribers! 🎉 This journey has been incredible.',
 'Quick tip: Always backup your footage before editing!',
 "New video dropping tomorrow! Can you guess what it's about? 🤔"];

 const pollQuestions = [
 {
 content: 'Which video format do you prefer?',
 options: ['Long-form tutorials', 'Quick tips', 'Live streams', 'Shorts'] },
 {
 content: 'What time do you usually watch YouTube?',
 options: ['Morning', 'Afternoon', 'Evening', 'Late night'] },
 {
 content: 'Which collaboration would you like to see?',
 options: ['Tech reviewer', 'Gaming channel', 'Lifestyle vlogger', 'Educational creator'] }];

 return Array.from({ length: 12 }, (_, i) => {
 const type = postTypes[Math.floor(Math.random() * postTypes.length)] || 'text';

 let content = sampleContent[Math.floor(Math.random() * sampleContent.length)] || 'Default content';
 let pollOptions: Array<{ id: string; text: string; votes: number }> | undefined;

 if (type === 'poll') {
 const pollQuestion = pollQuestions[Math.floor(Math.random() * pollQuestions.length)];
 if (pollQuestion) {
 const { content: pollContentValue,
 options: pollOptionsData } = pollQuestion;
 content = pollContentValue;
 pollOptions = pollOptionsData.map((option, idx) => ({
 id: `option-${idx}`,
 text: option,
 votes: Math.floor(Math.random() * 500) + 50 }));
 }
 return {
 id: `post-${i + 1}`,
 type,
 content,
 imageUrl: type === 'image' ? `https://picsum.photos/600/400?random=${i}` : '',
 pollOptions: pollOptions || [],
 likes: Math.floor(Math.random() * 2000) + (i < 3 ? 500 : 100),
 comments: Math.floor(Math.random() * 300) + (i < 3 ? 50 : 10),
 shares: Math.floor(Math.random() * 100) + (i < 3 ? 20 : 5),
 isLiked: Math.random() > 0.7,
 createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
 engagement: {
 views: Math.floor(Math.random() * 10000) + (i < 3 ? 2000 : 500),
 clickThroughRate: Math.random() * 15 + 2 } }}).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
 };

 const generateMockStats = (posts: CommunityPost): CommunityStats => {
 const totalLikes = posts.reduce((sum,
 post) => sum + post.likes, 0);
 const totalComments = posts.reduce((sum,
 post) => sum + post.comments, 0);
 const topPost = posts.length > 0 ? posts.reduce((top,
 post) =>
 post.likes > (top?.likes || 0) ? post : top, posts[0]) : null;

 return {
 totalPosts: posts.length,
 totalEngagement: totalLikes + totalComments,
 averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
 averageComments: posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
 topPerformingPost: topPost ? `${topPost.content.substring(0, 50) }...` : 'No posts yet',
 reachGrowth: Math.random() * 20 + 5 };

 setTimeout((() => {
 const mockPosts = generateMockPosts();
 setPosts(mockPosts);
 setStats(generateMockStats(mockPosts));
 setLoading(false);
 }) as any, 1000);
 }, []);

 if (loading) {
 return (
 <div className={"min}-h-screen bg-gray-50 dark:bg-gray-900 p-6">
 <div className={"max}-w-4xl mx-auto">
 <div className={"animate}-pulse">
 <div className={"h}-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
 <div className={"space}-y-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className={"bg}-white dark:bg-gray-800 rounded-lg p-6">
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
 <div className={"h}-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
 <div className={"fle}x space-x-4">
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={"min}-h-screen bg-gray-50 dark:bg-gray-900 p-6">
 <div className={"max}-w-4xl mx-auto">
 {/* Header */}
 <div className={"mb}-8">
 <h1 className={"text}-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
 <p className={"text}-gray-600 dark:text-gray-400">Connect with your audience through posts, polls, and updates</p>
// FIXED:  </div>

 {/* Tabs */}
 <div className={"fle}x space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
 <button />
// FIXED:  onClick={() => setSelectedTab('posts')}
// FIXED:  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
 selectedTab === 'posts'
 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
 : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
 >
 Posts
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setSelectedTab('analytics')}
// FIXED:  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
 selectedTab === 'analytics'
 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
 : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
 >
 Analytics
// FIXED:  </button>
// FIXED:  </div>

 {selectedTab === 'posts' ? (
 <div>
 {/* Create Post Button */}
 <div className={"mb}-6">
 <button />
// FIXED:  onClick={() => setShowCreatePost(true)}
// FIXED:  className={"fle}x items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
 >
 <PlusIcon className={"w}-5 h-5" />
 <span>Create Post</span>
// FIXED:  </button>
// FIXED:  </div>

 {/* Create Post Modal */}
 {showCreatePost && (
 <div className={"fixe}d inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Post</h3>

 {/* Post Type Selection */}
 <div className={"fle}x space-x-2 mb-4">
 {(['text', 'image', 'poll'] as const).map((type) => (
 <button>
 key={type} />
// FIXED:  onClick={() => setNewPostType(type)}
// FIXED:  className={`px-3 py-1 rounded-md text-sm capitalize ${
 newPostType === type
 ? 'bg-blue-600 text-white'
 : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
 }`}
 >
 {type}
// FIXED:  </button>
 ))}
// FIXED:  </div>

 {/* Content Input */}
 <textarea>
// FIXED:  value={newPostContent} />
// FIXED:  onChange={(e) => setNewPostContent(e.target.value)}
// FIXED:  placeholder="What's on your mind?"
// FIXED:  className={"w}-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
 rows={4}
 />

 {/* Poll Options */}
 {newPostType === 'poll' && (
 <div className={"mt}-4 space-y-2">
 {pollOptions.map((option, index) => (
 <input>
 key={index}
// FIXED:  value={option} />
// FIXED:  onChange={(e) => {
 const newOptions = [...pollOptions];
 newOptions[index] = e.target.value;
 setPollOptions(newOptions);
 }
// FIXED:  placeholder={`Option ${index + 1}`}
// FIXED:  className={"w}-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 />
 ))}
 {pollOptions.length < 4 && (
 <button />
// FIXED:  onClick={() => setPollOptions([...pollOptions as any, ''])}
// FIXED:  className={"text}-blue-600 hover:text-blue-700 text-sm"
 >
 + Add option
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}

 {/* Actions */}
 <div className={"fle}x justify-end space-x-3 mt-6">
 <button />
// FIXED:  onClick={() => setShowCreatePost(false)}
// FIXED:  className={"px}-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e) => handleCreatePost(e)}
// FIXED:  disabled={!newPostContent.trim()}
// FIXED:  className={"px}-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
 >
 Post
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Posts List */}
 <div className={"space}-y-6">
 {posts.map((post) => (
 <div key={post.id} className={"bg}-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
 {/* Post Header */}
 <div className={"fle}x items-center justify-between mb-4">
 <div className={"fle}x items-center space-x-3">
 <div className={"w}-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
 <span className={"text}-white font-semibold">YC</span>
// FIXED:  </div>
 <div>
 <p className={"font}-semibold text-gray-900 dark:text-white">Your Channel</p>
 <p className={"text}-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
// FIXED:  </div>
// FIXED:  </div>
 <button />
// FIXED:  onClick={() => {
 // Show post options menu

 }
// FIXED:  className={"text}-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
 title="Post options"
 >
 <EllipsisHorizontalIcon className={"w}-5 h-5" />
// FIXED:  </button>
// FIXED:  </div>

 {/* Post Content */}
 <div className={"mb}-4">
 <p className={"text}-gray-900 dark:text-white mb-3">{post.content}</p>

 {post.type === 'image' && post.imageUrl && (
 <img>
// FIXED:  src={post.imageUrl}
// FIXED:  alt="Post content"
// FIXED:  className={"w}-full max-w-md rounded-lg" />
 />
 )}

 {post.type === 'poll' && post.pollOptions && (
 <div className={"space}-y-2 mt-3">
 {post.pollOptions.map((option) => {
 const pollOptions = post.pollOptions!;
 const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);
 const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

 return (
 <div key={option.id} className={"relative}">
 <div className={"fle}x justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
 <span className={"text}-gray-900 dark:text-white">{option.text}</span>
 <span className={"text}-sm text-gray-500 dark:text-gray-400">
 {option.votes} ({percentage.toFixed(1)}%)
// FIXED:  </span>
// FIXED:  </div>
 <div>
// FIXED:  className={"absolut}e left-0 top-0 h-full bg-blue-100 dark:bg-blue-900 rounded-lg transition-all duration-300"
// FIXED:  style={{ width: `${percentage}%`,
 zIndex: -1 } />
 />
// FIXED:  </div>
 );
 })}
 <p className={"text}-sm text-gray-500 dark:text-gray-400 mt-2">
 {post.pollOptions.reduce((sum, opt) => sum + opt.votes, 0)} votes
// FIXED:  </p>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Post Actions */}
 <div className={"fle}x items-center space-x-6 pt-3 border-t border-gray-100 dark:border-gray-700">
 <button />
// FIXED:  onClick={() => toggleLike(post.id)}
// FIXED:  className={"fle}x items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
 >
 {post.isLiked ? (
 <HeartIconSolid className={"w}-5 h-5 text-red-600" />
 ) : (
 <HeartIcon className={"w}-5 h-5" />
 )}
 <span className={"text}-sm">{post.likes}</span>
// FIXED:  </button>

 <button />
// FIXED:  onClick={() => {
 // Show comments for this post

 }
// FIXED:  className={"fle}x items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
 title="View comments"
 >
 <ChatBubbleLeftIcon className={"w}-5 h-5" />
 <span className={"text}-sm">{post.comments}</span>
// FIXED:  </button>

 <button />
// FIXED:  onClick={() => {
 // Share this post

 }
// FIXED:  className={"fle}x items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
 title="Share post"
 >
 <ShareIcon className={"w}-5 h-5" />
 <span className={"text}-sm">{post.shares}</span>
// FIXED:  </button>

 <div className={"flex}-1" />

 <div className={"text}-sm text-gray-500 dark:text-gray-400">
 {post.engagement.views.toLocaleString()} views
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 ) : (
 /* Analytics Tab */
 <div>
 {stats && (
 <div className={"gri}d grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Total Posts</h3>
 <p className={"text}-3xl font-bold text-blue-600">{stats.totalPosts}</p>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Total Engagement</h3>
 <p className={"text}-3xl font-bold text-green-600">{stats.totalEngagement.toLocaleString()}</p>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Reach Growth</h3>
 <p className={"text}-3xl font-bold text-purple-600">+{stats.reachGrowth.toFixed(1)}%</p>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Avg. Likes</h3>
 <p className={"text}-3xl font-bold text-red-600">{stats.averageLikes}</p>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Avg. Comments</h3>
 <p className={"text}-3xl font-bold text-yellow-600">{stats.averageComments}</p>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-2">Top Performing</h3>
 <p className={"text}-sm text-gray-600 dark:text-gray-400">{stats.topPerformingPost}</p>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Engagement Chart Placeholder */}
 <div className={"bg}-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
 <h3 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement Over Time</h3>
 <div className={"h}-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
 <div className={"text}-center">
 <ChartBarIcon className={"w}-12 h-12 text-gray-400 mx-auto mb-2" />
 <p className={"text}-gray-500 dark:text-gray-400">Chart visualization would go here</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default CommunityPage;
