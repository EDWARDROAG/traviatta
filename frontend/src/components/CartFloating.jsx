/**
 * ======================================================
 * ARCHIVO: CartFloating.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/CartFloating.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 14:45
 *
 * 🎯 PROPÓSITO:
 * Componente flotante que muestra un resumen del carrito
 * en la parte inferior de la pantalla mientras el usuario
 * navega por el menú. Permite ver items, modificar
 * cantidades y proceder al checkout.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx, TableMenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 14:45
 *    ✅ Creación inicial del archivo
 *    ✅ Vista expandible del carrito
 *    ✅ Modificación de cantidades
 *    ✅ Eliminación de items
 *    ✅ Total visible siempre
 *    ✅ Botón para proceder al checkout
 * ======================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* Carrito colapsado */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white border-t border-gray-200 shadow-lg py-3 px-4 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {itemCount}
            </div>
            <span className="font-medium text-gray-800">Ver pedido</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-orange-600">${total.toLocaleString()}</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Carrito expandido */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Mi pedido ({itemCount} productos)</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Lista de items */}
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              const modifiersTotal = (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0) * item.quantity;
              const finalTotal = itemTotal + modifiersTotal;

              return (
                <div key={item.id} className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.modifiers.map(m => `+ ${m.name}`).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">${item.price.toLocaleString()} c/u</p>
                    </div>
                    <p className="font-medium text-orange-600">${finalTotal.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales y checkout */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${total.toLocaleString()}</span>
            </div>
            {showDeliveryInfo && (
              <div className="flex justify-between mb-3 text-sm text-gray-500">
                <span>+ Envío</span>
                <span>Se calculará al finalizar</span>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : checkoutText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartFloating;