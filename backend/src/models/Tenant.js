/**
 * ======================================================
 * ARCHIVO: Tenant.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Tenant.js
 * FASE: F1
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 13:00
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de restaurantes
 * (tenants). Define la estructura, validaciones y
 * operaciones CRUD para la tabla de tenants, incluyendo
 * creación, lectura, actualización y eliminación de
 * restaurantes en el sistema multi-tenant.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - slugify: Generación de slugs URL-amigables
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, slugify, uuid
 * - Es importado por: services/branchService.js,
 *   controllers/admin/authController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 13:00
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Tenant
 *    ✅ Métodos: create, findById, findBySlug, update, delete
 *    ✅ Validación de datos de entrada
 *    ✅ Generación automática de slug
 *    ✅ Método de búsqueda con paginación
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PRO: 'pro',
  PREMIUM: 'premium',
};

const DEFAULT_SETTINGS = {
  primary_color: '#FF6B35',
  secondary_color: '#25D366',
  font_family: 'system-ui, -apple-system, sans-serif',
  theme: 'light',
  currency: 'COP',
  language: 'es',
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de un tenant
 * @param {Object} data - Datos del tenant
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateTenant = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
    errors.push('El nombre del restaurante es requerido (mínimo 3 caracteres)');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  if (data.whatsapp_number) {
    const whatsappRegex = /^[0-9]{10,15}$/;
    if (!whatsappRegex.test(data.whatsapp_number.replace(/[^0-9]/g, ''))) {
      errors.push('El número de WhatsApp debe tener entre 10 y 15 dígitos');
    }
  }
  
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('El formato del correo electrónico no es válido');
    }
  }
  
  if (data.subscription_tier && !Object.values(SUBSCRIPTION_TIERS).includes(data.subscription_tier)) {
    errors.push(`Plan de suscripción no válido. Opciones: ${Object.values(SUBSCRIPTION_TIERS).join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Genera un slug único a partir del nombre
 * @param {string} name - Nombre del restaurante
 * @returns {string} Slug generado
 */
const generateSlug = (name) => {
  let slug = slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
  
  // Limitar longitud
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }
  
  return slug;
};

/**
 * Verifica si un slug ya existe
 * @param {string} slug - Slug a verificar
 * @param {string} excludeId - ID a excluir (para updates)
 * @returns {Promise<boolean>}
 */
const slugExists = async (slug, excludeId = null) => {
  let query = 'SELECT id FROM tenants WHERE slug = $1';
  const params = [slug];
  
  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }
  
  const result = await readQuery(query, params);
  return result.rows.length > 0;
};

/**
 * Genera un slug único añadiendo número si es necesario
 * @param {string} baseSlug - Slug base
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// ======================================================
// MODELO TENANT - CRUD
// ======================================================

/**
 * Crea un nuevo restaurante (tenant)
 * @param {Object} data - Datos del tenant
 * @returns {Promise<Object>} Tenant creado
 */
const create = async (data) => {
  // Validar datos
  const validation = validateTenant(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  const baseSlug = data.slug || generateSlug(data.name);
  const slug = await generateUniqueSlug(baseSlug);
  
  const settings = { ...DEFAULT_SETTINGS, ...data.settings };
  
  const query = `
    INSERT INTO tenants (
      id, name, slug, logo_url, primary_color, 
      whatsapp_number, email, phone, address, 
      is_active, subscription_tier, settings, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.name.trim(),
    slug,
    data.logo_url || null,
    data.primary_color || DEFAULT_SETTINGS.primary_color,
    data.whatsapp_number || null,
    data.email || null,
    data.phone || null,
    data.address || null,
    data.is_active !== undefined ? data.is_active : true,
    data.subscription_tier || SUBSCRIPTION_TIERS.BASIC,
    settings,
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca un tenant por ID
 * @param {string} id - ID del tenant
 * @returns {Promise<Object|null>} Tenant encontrado o null
 */
const findById = async (id) => {
  const query = 'SELECT * FROM tenants WHERE id = $1';
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca un tenant por slug
 * @param {string} slug - Slug del tenant
 * @returns {Promise<Object|null>} Tenant encontrado o null
 */
const findBySlug = async (slug) => {
  const query = 'SELECT * FROM tenants WHERE slug = $1 AND is_active = true';
  const result = await readQuery(query, [slug]);
  return result.rows[0] || null;
};

/**
 * Busca un tenant por email (para login)
 * @param {string} email - Email del tenant
 * @returns {Promise<Object|null>} Tenant encontrado o null
 */
const findByEmail = async (email) => {
  const query = 'SELECT * FROM tenants WHERE email = $1';
  const result = await readQuery(query, [email]);
  return result.rows[0] || null;
};

/**
 * Obtiene todos los tenants con paginación
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findAll = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 20;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM tenants WHERE 1=1';
  const params = [];
  let paramIndex = 1;
  
  // Filtro por estado
  if (options.is_active !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(options.is_active);
    paramIndex++;
  }
  
  // Filtro por búsqueda
  if (options.search) {
    query += ` AND (name ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`;
    params.push(`%${options.search}%`);
    paramIndex++;
  }
  
  // Ordenamiento
  const orderBy = options.orderBy || 'created_at';
  const orderDir = options.orderDir || 'DESC';
  query += ` ORDER BY ${orderBy} ${orderDir}`;
  
  // Paginación
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM tenants WHERE 1=1';
  const countParams = [];
  let countIndex = 1;
  
  if (options.is_active !== undefined) {
    countQuery += ` AND is_active = $${countIndex}`;
    countParams.push(options.is_active);
    countIndex++;
  }
  
  if (options.search) {
    countQuery += ` AND (name ILIKE $${countIndex} OR slug ILIKE $${countIndex})`;
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
 * Actualiza un tenant
 * @param {string} id - ID del tenant
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Tenant actualizado
 */
const update = async (id, data) => {
  // Verificar que existe
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Restaurante no encontrado');
  }
  
  // Construir query dinámica
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  const allowedFields = [
    'name', 'logo_url', 'primary_color', 'whatsapp_number',
    'email', 'phone', 'address', 'is_active', 'subscription_tier'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  
  // Actualizar settings (merge con existentes)
  if (data.settings) {
    const newSettings = { ...existing.settings, ...data.settings };
    updates.push(`settings = $${paramIndex}`);
    params.push(newSettings);
    paramIndex++;
  }
  
  // Si cambia el nombre, actualizar slug
  if (data.name && data.name !== existing.name) {
    const baseSlug = generateSlug(data.name);
    const newSlug = await generateUniqueSlug(baseSlug);
    updates.push(`slug = $${paramIndex}`);
    params.push(newSlug);
    paramIndex++;
  }
  
  if (updates.length === 0) {
    return existing;
  }
  
  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE tenants 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Elimina un tenant (soft delete o físico)
 * @param {string} id - ID del tenant
 * @param {boolean} hardDelete - Eliminación física (default false)
 * @returns {Promise<boolean>}
 */
const deleteTenant = async (id, hardDelete = false) => {
  if (hardDelete) {
    const query = 'DELETE FROM tenants WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  } else {
    // Soft delete - solo desactivar
    const query = 'UPDATE tenants SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  }
};

/**
 * Activa un tenant (soft delete revert)
 * @param {string} id - ID del tenant
 * @returns {Promise<boolean>}
 */
const activate = async (id) => {
  const query = 'UPDATE tenants SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id';
  const result = await writeQuery(query, [id]);
  return result.rows.length > 0;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  SUBSCRIPTION_TIERS,
  DEFAULT_SETTINGS,
  
  // Validación
  validateTenant,
  generateSlug,
  slugExists,
  generateUniqueSlug,
  
  // CRUD
  create,
  findById,
  findBySlug,
  findByEmail,
  findAll,
  update,
  deleteTenant,
  activate,
};