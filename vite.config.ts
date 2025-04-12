import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA({ // Example PWA config
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    //   manifest: {
    //     name: 'FocusedTime',
    //     short_name: 'FocusedTime',
    //     description: 'Track your focus hours.',
    //     theme_color: '#FFF', 
    //     icons: [
    //       { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    //       { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    //       // Add maskable icon if available
    //     ]
    //   },
    //   workbox: {
    //      globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // Files to precache
    //      // Define custom service worker logic if needed (e.g., src/service-worker.ts)
    //      // swSrc: 'src/service-worker.ts',
    //   }
    // })
  ],
   server: {
     port: 3000,
   },
   build: {
     outDir: 'build',
   }
})