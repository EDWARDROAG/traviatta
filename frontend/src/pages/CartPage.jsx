/**
 * ======================================================
 * ARCHIVO: CartPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/CartPage.jsx
 * FASE: UI/UX Premium
 * VERSIÓN: 2.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-24
 * ======================================================
 * 🎯 PROPÓSITO:
 * Página que muestra el carrito de compras con detalle
 * de productos, cantidades, modificadores, subtotales,
 * y opciones para continuar al checkout o seguir comprando.
 *
 * 🎨 MEJORAS VISUALES:
 * - Fondo crema cálido
 * - Tarjetas con sombras suaves y bordes orgánicos
 * - Tipografía Playfair Display para títulos
 * - Botones rediseñados con paleta Traviatta
 * - Animaciones suaves en hover
 * - Formato de moneda consistente
 * ======================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCart();
  
  const deliveryCost = 5000;
  const freeDeliveryMinAmount = 35000;
  const subtotal = getTotal();
  const isFreeDelivery = subtotal >= freeDeliveryMinAmount;
  const finalDeliveryCost = isFreeDelivery ? 0 : deliveryCost;
  const total = subtotal + finalDeliveryCost;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center px-4 animate-fade-in">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-heading text-2xl font-semibold text-charcoal mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-stone mb-6">
            Agrega productos desde el menú para comenzar
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Ver menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-premium max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn-text"
          >
            ← Seguir comprando
          </button>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal">
            Mi Pedido
          </h1>
          <button
            onClick={clearCart}
            className="text-stone text-sm hover:text-terracotta transition-smooth"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Lista de productos */}
        <div className="space-y-4 mb-8">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            const modifiersTotal = (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0) * item.quantity;
            const finalItemTotal = itemTotal + modifiersTotal;

            return (
              <div key={item.id} className="card-premium p-4 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-charcoal">
                      {item.name}
                    </h3>
                    
                    {/* Modificadores */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.modifiers.map((mod, idx) => (
                          <span key={idx} className="text-xs text-stone block">
                            + {mod.name} ({formatCurrency(mod.price)})
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-stone mt-1">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-heading font-semibold text-terracotta">
                      {formatCurrency(finalItemTotal)}
                    </p>
                  </div>
                </div>
                
                {/* Controles de cantidad */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone/20">
                  <div className="flex items-center gap-1 border border-stone/40 rounded-full">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal hover:bg-cream transition-smooth"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal hover:bg-cream transition-smooth"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-stone text-sm hover:text-terracotta transition-smooth"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de totales */}
        <div className="card-premium p-6 mb-8">
          <h3 className="font-heading text-lg font-semibold text-charcoal mb-4">
            Resumen
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-stone">
              <span>Subtotal ({getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'})</span>
              <span className="text-charcoal">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Costo de envío</span>
              {isFreeDelivery ? (
                <span className="text-green-600 text-sm font-medium">¡Gratis!</span>
              ) : (
                <span className="text-charcoal">{formatCurrency(deliveryCost)}</span>
              )}
            </div>
            {!isFreeDelivery && subtotal > 0 && (
              <div className="text-sm text-stone bg-cream p-3 rounded-xl">
                💡 Agrega {formatCurrency(freeDeliveryMinAmount - subtotal)} más para envío gratis
              </div>
            )}
            <div className="flex justify-between font-heading text-xl font-bold pt-3 border-t border-stone/20">
              <span>Total</span>
              <span className="text-terracotta">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            className="btn-primary w-full py-3.5 text-base font-semibold"
          >
            Continuar con el pedido • {formatCurrency(total)}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary w-full py-3.5 text-base font-medium"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;