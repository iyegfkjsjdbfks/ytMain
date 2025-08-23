import React, { MouseEvent, FC, useState, useEffect, useRef } from 'react';
import { Link } from 'react - router - dom';

import { ShareIcon, XMarkIcon } from '@heroicons / react / 24 / outline';

import { formatCount } from '../utils / numberUtils';

import SaveIcon from './icons / SaveIcon';
import SaveIconFilled from './icons / SaveIconFilled';
import ThumbsDownIcon from './icons / ThumbsDownIcon';
import ThumbsUpIcon from './icons / ThumbsUpIcon';

export interface VideoActionsProps {}
 liked: boolean;,
 disliked: boolean;
 likeCount: number;,
 isSavedToAnyList: boolean;
 onLike: () => void;,
 onDislike: () => void;
 onShare: () => void;,
 onSave: () => void;
 saveModalLoading?: boolean;
}

export interface ShareModalProps {}
 isOpen: boolean;,
 onClose: () => void;
 onShareToSocial: (platform) => void;,
 onCopyLink: () => void;
 shareMessage?: string;
}

const ShareModal: React.FC < ShareModalProps> = ({}
 isOpen,
 onClose,
 onShareToSocial,
 onCopyLink,
 shareMessage }) => {}
 if (!isOpen) {}
return null;
}

 return (
 <div className="absolute top - full right - 0 mt - 2 w - 80 bg - white dark:bg - neutral - 800 border border - neutral - 200 dark:border - neutral - 700 rounded - lg shadow - xl z - 50 animate - fade - in - fast">
 <div className="flex items - center justify - between p - 4 border - b border - neutral - 200 dark:border - neutral - 700">
 <h3 className="text - base font - medium text - neutral - 900 dark:text - neutral - 100">Share</h3>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => onClose(e)}
// FIXED:  className="p - 1 rounded - full hover:bg - neutral - 100 dark:hover:bg - neutral - 700"
// FIXED:  aria - label="Close share modal"
 >
 <XMarkIcon className="w - 5 h - 5 text - neutral - 500 dark:text - neutral - 300" />
// FIXED:  </button>
// FIXED:  </div>

 <div className="p - 4 space - y - 4">
 <div className="flex space - x - 3">
 <button />
// FIXED:  onClick={() => onShareToSocial('twitter': React.MouseEvent)}
// FIXED:  className="flex flex - col items - center p - 3 rounded - lg hover:bg - neutral - 100 dark:hover:bg - neutral - 700 transition - colors"
 >
 <div className="w - 10 h - 10 bg - blue - 500 rounded - full flex items - center justify - center mb - 2">
 <span className="text - white font - bold text - sm">T</span>
// FIXED:  </div>
<span className="text - xs text - neutral - 600 dark:text - neutral - 400">Twitter</span>
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onShareToSocial('facebook': React.MouseEvent)}
// FIXED:  className="flex flex - col items - center p - 3 rounded - lg hover:bg - neutral - 100 dark:hover:bg - neutral - 700 transition - colors"
 >
 <div className="w - 10 h - 10 bg - blue - 600 rounded - full flex items - center justify - center mb - 2">
 <span className="text - white font - bold text - sm">f</span>
// FIXED:  </div>
<span className="text - xs text - neutral - 600 dark:text - neutral - 400">Facebook</span>
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onShareToSocial('reddit': React.MouseEvent)}
// FIXED:  className="flex flex - col items - center p - 3 rounded - lg hover:bg - neutral - 100 dark:hover:bg - neutral - 700 transition - colors"
 >
 <div className="w - 10 h - 10 bg - orange - 500 rounded - full flex items - center justify - center mb - 2">
 <span className="text - white font - bold text - sm">R</span>
// FIXED:  </div>
<span className="text - xs text - neutral - 600 dark:text - neutral - 400">Reddit</span>
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onShareToSocial('email': React.MouseEvent)}
// FIXED:  className="flex flex - col items - center p - 3 rounded - lg hover:bg - neutral - 100 dark:hover:bg - neutral - 700 transition - colors"
 >
 <div className="w - 10 h - 10 bg - neutral - 500 rounded - full flex items - center justify - center mb - 2">
 <span className="text - white font - bold text - sm">@</span>
// FIXED:  </div>
<span className="text - xs text - neutral - 600 dark:text - neutral - 400">Email</span>
// FIXED:  </button>
// FIXED:  </div>

 <div className="border - t border - neutral - 200 dark:border - neutral - 700 pt - 4">
 <div className="flex items - center space - x - 2">
 <input
// FIXED:  type="text"
// FIXED:  value={window.location.href}
 readOnly
// FIXED:  className="flex - 1 px - 3 py - 2 text - sm border border - neutral - 300 dark:border - neutral - 600 rounded - md bg - neutral - 50 dark:bg - neutral - 700 text - neutral - 700 dark:text - neutral - 300" />
 />
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => onCopyLink(e)}
// FIXED:  className="px - 4 py - 2 bg - sky - 500 hover:bg - sky - 600 dark:bg - sky - 600 dark:hover:bg - sky - 500 text - white text - sm font - medium rounded - md transition - colors"
 >
 Copy
// FIXED:  </button>
// FIXED:  </div>
 {shareMessage && (}
 <p className="text - xs text - green - 600 dark:text - green - 400 mt - 2">{shareMessage}</p>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

const VideoActions: React.FC < VideoActionsProps> = ({}
 liked,
 disliked,
 likeCount,
 isSavedToAnyList,
 onLike,
 onDislike,
 onShare,
 onSave,
 saveModalLoading = false }) => {}
 const [isShareModalOpen, setIsShareModalOpen] = useState < boolean>(false);
 const [shareMessage, setShareMessage] = useState < string>('');
 const saveButtonRef = useRef < HTMLButtonElement>(null);

 const handleShare = () => {}
 setIsShareModalOpen(true);
 onShare();
 };

 const handleShareToSocial = (platform: any) => {}
 const url = encodeURIComponent(window.location.href);
 const title = encodeURIComponent(document.title);

 let shareUrl: string = '';
 switch (platform as any) {}
 case 'twitter':
 shareUrl = `https://twitter.com / intent / tweet?url="${url}&text="${title}`;""
 break;
 case 'facebook':
 shareUrl = `https://www.facebook.com / sharer / sharer.php?u="${url}`;"
 break;
 case 'reddit':
 shareUrl = `https://reddit.com / submit?url="${url}&title="${title}`;""
 break;
 case 'email':
 shareUrl = `mailto:?subject="${title}&body="${url}`;""
 break;
 }

 if (shareUrl as any) {}
 window.open(shareUrl, '_blank', 'width = 600,height = 400');
 }
 setIsShareModalOpen(false);
 };

 const handleCopyLink = async (): Promise<any> < void> => {}
 try {}
 await navigator.clipboard.writeText(window.location.href);
 setShareMessage('Link copied to clipboard!');
 setTimeout((() => setShareMessage('')) as any, 3000);
 } catch (err) {}
 (console as any).error('Failed to copy link:', err);
 setShareMessage('Failed to copy link');
 setTimeout((() => setShareMessage('')) as any, 3000);
 };

 // Close share modal when clicking outside
 useEffect(() => {}
 const handleClickOutside = (event: MouseEvent) => {}
 if (isShareModalOpen && !(event.target as Element).closest('.share - modal - container')) {}
 setIsShareModalOpen(false);
 };

 document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }, [isShareModalOpen]);

 return (
 <div className="flex items - center space - x - 2 overflow - x - auto no - scrollbar relative">
 {/* Like / Dislike Button Group */}
 <div className="flex items - center bg - neutral - 100 dark:bg - neutral - 800 rounded - full">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => onLike(e)}
// FIXED:  className={`flex items - center space - x - 1.5 pl - 3 pr - 2.5 py - 2 rounded - l - full text - sm font - medium transition - colors}
 ${liked ? 'text - sky - 600 dark : text - sky - 400 bg - sky - 100 dark:bg - sky - 500 / 10 hover:bg - sky - 200 dark:hover:bg - sky - 500 / 20' : 'text - neutral - 800 dark:text - neutral - 50 hover:bg - neutral - 200 dark:hover:bg - neutral - 700 / 70'}`}
// FIXED:  aria - pressed={liked}
 title="Like"
 >
 <ThumbsUpIcon className={`w - 4 h - 4 ${liked ? 'fill - sky - 600 dark : fill - sky - 400' : ''}`} />
 <span className="text - xs">{formatCount(likeCount)}</span>
// FIXED:  </button>
 <div className="h - 5 w - px bg - neutral - 300 dark:bg - neutral - 600 / 80" />
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => onDislike(e)}
// FIXED:  className={`hover:bg - neutral - 200 dark:hover:bg - neutral - 700 / 70 px - 2.5 py - 2 rounded - r - full text - sm font - medium transition - colors}
 ${disliked ? 'text - red - 600 dark : text - red - 400 bg - red - 100 dark:bg - red - 500 / 10 hover:bg - red - 200 dark:hover:bg - red - 500 / 20' : 'text - neutral - 800 dark:text - neutral - 50'}`}
// FIXED:  aria - pressed={disliked}
 title="Dislike"
 >
 <ThumbsDownIcon className={`w - 4 h - 4 ${disliked ? 'fill - red - 600 dark : fill - red - 400' : ''}`} />
// FIXED:  </button>
// FIXED:  </div>

 {/* Share Button */}
 <div className="relative share - modal - container">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleShare(e)}
// FIXED:  className="flex items - center space - x - 1.5 bg - neutral - 100 dark:bg - neutral - 800 hover:bg - neutral - 200 dark:hover:bg - neutral - 700 text - neutral - 800 dark:text - neutral - 50 px - 3 py - 2 rounded - full text - sm font - medium transition - colors"
// FIXED:  aria - label="Share this video"
 title="Share"
 >
 <ShareIcon className="w - 4 h - 4" />
 <span className="text - xs">Share</span>
// FIXED:  </button>

 <ShareModal
 isOpen={isShareModalOpen} />
 onClose={() => setIsShareModalOpen(false)}
 onShareToSocial={handleShareToSocial}
 onCopyLink={handleCopyLink}
 shareMessage={shareMessage}
 />
// FIXED:  </div>

 {/* Save Button */}
 <div className="relative">
 <button
 ref={saveButtonRef} />
// FIXED:  onClick={(e: React.MouseEvent) => onSave(e)}
// FIXED:  disabled={saveModalLoading}
// FIXED:  className="flex items - center space - x - 1.5 bg - neutral - 100 dark:bg - neutral - 800 hover:bg - neutral - 200 dark:hover:bg - neutral - 700 text - neutral - 800 dark:text - neutral - 50 px - 3 py - 2 rounded - full text - sm font - medium transition - colors disabled:opacity - 60"
// FIXED:  aria - label="Save this video to a playlist"
 title={isSavedToAnyList ? 'Edit saved playlists' : 'Save to playlist'}
 >
 {isSavedToAnyList ? <SaveIconFilled className="w - 4 h - 4" /> : <SaveIcon className="w - 4 h - 4" />}
 <span className="text - xs">{isSavedToAnyList ? 'Saved' : 'Save'}</span>
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default VideoActions;
