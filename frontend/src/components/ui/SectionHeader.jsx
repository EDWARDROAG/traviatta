/**
 * ======================================================
 * ARCHIVO: SectionHeader.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/SectionHeader.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de encabezado de sección con estilo editorial.
 * Incluye título, subtítulo y separador orgánico.
 *
 * 🎨 USO:
 * <SectionHeader 
 *   title="Nuestro Menú"
 *   subtitle="Sabores que enamoran"
 *   align="center"
 * />
 * ======================================================
 */

import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle, 
  align = 'center',
  showSeparator = true,
  className = '' 
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <div className={`mb-12 ${alignClasses[align]} ${className}`}>
      {subtitle && (
        <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
          {subtitle}
        </span>
      )}
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2">
        {title}
      </h2>
      {showSeparator && (
        <div className={`separator-organic mt-4 ${align === 'center' ? 'mx-auto' : 'ml-0'}`} />
      )}
    </div>
  );
};

export default SectionHeader;