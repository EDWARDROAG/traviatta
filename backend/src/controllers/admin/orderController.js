/**
 * ======================================================
 * ARCHIVO: orderController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/public/orderController.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 20:30
 *
 * 🎯 PROPÓSITO:
 * Controlador para las rutas públicas de pedidos.
 * Maneja la creación de pedidos a domicilio, para llevar,
 * y desde mesa, así como la consulta de estado de pedidos
 * y cálculo de costos de envío.
 *
 * 📦 DEPENDENCIAS:
 * - ../../services/orderService: Lógica de pedidos
 * - ../../services/branchService: Verificación de cobertura
 * - ../../models/Branch: Modelo de sedes
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../services/*, ../../models/*
 * - Es importado por: ../../routes/public.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 20:30
 *    ✅ Creación inicial del archivo
 *    ✅ Endpoint POST /order (domicilio/takeaway)
 *    ✅ Endpoint POST /table/:tableId/order
 *    ✅ Endpoint GET /order/:orderId/status
 *    ✅ Endpoint POST /order/:orderId/cancel
 *    ✅ Endpoint POST /branch/:branchId/calculate-delivery
 *    ✅ Validación de datos de entrada
 * ======================================================
 */

const orderService = require('../../services/orderService');
const branchService = require('../../services/branchService');
const Branch = require('../../models/Branch');
const Order = require('../../models/Order');
const logger = require('../../utils/logger');

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

/**
 * Envía respuesta de éxito
 * @param {Object} res - Response object
 * @param {Object} data - Datos a enviar
 * @param {number} statusCode - Código HTTP
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Envía respuesta de error
 * @param {Object} res - Response object
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP
 */
const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Valida datos de un pedido
 * @param {Object} data - Datos del pedido
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateOrderData = (data) => {
  const errors = [];
  
  if (!data.branch_id) {
    errors.push('El ID de la sede es requerido');
  }
  
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.push('El nombre del cliente es requerido');
  }
  
  if (!data.customer_phone || data.customer_phone.replace(/[^0-9]/g, '').length < 7) {
    errors.push('El teléfono del cliente es requerido');
  }
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('El pedido debe contener al menos un producto');
  }
  
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.product_id) {
      errors.push(`Item ${i}: ID de producto requerido`);
    }
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${i}: cantidad inválida`);
    }
  }
  
  if (data.order_type === 'delivery' && !data.delivery_address) {
    errors.push('Para pedidos a domicilio, la dirección es requerida');
  }
  
  return { valid: errors.length === 0, errors };
};

// ======================================================
// ENDPOINTS PRINCIPALES
// ======================================================

/**
 * POST /order
 * Crea un nuevo pedido (domicilio o para llevar)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    const validation = validateOrderData(orderData);
    if (!validation.valid) {
      return sendError(res, validation.errors.join(', '), 400);
    }
    
    const branch = await Branch.findById(orderData.branch_id);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (!branch.is_active) {
      return sendError(res, 'Esta sede no está activa', 403);
    }
    
    // Si es domicilio, verificar cobertura
    if (orderData.order_type === 'delivery' && orderData.delivery_address) {
      const coverage = await branchService.checkDeliveryCoverage(
        orderData.branch_id,
        { address: orderData.delivery_address }
      );
      
      if (!coverage.isCovered && coverage.cost > 0) {
        orderData.delivery_cost = coverage.cost;
      }
    }
    
    const result = await orderService.createOrder(orderData);
    
    sendSuccess(res, result, 201);
  } catch (error) {
    logger.error('Error in createOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /table/:tableId/order
 * Crea un pedido desde una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createTableOrder = async (req, res) => {
  try {
    const { tableId } = req.params;
    const orderData = req.body;
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return sendError(res, 'El pedido debe contener al menos un producto', 400);
    }
    
    for (let i = 0; i < orderData.items.length; i++) {
      const item = orderData.items[i];
      if (!item.product_id) {
        return sendError(res, `Item ${i}: ID de producto requerido`, 400);
      }
      if (!item.quantity || item.quantity < 1) {
        return sendError(res, `Item ${i}: cantidad inválida`, 400);
      }
    }
    
    const result = await orderService.createTableOrder(tableId, orderData);
    
    sendSuccess(res, result, 201);
  } catch (error) {
    logger.error('Error in createTableOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /table/:tableId/order/:orderId/add-items
 * Agrega items a un pedido existente de mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const addItemsToTableOrder = async (req, res) => {
  try {
    const { tableId, orderId } = req.params;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Se requiere al menos un producto para agregar', 400);
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    if (order.table_id !== tableId) {
      return sendError(res, 'El pedido no pertenece a esta mesa', 403);
    }
    
    const result = await orderService.addItemsToExistingOrder(orderId, items);
    
    sendSuccess(res, {
      order_id: result.id,
      order_number: result.order_number,
      message: 'Productos agregados correctamente',
    });
  } catch (error) {
    logger.error('Error in addItemsToTableOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /table/:tableId/order/:orderId/close
 * Cierra un pedido de mesa (finaliza cuenta)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const closeTableOrder = async (req, res) => {
  try {
    const { tableId, orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    if (order.table_id !== tableId) {
      return sendError(res, 'El pedido no pertenece a esta mesa', 403);
    }
    
    const result = await orderService.closeTableOrder(orderId);
    
    sendSuccess(res, {
      order_id: result.id,
      order_number: result.order_number,
      message: 'Pedido cerrado correctamente',
    });
  } catch (error) {
    logger.error('Error in closeTableOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /order/:orderId/status
 * Obtiene el estado de un pedido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    sendSuccess(res, {
      order_id: order.id,
      order_number: order.order_number,
      status: order.order_status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      estimated_time: order.estimated_time || null,
    });
  } catch (error) {
    logger.error('Error in getOrderStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /order/:orderId/cancel
 * Cancela un pedido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, phone } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    if (phone && order.customer_phone !== phone) {
      return sendError(res, 'Teléfono no coincide con el pedido', 403);
    }
    
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return sendError(res, 'No se puede cancelar un pedido que ya está en preparación', 400);
    }
    
    const result = await Order.cancel(orderId, reason);
    
    sendSuccess(res, {
      order_id: result.id,
      order_number: result.order_number,
      message: 'Pedido cancelado correctamente',
    });
  } catch (error) {
    logger.error('Error in cancelOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /branch/:branchId/calculate-delivery
 * Calcula costo de envío para una dirección
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const calculateDeliveryCost = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { address, lat, lng, subtotal } = req.body;
    
    if (!address && (!lat || !lng)) {
      return sendError(res, 'Se requiere dirección o coordenadas', 400);
    }
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    const coverage = await branchService.checkDeliveryCoverage(branchId, {
      address,
      lat,
      lng,
    });
    
    let finalCost = coverage.cost;
    let isFree = coverage.isFree;
    
    const freeDeliveryMinAmount = branch.free_delivery_min_amount || 0;
    if (subtotal && freeDeliveryMinAmount > 0 && subtotal >= freeDeliveryMinAmount) {
      finalCost = 0;
      isFree = true;
    }
    
    sendSuccess(res, {
      is_covered: coverage.isCovered,
      cost: finalCost,
      is_free: isFree,
      free_delivery_min_amount: freeDeliveryMinAmount,
      remaining_for_free: freeDeliveryMinAmount > 0 && subtotal
        ? Math.max(0, freeDeliveryMinAmount - subtotal)
        : null,
    });
  } catch (error) {
    logger.error('Error in calculateDeliveryCost:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  createOrder,
  createTableOrder,
  addItemsToTableOrder,
  closeTableOrder,
  getOrderStatus,
  cancelOrder,
  calculateDeliveryCost,
};