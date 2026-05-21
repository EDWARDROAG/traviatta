/**
 * ======================================================
 * ARCHIVO: productController.js
 * UBICACIÓN: menu-qr-system/backend/src/controllers/admin/productController.js
 * FASE: F2
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 23:00
 *
 * 🎯 PROPÓSITO:
 * Controlador para la gestión completa de productos
 * en el panel administrativo. Maneja creación, edición,
 * eliminación, cambio de disponibilidad, y gestión
 * de imágenes de productos.
 *
 * 📦 DEPENDENCIAS:
 * - ../../models/Product: Modelo de productos
 * - ../../models/Category: Modelo de categorías
 * - ../../models/Branch: Modelo de sedes
 * - ../../config/cloudinary: Gestión de imágenes
 * - ../../services/menuService: Invalidación de caché
 * - ../../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../../models/*, ../../config/*, ../../services/*
 * - Es importado por: ../../routes/admin.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 23:00
 *    ✅ Creación inicial del archivo
 *    ✅ CRUD completo de productos
 *    ✅ Subida y gestión de imágenes
 *    ✅ Cambio masivo de disponibilidad
 *    ✅ Duplicación de productos
 *    ✅ Reordenamiento de productos
 *    ✅ Filtros y paginación
 * ======================================================
 */

const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Branch = require('../../models/Branch');
const cloudinary = require('../../config/cloudinary');
const menuService = require('../../services/menuService');
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
 * Verifica que la categoría pertenezca al restaurante autenticado
 * @param {string} categoryId - ID de la categoría
 * @param {string} tenantId - ID del restaurante
 * @returns {Promise<boolean>}
 */
const verifyCategoryOwnership = async (categoryId, tenantId) => {
  const category = await Category.findById(categoryId);
  if (!category) return false;
  
  const branch = await Branch.findById(category.branch_id);
  return branch && branch.tenant_id === tenantId;
};

// ======================================================
// CRUD DE PRODUCTOS
// ======================================================

/**
 * GET /admin/products
 * Obtiene todos los productos con paginación y filtros
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { page, limit, search, category_id, branch_id, is_available, is_featured } = req.query;
    
    const options = {
      page: page || 1,
      limit: limit || 20,
      search,
      category_id,
      branch_id,
      is_available,
      is_featured,
    };
    
    // Si se especifica branch_id, verificar pertenencia
    if (branch_id) {
      const branch = await Branch.findById(branch_id);
      if (!branch || branch.tenant_id !== tenantId) {
        return sendError(res, 'No tienes permiso para acceder a esta sede', 403);
      }
    }
    
    const result = await Product.findAll(options);
    
    sendSuccess(res, result);
  } catch (error) {
    logger.error('Error in getAllProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/products/:productId
 * Obtiene un producto por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const tenantId = req.user.tenant_id;
    
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }
    
    const category = await Category.findById(product.category_id);
    if (category) {
      const branch = await Branch.findById(category.branch_id);
      if (!branch || branch.tenant_id !== tenantId) {
        return sendError(res, 'No tienes permiso para acceder a este producto', 403);
      }
    }
    
    sendSuccess(res, product);
  } catch (error) {
    logger.error('Error in getProductById:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * GET /admin/category/:categoryId/products
 * Obtiene productos por categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.tenant_id;
    const { only_available } = req.query;
    
    const isValid = await verifyCategoryOwnership(categoryId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para acceder a esta categoría', 403);
    }
    
    const products = await Product.findByCategory(categoryId, {
      onlyAvailable: only_available === 'true',
    });
    
    sendSuccess(res, {
      category_id: categoryId,
      total: products.length,
      products,
    });
  } catch (error) {
    logger.error('Error in getProductsByCategory:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * POST /admin/products
 * Crea un nuevo producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const productData = req.body;
    
    if (!productData.category_id) {
      return sendError(res, 'El ID de la categoría es requerido', 400);
    }
    
    const isValid = await verifyCategoryOwnership(productData.category_id, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para crear productos en esta categoría', 403);
    }
    
    // Subir imagen si existe
    if (req.file) {
      const validation = cloudinary.validateImage(req.file);
      if (!validation.valid) {
        return sendError(res, validation.error, 400);
      }
      
      const uploadResult = await cloudinary.uploadFromBuffer(req.file.buffer, 'product');
      productData.image_url = uploadResult.url;
      productData.image_public_id = uploadResult.public_id;
    }
    
    const product = await Product.create(productData);
    
    // Invalidar caché del menú
    const category = await Category.findById(productData.category_id);
    if (category) {
      await menuService.invalidateMenuCache(category.branch_id);
    }
    
    logger.info(`Product created: ${product.name} (${product.id})`);
    
    sendSuccess(res, product, 201);
  } catch (error) {
    logger.error('Error in createProduct:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/products/:productId
 * Actualiza un producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const tenantId = req.user.tenant_id;
    const updateData = req.body;
    
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return sendError(res, 'Producto no encontrado', 404);
    }
    
    const category = await Category.findById(existingProduct.category_id);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este producto', 403);
    }
    
    // Subir nueva imagen si existe
    if (req.file) {
      const validation = cloudinary.validateImage(req.file);
      if (!validation.valid) {
        return sendError(res, validation.error, 400);
      }
      
      // Eliminar imagen anterior si existe
      if (existingProduct.image_public_id) {
        await cloudinary.deleteImage(existingProduct.image_public_id);
      }
      
      const uploadResult = await cloudinary.uploadFromBuffer(req.file.buffer, 'product');
      updateData.image_url = uploadResult.url;
      updateData.image_public_id = uploadResult.public_id;
    }
    
    const product = await Product.update(productId, updateData);
    
    await menuService.invalidateMenuCache(category.branch_id);
    
    logger.info(`Product updated: ${product.name} (${productId})`);
    
    sendSuccess(res, product);
  } catch (error) {
    logger.error('Error in updateProduct:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * DELETE /admin/products/:productId
 * Elimina un producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const tenantId = req.user.tenant_id;
    const { hard_delete } = req.query;
    
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }
    
    const category = await Category.findById(product.category_id);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para eliminar este producto', 403);
    }
    
    // Eliminar imagen de Cloudinary
    if (product.image_public_id) {
      await cloudinary.deleteImage(product.image_public_id);
    }
    
    const result = await Product.deleteProduct(productId, hard_delete === 'true');
    
    if (result) {
      await menuService.invalidateMenuCache(category.branch_id);
      logger.info(`Product deleted: ${product.name} (${productId})`);
      sendSuccess(res, { message: 'Producto eliminado correctamente' });
    } else {
      sendError(res, 'No se pudo eliminar el producto', 400);
    }
  } catch (error) {
    logger.error('Error in deleteProduct:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// GESTIÓN DE DISPONIBILIDAD
// ======================================================

/**
 * PUT /admin/products/:productId/availability
 * Cambia la disponibilidad de un producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const setProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { is_available } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (is_available === undefined) {
      return sendError(res, 'El estado de disponibilidad es requerido', 400);
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }
    
    const category = await Category.findById(product.category_id);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para modificar este producto', 403);
    }
    
    const updatedProduct = await Product.setAvailability(productId, is_available);
    
    await menuService.invalidateMenuCache(category.branch_id);
    
    logger.info(`Product ${product.name} availability changed to ${is_available}`);
    
    sendSuccess(res, updatedProduct);
  } catch (error) {
    logger.error('Error in setProductAvailability:', error.message);
    sendError(res, error.message, 500);
  }
};

/**
 * PUT /admin/products/availability/batch
 * Cambia disponibilidad de múltiples productos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const setMultipleAvailability = async (req, res) => {
  try {
    const { product_ids, is_available } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return sendError(res, 'Se requiere un array de IDs de productos', 400);
    }
    
    if (is_available === undefined) {
      return sendError(res, 'El estado de disponibilidad es requerido', 400);
    }
    
    // Verificar permisos para cada producto
    for (const productId of product_ids) {
      const product = await Product.findById(productId);
      if (product) {
        const category = await Category.findById(product.category_id);
        if (category) {
          const branch = await Branch.findById(category.branch_id);
          if (!branch || branch.tenant_id !== tenantId) {
            return sendError(res, `No tienes permiso para modificar el producto ${productId}`, 403);
          }
        }
      }
    }
    
    const result = await Product.setMultipleAvailability(product_ids, is_available);
    
    // Invalidar cachés de las sedes afectadas
    const affectedBranches = new Set();
    for (const productId of product_ids) {
      const product = await Product.findById(productId);
      if (product) {
        const category = await Category.findById(product.category_id);
        if (category) {
          affectedBranches.add(category.branch_id);
        }
      }
    }
    
    for (const branchId of affectedBranches) {
      await menuService.invalidateMenuCache(branchId);
    }
    
    logger.info(`Batch availability update: ${product_ids.length} products set to ${is_available}`);
    
    sendSuccess(res, {
      message: `${product_ids.length} productos actualizados`,
      updated_count: product_ids.length,
    });
  } catch (error) {
    logger.error('Error in setMultipleAvailability:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// REORDENAMIENTO
// ======================================================

/**
 * PUT /admin/category/:categoryId/products/reorder
 * Reordena productos en una categoría
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const reorderProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { products } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!products || !Array.isArray(products)) {
      return sendError(res, 'Se requiere un array de productos con orden', 400);
    }
    
    const isValid = await verifyCategoryOwnership(categoryId, tenantId);
    if (!isValid) {
      return sendError(res, 'No tienes permiso para modificar esta categoría', 403);
    }
    
    const result = await Product.updateMultipleOrders(categoryId, products);
    
    const category = await Category.findById(categoryId);
    if (category) {
      await menuService.invalidateMenuCache(category.branch_id);
    }
    
    sendSuccess(res, { message: 'Orden actualizado correctamente' });
  } catch (error) {
    logger.error('Error in reorderProducts:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// DUPLICACIÓN DE PRODUCTOS
// ======================================================

/**
 * POST /admin/products/:productId/duplicate
 * Duplica un producto
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const duplicateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const tenantId = req.user.tenant_id;
    const overrides = req.body;
    
    const originalProduct = await Product.findById(productId);
    if (!originalProduct) {
      return sendError(res, 'Producto no encontrado', 404);
    }
    
    const category = await Category.findById(originalProduct.category_id);
    if (!category) {
      return sendError(res, 'Categoría no encontrada', 404);
    }
    
    const branch = await Branch.findById(category.branch_id);
    if (!branch || branch.tenant_id !== tenantId) {
      return sendError(res, 'No tienes permiso para duplicar este producto', 403);
    }
    
    const newProduct = await Product.duplicate(productId, overrides);
    
    await menuService.invalidateMenuCache(category.branch_id);
    
    logger.info(`Product duplicated: ${originalProduct.name} -> ${newProduct.name}`);
    
    sendSuccess(res, newProduct, 201);
  } catch (error) {
    logger.error('Error in duplicateProduct:', error.message);
    sendError(res, error.message, 500);
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductAvailability,
  setMultipleAvailability,
  reorderProducts,
  duplicateProduct,
};