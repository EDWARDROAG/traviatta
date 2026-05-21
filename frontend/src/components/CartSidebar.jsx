/**
 * ======================================================
 * ARCHIVO: CartSidebar.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/CartSidebar.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 15:00
 *
 * 🎯 PROPÓSITO:
 * Barra lateral fija que muestra el carrito de compras
 * en pantallas grandes (tablet/desktop). Para móviles
 * se muestra como flotante o se oculta.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 *
 * 🔗 RELACIONES:
 * - Importado por: MenuPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 15:00
 *    ✅ Creación inicial del archivo
 *    ✅ Layout de dos columnas para desktop
 *    ✅ Resumen del pedido
 *    ✅ Modificación de cantidades
 *    ✅ Botón de checkout
 *    ✅ Responsive: visible solo en desktop
 * ======================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartSidebar({ items, updateQuantity, removeItem, getTotal, getItemCount }) {
  const navigate = useNavigate();

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="hidden lg:block sticky top-24 bg-white rounded-lg shadow p-6 h-fit">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
          <p className="text-gray-400 text-xs mt-1">Agrega productos del menú</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block sticky top-24 bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-orange-600 text-white">
        <h3 className="font-semibold">Mi Pedido</h3>
        <p className="text-sm opacity-90">{getItemCount()} productos</p>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {items.map((item) => {
          const itemTotal = item.price * item.quantity;
          const modifiersTotal = (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0) * item.quantity;
          const finalTotal = itemTotal + modifiersTotal;

          return (
            <div key={item.id} className="border-b border-gray-100 pb-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {item.modifiers.map(m => `+ ${m.name}`).join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-medium text-orange-600 text-sm">${finalTotal.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-sm"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${getTotal().toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>+ Envío</span>
          <span>Se calculará al finalizar</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition"
        >
          Proceder al pago
        </button>
      </div>
    </div>
  );
}

export default CartSidebar;