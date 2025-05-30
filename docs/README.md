# YouTube Studio Clone Documentation

Welcome to the comprehensive documentation for the YouTube Studio Clone project. This documentation provides detailed information about the project architecture, setup, development, and deployment.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Component Library](#component-library)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)

## Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/ytastudioaug2.git
   cd ytastudioaug2
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- YouTube Data API key
- Google Gemini AI API key (optional)

## Architecture

### Overview

The YouTube Studio Clone is built with modern web technologies:

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Testing**: Vitest + Playwright
- **Build Tool**: Vite
- **Deployment**: Docker + Vercel

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── forms/          # Form components
│   └── icons/          # Icon components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # State management
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── contexts/           # React contexts
```

### Key Features

- **Video Management**: Upload, edit, and manage videos
- **Analytics Dashboard**: Real-time video performance metrics
- **Content Optimization**: AI-powered suggestions
- **Live Streaming**: Go live functionality
- **Comment Moderation**: Manage video comments
- **Channel Customization**: Customize channel appearance
- **Monetization**: Revenue tracking and management

## API Documentation

### YouTube Data API Integration

The application integrates with the YouTube Data API v3 for:

- Video metadata retrieval
- Channel information
- Playlist management
- Comment management
- Analytics data

### Gemini AI Integration

Optional integration with Google Gemini AI for:

- Content analysis
- SEO optimization suggestions
- Thumbnail recommendations
- Title and description optimization

### API Endpoints

#### Videos

- `GET /api/videos` - List videos
- `GET /api/videos/:id` - Get video details
- `POST /api/videos` - Upload video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

#### Analytics

- `GET /api/analytics/overview` - Channel overview
- `GET /api/analytics/videos/:id` - Video analytics
- `GET /api/analytics/revenue` - Revenue data

## Component Library

### UI Components

#### Button
```tsx
import { Button } from '@/components/forms/Button';

<Button variant="primary" size="lg">
  Upload Video
</Button>
```

#### Input
```tsx
import { Input } from '@/components/forms/Input';

<Input
  type="text"
  placeholder="Video title"
  value={title}
  onChange={setTitle}
/>
```

#### VideoCard
```tsx
import { VideoCard } from '@/components/VideoCard';

<VideoCard
  video={video}
  onPlay={handlePlay}
  showAnalytics
/>
```

### Layout Components

- `Layout` - Main application layout
- `Header` - Navigation header
- `Sidebar` - Navigation sidebar
- `PageLayout` - Page wrapper with breadcrumbs

### Feature Components

- `VideoPlayer` - Advanced video player
- `VideoUpload` - Video upload interface
- `AnalyticsDashboard` - Analytics visualization
- `CommentModeration` - Comment management

## Development Guide

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive tests

### State Management

#### Zustand Store
```typescript
import { create } from 'zustand';

interface VideoStore {
  videos: Video[];
  loading: boolean;
  fetchVideos: () => Promise<void>;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  loading: false,
  fetchVideos: async () => {
    set({ loading: true });
    // Fetch logic
    set({ loading: false });
  },
}));
```

#### React Query
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['videos'],
  queryFn: fetchVideos,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Custom Hooks

#### useVideoData
```typescript
import { useVideoData } from '@/hooks/useVideoData';

const { videos, loading, error, refetch } = useVideoData();
```

#### useDebounce
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

### Performance Optimization

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load components and routes
- Optimize images and assets
- Use service workers for caching

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Writing Tests

#### Component Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/VideoCard';

describe('VideoCard', () => {
  it('displays video title and duration', () => {
    const mockVideo = {
      id: '1',
      title: 'Test Video',
      duration: 120,
    };

    render(<VideoCard video={mockVideo} />);

    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });
});
```

## Deployment

### Docker Deployment

```bash
# Build production image
docker build -t youtube-studio-clone .

# Run container
docker run -p 80:80 youtube-studio-clone
```

### Vercel Deployment

```bash
# Deploy to Vercel
npm run deploy
```

### Environment Variables

Required environment variables:

- `VITE_YOUTUBE_API_KEY` - YouTube Data API key
- `VITE_GEMINI_API_KEY` - Google Gemini AI API key
- `VITE_APP_VERSION` - Application version
- `VITE_API_BASE_URL` - API base URL

## Performance

### Metrics

- **Lighthouse Score**: 95+ for all categories
- **Core Web Vitals**: All metrics in green
- **Bundle Size**: < 500KB gzipped
- **Time to Interactive**: < 3 seconds

### Optimization Techniques

- Code splitting by routes
- Tree shaking for unused code
- Image optimization and lazy loading
- Service worker caching
- CDN for static assets

### Monitoring

- Lighthouse CI for performance monitoring
- Bundle analyzer for size tracking
- Error tracking with Sentry
- Analytics with Google Analytics

## Security

### Best Practices

- Input validation and sanitization
- XSS protection with CSP
- CSRF protection
- Secure API communication
- Environment variable protection

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "no-referrer-when-downgrade";
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Run linting and tests
6. Submit a pull request

## Support

- **Documentation**: [docs/](./)
- **Issues**: [GitHub Issues](https://github.com/username/ytastudioaug2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/username/ytastudioaug2/discussions)
- **Email**: support@example.com

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.