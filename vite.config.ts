import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/speed-api': {
        target: 'https://speedapi-budgetgensys-grgacxg8grhvh2cs.uaenorth-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/speed-api/, '/api'),
      },
      '/cxpulse-api': {
        target: 'https://cxpulse.agmcgroup.ae',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/cxpulse-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.setHeader('Host', 'cxpulse.agmcgroup.ae');
            proxyReq.setHeader('User-Agent', 'PostmanRuntime/7.39.0');
          });
        },
      },
    },
  },
});
