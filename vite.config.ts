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
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/selfies': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/logos': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/profiles': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null),
      },
    },
  },
});
