/**
 * ======================================================
 * ARCHIVO: CartPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/CartPage.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 14:15
 *
 * 🎯 PROPÓSITO:
 * Página que muestra el carrito de compras con detalle
 * de productos, cantidades, modificadores, subtotales,
 * y opciones para continuar al checkout o seguir comprando.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - ../hooks/useCart: Manejo del carrito
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 14:15
 *    ✅ Creación inicial del archivo
 *    ✅ Lista de productos en carrito
 *    ✅ Modificación de cantidades
 *    ✅ Eliminación de productos
 *    ✅ Cálculo de totales
 *    ✅ Navegación a checkout
 * ======================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCart();
  
  const deliveryCost = 3000;
  const subtotal = getTotal();
  const total = subtotal + deliveryCost;

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Agrega productos desde el menú para comenzar</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            Ver menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Seguir comprando
          </button>
          <h1 className="text-xl font-bold text-gray-800">Mi Pedido</h1>
          <button
            onClick={clearCart}
            className="text-red-500 text-sm hover:text-red-700"
          >
            Vaciar
          </button>
        </div>

        {/* Lista de productos */}
        <div className="space-y-4 mb-6">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            const modifiersTotal = (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0) * item.quantity;
            const finalItemTotal = itemTotal + modifiersTotal;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    
                    {/* Modificadores */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-1">
                        {item.modifiers.map((mod, idx) => (
                          <span key={idx} className="text-xs text-gray-500 block">
                            + {mod.name} (${mod.price.toLocaleString()})
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Precio unitario */}
                    <p className="text-xs text-gray-400 mt-1">
                      ${item.price.toLocaleString()} c/u
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-orange-600">
                      ${finalItemTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Controles de cantidad */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de totales */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({getItemCount()} productos)</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Costo de envío</span>
              <span>${deliveryCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-600">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Continuar con el pedido
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;