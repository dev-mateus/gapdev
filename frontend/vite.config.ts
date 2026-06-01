import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {                                           // ← ADICIONA DAQUI
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },                                                  // ← ATÉ AQUI
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})