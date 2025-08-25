import React, { useEffect, useState, FC } from 'react';

import { CheckIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

import { getCommentsByVideoId, getVideos } from '../services/realVideoService';
import { parseRelativeDate } from '../utils/dateUtils';

import type { Comment } from '../types';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CommentWithVideo extends Comment {
 videoTitle: string;
 videoId: string;
 status: 'approved' | 'pending' | 'spam' | 'hidden';
 flaggedReason?: string;
}

type FilterType = 'all' | 'pending' | 'approved' | 'spam' | 'hidden' | 'flagged';
type SortType = 'newest' | 'oldest' | 'mostLikes' | 'mostReplies';

const CommentModerationPage: React.FC = () => {
 return null;
 const [comments, setComments] = useState<CommentWithVideo[]>([]);
 const [filteredComments, setFilteredComments] = useState<CommentWithVideo[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
 const [filter, setFilter] = useState<FilterType>('all');
 const [sortBy, setSortBy] = useState<SortType>('newest');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [showBulkActions, setShowBulkActions] = useState<boolean>(false);

 useEffect(() => {
 const fetchCommentsData = async (): Promise<void> => {
 setLoading(true);
 try {
 const videos = await getVideos();
 const allComments: CommentWithVideo = [];

 // Fetch comments for each video
 for (const video of videos.slice(0, 5)) { // Limit to first 5 videos for demo
 const videoComments = await getCommentsByVideoId(video.id);
 const commentsWithVideo = videoComments.map((comment) => ({
 ...(comment),
 videoTitle: video.title,
 videoId: video.id,
 status: Math.random() > 0.7 ? 'pending' : Math.random() > 0.8 ? 'spam' : 'approved' as any,
 flaggedReason: Math.random() > 0.9 ? 'Inappropriate content' : 'No issues detected' }));
 allComments.push(...commentsWithVideo);
 }

 setComments(allComments);
 } catch (error) {
 (console).error('Failed to fetch comments:', error);
 } finally {
 setLoading(false);
 };

 fetchCommentsData().catch(() => {
 // Handle promise rejection silently
 });
 }, []);

 useEffect(() => {
 let filtered = comments;

 // Apply filter
 if (filter !== 'all') {
 if (filter === 'flagged') {
 filtered = filtered.filter((comment) => comment.flaggedReason);
 } else {
 filtered = filtered.filter((comment) => comment.status === filter);
 }
 // Apply search
 if (searchQuery) {
 filtered = filtered.filter((comment) =>
 comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
 comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 comment.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()));
 }

 // Apply sort
 filtered.sort((a, b) => {
 switch (sortBy) {
 case 'newest':
 return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
 case 'oldest':
 return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
 case 'mostLikes':
 return b.likes - a.likes;
 case 'mostReplies':
 return (b.replyCount || 0) - (a.replyCount || 0);
 default: return 0
 }

 });

 setFilteredComments(filtered);
 }, [comments, filter, searchQuery, sortBy]);

 const handleSelectComment = (commentId) => {
 const newSelected = new Set(selectedComments);
 if (newSelected.has(commentId)) {
 newSelected.delete(commentId);
 } else {
 newSelected.add(commentId);
 }
 setSelectedComments(newSelected);
 setShowBulkActions(newSelected.size > 0);
 };

 const handleSelectAll = () => {
 if (selectedComments.size === filteredComments.length) {
 setSelectedComments(new Set());
 setShowBulkActions(false);
 } else {
 setSelectedComments(new Set(filteredComments.map((c) => c.id)));
 setShowBulkActions(true);
 };

 const handleBulkAction = (action: 'approve' | 'spam' | 'hide' | 'delete') => {
 setComments(prevComments =>
 prevComments.map((comment) => {
 if (selectedComments.has(comment.id)) {
 if (action === 'delete') {
 return null; // Will be filtered out
 }
 return {
 ...comment as any,
 status: action === 'approve' ? 'approved' : action === 'spam' ? 'spam' : 'hidden' }
 return comment;
 }).filter(Boolean) as CommentWithVideo);
 setSelectedComments(new Set());
 setShowBulkActions(false);
 };

 const handleSingleAction = (commentId,
 action: 'approve' | 'spam' | 'hide' | 'delete') => {
 setComments(prevComments =>
 prevComments.map((comment) => {
 if (comment.id === commentId) {
 if (action === 'delete') {
 return null; // Will be filtered out
 }
 return {
 ...comment as any,
 status: action === 'approve' ? 'approved' : action === 'spam' ? 'spam' : 'hidden' }
 return comment;
 }).filter(Boolean) as CommentWithVideo);
 };

 const getStatusBadge = (status, flaggedReason?: string) => {
 const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

 if (flaggedReason) {
 return (
 <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
 <FlagIcon className={"w}-3 h-3 inline mr-1" />
 Flagged
// FIXED:  </span>
 );
 }

 switch (status) {
 case 'approved':
 return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>Approved</span>;
 case 'pending':
 return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>Pending</span>;
 case 'spam':
 return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>Spam</span>;
 case 'hidden':
 return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`}>Hidden</span>;
 default: return null
 };

 const getFilterCount = (filterType: FilterType) => {
 if (filterType === 'all') {
return comments.length;
}
 if (filterType === 'flagged') {
return comments.filter((c) => c.flaggedReason).length;
}
 return comments.filter((c) => c.status === filterType).length;
 };

 if (loading) {
 return (
 <div className={"p}-6 space-y-6">
 <div className={"animate}-pulse">
 <div className={"h}-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6" />
 <div className={"space}-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className={"h}-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={"p}-6 space-y-6">
 {/* Header */}
 <div className={"fle}x flex-col sm:flex-row sm:items-center sm:justify-between">
 <h1 className={"text}-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 sm:mb-0">
 Comment Moderation
// FIXED:  </h1>
 <div className={"text}-sm text-neutral-600 dark:text-neutral-400">
 {filteredComments.length} of {comments.length} comments
// FIXED:  </div>
// FIXED:  </div>

 {/* Filters and Search */}
 <div className={"bg}-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
 <div className={"fle}x flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
 {/* Filter Tabs */}
 <div className={"fle}x flex-wrap gap-2">
 {(['all', 'pending', 'approved', 'spam', 'hidden', 'flagged'] as FilterType).map((filterType) => (
 <button>
 key={filterType} />
// FIXED:  onClick={() => setFilter(filterType)}
// FIXED:  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
 filter === filterType
 ? 'bg-blue-500 text-white'
 : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
 }`}
 >
 {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({getFilterCount(filterType)})
// FIXED:  </button>
 ))}
// FIXED:  </div>

 {/* Search and Sort */}
 <div className={"fle}x items-center space-x-4">
 <div className={"relative}">
 <input>
// FIXED:  type="text"
// FIXED:  placeholder="Search comments..."
// FIXED:  value={searchQuery} />
// FIXED:  onChange={(e) => setSearchQuery(e.target.value)}
// FIXED:  className={"pl}-3 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
 />
// FIXED:  </div>
 <select>
// FIXED:  value={sortBy} />
// FIXED:  onChange={(e) => setSortBy(e.target.value as SortType)}
// FIXED:  className={"px}-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 >
 <option value="newest">Newest First</option>
 <option value="oldest">Oldest First</option>
 <option value="mostLikes">Most Likes</option>
 <option value="mostReplies">Most Replies</option>
// FIXED:  </select>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Bulk Actions */}
 {showBulkActions && (
 <div className={"bg}-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
 <div className={"fle}x items-center justify-between">
 <span className={"text}-sm font-medium text-blue-900 dark:text-blue-100">
 {selectedComments.size} comment{selectedComments.size !== 1 ? 's' : ''} selected
// FIXED:  </span>
 <div className={"fle}x items-center space-x-2">
 <button />
// FIXED:  onClick={() => handleBulkAction('approve')}
// FIXED:  className={"px}-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
 >
 <CheckIcon className={"w}-4 h-4 inline mr-1" />
 Approve
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleBulkAction('spam')}
// FIXED:  className={"px}-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
 >
 <ExclamationTriangleIcon className={"w}-4 h-4 inline mr-1" />
 Mark as Spam
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleBulkAction('hide')}
// FIXED:  className={"px}-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
 >
 <EyeSlashIcon className={"w}-4 h-4 inline mr-1" />
 Hide
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleBulkAction('delete')}
// FIXED:  className={"px}-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
 >
 <TrashIcon className={"w}-4 h-4 inline mr-1" />
 Delete
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Comments List */}
 <div className={"bg}-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
 {/* Header with Select All */}
 <div className={"p}-4 border-b border-neutral-200 dark:border-neutral-700">
 <label className={"fle}x items-center space-x-3">
 <input>
// FIXED:  type="checkbox" />
// FIXED:  checked={selectedComments.size === filteredComments.length && filteredComments.length > 0}
// FIXED:  onChange={(e) => handleSelectAll(e)}
// FIXED:  className={"rounde}d border-neutral-300 dark:border-neutral-600 text-blue-500 focus:ring-blue-500"
 />
 <span className={"text}-sm font-medium text-neutral-700 dark:text-neutral-300">
 Select All
// FIXED:  </span>
// FIXED:  </label>
// FIXED:  </div>

 {/* Comments */}
 <div className={"divide}-y divide-neutral-200 dark:divide-neutral-700">
 {filteredComments.length === 0 ? (
 <div className={"p}-8 text-center">
 <ChatBubbleLeftIcon className={"w}-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
 <h3 className={"text}-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
 No comments found
// FIXED:  </h3>
 <p className={"text}-neutral-500 dark:text-neutral-400">
 {searchQuery ? 'Try adjusting your search or filters.' : 'No comments match the current filter.'}
// FIXED:  </p>
// FIXED:  </div>
 ) : (
 filteredComments.map((comment) => (
 <div key={comment.id} className={"p}-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
 <div className={"fle}x items-start space-x-4">
 <input>
// FIXED:  type="checkbox"
// FIXED:  checked={selectedComments.has(comment.id)} />
// FIXED:  onChange={() => handleSelectComment(comment.id)}
// FIXED:  className={"mt}-1 rounded border-neutral-300 dark:border-neutral-600 text-blue-500 focus:ring-blue-500"
 />
 <img>
// FIXED:  src={comment.authorAvatar}
// FIXED:  alt={comment.authorName}
// FIXED:  className={"w}-10 h-10 rounded-full" />
 />
 <div className={"flex}-1 min-w-0">
 <div className={"fle}x items-center space-x-2 mb-1">
 <span className={"font}-medium text-neutral-900 dark:text-neutral-50">
 {comment.authorName}
// FIXED:  </span>
 {getStatusBadge(comment.status, comment.flaggedReason)}
 <span className={"text}-sm text-neutral-500 dark:text-neutral-400">
 {parseRelativeDate(comment.publishedAt)}
// FIXED:  </span>
// FIXED:  </div>
<p className={"text}-neutral-700 dark:text-neutral-300 mb-2">
 {comment.text}
// FIXED:  </p>
 <div className={"fle}x items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
 <span>On: {comment.videoTitle}</span>
 <span>{comment.likes} likes</span>
 {comment.replyCount && <span>{comment.replyCount} replies</span>}
// FIXED:  </div>
 {comment.flaggedReason && (
 <div className={"mt}-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
 <span className={"text}-sm text-red-800 dark:text-red-400">
 <FlagIcon className={"w}-4 h-4 inline mr-1" />,
 Flagged: {comment.flaggedReason}
// FIXED:  </span>
// FIXED:  </div>
 )}
// FIXED:  </div>
 <div className={"fle}x items-center space-x-1">
 <button />
// FIXED:  onClick={() => handleSingleAction(comment.id, 'approve')}
// FIXED:  className={"p}-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
 title="Approve"
 >
 <CheckIcon className={"w}-4 h-4" />
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleSingleAction(comment.id, 'spam')}
// FIXED:  className={"p}-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
 title="Mark as Spam"
 >
 <ExclamationTriangleIcon className={"w}-4 h-4" />
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleSingleAction(comment.id, 'hide')}
// FIXED:  className={"p}-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/30 rounded transition-colors"
 title="Hide"
 >
 <EyeSlashIcon className={"w}-4 h-4" />
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleSingleAction(comment.id, 'delete')}
// FIXED:  className={"p}-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
 title="Delete"
 >
 <TrashIcon className={"w}-4 h-4" />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default CommentModerationPage;
