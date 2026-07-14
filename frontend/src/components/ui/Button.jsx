/**
 * ======================================================
 * ARCHIVO: Button.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/Button.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de botón reutilizable con variantes premium.
 * Soporta primary, secondary, text, outline.
 *
 * 🎨 VARIANTES:
 * - primary: Botón principal terracota
 * - secondary: Botón outline con borde terracota
 * - text: Botón estilo texto
 * - outline: Botón con borde gris
 *
 * 📦 PROPS:
 * - variant: 'primary' | 'secondary' | 'text' | 'outline'
 * - size: 'sm' | 'md' | 'lg'
 * - fullWidth: boolean
 * - icon: componente de icono (opcional)
 * - iconPosition: 'left' | 'right'
 * - isLoading: boolean
 * ======================================================
 */

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-terracotta text-white hover:bg-terracotta-dark hover:-translate-y-0.5 shadow-warm',
    secondary: 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white hover:-translate-y-0.5',
    text: 'text-terracotta hover:text-terracotta-dark hover:translate-x-1',
    outline: 'bg-transparent border border-stone text-charcoal hover:border-terracotta hover:text-terracotta',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-full',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </div>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 mr-2" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 ml-2" />}
        </>
      )}
    </button>
  );
};

export default Button;