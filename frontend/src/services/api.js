/**
 * ======================================================
 * ARCHIVO: api.js
 * UBICACIÓN: menu-qr-system/frontend/src/services/api.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 16:30
 *
 * 🎯 PROPÓSITO:
 * Configuración del cliente Axios para comunicarse con
 * el backend. Incluye interceptores para manejo de
 * errores, timeout y logging.
 *
 * 📦 DEPENDENCIAS:
 * - axios: Cliente HTTP
 *
 * 🔗 RELACIONES:
 * - Importado por: hooks, servicios, componentes
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 16:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración base de Axios
 *    ✅ Interceptor de respuestas
 *    ✅ Funciones específicas de API
 * ======================================================
 */

import axios from 'axios';

// ======================================================
// CONFIGURACIÓN BASE
// ======================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// INTERCEPTORES
// ======================================================

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ignorar abort/cancelación de peticiones válidas
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.message === 'canceled') {
      return Promise.reject(error);
    }

    if (error.response) {
      // Error con respuesta del servidor
      console.error('API Error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('auth-token');
      }
    } else if (error.request) {
      // No hubo respuesta
      console.error('API No response:', error.request);
    } else {
      // Error en la configuración
      console.error('API Config Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ======================================================
// FUNCIONES DE API
// ======================================================

/**
 * Obtiene el menú de un restaurante por slug
 * @param {string} slug - Slug del restaurante
 * @param {Object} options - Opciones (branch_id, table_id)
 * @returns {Promise<Object>} Menú del restaurante
 */
export const getMenu = async (slug, options = {}) => {
  const { branch_id, table_id } = options;
  
  if (table_id) {
    const response = await api.get(`/table/${table_id}/menu`);
    return response.data;
  }
  
  let url = `/${slug}/menu`;
  if (branch_id) {
    url += `?branch_id=${branch_id}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Obtiene productos destacados
 * @param {string} slug - Slug del restaurante
 * @param {string} branchId - ID de la sede (opcional)
 * @param {number} limit - Límite de productos
 * @returns {Promise<Object>} Productos destacados
 */
export const getFeaturedProducts = async (slug, branchId = null, limit = 10) => {
  let url = `/${slug}/featured?limit=${limit}`;
  if (branchId) {
    url += `&branch_id=${branchId}`;
  }
  const response = await api.get(url);
  return response.data;
};

/**
 * Obtiene el menú del día
 * @param {string} slug - Slug del restaurante
 * @param {string} branchId - ID de la sede (opcional)
 * @returns {Promise<Object>} Menú del día
 */
export const getDailyMenu = async (slug, branchId = null) => {
  let url = `/${slug}/daily-menu`;
  if (branchId) {
    url += `?branch_id=${branchId}`;
  }
  const response = await api.get(url);
  return response.data;
};

/**
 * Busca productos en el menú
 * @param {string} slug - Slug del restaurante
 * @param {string} query - Término de búsqueda
 * @param {string} branchId - ID de la sede (opcional)
 * @returns {Promise<Object>} Resultados de búsqueda
 */
export const searchProducts = async (slug, query, branchId = null) => {
  let url = `/${slug}/search?q=${encodeURIComponent(query)}`;
  if (branchId) {
    url += `&branch_id=${branchId}`;
  }
  const response = await api.get(url);
  return response.data;
};

/**
 * Crea un pedido a domicilio o para llevar
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} Pedido creado
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/order', orderData);
  return response.data;
};

/**
 * Crea un pedido desde una mesa
 * @param {string} tableId - ID de la mesa
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} Pedido creado
 */
export const createTableOrder = async (tableId, orderData) => {
  const response = await api.post(`/table/${tableId}/order`, orderData);
  return response.data;
};

/**
 * Agrega items a un pedido existente de mesa
 * @param {string} tableId - ID de la mesa
 * @param {string} orderId - ID del pedido
 * @param {Array} items - Items a agregar
 * @returns {Promise<Object>} Resultado
 */
export const addItemsToTableOrder = async (tableId, orderId, items) => {
  const response = await api.post(`/table/${tableId}/order/${orderId}/add-items`, { items });
  return response.data;
};

/**
 * Cierra un pedido de mesa
 * @param {string} tableId - ID de la mesa
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Resultado
 */
export const closeTableOrder = async (tableId, orderId) => {
  const response = await api.put(`/table/${tableId}/order/${orderId}/close`);
  return response.data;
};

/**
 * Obtiene el estado de un pedido
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Estado del pedido
 */
export const getOrderStatus = async (orderId) => {
  const response = await api.get(`/order/${orderId}/status`);
  return response.data;
};

/**
 * Cancela un pedido
 * @param {string} orderId - ID del pedido
 * @param {string} phone - Teléfono del cliente
 * @param {string} reason - Razón de cancelación
 * @returns {Promise<Object>} Resultado
 */
export const cancelOrder = async (orderId, phone, reason = '') => {
  const response = await api.post(`/order/${orderId}/cancel`, { phone, reason });
  return response.data;
};

/**
 * Verifica cobertura de domicilio
 * @param {string} branchId - ID de la sede
 * @param {Object} location - Ubicación { address, lat, lng }
 * @returns {Promise<Object>} Información de cobertura
 */
export const checkDeliveryCoverage = async (branchId, location) => {
  const response = await api.post(`/branch/${branchId}/calculate-delivery`, location);
  return response.data;
};

/**
 * Calcula costo de envío
 * @param {string} branchId - ID de la sede
 * @param {Object} data - Datos { address, subtotal }
 * @returns {Promise<Object>} Costo de envío
 */
export const calculateDeliveryCost = async (branchId, data) => {
  const response = await api.post(`/branch/${branchId}/calculate-delivery`, data);
  return response.data;
};

/**
 * Obtiene información de una mesa
 * @param {string} tableId - ID de la mesa
 * @returns {Promise<Object>} Información de la mesa
 */
export const getTableInfo = async (tableId) => {
  const response = await api.get(`/table/${tableId}/info`);
  return response.data;
};

/**
 * Solicita atención de mesero
 * @param {string} tableId - ID de la mesa
 * @param {string} reason - Razón de la solicitud
 * @returns {Promise<Object>} Resultado
 */
export const requestTableService = async (tableId, reason = '') => {
  const response = await api.post(`/table/${tableId}/request-service`, { reason });
  return response.data;
};

/**
 * Solicita la cuenta
 * @param {string} tableId - ID de la mesa
 * @returns {Promise<Object>} Resultado
 */
export const requestTableBill = async (tableId) => {
  const response = await api.post(`/table/${tableId}/request-bill`);
  return response.data;
};

/**
 * Obtiene el estado de una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object>} Estado de la sede
 */
export const getBranchStatus = async (branchId) => {
  const response = await api.get(`/branch/${branchId}/status`);
  return response.data;
};

// ======================================================
// EXPORTACIÓN POR DEFECTO
// ======================================================

export default api;