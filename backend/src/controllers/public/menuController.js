/**
 * ======================================================
 * ARCHIVO: menuController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/public/menuController.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 20:00
 *
 * 🎯 PROPÓSITO:
 * Controlador para las rutas públicas del menú digital.
 * Maneja la obtención del menú por slug de restaurante
 * o por ID de sede, incluyendo filtrado por horario,
 * disponibilidad de productos, y soporte para menú
 * específico de mesa.
 *
 * 📦 DEPENDENCIAS:
 * - ../../services/menuService: Lógica de menú
 * - ../../services/branchService: Gestión de sedes
 * - ../../models/Tenant: Modelo de restaurantes
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../services/*, ../../models/*
 * - Es importado por: ../../routes/public.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 20:00
 *    ✅ Creación inicial del archivo
 *    ✅ Endpoint GET /:slug/menu
 *    ✅ Endpoint GET /branch/:branchId/menu
 *    ✅ Endpoint GET /table/:tableId/menu
 *    ✅ Endpoint GET /:slug/featured
 *    ✅ Endpoint GET /:slug/search
 *    ✅ Manejo de errores y respuestas consistentes
 * ======================================================
 */

const menuService = require('../../services/menuService');
const branchService = require('../../services/branchService');
const Tenant = require('../../models/Tenant');
const Branch = require('../../models/Branch');
const Table = require('../../models/Table');
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
// ENDPOINTS PRINCIPALES
// ======================================================

/**
 * GET /:slug/menu
 * Obtiene el menú completo de un restaurante por slug
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getMenuBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { branch_id, skip_cache } = req.query;
    
    const tenant = await Tenant.findBySlug(slug);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    let branchId = branch_id;
    
    if (!branchId) {
      const branches = await Branch.findByTenant(tenant.id, { onlyActive: true });
      if (branches.length === 0) {
        return sendError(res, 'No hay sedes disponibles para este restaurante', 404);
      }
      branchId = branches[0].id;
    }
    
    const branch = await Branch.findById(branchId);
    if (!branch || branch.tenant_id !== tenant.id) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    const menu = await menuService.getMenuByBranch(branchId, {
      skipCache: skip_cache === 'true',
      onlyAvailable: true,
    });
    
    sendSuccess(res, menu);
  } catch (error) {
    logger.error('Error in getMenuBySlug:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /branch/:branchId/menu
 * Obtiene el menú directamente por ID de sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getMenuByBranchId = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { skip_cache } = req.query;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    if (!branch.is_active) {
      return sendError(res, 'Esta sede no está activa', 403);
    }
    
    const menu = await menuService.getMenuByBranch(branchId, {
      skipCache: skip_cache === 'true',
      onlyAvailable: true,
    });
    
    sendSuccess(res, menu);
  } catch (error) {
    logger.error('Error in getMenuByBranchId:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /table/:tableId/menu
 * Obtiene el menú específico para una mesa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getMenuByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { skip_cache } = req.query;
    
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Mesa no encontrada', 404);
    }
    
    if (!table.is_active) {
      return sendError(res, 'Esta mesa no está activa', 403);
    }
    
    const menu = await menuService.getMenuByTable(tableId, {
      skipCache: skip_cache === 'true',
      onlyAvailable: true,
    });
    
    sendSuccess(res, menu);
  } catch (error) {
    logger.error('Error in getMenuByTable:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /:slug/featured
 * Obtiene productos destacados de un restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 10, branch_id } = req.query;
    
    const tenant = await Tenant.findBySlug(slug);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    let branchId = branch_id;
    if (!branchId) {
      const branches = await Branch.findByTenant(tenant.id, { onlyActive: true });
      if (branches.length === 0) {
        return sendError(res, 'No hay sedes disponibles', 404);
      }
      branchId = branches[0].id;
    }
    
    const products = await menuService.getFeaturedProducts(branchId, parseInt(limit));
    
    sendSuccess(res, { products, count: products.length });
  } catch (error) {
    logger.error('Error in getFeaturedProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /:slug/daily-menu
 * Obtiene el menú del día (para almuerzos ejecutivos)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getDailyMenu = async (req, res) => {
  try {
    const { slug } = req.params;
    const { branch_id } = req.query;
    
    const tenant = await Tenant.findBySlug(slug);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    let branchId = branch_id;
    if (!branchId) {
      const branches = await Branch.findByTenant(tenant.id, { onlyActive: true });
      if (branches.length === 0) {
        return sendError(res, 'No hay sedes disponibles', 404);
      }
      branchId = branches[0].id;
    }
    
    const dailyMenu = await menuService.getDailyMenu(branchId);
    
    if (!dailyMenu) {
      return sendError(res, 'No hay menú del día disponible', 404);
    }
    
    sendSuccess(res, dailyMenu);
  } catch (error) {
    logger.error('Error in getDailyMenu:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /:slug/search
 * Busca productos en el menú
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const searchProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { q, branch_id } = req.query;
    
    if (!q || q.length < 2) {
      return sendError(res, 'El término de búsqueda debe tener al menos 2 caracteres', 400);
    }
    
    const tenant = await Tenant.findBySlug(slug);
    if (!tenant) {
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    let branchId = branch_id;
    if (!branchId) {
      const branches = await Branch.findByTenant(tenant.id, { onlyActive: true });
      if (branches.length === 0) {
        return sendError(res, 'No hay sedes disponibles', 404);
      }
      branchId = branches[0].id;
    }
    
    const results = await menuService.searchProducts(branchId, q);
    
    sendSuccess(res, {
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    logger.error('Error in searchProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /branch/:branchId/status
 * Verifica el estado de una sede (abierta/cerrada)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getBranchStatus = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    const isOpen = await branchService.isBranchOpen(branchId);
    
    sendSuccess(res, {
      branch_id: branch.id,
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

/**
 * POST /branch/:branchId/check-delivery
 * Verifica cobertura de domicilio
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const checkDeliveryCoverage = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { address, lat, lng } = req.body;
    
    if (!address && (!lat || !lng)) {
      return sendError(res, 'Se requiere dirección o coordenadas', 400);
    }
    
    const coverage = await branchService.checkDeliveryCoverage(branchId, {
      address,
      lat,
      lng,
    });
    
    sendSuccess(res, coverage);
  } catch (error) {
    logger.error('Error in checkDeliveryCoverage:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getMenuBySlug,
  getMenuByBranchId,
  getMenuByTable,
  getFeaturedProducts,
  getDailyMenu,
  searchProducts,
  getBranchStatus,
  checkDeliveryCoverage,
};