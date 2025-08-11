import { Link } from 'react-router-dom';
/**
 * Comprehensive code quality configuration and utilities
 */

// ESLint configuration extensions
export const eslintConfig = {
  // Additional rules for better code quality
  rules: {
    // React specific rules
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'error',
    'react/prefer-stateless-function': 'warn',
    'react/self-closing-comp': 'error',

    // React Hooks rules
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',

    // General code quality rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error',

    // Performance rules
    'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
    'react/jsx-no-constructed-context-values': 'error',

    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
  },
};

// Prettier configuration
export const prettierConfig = {
  semi: true,
  trailingComma: 'es5' as const,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid' as const,
  endOfLine: 'lf' as const,
  quoteProps: 'as-needed' as const,
  jsxSingleQuote: false,
  proseWrap: 'preserve' as const,
};

// Code complexity thresholds
export const complexityThresholds = {
  cyclomaticComplexity: 10,
  cognitiveComplexity: 15,
  maxLinesPerFunction: 50,
  maxLinesPerFile: 300,
  maxParametersPerFunction: 5,
  maxDepthLevel: 4,
};

// Performance budgets
export const performanceBudgets = {
  // Bundle size limits (in KB)
  maxBundleSize: 1024, // 1MB
  maxChunkSize: 512, // 512KB
  maxAssetSize: 256, // 256KB

  // Runtime performance limits
  maxRenderTime: 16, // 16ms (60fps)
  maxApiResponseTime: 2000, // 2 seconds
  maxImageLoadTime: 1000, // 1 second

  // Core Web Vitals thresholds
  maxLCP: 2500, // Largest Contentful Paint
  maxFID: 100, // First Input Delay
  maxCLS: 0.1, // Cumulative Layout Shift
};

// Security configuration
export const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://www.youtube.com', 'https://www.google.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'media-src': ["'self'", 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://api.youtube.com', 'wss:'],
    'frame-src': ['https://www.youtube.com'],
  },

  // Sensitive data patterns to avoid
  sensitivePatterns: [
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i,
    /auth/i,
    /credential/i,
    /private[_-]?key/i,
  ],

  // Allowed external domains
  allowedDomains: [
    'youtube.com',
    'googleapis.com',
    'gstatic.com',
    'ytimg.com',
  ],
};

// Accessibility standards
export const a11yStandards = {
  // WCAG 2.1 AA compliance requirements
  wcag: {
    level: 'AA',
    version: '2.1',
  },

  // Color contrast ratios
  colorContrast: {
    normal: 4.5, // AA standard
    large: 3, // AA standard for large text
    enhanced: 7, // AAA standard
  },

  // Required ARIA attributes
  requiredAria: [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'role',
  ],

  // Keyboard navigation requirements
  keyboardNav: {
    tabIndex: true,
    focusVisible: true,
    skipLinks: true,
    landmarkRoles: true,
  },
};

// Testing configuration
export const testingConfig = {
  // Coverage thresholds
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },

  // Test file patterns
  testPatterns: [
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/__tests__/**/*.{ts,tsx}',
  ],

  // Test environment setup
  setupFiles: [
    '<rootDir>/test/setup.ts',
  ],

  // Mock patterns
  mockPatterns: [
    '^@/(.*)$',
    '\\.(css|less|scss|sass)$',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$',
  ],
};

// Code review checklist
export const codeReviewChecklist = {
  functionality: [
    'Does the code work as intended?',
    'Are edge cases handled properly?',
    'Is error handling comprehensive?',
    'Are loading states managed correctly?',
  ],

  performance: [
    'Are there any performance bottlenecks?',
    'Is the code optimized for re-renders?',
    'Are large objects memoized appropriately?',
    'Is lazy loading implemented where beneficial?',
  ],

  security: [
    'Are user inputs properly validated?',
    'Is sensitive data handled securely?',
    'Are API calls authenticated properly?',
    'Is XSS protection in place?',
  ],

  accessibility: [
    'Are ARIA attributes used correctly?',
    'Is keyboard navigation supported?',
    'Are color contrasts sufficient?',
    'Are screen readers supported?',
  ],

  maintainability: [
    'Is the code readable and well-documented?',
    'Are functions and components single-purpose?',
    'Is the code DRY (Don\'t Repeat Yourself)?',
    'Are naming conventions consistent?',
  ],

  testing: [
    'Are unit tests comprehensive?',
    'Are integration tests included?',
    'Is the happy path tested?',
    'Are error scenarios tested?',
  ],
};

// Monitoring and alerting configuration
export const monitoringConfig = {
  // Error tracking
  errorTracking: {
    enableInProduction: true,
    enableInDevelopment: false,
    sampleRate: 1.0,
    maxBreadcrumbs: 50,
  },

  // Performance monitoring
  performanceMonitoring: {
    enableInProduction: true,
    enableInDevelopment: true,
    sampleRate: 0.1, // 10% sampling in production
    trackWebVitals: true,
    trackUserInteractions: true,
  },

  // Analytics
  analytics: {
    trackPageViews: true,
    trackUserEvents: true,
    trackPerformanceMetrics: true,
    respectDoNotTrack: true,
  },

  // Alerts
  alerts: {
    errorRate: 0.05, // Alert if error rate > 5%
    responseTime: 5000, // Alert if response time > 5s
    memoryUsage: 0.8, // Alert if memory usage > 80%
    bundleSize: 1024 * 1024, // Alert if bundle > 1MB
  },
};

// Development workflow configuration
export const workflowConfig = {
  // Git hooks
  gitHooks: {
    preCommit: [
      'lint-staged',
      'type-check',
      'test:changed',
    ],
    prePush: [
      'test:all',
      'build',
    ],
    commitMsg: [
      'commitlint',
    ],
  },

  // CI/CD pipeline
  cicd: {
    stages: [
      'install',
      'lint',
      'type-check',
      'test',
      'build',
      'security-scan',
      'performance-audit',
      'deploy',
    ],

    // Quality gates
    qualityGates: {
      testCoverage: 80,
      lintErrors: 0,
      typeErrors: 0,
      securityVulnerabilities: 0,
      performanceScore: 90,
    },
  },

  // Code formatting
  formatting: {
    onSave: true,
    onCommit: true,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
  },
};

// Export all configurations
export const codeQualityConfig = {
  eslint: eslintConfig,
  prettier: prettierConfig,
  complexity: complexityThresholds,
  performance: performanceBudgets,
  security: securityConfig,
  accessibility: a11yStandards,
  testing: testingConfig,
  codeReview: codeReviewChecklist,
  monitoring: monitoringConfig,
  workflow: workflowConfig,
};

export default codeQualityConfig;