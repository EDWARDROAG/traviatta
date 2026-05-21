/**
 * ======================================================
 * ARCHIVO: branchController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/branchController.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 00:30
 *
 * 🎯 PROPÓSITO:
 * Controlador para la gestión completa de sedes
 * en el panel administrativo. Maneja creación, edición,
 * eliminación de sedes, configuración de módulos
 * activables, zonas de domicilio y horarios.
 *
 * 📦 DEPENDENCIAS:
 * - ../../services/branchService: Lógica de sedes
 * - ../../models/Branch: Modelo de sedes
 * - ../../models/BranchModule: Modelo de módulos
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../services/*, ../../models/*
 * - Es importado por: ../../routes/admin.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 00:30
 *    ✅ Creación inicial del archivo
 *    ✅ CRUD completo de sedes
 *    ✅ Gestión de módulos por sede
 *    ✅ Configuración de zonas de domicilio
 *    ✅ Configuración de horarios
 *    ✅ Dashboard de sede
 * ======================================================
 */

const branchService = require('../../services/branchService');
const Branch = require('../../models/Branch');
const BranchModule = require('../../models/BranchModule');
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
// CRUD DE SEDES
// ======================================================

/**
 * GET /admin/branches
 * Obtiene todas las sedes del restaurante autenticado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllBranches = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { only_active } = req.query;
    
    const branches = await branchService.getBranchesByTenant(tenantId, {
      onlyActive: only_active === 'true',
    });
    
    sendSuccess(res, {
      total: branches.length,
      branches,
    });
  } catch (error) {
    logger.error('Error in getAllBranches:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/branches/:branchId
 * Obtiene una sede por ID con toda su configuración
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getBranchById = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const branchWithConfig = await branchService.getBranchWithConfig(branchId);
    
    sendSuccess(res, branchWithConfig);
  } catch (error) {
    logger.error('Error in getBranchById:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/branches
 * Crea una nueva sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createBranch = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const branchData = req.body;
    
    branchData.tenant_id = tenantId;
    
    const branch = await branchService.createBranch(branchData);
    
    logger.info(`Branch created: ${branch.name} (${branch.id}) for tenant ${tenantId}`);
    
    sendSuccess(res, branch, 201);
  } catch (error) {
    logger.error('Error in createBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/branches/:branchId
 * Actualiza una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const updateData = req.body;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const updatedBranch = await branchService.updateBranch(branchId, updateData);
    
    logger.info(`Branch updated: ${updatedBranch.name} (${branchId})`);
    
    sendSuccess(res, updatedBranch);
  } catch (error) {
    logger.error('Error in updateBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/branches/:branchId
 * Elimina una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { hard_delete } = req.query;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para eliminar esta sede', 403);
    }
    
    const result = await branchService.deleteBranch(branchId, hard_delete === 'true');
    
    if (result) {
      logger.info(`Branch deleted: ${branch.name} (${branchId})`);
      sendSuccess(res, { message: 'Sede eliminada correctamente' });
    } else {
      sendError(res, 'No se pudo eliminar la sede', 400);
    }
  } catch (error) {
    logger.error('Error in deleteBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// DASHBOARD DE SEDE
// ======================================================

/**
 * GET /admin/branches/:branchId/dashboard
 * Obtiene dashboard con estadísticas de la sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getBranchDashboard = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const dashboard = await branchService.getBranchDashboard(branchId);
    
    sendSuccess(res, dashboard);
  } catch (error) {
    logger.error('Error in getBranchDashboard:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE MÓDULOS
// ======================================================

/**
 * GET /admin/branches/:branchId/modules
 * Obtiene los módulos configurados para una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getBranchModules = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const modules = await branchService.getBranchModules(branchId);
    
    sendSuccess(res, {
      branch_id: branchId,
      modules,
    });
  } catch (error) {
    logger.error('Error in getBranchModules:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/branches/:branchId/modules/:moduleName
 * Actualiza la configuración de un módulo
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateBranchModule = async (req, res) => {
  try {
    const { branchId, moduleName } = req.params;
    const tenantId = req.user.tenant_id;
    const config = req.body;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const updatedModule = await branchService.updateBranchModule(branchId, moduleName, config);
    
    logger.info(`Module ${moduleName} updated for branch ${branchId}`);
    
    sendSuccess(res, updatedModule);
  } catch (error) {
    logger.error('Error in updateBranchModule:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE DOMICILIO
// ======================================================

/**
 * PUT /admin/branches/:branchId/delivery-zones
 * Actualiza zonas de domicilio de una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateDeliveryZones = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { delivery_zones, delivery_cost, free_delivery_min_amount } = req.body;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const updateData = {};
    if (delivery_zones) updateData.delivery_zones = delivery_zones;
    if (delivery_cost !== undefined) updateData.delivery_cost = delivery_cost;
    if (free_delivery_min_amount !== undefined) updateData.free_delivery_min_amount = free_delivery_min_amount;
    
    const updatedBranch = await Branch.update(branchId, updateData);
    
    // Invalidar caché de delivery
    await branchService.invalidateDeliveryCache(branchId);
    
    logger.info(`Delivery zones updated for branch ${branchId}`);
    
    sendSuccess(res, updatedBranch);
  } catch (error) {
    logger.error('Error in updateDeliveryZones:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/branches/:branchId/check-coverage
 * Verifica cobertura de domicilio (prueba)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const testDeliveryCoverage = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { address, lat, lng } = req.body;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    if (!address && (!lat || !lng)) {
      return sendError(res, 'Se requiere dirección o coordenadas para la prueba', 400);
    }
    
    const coverage = await branchService.checkDeliveryCoverage(branchId, {
      address,
      lat,
      lng,
    });
    
    sendSuccess(res, coverage);
  } catch (error) {
    logger.error('Error in testDeliveryCoverage:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE HORARIOS
// ======================================================

/**
 * PUT /admin/branches/:branchId/schedule
 * Actualiza horarios de una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateBranchSchedule = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { schedule } = req.body;
    
    if (!schedule) {
      return sendError(res, 'Se requiere el objeto schedule', 400);
    }
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const updatedBranch = await branchService.updateBranchSchedule(branchId, schedule);
    
    logger.info(`Schedule updated for branch ${branchId}`);
    
    sendSuccess(res, updatedBranch);
  } catch (error) {
    logger.error('Error in updateBranchSchedule:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// ESTADO DE SEDE
// ======================================================

/**
 * GET /admin/branches/:branchId/status
 * Verifica si la sede está abierta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getBranchStatus = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const isOpen = await branchService.isBranchOpen(branchId);
    
    sendSuccess(res, {
      branch_id: branchId,
      branch_name: branch.name,
      is_open: isOpen.isOpen,
      open_time: isOpen.openTime,
      close_time: isOpen.closeTime,
      next_open: isOpen.nextOpen,
    });
  } catch (error) {
    logger.error('Error in getBranchStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchDashboard,
  getBranchModules,
  updateBranchModule,
  updateDeliveryZones,
  testDeliveryCoverage,
  updateBranchSchedule,
  getBranchStatus,
};