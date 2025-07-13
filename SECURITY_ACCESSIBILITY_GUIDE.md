# Security & Accessibility Enhancement Guide

## 🔒 Executive Summary

This guide provides comprehensive security hardening and accessibility enhancement strategies to ensure the YouTubeX application meets the highest standards for user safety, data protection, and inclusive design.

## 🛡️ Security Enhancements

### 1. Content Security Policy (CSP)

#### Advanced CSP Configuration
```typescript
// Enhanced CSP implementation
const generateCSP = (nonce: string, isDevelopment = false) => {
  const basePolicy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      isDevelopment ? "'unsafe-eval'" : null,
      'https://www.youtube.com',
      'https://www.google.com',
      'https://apis.google.com'
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://i.ytimg.com',
      'https://yt3.ggpht.com'
    ],
    'media-src': [
      "'self'",
      'blob:',
      'https:',
      'https://www.youtube.com',
      'https://youtubei.googleapis.com'
    ],
    'connect-src': [
      "'self'",
      'https://www.googleapis.com',
      'https://youtubei.googleapis.com',
      'wss://ws.youtube.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  };

  return Object.entries(basePolicy)
    .map(([directive, sources]) => 
      `${directive} ${Array.isArray(sources) ? sources.join(' ') : sources}`
    )
    .join('; ');
};

// CSP violation reporting
const setupCSPReporting = () => {
  document.addEventListener('securitypolicyviolation', (event) => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      timestamp: Date.now()
    };

    // Send to security monitoring service
    fetch('/api/security/csp-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(violation)
    }).catch(console.error);
  });
};
```

### 2. Input Sanitization & XSS Prevention

#### Advanced Input Sanitization
```typescript
// Comprehensive input sanitization
import DOMPurify from 'dompurify';

class SecurityManager {
  private readonly allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'ul', 'ol', 'li', 'blockquote', 'code'
  ];

  private readonly allowedAttributes = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['class']
  };

  sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: this.allowedTags,
      ALLOWED_ATTR: Object.values(this.allowedAttributes).flat(),
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    });
  }

  sanitizeText(input: string): string {
    return input
      .replace(/[<>"'&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .trim();
  }

  validateURL(url: string): boolean {
    try {
      const parsedURL = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      const allowedDomains = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'googleapis.com'
      ];

      return allowedProtocols.includes(parsedURL.protocol) &&
             allowedDomains.some(domain => 
               parsedURL.hostname === domain || 
               parsedURL.hostname.endsWith(`.${domain}`)
             );
    } catch {
      return false;
    }
  }

  sanitizeSearchQuery(query: string): string {
    return query
      .replace(/[^\w\s-_.]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }
}

// React hook for secure input handling
const useSecureInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState('');
  const securityManager = useRef(new SecurityManager());

  const handleChange = useCallback((input: string) => {
    setValue(input);
    const sanitized = securityManager.current.sanitizeText(input);
    setSanitizedValue(sanitized);
  }, []);

  const handleHTMLChange = useCallback((input: string) => {
    setValue(input);
    const sanitized = securityManager.current.sanitizeHTML(input);
    setSanitizedValue(sanitized);
  }, []);

  return {
    value,
    sanitizedValue,
    handleChange,
    handleHTMLChange,
    isValid: value === sanitizedValue
  };
};
```

### 3. Authentication & Authorization

#### Secure Authentication Flow
```typescript
// Enhanced authentication with security features
interface AuthConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireMFA: boolean;
}

class SecureAuthManager {
  private config: AuthConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    requireMFA: true
  };

  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, mfaCode } = credentials;
    
    // Check for account lockout
    if (this.isAccountLocked(email)) {
      throw new AuthError('Account temporarily locked due to multiple failed attempts');
    }

    try {
      // Validate credentials
      const user = await this.validateCredentials(email, password);
      
      // Verify MFA if required
      if (this.config.requireMFA && !await this.verifyMFA(user.id, mfaCode)) {
        throw new AuthError('Invalid MFA code');
      }

      // Generate secure session
      const session = await this.createSecureSession(user);
      
      // Clear login attempts
      this.loginAttempts.delete(email);
      
      // Log successful authentication
      this.logSecurityEvent('AUTH_SUCCESS', { userId: user.id, email });
      
      return { success: true, user, session };
    } catch (error) {
      // Track failed attempt
      this.trackFailedAttempt(email);
      
      // Log security event
      this.logSecurityEvent('AUTH_FAILURE', { email, error: error.message });
      
      throw error;
    }
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const isLocked = attempts.count >= this.config.maxLoginAttempts &&
                    (Date.now() - attempts.lastAttempt) < this.config.lockoutDuration;
    
    return isLocked;
  }

  private trackFailedAttempt(email: string): void {
    const current = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    this.loginAttempts.set(email, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  }

  private async createSecureSession(user: User): Promise<Session> {
    const sessionId = this.generateSecureToken();
    const csrfToken = this.generateSecureToken();
    
    const session: Session = {
      id: sessionId,
      userId: user.id,
      csrfToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.sessionTimeout,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Store session securely
    await this.storeSession(session);
    
    return session;
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateSession(sessionId: string, csrfToken: string): boolean {
    // Implement session validation logic
    // Check expiration, CSRF token, etc.
    return true; // Simplified for example
  }

  private logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      event,
      timestamp: Date.now(),
      data,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP()
    };

    // Send to security monitoring service
    fetch('/api/security/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(console.error);
  }

  private getClientIP(): string {
    // In a real implementation, this would be handled server-side
    return 'client-ip';
  }
}
```

### 4. Data Protection & Privacy

#### GDPR Compliance Manager
```typescript
// GDPR compliance and data protection
class PrivacyManager {
  private consentData: Map<string, ConsentRecord> = new Map();
  private dataRetentionPolicies: Map<string, RetentionPolicy> = new Map();

  constructor() {
    this.initializeRetentionPolicies();
  }

  private initializeRetentionPolicies(): void {
    this.dataRetentionPolicies.set('user_data', {
      category: 'user_data',
      retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
      autoDelete: true
    });

    this.dataRetentionPolicies.set('analytics', {
      category: 'analytics',
      retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
      autoDelete: true
    });

    this.dataRetentionPolicies.set('security_logs', {
      category: 'security_logs',
      retentionPeriod: 180 * 24 * 60 * 60 * 1000, // 180 days
      autoDelete: false
    });
  }

  async requestConsent(purposes: ConsentPurpose[]): Promise<ConsentResult> {
    return new Promise((resolve) => {
      const consentModal = this.createConsentModal(purposes, (result) => {
        this.recordConsent(result);
        resolve(result);
      });
      
      document.body.appendChild(consentModal);
    });
  }

  private createConsentModal(purposes: ConsentPurpose[], onResult: (result: ConsentResult) => void): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4">Privacy Preferences</h2>
        <p class="text-gray-600 mb-4">We respect your privacy. Please choose which data processing activities you consent to:</p>
        
        <div class="space-y-3 mb-6">
          ${purposes.map(purpose => `
            <label class="flex items-center space-x-3">
              <input type="checkbox" data-purpose="${purpose.id}" class="rounded">
              <div>
                <div class="font-medium">${purpose.name}</div>
                <div class="text-sm text-gray-500">${purpose.description}</div>
              </div>
            </label>
          `).join('')}
        </div>
        
        <div class="flex space-x-3">
          <button id="accept-all" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Accept All
          </button>
          <button id="accept-selected" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
            Accept Selected
          </button>
          <button id="reject-all" class="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            Reject All
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('#accept-all')?.addEventListener('click', () => {
      const consents = purposes.reduce((acc, purpose) => {
        acc[purpose.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      onResult({ consents, timestamp: Date.now() });
      modal.remove();
    });

    modal.querySelector('#accept-selected')?.addEventListener('click', () => {
      const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
      const consents = Array.from(checkboxes).reduce((acc, checkbox) => {
        const input = checkbox as HTMLInputElement;
        acc[input.dataset.purpose!] = input.checked;
        return acc;
      }, {} as Record<string, boolean>);
      
      onResult({ consents, timestamp: Date.now() });
      modal.remove();
    });

    modal.querySelector('#reject-all')?.addEventListener('click', () => {
      const consents = purposes.reduce((acc, purpose) => {
        acc[purpose.id] = false;
        return acc;
      }, {} as Record<string, boolean>);
      
      onResult({ consents, timestamp: Date.now() });
      modal.remove();
    });

    return modal;
  }

  private recordConsent(result: ConsentResult): void {
    const record: ConsentRecord = {
      id: this.generateId(),
      consents: result.consents,
      timestamp: result.timestamp,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Store consent record
    localStorage.setItem('privacy_consent', JSON.stringify(record));
    
    // Send to server for compliance logging
    this.logConsentRecord(record);
  }

  hasConsent(purpose: string): boolean {
    const stored = localStorage.getItem('privacy_consent');
    if (!stored) return false;

    try {
      const record: ConsentRecord = JSON.parse(stored);
      return record.consents[purpose] === true;
    } catch {
      return false;
    }
  }

  async exportUserData(userId: string): Promise<UserDataExport> {
    // Implement GDPR Article 20 - Right to data portability
    const userData = await this.collectUserData(userId);
    
    return {
      userId,
      exportDate: new Date().toISOString(),
      data: userData,
      format: 'JSON'
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    // Implement GDPR Article 17 - Right to erasure
    await this.anonymizeUserData(userId);
    await this.removePersonalIdentifiers(userId);
    
    this.logDataDeletion(userId);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getClientIP(): string {
    // This would be implemented server-side in a real application
    return 'client-ip';
  }

  private async logConsentRecord(record: ConsentRecord): Promise<void> {
    try {
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (error) {
      console.error('Failed to log consent record:', error);
    }
  }

  private async collectUserData(userId: string): Promise<any> {
    // Collect all user data from various sources
    return {}; // Simplified for example
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    // Anonymize user data while preserving analytics value
  }

  private async removePersonalIdentifiers(userId: string): Promise<void> {
    // Remove all personal identifiers
  }

  private logDataDeletion(userId: string): void {
    // Log data deletion for compliance
  }
}
```

## ♿ Accessibility Enhancements

### 1. Advanced ARIA Implementation

#### Comprehensive ARIA Patterns
```typescript
// Advanced ARIA implementation for complex components
interface ARIAProps {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
}

// Enhanced video player with full accessibility
const AccessibleVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  description,
  captions,
  onPlay,
  onPause
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!videoRef.current) return;

    switch (event.key) {
      case ' ':
      case 'k':
        event.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        seek(-10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        seek(10);
        break;
      case 'ArrowUp':
        event.preventDefault();
        adjustVolume(0.1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        adjustVolume(-0.1);
        break;
      case 'm':
        event.preventDefault();
        toggleMute();
        break;
      case 'c':
        event.preventDefault();
        toggleCaptions();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      announceToScreenReader('Video paused');
      onPause?.();
    } else {
      videoRef.current.play();
      announceToScreenReader('Video playing');
      onPlay?.();
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, onPlay, onPause]);

  const seek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    announceToScreenReader(`Seeked to ${formatTime(newTime)}`);
  }, [currentTime, duration]);

  const adjustVolume = useCallback((delta: number) => {
    if (!videoRef.current) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    announceToScreenReader(`Volume ${Math.round(newVolume * 100)}%`);
  }, [volume]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    
    announceToScreenReader(newMuted ? 'Muted' : 'Unmuted');
  }, [isMuted]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(!showCaptions);
    announceToScreenReader(`Captions ${!showCaptions ? 'enabled' : 'disabled'}`);
  }, [showCaptions]);

  const announceToScreenReader = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label={`Video player: ${title}`}
      aria-describedby="video-description"
    >
      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Video description for screen readers */}
      <div id="video-description" className="sr-only">
        {description}
      </div>

      {/* Main video element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={title}
        aria-describedby="video-description"
      >
        {captions && (
          <track
            kind="captions"
            src={captions}
            srcLang="en"
            label="English captions"
            default={showCaptions}
          />
        )}
      </video>

      {/* Accessible controls */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        role="toolbar"
        aria-label="Video controls"
      >
        {/* Progress bar */}
        <div className="mb-4">
          <label htmlFor="video-progress" className="sr-only">
            Video progress: {formatTime(currentTime)} of {formatTime(duration)}
          </label>
          <input
            id="video-progress"
            ref={progressRef}
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              if (videoRef.current) {
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              aria-pressed={isMuted}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            
            <label htmlFor="volume-control" className="sr-only">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              id="volume-control"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.volume = newVolume;
                  setVolume(newVolume);
                }
              }}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              aria-valuetext={`Volume ${Math.round(volume * 100)}%`}
            />
          </div>

          <button
            onClick={toggleCaptions}
            className="text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
            aria-pressed={showCaptions}
          >
            CC
          </button>

          <div className="flex-1" />

          <span className="text-white text-sm" aria-live="polite">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### 2. Keyboard Navigation System

#### Advanced Focus Management
```typescript
// Comprehensive keyboard navigation system
class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = -1;
  private trapStack: HTMLElement[] = [];

  constructor() {
    this.initializeGlobalKeyboardHandlers();
  }

  private initializeGlobalKeyboardHandlers(): void {
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
  }

  private handleGlobalKeyDown(event: KeyboardEvent): void {
    // Skip navigation
    if (event.key === 'Tab' && event.ctrlKey) {
      event.preventDefault();
      this.showSkipLinks();
      return;
    }

    // Focus trap handling
    if (this.trapStack.length > 0) {
      this.handleTrappedFocus(event);
    }

    // Application shortcuts
    this.handleApplicationShortcuts(event);
  }

  private handleApplicationShortcuts(event: KeyboardEvent): void {
    if (event.altKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.focusMainContent();
          break;
        case '2':
          event.preventDefault();
          this.focusNavigation();
          break;
        case '3':
          event.preventDefault();
          this.focusSearch();
          break;
        case 's':
          event.preventDefault();
          this.focusSearch();
          break;
        case 'm':
          event.preventDefault();
          this.toggleMainMenu();
          break;
      }
    }
  }

  trapFocus(container: HTMLElement): void {
    this.trapStack.push(container);
    this.updateFocusableElements(container);
    
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
      this.currentFocusIndex = 0;
    }
  }

  releaseFocusTrap(): void {
    this.trapStack.pop();
    
    if (this.trapStack.length > 0) {
      // Return to previous trap
      const currentTrap = this.trapStack[this.trapStack.length - 1];
      this.updateFocusableElements(currentTrap);
    } else {
      // No more traps, return to normal navigation
      this.focusableElements = [];
      this.currentFocusIndex = -1;
    }
  }

  private handleTrappedFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    event.preventDefault();
    
    if (this.focusableElements.length === 0) return;

    if (event.shiftKey) {
      // Move backward
      this.currentFocusIndex = this.currentFocusIndex <= 0 
        ? this.focusableElements.length - 1 
        : this.currentFocusIndex - 1;
    } else {
      // Move forward
      this.currentFocusIndex = this.currentFocusIndex >= this.focusableElements.length - 1 
        ? 0 
        : this.currentFocusIndex + 1;
    }

    this.focusableElements[this.currentFocusIndex].focus();
  }

  private updateFocusableElements(container: HTMLElement): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      container.querySelectorAll(selector)
    ).filter(el => {
      const element = el as HTMLElement;
      return this.isVisible(element) && !this.isDisabled(element);
    }) as HTMLElement[];
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  private isDisabled(element: HTMLElement): boolean {
    return element.hasAttribute('disabled') || 
           element.getAttribute('aria-disabled') === 'true';
  }

  private showSkipLinks(): void {
    const skipLinks = document.querySelector('#skip-links') as HTMLElement;
    if (skipLinks) {
      skipLinks.style.display = 'block';
      const firstLink = skipLinks.querySelector('a') as HTMLElement;
      firstLink?.focus();
    }
  }

  private focusMainContent(): void {
    const main = document.querySelector('main, [role="main"], #main-content') as HTMLElement;
    if (main) {
      main.focus();
      this.announceToScreenReader('Focused main content');
    }
  }

  private focusNavigation(): void {
    const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement;
    if (nav) {
      const firstLink = nav.querySelector('a, button') as HTMLElement;
      firstLink?.focus();
      this.announceToScreenReader('Focused navigation');
    }
  }

  private focusSearch(): void {
    const search = document.querySelector('input[type="search"], [role="search"] input') as HTMLElement;
    if (search) {
      search.focus();
      this.announceToScreenReader('Focused search');
    }
  }

  private toggleMainMenu(): void {
    const menuButton = document.querySelector('[aria-label*="menu"], [aria-controls*="menu"]') as HTMLButtonElement;
    if (menuButton) {
      menuButton.click();
    }
  }

  private announceToScreenReader(message: string): void {
    const announcer = document.querySelector('#screen-reader-announcer') as HTMLElement;
    if (announcer) {
      announcer.textContent = message;
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    // Update current focus index if within a trap
    if (this.trapStack.length > 0) {
      const index = this.focusableElements.indexOf(target);
      if (index !== -1) {
        this.currentFocusIndex = index;
      }
    }
  }
}

// React hook for keyboard navigation
const useKeyboardNavigation = () => {
  const navigationManager = useRef(new KeyboardNavigationManager());

  const trapFocus = useCallback((container: HTMLElement) => {
    navigationManager.current.trapFocus(container);
  }, []);

  const releaseFocusTrap = useCallback(() => {
    navigationManager.current.releaseFocusTrap();
  }, []);

  return { trapFocus, releaseFocusTrap };
};
```

### 3. Screen Reader Optimization

#### Advanced Screen Reader Support
```typescript
// Enhanced screen reader support
class ScreenReaderManager {
  private announcer: HTMLElement;
  private politeAnnouncer: HTMLElement;
  private assertiveAnnouncer: HTMLElement;

  constructor() {
    this.createAnnouncers();
  }

  private createAnnouncers(): void {
    // Create polite announcer
    this.politeAnnouncer = document.createElement('div');
    this.politeAnnouncer.id = 'polite-announcer';
    this.politeAnnouncer.setAttribute('aria-live', 'polite');
    this.politeAnnouncer.setAttribute('aria-atomic', 'true');
    this.politeAnnouncer.className = 'sr-only';
    document.body.appendChild(this.politeAnnouncer);

    // Create assertive announcer
    this.assertiveAnnouncer = document.createElement('div');
    this.assertiveAnnouncer.id = 'assertive-announcer';
    this.assertiveAnnouncer.setAttribute('aria-live', 'assertive');
    this.assertiveAnnouncer.setAttribute('aria-atomic', 'true');
    this.assertiveAnnouncer.className = 'sr-only';
    document.body.appendChild(this.assertiveAnnouncer);

    // Default announcer (polite)
    this.announcer = this.politeAnnouncer;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const targetAnnouncer = priority === 'assertive' 
      ? this.assertiveAnnouncer 
      : this.politeAnnouncer;

    // Clear previous message
    targetAnnouncer.textContent = '';
    
    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      targetAnnouncer.textContent = message;
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      targetAnnouncer.textContent = '';
    }, 5000);
  }

  announcePageChange(title: string, description?: string): void {
    const message = description 
      ? `Page changed to ${title}. ${description}`
      : `Page changed to ${title}`;
    
    this.announce(message, 'assertive');
  }

  announceError(error: string): void {
    this.announce(`Error: ${error}`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  announceLoading(isLoading: boolean, context?: string): void {
    const message = isLoading 
      ? `Loading${context ? ` ${context}` : ''}...`
      : `Finished loading${context ? ` ${context}` : ''}`;
    
    this.announce(message, 'polite');
  }

  announceProgress(current: number, total: number, context?: string): void {
    const percentage = Math.round((current / total) * 100);
    const message = `Progress${context ? ` for ${context}` : ''}: ${percentage}% complete, ${current} of ${total}`;
    
    this.announce(message, 'polite');
  }

  describePage(): void {
    const main = document.querySelector('main');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
    
    let description = 'Page contains ';
    
    if (headings.length > 0) {
      description += `${headings.length} heading${headings.length > 1 ? 's' : ''}, `;
    }
    
    if (landmarks.length > 0) {
      description += `${landmarks.length} landmark${landmarks.length > 1 ? 's' : ''}, `;
    }
    
    const links = document.querySelectorAll('a[href]');
    if (links.length > 0) {
      description += `${links.length} link${links.length > 1 ? 's' : ''}, `;
    }
    
    const buttons = document.querySelectorAll('button');
    if (buttons.length > 0) {
      description += `${buttons.length} button${buttons.length > 1 ? 's' : ''}`;
    }
    
    this.announce(description.replace(/, $/, ''), 'polite');
  }
}

// React hook for screen reader support
const useScreenReader = () => {
  const screenReader = useRef(new ScreenReaderManager());

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.current.announce(message, priority);
  }, []);

  const announcePageChange = useCallback((title: string, description?: string) => {
    screenReader.current.announcePageChange(title, description);
  }, []);

  const announceError = useCallback((error: string) => {
    screenReader.current.announceError(error);
  }, []);

  const announceSuccess = useCallback((message: string) => {
    screenReader.current.announceSuccess(message);
  }, []);

  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    screenReader.current.announceLoading(isLoading, context);
  }, []);

  return {
    announce,
    announcePageChange,
    announceError,
    announceSuccess,
    announceLoading
  };
};
```

## 🎯 Implementation Roadmap

### Phase 1: Security Foundation (Week 1-2)
- [ ] Implement CSP and security headers
- [ ] Deploy input sanitization
- [ ] Set up authentication security
- [ ] Configure GDPR compliance

### Phase 2: Accessibility Core (Week 3-4)
- [ ] Implement ARIA patterns
- [ ] Deploy keyboard navigation
- [ ] Set up screen reader support
- [ ] Add focus management

### Phase 3: Advanced Features (Week 5-6)
- [ ] Deploy advanced security monitoring
- [ ] Implement accessibility testing
- [ ] Set up compliance reporting
- [ ] Create security dashboard

## 📊 Success Metrics

### Security Metrics
- **Zero** XSS vulnerabilities
- **100%** CSP compliance
- **< 1 second** authentication response time
- **99.9%** uptime for security services

### Accessibility Metrics
- **WCAG 2.1 AA** compliance
- **100%** keyboard navigability
- **< 2 seconds** screen reader announcement delay
- **95%+** accessibility audit score

This comprehensive guide ensures the YouTubeX application meets the highest standards for security and accessibility.