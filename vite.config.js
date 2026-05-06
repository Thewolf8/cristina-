import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cristina-/',
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 3000,
  },
})
