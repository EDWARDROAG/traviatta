/**
 * ======================================================
 * ARCHIVO: branchService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/branchService.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-22
 *
 * 🎯 PROPÓSITO:
 * Servicio de lógica de sedes, cobertura de domicilio,
 * módulos de branch y dashboard administrativo.
 *
 * 📦 DEPENDENCIAS:
 * - ../models/Branch
 * - ../models/BranchModule
 * - ../models/Order
 * - ../utils/geoUtils
 * - ./cacheService
 * - ../utils/logger
 *
 * 🔗 RELACIONES:
 * - Importa de: ../models, ../utils, ./cacheService
 * - Es importado por: controllers/public/orderController.js,
 *   controllers/public/menuController.js,
 *   controllers/admin/branchController.js
 * ======================================================
 */

const Branch = require('../models/Branch');
const BranchModule = require('../models/BranchModule');
const Order = require('../models/Order');
const geoUtils = require('../utils/geoUtils');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

const getBranchesByTenant = async (tenantId, options = {}) => {
  return Branch.findByTenant(tenantId, options);
};

const getBranchWithConfig = async (branchId) => {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error('Sede no encontrada');
  }

  const modules = await BranchModule.findByBranch(branchId);
  const availableModules = await BranchModule.findAvailableByBranch(branchId);
  const status = await Branch.isBranchOpen(branch);

  return {
    ...branch,
    modules,
    available_modules: availableModules,
    status,
  };
};

const createBranch = async (data) => {
  const branch = await Branch.create(data);
  try {
    await BranchModule.initializeModulesForBranch(branch.id);
  } catch (error) {
    logger.warn(`No se pudo inicializar módulos para la sede ${branch.id}: ${error.message}`);
  }
  return branch;
};

const updateBranch = async (branchId, data) => {
  return Branch.update(branchId, data);
};

const deleteBranch = async (branchId, hardDelete = false) => {
  return Branch.deleteBranch(branchId, hardDelete);
};

const getBranchDashboard = async (branchId) => {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error('Sede no encontrada');
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 7);

  const stats = await Order.getStats(branchId, startDate, endDate);
  const topProducts = await Order.getTopProducts(branchId, 10);

  return {
    branch_id: branchId,
    branch_name: branch.name,
    period: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    },
    stats,
    top_products: topProducts,
  };
};

const getBranchModules = async (branchId) => {
  return BranchModule.findByBranch(branchId);
};

const updateBranchModule = async (branchId, moduleName, config = {}) => {
  const existing = await BranchModule.findByBranchAndModule(branchId, moduleName);
  if (existing) {
    return BranchModule.update(existing.id, config);
  }

  return BranchModule.create({
    branch_id: branchId,
    module_name: moduleName,
    ...config,
  });
};

const invalidateDeliveryCache = async (branchId) => {
  const cacheKey = `branch:delivery:${branchId}`;
  await cacheService.del(cacheKey);
  return true;
};

const checkDeliveryCoverage = async (branchId, options = {}) => {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error('Sede no encontrada');
  }

  const { address, lat, lng } = options;
  if (!address && (lat === undefined || lng === undefined)) {
    throw new Error('Se requiere dirección o coordenadas para verificar cobertura');
  }

  const location = { address, lat, lng };
  const branchLocation = { lat: branch.latitude, lng: branch.longitude };
  const deliveryZones = branch.delivery_zones || [];
  const matchedZone = geoUtils.findCoveringZone(location, deliveryZones, branchLocation);

  const isCovered = Boolean(matchedZone);
  const cost = isCovered ? 0 : (branch.delivery_cost || 3000);

  return {
    branch_id: branchId,
    isCovered,
    cost,
    zone: matchedZone,
    free_delivery_min_amount: branch.free_delivery_min_amount || 30000,
  };
};

const isBranchOpen = async (branchId) => {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error('Sede no encontrada');
  }
  return Branch.isBranchOpen(branch);
};

const updateBranchSchedule = async (branchId, schedule) => {
  return Branch.update(branchId, { schedule });
};

module.exports = {
  getBranchesByTenant,
  getBranchWithConfig,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchDashboard,
  getBranchModules,
  updateBranchModule,
  invalidateDeliveryCache,
  checkDeliveryCoverage,
  isBranchOpen,
  updateBranchSchedule,
};
