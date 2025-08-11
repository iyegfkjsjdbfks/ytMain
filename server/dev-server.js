import { Routes, Route } from 'react-router-dom';
// Development server for handling API requests and serving mock data
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data generators
const generateMockVideo = (id) => {
  const titles = [
    'Amazing Nature Documentary',
    'Coding Tutorial: React Hooks',
    'Travel Vlog: Japan Adventure',
    'Cooking Masterclass',
    'Music Performance Live',
    'Tech Review: Latest Gadgets',
    'Fitness Workout Routine',
    'Art Tutorial: Digital Painting',
    'Gaming Highlights',
    'Science Explained Simply'
  ];

  const channels = [
    'NatureWorld', 'CodeMaster', 'TravelBuddy', 'ChefExpert', 'MusicLive',
    'TechReviewer', 'FitnessPro', 'ArtStudio', 'GameZone', 'ScienceHub'
  ];

  const index = parseInt(id, 10) % titles.length;
  const views = Math.floor(Math.random() * 1000000) + 1000;
  const likes = Math.floor(views * 0.05);

  return {
    id,
    title: titles[index],
    description: `An amazing video about ${titles[index].toLowerCase()}`,
    thumbnailUrl: `https://picsum.photos/320/180?random=${id}`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    views: views.toLocaleString(),
    likes,
    dislikes: Math.floor(likes * 0.1),
    uploadedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    channelId: `channel-${index}`,
    channelName: channels[index],
    channelAvatar: `https://picsum.photos/40/40?random=channel-${index}`,
    channelVerified: Math.random() > 0.7,
    category: ['Gaming', 'Music', 'Education', 'Entertainment', 'Technology'][Math.floor(Math.random() * 5)],
    isLive: Math.random() > 0.95
  };
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Videos
app.get('/api/videos', (req, res) => {
  const { limit = 20, category, search } = req.query;
  const videos = Array.from({ length: parseInt(limit, 10) }, (_, i) => generateMockVideo(i.toString()));
  
  let filteredVideos = videos;
  
  if (category && category !== 'all') {
    filteredVideos = videos.filter(v => v.category.toLowerCase() === category.toLowerCase());
  }
  
  if (search) {
    filteredVideos = videos.filter(v => 
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({ videos: filteredVideos, total: filteredVideos.length });
});

app.get('/api/videos/:id', (req, res) => {
  const video = generateMockVideo(req.params.id);
  res.json(video);
});

// Shorts
app.get('/api/shorts', (req, res) => {
  const { limit = 10 } = req.query;
  const shorts = Array.from({ length: parseInt(limit, 10) }, (_, i) => ({
    ...generateMockVideo(`short-${i}`),
    duration: Math.floor(Math.random() * 60) + 15, // 15-75 seconds
    hashtags: ['#shorts', '#viral', '#trending'],
    isShort: true
  }));
  
  res.json({ shorts, total: shorts.length });
});

// Comments
app.get('/api/videos/:id/comments', (req, res) => {
  const { limit = 20 } = req.query;
  const videoId = req.params.id;
  
  const authors = [
    'VideoLover123', 'TechEnthusiast', 'NatureFan', 'MusicAddict', 'Gamer4Life'
  ];
  
  const commentTexts = [
    'This is absolutely amazing! Thanks for sharing.',
    'Great content as always. Keep up the excellent work!',
    'I learned so much from this video. Very informative.',
    'The quality of this content is outstanding.',
    'This deserves way more views. Underrated channel!'
  ];
  
  const comments = Array.from({ length: parseInt(limit, 10) }, (_, i) => ({
    id: `comment-${videoId}-${i}`,
    content: commentTexts[i % commentTexts.length],
    authorId: `user-${i}`,
    authorName: authors[i % authors.length],
    authorAvatar: `https://picsum.photos/32/32?random=user-${i}`,
    authorVerified: Math.random() > 0.8,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: Math.floor(Math.random() * 100),
    dislikes: Math.floor(Math.random() * 10),
    isLiked: false,
    replies: []
  }));
  
  res.json({ comments, total: comments.length });
});

// Channels
app.get('/api/channels/:id', (req, res) => {
  const channelId = req.params.id;
  const names = ['TechMaster', 'NatureExplorer', 'MusicMaven', 'GameGuru', 'ArtisticSoul'];
  const index = parseInt(channelId.replace('channel-', '')) % names.length;
  
  const channel = {
    id: channelId,
    name: names[index],
    handle: `@${names[index].toLowerCase()}`,
    description: `Welcome to ${names[index]}! We create amazing content.`,
    avatarUrl: `https://picsum.photos/80/80?random=${channelId}`,
    bannerUrl: `https://picsum.photos/1280/320?random=${channelId}-banner`,
    subscriberCount: Math.floor(Math.random() * 1000000) + 1000,
    videoCount: Math.floor(Math.random() * 500) + 10,
    verified: Math.random() > 0.7,
    joinedDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  res.json(channel);
});

// Search
app.get('/api/search', (req, res) => {
  const { q: query, limit = 20, type = 'video' } = req.query;
  
  if (type === 'video') {
    const videos = Array.from({ length: parseInt(limit, 10) }, (_, i) => generateMockVideo(`search-${i}`));
    const filteredVideos = query 
      ? videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()))
      : videos;
    
    res.json({ results: filteredVideos, total: filteredVideos.length, type: 'video' });
  } else {
    res.json({ results: [], total: 0, type });
  }
});

// Trending
app.get('/api/trending', (req, res) => {
  const { limit = 20, category = 'all' } = req.query;
  const videos = Array.from({ length: parseInt(limit, 10) }, (_, i) => ({
    ...generateMockVideo(`trending-${i}`),
    trending: true,
    trendingRank: i + 1
  }));
  
  res.json({ videos, total: videos.length });
});

// Subscriptions
app.get('/api/subscriptions', (req, res) => {
  const subscriptions = Array.from({ length: 10 }, (_, i) => ({
    channelId: `channel-${i}`,
    channelName: `Channel ${i + 1}`,
    channelAvatar: `https://picsum.photos/40/40?random=channel-${i}`,
    subscribedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    notificationsEnabled: Math.random() > 0.5
  }));
  
  res.json({ subscriptions, total: subscriptions.length });
});

// Playlists
app.get('/api/playlists', (req, res) => {
  const playlists = Array.from({ length: 5 }, (_, i) => ({
    id: `playlist-${i}`,
    title: `My Playlist ${i + 1}`,
    description: `A collection of my favorite videos ${i + 1}`,
    thumbnailUrl: `https://picsum.photos/320/180?random=playlist-${i}`,
    videoCount: Math.floor(Math.random() * 50) + 5,
    visibility: Math.random() > 0.5 ? 'public' : 'private',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  res.json({ playlists, total: playlists.length });
});

// Upload endpoint
app.post('/api/upload', (req, res) => {
  // Simulate upload process
  const uploadId = `upload-${Date.now()}`;
  
  res.json({
    uploadId,
    status: 'processing',
    progress: 0,
    message: 'Upload started'
  });
});

// Upload progress
app.get('/api/upload/:id/progress', (req, res) => {
  const progress = Math.min(100, Math.floor(Math.random() * 100) + 1);
  
  res.json({
    uploadId: req.params.id,
    progress,
    status: progress === 100 ? 'completed' : 'processing',
    message: progress === 100 ? 'Upload completed' : `Processing... ${progress}%`
  });
});

// Placeholder image endpoint
app.get('/api/placeholder/:dimensions', (req, res) => {
  const { dimensions } = req.params;
  const [width, height] = dimensions.split('x').map(Number);
  
  // Redirect to picsum photos
  res.redirect(`https://picsum.photos/${width || 320}/${height || 180}?random=${Math.floor(Math.random() * 1000)}`);
});

// Placeholder video endpoint
app.get('/api/placeholder/video', (req, res) => {
  const videos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ];
  
  const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  res.redirect(randomVideo);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  });

export default app;
