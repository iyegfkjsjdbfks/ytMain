import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';

import {
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  FaceSmileIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';

import { useLiveChat } from '../../../hooks/useLiveStream';

import type {
  ChatMessage,
  ChatModerationAction,
  ChatBadge,
} from '../../../types/livestream';

interface AdvancedLiveChatProps {
  streamId: string;
  isOwner: boolean;
  isModerator: boolean;
  className?: string;
}

const AdvancedLiveChat: React.FC<AdvancedLiveChatProps> = ({
  streamId,
  isOwner,
  isModerator,
  className = '',
}) => {
  const { messages, sendMessage, moderateMessage } = useLiveChat(streamId);
  const [newMessage, setNewMessage] = useState('');
  const [slowModeTimer, setSlowModeTimer] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'super_chat' | 'moderators'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle slow mode timer
  useEffect(() => {
    if (slowModeTimer > 0) {
      const timer = setTimeout(() => setSlowModeTimer(slowModeTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [slowModeTimer]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || slowModeTimer > 0) {
return;
}

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      setSlowModeTimer(5); // 5 second slow mode
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModerationAction = async (messageId: string, action: ChatModerationAction['type']) => {
    try {
      await moderateMessage(messageId, {
        type: action,
        userId: '',
        moderatorId: '',
        reason: 'Moderated by chat moderator',
        timestamp: new Date(),
      } as ChatModerationAction);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Moderation action failed:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const renderBadges = (badges: ChatBadge[]) => {
    return badges.map((badge, index) => (
      <span
        key={index}
        className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
          badge.type === 'moderator' ? 'bg-green-100 text-green-800' :
          badge.type === 'verified' ? 'bg-blue-100 text-blue-800' :
          badge.type === 'member' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}
        title={badge.label}
      >
        {badge.type === 'moderator' && <ShieldCheckIcon className="w-3 h-3 mr-0.5" />}
        {badge.type === 'verified' && <StarSolidIcon className="w-3 h-3 mr-0.5" />}
        {badge.label}
      </span>
    ));
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.deleted) {
      return (
        <div className="px-3 py-2 text-sm text-gray-500 italic">
          Message deleted by {message.deletedBy}
        </div>
      );
    }

    const filteredOut =
      (chatFilter === 'super_chat' && message.type !== 'super_chat') ||
      (chatFilter === 'moderators' && !message.isModerator && !message.isOwner);

    if (filteredOut) {
return null;
}

    return (
      <div
        className={`px-3 py-2 hover:bg-gray-50 group relative ${
          message.type === 'super_chat' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' :
          message.type === 'membership' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400' :
          ''
        }`}
      >
        <div className="flex items-start space-x-2">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`}
            alt={message.username}
            className="w-6 h-6 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-medium text-sm ${
                message.isOwner ? 'text-red-600' :
                message.isModerator ? 'text-green-600' :
                'text-gray-900'
              }`}>
                {message.username}
              </span>
              {message.badges.length > 0 && (
                <div className="flex space-x-1">
                  {renderBadges(message.badges)}
                </div>
              )}
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>

            {message.superChat && (
              <div className="mb-2 p-2 bg-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-yellow-800">
                    ${message.superChat.amount} {message.superChat.currency}
                  </span>
                  <CurrencyDollarIcon className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            )}

            <p className="text-sm text-gray-800 break-words">
              {message.message}
            </p>

            {message.edited && (
              <span className="text-xs text-gray-500 italic">
                (edited {formatTimestamp(message.editedAt!)})
              </span>
            )}
          </div>

          {(isModerator || isOwner) && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>

              {selectedMessage === message.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleModerationAction(message.id, 'timeout')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      Timeout (5 min)
                    </button>
                    <button
                      onClick={() => handleModerationAction(message.id, 'delete')}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      Delete Message
                    </button>
                    <button
                      onClick={() => handleModerationAction(message.id, 'ban')}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      Ban User
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredMessages = messages.filter(message => {
    if (chatFilter === 'super_chat') {
return message.type === 'super_chat';
}
    if (chatFilter === 'moderators') {
return message.isModerator || message.isOwner;
}
    return true;
  });

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Live Chat</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            {messages.length} messages
          </span>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => setChatFilter('all')}
            className={`px-2 py-1 text-xs rounded ${
              chatFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChatFilter('super_chat')}
            className={`px-2 py-1 text-xs rounded ${
              chatFilter === 'super_chat' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Super Chat
          </button>
          <button
            onClick={() => setChatFilter('moderators')}
            className={`px-2 py-1 text-xs rounded ${
              chatFilter === 'moderators' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mods
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.map((message) => (
          <div key={message.id}>
            {renderMessage(message)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={slowModeTimer > 0 ? `Slow mode (${slowModeTimer}s)` : 'Say something...'}
              disabled={slowModeTimer > 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-6 gap-1">
                  {['😀', '😂', '😍', '👍', '❤️', '🔥', '👏', '🎉', '😢', '😮', '😡', '🤔'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FaceSmileIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || slowModeTimer > 0}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {slowModeTimer > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            You can send another message in {slowModeTimer} seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedLiveChat;
