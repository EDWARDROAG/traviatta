/**
 * ======================================================
 * ARCHIVO: categoryController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/categoryController.js
 * FASE: F2
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2026-05-23 12:50
 *
 * 🎯 PROPÓSITO:
 * Controlador para la gestión completa de categorías
 * en el panel administrativo.
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.1 - 2026-05-23 12:50
 *    ✅ Agregada función getAllCategories
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 00:00
 *    ✅ Creación inicial del archivo
 * ======================================================
 */

const Category = require('../../models/Category');
const Branch = require('../../models/Branch');
const Product = require('../../models/Product');
const menuService = require('../../services/menuService');
const logger = require('../../utils/logger');
const { readQuery } = require('../../config/database');

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
// CRUD DE CATEGORÍAS
// ======================================================

/**
 * 🔧 NUEVA FUNCIÓN: GET /admin/categories
 * Obtiene todas las categorías de todas las sedes del restaurante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllCategories = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { only_active, module_type, branch_id } = req.query;
    
    let query = `
      SELECT c.*, b.name as branch_name, b.id as branch_id
      FROM categories c
      JOIN branches b ON c.branch_id = b.id
      WHERE b.tenant_id = $1
    `;
    const params = [tenantId];
    let paramIndex = 2;
    
    if (only_active === 'true') {
      query += ` AND c.is_active = true`;
    }
    
    if (module_type) {
      query += ` AND c.module_type = $${paramIndex}`;
      params.push(module_type);
      paramIndex++;
    }
    
    if (branch_id) {
      query += ` AND c.branch_id = $${paramIndex}`;
      params.push(branch_id);
      paramIndex++;
    }
    
    query += ` ORDER BY b.name, c.display_order`;
    
    const result = await readQuery(query, params);
    
    sendSuccess(res, result.rows);
  } catch (error) {
    logger.error('Error in getAllCategories:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/branch/:branchId/categories
 * Obtiene todas las categorías de una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCategoriesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const { only_active, module_type } = req.query;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
    }
    
    const options = {
      onlyActive: only_active === 'true',
      module_type,
    };
    
    const categories = await Category.findByBranch(branchId, options);
    
    sendSuccess(res, {
      branch_id: branchId,
      total: categories.length,
      categories,
    });
  } catch (error) {
    logger.error('Error in getCategoriesByBranch:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/categories/:categoryId
 * Obtiene una categoría por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para acceder a esta categoría', 403);
    }
    
    // Obtener productos de la categoría
    const products = await Product.findByCategory(categoryId);
    
    sendSuccess(res, {
      ...category,
      products_count: products.length,
      products,
    });
  } catch (error) {
    logger.error('Error in getCategoryById:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/branch/:branchId/categories
 * Crea una nueva categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createCategory = async (req, res) => {
  try {
    const { branchId } = req.params;
    const tenantId = req.user.tenant_id;
    const categoryData = req.body;
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    categoryData.branch_id = branchId;
    
    const category = await Category.create(categoryData);
    
    await menuService.invalidateMenuCache(branchId);
    
    logger.info(`Category created: ${category.name} (${category.id})`);
    
    sendSuccess(res, category, 201);
  } catch (error) {
    logger.error('Error in createCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/categories/:categoryId
 * Actualiza una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    const updateData = req.body;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta categoría', 403);
    }
    
    const updatedCategory = await Category.update(categoryId, updateData);
    
    await menuService.invalidateMenuCache(category.branch_id);
    
    logger.info(`Category updated: ${updatedCategory.name} (${categoryId})`);
    
    sendSuccess(res, updatedCategory);
  } catch (error) {
    logger.error('Error in updateCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/categories/:categoryId
 * Elimina una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    const { hard_delete } = req.query;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para eliminar esta categoría', 403);
    }
    
    // Verificar si tiene productos asociados
    const products = await Product.findByCategory(categoryId);
    if (products.length > 0 && hard_delete !== 'true') {
      return sendError(res, `La categoría tiene ${products.length} productos asociados. Elimina los productos primero o usa hard_delete`, 400);
    }
    
    const result = await Category.deleteCategory(categoryId, hard_delete === 'true');
    
    if (result) {
      await menuService.invalidateMenuCache(category.branch_id);
      logger.info(`Category deleted: ${category.name} (${categoryId})`);
      sendSuccess(res, { message: 'Categoría eliminada correctamente' });
    } else {
      sendError(res, 'No se pudo eliminar la categoría', 400);
    }
  } catch (error) {
    logger.error('Error in deleteCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// ACTIVACIÓN/DESACTIVACIÓN
// ======================================================

/**
 * PUT /admin/categories/:categoryId/activate
 * Activa una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const activateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta categoría', 403);
    }
    
    const result = await Category.activate(categoryId);
    
    if (result) {
      await menuService.invalidateMenuCache(category.branch_id);
      sendSuccess(res, { message: 'Categoría activada correctamente' });
    } else {
      sendError(res, 'No se pudo activar la categoría', 400);
    }
  } catch (error) {
    logger.error('Error in activateCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/categories/:categoryId/deactivate
 * Desactiva una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deactivateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta categoría', 403);
    }
    
    const result = await Category.update(categoryId, { is_active: false });
    
    if (result) {
      await menuService.invalidateMenuCache(category.branch_id);
      sendSuccess(res, { message: 'Categoría desactivada correctamente' });
    } else {
      sendError(res, 'No se pudo desactivar la categoría', 400);
    }
  } catch (error) {
    logger.error('Error in deactivateCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// REORDENAMIENTO
// ======================================================

/**
 * PUT /admin/branch/:branchId/categories/reorder
 * Reordena categorías en una sede
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const reorderCategories = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { categories } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!categories || !Array.isArray(categories)) {
      return sendError(res, 'Se requiere un array de categorías con orden', 400);
    }
    
    const isValid = await verifyBranchOwnership(branchId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para modificar esta sede', 403);
    }
    
    const result = await Category.updateMultipleOrders(branchId, categories);
    
    await menuService.invalidateMenuCache(branchId);
    
    sendSuccess(res, { message: 'Orden actualizado correctamente' });
  } catch (error) {
    logger.error('Error in reorderCategories:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// CONFIGURACIÓN DE HORARIOS
// ======================================================

/**
 * PUT /admin/categories/:categoryId/schedule
 * Actualiza horarios de una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateCategorySchedule = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    const { start_time, end_time, days_of_week } = req.body;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar esta categoría', 403);
    }
    
    const updateData = {};
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (days_of_week !== undefined) updateData.days_of_week = days_of_week;
    
    const updatedCategory = await Category.update(categoryId, updateData);
    
    await menuService.invalidateMenuCache(category.branch_id);
    
    logger.info(`Schedule updated for category: ${category.name}`);
    
    sendSuccess(res, updatedCategory);
  } catch (error) {
    logger.error('Error in updateCategorySchedule:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getAllCategories,
  getCategoriesByBranch,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  activateCategory,
  deactivateCategory,
  reorderCategories,
  updateCategorySchedule,
};