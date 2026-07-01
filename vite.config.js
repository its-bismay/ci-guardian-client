import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/github': 'http://localhost:8000',
      '/webhooks': 'http://localhost:8000',
      '/runs': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/notifications': 'http://localhost:8000',
      '/events': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
});
