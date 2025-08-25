/**
 * Security utilities (clean, minimal, type-safe implementation)
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
      const bytes = new Uint8Array(16);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
         crypto.getRandomValues(bytes);
      } else {
         for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      const nonce = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
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
      allowedDomains?: string[];
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
         'upgrade-insecure-requests'
      ];

      if (options.allowInlineStyles) directives[2] += " 'unsafe-inline'";
      if (options.allowInlineScripts) directives[1] += " 'unsafe-inline'";
      if (options.allowedDomains?.length) {
         const domains = options.allowedDomains.join(' ');
         directives[1] += ` ${domains}`;
         directives[2] += ` ${domains}`;
         directives[4] += ` ${domains}`;
      }
      if (options.reportUri) directives.push(`report-uri ${options.reportUri}`);
      return directives.join('; ');
   }
}

// Input validation and sanitization
export class InputValidator {
   static isValidEmail(email): boolean {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(email) && email.length <= 254;
   }

   static isValidURL(url, allowedProtocols: string[] = ['http', 'https']): boolean {
      try {
         const urlObj = new URL(url);
         return allowedProtocols.includes(urlObj.protocol.replace(':', ''));
      } catch {
         return false;
      }
   }

   static isValidPhoneNumber(phone): boolean {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const clean = phone.replace(/[\s\-()]/g, '');
      return phoneRegex.test(clean);
   }

   static validatePasswordStrength(password): { isValid: boolean; score: number; feedback: string[] } {
      const feedback: string[] = [];
      let score = 0;
      if (password.length >= 8) score += 1; else feedback.push('Password must be at least 8 characters long');
      if (/[a-z]/.test(password)) score += 1; else feedback.push('Password must contain at least one lowercase letter');
      if (/[A-Z]/.test(password)) score += 1; else feedback.push('Password must contain at least one uppercase letter');
      if (/\d/.test(password)) score += 1; else feedback.push('Password must contain at least one number');
      if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) score += 1; else feedback.push('Password must contain at least one special character');
      if (/123456|password|qwerty/i.test(password) || /(.)\1{2,}/.test(password)) {
         feedback.push('Password contains common patterns');
         score = Math.max(0, score - 1);
      }
      return { isValid: score >= 4 && feedback.length === 0, score: Math.max(0, score), feedback };
   }

   static sanitizeForSQL(input): string {
      return input.replace(/['"\\;]/g, '');
   }

   static sanitizeHTML(input): string {
      const div = typeof document !== 'undefined' ? document.createElement('div') : null;
      if (!div) return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      div.textContent = input;
      return div.innerHTML;
   }

   static isValidFileName(fileName): boolean {
      // eslint-disable-next-line no-control-regex
      const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
      const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
      return !invalidChars.test(fileName) && !reservedNames.test(fileName) && fileName.length > 0 && fileName.length <= 255 && !fileName.startsWith('.') && !fileName.endsWith('.');
   }

   static isValidCreditCard(cardNumber): boolean {
      const clean = cardNumber.replace(/\D/g, '');
      if (clean.length < 13 || clean.length > 19) return false;
      let sum = 0;
      let dbl = false;
      for (let i = clean.length - 1; i >= 0; i--) {
         let digit = parseInt(clean[i]!, 10);
         if (dbl) {
            digit *= 2;
            if (digit > 9) digit -= 9;
         }
         sum += digit;
         dbl = !dbl;
      }
      return sum % 10 === 0;
   }
}

// Rate limiting
export class RateLimiter {
   private requests: Map<string, number[]> = new Map();
   constructor(private maxRequests: number = 100, private windowMs: number = 60000) {}

   isAllowed(identifier): boolean {
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const list = this.requests.get(identifier) ?? [];
      const valid = list.filter((t) => t > windowStart);
      if (valid.length >= this.maxRequests) return false;
      valid.push(now);
      this.requests.set(identifier, valid);
      return true;
   }

   getRemainingRequests(identifier): number {
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const list = this.requests.get(identifier) ?? [];
      const valid = list.filter((t) => t > windowStart);
      return Math.max(0, this.maxRequests - valid.length);
   }

   getResetTime(identifier): number {
      const list = this.requests.get(identifier) ?? [];
      if (list.length === 0) return 0;
      return Math.min(...list) + this.windowMs;
   }
}

// Secure token generation
export class TokenGenerator {
   static generateSecureToken(length: number = 32): string {
      const array = new Uint8Array(length);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(array);
      else for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
      return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
   }

   static generateUUID(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
         const r = Math.floor(Math.random() * 16);
         const v = c === 'x' ? r : (r & 0x3) | 0x8;
         return v.toString(16);
      });
   }

   static generateOTP(length: number = 6): string {
      const digits = '0123456789';
      let result = '';
      for (let i = 0; i < length; i++) result += digits[Math.floor(Math.random() * digits.length)];
      return result;
   }
}

// Encryption utilities (client-side demo)
export class ClientEncryption {
   private static encoder = new TextEncoder();
   private static decoder = new TextDecoder();

   static async generateKey(): Promise<CryptoKey> {
      return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
   }

   static async encrypt(data, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = this.encoder.encode(data);
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
      return { encrypted, iv };
   }

   static async decrypt(encrypted: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
      return this.decoder.decode(decrypted);
   }

   static async hashData(data): Promise<string> {
      const encoded = this.encoder.encode(data);
      const buffer = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
   }
}

// Secure storage utilities
export class SecureStorage {
   private static prefix = 'secure_';

   static setItem(key, value: string | number, encrypt: boolean = false): void {
      try {
         const storageKey = this.prefix + key;
         const str = String(value);
         const payload = encrypt ? btoa(encodeURIComponent(str)) : str;
         localStorage.setItem(storageKey, payload);
      } catch (error) {
         console.error('Failed to store data securely:', error);
      }
   }

   static getItem(key, encrypted: boolean = false): string | null {
      try {
         const storageKey = this.prefix + key;
         const value = localStorage.getItem(storageKey);
         if (!value) return null;
         return encrypted ? decodeURIComponent(atob(value)) : value;
      } catch (error) {
         console.error('Failed to retrieve data securely:', error);
         return null;
      }
   }

   static removeItem(key): void {
      localStorage.removeItem(this.prefix + key);
   }

   static clear(): void {
      Object.keys(localStorage).forEach((k) => {
         if (k.startsWith(this.prefix)) localStorage.removeItem(k);
      });
   }

   static setSecureSession(key, value: string | number): void {
      try {
         sessionStorage.setItem(this.prefix + key, String(value));
      } catch (error) {
         console.error('Failed to store session data securely:', error);
      }
   }

   static getSecureSession(key): string | null {
      try {
         return sessionStorage.getItem(this.prefix + key);
      } catch (error) {
         console.error('Failed to retrieve session data securely:', error);
         return null;
      }
   }
}

// Security headers validation
export class SecurityHeaders {
   static validateResponse(response: Response): { isSecure: boolean; issues: string[]; recommendations: string[] } {
      const issues: string[] = [];
      const recommendations: string[] = [];
      const { headers } = response;
      if (!headers.get('Content-Security-Policy')) {
         issues.push('Missing Content-Security-Policy header');
         recommendations.push('Add CSP header to prevent XSS attacks');
      }
      if (!headers.get('X-Frame-Options') && !(headers.get('Content-Security-Policy') || '').includes('frame-ancestors')) {
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
      return { isSecure: issues.length === 0, issues, recommendations };
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
      const stored = this.getToken();
      return stored !== null && stored === token;
   }

   static addTokenToRequest(request: RequestInit): RequestInit {
      const token = this.getToken();
      if (token) {
         const headers = new Headers(request.headers);
         headers.set('X-CSRF-Token', token);
         return { ...request, headers };
      }
      return request;
   }
}

// Security audit utilities
export class SecurityAudit {
   static auditLocalStorage(): { sensitiveDataFound: boolean; issues: string[]; recommendations: string[] } {
      const issues: string[] = [];
      const recommendations: string[] = [];
      const sensitivePatterns = [/password/i, /secret/i, /token/i, /key/i, /credit.*card/i, /ssn/i, /social.*security/i];
      let sensitiveDataFound = false;
      for (let i = 0; i < localStorage.length; i++) {
         const key = localStorage.key(i);
         if (!key) continue;
         const value = localStorage.getItem(key) ?? '';
         const keyHasSensitive = sensitivePatterns.some((p) => p.test(key));
         const valueHasSensitive = sensitivePatterns.some((p) => p.test(value));
         if (keyHasSensitive || valueHasSensitive) {
            sensitiveDataFound = true;
            issues.push(`Potential sensitive data in localStorage: ${key}`);
            recommendations.push('Consider using sessionStorage or secure server-side storage');
         }
         if (value.length > 10000) {
            issues.push(`Large data stored in localStorage: ${key} (${value.length} chars)`);
            recommendations.push('Consider using IndexedDB for large data');
         }
      }
      return { sensitiveDataFound, issues, recommendations };
   }

   static auditCookies(): { insecureCookies: string[]; recommendations: string[] } {
      const insecureCookies: string[] = [];
      const recommendations: string[] = [];
      const cookies = (typeof document !== 'undefined' && document.cookie) ? document.cookie.split(';') : [];
      cookies.forEach((cookie) => {
         const [nameRaw] = cookie.trim().split('=');
         const name = nameRaw || '';
         if (!name) return;
         if (typeof location !== 'undefined' && location.protocol === 'https:' && !cookie.includes('Secure')) {
            insecureCookies.push(name);
            recommendations.push(`Add Secure flag to cookie: ${name}`);
         }
         if (!cookie.includes('HttpOnly')) recommendations.push(`Consider adding HttpOnly flag to cookie: ${name}`);
         if (!cookie.includes('SameSite')) recommendations.push(`Add SameSite attribute to cookie: ${name}`);
      });
      return { insecureCookies, recommendations };
   }
}

// Aggregated export
export const securityUtils = {
   CSPManager,
   InputValidator,
   RateLimiter,
   TokenGenerator,
   ClientEncryption,
   SecureStorage,
   SecurityHeaders,
   CSRFProtection,
   SecurityAudit
};

export default securityUtils;