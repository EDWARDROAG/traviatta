/**
 * Contrato: Vite config — front en puerto libre; proxy API opcional.
 * Consumidores: npm run dev / build.
 */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/';
  /** 8080 suele estar ocupado; default 8081 */
  const frontendPort = Number(env.VITE_DEV_PORT || 8081);
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:3005';

  return {
    base,
    plugins: [react()],
    server: {
      port: frontendPort,
      strictPort: false,
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // No tumbar el front si el backend no está: el cliente usa menú estático
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.warn('[vite proxy]', err.code || err.message);
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'API no disponible' }));
              }
            });
          },
        },
      },
    },
    preview: {
      port: frontendPort,
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            state: ['zustand'],
            utils: ['axios', 'qrcode.react'],
          },
        },
      },
    },
  };
});
