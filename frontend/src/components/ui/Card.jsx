/**
 * ======================================================
 * ARCHIVO: Card.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/Card.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de tarjeta reutilizable con variantes premium.
 *
 * 🎨 VARIANTES:
 * - default: Tarjeta estándar con sombra
 * - interactive: Tarjeta con hover elevate
 * - product: Tarjeta para productos del menú
 *
 * 📦 COMPOSICIÓN:
 * - Card
 * - CardHeader
 * - CardBody
 * - CardFooter
 * ======================================================
 */

import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  interactive = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-2xl overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'shadow-card',
    interactive: 'shadow-card hover:shadow-hover hover:-translate-y-1 cursor-pointer',
    product: 'shadow-card hover:shadow-hover hover:-translate-y-1',
  };
  
  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${interactive ? 'cursor-pointer hover:shadow-hover hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-0 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

export default Card;