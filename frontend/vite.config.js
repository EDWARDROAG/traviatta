/**
 * ======================================================
 * ARCHIVO: vite.config.js
 * UBICACIÓN: menu-qr-system/frontend/vite.config.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 12:15
 *
 * 🎯 PROPÓSITO:
 * Configuración de Vite para el frontend del menú digital.
 * Define el plugin de React, el servidor de desarrollo,
 * y la configuración de build para producción.
 *
 * 📦 DEPENDENCIAS:
 * - @vitejs/plugin-react: Soporte JSX y Fast Refresh
 * - vite: Build tool principal
 *
 * 🔗 RELACIONES:
 * - Importado por: package.json (scripts)
 * - Utilizado en: desarrollo y build
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 12:15
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de plugin React
 *    ✅ Proxy para API en desarrollo
 *    ✅ Configuración de puerto alternativo
 * ======================================================
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
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
});