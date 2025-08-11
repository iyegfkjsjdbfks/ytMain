
/// <reference types="react/jsx-runtime" />
import { useState } from 'react';
import { useRef } from 'react';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import { useState, useRef } from 'react';
// TODO: Fix import - import React from 'react';

// TODO: Fix import - import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface AddCommentFormProps {
  currentUserAvatarUrl: string;
  onCommentSubmit: (commentText) => void;
  maxCommentLength: number;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({
  currentUserAvatarUrl,
  onCommentSubmit,
  maxCommentLength,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim() || commentText.length > maxCommentLength) {
return;
}
    onCommentSubmit(commentText.trim());
    setCommentText('');
    setIsFocused(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleCancel = () => {
    setCommentText('');
    setIsFocused(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const isCommentValid = commentText.trim().length > 0 && commentText.length <= maxCommentLength;

  return (
    <div className="flex items-start space-x-3">
      <img
        src={currentUserAvatarUrl}
        alt="Your avatar"
        className="w-10 h-10 rounded-full flex-shrink-0"
      />
      <div className="flex-grow">
        <form onSubmit={handleSubmit} className="w-full">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Add a comment..."
            className="bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-sky-500 w-full py-2 outline-none text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm transition-colors"
            aria-label="Add a public comment"
            maxLength={maxCommentLength + 20} // Allow some overtyping for visual feedback
          />
          {(isFocused || commentText) && (
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${commentText.length > maxCommentLength ? 'text-red-500 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {commentText.length}/{maxCommentLength}
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isCommentValid}
                  className="px-4 py-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Comment <PaperAirplaneIcon className="w-3 h-3 ml-1.5 transform rotate-45" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCommentForm;
