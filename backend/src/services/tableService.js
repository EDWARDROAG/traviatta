/**
 * ======================================================
 * ARCHIVO: tableService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/tableService.js
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 17:30
 *
 * 🎯 PROPÓSITO:
 * Servicio para la gestión completa de mesas en servicio
 * local. Maneja el layout visual (mapa interactivo),
 * estados de mesas, asignación de pedidos, y
 * notificaciones en tiempo real para meseros y cocina.
 *
 * 📦 DEPENDENCIAS:
 * - ../models/Table: Modelo de mesas
 * - ../models/Order: Modelo de pedidos
 * - ../models/Branch: Modelo de sedes
 * - ../config/rabbitmq: Cola de mensajes
 * - ../config/redis: Caché de estados
 * - ../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../models/*, ../config/*, ../utils/logger
 * - Es importado por: controllers/admin/tableController.js,
 *   controllers/public/tableController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 17:30
 *    ✅ Creación inicial del archivo
 *    ✅ Gestión de layout visual de mesas
 *    ✅ Cambio de estados con validaciones
 *    ✅ Notificaciones en tiempo real
 *    ✅ QR generation y asignación
 *    ✅ Dashboard de ocupación
 *    ✅ Liberación automática de mesas
 * ======================================================
 */

const Table = require('../models/Table');
const Order = require('../models/Order');
const Branch = require('../models/Branch');
const rabbitmq = require('../config/rabbitmq');
const redis = require('../config/redis');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const TABLE_CACHE_TTL = {
  LAYOUT: 300,
  STATUS: 60,
  OCCUPANCY: 30,
};

const AUTO_CLEANUP_MINUTES = 15;

// ======================================================
// GESTIÓN DE LAYOUT (MAPA VISUAL)
// ======================================================

/**
 * Obtiene el layout completo de mesas para el mapa visual
 * @param {string} branchId - ID de la sede
 * @param {boolean} skipCache - Forzar refresco
 * @returns {Promise<Object>} Layout con mesas y dimensiones
 */
const getTableLayout = async (branchId, skipCache = false) => {
  const cacheKey = `table_layout:${branchId}`;
  
  if (!skipCache) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  const layout = await Table.getTableLayout(branchId);
  
  for (const table of layout.tables) {
    if (table.status === Table.TABLE_STATUS.OCCUPIED && table.current_order_id) {
      const order = await Order.findById(table.current_order_id);
      if (order) {
        table.current_order = {
          id: order.id,
          order_number: order.order_number,
          total: order.total,
          items_count: order.items.length,
          started_at: order.created_at,
        };
      }
    }
  }
  
  await redis.set(cacheKey, layout, TABLE_CACHE_TTL.LAYOUT);
  
  return layout;
};

/**
 * Actualiza múltiples posiciones de mesas en el mapa
 * @param {string} branchId - ID de la sede
 * @param {Array} tablePositions - Array de { id, position_x, position_y }
 * @returns {Promise<boolean>}
 */
const updateTablePositions = async (branchId, tablePositions) => {
  const result = await Table.updateMultiplePositions(branchId, tablePositions);
  
  await redis.del(`table_layout:${branchId}`);
  await notifyLayoutUpdate(branchId);
  
  return result;
};

/**
 * Notifica actualización del layout a clientes conectados
 * @param {string} branchId - ID de la sede
 */
const notifyLayoutUpdate = async (branchId) => {
  await rabbitmq.publishTableUpdate({
    type: 'layout_updated',
    branch_id: branchId,
    timestamp: new Date().toISOString(),
  });
};

// ======================================================
// GESTIÓN DE ESTADOS DE MESAS
// ======================================================

/**
 * Cambia el estado de una mesa
 * @param {string} tableId - ID de la mesa
 * @param {string} newStatus - Nuevo estado
 * @param {string} orderId - ID del pedido (si aplica)
 * @returns {Promise<Object>} Mesa actualizada
 */
const changeTableStatus = async (tableId, newStatus, orderId = null) => {
  const validStatuses = Object.values(Table.TABLE_STATUS);
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Estado inválido: ${newStatus}`);
  }
  
  const table = await Table.findById(tableId);
  if (!table) {
    throw new Error('Mesa no encontrada');
  }
  
  const oldStatus = table.status;
  
  const allowedTransitions = {
    [Table.TABLE_STATUS.AVAILABLE]: [Table.TABLE_STATUS.OCCUPIED, Table.TABLE_STATUS.RESERVED],
    [Table.TABLE_STATUS.OCCUPIED]: [Table.TABLE_STATUS.CLEANING, Table.TABLE_STATUS.AVAILABLE],
    [Table.TABLE_STATUS.RESERVED]: [Table.TABLE_STATUS.AVAILABLE, Table.TABLE_STATUS.OCCUPIED],
    [Table.TABLE_STATUS.CLEANING]: [Table.TABLE_STATUS.AVAILABLE],
  };
  
  if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
    throw new Error(`No se puede cambiar de ${oldStatus} a ${newStatus}`);
  }
  
  const updatedTable = await Table.changeStatus(tableId, newStatus, orderId);
  
  await redis.del(`table_layout:${table.branch_id}`);
  await redis.del(`table_status:${tableId}`);
  
  await notifyTableStatusChange(table.branch_id, {
    table_id: tableId,
    table_number: table.table_number,
    old_status: oldStatus,
    new_status: newStatus,
    timestamp: new Date().toISOString(),
  });
  
  logger.info(`Table ${table.table_number} status changed: ${oldStatus} -> ${newStatus}`);
  
  return updatedTable;
};

/**
 * Obtiene el estado actual de una mesa
 * @param {string} tableId - ID de la mesa
 * @returns {Promise<Object>} Estado de la mesa
 */
const getTableStatus = async (tableId) => {
  const cacheKey = `table_status:${tableId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const table = await Table.findById(tableId);
  if (!table) {
    throw new Error('Mesa no encontrada');
  }
  
  const status = {
    id: table.id,
    number: table.table_number,
    name: table.table_name,
    status: table.status,
    capacity: table.capacity,
    current_order_id: table.current_order_id,
    occupied_since: table.occupied_since,
    qr_code: table.qr_code,
  };
  
  if (table.status === Table.TABLE_STATUS.OCCUPIED && table.current_order_id) {
    const order = await Order.findById(table.current_order_id);
    if (order) {
      status.current_order = {
        id: order.id,
        number: order.order_number,
        total: order.total,
        items_count: order.items.length,
        duration_minutes: calculateOrderDuration(order.created_at),
      };
    }
  }
  
  await redis.set(cacheKey, status, TABLE_CACHE_TTL.STATUS);
  
  return status;
};

/**
 * Calcula la duración de un pedido en minutos
 * @param {string} createdAt - Fecha de creación
 * @returns {number} Duración en minutos
 */
const calculateOrderDuration = (createdAt) => {
  const start = new Date(createdAt);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60));
};

// ======================================================
// QR PARA MESAS
// ======================================================

/**
 * Genera QR para una mesa específica
 * @param {string} tableId - ID de la mesa
 * @returns {Promise<Object>} URL del QR generado
 */
const generateTableQR = async (tableId) => {
  const table = await Table.findById(tableId);
  if (!table) {
    throw new Error('Mesa no encontrada');
  }
  
  const branch = await Branch.findById(table.branch_id);
  if (!branch) {
    throw new Error('Sede no encontrada');
  }
  
  const qrUrl = Table.generateTableQRUrl(branch.slug, tableId, table.table_number);
  const qrImage = await Table.generateQRImage(qrUrl);
  
  await Table.update(tableId, { qr_code: qrUrl });
  
  return {
    url: qrUrl,
    image: qrImage,
    table_number: table.table_number,
  };
};

/**
 * Regenera QR para todas las mesas de una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Array>} Lista de QRs generados
 */
const regenerateAllTableQRs = async (branchId) => {
  const tables = await Table.findByBranch(branchId, { onlyActive: true });
  const results = [];
  
  for (const table of tables) {
    const qr = await generateTableQR(table.id);
    results.push(qr);
  }
  
  return results;
};

// ======================================================
// DASHBOARD DE OCUPACIÓN
// ======================================================

/**
 * Obtiene dashboard completo de ocupación de una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object>} Dashboard con estadísticas
 */
const getOccupancyDashboard = async (branchId) => {
  const cacheKey = `occupancy_dashboard:${branchId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const tables = await Table.findByBranch(branchId, { onlyActive: true });
  
  const stats = {
    total_tables: tables.length,
    available: tables.filter(t => t.status === Table.TABLE_STATUS.AVAILABLE).length,
    occupied: tables.filter(t => t.status === Table.TABLE_STATUS.OCCUPIED).length,
    reserved: tables.filter(t => t.status === Table.TABLE_STATUS.RESERVED).length,
    cleaning: tables.filter(t => t.status === Table.TABLE_STATUS.CLEANING).length,
    occupancy_rate: 0,
    tables_by_capacity: {
      small: tables.filter(t => t.capacity <= 2).length,
      medium: tables.filter(t => t.capacity >= 3 && t.capacity <= 4).length,
      large: tables.filter(t => t.capacity >= 5 && t.capacity <= 6).length,
      xlarge: tables.filter(t => t.capacity >= 7).length,
    },
  };
  
  stats.occupancy_rate = Math.round((stats.occupied / stats.total_tables) * 100);
  
  const dashboard = {
    stats,
    tables: tables.map(t => ({
      id: t.id,
      number: t.table_number,
      name: t.table_name,
      status: t.status,
      capacity: t.capacity,
      position_x: t.position_x,
      position_y: t.position_y,
      occupied_since: t.occupied_since,
    })),
    last_updated: new Date().toISOString(),
  };
  
  await redis.set(cacheKey, dashboard, TABLE_CACHE_TTL.OCCUPANCY);
  
  return dashboard;
};

// ======================================================
// NOTIFICACIONES EN TIEMPO REAL
// ======================================================

/**
 * Notifica cambio de estado de una mesa
 * @param {string} branchId - ID de la sede
 * @param {Object} data - Datos de la notificación
 */
const notifyTableStatusChange = async (branchId, data) => {
  await rabbitmq.publishTableUpdate({
    type: 'status_change',
    branch_id: branchId,
    ...data,
  });
};

/**
 * Notifica nuevo pedido desde mesa a cocina
 * @param {string} branchId - ID de la sede
 * @param {string} tableId - ID de la mesa
 * @param {Object} order - Datos del pedido
 */
const notifyNewTableOrder = async (branchId, tableId, order) => {
  const table = await Table.findById(tableId);
  
  await rabbitmq.publishTableUpdate({
    type: 'new_order',
    branch_id: branchId,
    table_id: tableId,
    table_number: table?.table_number,
    order_id: order.id,
    order_number: order.order_number,
    items: order.items,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notifica que un pedido está listo
 * @param {string} branchId - ID de la sede
 * @param {string} tableId - ID de la mesa
 * @param {string} orderId - ID del pedido
 */
const notifyOrderReady = async (branchId, tableId, orderId) => {
  const table = await Table.findById(tableId);
  
  await rabbitmq.publishTableUpdate({
    type: 'order_ready',
    branch_id: branchId,
    table_id: tableId,
    table_number: table?.table_number,
    order_id: orderId,
    timestamp: new Date().toISOString(),
  });
};

// ======================================================
// MANTENIMIENTO Y LIMPIEZA
// ======================================================

/**
 * Programa limpieza automática de mesa después de liberar
 * @param {string} tableId - ID de la mesa
 */
const scheduleAutoCleanup = async (tableId) => {
  setTimeout(async () => {
    const table = await Table.findById(tableId);
    if (table && table.status === Table.TABLE_STATUS.CLEANING) {
      await changeTableStatus(tableId, Table.TABLE_STATUS.AVAILABLE);
      logger.info(`Table ${table.table_number} auto-cleaned`);
    }
  }, AUTO_CLEANUP_MINUTES * 60 * 1000);
};

/**
 * Libera todas las mesas de una sede (cierre del local)
 * @param {string} branchId - ID de la sede
 * @returns {Promise<number>} Mesas liberadas
 */
const releaseAllTables = async (branchId) => {
  const tables = await Table.findByBranch(branchId, { onlyActive: true });
  let released = 0;
  
  for (const table of tables) {
    if (table.status !== Table.TABLE_STATUS.AVAILABLE) {
      await changeTableStatus(table.id, Table.TABLE_STATUS.AVAILABLE);
      released++;
    }
  }
  
  await redis.del(`table_layout:${branchId}`);
  await redis.del(`occupancy_dashboard:${branchId}`);
  
  logger.info(`Released ${released} tables for branch ${branchId}`);
  
  return released;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getTableLayout,
  updateTablePositions,
  notifyLayoutUpdate,
  
  changeTableStatus,
  getTableStatus,
  
  generateTableQR,
  regenerateAllTableQRs,
  
  getOccupancyDashboard,
  
  notifyTableStatusChange,
  notifyNewTableOrder,
  notifyOrderReady,
  
  scheduleAutoCleanup,
  releaseAllTables,
  
  TABLE_CACHE_TTL,
  AUTO_CLEANUP_MINUTES,
};