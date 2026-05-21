/**
 * ======================================================
 * ARCHIVO: OrderForm.jsx
 * UBICACIÓN: menu-qr-system/frontend/src/components/OrderForm.jsx
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 15:30
 *
 * 🎯 PROPÓSITO:
 * Componente de formulario para capturar los datos del
 * cliente antes de enviar el pedido por WhatsApp.
 * Incluye validación básica y verificación de domicilio.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - ../services/api: Verificación de domicilio
 *
 * 🔗 RELACIONES:
 * - Importado por: CheckoutPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 15:30
 *    ✅ Creación inicial del archivo
 *    ✅ Campos de nombre, teléfono, dirección
 *    ✅ Validación en tiempo real
 *    ✅ Verificación de zona de domicilio
 *    ✅ Métodos de pago
 *    ✅ Notas especiales
 * ======================================================
 */

import React, { useState, useEffect } from 'react';
import { checkDeliveryCoverage } from '../services/api';

function OrderForm({ branch, onSubmit, initialData = {}, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    customer_name: initialData.customer_name || '',
    customer_phone: initialData.customer_phone || '',
    delivery_address: initialData.delivery_address || '',
    notes: initialData.notes || '',
    payment_method: initialData.payment_method || 'cash',
  });

  const [errors, setErrors] = useState({});
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Efectivo contra entrega', icon: '💵' },
    { value: 'card', label: 'Tarjeta (datáfono)', icon: '💳' },
    { value: 'transfer', label: 'Transferencia bancaria', icon: '🏦' },
    { value: 'nequi', label: 'Nequi', icon: '📱' },
    { value: 'daviplata', label: 'Daviplata', icon: '📱' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressBlur = async () => {
    if (!formData.delivery_address || !branch?.id) return;
    
    setCheckingAddress(true);
    try {
      const coverage = await checkDeliveryCoverage(branch.id, {
        address: formData.delivery_address,
      });
      setDeliveryInfo(coverage);
    } catch (error) {
      console.error('Error checking delivery coverage:', error);
    } finally {
      setCheckingAddress(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El teléfono es requerido';
    } else if (!/^[0-9]{7,15}$/.test(formData.customer_phone.replace(/[^0-9]/g, ''))) {
      newErrors.customer_phone = 'Ingresa un número de teléfono válido';
    }
    
    if (branch?.requires_delivery_address && !formData.delivery_address.trim()) {
      newErrors.delivery_address = 'La dirección es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, deliveryInfo);
    }
  };

  const getDeliveryMessage = () => {
    if (!deliveryInfo) return null;
    
    if (deliveryInfo.is_free) {
      return { text: '✅ Envío gratis en esta zona', className: 'text-green-600' };
    }
    if (deliveryInfo.cost > 0) {
      return { text: `🚚 Costo de envío: $${deliveryInfo.cost.toLocaleString()}`, className: 'text-orange-600' };
    }
    if (!deliveryInfo.is_covered) {
      return { text: '⚠️ Esta zona puede tener costo de envío adicional', className: 'text-yellow-600' };
    }
    return null;
  };

  const deliveryMessage = getDeliveryMessage();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo *
        </label>
        <input
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
            errors.customer_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Juan Pérez"
          disabled={isSubmitting}
        />
        {errors.customer_name && (
          <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
            errors.customer_phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="3001234567"
          disabled={isSubmitting}
        />
        {errors.customer_phone && (
          <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
        )}
      </div>

      {/* Dirección de entrega */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección de entrega
        </label>
        <input
          type="text"
          name="delivery_address"
          value={formData.delivery_address}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
            errors.delivery_address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Calle, número, barrio, referencias"
          disabled={isSubmitting}
        />
        {checkingAddress && (
          <p className="text-gray-500 text-xs mt-1">Verificando zona...</p>
        )}
        {deliveryMessage && !checkingAddress && (
          <p className={`text-xs mt-1 ${deliveryMessage.className}`}>
            {deliveryMessage.text}
          </p>
        )}
        {errors.delivery_address && (
          <p className="text-red-500 text-xs mt-1">{errors.delivery_address}</p>
        )}
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Método de pago
        </label>
        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          disabled={isSubmitting}
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.icon} {method.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notas especiales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas especiales
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          placeholder="Ej: Sin cebolla, entrada por la calle 123, timbre #45"
          disabled={isSubmitting}
        />
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando pedido...' : 'Enviar pedido por WhatsApp'}
      </button>
    </form>
  );
}

export default OrderForm;