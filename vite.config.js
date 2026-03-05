import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Split vendor chunk so React core is cached separately from app code.
    // This means returning visitors don't re-download React on every deploy.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'], // remove if not used
        },
      },
    },

    // Minify with terser for better dead-code elimination
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // removes console.log in production
        drop_debugger: true,
      },
    },

    // Warn if any single chunk exceeds 500KB
    chunkSizeWarningLimit: 500,
  },

  // Speed up local dev (optional but nice)
  server: {
    hmr: true,
  },
})