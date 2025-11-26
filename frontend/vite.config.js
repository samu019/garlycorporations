import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  base: './',
  // AGREGAR ESTA SECCIÓN PARA PERMITIR EL HOST EN PREVIEW
  preview: {
    allowedHosts: ['garlycorporations-frontend-app.onrender.com']
  }
})
