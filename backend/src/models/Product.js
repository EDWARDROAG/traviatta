/**
 * ======================================================
 * ARCHIVO: Product.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Product.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 15:00
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de productos del menú.
 * Define la estructura, validaciones y operaciones CRUD
 * para la tabla de products, incluyendo soporte para
 * modificadores/extras (queso extra, salsas, etc.),
 * alérgenos, etiquetas promocionales y disponibilidad.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid
 * - Es importado por: services/menuService.js,
 *   controllers/admin/productController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 15:00
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Product
 *    ✅ Métodos CRUD completos
 *    ✅ Soporte de modificadores (extras)
 *    ✅ Alérgenos y etiquetas
 *    ✅ Filtrado por disponibilidad
 *    ✅ Búsqueda y paginación
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const ALLERGEN_TYPES = {
  GLUTEN: 'gluten',
  LACTOSE: 'lacteos',
  NUTS: 'nueces',
  EGGS: 'huevos',
  SOY: 'soya',
  FISH: 'pescado',
  SHELLFISH: 'mariscos',
  SESAME: 'ajonjoli',
  SULFITES: 'sulfitos',
  CELERY: 'apio',
  MUSTARD: 'mostaza',
  LUPIN: 'altramuces',
  MOLLUSKS: 'moluscos',
};

const TAG_TYPES = {
  POPULAR: 'popular',
  NEW: 'nuevo',
  PROMOTION: 'promocion',
  LIMITED: 'limitado',
  VEGAN: 'vegano',
  VEGETARIAN: 'vegetariano',
  GLUTEN_FREE: 'sin_gluten',
  SPICY: 'picante',
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de un producto
 * @param {Object} data - Datos del producto
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateProduct = (data) => {
  const errors = [];
  
  if (!data.category_id) {
    errors.push('El ID de la categoría es requerido');
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre del producto es requerido (mínimo 2 caracteres)');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }
  
  if (data.price === undefined || data.price === null || data.price < 0) {
    errors.push('El precio es requerido y debe ser mayor o igual a 0');
  }
  
  if (data.price > 9999999) {
    errors.push('El precio no puede exceder 9,999,999');
  }
  
  if (data.preparation_time && (data.preparation_time < 1 || data.preparation_time > 180)) {
    errors.push('El tiempo de preparación debe estar entre 1 y 180 minutos');
  }
  
  if (data.allergens && Array.isArray(data.allergens)) {
    const validAllergens = Object.values(ALLERGEN_TYPES);
    for (const allergen of data.allergens) {
      if (!validAllergens.includes(allergen)) {
        errors.push(`Alérgeno inválido: ${allergen}`);
        break;
      }
    }
  }
  
  if (data.tags && Array.isArray(data.tags)) {
    const validTags = Object.values(TAG_TYPES);
    for (const tag of data.tags) {
      if (!validTags.includes(tag)) {
        errors.push(`Etiqueta inválida: ${tag}`);
        break;
      }
    }
  }
  
  if (data.modifiers && Array.isArray(data.modifiers)) {
    for (let i = 0; i < data.modifiers.length; i++) {
      const mod = data.modifiers[i];
      if (!mod.name || typeof mod.name !== 'string') {
        errors.push(`Modificador ${i}: nombre requerido`);
      }
      if (mod.price !== undefined && (typeof mod.price !== 'number' || mod.price < 0)) {
        errors.push(`Modificador ${i}: precio inválido`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// ======================================================
// MODELO PRODUCT - CRUD
// ======================================================

/**
 * Crea un nuevo producto
 * @param {Object} data - Datos del producto
 * @returns {Promise<Object>} Producto creado
 */
const create = async (data) => {
  const validation = validateProduct(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  
  // Obtener el siguiente display_order si no se especifica
  let displayOrder = data.display_order;
  if (displayOrder === undefined) {
    const maxOrderQuery = `
      SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
      FROM products WHERE category_id = $1
    `;
    const maxResult = await readQuery(maxOrderQuery, [data.category_id]);
    displayOrder = maxResult.rows[0].next_order;
  }
  
  const query = `
    INSERT INTO products (
      id, category_id, name, description, price, image_url, image_public_id,
      is_available, is_featured, display_order, preparation_time,
      allergens, tags, modifiers, branch_specific, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.category_id,
    data.name.trim(),
    data.description || null,
    data.price,
    data.image_url || null,
    data.image_public_id || null,
    data.is_available !== undefined ? data.is_available : true,
    data.is_featured || false,
    displayOrder,
    data.preparation_time || null,
    data.allergens || [],
    data.tags || [],
    data.modifiers || [],
    data.branch_specific || false,
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca un producto por ID
 * @param {string} id - ID del producto
 * @returns {Promise<Object|null>} Producto encontrado o null
 */
const findById = async (id) => {
  const query = `
    SELECT p.*, c.name as category_name, c.branch_id,
           b.name as branch_name, b.tenant_id
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN branches b ON c.branch_id = b.id
    WHERE p.id = $1
  `;
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca productos por categoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} options - Opciones (incluir no disponibles)
 * @returns {Promise<Array>} Lista de productos
 */
const findByCategory = async (categoryId, options = {}) => {
  let query = `
    SELECT * FROM products 
    WHERE category_id = $1
  `;
  const params = [categoryId];
  
  if (options.onlyAvailable === true) {
    query += ' AND is_available = true';
  }
  
  query += ' ORDER BY display_order ASC, created_at ASC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca productos destacados de una sede
 * @param {string} branchId - ID de la sede
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de productos destacados
 */
const findFeaturedByBranch = async (branchId, limit = 10) => {
  const query = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.branch_id = $1 
      AND p.is_featured = true 
      AND p.is_available = true
      AND c.is_active = true
    ORDER BY p.display_order ASC
    LIMIT $2
  `;
  const result = await readQuery(query, [branchId, limit]);
  return result.rows;
};

/**
 * Busca productos populares de una sede (más pedidos)
 * @param {string} branchId - ID de la sede
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de productos populares
 */
const findPopularByBranch = async (branchId, limit = 10) => {
  // Nota: Requiere tabla de order_items para estadísticas reales
  // Versión simplificada usando tags
  const query = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.branch_id = $1 
      AND p.is_available = true
      AND c.is_active = true
      AND 'popular' = ANY(p.tags)
    ORDER BY p.display_order ASC
    LIMIT $2
  `;
  const result = await readQuery(query, [branchId, limit]);
  return result.rows;
};

/**
 * Obtiene todos los productos con paginación
 * @param {Object} options - Opciones de paginación y filtros
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findAll = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 50;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT p.*, c.name as category_name, c.branch_id, b.name as branch_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN branches b ON c.branch_id = b.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;
  
  if (options.branch_id) {
    query += ` AND c.branch_id = $${paramIndex}`;
    params.push(options.branch_id);
    paramIndex++;
  }
  
  if (options.category_id) {
    query += ` AND p.category_id = $${paramIndex}`;
    params.push(options.category_id);
    paramIndex++;
  }
  
  if (options.is_available !== undefined) {
    query += ` AND p.is_available = $${paramIndex}`;
    params.push(options.is_available);
    paramIndex++;
  }
  
  if (options.is_featured !== undefined) {
    query += ` AND p.is_featured = $${paramIndex}`;
    params.push(options.is_featured);
    paramIndex++;
  }
  
  if (options.search) {
    query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    params.push(`%${options.search}%`);
    paramIndex++;
  }
  
  if (options.tag) {
    query += ` AND $${paramIndex} = ANY(p.tags)`;
    params.push(options.tag);
    paramIndex++;
  }
  
  query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM products p WHERE 1=1';
  const countParams = [];
  let countIndex = 1;
  
  if (options.category_id) {
    countQuery += ` AND category_id = $${countIndex}`;
    countParams.push(options.category_id);
    countIndex++;
  }
  
  if (options.is_available !== undefined) {
    countQuery += ` AND is_available = $${countIndex}`;
    countParams.push(options.is_available);
    countIndex++;
  }
  
  if (options.search) {
    countQuery += ` AND (name ILIKE $${countIndex} OR description ILIKE $${countIndex})`;
    countParams.push(`%${options.search}%`);
    countIndex++;
  }
  
  const countResult = await readQuery(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);
  
  return {
    data: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Actualiza un producto
 * @param {string} id - ID del producto
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Producto actualizado
 */
const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Producto no encontrado');
  }
  
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  const allowedFields = [
    'name', 'description', 'price', 'image_url', 'image_public_id',
    'is_available', 'is_featured', 'display_order', 'preparation_time',
    'allergens', 'tags', 'modifiers', 'branch_specific'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  
  // Permitir cambiar de categoría
  if (data.category_id !== undefined) {
    updates.push(`category_id = $${paramIndex}`);
    params.push(data.category_id);
    paramIndex++;
  }
  
  if (updates.length === 0) {
    return existing;
  }
  
  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE products 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Reordena múltiples productos (actualiza display_order en batch)
 * @param {string} categoryId - ID de la categoría
 * @param {Array} productOrders - Array de { id, display_order }
 * @returns {Promise<boolean>}
 */
const updateMultipleOrders = async (categoryId, productOrders) => {
  return await transaction(async (client) => {
    for (const item of productOrders) {
      const query = `
        UPDATE products 
        SET display_order = $1, updated_at = NOW()
        WHERE id = $2 AND category_id = $3
      `;
      await client.query(query, [item.display_order, item.id, categoryId]);
    }
    return true;
  });
};

/**
 * Cambia disponibilidad de un producto
 * @param {string} id - ID del producto
 * @param {boolean} isAvailable - Disponibilidad
 * @returns {Promise<Object|null>} Producto actualizado
 */
const setAvailability = async (id, isAvailable) => {
  return update(id, { is_available: isAvailable });
};

/**
 * Cambia disponibilidad de múltiples productos
 * @param {Array} ids - IDs de los productos
 * @param {boolean} isAvailable - Disponibilidad
 * @returns {Promise<boolean>}
 */
const setMultipleAvailability = async (ids, isAvailable) => {
  return await transaction(async (client) => {
    for (const id of ids) {
      const query = `
        UPDATE products 
        SET is_available = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(query, [isAvailable, id]);
    }
    return true;
  });
};

/**
 * Elimina un producto
 * @param {string} id - ID del producto
 * @param {boolean} hardDelete - Eliminación física (default false)
 * @returns {Promise<boolean>}
 */
const deleteProduct = async (id, hardDelete = false) => {
  if (hardDelete) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  } else {
    const query = 'UPDATE products SET is_available = false, updated_at = NOW() WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  }
};

/**
 * Duplica un producto (útil para variaciones)
 * @param {string} id - ID del producto a duplicar
 * @param {Object} overrides - Datos a sobrescribir
 * @returns {Promise<Object>} Producto duplicado
 */
const duplicate = async (id, overrides = {}) => {
  const original = await findById(id);
  if (!original) {
    throw new Error('Producto no encontrado');
  }
  
  const newProductData = {
    category_id: overrides.category_id || original.category_id,
    name: overrides.name || `${original.name} (copia)`,
    description: overrides.description || original.description,
    price: overrides.price || original.price,
    image_url: overrides.image_url || original.image_url,
    image_public_id: overrides.image_public_id || original.image_public_id,
    is_available: overrides.is_available !== undefined ? overrides.is_available : true,
    is_featured: overrides.is_featured !== undefined ? overrides.is_featured : false,
    preparation_time: overrides.preparation_time || original.preparation_time,
    allergens: overrides.allergens || original.allergens,
    tags: overrides.tags || original.tags,
    modifiers: overrides.modifiers || original.modifiers,
    branch_specific: overrides.branch_specific !== undefined ? overrides.branch_specific : false,
  };
  
  return create(newProductData);
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  ALLERGEN_TYPES,
  TAG_TYPES,
  
  // Validación
  validateProduct,
  
  // CRUD
  create,
  findById,
  findByCategory,
  findFeaturedByBranch,
  findPopularByBranch,
  findAll,
  update,
  updateMultipleOrders,
  setAvailability,
  setMultipleAvailability,
  deleteProduct,
  duplicate,
};