import React, { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortId: string;
  shortTitle: string;
  onCommentSubmit: (comment: string) => void;

const CommentModal: React.FC<CommentModalProps> = ({)
  isOpen,
  onClose,
  shortId,
  shortTitle,
  onCommentSubmit, }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCommentSubmit(comment);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);

  if (!isOpen) return null;

  return (;)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">;
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />;
      
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">;
        <div className="p-6">;
          <div className="flex items-center gap-3 mb-4">;
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600" />;
            <h2 className="text-lg font-semibold">Add Comment</h2>;
          </div>;

          <p className="text-sm text-gray-600 mb-4">;
            Commenting on: {shortTitle, }
          </p>;

          <form onSubmit={handleSubmit}>;
            <textarea>;
              value={comment} onChange={(e: any) => setComment(e.target.value)} placeholder="Write a comment...";
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
              rows={4} maxLength={500} / />;

            <div className="flex justify-between items-center mt-4">;
              <span className="text-sm text-gray-500">;
                {comment.length}/500
              </span>;
              
              <div className="flex gap-2">;
                <button>;
                  type="button";
                  onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"; />
                  Cancel;
                </button>;
                <button>;
                  type="submit";
                  disabled={!comment.trim() || isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"; />
                  {isSubmitting ? 'Posting...' : 'Post', }
                </button>;
              </div>;
            </div>;
          </form>;
        </div>;
      </div>;
    </div>;

export default CommentModal;
