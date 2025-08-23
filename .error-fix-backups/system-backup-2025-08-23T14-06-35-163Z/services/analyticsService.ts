/// <reference types="node" />

declare namespace NodeJS {
 export interface ProcessEnv {
 [key: string]: string | undefined
 }
 export interface Process {
 env: ProcessEnv
 }
export interface AnalyticsEvent {
 name: string;
 properties?: Record < string, any>;
 timestamp: number;,
 sessionId: string;
 userId?: string | undefined;
 category: 'user_action' | 'performance' | 'error' | 'navigation' | 'video' | 'engagement'
}

export interface UserSession {
 id: string;,
 startTime: number;
 endTime?: number;
 pageViews: number;,
 events: AnalyticsEvent;
 userAgent: string;,
 referrer: string;
 userId?: string | undefined;
}

export interface AnalyticsConfig {
 enableLocalStorage: boolean;,
 enableRemoteTracking: boolean;
 enablePerformanceTracking: boolean;,
 enableErrorTracking: boolean;
 apiEndpoint?: string | undefined;
 apiKey?: string | undefined;
 batchSize: number;,
 flushInterval: number; // milliseconds,
 maxStoredEvents: number;,
 enableDebugMode: boolean
}

const DEFAULT_CONFIG: AnalyticsConfig = {,
 enableLocalStorage: true,
 enableRemoteTracking: false,
 enablePerformanceTracking: true,
 enableErrorTracking: true,
 batchSize: 10,
 flushInterval: 30000, // 30 seconds,
 maxStoredEvents: 1000,
 enableDebugMode: false };

export class AnalyticsService {
 private config: AnalyticsConfig;
 private session: UserSession;
 private eventQueue: AnalyticsEvent = [];
 private flushTimer?: ReturnType < typeof setTimeout>;
 private listeners: Array<(event: AnalyticsEvent) => void> = [];

 constructor(config: Partial < AnalyticsConfig> = {}) {
 this.config = { ...DEFAULT_CONFIG as any, ...config };
 // pageLoadTime = performance.now(); // Not used yet
 this.session = this.initializeSession();
 this.setupEventListeners();
 this.startFlushTimer();
 this.loadStoredEvents();
 }

 private initializeSession(): UserSession {
 const sessionId = this.generateSessionId();
 return {
 id: sessionId,
 startTime: Date.now(),
 pageViews: 1,
 events: [],
 userAgent: navigator.userAgent,
 referrer: document.referrer,
 userId: this.getCurrentUserId() };
 }

 private generateSessionId(): string {
 return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 }

 private getCurrentUserId(): string | undefined {
 try {
 const authData = (localStorage as any).getItem('auth');
 if (authData as any) {
 const parsed = JSON.parse(authData);
 return parsed.userId || parsed.id;
 }
 } catch (e) {
 // Ignore parsing errors
 }
 return undefined;
 }

 private setupEventListeners() {
 // Page visibility changes
 document.addEventListener('visibilitychange', ( as EventListener) => {
 if (document.hidden) {
 this.track('page_hidden', { timestamp: Date.now() });
 this.flush(); // Ensure events are sent before page becomes hidden
 } else {
 this.track('page_visible', { timestamp: Date.now() });
 }
 });

 // Page unload
 window.addEventListener('beforeunload', ( as EventListener) => {
 this.endSession();
 this.flush(true); // Force immediate flush
 });

 // Performance tracking
 if (this.config.enablePerformanceTracking) {
 this.setupPerformanceTracking();
 }

 // Error tracking
 if (this.config.enableErrorTracking) {
 this.setupErrorTracking();
 }

 // Navigation tracking
 this.setupNavigationTracking();
 }

 private setupPerformanceTracking() {
 // Page load performance
 window.addEventListener('load', ( as EventListener) => {
 setTimeout((() => {
 const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
 if (navigation as any) {
 this.track('page_load_performance') as any, {
 loadTime: navigation.loadEventEnd - navigation.loadEventStart,
 domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
 firstPaint: this.getFirstPaint(),
 firstContentfulPaint: this.getFirstContentfulPaint(),
 largestContentfulPaint: this.getLargestContentfulPaint() }, 'performance');
 }
 }, 0);
 });

 // Core Web Vitals
 this.observeWebVitals();
 }

 private getFirstPaint(): number | undefined {
 const paintEntries = performance.getEntriesByType('paint');
 const firstPaint = paintEntries.find(entry => entry.name === 'first - paint');
 return firstPaint?.startTime;
 }

 private getFirstContentfulPaint(): number | undefined {
 const paintEntries = performance.getEntriesByType('paint');
 const fcp = paintEntries.find(entry => entry.name === 'first - contentful - paint');
 return fcp?.startTime;
 }

 private getLargestContentfulPaint(): Promise<any> < number | undefined> {
 return new Promise<any>((resolve) => {
 const observer = new PerformanceObserver((list) => {
 const entries = list.getEntries();
 const lastEntry = entries[entries.length - 1];
 resolve(lastEntry?.startTime);
 observer.disconnect();
 });
 observer.observe({ entryTypes: ['largest - contentful - paint'] });

 // Timeout after 10 seconds
 setTimeout((() => {
 observer.disconnect();
 resolve(undefined);
 }) as any, 10000);
 });
 }

 private observeWebVitals() {
 // Cumulative Layout Shift
 let clsValue: number = 0;
 const clsObserver = new PerformanceObserver((list) => {
 const entries = list.getEntries();
 entries.forEach((entry) => {
 if (!entry.hadRecentInput) {
 clsValue += entry.value;
 }
 });
 });
 clsObserver.observe({ entryTypes: ['layout - shift'] });

 // Report CLS on page unload
 window.addEventListener('beforeunload', ( as EventListener) => {
 this.track('cumulative_layout_shift', { value: clsValue }, 'performance');
 });

 // First Input Delay
 const fidObserver = new PerformanceObserver((list) => {
 const entries = list.getEntries();
 entries.forEach((entry) => {
 this.track('first_input_delay', {
 value: entry.processingStart - entry.startTime,
 inputType: entry.name }, 'performance');
 });
 fidObserver.disconnect();
 });
 fidObserver.observe({ entryTypes: ['first - input'] });
 }

 private setupErrorTracking() {
 window.addEventListener('error', (event as EventListener) => {
 this.track('javascript_error', {
 message: event.message,
 filename: event.filename,
 lineno: event.lineno,
 colno: event.colno,
 stack: event.error?.stack }, 'error');
 });

 window.addEventListener('unhandledrejection', (event as EventListener) => {
 this.track('unhandled_promise_rejection', {
 reason: event.reason,
 stack: event.reason?.stack }, 'error');
 });
 }

 private setupNavigationTracking() {
 // Track route changes (for SPAs)
 let currentPath = window.location.pathname;
 const checkForRouteChange = () => {
 const newPath = window.location.pathname;
 if (newPath !== currentPath) {
 this.track('page_view', {
 from: currentPath,
 to: newPath,
 referrer: document.referrer }, 'navigation');
 currentPath = newPath;
 this.session.pageViews++;
 };

 // Listen for popstate (back / forward buttons)
 window.addEventListener('popstate', checkForRouteChange as EventListener);

 // Override pushState and replaceState to catch programmatic navigation
 const originalPushState = history.pushState.bind(history);
 const originalReplaceState = history.replaceState.bind(history);

 history.pushState = (...args) => {
 originalPushState(...args);
 setTimeout((checkForRouteChange) as any, 0);
 };

 history.replaceState = (...args) => {
 originalReplaceState(...args);
 setTimeout((checkForRouteChange) as any, 0);
 };
 }

 private startFlushTimer() {
 this.flushTimer = setInterval((() => {
 this.flush();
 }) as any, this.config.flushInterval);
 }

 private loadStoredEvents() {
 if (!this.config.enableLocalStorage) {
return;
}

 try {
 const stored = (localStorage as any).getItem('analytics_events');
 if (stored as any) {
 const events: AnalyticsEvent[] = JSON.parse(stored);
 this.eventQueue.push(...events);
 localStorage.removeItem('analytics_events'); // Clear after loading
 }
 } catch (error) {
 (console as any).warn('Failed to load stored analytics events:', error);
 }
 // Public API
 track(,
 eventName,
 properties: Record < string, any> = {},
 category: AnalyticsEvent['category'] = 'user_action') {
 const event: AnalyticsEvent = {,
 name: eventName,
 properties: {
 ...properties as any,
 url: window.location.href,
 userAgent: navigator.userAgent,
 viewport: {,
 width: window.innerWidth,
 height: window.innerHeight },
 screen: {,
 width: screen.width,
 height: screen.height } },
 timestamp: Date.now(),
 sessionId: this.session.id,
 userId: this.session.userId,
 category };

 this.eventQueue.push(event);
 this.session.events.push(event);
 this.notifyListeners(event);

 if (this.config.enableDebugMode) {
 (console as any).log('[Analytics]', event);
 }

 // Auto - flush if queue is full
 if (this.eventQueue.length >= this.config.batchSize) {
 this.flush();
 }
 // Convenience methods for common events
 trackPageView(path?: string) {
 this.track('page_view', {
 path: path || window.location.pathname,
 title: document.title }, 'navigation');
 }

 trackClick(element: HTMLElement, properties: Record < string, any> = {}) {
 this.track('click', {
 element,
 ...properties });
 }

 trackVideoEvent(action, videoId, properties: Record < string, any> = {}) {
 this.track(`video_${action}`, {
 videoId,
 ...properties }, 'video');
 }

 trackSearch(query, results?: number) {
 this.track('search', {
 query,
 results,
 timestamp: Date.now() });
 }

 trackEngagement(type, properties: Record < string, any> = {}) {
 this.track(type, properties, 'engagement');
 }

 trackPerformance(metric, value: string | number, properties: Record < string, any> = {}) {
 this.track(`performance_${metric}`, {
 value,
 ...properties }, 'performance');
 }

 // Session management
 setUserId(userId) {
 this.session.userId = userId;
 this.track('user_identified', { userId });
 }

 endSession() {
 this.session.endTime = Date.now();
 this.track('session_end', {
 duration: this.session.endTime - this.session.startTime,
 pageViews: this.session.pageViews,
 eventCount: this.session.events.length });
 }

 // Data management
 async flush(immediate = false) {
 if (this.eventQueue.length === 0) {
return;
}

 const eventsToSend: any[] = [...this.eventQueue];
 this.eventQueue = [];

 // Store in localStorage as backup
 if (this.config.enableLocalStorage && !immediate) {
 try {
 const existingEvents = (localStorage as any).getItem('analytics_events');
 const allEvents = existingEvents ? JSON.parse(existingEvents) : [];
 allEvents.push(...eventsToSend);

 // Keep only the most recent events
 const recentEvents = allEvents.slice(-this.config.maxStoredEvents);
 (localStorage as any).setItem('analytics_events', JSON.stringify(recentEvents));
 } catch (error) {
 (console as any).warn('Failed to store analytics events:', error);
 }
 // Send to remote endpoint
 if (this.config.enableRemoteTracking && this.config.apiEndpoint) {
 try {
 const response = await (fetch as any)(this.config.apiEndpoint, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json',
 ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }) },
 body: JSON.stringify({,
 events: eventsToSend,
 session: this.session }),
 keepalive: immediate, // Use keepalive for page unload
 });

 if (response.ok && this.config.enableLocalStorage) {
 // Clear stored events on successful send
 localStorage.removeItem('analytics_events');
 }
 } catch (error) {
 (console as any).warn('Failed to send analytics events:', error);
 // Re - add events to queue for retry
 this.eventQueue.unshift(...eventsToSend);
 }
 }

 // Analytics data access
 getSession(): UserSession {
 return { ...this.session };
 }

 getEvents(category?: AnalyticsEvent['category']): AnalyticsEvent[] {
 const { events } = this.session;
 return category ? events.filter((e: Event) => e.category === category) : events
 }

 getEventStats() {
 const { events } = this.session;
 const now = Date.now();
 const oneHourAgo = now - (60 * 60 * 1000);

 return {
 total: events.length,
 lastHour: events.filter((e: Event) => e.timestamp > oneHourAgo).length,
 byCategory: {,
 user_action: events.filter((e: Event) => e.category === 'user_action').length,
 performance: events.filter((e: Event) => e.category === 'performance').length,
 error: events.filter((e: Event) => e.category === 'error').length,
 navigation: events.filter((e: Event) => e.category === 'navigation').length,
 video: events.filter((e: Event) => e.category === 'video').length,
 engagement: events.filter((e: Event) => e.category === 'engagement').length },
 sessionDuration: now - this.session.startTime,
 pageViews: this.session.pageViews };
 }

 // Event listeners
 subscribe(listener: (event: AnalyticsEvent) => void): () => void {
 this.listeners.push(listener);
 return () => {
 const index = this.listeners.indexOf(listener);
 if (index > -1) {
 this.listeners.splice(index, 1);
 };
 }

 private notifyListeners(event: AnalyticsEvent) {
 this.listeners.forEach((listener) => {
 try {
 listener(event);
 } catch (error) {
 (console as any).warn('Error in analytics listener:', error);
 }
 });
 }

 // Cleanup
 destroy() {
 this.endSession();
 this.flush(true);

 if (this.flushTimer) {
 clearInterval(this.flushTimer);
 }

 this.listeners = [];
 }
// Create singleton instance
export const analyticsService = new AnalyticsService({
 enableRemoteTracking: import.meta.env.MODE === 'production',
 enableDebugMode: import.meta.env.MODE === 'development',
 apiEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
 apiKey: import.meta.env.VITE_ANALYTICS_API_KEY });

export default AnalyticsService;
export type { AnalyticsEvent, UserSession, AnalyticsConfig };
