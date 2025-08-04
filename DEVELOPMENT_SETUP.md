# Development Setup Guide

Complete guide for setting up the YouTubeX Studio Clone development environment.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0 or **yarn**: >= 1.22.0
- **Git**: Latest version
- **YouTube Data API Key**: For video data integration
- **Google Gemini API Key**: For AI features (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anassabri/ytMain.git
   cd ytMain
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Required: YouTube Data API
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # Optional: Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # App Configuration
   VITE_APP_NAME=YouTubeX
   VITE_APP_VERSION=2.0.0
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development environment:**
   ```bash
   npm run dev
   ```
   
   This starts the Vite development server at `http://localhost:5173`

## 🔧 Development Environment

### Available Scripts

#### Development
```bash
npm run dev              # Start Vite development server
npm run dev:client       # Start client-only server
npm run dev:api         # Start API development server
npm run dev:full        # Start both client and API servers
npm run dev:debug       # Start with debug mode enabled
npm run dev:performance # Start with performance overlay
```

#### Building & Testing
```bash
npm run build                  # Production build
npm run build:with-type-check  # Build with TypeScript checking
npm run build:analyze          # Build with bundle analysis
npm run preview               # Preview production build
npm run test                  # Run tests in watch mode
npm run test:run              # Run tests once
npm run test:coverage         # Generate coverage report
```

#### Code Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix ESLint issues
npm run type-check        # TypeScript type checking
npm run format            # Format with Prettier
npm run validate          # Full validation (lint + type-check + test)
```

## 🛠️ Development Tools

### IDE Setup

#### VS Code (Recommended)
Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

#### Settings Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.autoFixOnSave": true
}
```

### Browser DevTools

#### React DevTools
- Install React Developer Tools browser extension
- Use for component hierarchy inspection and state debugging

#### Redux DevTools
- Install Redux DevTools for Zustand state debugging
- Enable in development builds

## 🔐 API Keys & Configuration

### YouTube Data API Setup

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create API credentials (API Key)

2. **Configure API Key:**
   ```env
   VITE_YOUTUBE_API_KEY=your_api_key_here
   ```

3. **API Restrictions (Recommended):**
   - Restrict to YouTube Data API v3
   - Add domain restrictions for production

### Google Gemini AI Setup (Optional)

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate API key

2. **Configure:**
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key_here
   ```

## 🏗️ Project Architecture

### Folder Structure Overview
```
src/
├── components/        # Reusable UI components
│   ├── atoms/        # Basic building blocks
│   ├── molecules/    # Component combinations
│   ├── organisms/    # Complex UI sections
│   └── unified/      # Unified design system
├── features/         # Feature-based organization
│   ├── auth/        # Authentication
│   ├── video/       # Video management
│   ├── playlist/    # Playlist functionality
│   └── ...          # Other features
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```

### State Management
- **Zustand**: Global state management
- **React Query**: Server state and caching
- **React Context**: UI-specific state

### Routing
- **React Router v6**: Client-side routing
- **Lazy Loading**: Code splitting for performance
- **Error Boundaries**: Graceful error handling

## 🧪 Testing Environment

### Test Structure
```
test/
├── __mocks__/       # Mock implementations
├── components/      # Component tests
├── hooks/          # Hook tests
├── services/       # API service tests
└── utils/          # Utility tests
```

### Running Tests
```bash
# Watch mode (recommended for development)
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI dashboard
npm run test:ui
```

### Writing Tests
```typescript
// Component testing example
import { renderWithProviders } from '../utils/testing';
import { VideoCard } from './VideoCard';

test('renders video information correctly', () => {
  const mockVideo = {
    id: '123',
    title: 'Test Video',
    channel: 'Test Channel'
  };
  
  renderWithProviders(<VideoCard video={mockVideo} />);
  
  expect(screen.getByText('Test Video')).toBeInTheDocument();
  expect(screen.getByText('Test Channel')).toBeInTheDocument();
});
```

## 📱 PWA Development

### Service Worker
- Automatic generation via Vite PWA plugin
- Custom caching strategies in `src/config/pwa.ts`
- Development mode includes SW debugging

### Testing PWA Features
```bash
# Build and serve for PWA testing
npm run build
npm run preview

# Test on HTTPS (required for PWA)
npx local-ssl-proxy --source 3001 --target 4173
```

### PWA Debugging
- Use Chrome DevTools Application tab
- Monitor service worker lifecycle
- Test offline functionality
- Validate web app manifest

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# If port 5173 is busy, Vite will auto-increment
# Or specify a custom port:
npm run dev -- --port 3000
```

#### API Key Issues
```bash
# Verify API key in browser console
console.log(import.meta.env.VITE_YOUTUBE_API_KEY);

# Check API quota in Google Cloud Console
```

#### Type Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Build Issues
```bash
# Clear all caches and rebuild
npm run clean:all
npm install
npm run build
```

### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check memory usage
npm run dev:debug
```

### Getting Help
1. Check [documentation](docs/)
2. Search [existing issues](https://github.com/anassabri/ytMain/issues)
3. Create a [new issue](https://github.com/anassabri/ytMain/issues/new)
4. Join community discussions

---

*For production deployment instructions, see [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)*
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
