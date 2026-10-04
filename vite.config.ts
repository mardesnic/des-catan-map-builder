import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/des-catan-map-builder/',
  plugins: [
    react(),
    // Installable from the browser menu, and works offline once loaded.
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      // Include the tile images, so the board still draws offline.
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'] },
      manifest: {
        name: 'Catan Map',
        short_name: 'Map',
        description: 'Random, balanced Catan board generator',
        theme_color: '#2a6f97',
        background_color: '#f3ede1',
        display: 'standalone',
      },
    }),
  ],
});
