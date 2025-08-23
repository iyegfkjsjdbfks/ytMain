
import React, { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ThumbsUpIcon, ThumbsDownIcon } from './icons';
import { Comment } from '../../types';

interface CommentCardProps {
  comment: Comment;
  onReply: (commentId: string, replyText: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  currentUserId: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onDelete,
  onLike,
  onDislike,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSave = () => {
    // Implement save logic here
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(comment.id);
  };

  return (
    <div className="flex items-start space-x-2.5">
      <img
        className="w-10 h-10 rounded-full"
        src={comment.authorAvatar}
        alt={comment.authorName}
      />
      <div className="flex-grow min-w-0">
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            {comment.authorName}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {comment.publishedAt}
          </span>

        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsEditing(false)} className="text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="text-sm font-bold">
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            {comment.text}
          </p>
        )}
        <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center space-x-1 ${
              false ? 'text-blue-500' : ''
            }`}
          >
            <ThumbsUpIcon className="w-4 h-4" />
            <span>{comment.likeCount}</span>
          </button>
          <button
            onClick={() => onDislike(comment.id)}
            className={`flex items-center space-x-1 ${
              false ? 'text-red-500' : ''
            }`}
          >
            <ThumbsDownIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onReply(comment.id, '')}>Reply</button>
          {false && (
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  <button
                    onClick={handleEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
