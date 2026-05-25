/**
 * ======================================================
 * ARCHIVO: tableController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/tableController.js
 * FASE: F4
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-23 12:05
 *
 * 🎯 PROPÓSITO:
 * Controlador para las rutas administrativas de mesas.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2026-05-23 12:05
 *    ✅ Agregada función getOccupancyStats
 *    ✅ Exportada getOccupancyStats
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 21:30
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const tableService = require('../../services/tableService');
const Table = require('../../models/Table');
const Branch = require('../../models/Branch');
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
 * Verifica que la sede pertenezca al restaurante autenticado
 * @param {string} branchId - ID de la sede
 * @param {string} tenantId - ID del restaurante
 * @returns {Promise<boolean>}
 */
const verifyBranchOwnership = async (branchId, tenantId) => {
  const branch = await Branch.findById(branchId);
  return branch && branch.tenant_id === tenantId;
};

// ======================================================
// CRUD DE MESAS
// ======================================================

/**
 * GET /admin/branch/:branchId/tables
 * Obtiene todas las mesas de una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTablesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const tables = await Table.findByBranch(branchId);
    
    sendSuccess(res, {
      branch_id: branchId,
      total: tables.length,
      tables,
    });
  } catch (error) {
    logger.error('Error in getTablesByBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/table/:tableId
 * Obtiene una mesa por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableById = async (req, res) => {
  try {
    const { tableId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const branch = await Branch.findById(table.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta mesa', 403);
    }
    
    sendSuccess(res, table);
  } catch (error) {
    logger.error('Error in getTableById:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/branch/:branchId/tables
 * Crea una nueva mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createTable = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const tableData = req.body;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    tableData.branch_id = branchId;
    
    const table = await Table.create(tableData);
    
    // Generar QR para la nueva mesa
    const branch = await Branch.findById(branchId);
    if (branch && branch.slug) {
      const qrData = await tableService.generateTableQR(table.id);
      table.qr_code = qrData.url;
    }
    
    sendSuccess(res, table, 201);
  } catch (error) {
    logger.error('Error in createTable:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/table/:tableId
 * Actualiza una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const tenantId = req.user.tenant_id;
    const updateData = req.body;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const branch = await Branch.findById(table.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta mesa', 403);
    }
    
    const updatedTable = await Table.update(tableId, updateData);
    
    // Invalidar caché de layout
    await tableService.notifyLayoutUpdate(table.branch_id);
    
    sendSuccess(res, updatedTable);
  } catch (error) {
    logger.error('Error in updateTable:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/table/:tableId
 * Elimina una mesa (soft delete)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const tenantId = req.user.tenant_id;
    const { hard_delete } = req.query;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const branch = await Branch.findById(table.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para eliminar esta mesa', 403);
    }
    
    const result = await Table.deleteTable(tableId, hard_delete === 'true');
    
    if (result) {
      await tableService.notifyLayoutUpdate(table.branch_id);
      sendSuccess(res, { message: 'Mesa eliminada correctamente' });
    } else {
      sendError(res, 'No se pudo eliminar la mesa', 400);
    }
  } catch (error) {
    logger.error('Error in deleteTable:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE LAYOUT (MAPA VISUAL)
// ======================================================

/**
 * GET /admin/branch/:branchId/tables/layout
 * Obtiene el layout de mesas para el mapa visual
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTableLayout = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { skip_cache } = req.query;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const layout = await tableService.getTableLayout(branchId, skip_cache === 'true');
    
    sendSuccess(res, layout);
  } catch (error) {
    logger.error('Error in getTableLayout:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/branch/:branchId/tables/layout
 * Actualiza las posiciones de múltiples mesas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateTablePositions = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { tables } = req.body;
    
    if (!tables || !Array.isArray(tables)) {
      return sendError(res, 'Se requiere un array de mesas con posiciones', 400);
    }
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const result = await tableService.updateTablePositions(branchId, tables);
    
    if (result) {
      sendSuccess(res, { message: 'Posiciones actualizadas correctamente' });
    } else {
      sendError(res, 'No se pudieron actualizar las posiciones', 400);
    }
  } catch (error) {
    logger.error('Error in updateTablePositions:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE ESTADOS DE MESAS
// ======================================================

/**
 * PUT /admin/table/:tableId/status
 * Cambia el estado de una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const changeTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status, order_id } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!status) {
      return sendError(res, 'El estado es requerido', 400);
    }
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const branch = await Branch.findById(table.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta mesa', 403);
    }
    
    const updatedTable = await tableService.changeTableStatus(tableId, status, order_id);
    
    sendSuccess(res, updatedTable);
  } catch (error) {
    logger.error('Error in changeTableStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE QR
// ======================================================

/**
 * POST /admin/table/:tableId/generate-qr
 * Genera código QR para una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const generateTableQR = async (req, res) => {
  try {
    const { tableId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    const branch = await Branch.findById(table.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta mesa', 403);
    }
    
    const qrData = await tableService.generateTableQR(tableId);
    
    sendSuccess(res, qrData);
  } catch (error) {
    logger.error('Error in generateTableQR:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/branch/:branchId/tables/regenerate-qrs
 * Regenera QR para todas las mesas de una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const regenerateAllTableQRs = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const results = await tableService.regenerateAllTableQRs(branchId);
    
    sendSuccess(res, {
      message: `Se regeneraron ${results.length} códigos QR`,
      tables: results,
    });
  } catch (error) {
    logger.error('Error in regenerateAllTableQRs:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// DASHBOARD Y OPERACIONES MASIVAS
// ======================================================

/**
 * GET /admin/branch/:branchId/tables/dashboard
 * Obtiene dashboard de ocupación de mesas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getOccupancyDashboard = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const dashboard = await tableService.getOccupancyDashboard(branchId);
    
    sendSuccess(res, dashboard);
  } catch (error) {
    logger.error('Error in getOccupancyDashboard:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * 🔧 NUEVA FUNCIÓN: GET /admin/tables/occupancy
 * Obtiene estadísticas de ocupación de mesas (todas las sedes del tenant)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getOccupancyStats = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    // Obtener todas las sedes del tenant
    const branches = await Branch.findByTenant(tenantId);
    
    let totalTables = 0;
    let occupiedTables = 0;
    let availableTables = 0;
    let reservedTables = 0;
    let cleaningTables = 0;
    
    for (const branch of branches) {
      const tables = await Table.findByBranch(branch.id);
      totalTables += tables.length;
      occupiedTables += tables.filter(t => t.status === 'occupied').length;
      availableTables += tables.filter(t => t.status === 'available').length;
      reservedTables += tables.filter(t => t.status === 'reserved').length;
      cleaningTables += tables.filter(t => t.status === 'cleaning').length;
    }
    
    sendSuccess(res, {
      total: totalTables,
      occupied: occupiedTables,
      available: availableTables,
      reserved: reservedTables,
      cleaning: cleaningTables,
      occupancy_rate: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0,
    });
  } catch (error) {
    logger.error('Error in getOccupancyStats:', error.message);
    sendSuccess(res, {
      total: 0,
      occupied: 0,
      available: 0,
      reserved: 0,
      cleaning: 0,
      occupancy_rate: 0,
    });
  }
};

/**
 * POST /admin/branch/:branchId/tables/release-all
 * Libera todas las mesas de una sede (cierre del local)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const releaseAllTables = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const released = await tableService.releaseAllTables(branchId);
    
    sendSuccess(res, {
      message: `Se liberaron ${released} mesas`,
      released_count: released,
    });
  } catch (error) {
    logger.error('Error in releaseAllTables:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getTablesByBranch,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getTableLayout,
  updateTablePositions,
  changeTableStatus,
  generateTableQR,
  regenerateAllTableQRs,
  getOccupancyDashboard,
  getOccupancyStats,
  releaseAllTables,
};