/**
 * ======================================================
 * ARCHIVO: queueService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/queueService.js
 * VERSIÓN: 1.1 (Simplificada para desarrollo)
 * ======================================================
 */

const logger = require('../utils/logger');

const QUEUE_NAMES = {
  ORDERS: 'orders_queue',
  NOTIFICATIONS: 'notifications_queue',
  TABLES: 'tables_queue',
  REPORTS: 'reports_queue',
  DEAD_LETTER: 'dead_letter_queue',
};

// ======================================================
// PUBLICACIÓN DE MENSAJES
// ======================================================

const publishOrder = async (orderData) => {
  try {
    logger.debug(`Order queued: ${orderData.order_number}`);
    return true;
  } catch (error) {
    logger.error('Error publishing order:', error.message);
    return false;
  }
};

const publishNotification = async (notificationData) => {
  try {
    logger.debug(`Notification queued: ${notificationData.type}`);
    return true;
  } catch (error) {
    logger.error('Error publishing notification:', error.message);
    return false;
  }
};

const publishTableUpdate = async (tableData) => {
  try {
    logger.debug(`Table update queued: ${tableData.tableId}`);
    return true;
  } catch (error) {
    logger.error('Error publishing table update:', error.message);
    return false;
  }
};

// ======================================================
// CONSUMIDORES
// ======================================================

const startConsumers = async () => {
  logger.info('Queue consumers started (development mode)');
  return true;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  QUEUE_NAMES,
  publishOrder,
  publishNotification,
  publishTableUpdate,
  startConsumers,
};