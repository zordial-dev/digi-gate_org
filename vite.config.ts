import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  envPrefix: ['VITE_', 'API_'],
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/public': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/selfies': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/logos': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/hosts': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/profiles': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://digi-gate-backend.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
