/**
 * ======================================================
 * ARCHIVO: useOrder.js
 * UBICACIÓN: menu-qr-system/frontend/src/hooks/useOrder.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 16:15
 *
 * 🎯 PROPÓSITO:
 * Hook personalizado que maneja la creación de pedidos
 * desde el frontend. Soporta pedidos a domicilio,
 * para llevar y desde mesa. Gestiona estados de envío
 * y errores.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: componentes que crean pedidos
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 16:15
 *    ✅ Creación inicial del archivo
 *    ✅ Estado submitting, error, success
 *    ✅ Función createDeliveryOrder
 *    ✅ Función createTableOrder
 *    ✅ Función addItemsToTableOrder
 *    ✅ Función closeTableOrder
 * ======================================================
 */

import { useState, useCallback } from 'react';
import api from '../services/api';

function useOrder() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  /**
   * Crea un pedido a domicilio o para llevar
   * @param {Object} orderData - Datos del pedido
   * @returns {Promise<Object>} Resultado del pedido
   */
  const createDeliveryOrder = useCallback(async (orderData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await api.post('/order', orderData);
      
      if (response.data.success) {
        setSuccess(true);
        setLastOrder(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al crear el pedido');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al crear el pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  
  /**
   * Crea un pedido desde una mesa
   * @param {string} tableId - ID de la mesa
   * @param {Object} orderData - Datos del pedido
   * @returns {Promise<Object>} Resultado del pedido
   */
  const createTableOrder = useCallback(async (tableId, orderData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await api.post(`/table/${tableId}/order`, orderData);
      
      if (response.data.success) {
        setSuccess(true);
        setLastOrder(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al crear el pedido');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al crear el pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  
  /**
   * Agrega items a un pedido existente de mesa
   * @param {string} tableId - ID de la mesa
   * @param {string} orderId - ID del pedido
   * @param {Array} items - Items a agregar
   * @returns {Promise<Object>} Resultado
   */
  const addItemsToTableOrder = useCallback(async (tableId, orderId, items) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.post(`/table/${tableId}/order/${orderId}/add-items`, { items });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al agregar items');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al agregar items';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  
  /**
   * Cierra un pedido de mesa (finaliza cuenta)
   * @param {string} tableId - ID de la mesa
   * @param {string} orderId - ID del pedido
   * @returns {Promise<Object>} Resultado
   */
  const closeTableOrder = useCallback(async (tableId, orderId) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.put(`/table/${tableId}/order/${orderId}/close`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al cerrar el pedido');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cerrar el pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  
  /**
   * Obtiene el estado de un pedido
   * @param {string} orderId - ID del pedido
   * @returns {Promise<Object>} Estado del pedido
   */
  const getOrderStatus = useCallback(async (orderId) => {
    try {
      const response = await api.get(`/order/${orderId}/status`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al obtener el estado');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al obtener el estado';
      throw new Error(errorMessage);
    }
  }, []);
  
  /**
   * Cancela un pedido
   * @param {string} orderId - ID del pedido
   * @param {string} phone - Teléfono del cliente (verificación)
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>} Resultado
   */
  const cancelOrder = useCallback(async (orderId, phone, reason = '') => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.post(`/order/${orderId}/cancel`, { phone, reason });
      
      if (response.data.success) {
        setSuccess(true);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al cancelar el pedido');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cancelar el pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  
  /**
   * Resetea los estados
   */
  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLastOrder(null);
    setSubmitting(false);
  }, []);
  
  return {
    // Estados
    submitting,
    error,
    success,
    lastOrder,
    
    // Funciones
    createDeliveryOrder,
    createTableOrder,
    addItemsToTableOrder,
    closeTableOrder,
    getOrderStatus,
    cancelOrder,
    reset,
  };
}

export default useOrder;