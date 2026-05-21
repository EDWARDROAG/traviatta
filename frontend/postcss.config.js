/**
 * ======================================================
 * ARCHIVO: postcss.config.js
 * UBICACIÓN: menu-qr-system/frontend/postcss.config.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 17:20
 *
 * 🎯 PROPÓSITO:
 * Configuración de PostCSS para procesar Tailwind CSS
 * y autoprefixer. Transforma las directivas de Tailwind
 * en CSS estándar.
 *
 * 📦 DEPENDENCIAS:
 * - tailwindcss: Framework de estilos
 * - autoprefixer: Prefixes automáticos
 *
 * 🔗 RELACIONES:
 * - Importado por: vite.config.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 17:20
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de tailwindcss
 *    ✅ Configuración de autoprefixer
 * ======================================================
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};