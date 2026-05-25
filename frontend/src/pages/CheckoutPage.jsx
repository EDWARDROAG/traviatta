/**
 * ======================================================
 * ARCHIVO: CheckoutPage.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/pages/CheckoutPage.jsx
 * FASE: F1
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-22 16:00
 *
 * 🎯 PROPÓSITO:
 * Página de checkout donde el cliente ingresa sus datos
 * de contacto y dirección, revisa el resumen del pedido
 * y lo envía al backend. El backend crea el pedido y
 * luego se abre WhatsApp para confirmación.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-router-dom: Navegación
 * - ../hooks/useCart: Manejo del carrito
 * - ../services/api: createOrder
 * - ../services/whatsapp: sendWhatsAppMessage
 *
 * 🔗 RELACIONES:
 * - Es importado por: App.jsx
 * - Importa hooks y servicios
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2024-05-22 16:00
 *    ✅ Corregido: Ahora llama a createOrder del backend
 *    ✅ Corregido: Payload con branch_id, product_id
 *    ✅ Corregido: order_type y delivery_address
 *    ✅ Mejorado: Manejo de errores y loading
 *    ✅ Mejorado: Fallback de WhatsApp
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 13:45
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { createOrder } from '../services/api';
import { sendWhatsAppMessage, formatCurrency } from '../services/whatsapp';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
    payment_method: 'cash',
    order_type: 'delivery', // delivery, pickup, table
  });

  const branch = location.state?.branch;
  const branchWhatsapp = branch?.whatsapp_number || branch?.phone;
  const total = getTotal();
  const deliveryCost = deliveryInfo?.cost || 0;
  const finalTotal = total + deliveryCost;

  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      navigate(-1);
    }
  }, [items, navigate, orderCreated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressBlur = async () => {
    if (!formData.delivery_address || !branch?.id || formData.order_type !== 'delivery') return;
    
    try {
      // TODO: Implementar checkDeliveryCoverage si está disponible
      // Por ahora, asumimos cobertura con costo base
      setDeliveryInfo({
        cost: 3000,
        is_free: false,
        is_covered: true,
      });
    } catch (error) {
      console.error('Error checking delivery coverage:', error);
    }
  };

  // Generar mensaje de WhatsApp para el restaurante
  const generateWhatsAppMessage = (orderResponse) => {
    const orderNumber = orderResponse.order_number || orderResponse.id;
    const itemsList = items.map(item => {
      const itemTotal = item.price * item.quantity;
      return `${item.quantity}x ${item.name} - ${formatCurrency(itemTotal)}`;
    }).join('\n');

    let message = `🍽️ *NUEVO PEDIDO #${orderNumber}* 🍽️\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *Cliente:* ${formData.customer_name}\n`;
    message += `📞 *Teléfono:* ${formData.customer_phone}\n`;
    
    if (formData.order_type === 'delivery' && formData.delivery_address) {
      message += `🏠 *Dirección:* ${formData.delivery_address}\n`;
    } else if (formData.order_type === 'pickup') {
      message += `📦 *Tipo:* Recoger en local\n`;
    }
    
    message += `\n📋 *DETALLE DEL PEDIDO:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${itemsList}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *Subtotal:* ${formatCurrency(total)}\n`;
    
    if (deliveryCost > 0) {
      message += `🚚 *Envío:* ${formatCurrency(deliveryCost)}\n`;
    } else {
      message += `🚚 *Envío:* GRATIS\n`;
    }
    
    message += `💰 *TOTAL:* ${formatCurrency(finalTotal)}\n\n`;
    message += `💳 *Pago:* ${getPaymentMethodName(formData.payment_method)}\n\n`;
    
    if (formData.notes) {
      message += `📝 *Notas:*\n${formData.notes}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ Pedido creado automáticamente\n`;
    message += `📞 Confirma respondiendo a este mensaje\n`;
    
    return message;
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Efectivo contra entrega',
      card: 'Tarjeta (datáfono)',
      transfer: 'Transferencia bancaria',
      nequi: 'Nequi',
      daviplata: 'Daviplata',
    };
    return methods[method] || method;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.customer_name || !formData.customer_phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!branch?.id) {
      alert('No se pudo identificar la sucursal. Regresa al menú y selecciona una sucursal válida.');
      return;
    }

    if (formData.order_type === 'delivery' && !formData.delivery_address) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }

    if (items.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    setSubmitting(true);
    
    try {
      // ==================================================
      // PASO 1: Construir payload correcto para el backend
      // ==================================================
      const orderPayload = {
        branch_id: branch.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        order_type: formData.order_type,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.id,        // ✅ El carrito guarda el product_id como 'id'
          quantity: item.quantity,
          modifiers: item.modifiers || [],
        })),
      };
      
      // Agregar dirección solo si es domicilio
      if (formData.order_type === 'delivery' && formData.delivery_address) {
        orderPayload.delivery_address = formData.delivery_address;
      }
      
      // Agregar costo de envío si aplica
      if (deliveryCost > 0) {
        orderPayload.delivery_cost = deliveryCost;
      }
      
      console.log('📦 Enviando pedido al backend:', orderPayload);
      
      // ==================================================
      // PASO 2: Crear pedido en el backend
      // ==================================================
      const orderResponse = await createOrder(orderPayload);
      
      console.log('✅ Pedido creado:', orderResponse);
      
      if (!orderResponse || !orderResponse.success) {
        throw new Error(orderResponse?.error || 'Error al crear el pedido');
      }
      
      const orderData = orderResponse.data;
      setOrderCreated(orderData);
      
      // ==================================================
      // PASO 3: Generar y enviar mensaje de WhatsApp
      // ==================================================
      const whatsappMessage = generateWhatsAppMessage(orderData);
      
      // Usar el número de WhatsApp de la sucursal (con fallback)
      if (branchWhatsapp) {
        sendWhatsAppMessage(branchWhatsapp, whatsappMessage);
      } else {
        console.warn('⚠️ No hay número de WhatsApp configurado');
        alert('Pedido creado exitosamente. El restaurante se pondrá en contacto contigo.');
      }
      
      // ==================================================
      // PASO 4: Limpiar carrito y mostrar confirmación
      // ==================================================
      clearCart();
      
      alert(`✅ ¡Pedido #${orderData.order_number || orderData.id} creado exitosamente!\n\nSe abrirá WhatsApp para confirmar con el restaurante.`);
      
      // Navegar de regreso al menú
      navigate(`/${branch.slug}/menu`);
      
    } catch (error) {
      console.error('❌ Error en checkout:', error);
      alert(`Error al procesar el pedido: ${error.message}\n\nPor favor intenta nuevamente.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de pedido *
                </label>
                <select
                  name="order_type"
                  value={formData.order_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  disabled={submitting}
                >
                  <option value="delivery">Domicilio</option>
                  <option value="pickup">Recoger en local</option>
                </select>
              </div>
              
              {formData.order_type === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    onBlur={handleAddressBlur}
                    placeholder="Calle, número, barrio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    disabled={submitting}
                  />
                  {deliveryInfo && (
                    <p className={`text-xs mt-1 ${deliveryInfo.is_free ? 'text-green-600' : 'text-orange-600'}`}>
                      {deliveryInfo.is_free 
                        ? '✅ Envío gratis en esta zona' 
                        : `🚚 Costo de envío: ${formatCurrency(deliveryInfo.cost)}`
                      }
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de pago
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  disabled={submitting}
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
                  disabled={submitting}
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
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>{deliveryCost === 0 ? 'Gratis' : formatCurrency(deliveryCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? 'Procesando pedido...' : 'Confirmar pedido'}
            </button>
            
            <button
              onClick={() => navigate(-1)}
              disabled={submitting}
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