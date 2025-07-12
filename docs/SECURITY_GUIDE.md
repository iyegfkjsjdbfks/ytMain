# Security Guide

## Overview

This comprehensive security guide outlines best practices, implementation strategies, and security measures for the YouTubeX application to protect against common vulnerabilities and ensure user data safety.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation & Sanitization](#input-validation--sanitization)
3. [Content Security Policy (CSP)](#content-security-policy-csp)
4. [Cross-Site Scripting (XSS) Prevention](#cross-site-scripting-xss-prevention)
5. [Cross-Site Request Forgery (CSRF) Protection](#cross-site-request-forgery-csrf-protection)
6. [API Security](#api-security)
7. [Data Protection](#data-protection)
8. [Secure Storage](#secure-storage)
9. [Network Security](#network-security)
10. [Error Handling](#error-handling)
11. [Security Headers](#security-headers)
12. [Dependency Security](#dependency-security)
13. [Monitoring & Logging](#monitoring--logging)
14. [Security Testing](#security-testing)

## Authentication & Authorization

### 1. **Secure Authentication Implementation**

```typescript
// Secure authentication service
class SecureAuthService {
  private readonly tokenStorage: SecureTokenStorage;
  private readonly cryptoService: CryptoService;
  
  constructor() {
    this.tokenStorage = new SecureTokenStorage();
    this.cryptoService = new CryptoService();
  }
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Input validation
    this.validateCredentials(credentials);
    
    // Rate limiting check
    await this.checkRateLimit(credentials.email);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          email: this.sanitizeEmail(credentials.email),
          password: credentials.password, // Never log passwords
          captcha: credentials.captcha,
        }),
      });
      
      if (!response.ok) {
        throw new AuthError('Authentication failed');
      }
      
      const data = await response.json();
      
      // Secure token storage
      await this.tokenStorage.store(data.accessToken, data.refreshToken);
      
      return {
        success: true,
        user: data.user,
        expiresAt: data.expiresAt,
      };
    } catch (error) {
      // Log security events without sensitive data
      this.logSecurityEvent('login_failed', {
        email: this.hashEmail(credentials.email),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      });
      
      throw error;
    }
  }
  
  private validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      throw new ValidationError('Invalid email format');
    }
    
    if (!credentials.password || credentials.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }
  
  private async checkRateLimit(email: string): Promise<void> {
    const attempts = await this.getLoginAttempts(email);
    if (attempts > 5) {
      throw new RateLimitError('Too many login attempts');
    }
  }
  
  private sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
  
  private hashEmail(email: string): string {
    return this.cryptoService.hash(email);
  }
}

// Secure token storage
class SecureTokenStorage {
  private readonly encryptionKey: string;
  
  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
  }
  
  async store(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Encrypt tokens before storage
      const encryptedAccess = await this.encrypt(accessToken);
      const encryptedRefresh = await this.encrypt(refreshToken);
      
      // Store in secure storage (not localStorage for sensitive data)
      sessionStorage.setItem('at', encryptedAccess);
      
      // Use httpOnly cookie for refresh token
      document.cookie = `rt=${encryptedRefresh}; Secure; HttpOnly; SameSite=Strict; Max-Age=604800`;
    } catch (error) {
      console.error('Token storage failed:', error);
      throw new StorageError('Failed to store authentication tokens');
    }
  }
  
  async retrieve(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const encryptedAccess = sessionStorage.getItem('at');
      if (!encryptedAccess) return null;
      
      const accessToken = await this.decrypt(encryptedAccess);
      
      // Refresh token retrieval would be handled server-side
      return { accessToken, refreshToken: '' };
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  }
  
  private async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(this.encryptionKey);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  private async decrypt(encryptedData: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(this.encryptionKey);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }
  
  private generateEncryptionKey(): string {
    // In production, this should be derived from a secure source
    return crypto.getRandomValues(new Uint8Array(32)).toString();
  }
}
```

### 2. **Role-Based Access Control (RBAC)**

```typescript
// Permission system
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  name: string;
  permissions: Permission[];
}

class PermissionManager {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializeRoles();
  }
  
  private initializeRoles(): void {
    // Define roles and permissions
    this.roles.set('viewer', {
      name: 'viewer',
      permissions: [
        { resource: 'video', action: 'read' },
        { resource: 'comment', action: 'read' },
        { resource: 'playlist', action: 'read' },
      ],
    });
    
    this.roles.set('creator', {
      name: 'creator',
      permissions: [
        { resource: 'video', action: 'read' },
        { resource: 'video', action: 'create' },
        { resource: 'video', action: 'update', conditions: { owner: true } },
        { resource: 'video', action: 'delete', conditions: { owner: true } },
        { resource: 'comment', action: 'read' },
        { resource: 'comment', action: 'create' },
        { resource: 'playlist', action: 'read' },
        { resource: 'playlist', action: 'create' },
        { resource: 'playlist', action: 'update', conditions: { owner: true } },
      ],
    });
    
    this.roles.set('moderator', {
      name: 'moderator',
      permissions: [
        { resource: 'video', action: 'read' },
        { resource: 'video', action: 'moderate' },
        { resource: 'comment', action: 'read' },
        { resource: 'comment', action: 'moderate' },
        { resource: 'comment', action: 'delete' },
        { resource: 'user', action: 'moderate' },
      ],
    });
  }
  
  hasPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    const userRoles = this.userRoles.get(userId) || [];
    
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (!role) continue;
      
      for (const permission of role.permissions) {
        if (
          permission.resource === resource &&
          permission.action === action &&
          this.checkConditions(permission.conditions, context)
        ) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private checkConditions(
    conditions?: Record<string, any>,
    context?: Record<string, any>
  ): boolean {
    if (!conditions) return true;
    if (!context) return false;
    
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
}

// Protected route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  resource,
  action,
  fallback,
}) => {
  const { user } = useAuth();
  const permissionManager = usePermissionManager();
  
  const hasAccess = useMemo(() => {
    if (!user) return false;
    
    if (requiredPermission) {
      return user.permissions?.includes(requiredPermission);
    }
    
    if (resource && action) {
      return permissionManager.hasPermission(user.id, resource, action);
    }
    
    return true;
  }, [user, requiredPermission, resource, action, permissionManager]);
  
  if (!hasAccess) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

## Input Validation & Sanitization

### 1. **Input Validation Utilities**

```typescript
// Input validation service
class InputValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly URL_REGEX = /^https?:\/\/.+/;
  private static readonly YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  
  static validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email) && email.length <= 254;
  }
  
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.URL_REGEX.test(url) && 
             (urlObj.protocol === 'https:' || urlObj.protocol === 'http:');
    } catch {
      return false;
    }
  }
  
  static validateYouTubeURL(url: string): boolean {
    return this.YOUTUBE_URL_REGEX.test(url);
  }
  
  static sanitizeString(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>"'&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return entities[char] || char;
      });
  }
  
  static validateVideoTitle(title: string): ValidationResult {
    const sanitized = this.sanitizeString(title, 100);
    const errors: string[] = [];
    
    if (sanitized.length === 0) {
      errors.push('Title is required');
    }
    
    if (sanitized.length > 100) {
      errors.push('Title must be 100 characters or less');
    }
    
    // Check for potentially malicious content
    if (this.containsSuspiciousContent(sanitized)) {
      errors.push('Title contains invalid content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    };
  }
  
  static validateComment(comment: string): ValidationResult {
    const sanitized = this.sanitizeString(comment, 2000);
    const errors: string[] = [];
    
    if (sanitized.length === 0) {
      errors.push('Comment cannot be empty');
    }
    
    if (sanitized.length > 2000) {
      errors.push('Comment must be 2000 characters or less');
    }
    
    // Check for spam patterns
    if (this.isSpam(sanitized)) {
      errors.push('Comment appears to be spam');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    };
  }
  
  private static containsSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:text\/html/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
  
  private static isSpam(content: string): boolean {
    // Simple spam detection patterns
    const spamPatterns = [
      /(.{1,10})\1{5,}/i, // Repeated characters/patterns
      /https?:\/\/.{0,20}\.(tk|ml|ga|cf)/i, // Suspicious domains
      /(buy now|click here|free money|earn \$)/i, // Spam phrases
    ];
    
    return spamPatterns.some(pattern => pattern.test(content));
  }
}

// Form validation hook
const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const validateField = useCallback(
    (field: keyof T, value: any): string[] => {
      const rule = validationRules[field];
      if (!rule) return [];
      
      const result = rule(value);
      return result.isValid ? [] : result.errors;
    },
    [validationRules]
  );
  
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      
      if (touched[field]) {
        const fieldErrors = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: fieldErrors }));
      }
    },
    [touched, validateField]
  );
  
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const fieldErrors = validateField(field, values[field]);
      setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    },
    [values, validateField]
  );
  
  const validateAll = useCallback((): boolean => {
    const allErrors: Partial<Record<keyof T, string[]>> = {};
    let isValid = true;
    
    for (const field in validationRules) {
      const fieldErrors = validateField(field, values[field]);
      if (fieldErrors.length > 0) {
        allErrors[field] = fieldErrors;
        isValid = false;
      }
    }
    
    setErrors(allErrors);
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      )
    );
    
    return isValid;
  }, [values, validationRules, validateField]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: Object.values(errors).every(fieldErrors => 
      !fieldErrors || fieldErrors.length === 0
    ),
  };
};
```

## Content Security Policy (CSP)

### 1. **CSP Configuration**

```typescript
// CSP configuration
const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Only for development, remove in production
    'https://www.youtube.com',
    'https://www.google.com',
    'https://apis.google.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'https://i.ytimg.com',
    'https://yt3.ggpht.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://www.googleapis.com',
    'https://youtube.googleapis.com',
    process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '',
  ].filter(Boolean),
  'frame-src': [
    'https://www.youtube.com',
    'https://youtube.com',
  ],
  'media-src': [
    "'self'",
    'https:',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// CSP header generation
const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// CSP violation reporting
const setupCSPReporting = (): void => {
  document.addEventListener('securitypolicyviolation', (event) => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    // Report violation to security monitoring service
    fetch('/api/security/csp-violation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(violation),
    }).catch(error => {
      console.error('Failed to report CSP violation:', error);
    });
  });
};
```

## Cross-Site Scripting (XSS) Prevention

### 1. **XSS Protection Utilities**

```typescript
// XSS protection service
class XSSProtection {
  private static readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'form', 'input',
    'button', 'select', 'textarea', 'link', 'meta', 'style'
  ];
  
  private static readonly DANGEROUS_ATTRIBUTES = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus',
    'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
    'onkeydown', 'onkeyup', 'onkeypress', 'href', 'src'
  ];
  
  static sanitizeHTML(html: string): string {
    // Create a temporary DOM element
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous tags
    this.DANGEROUS_TAGS.forEach(tag => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
    
    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      this.DANGEROUS_ATTRIBUTES.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
      
      // Remove javascript: and data: URLs
      ['href', 'src'].forEach(attr => {
        const value = el.getAttribute(attr);
        if (value && (value.startsWith('javascript:') || value.startsWith('data:'))) {
          el.removeAttribute(attr);
        }
      });
    });
    
    return temp.innerHTML;
  }
  
  static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  static validateAndSanitizeURL(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      // Block suspicious domains
      const suspiciousDomains = [
        'javascript',
        'data',
        'vbscript',
        'file',
        'ftp'
      ];
      
      if (suspiciousDomains.some(domain => 
        urlObj.hostname.includes(domain)
      )) {
        return null;
      }
      
      return urlObj.toString();
    } catch {
      return null;
    }
  }
}

// Safe HTML component
const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  html, 
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a'],
  className 
}) => {
  const sanitizedHTML = useMemo(() => {
    if (!html) return '';
    
    // First pass: basic XSS protection
    let cleaned = XSSProtection.sanitizeHTML(html);
    
    // Second pass: only allow specified tags
    const temp = document.createElement('div');
    temp.innerHTML = cleaned;
    
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        // Replace with text content
        const textNode = document.createTextNode(el.textContent || '');
        el.parentNode?.replaceChild(textNode, el);
      }
    });
    
    return temp.innerHTML;
  }, [html, allowedTags]);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

// Safe link component
const SafeLink: React.FC<SafeLinkProps> = ({ 
  href, 
  children, 
  external = false,
  ...props 
}) => {
  const safeHref = useMemo(() => {
    return XSSProtection.validateAndSanitizeURL(href);
  }, [href]);
  
  if (!safeHref) {
    return <span className="text-gray-500">{children}</span>;
  }
  
  const linkProps = {
    ...props,
    href: safeHref,
    ...(external && {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  };
  
  return <a {...linkProps}>{children}</a>;
};
```

## Cross-Site Request Forgery (CSRF) Protection

### 1. **CSRF Token Management**

```typescript
// CSRF protection service
class CSRFProtection {
  private static token: string | null = null;
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';
  
  static async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }
    
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      this.token = data.token;
      
      return this.token;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      throw error;
    }
  }
  
  static async makeSecureRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getToken();
    
    const secureOptions: RequestInit = {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...options.headers,
        [this.TOKEN_HEADER]: token,
        'X-Requested-With': 'XMLHttpRequest',
      },
    };
    
    const response = await fetch(url, secureOptions);
    
    // If token is invalid, refresh and retry once
    if (response.status === 403) {
      this.token = null;
      const newToken = await this.getToken();
      
      secureOptions.headers = {
        ...secureOptions.headers,
        [this.TOKEN_HEADER]: newToken,
      };
      
      return fetch(url, secureOptions);
    }
    
    return response;
  }
  
  static clearToken(): void {
    this.token = null;
  }
}

// Secure API client
class SecureAPIClient {
  private baseURL: string;
  
  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await CSRFProtection.makeSecureRequest(
      `${this.baseURL}${endpoint}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new APIError(`GET ${endpoint} failed`, response.status);
    }
    
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await CSRFProtection.makeSecureRequest(
      `${this.baseURL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new APIError(`POST ${endpoint} failed`, response.status);
    }
    
    return response.json();
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await CSRFProtection.makeSecureRequest(
      `${this.baseURL}${endpoint}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new APIError(`PUT ${endpoint} failed`, response.status);
    }
    
    return response.json();
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    const response = await CSRFProtection.makeSecureRequest(
      `${this.baseURL}${endpoint}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      throw new APIError(`DELETE ${endpoint} failed`, response.status);
    }
    
    return response.json();
  }
}
```

## API Security

### 1. **Rate Limiting**

```typescript
// Client-side rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, RateLimit> = new Map();
  
  constructor() {
    this.setupDefaultLimits();
  }
  
  private setupDefaultLimits(): void {
    this.limits.set('api', { requests: 100, window: 60000 }); // 100 requests per minute
    this.limits.set('auth', { requests: 5, window: 300000 }); // 5 requests per 5 minutes
    this.limits.set('upload', { requests: 10, window: 3600000 }); // 10 requests per hour
  }
  
  canMakeRequest(category: string): boolean {
    const limit = this.limits.get(category);
    if (!limit) return true;
    
    const now = Date.now();
    const requests = this.requests.get(category) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(
      timestamp => now - timestamp < limit.window
    );
    
    this.requests.set(category, validRequests);
    
    return validRequests.length < limit.requests;
  }
  
  recordRequest(category: string): void {
    const requests = this.requests.get(category) || [];
    requests.push(Date.now());
    this.requests.set(category, requests);
  }
  
  getRemainingRequests(category: string): number {
    const limit = this.limits.get(category);
    if (!limit) return Infinity;
    
    const now = Date.now();
    const requests = this.requests.get(category) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < limit.window
    );
    
    return Math.max(0, limit.requests - validRequests.length);
  }
  
  getResetTime(category: string): number {
    const limit = this.limits.get(category);
    if (!limit) return 0;
    
    const requests = this.requests.get(category) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + limit.window;
  }
}

// API request interceptor with security features
class SecureAPIInterceptor {
  private rateLimiter: RateLimiter;
  private requestQueue: Map<string, Promise<any>> = new Map();
  
  constructor() {
    this.rateLimiter = new RateLimiter();
  }
  
  async intercept(
    url: string,
    options: RequestInit,
    category: string = 'api'
  ): Promise<Response> {
    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest(category)) {
      const resetTime = this.rateLimiter.getResetTime(category);
      const waitTime = resetTime - Date.now();
      
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }
    
    // Request deduplication
    const requestKey = this.generateRequestKey(url, options);
    const existingRequest = this.requestQueue.get(requestKey);
    
    if (existingRequest) {
      return existingRequest;
    }
    
    // Add security headers
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    };
    
    // Make request
    const requestPromise = this.makeRequest(url, secureOptions, category);
    this.requestQueue.set(requestKey, requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }
  
  private async makeRequest(
    url: string,
    options: RequestInit,
    category: string
  ): Promise<Response> {
    this.rateLimiter.recordRequest(category);
    
    const response = await fetch(url, options);
    
    // Security response validation
    this.validateResponse(response);
    
    return response;
  }
  
  private validateResponse(response: Response): void {
    // Check for security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
    ];
    
    securityHeaders.forEach(header => {
      if (!response.headers.has(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    });
    
    // Validate content type
    const contentType = response.headers.get('content-type');
    if (contentType && !this.isAllowedContentType(contentType)) {
      throw new SecurityError(`Unsafe content type: ${contentType}`);
    }
  }
  
  private isAllowedContentType(contentType: string): boolean {
    const allowedTypes = [
      'application/json',
      'text/plain',
      'text/html',
      'image/',
      'video/',
      'audio/',
    ];
    
    return allowedTypes.some(type => contentType.startsWith(type));
  }
  
  private generateRequestKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }
}
```

## Data Protection

### 1. **Sensitive Data Handling**

```typescript
// Sensitive data protection
class DataProtection {
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'key',
    'ssn',
    'creditCard',
    'email', // Partially sensitive
  ];
  
  static sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogging(item));
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = this.maskSensitiveValue(key, value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  private static isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.SENSITIVE_FIELDS.some(sensitive => 
      lowerField.includes(sensitive)
    );
  }
  
  private static maskSensitiveValue(fieldName: string, value: any): string {
    if (typeof value !== 'string') {
      return '[REDACTED]';
    }
    
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('email')) {
      // Partially mask email
      const [local, domain] = value.split('@');
      if (local && domain) {
        const maskedLocal = local.length > 2 
          ? local.substring(0, 2) + '*'.repeat(local.length - 2)
          : '*'.repeat(local.length);
        return `${maskedLocal}@${domain}`;
      }
    }
    
    if (lowerField.includes('token') || lowerField.includes('key')) {
      // Show only first and last 4 characters
      if (value.length > 8) {
        return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
      }
    }
    
    return '[REDACTED]';
  }
  
  static encryptSensitiveData(data: string, key: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const keyBuffer = encoder.encode(key);
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          dataBuffer
        );
        
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        resolve(btoa(String.fromCharCode(...combined)));
      } catch (error) {
        reject(error);
      }
    });
  }
  
  static decryptSensitiveData(encryptedData: string, key: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const combined = new Uint8Array(
          atob(encryptedData).split('').map(char => char.charCodeAt(0))
        );
        
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key);
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          encrypted
        );
        
        resolve(new TextDecoder().decode(decrypted));
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Secure storage service
class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'user-session-key';
  
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await DataProtection.encryptSensitiveData(
        serialized,
        this.ENCRYPTION_KEY
      );
      
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Secure storage set failed:', error);
      throw new StorageError('Failed to store data securely');
    }
  }
  
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = await DataProtection.decryptSensitiveData(
        encrypted,
        this.ENCRYPTION_KEY
      );
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Secure storage get failed:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  static clear(): void {
    sessionStorage.clear();
  }
}
```

## Security Headers

### 1. **Security Headers Configuration**

```typescript
// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', '),
  
  // Strict transport security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content security policy
  'Content-Security-Policy': generateCSPHeader(),
};

// Apply security headers to responses
const applySecurityHeaders = (response: Response): Response => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });
  
  return response;
};

// Security headers validation
const validateSecurityHeaders = (response: Response): SecurityValidationResult => {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check required headers
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'content-security-policy',
  ];
  
  requiredHeaders.forEach(header => {
    if (!response.headers.has(header)) {
      missing.push(header);
    }
  });
  
  // Check HTTPS-only headers
  if (window.location.protocol === 'https:') {
    if (!response.headers.has('strict-transport-security')) {
      warnings.push('Missing HSTS header on HTTPS connection');
    }
  }
  
  return {
    isSecure: missing.length === 0,
    missing,
    warnings,
  };
};
```

## Monitoring & Logging

### 1. **Security Event Logging**

```typescript
// Security event logger
class SecurityLogger {
  private static instance: SecurityLogger;
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  logSecurityEvent(
    type: SecurityEventType,
    details: Record<string, any>,
    severity: SecuritySeverity = 'medium'
  ): void {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: Date.now(),
      details: DataProtection.sanitizeForLogging(details),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
    };
    
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }
    
    // Send to monitoring service
    this.sendToMonitoring(event);
    
    // Trigger alerts for high severity events
    if (severity === 'high' || severity === 'critical') {
      this.triggerAlert(event);
    }
  }
  
  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }
  
  private triggerAlert(event: SecurityEvent): void {
    // Implement alerting logic (email, Slack, etc.)
    console.error('SECURITY ALERT:', event);
    
    // Could integrate with services like Sentry, DataDog, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(
        new Error(`Security event: ${event.type}`),
        {
          tags: {
            security: true,
            severity: event.severity,
          },
          extra: event.details,
        }
      );
    }
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('security-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('security-session-id', sessionId);
    }
    return sessionId;
  }
  
  getRecentEvents(count: number = 50): SecurityEvent[] {
    return this.events.slice(-count);
  }
  
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }
  
  getEventsBySeverity(severity: SecuritySeverity): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }
}

// Security event types
type SecurityEventType = 
  | 'authentication_failed'
  | 'authorization_denied'
  | 'suspicious_activity'
  | 'xss_attempt'
  | 'csrf_violation'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'security_header_missing'
  | 'unsafe_content_detected'
  | 'session_hijack_attempt';

type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: number;
  details: Record<string, any>;
  userAgent: string;
  url: string;
  sessionId: string;
}
```

## Security Testing

### 1. **Security Test Utilities**

```typescript
// Security testing utilities
class SecurityTester {
  static testXSSVulnerability(input: string): XSSTestResult {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '\"onmouseover=alert("XSS")\"',
    ];
    
    const vulnerabilities: string[] = [];
    
    xssPayloads.forEach(payload => {
      if (input.includes(payload)) {
        vulnerabilities.push(payload);
      }
    });
    
    return {
      isVulnerable: vulnerabilities.length > 0,
      vulnerabilities,
      recommendation: vulnerabilities.length > 0 
        ? 'Input should be sanitized to prevent XSS attacks'
        : 'No XSS vulnerabilities detected',
    };
  }
  
  static testCSRFProtection(request: RequestInit): CSRFTestResult {
    const headers = request.headers as Record<string, string> || {};
    
    const hasCSRFToken = 
      headers['X-CSRF-Token'] || 
      headers['x-csrf-token'] ||
      headers['X-Requested-With'];
    
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      request.method?.toUpperCase() || 'GET'
    );
    
    return {
      isProtected: !isStateChanging || !!hasCSRFToken,
      hasToken: !!hasCSRFToken,
      isStateChanging,
      recommendation: !hasCSRFToken && isStateChanging
        ? 'State-changing requests should include CSRF protection'
        : 'CSRF protection is properly implemented',
    };
  }
  
  static testInputValidation(input: any, schema: ValidationSchema): ValidationTestResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Test for required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!input[field]) {
          errors.push(`Required field '${field}' is missing`);
        }
      });
    }
    
    // Test field types and constraints
    Object.entries(schema.properties || {}).forEach(([field, rules]) => {
      const value = input[field];
      
      if (value !== undefined) {
        // Type validation
        if (rules.type && typeof value !== rules.type) {
          errors.push(`Field '${field}' should be of type ${rules.type}`);
        }
        
        // Length validation
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`Field '${field}' exceeds maximum length of ${rules.maxLength}`);
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`Field '${field}' is below minimum length of ${rules.minLength}`);
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`Field '${field}' does not match required pattern`);
        }
        
        // Security checks
        const xssTest = this.testXSSVulnerability(value);
        if (xssTest.isVulnerable) {
          warnings.push(`Field '${field}' contains potential XSS payload`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendation: errors.length > 0
        ? 'Fix validation errors before processing'
        : 'Input validation passed',
    };
  }
  
  static async testSecurityHeaders(url: string): Promise<SecurityHeadersTestResult> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const validation = validateSecurityHeaders(response);
      
      return {
        isSecure: validation.isSecure,
        missing: validation.missing,
        warnings: validation.warnings,
        headers: Object.fromEntries(response.headers.entries()),
        recommendation: validation.isSecure
          ? 'Security headers are properly configured'
          : 'Missing critical security headers',
      };
    } catch (error) {
      return {
        isSecure: false,
        missing: ['Unable to test'],
        warnings: [`Failed to fetch headers: ${error}`],
        headers: {},
        recommendation: 'Unable to test security headers',
      };
    }
  }
}

// Security test interfaces
interface XSSTestResult {
  isVulnerable: boolean;
  vulnerabilities: string[];
  recommendation: string;
}

interface CSRFTestResult {
  isProtected: boolean;
  hasToken: boolean;
  isStateChanging: boolean;
  recommendation: string;
}

interface ValidationTestResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendation: string;
}

interface SecurityHeadersTestResult {
  isSecure: boolean;
  missing: string[];
  warnings: string[];
  headers: Record<string, string>;
  recommendation: string;
}
```

## Conclusion

This comprehensive security guide provides:

- **Authentication & Authorization**: Secure login, token management, and RBAC
- **Input Validation**: Comprehensive validation and sanitization
- **XSS Prevention**: Multiple layers of protection against script injection
- **CSRF Protection**: Token-based protection for state-changing operations
- **API Security**: Rate limiting, request validation, and secure communication
- **Data Protection**: Encryption, secure storage, and sensitive data handling
- **Security Headers**: Proper configuration and validation
- **Monitoring & Logging**: Security event tracking and alerting
- **Security Testing**: Automated testing utilities for common vulnerabilities

Implementing these security measures will significantly improve the application's security posture and protect against common web vulnerabilities. Regular security audits and updates should be performed to maintain security effectiveness.