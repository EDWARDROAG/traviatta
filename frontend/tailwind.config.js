/**
 * ======================================================
 * ARCHIVO: tailwind.config.js
 * UBICACIÓN: menu-qr-system/frontend/tailwind.config.js
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Configuración de Tailwind CSS con la paleta de colores
 * personalizada de Traviatta Pizza Gourmet.
 *
 * 🎨 PALETA:
 * - cream: Fondo cálido (#F5F1EA)
 * - sand: Acentos suaves (#D8CBB8)
 * - terracotta: Color principal (#B56E4A)
 * - walnut: Detalles madera (#9B6B43)
 * - charcoal: Textos (#1F1F1F)
 * - stone: Bordes (#D9D6D2)
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 2.0 - 2026-05-24
 *    ✅ Agregada paleta completa Traviatta
 *    ✅ Agregadas sombras personalizadas
 *    ✅ Agregadas animaciones premium
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 17:15
 *    ✅ Creación inicial del archivo
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
        // Paleta Traviatta - Colores cálidos y orgánicos
        cream: {
          50: '#FDFBF7',
          100: '#F5F1EA',
          200: '#EBE4D9',
          300: '#E0D7C8',
          400: '#D6CAB7',
          500: '#CBBDA6',
          DEFAULT: '#F5F1EA',
        },
        sand: {
          50: '#F5F0EA',
          100: '#E8E0D4',
          200: '#D8CBB8',
          300: '#C8B69C',
          400: '#B8A180',
          500: '#A88C64',
          DEFAULT: '#D8CBB8',
        },
        terracotta: {
          50: '#FDF2ED',
          100: '#F9E0D4',
          200: '#F0C4B0',
          300: '#E5A48A',
          400: '#D68464',
          500: '#B56E4A',
          600: '#9B5A3D',
          700: '#814630',
          DEFAULT: '#B56E4A',
        },
        walnut: {
          50: '#F5EFE8',
          100: '#E8DDD1',
          200: '#D1BFA8',
          300: '#BAA17F',
          400: '#A38356',
          500: '#9B6B43',
          600: '#7D5536',
          700: '#5F3F29',
          DEFAULT: '#9B6B43',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#333333',
          600: '#1F1F1F',
          700: '#141414',
          800: '#0A0A0A',
          DEFAULT: '#1F1F1F',
        },
        stone: {
          50: '#FDFDFC',
          100: '#F2F0EC',
          200: '#D9D6D2',
          300: '#C0BBB4',
          400: '#A7A096',
          500: '#8E8578',
          DEFAULT: '#D9D6D2',
        },
        // Mantener colores legacy para compatibilidad
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
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 8px 30px rgba(181, 110, 74, 0.08)',
        'card': '0 8px 40px rgba(0, 0, 0, 0.04)',
        'hover': '0 12px 48px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '4xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
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