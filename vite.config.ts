import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Allow configuring the base path for GitHub Pages or other subpath deployments
const basePath = process.env.BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
