/**
 * ======================================================
 * ARCHIVO: CheckoutPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/CheckoutPage.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 13:45
 *
 * 🎯 PROPÓSITO:
 * Página de checkout donde el cliente ingresa sus datos
 * de contacto y dirección, revisa el resumen del pedido
 * y envía todo automáticamente por WhatsApp al restaurante.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - ../hooks/useCart: Manejo del carrito
 * - ../services/whatsapp: Envío a WhatsApp
 * - ../services/api: Verificación de domicilio
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 * - Importa hooks y servicios
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 13:45
 *    ✅ Creación inicial del archivo
 *    ✅ Formulario de datos del cliente
 *    ✅ Resumen del pedido
 *    ✅ Verificación de domicilio
 *    ✅ Envío a WhatsApp
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { sendOrderToWhatsApp } from '../services/whatsapp';
import { checkDeliveryCoverage } from '../services/api';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
    payment_method: 'cash',
  });

  const branch = location.state?.branch;
  const total = getTotal();
  const deliveryCost = deliveryInfo?.cost || 0;
  const finalTotal = total + deliveryCost;

  useEffect(() => {
    if (items.length === 0) {
      navigate(-1);
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressBlur = async () => {
    if (!formData.delivery_address || !branch) return;
    
    try {
      const coverage = await checkDeliveryCoverage(branch.id, {
        address: formData.delivery_address,
      });
      setDeliveryInfo(coverage);
    } catch (error) {
      console.error('Error checking delivery coverage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    if (branch?.requires_delivery_address && !formData.delivery_address) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }

    setSubmitting(true);
    
    try {
      const orderData = {
        branch_name: branch?.name,
        branch_whatsapp: branch?.whatsapp_number,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers || [],
        })),
        subtotal: total,
        delivery_cost: deliveryCost,
        total: finalTotal,
        payment_method: formData.payment_method,
        notes: formData.notes,
      };
      
      const success = sendOrderToWhatsApp(orderData);
      
      if (success) {
        clearCart();
        alert('Pedido enviado correctamente. El restaurante te confirmará por WhatsApp.');
        navigate(`/${branch?.slug}/menu`);
      } else {
        alert('Error al enviar el pedido. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al enviar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Pedido</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario de datos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tus datos</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="3001234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de entrega
                </label>
                <input
                  type="text"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  onBlur={handleAddressBlur}
                  placeholder="Calle, número, barrio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
                {deliveryInfo && (
                  <p className={`text-xs mt-1 ${deliveryInfo.is_free ? 'text-green-600' : 'text-orange-600'}`}>
                    {deliveryInfo.is_free 
                      ? '✅ Envío gratis en esta zona' 
                      : `🚚 Costo de envío: $${deliveryInfo.cost.toLocaleString()}`
                    }
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de pago
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="cash">Efectivo contra entrega</option>
                  <option value="card">Tarjeta (datáfono)</option>
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas especiales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Sin cebolla, entrada por la calle 123, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </form>
          </div>
          
          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
            
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>{deliveryCost === 0 ? 'Gratis' : `$${deliveryCost.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">${finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Pedir por WhatsApp'}
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
            >
              ← Volver al menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;