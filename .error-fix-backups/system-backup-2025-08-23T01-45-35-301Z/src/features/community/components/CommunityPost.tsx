import React, { useState, FC } from 'react';
import { formatDistanceToNow } from 'date - fns';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, ShareIcon, EllipsisHorizontalIcon, PlayIcon } from '@heroicons / react / 24 / outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons / react / 24 / solid';

export interface CommunityPostData {}
 id: string;,
 channelId: string;
 channelName: string;,
 channelAvatar: string;
 channelHandle: string;,
 isVerified: boolean;
 content: string;,
 type: "text" | 'image' | 'video' | 'poll' | 'quiz';
 media?: Array<{}
 type: "image" | 'video';,
 url: string;
 thumbnail?: string;
 alt?: string;
 }>;
 poll?: {}
 question: string;,
 options: Array<{}
 id: string;,
 text: string;
 votes: number;,
 percentage: number;
 }>;
 totalVotes: number;
 endsAt?: string;
 hasVoted: boolean;
 userVote?: string;
 };
 likes: number;,
 dislikes: number;
 comments: number;,
 shares: number;
 isLiked: boolean;,
 isDisliked: boolean;
 createdAt: string;
 updatedAt?: string;
 isPinned?: boolean;
}

export interface CommunityPostProps {}
 post: CommunityPostData;,
 onLike: (postId) => void;
 onDislike: (postId) => void;,
 onComment: (postId) => void;
 onShare: (postId) => void;
 onVote?: (postId,
 optionId) => void;
 className?: string;
}

export const CommunityPost: React.FC < CommunityPostProps> = ({}
 post,
 onLike,
 onDislike,
 onComment,
 onShare,
 onVote,
 className = '' }) => {}
 const [showFullContent, setShowFullContent] = useState < boolean>(false);
 const [selectedImage, setSelectedImage] = useState < number | null>(null);

 const formatCount = (count): (string) => {}
 if (count >= 1000000) {}
 return `${(count / 1000000).toFixed(1)}M`;
 }
 if (count >= 1000) {}
 return `${(count / 1000).toFixed(1)}K`;
 }
 return count.toString();
 };

 const shouldTruncateContent = post.content.length > 300;
 const displayContent =;
 shouldTruncateContent && !showFullContent
 ? `${post.content.slice(0, 300)}...`
 : post.content;

 const handleVote = (optionId: any) => {}
 if (post.poll && !post.poll.hasVoted && onVote) {}
 onVote(post.id, optionId);
 };

 return (
 <div>
// FIXED:  className={`bg - white dark:bg - gray - 800 rounded - lg border border - gray - 200 dark:border - gray - 700 p - 6 ${className}`}/>
 {/* Header */}
 <div className={'fle}x items - start justify - between mb - 4'>
 <div className={'fle}x items - center gap - 3'>
 <img>
// FIXED:  src={post.channelAvatar}
// FIXED:  alt={post.channelName}
// FIXED:  className='w - 10 h - 10 rounded - full object - cover' />
 />
 <div>
 <div className={'fle}x items - center gap - 2'>
 <h3 className={'fon}t - semibold text - gray - 900 dark:text - white'>
 {post.channelName}
// FIXED:  </h3>
 {post.isVerified && (}
 <svg>
// FIXED:  className='w - 4 h - 4 text - blue - 500'
 viewBox='0 0 24 24'
 fill='currentColor'/>
 <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z' />
// FIXED:  </svg>
 )}
 {post.isPinned && (}
 <span className={'b}g - blue - 100 dark:bg - blue - 900 text - blue - 800 dark:text - blue - 200 text - xs px - 2 py - 0.5 rounded'>
 Pinned
// FIXED:  </span>
 )}
// FIXED:  </div>
 <div className={'fle}x items - center gap - 2 text - sm text - gray - 500 dark:text - gray - 400'>
 <span>{post.channelHandle}</span>
 <span>•</span>
 <span>
 {formatDistanceToNow(new Date(post.createdAt), {}
 addSuffix: true })}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <button className='p - 2 rounded - full hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors'>
 <EllipsisHorizontalIcon className='w - 5 h - 5 text - gray - 500 dark:text - gray - 400' />
// FIXED:  </button>
// FIXED:  </div>

 {/* Content */}
 <div className={'m}b - 4'>
 <div className={'tex}t - gray - 900 dark:text - white whitespace - pre - wrap'>
 {displayContent}
 {shouldTruncateContent && (}
 <button />
// FIXED:  onClick={() => setShowFullContent(!showFullContent: React.MouseEvent)}
// FIXED:  className={'tex}t - blue - 600 hover:text - blue - 700 ml - 2 font - medium'
 >
 {showFullContent ? 'Show less' : 'Show more'}
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Media */}
 {post.media && post.media.length > 0 && (}
 <div className={'m}b - 4'>
 {post.media.length === 1 ? (}
 <div className={'relativ}e rounded - lg overflow - hidden'>
 {post.media[0]?.type === 'image' ? (}
 <img>
// FIXED:  src={post.media[0]?.url || ''}
// FIXED:  alt={post.media[0]?.alt || 'Post image'}
// FIXED:  className='w - full max - h-96 object - cover cursor - pointer' />
// FIXED:  onClick={() => setSelectedImage(0: React.MouseEvent)}
 />
 ) : (
 <div className={'relative}'>
 <img>
// FIXED:  src={post.media[0]?.thumbnail || post.media[0]?.url || ''}
// FIXED:  alt='Video thumbnail'
// FIXED:  className='w - full max - h-96 object - cover' />
 />
 <div className={'absolut}e inset - 0 flex items - center justify - center'>
 <button className={'b}g - black bg - opacity - 70 text - white p - 4 rounded - full hover:bg - opacity - 80 transition - colors'>
 <PlayIcon className='w - 8 h - 8' />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 ) : (
 <div className={'gri}d grid - cols - 2 gap - 2'>
 {post.media.slice(0, 4).map((media, index) => (}
 <div>
 key={index}
// FIXED:  className={'relativ}e rounded - lg overflow - hidden aspect - square'/>
 <img>
// FIXED:  src={}
 media.type === 'image'
 ? media.url
 : media.thumbnail || media.url
 }
// FIXED:  alt={media.alt || `Post media ${index + 1}`}
// FIXED:  className='w - full h - full object - cover cursor - pointer' />
// FIXED:  onClick={() => setSelectedImage(index: React.MouseEvent)}
 />
 {media.type === 'video' && (}
 <div className={'absolut}e inset - 0 flex items - center justify - center'>
 <PlayIcon className='w - 6 h - 6 text - white' />
// FIXED:  </div>
 )}
 {index === 3 && post.media && post.media.length > 4 && (}
 <div className={'absolut}e inset - 0 bg - black bg - opacity - 50 flex items - center justify - center'>
 <span className={'tex}t - white font - semibold'>
 +{post.media.length - 4}
// FIXED:  </span>
// FIXED:  </div>
 )}
// FIXED:  </div>
 ))}
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}

 {/* Poll */}
 {post.poll && (}
 <div className={'m}b - 4 p - 4 bg - gray - 50 dark:bg - gray - 700 rounded - lg'>
 <h4 className={'fon}t - medium text - gray - 900 dark:text - white mb - 3'>
 {post.poll.question}
// FIXED:  </h4>
 <div className={'spac}e - y-2'>
 {post.poll.options.map((option) => (}
 <button>
 key={option.id} />
// FIXED:  onClick={() => handleVote(option.id: React.MouseEvent)}
// FIXED:  disabled={post.poll!.hasVoted}
// FIXED:  className={`w - full p - 3 rounded - lg border text - left transition - colors ${}
 post.poll!.hasVoted
 ? post.poll!.userVote === option.id
 ? 'border - blue - 500 bg - blue - 50 dark:bg - blue - 900 / 20'
 : 'border - gray - 200 dark:border - gray - 600 bg - gray - 50 dark:bg - gray - 700'
 : 'border - gray - 200 dark:border - gray - 600 hover:border - blue - 500 hover:bg - blue - 50 dark:hover:bg - blue - 900 / 20'
 } ${!post.poll!.hasVoted ? 'cursor - pointer' : 'cursor - default'}`}
 >
 <div className={'fle}x justify - between items - center'>
 <span className={'tex}t - gray - 900 dark:text - white'>
 {option.text}
// FIXED:  </span>
 {post.poll!.hasVoted && (}
 <span className={'tex}t - sm text - gray - 500 dark:text - gray - 400'>
 {option.percentage}%
// FIXED:  </span>
 )}
// FIXED:  </div>
 {post.poll!.hasVoted && (}
 <div className={'m}t - 2 bg - gray - 200 dark:bg - gray - 600 rounded - full h - 2'>
 <div>
// FIXED:  className={'b}g - blue - 500 h - 2 rounded - full transition - all duration - 300'
// FIXED:  style={{ width: `${option.percentage}%` } />
 />
// FIXED:  </div>
 )}
// FIXED:  </button>
 ))}
// FIXED:  </div>
 <div className={'m}t - 3 text - sm text - gray - 500 dark:text - gray - 400'>
 {formatCount(post.poll.totalVotes)} votes
 {post.poll.endsAt && (}
 <></>
 {' • '}
 Ends{' '}
 {formatDistanceToNow(new Date(post.poll.endsAt), {}
 addSuffix: true })}
// FIXED:  </>
 )}
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Actions */}
 <div className={'fle}x items - center justify - between pt - 4 border - t border - gray - 200 dark:border - gray - 700'>
 <div className={'fle}x items - center gap - 4'>
 {/* Like */}
 <button />
// FIXED:  onClick={() => onLike(post.id: React.MouseEvent)}
// FIXED:  className={`flex items - center gap - 2 px - 3 py - 2 rounded - full transition - colors ${}
 post.isLiked
 ? 'text - blue - 600 bg - blue - 50 dark:bg - blue - 900 / 20'
 : 'text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 700'
 }`}
 >
 {post.isLiked ? (}
 <HandThumbUpSolidIcon className='w - 5 h - 5' />
 ) : (
 <HandThumbUpIcon className='w - 5 h - 5' />
 )}
 <span className={'tex}t - sm font - medium'>
 {formatCount(post.likes)}
// FIXED:  </span>
// FIXED:  </button>

 {/* Dislike */}
 <button />
// FIXED:  onClick={() => onDislike(post.id: React.MouseEvent)}
// FIXED:  className={`flex items - center gap - 2 px - 3 py - 2 rounded - full transition - colors ${}
 post.isDisliked
 ? 'text - red - 600 bg - red - 50 dark:bg - red - 900 / 20'
 : 'text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 700'
 }`}
 >
 {post.isDisliked ? (}
 <HandThumbDownSolidIcon className='w - 5 h - 5' />
 ) : (
 <HandThumbDownIcon className='w - 5 h - 5' />
 )}
// FIXED:  </button>

 {/* Comment */}
 <button />
// FIXED:  onClick={() => onComment(post.id: React.MouseEvent)}
// FIXED:  className={'fle}x items - center gap - 2 px - 3 py - 2 rounded - full text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors'
 >
 <ChatBubbleLeftIcon className='w - 5 h - 5' />
 <span className={'tex}t - sm font - medium'>
 {formatCount(post.comments)}
// FIXED:  </span>
// FIXED:  </button>

 {/* Share */}
 <button />
// FIXED:  onClick={() => onShare(post.id: React.MouseEvent)}
// FIXED:  className={'fle}x items - center gap - 2 px - 3 py - 2 rounded - full text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors'
 >
 <ShareIcon className='w - 5 h - 5' />
 <span className={'tex}t - sm font - medium'>
 {formatCount(post.shares)}
// FIXED:  </span>
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {/* Image Modal */}
 {selectedImage !== null && post.media && (}
 <div>
// FIXED:  className={'fixe}d inset - 0 bg - black bg - opacity - 90 flex items - center justify - center z - 50' />
// FIXED:  onClick={() => setSelectedImage(null: React.MouseEvent)}
 >
 <div className={'ma}x - w-4xl max - h-full p - 4'>
 <img>
// FIXED:  src={post.media.selectedImage?.url || ''}
// FIXED:  alt={post.media.selectedImage?.alt || 'Post image'}
// FIXED:  className={'ma}x - w-full max - h-full object - contain' />
 />
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default CommunityPost;
