/**
 * ======================================================
 * ARCHIVO: menuController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/public/menuController.js
 * FASE: F1
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-21 16:00
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
// ENDPOINTS PRINCIPALES
// ======================================================

const getMenuBySlug = async (req, res) => {
  try {
    console.log('=== getMenuBySlug START ===');
    const { slug } = req.params;
    const { branch_id, skip_cache } = req.query;
    
    console.log('Slug:', slug);
    console.log('Branch ID:', branch_id);
    
    const tenant = await Tenant.findBySlug(slug);
    console.log('Tenant encontrado:', tenant ? tenant.id : 'NO');
    
    if (!tenant) {
      console.log('ERROR: Restaurante no encontrado para slug:', slug);
      return sendError(res, 'Restaurante no encontrado', 404);
    }
    
    let branchId = branch_id;
    
    if (!branchId) {
      console.log('Buscando sedes para tenant:', tenant.id);
      const branches = await Branch.findByTenant(tenant.id, { onlyActive: true });
      console.log('Sedes encontradas:', branches.length);
      if (branches.length === 0) {
        return sendError(res, 'No hay sedes disponibles para este restaurante', 404);
      }
      branchId = branches[0].id;
      console.log('Branch seleccionado:', branchId);
    }
    
    console.log('Verificando branch:', branchId);
    const branch = await Branch.findById(branchId);
    if (!branch || branch.tenant_id !== tenant.id) {
      console.log('ERROR: Sede no encontrada o no pertenece al tenant');
      return sendError(res, 'Sede no encontrada', 404);
    }
    
    console.log('Obteniendo menú para branch:', branchId);
    const menu = await menuService.getMenuByBranch(branchId, {
      skipCache: skip_cache === 'true',
      onlyAvailable: true,
    });
    console.log('Menú obtenido exitosamente');
    
    sendSuccess(res, menu);
  } catch (error) {
    console.error('=== ERROR EN getMenuBySlug ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    logger.error('Error in getMenuBySlug:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// RESTO DE FUNCIONES (sin cambios)
// ======================================================

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
    console.error('=== ERROR EN getMenuByBranchId ===', error);
    logger.error('Error in getMenuByBranchId:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN getMenuByTable ===', error);
    logger.error('Error in getMenuByTable:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN getFeaturedProducts ===', error);
    logger.error('Error in getFeaturedProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN getDailyMenu ===', error);
    logger.error('Error in getDailyMenu:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN searchProducts ===', error);
    logger.error('Error in searchProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN getBranchStatus ===', error);
    logger.error('Error in getBranchStatus:', error.message);
    sendError(res, error.message, 500);
  }
};

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
    console.error('=== ERROR EN checkDeliveryCoverage ===', error);
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