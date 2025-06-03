# Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development environment:**
   ```bash
   npm run dev
   ```

   This will start:
   - 🎨 Vite dev server on `http://localhost:3000`
   - 📡 Mock API server on `http://localhost:8000`

3. **Alternative: Start only the client:**
   ```bash
   npm run dev:client-only
   ```

## 🔧 Development Environment

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both API and client servers |
| `npm run dev:client` | Start only Vite dev server |
| `npm run dev:api` | Start only mock API server |
| `npm run dev:client-only` | Start Vite without API dependency |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |

### Mock API Server

The development environment includes a mock API server that provides:

- **Videos API**: `/api/videos` - Mock video data
- **Shorts API**: `/api/shorts` - Short-form video content
- **Comments API**: `/api/videos/:id/comments` - Video comments
- **Channels API**: `/api/channels/:id` - Channel information
- **Search API**: `/api/search` - Search functionality
- **Trending API**: `/api/trending` - Trending content
- **Upload API**: `/api/upload` - File upload simulation

### Image & Video Placeholders

The app uses several placeholder services:

1. **Images**: `https://picsum.photos` for thumbnails and avatars
2. **Videos**: Google's sample videos for video playback
3. **Fallback**: Local placeholder generation for offline development

### Environment Configuration

#### Proxy Configuration (vite.config.ts)
```typescript
proxy: {
  '/api/placeholder': {
    target: 'https://picsum.photos',
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(/^\/api\/placeholder/, ''),
  },
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
  },
}
```

## 🎯 New Features Overview

### Core Components Added

1. **🎬 ShortsPlayer** (`components/ShortsPlayer.tsx`)
   - Vertical video player
   - Swipe navigation
   - Interactive controls

2. **💬 EnhancedCommentSystem** (`components/EnhancedCommentSystem.tsx`)
   - Threaded comments
   - Moderation tools
   - Real-time updates

3. **📺 SubscriptionsPage** (`components/SubscriptionsPage.tsx`)
   - Subscription management
   - Bulk operations
   - Smart filtering

4. **✂️ VideoEditor** (`components/VideoEditor.tsx`)
   - Video trimming
   - Text overlays
   - Visual filters

5. **🛡️ ModerationDashboard** (`components/ModerationDashboard.tsx`)
   - AI-powered moderation
   - Bulk actions
   - Content filtering

### Utility Services

1. **🔧 MockApiService** (`services/mockApiService.ts`)
   - Centralized mock data generation
   - Consistent placeholder URLs
   - API simulation

2. **🖼️ ImageUtils** (`utils/imageUtils.ts`)
   - Image optimization
   - Fallback handling
   - Responsive images

## 🐛 Troubleshooting

### Common Issues

#### 1. Proxy Errors (ECONNREFUSED)
```
[vite] http proxy error: /api/placeholder/320/180
AggregateError [ECONNREFUSED]
```

**Solution**: The mock API server isn't running. Use:
```bash
npm run dev  # Starts both servers
```

#### 2. Image Loading Issues
If placeholder images aren't loading:

1. Check internet connection (uses picsum.photos)
2. Use fallback mode:
   ```bash
   npm run dev:client-only
   ```

#### 3. Video Playback Issues
Sample videos may not load due to:
- Network restrictions
- CORS policies
- Browser security settings

**Solution**: Videos will show thumbnails and controls, but playback depends on external sources.

### Development Tips

1. **Hot Reload**: Both servers support hot reload
2. **API Testing**: Visit `http://localhost:8000/api/health` to test API
3. **Mock Data**: All data is generated dynamically - refresh for new content
4. **Offline Mode**: Most features work offline with cached placeholders

## 📱 Mobile Development

The app is fully responsive and supports:
- Touch interactions
- Mobile-optimized layouts
- Gesture navigation (Shorts)
- Responsive images

Test on mobile by:
1. Opening `http://192.168.1.7:3000` on mobile device
2. Using browser dev tools mobile simulation
3. Testing touch interactions on Shorts player

## 🔍 Feature Testing

### Testing New Components

1. **Shorts Player**:
   - Navigate to `/shorts`
   - Use arrow keys or swipe to navigate
   - Test like, comment, subscribe actions

2. **Enhanced Comments**:
   - Go to any video page
   - Test threaded replies
   - Try moderation features (if admin)

3. **Subscription Management**:
   - Visit `/subscriptions`
   - Test bulk operations
   - Try filtering and search

4. **Video Editor**:
   - Upload a video
   - Test trimming, text overlays, filters
   - Export functionality

5. **Moderation Dashboard**:
   - Access admin panel
   - Test content filtering
   - Try bulk moderation actions

## 🚀 Production Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Create `.env.production`:
```
VITE_API_URL=https://your-api-server.com
VITE_CDN_URL=https://your-cdn.com
```

### Deployment Checklist
- [ ] Update API endpoints
- [ ] Configure CDN for images/videos
- [ ] Set up real authentication
- [ ] Configure analytics
- [ ] Test all features in production

## 📊 Performance Monitoring

The app includes:
- Lazy loading for components
- Image optimization
- Virtual scrolling for large lists
- Memoization for expensive operations

Monitor performance using:
- Browser DevTools
- React DevTools
- Lighthouse audits

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test on multiple devices/browsers

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Look at browser console for errors
3. Test with `npm run dev:client-only` for API-independent issues
4. Check network tab for failed requests

---

**Happy coding! 🎉**
