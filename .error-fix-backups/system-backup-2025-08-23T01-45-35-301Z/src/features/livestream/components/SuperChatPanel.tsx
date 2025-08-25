import React, { useEffect, useState, FC } from 'react';
import { liveStreamService } from '@/services / livestreamAPI';
import { logger } from '@/utils / logger';
import type { SuperChat } from '@/types / livestream';
import { CurrencyDollarIcon, HeartIcon, SparklesIcon, TrophyIcon, ChartBarIcon } from '@heroicons / react / 24 / outline';

export interface SuperChatPanelProps {}
 streamId: string;
 className?: string;
}

const SuperChatPanel: React.FC < SuperChatPanelProps> = ({}
 streamId,
 className = '' }) => {}
 const [superChats, setSuperChats] = useState < SuperChat[]>([]);
 const [totalRevenue, setTotalRevenue] = useState < number>(0);
 const [showSendForm, setShowSendForm] = useState < boolean>(false);
 const [newSuperChat, setNewSuperChat] = useState({}
 amount: 5,
 message: '' });

 const superChatTiers = [;
 { amount: 2,}
 color: 'bg - blue - 500', duration: 30 },
 { amount: 5,}
 color: 'bg - green - 500', duration: 60 },
 { amount: 10,}
 color: 'bg - yellow - 500', duration: 120 },
 { amount: 20,}
 color: 'bg - orange - 500', duration: 300 },
 { amount: 50,}
 color: 'bg - red - 500', duration: 600 },
 { amount: 100,}
 color: 'bg - purple - 500', duration: 1200 }];

 useEffect(() => {}
 // Load existing super chats from API
 liveStreamService.chat.getChatMessages(streamId).then((messages) => {}
 const existingSuperChats = messages;
 .filter((msg) => msg.superChat)
 .map((msg) => msg.superChat!)
 .sort((a, b) => {}
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

 const handleSendSuperChat = async (): Promise<any> < void> => {}
 if (!newSuperChat.message.trim() || newSuperChat.amount < 1) {}
 return;
 }

 try {}
 await liveStreamService.chat.sendSuperChat(
 streamId,
 newSuperChat.message.trim(),
 newSuperChat.amount,
 'user_123',
 'Current User'
 );

 setNewSuperChat({ amount: 5,}
 message: '' });
 setShowSendForm(false);
 } catch (error) {}
 logger.error('Failed to send Super Chat:', error);
 };

 const getTierColor = (amount: any) => {}
 const tier = superChatTiers;
 .slice()
 .reverse()
 .find(t => amount >= t.amount);
 return tier?.color || 'bg - blue - 500';
 };

 const getTierDuration = (amount: any) => {}
 const tier = superChatTiers;
 .slice()
 .reverse()
 .find(t => amount >= t.amount);
 return tier?.duration || 30;
 };

 const formatCurrency = (amount: any) => {}
 return new Intl.NumberFormat('en - US', {}
 style: 'currency',
 currency: 'USD' }).format(amount);
 };

 const formatTimestamp = (timestamp: Date) => {}
 return new Intl.DateTimeFormat('en - US', {}
 hour: '2 - digit',
 minute: '2 - digit' }).format(timestamp);
 };

 const topSuperChats = superChats;
 .slice()
 .sort((a, b) => b.amount - a.amount)
 .slice(0, 5);

 return (
 <div>
// FIXED:  className={`bg - white border border - gray - 200 rounded - lg p - 4 ${className}`}/>
 <div className={'fle}x items - center justify - between mb - 4'>
 <div className={'fle}x items - center space - x-2'>
 <CurrencyDollarIcon className='w - 5 h - 5 text - gray - 600' />
 <span className={'fon}t - medium text - gray - 900'>Super Chat</span>
 <span className={'p}x - 2 py - 1 bg - green - 100 text - green - 800 text - xs rounded - full'>
 {formatCurrency(totalRevenue)}
// FIXED:  </span>
// FIXED:  </div>

 <button />
// FIXED:  onClick={() => setShowSendForm(!showSendForm: React.MouseEvent)}
// FIXED:  className={'fle}x items - center space - x-1 px - 3 py - 1 bg - gradient - to - r from - blue - 500 to - purple - 600 text - white rounded - lg hover:from - blue - 600 hover:to - purple - 700 text - sm'
 >
 <SparklesIcon className='w - 4 h - 4' />
 <span > Send Super Chat</span>
// FIXED:  </button>
// FIXED:  </div>

 {/* Send Super Chat Form */}
 {showSendForm && (}
 <div className={'m}b - 4 p - 4 bg - gradient - to - r from - blue - 50 to - purple - 50 rounded - lg border'>
 <div className={'spac}e - y-3'>
 <div>
 <label>
// FIXED:  htmlFor='superchat - amount - input'
// FIXED:  className={'bloc}k text - sm font - medium text - gray - 700 mb - 2'/>
 Amount
// FIXED:  </label>
 <div className={'gri}d grid - cols - 3 gap - 2'>
 {superChatTiers.map((tier) => (}
 <button>
 key={tier.amount} />
// FIXED:  onClick={() =>}
 setNewSuperChat(prev => ({}
 ...prev as any,
 amount: tier.amount }))
 }
// FIXED:  className={`p - 2 rounded - lg text - white text - sm font - medium transition - all ${}
 newSuperChat.amount === tier.amount
 ? `${tier.color} ring - 2 ring - offset - 2 ring - blue - 500`
 : `${tier.color} opacity - 75 hover:opacity - 100`
 }`}
 >
 ${tier.amount}
// FIXED:  </button>
 ))}
// FIXED:  </div>
 <div className={'m}t - 2'>
 <input>
// FIXED:  id='superchat - amount - input'
// FIXED:  type='number'
// FIXED:  value={newSuperChat.amount} />
// FIXED:  onChange={e =>}
 setNewSuperChat(prev => ({}
 ...prev as any,
 amount: parseInt(e.target.value, 10) || 1 }))
 }
 min='1'
 max='500'
// FIXED:  className='w - full px - 3 py - 2 border border - gray - 300 rounded - lg focus:ring - 2 focus:ring - blue - 500 focus:border - transparent'
// FIXED:  placeholder='Custom amount'
 />
// FIXED:  </div>
// FIXED:  </div>

 <div>
 <label>
// FIXED:  htmlFor='superchat - message'
// FIXED:  className={'bloc}k text - sm font - medium text - gray - 700 mb - 1'/>
 Message
// FIXED:  </label>
 <textarea>
// FIXED:  id='superchat - message'
// FIXED:  value={newSuperChat.message} />
// FIXED:  onChange={e =>}
 setNewSuperChat(prev => ({}
 ...prev as any,
 message: e.target.value }))
 }
// FIXED:  placeholder='Add a message to your Super Chat...'
 rows={3}
 maxLength={200}
// FIXED:  className='w - full px - 3 py - 2 border border - gray - 300 rounded - lg focus:ring - 2 focus:ring - blue - 500 focus:border - transparent resize - none'
 />
 <div className={'tex}t - xs text - gray - 500 mt - 1'>
 {newSuperChat.message.length}/200 characters
// FIXED:  </div>
// FIXED:  </div>

 <div className={'fle}x items - center justify - between p - 3 bg - white rounded - lg border'>
 <div>
 <p className={'tex}t - sm font - medium text - gray - 900'>
 Super Chat Preview
// FIXED:  </p>
 <p className={'tex}t - xs text - gray - 600'>
 Will be pinned for{' '}
 {Math.floor(getTierDuration(newSuperChat.amount) / 60)}{' '}
 minutes
// FIXED:  </p>
// FIXED:  </div>
 <div>
// FIXED:  className={`px - 3 py - 1 rounded - lg text - white font - bold ${getTierColor(newSuperChat.amount)}`}/>
 {formatCurrency(newSuperChat.amount)}
// FIXED:  </div>
// FIXED:  </div>

 <div className={'fle}x space - x-2'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleSendSuperChat(e)}
// FIXED:  disabled={!newSuperChat.message.trim()}
// FIXED:  className={'fle}x - 1 px - 4 py - 2 bg - gradient - to - r from - blue - 500 to - purple - 600 text - white rounded - lg hover:from - blue - 600 hover:to - purple - 700 disabled:opacity - 50 disabled:cursor - not - allowed'
 >
 Send {formatCurrency(newSuperChat.amount)} Super Chat
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setShowSendForm(false: React.MouseEvent)}
// FIXED:  className={'p}x - 4 py - 2 text - gray - 600 border border - gray - 300 rounded - lg hover:bg - gray - 50'
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Revenue Stats */}
 <div className={'gri}d grid - cols - 2 gap - 4 mb - 4'>
 <div className='p - 3 bg - green - 50 rounded - lg'>
 <div className={'fle}x items - center space - x-2'>
 <ChartBarIcon className='w - 5 h - 5 text - green - 600' />
 <span className={'tex}t - sm font - medium text - green - 900'>
 Total Revenue
// FIXED:  </span>
// FIXED:  </div>
<p className={'tex}t - 2xl font - bold text - green - 900 mt - 1'>
 {formatCurrency(totalRevenue)}
// FIXED:  </p>
 <p className={'tex}t - xs text - green - 600'>
 From {superChats.length} Super Chats
// FIXED:  </p>
// FIXED:  </div>

 <div className='p - 3 bg - purple - 50 rounded - lg'>
 <div className={'fle}x items - center space - x-2'>
 <TrophyIcon className='w - 5 h - 5 text - purple - 600' />
 <span className={'tex}t - sm font - medium text - purple - 900'>
 Top Donation
// FIXED:  </span>
// FIXED:  </div>
<p className={'tex}t - 2xl font - bold text - purple - 900 mt - 1'>
 {topSuperChats.length > 0 && topSuperChats[0]}
 ? formatCurrency(topSuperChats[0].amount)
 : '$0'}
// FIXED:  </p>
 <p className={'tex}t - xs text - purple - 600'>
 {topSuperChats.length > 0 && topSuperChats[0]}
 ? topSuperChats[0].username
 : 'No donations yet'}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>

 {/* Recent Super Chats */}
 <div className={'spac}e - y-3 max - h-64 overflow - y-auto'>
 <h3 className={'fon}t - medium text - gray - 900'>Recent Super Chats</h3>

 {superChats.length === 0 ? (}
 <div className={'tex}t - center py - 8 text - gray - 500'>
 <CurrencyDollarIcon className='w - 12 h - 12 mx - auto mb - 3 text - gray - 300' />
 <p > No Super Chats yet</p>
 <p className={'tex}t - sm mt - 1'>Be the first to send a Super Chat!</p>
// FIXED:  </div>
 ) : (
 superChats.map((superChat) => (
 <div>
 key={superChat.id}
// FIXED:  className={`p - 3 rounded - lg border - l-4 ${getTierColor(superChat.amount)}`}
// FIXED:  style={{ backgroundColor: '#fefefe' }/>
 <div className={'fle}x items - start justify - between mb - 2'>
 <div className={'fle}x items - center space - x-2'>
 <img>
// FIXED:  src={`https://api.dicebear.com / 7.x / avataaars / svg?seed="${superChat.username}`}"
// FIXED:  alt={superChat.username}
// FIXED:  className='w - 6 h - 6 rounded - full' />
 />
 <span className={'fon}t - medium text - gray - 900'>
 {superChat.username}
// FIXED:  </span>
 <span className={'tex}t - xs text - gray - 500'>
 {formatTimestamp(superChat.timestamp || new Date())}
// FIXED:  </span>
// FIXED:  </div>
 <div>
// FIXED:  className={`px - 2 py - 1 rounded text - white text - sm font - bold ${getTierColor(superChat.amount)}`}/>
 {formatCurrency(superChat.amount)}
// FIXED:  </div>
// FIXED:  </div>
<p className={'tex}t - gray - 800'>{superChat.message}</p>

 <div className={'fle}x items - center justify - between mt - 2 text - xs text - gray - 500'>
 <span>
 Pinned for{' '}
 {Math.floor(getTierDuration(superChat.amount) / 60)} minutes
// FIXED:  </span>
 <button className={'fle}x items - center space - x-1 text - red - 500 hover:text - red - 600'>
 <HeartIcon className='w - 3 h - 3' />
 <span > Thank</span>
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 ))
 )}
// FIXED:  </div>

 {/* Top Super Chats */}
 {topSuperChats.length > 0 && (}
 <div className={'m}t - 4 pt - 4 border - t border - gray - 200'>
 <h3 className={'fon}t - medium text - gray - 900 mb - 3'>Top Super Chats</h3>
 <div className={'spac}e - y-2'>
 {topSuperChats.map((superChat, index) => (}
 <div>
 key={superChat.id}
// FIXED:  className={'fle}x items - center justify - between p - 2 bg - gray - 50 rounded - lg'/>
 <div className={'fle}x items - center space - x-2'>
 <span className={'fle}x items - center justify - center w - 6 h - 6 bg - yellow - 400 text - yellow - 900 rounded - full text - xs font - bold'>
 {index + 1}
// FIXED:  </span>
 <span className={'tex}t - sm font - medium text - gray - 900'>
 {superChat.username}
// FIXED:  </span>
 <span className={'tex}t - xs text - gray - 500 truncate max - w-32'>
 "{superChat.message}"
// FIXED:  </span>
// FIXED:  </div>
<span className={'tex}t - sm font - bold text - green - 600'>
 {formatCurrency(superChat.amount)}
// FIXED:  </span>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default SuperChatPanel;
