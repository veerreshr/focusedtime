/* --- Placeholder for Service Worker --- */
/*
 * src/service-worker.ts (or similar, depending on PWA plugin)
 * This file would contain the logic for caching assets and potentially handling
 * background sync or push notifications (if using Workbox or similar).
 *
 * Example using Workbox (requires vite-plugin-pwa setup):
 */
/*
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache all assets specified in the Workbox manifest
// The 'self.__WB_MANIFEST' variable is injected by the build process (vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache Google Fonts webfont files with a cache-first strategy for 1 year.
registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
        maxEntries: 30,
      }),
    ],
  })
);

// Example: Cache API responses (if you had an API)
// registerRoute(
//   ({url}) => url.pathname.startsWith('/api/'),
//   new NetworkFirst({ // Or CacheFirst, StaleWhileRevalidate depending on needs
//     cacheName: 'api-cache',
//     plugins: [
//       new ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 5 * 60, // 5 minutes
//       }),
//     ],
//   })
// );

// Basic offline fallback for navigation requests (optional)
// import { warmStrategyCache } from 'workbox-recipes';
// import { offlineFallback } from 'workbox-recipes';
//
// const strategy = new CacheFirst();
// const urls = ['/offline.html']; // You need to create an offline.html page
//
// warmStrategyCache({urls, strategy});
//
// offlineFallback({
//   pageFallback: '/offline.html',
// });


// Add event listeners for install, activate, fetch
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

*/