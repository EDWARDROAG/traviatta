/**
 * ======================================================
 * ARCHIVO: menuService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/menuService.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 16:30
 *
 * 🎯 PROPÓSITO:
 * Servicio principal para la obtención del menú digital
 * por sede. Implementa lógica de filtrado por horario,
 * disponibilidad de productos, y caché distribuido
 * para alto rendimiento. Integra categorías, productos,
 * módulos activables y horarios específicos.
 *
 * 📦 DEPENDENCIAS:
 * - ../models/Category: Modelo de categorías
 * - ../models/Product: Modelo de productos
 * - ../models/BranchModule: Modelo de módulos
 * - ../config/redis: Caché distribuido
 * - ../utils/logger: Logging
 *
 * 🔗 RELACIONES:
 * - Importa de: ../models/*, ../config/redis, ../utils/logger
 * - Es importado por: controllers/public/menuController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 16:30
 *    ✅ Creación inicial del archivo
 *    ✅ Obtención de menú completo por sede
 *    ✅ Filtrado por horario y módulos activos
 *    ✅ Integración con caché Redis
 *    ✅ Invalidador de caché en cambios
 *    ✅ Soporte para menú específico por mesa
 * ======================================================
 */

const Category = require('../models/Category');
const Product = require('../models/Product');
const BranchModule = require('../models/BranchModule');
const Branch = require('../models/Branch');
const redis = require('../config/redis');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const CACHE_TTL = {
  MENU: 300,        // 5 minutos para menú completo
  PRODUCT: 600,     // 10 minutos para productos individuales
  CATEGORY: 600,    // 10 minutos para categorías
};

// ======================================================
// FUNCIÓN PRINCIPAL - OBTENER MENÚ
// ======================================================

/**
 * Obtiene el menú completo para una sede
 * @param {string} branchId - ID de la sede
 * @param {Object} options - Opciones (incluir no disponibles, hora específica)
 * @returns {Promise<Object>} Menú estructurado
 */
const getMenuByBranch = async (branchId, options = {}) => {
  const startTime = Date.now();
  
  try {
    // Intentar obtener del caché (solo si no se fuerza refresco)
    if (!options.skipCache) {
      const cachedMenu = await redis.getCachedMenu(branchId);
      if (cachedMenu) {
        logger.debug(`Menu cache hit for branch: ${branchId}`);
        return cachedMenu;
      }
    }
    
    logger.debug(`Fetching menu from database for branch: ${branchId}`);
    
    // Obtener información de la sede
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new Error('Sede no encontrada');
    }
    
    // Determinar hora actual (o usar hora específica para pruebas)
    const now = options.currentTime ? new Date(options.currentTime) : new Date();
    
    // Obtener módulos activos disponibles según horario
    const availableModules = await BranchModule.findAvailableByBranch(branchId, now);
    const enabledModuleNames = availableModules.map(m => m.module_name);
    
    // Obtener categorías de la sede que pertenecen a módulos activos
    let categories = await Category.findByBranch(branchId, { onlyActive: true });
    
    // Filtrar categorías por módulos activos
    categories = categories.filter(category => {
      // Si la categoría es 'all', siempre visible
      if (category.module_type === 'all') return true;
      // Si no, debe estar en los módulos activos
      return enabledModuleNames.includes(category.module_type);
    });
    
    // Para cada categoría, obtener sus productos
    const menuCategories = [];
    
    for (const category of categories) {
      // Verificar disponibilidad horaria de la categoría
      if (!Category.isCategoryAvailable(category, now)) {
        continue;
      }
      
      // Obtener productos de la categoría
      let products = await Product.findByCategory(category.id, {
        onlyAvailable: options.onlyAvailable !== false, // Por defecto sí
      });
      
      // Filtrar productos no disponibles si se requiere
      if (options.onlyAvailable !== false) {
        products = products.filter(p => p.is_available === true);
      }
      
      // Si la categoría no tiene productos, omitirla
      if (products.length === 0 && options.hideEmptyCategories !== false) {
        continue;
      }
      
      menuCategories.push({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        module_type: category.module_type,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          image_url: p.image_url,
          is_available: p.is_available,
          is_featured: p.is_featured,
          preparation_time: p.preparation_time,
          tags: p.tags,
          modifiers: p.modifiers,
          allergens: p.allergens,
        })),
      });
    }
    
    // Construir respuesta completa
    const menu = {
      branch: {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        whatsapp_number: branch.whatsapp_number || branch.tenant_whatsapp,
        logo_url: branch.logo_url,
        primary_color: branch.primary_color,
        schedule: branch.schedule,
        is_open: await Branch.isBranchOpen(branch),
        delivery_settings: {
          cost: branch.delivery_cost,
          free_delivery_min_amount: branch.free_delivery_min_amount,
          has_delivery: enabledModuleNames.includes('delivery'),
        },
      },
      modules: availableModules.map(m => ({
        name: m.module_name,
        is_enabled: m.is_enabled,
        display_name: BranchModule.MODULE_DISPLAY_NAMES[m.module_name],
        icon: BranchModule.MODULE_ICONS[m.module_name],
      })),
      categories: menuCategories,
      last_updated: new Date().toISOString(),
    };
    
    // Guardar en caché
    if (!options.skipCache) {
      await redis.setCachedMenu(branchId, menu, CACHE_TTL.MENU);
    }
    
    const duration = Date.now() - startTime;
    logger.info(`Menu generated for branch ${branchId} in ${duration}ms`);
    
    return menu;
  } catch (error) {
    logger.error(`Error getting menu for branch ${branchId}:`, error.message);
    throw error;
  }
};

// ======================================================
// MENÚ POR MESA
// ======================================================

/**
 * Obtiene el menú específico para una mesa
 * @param {string} tableId - ID de la mesa
 * @param {Object} options - Opciones
 * @returns {Promise<Object>} Menú con información de mesa
 */
const getMenuByTable = async (tableId, options = {}) => {
  const Table = require('../models/Table');
  
  const table = await Table.findById(tableId);
  if (!table) {
    throw new Error('Mesa no encontrada');
  }
  
  const menu = await getMenuByBranch(table.branch_id, options);
  
  // Agregar información específica de la mesa
  return {
    ...menu,
    table: {
      id: table.id,
      number: table.table_number,
      name: table.table_name,
      capacity: table.capacity,
      status: table.status,
      qr_code: table.qr_code,
    },
    order_type: 'table',
  };
};

// ======================================================
// MENÚ SIMPLIFICADO (SOLO PRODUCTOS DESTACADOS)
// ======================================================

/**
 * Obtiene solo los productos destacados de una sede
 * @param {string} branchId - ID de la sede
 * @param {number} limit - Límite de productos
 * @returns {Promise<Array>} Lista de productos destacados
 */
const getFeaturedProducts = async (branchId, limit = 10) => {
  const cacheKey = `featured:${branchId}`;
  
  // Intentar caché
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const products = await Product.findFeaturedByBranch(branchId, limit);
  
  // Guardar en caché (1 hora)
  await redis.set(cacheKey, products, 3600);
  
  return products;
};

// ======================================================
// MENÚ DEL DÍA (ESPECIAL PARA ALMUERZOS)
// ======================================================

/**
 * Obtiene el menú del día (para almuerzos ejecutivos)
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object>} Menú del día
 */
const getDailyMenu = async (branchId) => {
  const cacheKey = `daily_menu:${branchId}`;
  const today = new Date().toISOString().split('T')[0];
  const cacheKeyWithDate = `${cacheKey}:${today}`;
  
  // Intentar caché
  const cached = await redis.get(cacheKeyWithDate);
  if (cached) {
    return cached;
  }
  
  // Obtener categoría de almuerzos
  const categories = await Category.findByBranch(branchId, {
    onlyActive: true,
    module_type: 'lunch',
  });
  
  if (categories.length === 0) {
    return null;
  }
  
  // Para cada categoría de almuerzo, obtener productos
  const dailyMenu = {
    date: today,
    categories: [],
  };
  
  for (const category of categories) {
    const products = await Product.findByCategory(category.id, {
      onlyAvailable: true,
    });
    
    dailyMenu.categories.push({
      id: category.id,
      name: category.name,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        image_url: p.image_url,
      })),
    });
  }
  
  // Guardar en caché por 1 hora
  await redis.set(cacheKeyWithDate, dailyMenu, 3600);
  
  return dailyMenu;
};

// ======================================================
// BÚSQUEDA DE PRODUCTOS
// ======================================================

/**
 * Busca productos en el menú de una sede
 * @param {string} branchId - ID de la sede
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Productos encontrados
 */
const searchProducts = async (branchId, query) => {
  if (!query || query.length < 2) {
    return [];
  }
  
  // Obtener todas las categorías de la sede
  const categories = await Category.findByBranch(branchId, { onlyActive: true });
  const categoryIds = categories.map(c => c.id);
  
  if (categoryIds.length === 0) {
    return [];
  }
  
  // Búsqueda en productos
  const allProducts = [];
  
  for (const categoryId of categoryIds) {
    const products = await Product.findByCategory(categoryId, {
      onlyAvailable: true,
    });
    
    // Filtrar por coincidencia en nombre o descripción
    const searchLower = query.toLowerCase();
    const matched = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
    
    allProducts.push(...matched);
  }
  
  // Limitar a 20 resultados
  return allProducts.slice(0, 20);
};

// ======================================================
// INVALIDACIÓN DE CACHÉ
// ======================================================

/**
 * Invalida el caché del menú para una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<boolean>}
 */
const invalidateMenuCache = async (branchId) => {
  const result = await redis.invalidateMenuCache(branchId);
  logger.info(`Menu cache invalidated for branch: ${branchId}`);
  return result;
};

/**
 * Invalida caché relacionado con productos (cuando se edita un producto)
 * @param {string} productId - ID del producto
 * @returns {Promise<void>}
 */
const invalidateProductRelatedCache = async (productId) => {
  const product = await Product.findById(productId);
  if (product && product.category_id) {
    const category = await Category.findById(product.category_id);
    if (category) {
      await invalidateMenuCache(category.branch_id);
    }
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Principal
  getMenuByBranch,
  getMenuByTable,
  
  // Variantes
  getFeaturedProducts,
  getDailyMenu,
  searchProducts,
  
  // Cache
  invalidateMenuCache,
  invalidateProductRelatedCache,
  
  // Constantes
  CACHE_TTL,
};