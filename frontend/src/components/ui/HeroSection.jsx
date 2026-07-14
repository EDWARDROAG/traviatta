/**
 * ======================================================
 * ARCHIVO: HeroSection.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ui/HeroSection.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de héroe para la página principal.
 * Incluye imagen de fondo, título, subtítulo y botones de acción.
 *
 * 🎨 USO:
 * <HeroSection
 *   title="Traviatta Pizza Gourmet"
 *   subtitle="Una experiencia culinaria única"
 *   backgroundImage="/src/assets/img/salon_01.jpeg"
 *   primaryButtonText="Ver menú"
 *   primaryButtonLink="/menu"
 *   secondaryButtonText="Reservar"
 *   secondaryButtonLink="/reservas"
 * />
 * ======================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const HeroSection = ({ 
  title,
  subtitle,
  backgroundImage,
  videoSrc,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            filter: 'brightness(0.65)'
          }}
        />
      )}
      
      {/* Overlay cálido */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/30 to-transparent" />
      
      {/* Contenido */}
      <div className="relative container-premium text-center text-white z-10 animate-fade-in-up">
        <span className="inline-block text-sm tracking-wider uppercase mb-4 opacity-90 font-medium">
          Bienvenidos a
        </span>
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButtonText && primaryButtonLink && (
            <Link to={primaryButtonLink}>
              <Button variant="primary" size="lg">
                {primaryButtonText}
              </Button>
            </Link>
          )}
          {secondaryButtonText && secondaryButtonLink && (
            <Link to={secondaryButtonLink}>
              <Button variant="secondary" size="lg">
                {secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;