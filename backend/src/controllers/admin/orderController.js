/**
 * ======================================================
 * ARCHIVO: orderController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/orderController.js
 * FASE: F2
 * VERSIÓN: 1.2
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-23 11:55
 *
 * 🎯 PROPÓSITO:
 * Controlador para las rutas administrativas de pedidos.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.2 - 2026-05-23 11:55
 *    ✅ Agregada función getTopProducts
 *    ✅ Agregada función getRecentOrders
 *    ✅ Exportadas nuevas funciones
 * ------------------------------------------------------
 * 1.1 - 2024-05-23 14:10
 *    ✅ Agregada función getGlobalOrderStats
 * ------------------------------------------------------
 * 1.0 - 2024-05-21 15:00
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const Order = require('../../models/Order');
const Branch = require('../../models/Branch');
const logger = require('../../utils/logger');

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

// ======================================================
// ENDPOINTS
// ======================================================

/**
 * GET /admin/orders
 * Obtiene todos los pedidos con paginación y filtros
 */
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      branch_id, 
      status, 
      order_type,
      date_from, 
      date_to 
    } = req.query;
    
    const tenantId = req.user.tenant_id;
    
    // Construir filtros
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      branch_id,
      order_status: status,
      order_type,
      start_date: date_from,
      end_date: date_to,
    };
    
    const result = await Order.findAll(options);
    
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Error in getAllOrders:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/orders/:orderId
 * Obtiene un pedido por ID
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Verificar que el pedido pertenece al restaurante
    if (order.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para ver este pedido', 403);
    }
    
    sendSuccess(res, order);
  } catch (error) {
    logger.error('Error in getOrderById:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/branch/:branchId/orders
 * Obtiene pedidos por sede
 */
const getOrdersByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 20, status, order_type, date_from, date_to } = req.query;
    const tenantId = req.user.tenant_id;
    
    // Verificar que la sede pertenece al restaurante
    const branch = await Branch.findById(branchId);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const result = await Order.findByBranch(branchId, {
      page: parseInt(page),
      limit: parseInt(limit),
      order_status: status,
      order_type,
      start_date: date_from,
      end_date: date_to,
    });
    
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Error in getOrdersByBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/branch/:branchId/orders/stats
 * Obtiene estadísticas de pedidos de una sede
 */
const getOrderStats = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { date_from, date_to } = req.query;
    
    // Verificar que la sede pertenece al restaurante
    const branch = await Branch.findById(branchId);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    let startDate, endDate;
    
    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Por defecto, estadísticas del día actual
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    const stats = await Order.getStats(branchId, startDate, endDate);
    const topProducts = await Order.getTopProducts(branchId, 5);
    
    sendSuccess(res, {
      ...stats,
      top_products: topProducts,
      date_range: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in getOrderStats:', error.message);
    sendSuccess(res, {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      delivery_orders: 0,
      table_orders: 0,
      takeaway_orders: 0,
      top_products: [],
    });
  }
};

/**
 * GET /admin/orders/stats
 * Obtiene estadísticas globales de pedidos para el dashboard (sin branch_id)
 */
const getGlobalOrderStats = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { date_from, date_to } = req.query;
    
    let startDate, endDate;
    
    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Por defecto, estadísticas del día actual
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Obtener estadísticas globales usando el método del modelo
    const stats = await Order.getGlobalStats(tenantId, startDate, endDate);
    
    sendSuccess(res, {
      ...stats,
      date_range: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in getGlobalOrderStats:', error.message);
    // Devolver datos vacíos en caso de error (no fallar)
    sendSuccess(res, {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      delivery_orders: 0,
      table_orders: 0,
      takeaway_orders: 0,
      top_products: [],
    });
  }
};

/**
 * 🔧 NUEVA FUNCIÓN: GET /admin/orders/top-products
 * Obtiene los productos más vendidos (todas las sedes del tenant)
 */
const getTopProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { limit = 5 } = req.query;
    
    const topProducts = await Order.getGlobalTopProducts(tenantId, parseInt(limit));
    
    sendSuccess(res, topProducts);
  } catch (error) {
    logger.error('Error in getTopProducts:', error.message);
    sendSuccess(res, []);
  }
};

/**
 * 🔧 NUEVA FUNCIÓN: GET /admin/orders/recent
 * Obtiene pedidos recientes (todas las sedes del tenant)
 */
const getRecentOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { limit = 5 } = req.query;
    
    const recentOrders = await Order.getRecentOrders(tenantId, parseInt(limit));
    
    sendSuccess(res, recentOrders);
  } catch (error) {
    logger.error('Error in getRecentOrders:', error.message);
    sendSuccess(res, []);
  }
};

/**
 * PUT /admin/orders/:orderId/status
 * Actualiza el estado de un pedido
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!status) {
      return sendError(res, 'El estado es requerido', 400);
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Verificar que el pedido pertenece al restaurante
    if (order.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este pedido', 403);
    }
    
    const updatedOrder = await Order.updateStatus(orderId, status);
    
    logger.info(`Order ${order.order_number} status updated to ${status}`);
    
    sendSuccess(res, updatedOrder);
  } catch (error) {
    logger.error('Error in updateOrderStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/orders/:orderId/payment-status
 * Actualiza el estado de pago de un pedido
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_status } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!payment_status) {
      return sendError(res, 'El estado de pago es requerido', 400);
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Verificar que el pedido pertenece al restaurante
    if (order.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este pedido', 403);
    }
    
    const updatedOrder = await Order.updatePaymentStatus(orderId, payment_status);
    
    logger.info(`Order ${order.order_number} payment status updated to ${payment_status}`);
    
    sendSuccess(res, updatedOrder);
  } catch (error) {
    logger.error('Error in updatePaymentStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/orders/:orderId/assign-table
 * Asigna un pedido a una mesa (para servicio en local)
 */
const assignOrderToTable = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { table_id } = req.body;
    const tenantId = req.user.tenant_id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Verificar que el pedido pertenece al restaurante
    if (order.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este pedido', 403);
    }
    
    // Verificar que el pedido es de tipo mesa
    if (order.order_type !== 'table') {
      return sendError(res, 'Solo se pueden asignar mesas a pedidos de tipo "mesa"', 400);
    }
    
    const updatedOrder = await Order.update(orderId, { table_id });
    
    logger.info(`Order ${order.order_number} assigned to table ${table_id}`);
    
    sendSuccess(res, updatedOrder);
  } catch (error) {
    logger.error('Error in assignOrderToTable:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/orders/:orderId
 * Cancela un pedido (desde el panel admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const tenantId = req.user.tenant_id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Verificar que el pedido pertenece al restaurante
    if (order.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este pedido', 403);
    }
    
    // Solo se pueden cancelar pedidos no entregados
    if (order.order_status === 'delivered') {
      return sendError(res, 'No se puede cancelar un pedido ya entregado', 400);
    }
    
    const cancelledOrder = await Order.cancel(orderId, reason);
    
    logger.info(`Order ${order.order_number} cancelled by admin. Reason: ${reason || 'No especificado'}`);
    
    sendSuccess(res, cancelledOrder);
  } catch (error) {
    logger.error('Error in cancelOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByBranch,
  getOrderStats,
  getGlobalOrderStats,
  getTopProducts,
  getRecentOrders,
  updateOrderStatus,
  updatePaymentStatus,
  assignOrderToTable,
  cancelOrder,
};