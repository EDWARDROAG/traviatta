/**
 * ======================================================
 * ARCHIVO: Category.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Category.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 14:30
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de categorías de
 * productos en el menú digital. Define la estructura,
 * validaciones y operaciones CRUD para la tabla de
 * categories, incluyendo soporte para horarios específicos
 * (desayunos, almuerzos, etc.) y asignación a módulos.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid
 * - Es importado por: services/menuService.js,
 *   controllers/admin/categoryController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 14:30
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Category
 *    ✅ Métodos CRUD completos
 *    ✅ Soporte de horarios por categoría
 *    ✅ Asignación a módulos (breakfast, lunch, fastfood, bar)
 *    ✅ Reordenamiento por display_order
 *    ✅ Activación/desactivación por sede
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const MODULE_TYPES = {
  BREAKFAST: 'breakfast',   // Desayunos
  LUNCH: 'lunch',           // Almuerzos
  FASTFOOD: 'fastfood',     // Comida rápida
  BAR: 'bar',               // Bar/Nocturno
  ALL: 'all',               // Todos los horarios
};

const DAYS_OF_WEEK = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de una categoría
 * @param {Object} data - Datos de la categoría
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateCategory = (data) => {
  const errors = [];
  
  if (!data.branch_id) {
    errors.push('El ID de la sede es requerido');
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre de la categoría es requerido (mínimo 2 caracteres)');
  }
  
  if (data.name && data.name.length > 50) {
    errors.push('El nombre no puede exceder 50 caracteres');
  }
  
  if (data.module_type && !Object.values(MODULE_TYPES).includes(data.module_type)) {
    errors.push(`Tipo de módulo inválido. Opciones: ${Object.values(MODULE_TYPES).join(', ')}`);
  }
  
  if (data.start_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.start_time)) {
    errors.push('Formato de hora inicio inválido (HH:MM)');
  }
  
  if (data.end_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.end_time)) {
    errors.push('Formato de hora fin inválido (HH:MM)');
  }
  
  if (data.days_of_week && Array.isArray(data.days_of_week)) {
    const validDays = Object.values(DAYS_OF_WEEK);
    for (const day of data.days_of_week) {
      if (!validDays.includes(day)) {
        errors.push(`Día inválido: ${day}. Debe ser 1-7 (Lunes a Domingo)`);
        break;
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Verifica si una categoría está disponible según hora y día
 * @param {Object} category - Categoría a verificar
 * @param {Date} now - Fecha actual (opcional)
 * @returns {boolean}
 */
const isCategoryAvailable = (category, now = new Date()) => {
  // Si no tiene horario definido, siempre disponible
  if (!category.start_time || !category.end_time) {
    return true;
  }
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = category.start_time.split(':').map(Number);
  const [endHour, endMinute] = category.end_time.split(':').map(Number);
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  let isTimeValid = false;
  
  // Manejar horarios que cruzan la medianoche
  if (endTimeMinutes < startTimeMinutes) {
    isTimeValid = currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
  } else {
    isTimeValid = currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
  }
  
  // Verificar días de la semana si están especificados
  let isDayValid = true;
  if (category.days_of_week && category.days_of_week.length > 0) {
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes...
    const currentDayNumber = currentDay === 0 ? 7 : currentDay; // Convertir a 1-7
    isDayValid = category.days_of_week.includes(currentDayNumber);
  }
  
  return isTimeValid && isDayValid;
};

/**
 * Filtra categorías por disponibilidad horaria
 * @param {Array} categories - Lista de categorías
 * @param {Date} now - Fecha actual
 * @returns {Array} Categorías disponibles
 */
const filterAvailableCategories = (categories, now = new Date()) => {
  return categories.filter(cat => isCategoryAvailable(cat, now));
};

// ======================================================
// MODELO CATEGORY - CRUD
// ======================================================

/**
 * Crea una nueva categoría
 * @param {Object} data - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
const create = async (data) => {
  const validation = validateCategory(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  
  // Obtener el siguiente display_order si no se especifica
  let displayOrder = data.display_order;
  if (displayOrder === undefined) {
    const maxOrderQuery = `
      SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
      FROM categories WHERE branch_id = $1
    `;
    const maxResult = await readQuery(maxOrderQuery, [data.branch_id]);
    displayOrder = maxResult.rows[0].next_order;
  }
  
  const query = `
    INSERT INTO categories (
      id, branch_id, name, description, icon, display_order,
      is_active, module_type, start_time, end_time, days_of_week,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.branch_id,
    data.name.trim(),
    data.description || null,
    data.icon || null,
    displayOrder,
    data.is_active !== undefined ? data.is_active : true,
    data.module_type || MODULE_TYPES.ALL,
    data.start_time || null,
    data.end_time || null,
    data.days_of_week || null,
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca una categoría por ID
 * @param {string} id - ID de la categoría
 * @returns {Promise<Object|null>} Categoría encontrada o null
 */
const findById = async (id) => {
  const query = `
    SELECT c.*, b.name as branch_name 
    FROM categories c 
    LEFT JOIN branches b ON c.branch_id = b.id 
    WHERE c.id = $1
  `;
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca todas las categorías de una sede
 * @param {string} branchId - ID de la sede
 * @param {Object} options - Opciones (incluir inactivas, filtrar por módulo)
 * @returns {Promise<Array>} Lista de categorías
 */
const findByBranch = async (branchId, options = {}) => {
  let query = `
    SELECT c.*, COUNT(p.id) as products_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_available = true
    WHERE c.branch_id = $1
  `;
  const params = [branchId];
  let paramIndex = 2;
  
  if (options.onlyActive === true) {
    query += ' AND c.is_active = true';
  }
  
  if (options.module_type && options.module_type !== MODULE_TYPES.ALL) {
    query += ` AND (c.module_type = $${paramIndex} OR c.module_type = '${MODULE_TYPES.ALL}')`;
    params.push(options.module_type);
    paramIndex++;
  }
  
  query += ' GROUP BY c.id ORDER BY c.display_order ASC, c.created_at ASC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca categorías disponibles según la hora actual
 * @param {string} branchId - ID de la sede
 * @param {Date} now - Fecha actual (opcional)
 * @returns {Promise<Array>} Categorías disponibles
 */
const findAvailableByBranch = async (branchId, now = new Date()) => {
  const categories = await findByBranch(branchId, { onlyActive: true });
  return filterAvailableCategories(categories, now);
};

/**
 * Obtiene todas las categorías con paginación
 * @param {Object} options - Opciones de paginación y filtros
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findAll = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 50;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT c.*, b.name as branch_name, b.tenant_id
    FROM categories c 
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
  
  if (options.tenant_id) {
    query += ` AND b.tenant_id = $${paramIndex}`;
    params.push(options.tenant_id);
    paramIndex++;
  }
  
  if (options.module_type) {
    query += ` AND c.module_type = $${paramIndex}`;
    params.push(options.module_type);
    paramIndex++;
  }
  
  if (options.is_active !== undefined) {
    query += ` AND c.is_active = $${paramIndex}`;
    params.push(options.is_active);
    paramIndex++;
  }
  
  if (options.search) {
    query += ` AND c.name ILIKE $${paramIndex}`;
    params.push(`%${options.search}%`);
    paramIndex++;
  }
  
  query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM categories c WHERE 1=1';
  const countParams = [];
  let countIndex = 1;
  
  if (options.branch_id) {
    countQuery += ` AND branch_id = $${countIndex}`;
    countParams.push(options.branch_id);
    countIndex++;
  }
  
  if (options.module_type) {
    countQuery += ` AND module_type = $${countIndex}`;
    countParams.push(options.module_type);
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
 * Actualiza una categoría
 * @param {string} id - ID de la categoría
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Categoría actualizada
 */
const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Categoría no encontrada');
  }
  
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  const allowedFields = [
    'name', 'description', 'icon', 'display_order',
    'is_active', 'module_type', 'start_time', 'end_time', 'days_of_week'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  
  if (updates.length === 0) {
    return existing;
  }
  
  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE categories 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Reordena múltiples categorías (actualiza display_order en batch)
 * @param {string} branchId - ID de la sede
 * @param {Array} categoryOrders - Array de { id, display_order }
 * @returns {Promise<boolean>}
 */
const updateMultipleOrders = async (branchId, categoryOrders) => {
  return await transaction(async (client) => {
    for (const item of categoryOrders) {
      const query = `
        UPDATE categories 
        SET display_order = $1, updated_at = NOW()
        WHERE id = $2 AND branch_id = $3
      `;
      await client.query(query, [item.display_order, item.id, branchId]);
    }
    return true;
  });
};

/**
 * Elimina una categoría
 * @param {string} id - ID de la categoría
 * @param {boolean} hardDelete - Eliminación física (default false)
 * @returns {Promise<boolean>}
 */
const deleteCategory = async (id, hardDelete = false) => {
  if (hardDelete) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  } else {
    const query = 'UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  }
};

/**
 * Activa una categoría
 * @param {string} id - ID de la categoría
 * @returns {Promise<boolean>}
 */
const activate = async (id) => {
  const query = 'UPDATE categories SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id';
  const result = await writeQuery(query, [id]);
  return result.rows.length > 0;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  MODULE_TYPES,
  DAYS_OF_WEEK,
  
  // Validación
  validateCategory,
  isCategoryAvailable,
  filterAvailableCategories,
  
  // CRUD
  create,
  findById,
  findByBranch,
  findAvailableByBranch,
  findAll,
  update,
  updateMultipleOrders,
  deleteCategory,
  activate,
};