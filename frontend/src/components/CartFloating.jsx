/**
 * ======================================================
 * ARCHIVO: CartFloating.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/CartFloating.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Componente flotante que muestra un resumen del carrito.
 * Diseño elegante con bordes redondeados, sombras cálidas
 * y transiciones suaves. Representa la estética premium del restaurante.
 *
 * 🎨 MEJORAS VISUALES:
 * - Fondo blanco con bordes redondeados orgánicos
 * - Sombra cálida en lugar de gris genérica
 * - Botón de checkout en terracota (color principal)
 * - Iconos y tipografía mejorados
 * - Indicador de cantidad con diseño circular elegante
 * - Transiciones suaves en hover y expansión
 * ======================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

function CartFloating({ 
  itemCount, 
  total, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout,
  isSubmitting = false,
  checkoutText = "Ir a pagar",
  showDeliveryInfo = true
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-pb">
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white/95 backdrop-blur-sm border-t border-stone/30 shadow-warm py-3.5 sm:py-4 px-4 sm:px-5 flex justify-between items-center transition-all duration-300 hover:bg-white min-h-[56px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <ShoppingBagIcon className="w-6 h-6 text-terracotta" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-terracotta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-medium text-charcoal text-sm sm:text-base truncate">Ver pedido</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-heading text-lg sm:text-xl font-bold text-terracotta">
              {formatCurrency(total)}
            </span>
            <ChevronUpIcon className="w-5 h-5 text-stone" />
          </div>
        </button>
      )}

      {isExpanded && (
        <div className="bg-white shadow-2xl rounded-t-3xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-stone/30 shrink-0">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-semibold text-charcoal">
                Mi pedido
              </h3>
              <p className="text-sm text-stone mt-0.5">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full hover:bg-stone/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Cerrar pedido"
            >
              <ChevronDownIcon className="w-5 h-5 text-stone" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              const modifiersTotal =
                (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0) *
                item.quantity;
              const finalTotal = itemTotal + modifiersTotal;

              return (
                <div
                  key={`${item.id}-${JSON.stringify(item.modifiers)}`}
                  className="p-4 sm:p-5 border-b border-stone/20 hover:bg-cream/30 transition-smooth"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-medium text-charcoal">{item.name}</h4>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-xs text-stone mt-0.5">
                          {item.modifiers.map((m) => `+ ${m.name}`).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-stone mt-1">
                        {formatCurrency(item.price)} c/u
                      </p>
                    </div>
                    <p className="font-heading font-semibold text-terracotta shrink-0">
                      {formatCurrency(finalTotal)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 border border-stone/40 rounded-full">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal hover:bg-cream transition-smooth"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal hover:bg-cream transition-smooth"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-stone hover:text-terracotta transition-smooth p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Eliminar producto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 border-t border-stone/30 bg-cream/30 shrink-0">
            <div className="flex justify-between mb-2">
              <span className="text-stone">Subtotal</span>
              <span className="font-medium text-charcoal">{formatCurrency(total)}</span>
            </div>
            {showDeliveryInfo && (
              <div className="flex justify-between mb-4 text-sm text-stone">
                <span>Envío</span>
                <span>Se calculará al finalizar</span>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || itemCount === 0}
              className={`w-full btn-primary py-3.5 text-base font-semibold min-h-[48px] ${
                isSubmitting || itemCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                `${checkoutText} • ${formatCurrency(total)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartFloating;