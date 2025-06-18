import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin, defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .tsx files
      include: '**/*.{jsx,tsx}',
      // Enable automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    splitVendorChunkPlugin(),
    // Gzip compression for production
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression for production
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // HTML optimization
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'YouTube Studio Clone',
          description: 'A modern YouTube Studio clone built with React, TypeScript, and Vite',
        },
      },
    }),
    // Bundle analyzer (only in build mode)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@pages': resolve(__dirname, './pages'),
      '@hooks': resolve(__dirname, './hooks'),
      '@utils': resolve(__dirname, './utils'),
      '@services': resolve(__dirname, './services'),
      '@contexts': resolve(__dirname, './contexts'),
      '@store': resolve(__dirname, './store'),
      '@types': resolve(__dirname, './types.ts'),
      '@config': resolve(__dirname, './config'),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    open: true, // Open browser on server start
    cors: true, // Enable CORS
    // Add headers for YouTube iframe compatibility
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@heroicons') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'chart-vendor';
            }
            return 'vendor';
          }
          
          // App chunks by feature
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/video/') || id.includes('VideoPlayer') || id.includes('YouTubePlayer') || id.includes('OptimizedVideoPlayer') || id.includes('OptimizedYouTubePlayer')) {
            return 'video-components';
          }
          if (id.includes('/components/') && (id.includes('VideoCard') || id.includes('VideoGrid') || id.includes('OptimizedVideoCard') || id.includes('OptimizedSearchResults'))) {
            return 'video-listing';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
        },
        
        // Asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
  },
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'zustand',
      '@tanstack/react-query',
      'react-window',
      'react-window-infinite-loader',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded dynamically
    ],
  },
  
  // Preview configuration (for production preview)
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },
  
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
  
  // ESBuild configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
    platform: 'browser',
  },
  
  // Worker configuration
  worker: {
    format: 'es',
  },
});
