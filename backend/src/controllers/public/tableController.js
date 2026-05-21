/**
 * ======================================================
 * ARCHIVO: tableController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/public/tableController.js
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 21:00
 *
 * 🎯 PROPÓSITO:
 * Controlador para las rutas públicas de mesas.
 * Maneja la obtención de información de mesas,
 * verificación de estado, y operaciones básicas
 * que un cliente puede realizar desde su mesa.
 *
 * 📦 DEPENDENCIAS:
 * - ../../services/tableService: Lógica de mesas
 * - ../../services/orderService: Lógica de pedidos
 * - ../../models/Table: Modelo de mesas
 * - ../../models/Order: Modelo de pedidos
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../services/*, ../../models/*
 * - Es importado por: ../../routes/public.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 21:00
 *    ✅ Creación inicial del archivo
 *    ✅ Endpoint GET /table/:tableId/info
 *    ✅ Endpoint GET /table/:tableId/status
 *    ✅ Endpoint GET /table/:tableId/active-order
 *    ✅ Endpoint POST /table/:tableId/request-service
 *    ✅ Endpoint POST /table/:tableId/request-bill
 *    ✅ Endpoint GET /table/:tableId/qr
 * ======================================================
 */

const tableService = require('../../services/tableService');
const orderService = require('../../services/orderService');
const Table = require('../../models/Table');
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

// ======================================================
// ENDPOINTS PÚBLICOS DE MESAS
// ======================================================

/**
 * GET /table/:tableId/info
 * Obtiene información básica de una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableInfo = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.is_active) {
      return sendError(res, 'Esta mesa no está activa', 403);
    }
    
    sendSuccess(res, {
      id: table.id,
      number: table.table_number,
      name: table.table_name,
      capacity: table.capacity,
      status: table.status,
      branch_id: table.branch_id,
      branch_name: table.branch_name,
    });
  } catch (error) {
    logger.error('Error in getTableInfo:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /table/:tableId/status
 * Obtiene el estado actual de una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const status = await tableService.getTableStatus(tableId);
    if (!status) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    sendSuccess(res, status);
  } catch (error) {
    logger.error('Error in getTableStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /table/:tableId/active-order
 * Obtiene el pedido activo de una mesa (si existe)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getActiveOrder = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.current_order_id) {
      return sendSuccess(res, {
        has_active_order: false,
        message: 'No hay pedido activo en esta mesa',
      });
    }
    
    const order = await Order.findById(table.current_order_id);
    if (!order) {
      return sendSuccess(res, {
        has_active_order: false,
        message: 'No hay pedido activo en esta mesa',
      });
    }
    
    sendSuccess(res, {
      has_active_order: true,
      order: {
        id: order.id,
        number: order.order_number,
        status: order.order_status,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        created_at: order.created_at,
        notes: order.notes,
      },
    });
  } catch (error) {
    logger.error('Error in getActiveOrder:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /table/:tableId/order-history
 * Obtiene el historial de pedidos de una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableOrderHistory = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { limit = 10 } = req.query;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const orders = await Order.findByTable(tableId);
    const limitedOrders = orders.slice(0, parseInt(limit));
    
    sendSuccess(res, {
      table_id: tableId,
      table_number: table.table_number,
      total_orders: orders.length,
      orders: limitedOrders.map(order => ({
        id: order.id,
        number: order.order_number,
        total: order.total,
        status: order.order_status,
        created_at: order.created_at,
        items_count: order.items.length,
      })),
    });
  } catch (error) {
    logger.error('Error in getTableOrderHistory:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /table/:tableId/request-service
 * Solicita atención del mesero para una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const requestService = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { reason } = req.body;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    // Notificar al panel de meseros
    await tableService.notifyTableStatusChange(table.branch_id, {
      type: 'service_request',
      table_id: tableId,
      table_number: table.table_number,
      reason: reason || 'Solicitud de atención',
      timestamp: new Date().toISOString(),
    });
    
    sendSuccess(res, {
      message: 'Solicitud enviada, un mesero te atenderá pronto',
      requested_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in requestService:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /table/:tableId/request-bill
 * Solicita la cuenta para una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const requestBill = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.current_order_id) {
      return sendError(res, 'No hay pedido activo en esta mesa', 400);
    }
    
    const order = await Order.findById(table.current_order_id);
    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }
    
    // Notificar al panel de meseros que la mesa solicita la cuenta
    await tableService.notifyTableStatusChange(table.branch_id, {
      type: 'bill_request',
      table_id: tableId,
      table_number: table.table_number,
      order_id: order.id,
      order_number: order.order_number,
      total: order.total,
      timestamp: new Date().toISOString(),
    });
    
    sendSuccess(res, {
      message: 'Solicitud de cuenta enviada',
      order_id: order.id,
      order_number: order.order_number,
      total: order.total,
    });
  } catch (error) {
    logger.error('Error in requestBill:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /table/:tableId/qr
 * Obtiene el código QR de una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableQR = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.qr_code) {
      // Generar QR si no existe
      const qrData = await tableService.generateTableQR(tableId);
      return sendSuccess(res, qrData);
    }
    
    // Regenerar QR si se solicita
    if (req.query.regenerate === 'true') {
      const qrData = await tableService.generateTableQR(tableId);
      return sendSuccess(res, qrData);
    }
    
    sendSuccess(res, {
      url: table.qr_code,
      table_number: table.table_number,
      table_name: table.table_name,
    });
  } catch (error) {
    logger.error('Error in getTableQR:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /table/:tableId/notify-ready
 * Notifica que el pedido está listo (cliente presiona)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const notifyOrderReady = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.current_order_id) {
      return sendError(res, 'No hay pedido activo en esta mesa', 400);
    }
    
    await tableService.notifyOrderReady(table.branch_id, tableId, table.current_order_id);
    
    sendSuccess(res, {
      message: 'Notificación enviada, tu pedido está listo',
    });
  } catch (error) {
    logger.error('Error in notifyOrderReady:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getTableInfo,
  getTableStatus,
  getActiveOrder,
  getTableOrderHistory,
  requestService,
  requestBill,
  getTableQR,
  notifyOrderReady,
};