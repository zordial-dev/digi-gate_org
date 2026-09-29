import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  envPrefix: ['VITE_', 'API_', 'USER_'],
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/selfies': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/logos': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/hosts': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/profiles': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
