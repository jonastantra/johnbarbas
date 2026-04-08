// Service Worker for John Barbas Website
// Provides caching, offline functionality, and performance optimizations

const CACHE_NAME = 'johnbarbas-v1.2';
const STATIC_CACHE = 'johnbarbas-static-v1.2';
const DYNAMIC_CACHE = 'johnbarbas-dynamic-v1.2';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/productos.html',
    '/sucursal.html',
    '/styles.css',
    '/script.js',
    '/whatsappButton.js',
    '/facebookPixel.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Images to cache
const IMAGE_ASSETS = [
    'https://johnbarbas.com/images/profile_johnbarbas1.jpg',
    'https://johnbarbas.com/images/product/1balsamo.jpg',
    'https://johnbarbas.com/images/product/3balsamos.jpg',
    'https://johnbarbas.com/images/product/3meses.jpg',
    'https://johnbarbas.com/images/product/6meses.jpg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache images
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Caching images...');
                return cache.addAll(IMAGE_ASSETS);
            })
        ]).then(() => {
            console.log('Service Worker installed successfully');
            return self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker installation failed:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        handleRequest(request, url)
    );
});

async function handleRequest(request, url) {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
        return cacheFirst(request);
    }

    // Strategy 2: Network First for HTML pages
    if (isHTMLPage(url)) {
        return networkFirst(request);
    }

    // Strategy 3: Cache First for images
    if (isImage(url)) {
        return cacheFirst(request);
    }

    // Strategy 4: Network First for external APIs and dynamic content
    return networkFirst(request);
}

// Cache First Strategy - good for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

// Network First Strategy - good for HTML and dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
        }
        
        return new Response('Offline', { status: 503 });
    }
}

// Helper functions
function isStaticAsset(url) {
    return url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.hostname === 'cdn.tailwindcss.com' ||
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'cdnjs.cloudflare.com';
}

function isHTMLPage(url) {
    return url.pathname.endsWith('.html') || 
           url.pathname === '/' ||
           (!url.pathname.includes('.') && url.origin === self.location.origin);
}

function isImage(url) {
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
           url.pathname.includes('/images/');
}

// Background sync for analytics and form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle any queued analytics events or form submissions
    console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/profile_johnbarbas1.jpg',
            badge: '/images/profile_johnbarbas1.jpg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver productos',
                    icon: '/images/icon-explore.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: '/images/icon-close.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/productos.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open the main page
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker script loaded');