/**
 * ======================================================
 * ARCHIVO: ProductCard.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/ProductCard.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente de tarjeta de producto premium para el menú digital.
 * Diseño editorial elegante que refleja la estética gourmet de Traviatta.
 *
 * 🎨 MEJORAS VISUALES:
 * - Tarjeta con sombra cálida y borde orgánico
 * - Imagen con efecto zoom suave al hover
 * - Tipografía elegante (Playfair Display para nombres)
 * - Badges con colores de la paleta Traviatta
 * - Botón de agregar rediseñado con hover elegante
 * - Transiciones suaves en todas las interacciones
 * ======================================================
 */

import React, { useState } from 'react';

function ProductCard({ product, onAddToCart, showDelivery = true }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [showModifiers, setShowModifiers] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasModifiers = product.modifiers && product.modifiers.length > 0;

  const handleAddToCart = () => {
    const modifiersList = Object.keys(selectedModifiers)
      .filter(key => selectedModifiers[key])
      .map(key => {
        const modifier = product.modifiers.find(m => m.name === key);
        return modifier;
      })
      .filter(m => m);

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      modifiers: modifiersList,
      image_url: product.image_url,
    });
    
    setQuantity(1);
    setSelectedModifiers({});
    setShowModifiers(false);
  };

  const toggleModifier = (modifierName) => {
    setSelectedModifiers(prev => ({
      ...prev,
      [modifierName]: !prev[modifierName]
    }));
  };

  const getModifiersTotal = () => {
    return Object.keys(selectedModifiers)
      .filter(key => selectedModifiers[key])
      .reduce((total, key) => {
        const modifier = product.modifiers.find(m => m.name === key);
        return total + (modifier?.price || 0);
      }, 0);
  };

  const basePrice = product.price || 0;
  const totalPrice = basePrice + getModifiersTotal();
  const finalPrice = totalPrice * quantity;
  const priceLabel = basePrice > 0 ? `$${basePrice.toLocaleString()}` : 'Consultar precio';
  const finalPriceLabel = finalPrice > 0 ? `$${finalPrice.toLocaleString()}` : 'Consultar precio';
  const canAddToCart = product.is_available && finalPrice > 0;

  // Determinar badge según tags
  const getBadge = () => {
    if (product.tags?.includes('popular')) {
      return { text: '🔥 Popular', className: 'badge-recommended' };
    }
    if (product.tags?.includes('nuevo')) {
      return { text: '✨ Nuevo', className: 'badge-new' };
    }
    if (product.tags?.includes('vegano')) {
      return { text: '🌱 Vegano', className: 'badge-vegetarian' };
    }
    if (product.is_spicy) {
      return { text: '🌶️ Picante', className: 'badge-spicy' };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div className="card-premium group">
      <div className="flex flex-col sm:flex-row">
        {/* Imagen del producto con efecto zoom */}
        {product.image_url && (
          <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden bg-cream">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        )}
        
        {/* Información del producto */}
        <div className="flex-1 p-4">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-charcoal">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-stone mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            <span className="font-heading text-xl font-bold text-terracotta whitespace-nowrap">
              {priceLabel}
            </span>
          </div>
          
          {/* Badge - usando sistema premium */}
          {badge && (
            <div className="mt-2">
              <span className={`badge-premium ${badge.className}`}>
                {badge.text}
              </span>
            </div>
          )}
          
          {/* Modificadores/extras */}
          {hasModifiers && (
            <div className="mt-3">
              <button
                onClick={() => setShowModifiers(!showModifiers)}
                className="text-xs text-terracotta hover:text-terracotta-dark transition-smooth flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showModifiers ? 'Ocultar extras' : 'Agregar extras'}
              </button>
              
              {showModifiers && (
                <div className="mt-2 space-y-1.5 bg-cream/50 rounded-xl p-3 animate-fade-in">
                  {product.modifiers.map((modifier) => (
                    <label key={modifier.name} className="flex items-center justify-between text-sm cursor-pointer hover:bg-cream p-1 rounded-lg transition">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedModifiers[modifier.name]}
                          onChange={() => toggleModifier(modifier.name)}
                          className="w-4 h-4 rounded border-stone text-terracotta focus:ring-terracotta focus:ring-offset-0"
                        />
                        <span className="text-charcoal">{modifier.name}</span>
                      </div>
                      <span className="text-terracotta text-sm font-medium">
                        +${modifier.price.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Control de cantidad y botón agregar */}
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-stone/30 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-stone text-charcoal hover:border-terracotta hover:text-terracotta transition-smooth flex items-center justify-center"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="w-8 text-center font-medium text-charcoal">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-stone text-charcoal hover:border-terracotta hover:text-terracotta transition-smooth flex items-center justify-center"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
            
            {!product.is_available ? (
              <span className="text-terracotta text-sm font-medium">No disponible</span>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`btn-primary text-sm px-4 sm:px-5 py-2.5 min-h-[44px] flex-1 sm:flex-none max-w-full ${!canAddToCart ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Agregar {finalPriceLabel !== priceLabel && `• ${finalPriceLabel}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;