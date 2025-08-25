#!/usr/bin/env node

/**
 * Critical JSX Syntax Error Fixer
 * Fix the most critical syntax errors blocking compilation
 */

const fs = require('fs');
const path = require('path');

class JSXSyntaxFixer {
  constructor() {
    this.backupDir = `.error-fix-backups/jsx-syntax-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.setupBackup();
    this.fixedFiles = [];
  }

  setupBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  // Fix BaseModal.tsx
  fixBaseModal() {
    const filePath = 'components/BaseModal.tsx';
    console.log(`Fixing ${filePath}...`);
    this.createBackup(filePath);

    const content = `import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  preventBodyScroll?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  preventBodyScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-2xl';
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventBodyScroll]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={\`fixed inset-0 z-50 flex items-center justify-center p-4 \${overlayClassName}\`}
      onClick={handleOverlayClick}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      <div
        ref={modalRef}
        className={\`relative w-full \${getSizeClasses()} bg-white rounded-lg shadow-xl \${className}\`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
`;

    fs.writeFileSync(filePath, content);
    this.fixedFiles.push(filePath);
    console.log(`✅ Fixed ${filePath}`);
  }

  // Fix CategoryChips.tsx
  fixCategoryChips() {
    const filePath = 'components/CategoryChips.tsx';
    console.log(`Fixing ${filePath}...`);
    this.createBackup(filePath);

    const content = `import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  }, []);

  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Check scroll position on mount and scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition]);

  // Check scroll position when categories change
  useEffect(() => {
    const timeout = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timeout);
  }, [categories, checkScrollPosition]);

  return (
    <div className={\`relative flex items-center py-2 sm:py-3 \${className}\`}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Category chips container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-10 sm:px-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories?.map((category: string) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={\`
              flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium 
              transition-all duration-200 touch-manipulation
              \${selectedCategory === category
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            \`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CategoryChips;
`;

    fs.writeFileSync(filePath, content);
    this.fixedFiles.push(filePath);
    console.log(`✅ Fixed ${filePath}`);
  }

  // Fix ChannelHeader.tsx
  fixChannelHeader() {
    const filePath = 'components/ChannelHeader.tsx';
    console.log(`Fixing ${filePath}...`);
    this.createBackup(filePath);

    const content = `import React from 'react';

export interface ChannelHeaderProps {
  channel: {
    id: string;
    name: string;
    avatar: string;
    bannerUrl?: string;
    description?: string;
    subscriberCount: number;
  };
  videoCount: number;
  isSubscribed: boolean;
  onSubscribeToggle: () => void;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  videoCount,
  isSubscribed,
  onSubscribeToggle,
}) => {
  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return \`\${(count / 1000000).toFixed(1)}M\`;
    } else if (count >= 1000) {
      return \`\${(count / 1000).toFixed(1)}K\`;
    }
    return count.toString();
  };

  return (
    <div className="w-full">
      {/* Banner */}
      {channel.bannerUrl && (
        <div className="h-32 sm:h-48 md:h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <img
            src={channel.bannerUrl}
            alt={\`\${channel.name} banner\`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Channel info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <img
          src={channel.avatar}
          alt={\`\${channel.name} avatar\`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
        />
        
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {channel.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
            <span>{formatSubscriberCount(channel.subscriberCount)} subscribers</span>
            <span>•</span>
            <span>{videoCount} videos</span>
          </div>
          
          {channel.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {channel.description}
            </p>
          )}
        </div>

        <button
          onClick={onSubscribeToggle}
          className={\`
            px-6 py-2 rounded-full font-medium transition-colors
            \${isSubscribed
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-red-600 text-white hover:bg-red-700'
            }
          \`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

export default ChannelHeader;
`;

    fs.writeFileSync(filePath, content);
    this.fixedFiles.push(filePath);
    console.log(`✅ Fixed ${filePath}`);
  }

  // Fix ChannelTabs.tsx
  fixChannelTabs() {
    const filePath = 'components/ChannelTabs.tsx';
    console.log(`Fixing ${filePath}...`);
    this.createBackup(filePath);

    const content = `import React from 'react';

export interface ChannelTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ChannelTabs: React.FC<ChannelTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'videos', label: 'Videos' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'community', label: 'Community' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={\`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              \${activeTab === tab.id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            \`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ChannelTabs;
`;

    fs.writeFileSync(filePath, content);
    this.fixedFiles.push(filePath);
    console.log(`✅ Fixed ${filePath}`);
  }

  // Fix CommentModal.tsx
  fixCommentModal() {
    const filePath = 'components/CommentModal.tsx';
    console.log(`Fixing ${filePath}...`);
    this.createBackup(filePath);

    const content = `import React, { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortId: string;
  shortTitle: string;
  onCommentSubmit: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  shortId,
  shortTitle,
  onCommentSubmit,
}) => {
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold">Add Comment</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Commenting on: {shortTitle}
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {comment.length}/500
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
`;

    fs.writeFileSync(filePath, content);
    this.fixedFiles.push(filePath);
    console.log(`✅ Fixed ${filePath}`);
  }

  run() {
    console.log('🔧 Fixing critical JSX syntax errors...\n');

    this.fixBaseModal();
    this.fixCategoryChips();
    this.fixChannelHeader();
    this.fixChannelTabs();
    this.fixCommentModal();

    console.log(`\n✅ Fixed ${this.fixedFiles.length} files with critical JSX syntax errors`);
    console.log(`📁 Backup created at: ${this.backupDir}`);
    this.fixedFiles.forEach(file => console.log(`   - ${file}`));
  }
}

const fixer = new JSXSyntaxFixer();
fixer.run();