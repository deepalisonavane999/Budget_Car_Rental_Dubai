import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env / .env.local
  const env = loadEnv(mode, process.cwd(), '');

  const speedApiKey = env.SPEED_API_KEY || env.VITE_API_KEY || '';
  const speedApiCode = env.SPEED_API_CODE || env.VITE_API_CODE || '';
  const cxpulseApiKey = env.CXPULSE_API_KEY || env.VITE_CXPULSE_API_KEY || '';

  return {
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
          rewrite: (p) => {
            let rewritten = p.replace(/^\/speed-api/, '/api');
            if (speedApiCode && !rewritten.includes('code=')) {
              rewritten += (rewritten.includes('?') ? '&' : '?') + `code=${encodeURIComponent(speedApiCode)}`;
            }
            return rewritten;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (speedApiKey && !proxyReq.getHeader('ApiKey')) {
                proxyReq.setHeader('ApiKey', speedApiKey);
              }
            });
          },
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
              if (cxpulseApiKey && !proxyReq.getHeader('X-API-Key')) {
                proxyReq.setHeader('X-API-Key', cxpulseApiKey);
              }
            });
          },
        },
      },
    },
  };
});
