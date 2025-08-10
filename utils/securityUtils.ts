/**
 * Security utilities for input validation, sanitization, and protection
 */

// Content Security Policy utilities
export class CSPManager {
  private static instance: CSPManager;
  private nonces: Set<string> = new Set();

  static getInstance(): CSPManager {
    if (!CSPManager.instance) {
      CSPManager.instance = new CSPManager();
    }
    return CSPManager.instance;
  }

  generateNonce(): string {
    const nonce = btoa(crypto.getRandomValues(new Uint8Array(16)).toString());
    this.nonces.add(nonce);
    return nonce;
  }

  validateNonce(nonce): boolean {
    return this.nonces.has(nonce);
  }

  removeNonce(nonce): void {
    this.nonces.delete(nonce);
  }

  generateCSPHeader(options: {
    allowInlineStyles?: boolean;
    allowInlineScripts?: boolean;
    allowedDomains?: string;
    reportUri?: string;
  } = {}): string {
    const directives: string[] = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ];

    if (options.allowInlineStyles) {
      directives[2] += " 'unsafe-inline'";
    }

    if (options.allowInlineScripts) {
      directives[1] += " 'unsafe-inline'";
    }

    if (options.allowedDomains?.length) {
      const domains = options.allowedDomains.join(' ');
      directives[1] += ` ${domains}`;
      directives[2] += ` ${domains}`;
      directives[4] += ` ${domains}`;
    }

    if (options.reportUri) {
      directives.push(`report-uri ${options.reportUri}`);
    }

    return directives.join('; ');
  }
}

// Input validation and sanitization
export class InputValidator {
  // Email validation
  static isValidEmail(email): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // URL validation
  static isValidURL(url, allowedProtocols: string[] = ['http', 'https']): boolean {
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol.slice(0, -1));
    } catch {
      return false;
    }
  }

  // Phone number validation (international format)
  static isValidPhoneNumber(phone): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  // Password strength validation
  static validatePasswordStrength(password): {
    isValid: boolean;
    score: number;
    feedback: string;
  } {
    const feedback: string = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /(.)\1{2,}/, // repeated characters
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      feedback.push('Password contains common patterns');
      score -= 1;
    }

    return {
      isValid: score >= 4 && feedback.length === 0,
      score: Math.max(0, score),
      feedback,
    };
  }

  // SQL injection prevention
  static sanitizeForSQL(input): string {
    return input.replace(/['"\\;]/g, '');
  }

  // XSS prevention
  static sanitizeHTML(input): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // File name validation
  static isValidFileName(fileName): boolean {
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;

    return !invalidChars.test(fileName) &&
           !reservedNames.test(fileName) &&
           fileName.length > 0 &&
           fileName.length <= 255 &&
           !fileName.startsWith('.') &&
           !fileName.endsWith('.');
  }

  // Credit card validation (Luhn algorithm)
  static isValidCreditCard(cardNumber): boolean {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      const char = cleanNumber[i];
      if (char === undefined) {
        continue;
      }
      let digit = parseInt(char, 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}

// Rate limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000, // 1 minute
  ) {}

  isAllowed(identifier): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier)!;

    // Remove old requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  getRemainingRequests(identifier): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter((time) => time > windowStart);

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier): number {
    if (!this.requests.has(identifier)) {
      return 0;
    }

    const userRequests = this.requests.get(identifier)!;
    if (userRequests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

// Secure token generation
export class TokenGenerator {
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      result += digits[randomIndex];
    }

    return result;
  }
}

// Encryption utilities (for client-side data)
export class ClientEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  static async encrypt(data, key: CryptoKey): Promise<{
    encrypted: ArrayBuffer;
    iv: Uint8Array;
  }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = this.encoder.encode(data);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData,
    );

    return { encrypted, iv };
  }

  static async decrypt(
    encrypted: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array,
  ): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted,
    );

    return this.decoder.decode(decrypted);
  }

  static async hashData(data): Promise<string> {
    const encodedData = this.encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Secure storage utilities
export class SecureStorage {
  private static prefix = 'secure_';

  static setItem(key, value, encrypt: boolean = false): void {
    try {
      const storageKey = this.prefix + key;

      if (encrypt) {
        // Simple obfuscation (not true encryption for localStorage)
        const obfuscated = btoa(encodeURIComponent(value));
        localStorage.setItem(storageKey, obfuscated);
      } else {
        localStorage.setItem(storageKey, value);
      }
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  }

  static getItem(key, encrypted: boolean = false): string | null {
    try {
      const storageKey = this.prefix + key;
      const value = localStorage.getItem(storageKey);

      if (!value) {
return null;
}

      if (encrypted) {
        try {
          return decodeURIComponent(atob(value));
        } catch {
          return null;
        }
      }

      return value;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  }

  static removeItem(key): void {
    const storageKey = this.prefix + key;
    localStorage.removeItem(storageKey);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  static setSecureSession(key, value): void {
    try {
      const storageKey = this.prefix + key;
      sessionStorage.setItem(storageKey, value);
    } catch (error) {
      console.error('Failed to store session data securely:', error);
    }
  }

  static getSecureSession(key): string | null {
    try {
      const storageKey = this.prefix + key;
      return sessionStorage.getItem(storageKey);
    } catch (error) {
      console.error('Failed to retrieve session data securely:', error);
      return null;
    }
  }
}

// Security headers validation
export class SecurityHeaders {
  static validateResponse(response: Response): {
    isSecure: boolean;
    issues: string;
    recommendations: string;
  } {
    const issues: string = [];
    const recommendations: string = [];

    // Check for security headers
    const { headers } = response;

    if (!headers.get('Content-Security-Policy')) {
      issues.push('Missing Content-Security-Policy header');
      recommendations.push('Add CSP header to prevent XSS attacks');
    }

    if (!headers.get('X-Frame-Options') && !headers.get('Content-Security-Policy')?.includes('frame-ancestors')) {
      issues.push('Missing X-Frame-Options header');
      recommendations.push('Add X-Frame-Options to prevent clickjacking');
    }

    if (!headers.get('X-Content-Type-Options')) {
      issues.push('Missing X-Content-Type-Options header');
      recommendations.push('Add X-Content-Type-Options: nosniff');
    }

    if (!headers.get('Referrer-Policy')) {
      issues.push('Missing Referrer-Policy header');
      recommendations.push('Add Referrer-Policy header');
    }

    if (!headers.get('Strict-Transport-Security') && response.url.startsWith('https')) {
      issues.push('Missing HSTS header on HTTPS');
      recommendations.push('Add Strict-Transport-Security header');
    }

    const isSecure = issues.length === 0;

    return { isSecure, issues, recommendations };
  }
}

// CSRF protection
export class CSRFProtection {
  private static tokenKey = 'csrf_token';

  static generateToken(): string {
    const token = TokenGenerator.generateSecureToken();
    SecureStorage.setSecureSession(this.tokenKey, token);
    return token;
  }

  static getToken(): string | null {
    return SecureStorage.getSecureSession(this.tokenKey);
  }

  static validateToken(token): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }

  static addTokenToRequest(request: RequestInit): RequestInit {
    const token = this.getToken();

    if (token) {
      const headers = new Headers(request.headers);
      headers.set('X-CSRF-Token', token);

      return {
        ...request,
        headers,
      };
    }

    return request;
  }
}

// Security audit utilities
export class SecurityAudit {
  static auditLocalStorage(): {
    sensitiveDataFound: boolean;
    issues: string;
    recommendations: string;
  } {
    const issues: string = [];
    const recommendations: string = [];
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /credit.*card/i,
      /ssn/i,
      /social.*security/i,
    ];

    let sensitiveDataFound = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) {
continue;
}

      const value = localStorage.getItem(key);
      if (!value) {
continue;
}

      // Check for sensitive data patterns
      const keyHasSensitiveData = sensitivePatterns.some(pattern => pattern.test(key));
      const valueHasSensitiveData = sensitivePatterns.some(pattern => pattern.test(value));

      if (keyHasSensitiveData || valueHasSensitiveData) {
        sensitiveDataFound = true;
        issues.push(`Potential sensitive data in localStorage: ${key}`);
        recommendations.push('Consider using sessionStorage or secure server-side storage');
      }

      // Check for large data
      if (value.length > 10000) {
        issues.push(`Large data stored in localStorage: ${key} (${value.length} chars)`);
        recommendations.push('Consider using IndexedDB for large data');
      }
    }

    return { sensitiveDataFound, issues, recommendations };
  }

  static auditCookies(): {
    insecureCookies: string;
    recommendations: string;
  } {
    const insecureCookies: string = [];
    const recommendations: string = [];

    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');

      if (!name) {
        return;
      }

      // Check if cookie has secure flags (this is limited in client-side)
      if (!cookie.includes('Secure') && location.protocol === 'https:') {
        insecureCookies.push(name);
        recommendations.push(`Add Secure flag to cookie: ${name}`);
      }

      if (!cookie.includes('HttpOnly')) {
        recommendations.push(`Consider adding HttpOnly flag to cookie: ${name}`);
      }

      if (!cookie.includes('SameSite')) {
        recommendations.push(`Add SameSite attribute to cookie: ${name}`);
      }
    });

    return { insecureCookies, recommendations };
  }
}

// Export all security utilities
export const securityUtils = {
  CSPManager,
  InputValidator,
  RateLimiter,
  TokenGenerator,
  ClientEncryption,
  SecureStorage,
  SecurityHeaders,
  CSRFProtection,
  SecurityAudit,
};

export default securityUtils;