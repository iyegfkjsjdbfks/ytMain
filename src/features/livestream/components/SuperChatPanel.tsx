import React, { useEffect, useState, FC } from 'react';
import { liveStreamService } from '@/services/livestreamAPI';
import { logger } from '@/utils/logger';
import type { SuperChat } from '@/types/livestream';
import { CurrencyDollarIcon,
  HeartIcon,
  SparklesIcon,
  TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SuperChatPanelProps {
  streamId: string;
  className?: string;
}

const SuperChatPanel: React.FC<SuperChatPanelProps> = ({
  streamId,
  className = '',
}) => {
  const [superChats, setSuperChats] = useState<SuperChat[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showSendForm, setShowSendForm] = useState(false);
  const [newSuperChat, setNewSuperChat] = useState({
    amount: 5,
    message: '',
  });

  const superChatTiers = [
    { amount: 2, color: 'bg-blue-500', duration: 30 },
    { amount: 5, color: 'bg-green-500', duration: 60 },
    { amount: 10, color: 'bg-yellow-500', duration: 120 },
    { amount: 20, color: 'bg-orange-500', duration: 300 },
    { amount: 50, color: 'bg-red-500', duration: 600 },
    { amount: 100, color: 'bg-purple-500', duration: 1200 },
  ];

  useEffect(() => {
    // Load existing super chats from API
    liveStreamService.chat.getChatMessages(streamId).then(messages => {
      const existingSuperChats = messages
        .filter(msg => msg.superChat)
        .map(msg => msg.superChat!)
        .sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        });

      setSuperChats(existingSuperChats);
      setTotalRevenue(
        existingSuperChats.reduce((sum, sc) => sum + sc.amount, 0)
      );
    });
  }, [streamId]);

  const handleSendSuperChat = async () => {
    if (!newSuperChat.message.trim() || newSuperChat.amount < 1) {
      return;
    }

    try {
      await liveStreamService.chat.sendSuperChat(
        streamId,
        newSuperChat.message.trim(),
        newSuperChat.amount,
        'user_123',
        'Current User'
      );

      setNewSuperChat({ amount: 5, message: '' });
      setShowSendForm(false);
    } catch (error) {
      logger.error('Failed to send Super Chat:', error);
    }
  };

  const getTierColor = (amount) => {
    const tier = superChatTiers
      .slice()
      .reverse()
      .find(t => amount >= t.amount);
    return tier?.color || 'bg-blue-500';
  };

  const getTierDuration = (amount) => {
    const tier = superChatTiers
      .slice()
      .reverse()
      .find(t => amount >= t.amount);
    return tier?.duration || 30;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const topSuperChats = superChats
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <CurrencyDollarIcon className='w-5 h-5 text-gray-600' />
          <span className='font-medium text-gray-900'>Super Chat</span>
          <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
            {formatCurrency(totalRevenue)}
          </span>
        </div>

        <button
          onClick={() => setShowSendForm(!showSendForm)}
          className='flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 text-sm'
        >
          <SparklesIcon className='w-4 h-4' />
          <span>Send Super Chat</span>
        </button>
      </div>

      {/* Send Super Chat Form */}
      {showSendForm && (
        <div className='mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border'>
          <div className='space-y-3'>
            <div>
              <label
                htmlFor='superchat-amount-input'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Amount
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {superChatTiers.map(tier => (
                  <button
                    key={tier.amount}
                    onClick={() =>
                      setNewSuperChat(prev => ({
                        ...prev,
                        amount: tier.amount,
                      }))
                    }
                    className={`p-2 rounded-lg text-white text-sm font-medium transition-all ${
                      newSuperChat.amount === tier.amount
                        ? `${tier.color} ring-2 ring-offset-2 ring-blue-500`
                        : `${tier.color} opacity-75 hover:opacity-100`
                    }`}
                  >
                    ${tier.amount}
                  </button>
                ))}
              </div>
              <div className='mt-2'>
                <input
                  id='superchat-amount-input'
                  type='number'
                  value={newSuperChat.amount}
                  onChange={e =>
                    setNewSuperChat(prev => ({
                      ...prev,
                      amount: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  min='1'
                  max='500'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Custom amount'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='superchat-message'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Message
              </label>
              <textarea
                id='superchat-message'
                value={newSuperChat.message}
                onChange={e =>
                  setNewSuperChat(prev => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder='Add a message to your Super Chat...'
                rows={3}
                maxLength={200}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              />
              <div className='text-xs text-gray-500 mt-1'>
                {newSuperChat.message.length}/200 characters
              </div>
            </div>

            <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
              <div>
                <p className='text-sm font-medium text-gray-900'>
                  Super Chat Preview
                </p>
                <p className='text-xs text-gray-600'>
                  Will be pinned for{' '}
                  {Math.floor(getTierDuration(newSuperChat.amount) / 60)}{' '}
                  minutes
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-white font-bold ${getTierColor(newSuperChat.amount)}`}
              >
                {formatCurrency(newSuperChat.amount)}
              </div>
            </div>

            <div className='flex space-x-2'>
              <button
                onClick={handleSendSuperChat}
                disabled={!newSuperChat.message.trim()}
                className='flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Send {formatCurrency(newSuperChat.amount)} Super Chat
              </button>
              <button
                onClick={() => setShowSendForm(false)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='p-3 bg-green-50 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <ChartBarIcon className='w-5 h-5 text-green-600' />
            <span className='text-sm font-medium text-green-900'>
              Total Revenue
            </span>
          </div>
          <p className='text-2xl font-bold text-green-900 mt-1'>
            {formatCurrency(totalRevenue)}
          </p>
          <p className='text-xs text-green-600'>
            From {superChats.length} Super Chats
          </p>
        </div>

        <div className='p-3 bg-purple-50 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <TrophyIcon className='w-5 h-5 text-purple-600' />
            <span className='text-sm font-medium text-purple-900'>
              Top Donation
            </span>
          </div>
          <p className='text-2xl font-bold text-purple-900 mt-1'>
            {topSuperChats.length > 0 && topSuperChats[0]
              ? formatCurrency(topSuperChats[0].amount)
              : '$0'}
          </p>
          <p className='text-xs text-purple-600'>
            {topSuperChats.length > 0 && topSuperChats[0]
              ? topSuperChats[0].username
              : 'No donations yet'}
          </p>
        </div>
      </div>

      {/* Recent Super Chats */}
      <div className='space-y-3 max-h-64 overflow-y-auto'>
        <h3 className='font-medium text-gray-900'>Recent Super Chats</h3>

        {superChats.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <CurrencyDollarIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No Super Chats yet</p>
            <p className='text-sm mt-1'>Be the first to send a Super Chat!</p>
          </div>
        ) : (
          superChats.map(superChat => (
            <div
              key={superChat.id}
              className={`p-3 rounded-lg border-l-4 ${getTierColor(superChat.amount)}`}
              style={{ backgroundColor: '#fefefe' }}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center space-x-2'>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${superChat.username}`}
                    alt={superChat.username}
                    className='w-6 h-6 rounded-full'
                  />
                  <span className='font-medium text-gray-900'>
                    {superChat.username}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {formatTimestamp(superChat.timestamp || new Date())}
                  </span>
                </div>
                <div
                  className={`px-2 py-1 rounded text-white text-sm font-bold ${getTierColor(superChat.amount)}`}
                >
                  {formatCurrency(superChat.amount)}
                </div>
              </div>

              <p className='text-gray-800'>{superChat.message}</p>

              <div className='flex items-center justify-between mt-2 text-xs text-gray-500'>
                <span>
                  Pinned for{' '}
                  {Math.floor(getTierDuration(superChat.amount) / 60)} minutes
                </span>
                <button className='flex items-center space-x-1 text-red-500 hover:text-red-600'>
                  <HeartIcon className='w-3 h-3' />
                  <span>Thank</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Top Super Chats */}
      {topSuperChats.length > 0 && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <h3 className='font-medium text-gray-900 mb-3'>Top Super Chats</h3>
          <div className='space-y-2'>
            {topSuperChats.map((superChat, index) => (
              <div
                key={superChat.id}
                className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-2'>
                  <span className='flex items-center justify-center w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold'>
                    {index + 1}
                  </span>
                  <span className='text-sm font-medium text-gray-900'>
                    {superChat.username}
                  </span>
                  <span className='text-xs text-gray-500 truncate max-w-32'>
                    "{superChat.message}"
                  </span>
                </div>
                <span className='text-sm font-bold text-green-600'>
                  {formatCurrency(superChat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperChatPanel;


