import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'

const root = path.dirname(fileURLToPath(import.meta.url))

/**
 * The React single page application is built straight into the Laravel
 * `public/build` folder so the Blade shell can load it with @vite.
 *
 * Development : `npm run dev`  -> http://localhost:5173 (proxies /api to Laravel)
 * Production  : `npm run build` -> backend/public/build
 */
export default defineConfig({
  plugins: [
    laravel({
      publicDirectory: path.resolve(root, '../backend/public'),
      buildDirectory: 'build',
      hotFile: path.resolve(root, '../backend/public/hot'),
      input: {
        'src/main.jsx': path.resolve(root, 'src/main.jsx'),
        'src/styles/index.css': path.resolve(root, 'src/styles/index.css'),
      },
      refresh: true,
    }),
    react(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.resolve(root, '../backend/public/build'),
    emptyOutDir: true,
    manifest: 'manifest.json',
  },
})
