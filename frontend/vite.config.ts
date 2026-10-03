import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

export default defineConfig(({ mode }: { mode: string }): UserConfig => {
  const environment: Record<string, string> = loadEnv(mode, process.cwd(), '');
  const proxyTarget: string =
    environment['API_PROXY_TARGET'] ?? 'http://127.0.0.1:8000';
  const proxyUrl: URL = new URL(proxyTarget);

  if (!['http:', 'https:'].includes(proxyUrl.protocol)) {
    throw new Error('API_PROXY_TARGET must be an HTTP or HTTPS URL.');
  }

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: environment['VITE_USE_POLLING'] === 'true',
      },
    },
  };
});
