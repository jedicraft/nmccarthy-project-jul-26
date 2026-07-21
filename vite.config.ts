import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'assets/cards/logo.svg'],
      manifest: {
        name: 'Solitaire',
        short_name: 'Solitaire',
        description: 'Classic Klondike Solitaire',
        theme_color: '#1a6b3c',
        background_color: '#1a6b3c',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
