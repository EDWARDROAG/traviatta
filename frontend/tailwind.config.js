/**
 * ======================================================
 * ARCHIVO: tailwind.config.js
 * UBICACIÓN: menu-qr-system/frontend/tailwind.config.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 17:15
 *
 * 🎯 PROPÓSITO:
 * Configuración de Tailwind CSS para el frontend.
 * Define colores personalizados, extensiones de temas,
 * y plugins adicionales.
 *
 * 📦 DEPENDENCIAS:
 * - tailwindcss: Framework de estilos
 *
 * 🔗 RELACIONES:
 * - Importado por: postcss.config.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 17:15
 *    ✅ Creación inicial del archivo
 *    ✅ Colores personalizados
 *    ✅ Extensión de temas
 *    ✅ Configuración de contenido
 * ======================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          light: '#DCF8C6',
          dark: '#128C7E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};