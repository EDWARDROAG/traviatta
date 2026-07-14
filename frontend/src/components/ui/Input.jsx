/**
 * ======================================================
 * ARCHIVO: Input.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/Input.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de input reutilizable con variantes premium.
 *
 * 🎨 VARIANTES:
 * - default: Input estándar
 * - textarea: Área de texto
 * - search: Input con ícono de búsqueda
 *
 * 📦 PROPS:
 * - label: Texto del label
 * - error: Mensaje de error
 * - icon: Ícono a la izquierda
 * - required: Campo requerido
 * ======================================================
 */

import React from 'react';

const Input = ({ 
  label,
  type = 'text',
  variant = 'default',
  error,
  icon: Icon,
  required = false,
  className = '',
  id,
  ...props 
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  
  const baseStyles = 'w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none';
  
  const variants = {
    default: `${baseStyles} border-stone focus:border-terracotta focus:ring-2 focus:ring-terracotta/10`,
    textarea: `${baseStyles} border-stone focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 resize-y min-h-[100px]`,
    search: `${baseStyles} border-stone focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 pl-11`,
  };
  
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-charcoal mb-2">
          {label}
          {required && <span className="text-terracotta ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && variant === 'search' && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone" />
        )}
        {variant === 'textarea' ? (
          <textarea
            id={inputId}
            className={`${variants[variant]} ${errorStyles} ${className}`}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={`${variants[variant]} ${errorStyles} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;