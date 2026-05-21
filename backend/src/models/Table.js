/**
 * ======================================================
 * ARCHIVO: Table.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Table.js
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 14:00
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de mesas en servicio
 * local. Define la estructura, validaciones y operaciones
 * CRUD para la tabla de mesas, incluyendo posicionamiento
 * visual en mapa interactivo, estados (libre/ocupada/
 * reservada/limpieza), y generación de QR por mesa.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 * - qrcode: Generación de QR para cada mesa
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid, qrcode
 * - Es importado por: services/tableService.js,
 *   controllers/admin/tableController.js,
 *   controllers/public/tableController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 14:00
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Table
 *    ✅ Estados de mesa: available, occupied, reserved, cleaning
 *    ✅ Métodos CRUD completos
 *    ✅ Gestión de posición en mapa (x, y, shape, size)
 *    ✅ Generación de QR único por mesa
 *    ✅ Cambio de estado con registro de tiempo
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// ======================================================
// CONSTANTES
// ======================================================

const TABLE_STATUS = {
  AVAILABLE: 'available',   // Libre
  OCCUPIED: 'occupied',     // Ocupada
  RESERVED: 'reserved',     // Reservada
  CLEANING: 'cleaning',     // En limpieza
};

const TABLE_SHAPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  RECTANGLE: 'rectangle',
};

const DEFAULT_TABLE_SIZE = {
  circle: { width: 60, height: 60 },
  square: { width: 60, height: 60 },
  rectangle: { width: 80, height: 60 },
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de una mesa
 * @param {Object} data - Datos de la mesa
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateTable = (data) => {
  const errors = [];
  
  if (!data.branch_id) {
    errors.push('El ID de la sede es requerido');
  }
  
  if (!data.table_number || typeof data.table_number !== 'string') {
    errors.push('El número de mesa es requerido');
  }
  
  if (data.table_number && data.table_number.length > 20) {
    errors.push('El número de mesa no puede exceder 20 caracteres');
  }
  
  if (data.capacity && (data.capacity < 1 || data.capacity > 20)) {
    errors.push('La capacidad debe estar entre 1 y 20 personas');
  }
  
  if (data.status && !Object.values(TABLE_STATUS).includes(data.status)) {
    errors.push(`Estado inválido. Opciones: ${Object.values(TABLE_STATUS).join(', ')}`);
  }
  
  if (data.shape && !Object.values(TABLE_SHAPES).includes(data.shape)) {
    errors.push(`Forma inválida. Opciones: ${Object.values(TABLE_SHAPES).join(', ')}`);
  }
  
  if (data.position_x !== undefined && (data.position_x < 0 || data.position_x > 2000)) {
    errors.push('Posición X inválida (0-2000)');
  }
  
  if (data.position_y !== undefined && (data.position_y < 0 || data.position_y > 2000)) {
    errors.push('Posición Y inválida (0-2000)');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Genera el contenido del QR para una mesa
 * @param {string} branchSlug - Slug de la sede
 * @param {string} tableId - ID de la mesa
 * @param {string} tableNumber - Número de mesa
 * @returns {string} URL para el QR
 */
const generateTableQRUrl = (branchSlug, tableId, tableNumber) => {
  // URL base desde variable de entorno o dominio por defecto
  const baseUrl = process.env.FRONTEND_URL || 'https://menu.dominio.com';
  return `${baseUrl}/mesa/${branchSlug}/${tableId}`;
};

/**
 * Genera imagen QR para una mesa
 * @param {string} url - URL para el QR
 * @returns {Promise<string>} DataURL de la imagen QR
 */
const generateQRImage = async (url) => {
  try {
    const qrDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error('❌ Error generando QR:', error.message);
    return null;
  }
};

// ======================================================
// MODELO TABLE - CRUD
// ======================================================

/**
 * Crea una nueva mesa
 * @param {Object} data - Datos de la mesa
 * @returns {Promise<Object>} Mesa creada
 */
const create = async (data) => {
  const validation = validateTable(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  
  // Determinar tamaño por defecto según forma
  const shape = data.shape || TABLE_SHAPES.CIRCLE;
  const defaultSize = DEFAULT_TABLE_SIZE[shape];
  
  const width = data.width || defaultSize.width;
  const height = data.height || defaultSize.height;
  
  const query = `
    INSERT INTO tables (
      id, branch_id, table_number, table_name, qr_code,
      capacity, position_x, position_y, shape, width, height,
      status, is_active, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.branch_id,
    data.table_number.trim(),
    data.table_name || null,
    data.qr_code || null,
    data.capacity || 4,
    data.position_x || 0,
    data.position_y || 0,
    shape,
    width,
    height,
    data.status || TABLE_STATUS.AVAILABLE,
    data.is_active !== undefined ? data.is_active : true,
  ];
  
  const result = await writeQuery(query, params);
  const table = result.rows[0];
  
  // Generar QR si no fue proporcionado
  if (!table.qr_code && data.branch_slug) {
    const qrUrl = generateTableQRUrl(data.branch_slug, table.id, table.table_number);
    const updated = await update(table.id, { qr_code: qrUrl });
    return updated;
  }
  
  return table;
};

/**
 * Busca una mesa por ID
 * @param {string} id - ID de la mesa
 * @returns {Promise<Object|null>} Mesa encontrada o null
 */
const findById = async (id) => {
  const query = `
    SELECT t.*, b.name as branch_name, b.slug as branch_slug 
    FROM tables t 
    LEFT JOIN branches b ON t.branch_id = b.id 
    WHERE t.id = $1
  `;
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca todas las mesas de una sede
 * @param {string} branchId - ID de la sede
 * @param {Object} options - Opciones (incluir inactivas, filtrar por estado)
 * @returns {Promise<Array>} Lista de mesas
 */
const findByBranch = async (branchId, options = {}) => {
  let query = 'SELECT * FROM tables WHERE branch_id = $1';
  const params = [branchId];
  let paramIndex = 2;
  
  if (options.onlyActive === true) {
    query += ' AND is_active = true';
  }
  
  if (options.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(options.status);
    paramIndex++;
  }
  
  query += ' ORDER BY table_number ASC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca mesas por estado
 * @param {string} branchId - ID de la sede
 * @param {string} status - Estado a filtrar
 * @returns {Promise<Array>} Lista de mesas
 */
const findByStatus = async (branchId, status) => {
  const query = `
    SELECT * FROM tables 
    WHERE branch_id = $1 AND status = $2 AND is_active = true
    ORDER BY table_number ASC
  `;
  const result = await readQuery(query, [branchId, status]);
  return result.rows;
};

/**
 * Obtiene todas las mesas con paginación
 * @param {Object} options - Opciones de paginación y filtros
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findAll = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 50;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT t.*, b.name as branch_name, b.tenant_id 
    FROM tables t 
    LEFT JOIN branches b ON t.branch_id = b.id 
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;
  
  if (options.branch_id) {
    query += ` AND t.branch_id = $${paramIndex}`;
    params.push(options.branch_id);
    paramIndex++;
  }
  
  if (options.tenant_id) {
    query += ` AND b.tenant_id = $${paramIndex}`;
    params.push(options.tenant_id);
    paramIndex++;
  }
  
  if (options.status) {
    query += ` AND t.status = $${paramIndex}`;
    params.push(options.status);
    paramIndex++;
  }
  
  if (options.is_active !== undefined) {
    query += ` AND t.is_active = $${paramIndex}`;
    params.push(options.is_active);
    paramIndex++;
  }
  
  query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM tables t WHERE 1=1';
  const countParams = [];
  let countIndex = 1;
  
  if (options.branch_id) {
    countQuery += ` AND branch_id = $${countIndex}`;
    countParams.push(options.branch_id);
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
 * Actualiza una mesa
 * @param {string} id - ID de la mesa
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Mesa actualizada
 */
const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Mesa no encontrada');
  }
  
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  const allowedFields = [
    'table_number', 'table_name', 'capacity', 'position_x', 'position_y',
    'shape', 'width', 'height', 'status', 'is_active', 'qr_code',
    'current_order_id'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  
  // Si se cambia el estado a occupied, guardar timestamp
  if (data.status === TABLE_STATUS.OCCUPIED && existing.status !== TABLE_STATUS.OCCUPIED) {
    updates.push(`occupied_since = NOW()`);
  }
  
  // Si se cambia a available, limpiar occupied_since y current_order_id
  if (data.status === TABLE_STATUS.AVAILABLE && existing.status === TABLE_STATUS.OCCUPIED) {
    updates.push(`occupied_since = NULL`);
    updates.push(`current_order_id = NULL`);
  }
  
  if (updates.length === 0) {
    return existing;
  }
  
  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE tables 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Cambia el estado de una mesa
 * @param {string} id - ID de la mesa
 * @param {string} status - Nuevo estado
 * @param {string} orderId - ID del pedido (opcional, para occupied)
 * @returns {Promise<Object|null>} Mesa actualizada
 */
const changeStatus = async (id, status, orderId = null) => {
  if (!Object.values(TABLE_STATUS).includes(status)) {
    throw new Error(`Estado inválido: ${status}`);
  }
  
  const updateData = { status };
  
  if (status === TABLE_STATUS.OCCUPIED && orderId) {
    updateData.current_order_id = orderId;
  }
  
  if (status === TABLE_STATUS.AVAILABLE) {
    updateData.current_order_id = null;
  }
  
  return update(id, updateData);
};

/**
 * Elimina una mesa (soft delete)
 * @param {string} id - ID de la mesa
 * @param {boolean} hardDelete - Eliminación física (default false)
 * @returns {Promise<boolean>}
 */
const deleteTable = async (id, hardDelete = false) => {
  if (hardDelete) {
    const query = 'DELETE FROM tables WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  } else {
    const query = 'UPDATE tables SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  }
};

// ======================================================
// FUNCIONES DE LAYOUT VISUAL
// ======================================================

/**
 * Obtiene el layout completo de mesas para el mapa visual
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object>} Layout con mesas y dimensiones del mapa
 */
const getTableLayout = async (branchId) => {
  const tables = await findByBranch(branchId, { onlyActive: true });
  
  // Calcular dimensiones del mapa basado en posiciones
  let maxX = 0, maxY = 0;
  for (const table of tables) {
    maxX = Math.max(maxX, (table.position_x || 0) + (table.width || 60));
    maxY = Math.max(maxY, (table.position_y || 0) + (table.height || 60));
  }
  
  return {
    tables: tables.map(table => ({
      id: table.id,
      table_number: table.table_number,
      table_name: table.table_name,
      capacity: table.capacity,
      position_x: table.position_x || 0,
      position_y: table.position_y || 0,
      shape: table.shape || 'circle',
      width: table.width || 60,
      height: table.height || 60,
      status: table.status,
      current_order_id: table.current_order_id,
      occupied_since: table.occupied_since,
      qr_code: table.qr_code,
    })),
    mapSize: {
      width: maxX + 100,
      height: maxY + 100,
    },
  };
};

/**
 * Reordena múltiples mesas (actualiza posiciones en batch)
 * @param {string} branchId - ID de la sede
 * @param {Array} tablePositions - Array de { id, position_x, position_y }
 * @returns {Promise<boolean>}
 */
const updateMultiplePositions = async (branchId, tablePositions) => {
  return await transaction(async (client) => {
    for (const item of tablePositions) {
      const query = `
        UPDATE tables 
        SET position_x = $1, position_y = $2, updated_at = NOW()
        WHERE id = $3 AND branch_id = $4
      `;
      await client.query(query, [item.position_x, item.position_y, item.id, branchId]);
    }
    return true;
  });
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  TABLE_STATUS,
  TABLE_SHAPES,
  DEFAULT_TABLE_SIZE,
  
  // Validación
  validateTable,
  generateTableQRUrl,
  generateQRImage,
  
  // CRUD
  create,
  findById,
  findByBranch,
  findByStatus,
  findAll,
  update,
  changeStatus,
  deleteTable,
  
  // Layout visual
  getTableLayout,
  updateMultiplePositions,
};