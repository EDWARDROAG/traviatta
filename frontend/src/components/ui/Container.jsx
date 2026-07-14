/**
 * ======================================================
 * ARCHIVO: Container.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/Container.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de contenedor responsive con padding consistente.
 *
 * 🎨 VARIANTES:
 * - default: Contenedor estándar (max-w-7xl)
 * - sm: Contenedor pequeño (max-w-3xl)
 * - lg: Contenedor grande (max-w-8xl)
 * - full: Contenedor sin límite de ancho
 * ======================================================
 */

import React from 'react';

const Container = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    sm: 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',
    lg: 'max-w-8xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4 sm:px-6 lg:px-8',
  };
  
  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Container;