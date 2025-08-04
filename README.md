# YouTubeX Studio Clone

A modern, feature-rich YouTube Studio clone built with React 18, TypeScript, and Vite. This application showcases contemporary web development practices, advanced React patterns, and comprehensive PWA capabilities.

## 🚀 Features

### Core Functionality
- **Video Management**: Browse, search, and manage videos with advanced filtering and virtualized lists
- **Live Streaming**: Real-time streaming capabilities with the Live Streaming Hub
- **Content Creation**: AI-powered content suggestions using Google Gemini AI
- **Analytics Dashboard**: Comprehensive analytics with interactive charts and insights
- **Channel Management**: Complete channel customization and content organization
- **Playlist Management**: Create, edit, and organize playlists with drag-and-drop functionality

### Progressive Web App (PWA)
- **Offline Support**: Work without internet connection with intelligent caching
- **Install Prompts**: Native app-like installation experience
- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Stay updated with real-time notifications
- **App Shortcuts**: Quick access to key features from the home screen

### Advanced Architecture
- **State Management**: Zustand for lightweight, performant global state
- **Data Fetching**: TanStack React Query for server state and caching
- **Routing**: React Router v6 with lazy loading and error boundaries
- **Component Design**: Atomic design system with reusable components
- **Performance**: Virtualization, code splitting, and optimized bundle management

## 🛠️ Tech Stack

### Frontend Core
- **React 18** - UI library with concurrent features and server components
- **TypeScript** - Type-safe development with advanced type definitions
- **Vite** - Next-generation build tool with HMR and optimized bundling
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens

### State & Data Management
- **Zustand** - Lightweight state management with devtools integration
- **TanStack React Query** - Powerful data synchronization and caching
- **React Context** - Component-level state sharing for UI state

### Routing & Navigation
- **React Router v6** - Client-side routing with data loading patterns
- **Lazy Loading** - Code splitting for optimal performance
- **Error Boundaries** - Graceful error handling across routes

### Performance & PWA
- **React Window** - Virtualization for large lists and grids
- **Service Worker** - Advanced caching and offline functionality
- **Web App Manifest** - Native app-like installation and shortcuts
- **Background Sync** - Reliable data synchronization

### Development & Quality
- **Vitest** - Fast unit testing with native ES modules
- **Testing Library** - User-centric component testing
- **ESLint** - Advanced linting with TypeScript rules
- **Prettier** - Consistent code formatting
- **Husky** - Git hooks for quality assurance

## 📦 Installation & Setup

### Prerequisites
- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/anassabri/ytMain.git
   cd ytMain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API keys:
   ```env
   # YouTube Data API
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # Google Gemini AI (optional for AI features)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # App Configuration
   VITE_APP_NAME=YouTubeX
   VITE_APP_VERSION=2.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Alternative Installation Methods

#### Using Yarn
```bash
yarn install
yarn dev
```

#### Using Docker
```bash
docker-compose up --build
```

## 🚀 Available Scripts

### Development
```bash
npm run dev              # Start development server with HMR
npm run dev:client       # Start client-only development server
npm run dev:api         # Start API server for development
npm run dev:full        # Start both client and API servers
npm run dev:debug       # Start with debug mode enabled
```

### Building & Production
```bash
npm run build                  # Build for production
npm run build:with-type-check  # Build with TypeScript checking
npm run build:analyze          # Build with bundle analyzer
npm run build:production       # Build with production optimizations
npm run preview               # Preview production build locally
```

### Testing
```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:ui           # Run tests with UI dashboard
npm run test:coverage     # Run tests with coverage report
npm run test:components   # Test components only
npm run test:hooks        # Test hooks only
npm run test:services     # Test services only
```

### Code Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues automatically
npm run lint:strict       # Run ESLint with zero warnings
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
npm run type-check        # Run TypeScript type checking
```

### Maintenance
```bash
npm run clean             # Clean build artifacts
npm run clean:cache       # Clean development cache
npm run clean:all         # Clean everything including node_modules
npm run deps:check        # Check for dependency updates
npm run deps:update       # Update dependencies
npm run security:audit    # Run security audit
```

## 🏗️ Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── atoms/              # Basic building blocks (buttons, inputs)
│   ├── molecules/          # Component combinations (forms, cards)
│   ├── organisms/          # Complex UI sections (headers, sidebars)
│   ├── unified/            # Unified component system
│   ├── ErrorBoundaries/    # Error handling components
│   └── mobile/             # Mobile-specific components
├── config/                 # Configuration files
│   └── pwa.ts             # PWA configuration and utilities
├── features/               # Feature-based organization
│   ├── auth/              # Authentication features
│   ├── video/             # Video management features
│   ├── playlist/          # Playlist functionality
│   ├── comments/          # Comment system
│   ├── search/            # Search functionality
│   ├── analytics/         # Analytics and insights
│   ├── livestream/        # Live streaming features
│   ├── creator/           # Creator studio features
│   ├── community/         # Community features
│   └── common/            # Shared feature utilities
├── hooks/                 # Custom React hooks
├── lib/                   # External library configurations
├── pages/                 # Page components and routing
├── services/              # API services and data layer
├── styles.css             # Global styles and Tailwind imports
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and helpers
└── vite-env.d.ts         # Vite environment types

config/
└── routes.tsx             # Route configuration with lazy loading

docs/                      # Documentation
├── API.md                # API documentation
├── DEPLOYMENT.md         # Deployment guide
├── TESTING.md           # Testing strategies
└── ...                   # Additional documentation

public/                    # Static assets
├── icons/                # PWA icons and favicons
├── manifest.json         # Web app manifest
└── sw.js                # Service worker
```

## 🎯 Key Features & Usage

### Video Management
The application provides comprehensive video management capabilities:

```typescript
// Virtualized video grid for performance
<VirtualizedVideoGrid
  videos={videos}
  onLoadMore={loadMore}
  cardSize="medium"
  showChannel={true}
  enableVirtualization={true}
/>
```

### PWA Capabilities
Fully functional Progressive Web App with offline support:

```typescript
// PWA utilities
import { PWAUtils } from './config/pwa';

// Check if app is installed
if (PWAUtils.isInstalled()) {
  // App is running as PWA
}

// Check installation eligibility
if (PWAUtils.shouldShowInstallPrompt()) {
  // Show install prompt
}
```

### Live Streaming
Real-time streaming capabilities through the Live Streaming Hub:

- Stream management and controls
- Real-time viewer statistics
- Chat integration
- Stream quality optimization

### AI-Powered Features
Integration with Google Gemini AI for content enhancement:

- Automated content suggestions
- Smart title and description generation
- Content optimization recommendations
- Trending topic analysis

### State Management
Optimized state management with Zustand:

```typescript
// Global state with selectors for performance
const useVideoStore = (category) => useAppStore(
  (state) => state.videos[category],
  shallow
);

// Persistent state with automatic hydration
const useAuthStore = useStore(authStore);
```

## 🧪 Testing

The project includes comprehensive testing utilities and strategies:

### Test Structure
```bash
test/                    # Test files mirror src/ structure
├── components/         # Component tests
├── hooks/             # Hook tests
├── services/          # Service/API tests
├── utils/             # Utility function tests
└── __mocks__/         # Mock implementations
```

### Testing Utilities
```typescript
// Custom render with providers for component testing
import { renderWithProviders } from './utils/testing';

renderWithProviders(<Component />, {
  initialStoreState: { theme: 'dark' },
  queryClient: customQueryClient,
});

// Performance testing helpers
const perfTest = new PerformanceTestHelper();
perfTest.start();
// ... test operations
const metrics = perfTest.end();
expect(metrics.duration).toBeLessThan(100);
```

### Running Tests
```bash
# Unit tests
npm run test                 # Watch mode
npm run test:run            # Single run
npm run test:coverage       # With coverage

# Specific test suites
npm run test:components     # Component tests only
npm run test:hooks         # Hook tests only
npm run test:services      # Service tests only

# Performance tests
npm run test:performance    # Lighthouse CI
```

## 📊 Performance Monitoring

Built-in performance monitoring and optimization:

### Component Performance
```typescript
// Performance monitoring HOC
const MyComponent = withPerformanceMonitoring(
  'MyComponent',
  () => <div>Content</div>
);

// Custom performance hooks
const { startMeasure, endMeasure } = usePerformanceMonitor('VideoLoad');
```

### Bundle Analysis
```bash
npm run build:analyze       # Analyze bundle size
npm run analyze:size        # Check bundle size limits
```

### Lighthouse Integration
```bash
npm run test:performance    # Run Lighthouse CI
```

## 🔧 Configuration

### Vite Configuration
Advanced configuration for optimal development and production builds:

- **Hot Module Replacement (HMR)** for instant development feedback
- **Code splitting** with intelligent chunk optimization
- **Bundle analysis** with built-in visualizer
- **Proxy configuration** for API development
- **Environment-specific builds** for staging and production

### Tailwind Configuration
Custom design system implementation:

- **Design tokens** for consistent spacing, colors, and typography
- **Dark mode support** with system preference detection
- **Custom utility classes** for common patterns
- **Component-specific styles** with CSS-in-JS integration
- **Responsive breakpoints** optimized for all devices

### PWA Configuration
Comprehensive Progressive Web App setup:

```typescript
// Customizable PWA features
const PWA_CONFIG = {
  APP_NAME: 'YouTubeX',
  CACHE_STRATEGIES: 'networkFirst',
  OFFLINE_FALLBACKS: true,
  BACKGROUND_SYNC: true,
  PUSH_NOTIFICATIONS: true,
};
```

### TypeScript Configuration
Strict TypeScript setup for maximum type safety:

- **Strict mode** enabled with comprehensive type checking
- **Path mapping** for clean imports
- **Custom type definitions** for enhanced developer experience
- **Build-time type checking** integrated into CI/CD

## 🚀 Deployment

### Production Build
```bash
npm run build:production    # Optimized production build
npm run preview:production  # Preview production build locally
```

### Environment Configuration
```env
# Production environment variables
NODE_ENV=production
VITE_API_BASE_URL=https://api.youtubex.com
VITE_CDN_URL=https://cdn.youtubex.com
VITE_ANALYTICS_ID=your_analytics_id
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build

# Production deployment
docker build -t youtubex-app .
docker run -p 80:80 youtubex-app
```

### Static Hosting
The application is optimized for static hosting platforms:

- **Netlify**: Automatic deployments with `netlify.toml`
- **Vercel**: Zero-configuration deployments
- **GitHub Pages**: Static site deployment
- **AWS S3 + CloudFront**: Enterprise-scale deployment

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the development guidelines below
4. Commit changes: `git commit -m 'feat: add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

#### Code Standards
- **TypeScript**: Write type-safe code with proper type definitions
- **ESLint**: Follow the established linting rules
- **Prettier**: Use consistent code formatting
- **Conventional Commits**: Use semantic commit messages

#### Testing Requirements
- **Unit Tests**: Write tests for new components and utilities
- **Integration Tests**: Test complex user interactions
- **Performance Tests**: Ensure optimizations don't regress
- **Coverage**: Maintain minimum 80% test coverage

#### Documentation
- **Code Comments**: Document complex logic and algorithms
- **README Updates**: Update documentation for significant changes
- **API Documentation**: Document new API endpoints or changes
- **Component Documentation**: Use JSDoc for component props

### Code Review Process
1. **Automated Checks**: All PRs must pass linting, tests, and builds
2. **Peer Review**: At least one team member review required
3. **Performance Review**: Check for performance implications
4. **Documentation Review**: Ensure documentation is updated

## 📖 Documentation

### Additional Resources
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](docs/TESTING.md)** - Comprehensive testing strategies
- **[Performance Guide](docs/PERFORMANCE_OPTIMIZATION_GUIDE.md)** - Performance best practices
- **[Security Guide](docs/SECURITY_GUIDE.md)** - Security implementation details

### Getting Help
1. **Documentation**: Check the comprehensive documentation in `/docs`
2. **Issues**: Search [existing issues](https://github.com/anassabri/ytMain/issues)
3. **Discussions**: Join community discussions
4. **Support**: Create a [new issue](https://github.com/anassabri/ytMain/issues/new) for bugs or feature requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the powerful framework and development tools
- **Vite Team** for the lightning-fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Open Source Community** for the amazing libraries and tools
- **Contributors** who help improve this project

---

**Built with ❤️ using modern React patterns, TypeScript, and performance best practices.**

For more information, visit the [project documentation](docs/) or check out the [live demo](https://your-demo-url.com).
