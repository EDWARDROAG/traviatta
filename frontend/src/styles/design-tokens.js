/**
 * ======================================================
 * ARCHIVO: design-tokens.js
 * UBICACIÓN: menu-qr-system/frontend/src/styles/design-tokens.js
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Tokens de diseño centralizados para mantener consistencia
 * visual en toda la aplicación. Incluye colores, tipografía,
 * espaciado, sombras, bordes y animaciones.
 *
 * 🎨 USO:
 * import { colors, typography, spacing } from '../styles/design-tokens';
 * ======================================================
 */

// ======================================================
// PALETA DE COLORES - TRAVIATTA
// ======================================================

export const colors = {
  // Colores base - Paleta cálida
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
  white: '#FFFFFF',
  black: '#000000',
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// ======================================================
// TIPOGRAFÍA
// ======================================================

export const typography = {
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ======================================================
// ESPACIADO
// ======================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

// ======================================================
// BORDES
// ======================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
  full: '9999px',
};

// ======================================================
// SOMBRAS
// ======================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
  warm: '0 8px 30px rgba(181, 110, 74, 0.08)',
  card: '0 8px 40px rgba(0, 0, 0, 0.04)',
  hover: '0 12px 48px rgba(0, 0, 0, 0.08)',
  none: 'none',
};

// ======================================================
// ANIMACIONES
// ======================================================

export const animation = {
  durations: {
    fastest: '150ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '500ms',
    slowest: '700ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    gentle: 'cubic-bezier(0.45, 0, 0.55, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    slideInLeft: {
      from: { opacity: 0, transform: 'translateX(-30px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(30px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-8px)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
  },
};

// ======================================================
// BREAKPOINTS
// ======================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ======================================================
// Z-INDEX
// ======================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ======================================================
// EXPORTAR TODO
// ======================================================

const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
};

export default designTokens;