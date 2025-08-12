// Service Worker for YouTubeX Studio Clone PWA
const CACHE_NAME = 'youtubex-v1.0.0';
const STATIC_CACHE_NAME = 'youtubex-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'youtubex-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'youtubex-images-v1.0.0';
const API_CACHE_NAME = 'youtubex-api-v1.0.0';

// Cache duration in milliseconds
const CACHE_DURATION = {
 STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
 DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
 IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
 API: 5 * 60 * 1000, // 5 minutes
};

// Static assets to cache immediately
const STATIC_ASSETS = [
 '/',
 '/index.html',
 '/manifest.json',
 '/favicon.ico',
 // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
 '/api/videos',
 '/api/trending',
 '/api/search',
 '/api/channels',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
 console.log('[SW] Installing service worker...');

 event.waitUntil(
 Promise.all([
 caches.open(STATIC_CACHE_NAME).then((cache) => {
 console.log('[SW] Caching static assets');
 return cache.addAll(STATIC_ASSETS);
 }),
 // Skip waiting to activate immediately
 self.skipWaiting()
 ])
 );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
 console.log('[SW] Activating service worker...');

 event.waitUntil(
 Promise.all([
 // Clean up old caches
 caches.keys().then((cacheNames) => {
 return Promise.all(
 cacheNames.map((cacheName) => {
 if (
 cacheName !== STATIC_CACHE_NAME &&
 cacheName !== DYNAMIC_CACHE_NAME &&
 cacheName !== IMAGE_CACHE_NAME &&
 cacheName !== API_CACHE_NAME
 ) {
 console.log('[SW] Deleting old cache:', cacheName);
 return caches.delete(cacheName);
 }
 })
 );
 }),
 // Take control of all clients
 self.clients.claim()
 ])
 );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
 const { request } = event;
 const url = new URL(request.url);

 // Skip non-GET requests
 if (request.method !== 'GET') {
 return;
 }

 // Helper to safely handle a handler that returns a Response or throws
 const withResponseGuard = async (promise) => {
 try {
 const res = await promise;
 if (res instanceof Response) {
 return res;
 }
 // If a handler returned something invalid, convert to a proper Response
 console.error('[SW] Handler returned non-Response. Converting to error Response.', { type: typeof res, url: request.url });
 return new Response('Invalid handler response', { status: 502, statusText: 'Bad Gateway' });
 } catch (err) {
 console.error('[SW] Handler threw error. Returning fallback Response.', err);
 return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
 };

 // Handle different types of requests
 if (isStaticAsset(url)) {
 event.respondWith(withResponseGuard(handleStaticAsset(request)));
 } else if (isImageRequest(url)) {
 event.respondWith(withResponseGuard(handleImageRequest(request)));
 } else if (isAPIRequest(url)) {
 event.respondWith(withResponseGuard(handleAPIRequest(request)));
 } else if (isNavigationRequest(request)) {
 event.respondWith(withResponseGuard(handleNavigationRequest(request)));
 } else {
 event.respondWith(withResponseGuard(handleDynamicRequest(request)));
 }
});

// Check if request is for static assets
function isStaticAsset(url) {
 return (
 url.pathname.endsWith('.js') ||
 url.pathname.endsWith('.css') ||
 url.pathname.endsWith('.woff') ||
 url.pathname.endsWith('.woff2') ||
 url.pathname === '/manifest.json' ||
 url.pathname === '/favicon.ico'
 );
}

// Check if request is for images
function isImageRequest(url) {
 return (
 url.pathname.endsWith('.jpg') ||
 url.pathname.endsWith('.jpeg') ||
 url.pathname.endsWith('.png') ||
 url.pathname.endsWith('.gif') ||
 url.pathname.endsWith('.webp') ||
 url.pathname.endsWith('.svg') ||
 url.pathname.includes('/thumbnails/') ||
 url.pathname.includes('/avatars/') ||
 // treat common placeholder domains as images too
 url.hostname.includes('placeholder.com') ||
 url.hostname.includes('placehold.co') ||
 url.hostname.includes('picsum.photos')
 );
}

// Check if request is for API
function isAPIRequest(url) {
 return (
 url.pathname.startsWith('/api/') ||
 url.hostname.includes('googleapis.com') ||
 url.hostname.includes('youtube.com')
 );
}

// Check if request is navigation
function isNavigationRequest(request) {
 return request.mode === 'navigate';
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
 try {
 const cache = await caches.open(STATIC_CACHE_NAME);
 const cachedResponse = await cache.match(request);

 if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATION.STATIC)) {
 return cachedResponse;
 }

 const networkResponse = await fetch(request);
 if (networkResponse.ok) {
 cache.put(request, networkResponse.clone());
 }
 return networkResponse;
 } catch (error) {
 console.error('[SW] Static asset fetch failed:', error);
 const cache = await caches.open(STATIC_CACHE_NAME);
 return cache.match(request) || new Response('Asset not available offline');
 }
// Handle images with cache-first strategy
async function handleImageRequest(request) {
 try {
 const cache = await caches.open(IMAGE_CACHE_NAME);
 const cachedResponse = await cache.match(request);

 if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATION.IMAGES)) {
 return cachedResponse;
 }

 // For cross-origin images, we still try fetch but handle failures gracefully
 const networkResponse = await fetch(request, { mode: 'no-cors' }).catch(() => null);

 if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
 // Cache opaque responses too for images
 cache.put(request, networkResponse.clone());
 return networkResponse;
 }

 // If fetch failed or not ok, try cache again (maybe stale)
 const fallbackCache = await cache.match(request);
 if (fallbackCache) {
 return fallbackCache;
 }

 // Return inline placeholder as a valid Response
 return new Response(
 '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
 { headers: { 'Content-Type': 'image/svg+xml' }, status: 200 }
 );
 } catch (error) {
 console.error('[SW] Image fetch failed:', error);
 return new Response(
 '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
 { headers: { 'Content-Type': 'image/svg+xml' }, status: 200 }
 );
 }
// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
 try {
 const networkResponse = await fetch(request);

 if (networkResponse.ok) {
 const cache = await caches.open(API_CACHE_NAME);
 cache.put(request, networkResponse.clone());
 }

 return networkResponse;
 } catch (error) {
 console.error('[SW] API fetch failed:', error);
 const cache = await caches.open(API_CACHE_NAME);
 const cachedResponse = await cache.match(request);

 if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATION.API)) {
 return cachedResponse;
 }

 // Return offline response for API
 return new Response(
 JSON.stringify({
 error: 'Network unavailable',
 offline: true,
 message: 'This content is not available offline'
 }),
 {
 status: 503,
 headers: { 'Content-Type': 'application/json' }
 );
 }
// Handle navigation requests
async function handleNavigationRequest(request) {
 try {
 const networkResponse = await fetch(request);

 if (networkResponse.ok) {
 const cache = await caches.open(DYNAMIC_CACHE_NAME);
 cache.put(request, networkResponse.clone());
 }

 return networkResponse;
 } catch (error) {
 console.error('[SW] Navigation fetch failed:', error);

 // Try to serve from cache
 const cache = await caches.open(DYNAMIC_CACHE_NAME);
 const cachedResponse = await cache.match(request);

 if (cachedResponse) {
 return cachedResponse;
 }

 // Fallback to index.html for SPA routing
 const indexResponse = await cache.match('/');
 if (indexResponse) {
 return indexResponse;
 }

 // Ultimate fallback
 return new Response(
 `<!DOCTYPE html>
 <html>
 <head>
 <title>YouTubeX - Offline</title>
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <style>
 body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
 .offline { color: #666; }
 </style>
 </head>
 <body>
 <div class="offline">
 <h1>You're offline</h1>
 <p>Please check your internet connection and try again.</p>
 <button onclick="window.location.reload()">Retry</button>
 </div>
 </body>
 </html>`,
 { headers: { 'Content-Type': 'text/html' }
 );
 }
// Handle other dynamic requests
async function handleDynamicRequest(request) {
 try {
 const networkResponse = await fetch(request);
 if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
 const cache = await caches.open(DYNAMIC_CACHE_NAME);
 cache.put(request, networkResponse.clone());
 return networkResponse;
 }
 // If response not ok, try cache before returning the network response
 const cacheStore = await caches.open(DYNAMIC_CACHE_NAME);
 const cached = await cacheStore.match(request);
 if (cached) return cached;
 return networkResponse instanceof Response ? networkResponse : new Response('Network error', { status: 502 });
 } catch (error) {
 console.error('[SW] Dynamic fetch failed:', error);
 const cache = await caches.open(DYNAMIC_CACHE_NAME);
 const cached = await cache.match(request);
 if (cached) return cached;
 // Provide a generic offline Response with proper headers
 return new Response('Content not available offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
 }
// Check if cached response is expired
function isExpired(response, maxAge) {
 const dateHeader = response.headers.get('date');
 if (!dateHeader) return false;

 const date = new Date(dateHeader);
 return Date.now() - date.getTime() > maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
 console.log('[SW] Background sync triggered:', event.tag);

 if (event.tag === 'video-upload') {
 event.waitUntil(syncVideoUploads());
 } else if (event.tag === 'user-actions') {
 event.waitUntil(syncUserActions());
 }
});

// Sync video uploads when back online
async function syncVideoUploads() {
 try {
 // Get pending uploads from IndexedDB
 const pendingUploads = await getPendingUploads();

 for (const upload of pendingUploads) {
 try {
 await fetch('/api/videos/upload', {
 method: 'POST',
 body: upload.data
 });

 // Remove from pending uploads
 await removePendingUpload(upload.id);

 // Notify user of successful sync
 self.registration.showNotification('Upload completed', {
 body: `Your video "${upload.title}" has been uploaded successfully.`,
 icon: '/icons/icon-192x192.png',
 badge: '/icons/badge-72x72.png'
 });
 } catch (error) {
 console.error('[SW] Failed to sync upload:', error);
 }
 } catch (error) {
 console.error('[SW] Background sync failed:', error);
 }
// Sync user actions (likes, comments, etc.)
async function syncUserActions() {
 try {
 const pendingActions = await getPendingActions();

 for (const action of pendingActions) {
 try {
 await fetch(action.endpoint, {
 method: action.method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(action.data)
 });

 await removePendingAction(action.id);
 } catch (error) {
 console.error('[SW] Failed to sync action:', error);
 }
 } catch (error) {
 console.error('[SW] Action sync failed:', error);
 }
// Push notification handling
self.addEventListener('push', (event) => {
 console.log('[SW] Push notification received');

 const options = {
 body: 'You have new content to watch!',
 icon: '/icons/icon-192x192.png',
 badge: '/icons/badge-72x72.png',
 vibrate: [200, 100, 200],
 data: {
 url: '/'
 },
 actions: [
 {
 action: 'open',
 title: 'Open App'
 },
 {
 action: 'close',
 title: 'Close'
 }
 ]
 };

 if (event.data) {
 const data = event.data.json();
 options.body = data.body || options.body;
 options.data.url = data.url || options.data.url;
 }

 event.waitUntil(
 self.registration.showNotification('YouTubeX', options)
 );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
 console.log('[SW] Notification clicked');

 event.notification.close();

 if (event.action === 'open' || !event.action) {
 const url = event.notification.data?.url || '/';

 event.waitUntil(
 clients.matchAll({ type: 'window' }).then((clientList) => {
 // Check if app is already open
 for (const client of clientList) {
 if (client.url.includes(url) && 'focus' in client) {
 return client.focus();
 }
 // Open new window
 if (clients.openWindow) {
 return clients.openWindow(url);
 }
 })
 );
 }
});

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB code
async function getPendingUploads() {
 // Implementation would use IndexedDB to get pending uploads
 return [];
}

async function removePendingUpload(id) {
 // Implementation would remove upload from IndexedDB
}

async function getPendingActions() {
 // Implementation would use IndexedDB to get pending actions
 return [];
}

async function removePendingAction(id) {
 // Implementation would remove action from IndexedDB
}

console.log('[SW] Service worker loaded successfully');