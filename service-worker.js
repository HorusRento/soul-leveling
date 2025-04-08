// service-worker.js
// Version: v1.1.1

// Version defined in constants.js, but needed here for cache naming before constants load
const CACHE_VERSION = 'v1.1.1';
const CACHE_NAME = `soul-leveling-system-${CACHE_VERSION}`;

// Files to cache on install - ALL final files listed
const CORE_ASSETS = [
    '/', // Root index.html
    'index.html',
    // CSS
    'css/main.css',
    'css/animations.css',
    'css/themes.css',
    // JS Files (Order matters for non-module setup!)
    'js/constants.js',      // 1. Constants first
    'js/items.js',          // 2. Item Definitions
    'js/skills.js',         // 3. Skill Definitions
    'js/utils.js',          // 4. Utility Functions
    'js/state.js',          // 5. Core Game State
    'js/effects.js',        // 6. Effect Calculations
    'js/notifications.js',  // 7. Notification Handler
    'js/audio.js',          // 8. Audio Handler
    'js/ui.js',             // 9. Core UI Updates
    'js/animations.js',     // 10. Animation Functions
    'js/ui_interactions.js',// 11. Complex UI Click Logic
    'js/quests.js',         // 12. Quest Logic
    'js/gates.js',          // 13. Gate Logic
    'js/shop.js',           // 14. Shop Logic
    'js/journal.js',        // 15. Journal Logic
    'js/timeline.js',       // 16. Timeline Logic
    'js/companions.js',     // 17. Companion Logic
    'js/combatSimulation.js',// 18. Combat Placeholder
    'js/ai_system.js',      // 19. AI Messages
    'js/settings.js',       // 20. Settings Logic
    'js/saveLoad.js',       // 21. Save/Load Logic
    'js/devMode.js',        // 22. Developer Tools
    'js/main.js',           // 23. Main Initialization & Listeners (Last)
    // Core Images
    'images/soul-leveling-cover.png',
    // PWA Icons (Ensure these files exist!)
    'images/icons/icon-192x192.png',
    'images/icons/icon-384x384.png',
    'images/icons/icon-512x512.png',
    // External Libraries/Fonts
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Roboto:wght@300;400;700&display=swap',
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
    console.log(`[SW ${CACHE_VERSION}] Install`);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(`[SW ${CACHE_VERSION}] Caching ${CORE_ASSETS.length} core assets...`);
             return Promise.allSettled(
                    CORE_ASSETS.map(url => cache.add(url).catch(err => { console.warn(`[SW] Failed cache: ${url}`, err); return Promise.resolve(); }))
             ).then((results) => {
                 const failedCount = results.filter(r => r.status === 'rejected').length;
                 console.log(`[SW ${CACHE_VERSION}] Assets cached ${failedCount > 0 ? `with ${failedCount} failures.` : 'successfully.'}`);
             });
        }).then(() => {
            console.log(`[SW ${CACHE_VERSION}] Installation successful. Activating immediately.`);
            return self.skipWaiting();
        }).catch(err => { console.error(`[SW ${CACHE_VERSION}] Installation failed:`, err); })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log(`[SW ${CACHE_VERSION}] Activate`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('soul-leveling-system-')) {
                        console.log(`[SW ${CACHE_VERSION}] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
             console.log(`[SW ${CACHE_VERSION}] Claiming clients.`);
             return self.clients.claim();
        }).catch(err => { console.error(`[SW ${CACHE_VERSION}] Activation failed:`, err); })
    );
});

// Fetch event: Cache-first strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(event.request);
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
                    const responseToCache = networkResponse.clone();
                    cache.put(event.request, responseToCache).catch(err => console.warn(`[SW] Failed to cache network response for ${event.request.url}`, err));
                }
                return networkResponse;
            }).catch(error => {
                console.warn(`[SW] Network fetch failed: ${event.request.url}`, error);
                // Only return error if cache miss AND network fail
                if (!cachedResponse) {
                     return new Response('Network error and not in cache.', { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain' } });
                }
                // Otherwise, ignore network error if we already served from cache
            });
            // Return cached response immediately if available, fall back to network fetch
            return cachedResponse || fetchPromise;
        })
    );
});