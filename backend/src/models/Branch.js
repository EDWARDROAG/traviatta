/**
 * ======================================================
 * ARCHIVO: Branch.js
 * UBICACIÓN: menu-qr-system/backend/src/models/Branch.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 13:30
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de sedes/sucursales
 * de un restaurante. Define la estructura, validaciones
 * y operaciones CRUD para la tabla de branches,
 * incluyendo configuración de domicilio, horarios y
 * zonas de cobertura.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid
 * - Es importado por: services/branchService.js,
 *   controllers/admin/branchController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 13:30
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo Branch
 *    ✅ Métodos: create, findById, findByTenant, update, delete
 *    ✅ Configuración de zonas de domicilio
 *    ✅ Gestión de horarios por sede
 *    ✅ Validación de cobertura geográfica
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const DEFAULT_SCHEDULE = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '23:00', closed: false },
  saturday: { open: '10:00', close: '23:00', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false },
};

const DEFAULT_DELIVERY_SETTINGS = {
  enabled: true,
  estimated_time: '30-45',
  cost: 3000,
  free_delivery_min_amount: 30000,
  max_distance_km: 10,
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de una sede
 * @param {Object} data - Datos de la sede
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateBranch = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre de la sede es requerido (mínimo 2 caracteres)');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  if (!data.tenant_id) {
    errors.push('El ID del restaurante es requerido');
  }
  
  if (!data.address || data.address.trim().length < 5) {
    errors.push('La dirección es requerida');
  }
  
  if (data.phone && data.phone.replace(/[^0-9]/g, '').length < 7) {
    errors.push('El teléfono debe tener al menos 7 dígitos');
  }
  
  if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
    errors.push('Latitud inválida (debe estar entre -90 y 90)');
  }
  
  if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
    errors.push('Longitud inválida (debe estar entre -180 y 180)');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Valida una zona de domicilio
 * @param {Object} zone - Zona a validar
 * @returns {Object} { valid: boolean, error: string }
 */
const validateDeliveryZone = (zone) => {
  if (!zone.name || typeof zone.name !== 'string') {
    return { valid: false, error: 'El nombre de la zona es requerido' };
  }
  
  if (!zone.type || !['polygon', 'radius', 'neighborhoods'].includes(zone.type)) {
    return { valid: false, error: 'Tipo de zona inválido' };
  }
  
  if (zone.type === 'radius' && (!zone.lat || !zone.lng || !zone.radius)) {
    return { valid: false, error: 'Para zona de radio se requiere lat, lng y radius' };
  }
  
  if (zone.type === 'polygon' && (!zone.coordinates || zone.coordinates.length < 3)) {
    return { valid: false, error: 'Para zona de polígono se requieren al menos 3 coordenadas' };
  }
  
  return { valid: true, error: null };
};

// ======================================================
// MODELO BRANCH - CRUD
// ======================================================

/**
 * Crea una nueva sede
 * @param {Object} data - Datos de la sede
 * @returns {Promise<Object>} Sede creada
 */
const create = async (data) => {
  const validation = validateBranch(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  
  const schedule = { ...DEFAULT_SCHEDULE, ...data.schedule };
  const deliverySettings = { ...DEFAULT_DELIVERY_SETTINGS, ...data.delivery_settings };
  const deliveryZones = data.delivery_zones || [];
  
  const query = `
    INSERT INTO branches (
      id, tenant_id, name, address, phone, whatsapp_number,
      latitude, longitude, is_active, delivery_zones,
      delivery_cost, free_delivery_min_amount, schedule,
      settings, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *
  `;
  
  const params = [
    id,
    data.tenant_id,
    data.name.trim(),
    data.address.trim(),
    data.phone || null,
    data.whatsapp_number || null,
    data.latitude || null,
    data.longitude || null,
    data.is_active !== undefined ? data.is_active : true,
    deliveryZones,
    deliverySettings.cost,
    deliverySettings.free_delivery_min_amount,
    schedule,
    data.settings || {},
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca una sede por ID
 * @param {string} id - ID de la sede
 * @returns {Promise<Object|null>} Sede encontrada o null
 */
const findById = async (id) => {
  const query = 'SELECT * FROM branches WHERE id = $1';
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca todas las sedes de un restaurante
 * @param {string} tenantId - ID del restaurante
 * @param {Object} options - Opciones (incluir inactivas)
 * @returns {Promise<Array>} Lista de sedes
 */
const findByTenant = async (tenantId, options = {}) => {
  let query = 'SELECT * FROM branches WHERE tenant_id = $1';
  const params = [tenantId];
  
  if (options.onlyActive === true) {
    query += ' AND is_active = true';
  }
  
  query += ' ORDER BY created_at ASC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca sedes cercanas a una ubicación
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} radiusKm - Radio en kilómetros
 * @returns {Promise<Array>} Sedes cercanas
 */
const findNearby = async (lat, lng, radiusKm = 10) => {
  // Usando la fórmula del haversine para calcular distancia
  const query = `
    SELECT *,
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )) AS distance_km
    FROM branches
    WHERE is_active = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    HAVING distance_km <= $3
    ORDER BY distance_km ASC
  `;
  
  const result = await readQuery(query, [lat, lng, radiusKm]);
  return result.rows;
};

/**
 * Obtiene todas las sedes con paginación
 * @param {Object} options - Opciones de paginación y filtros
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const findAll = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 20;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT b.*, t.name as tenant_name FROM branches b LEFT JOIN tenants t ON b.tenant_id = t.id WHERE 1=1';
  const params = [];
  let paramIndex = 1;
  
  if (options.tenant_id) {
    query += ` AND b.tenant_id = $${paramIndex}`;
    params.push(options.tenant_id);
    paramIndex++;
  }
  
  if (options.is_active !== undefined) {
    query += ` AND b.is_active = $${paramIndex}`;
    params.push(options.is_active);
    paramIndex++;
  }
  
  if (options.search) {
    query += ` AND (b.name ILIKE $${paramIndex} OR b.address ILIKE $${paramIndex})`;
    params.push(`%${options.search}%`);
    paramIndex++;
  }
  
  query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await readQuery(query, params);
  
  // Contar total
  let countQuery = 'SELECT COUNT(*) FROM branches WHERE 1=1';
  const countParams = [];
  let countIndex = 1;
  
  if (options.tenant_id) {
    countQuery += ` AND tenant_id = $${countIndex}`;
    countParams.push(options.tenant_id);
    countIndex++;
  }
  
  if (options.is_active !== undefined) {
    countQuery += ` AND is_active = $${countIndex}`;
    countParams.push(options.is_active);
    countIndex++;
  }
  
  if (options.search) {
    countQuery += ` AND (name ILIKE $${countIndex} OR address ILIKE $${countIndex})`;
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
 * Actualiza una sede
 * @param {string} id - ID de la sede
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Sede actualizada
 */
const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Sede no encontrada');
  }
  
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  const allowedFields = [
    'name', 'address', 'phone', 'whatsapp_number',
    'latitude', 'longitude', 'is_active', 'delivery_cost',
    'free_delivery_min_amount'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(data[field]);
      paramIndex++;
    }
  }
  
  // Actualizar delivery_zones
  if (data.delivery_zones) {
    updates.push(`delivery_zones = $${paramIndex}`);
    params.push(data.delivery_zones);
    paramIndex++;
  }
  
  // Actualizar schedule (merge)
  if (data.schedule) {
    const newSchedule = { ...existing.schedule, ...data.schedule };
    updates.push(`schedule = $${paramIndex}`);
    params.push(newSchedule);
    paramIndex++;
  }
  
  // Actualizar settings (merge)
  if (data.settings) {
    const newSettings = { ...existing.settings, ...data.settings };
    updates.push(`settings = $${paramIndex}`);
    params.push(newSettings);
    paramIndex++;
  }
  
  if (updates.length === 0) {
    return existing;
  }
  
  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE branches 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Elimina una sede
 * @param {string} id - ID de la sede
 * @param {boolean} hardDelete - Eliminación física (default false)
 * @returns {Promise<boolean>}
 */
const deleteBranch = async (id, hardDelete = false) => {
  if (hardDelete) {
    const query = 'DELETE FROM branches WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  } else {
    const query = 'UPDATE branches SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id';
    const result = await writeQuery(query, [id]);
    return result.rows.length > 0;
  }
};

// ======================================================
// FUNCIONES DE DOMICILIO
// ======================================================

/**
 * Verifica si una dirección está dentro de la zona de domicilio
 * @param {Object} branch - Sede a verificar
 * @param {Object} location - Ubicación { lat, lng, address }
 * @returns {Promise<Object>} { isCovered, zone, cost, isFree }
 */
const checkDeliveryCoverage = async (branch, location) => {
  const deliveryZones = branch.delivery_zones || [];
  const deliverySettings = {
    cost: branch.delivery_cost || 3000,
    free_delivery_min_amount: branch.free_delivery_min_amount || 30000,
  };
  
  let isCovered = false;
  let matchedZone = null;
  
  for (const zone of deliveryZones) {
    // Validación simple por nombre de barrio (para MVP)
    if (zone.type === 'neighborhoods' && zone.neighborhoods) {
      if (zone.neighborhoods.some(hood => 
        location.address?.toLowerCase().includes(hood.toLowerCase())
      )) {
        isCovered = true;
        matchedZone = zone;
        break;
      }
    }
    
    // Validación por radio de distancia
    if (zone.type === 'radius' && branch.latitude && branch.longitude && location.lat && location.lng) {
      const distance = calculateDistance(
        branch.latitude, branch.longitude,
        location.lat, location.lng
      );
      if (distance <= zone.radius) {
        isCovered = true;
        matchedZone = zone;
        break;
      }
    }
  }
  
  return {
    isCovered,
    zone: matchedZone,
    cost: isCovered ? 0 : deliverySettings.cost,
    isFree: isCovered,
    free_delivery_min_amount: deliverySettings.free_delivery_min_amount,
  };
};

/**
 * Calcula la distancia entre dos puntos (fórmula de Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Verifica si la sede está abierta en este momento
 * @param {Object} branch - Sede a verificar
 * @returns {Promise<Object>} { isOpen, openTime, closeTime, nextOpen }
 */
const isBranchOpen = async (branch) => {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  
  const schedule = branch.schedule || DEFAULT_SCHEDULE;
  const todaySchedule = schedule[today];
  
  if (!todaySchedule || todaySchedule.closed) {
    return {
      isOpen: false,
      openTime: null,
      closeTime: null,
      nextOpen: findNextOpenDay(schedule, today),
    };
  }
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = timeToMinutes(todaySchedule.open);
  const closeTime = timeToMinutes(todaySchedule.close);
  
  const isOpen = currentTime >= openTime && currentTime <= closeTime;
  
  return {
    isOpen,
    openTime: todaySchedule.open,
    closeTime: todaySchedule.close,
    nextOpen: isOpen ? null : findNextOpenDay(schedule, today),
  };
};

/**
 * Convierte hora HH:MM a minutos
 * @param {string} timeStr - Hora en formato HH:MM
 * @returns {number} Minutos del día
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Encuentra el próximo día de apertura
 * @param {Object} schedule - Horario de la sede
 * @param {string} currentDay - Día actual
 * @returns {string} Próximo día de apertura
 */
const findNextOpenDay = (schedule, currentDay) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let currentIndex = days.indexOf(currentDay);
  
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const nextDay = days[nextIndex];
    const daySchedule = schedule[nextDay];
    if (daySchedule && !daySchedule.closed) {
      return nextDay;
    }
  }
  
  return null;
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  DEFAULT_SCHEDULE,
  DEFAULT_DELIVERY_SETTINGS,
  
  // Validación
  validateBranch,
  validateDeliveryZone,
  
  // CRUD
  create,
  findById,
  findByTenant,
  findNearby,
  findAll,
  update,
  deleteBranch,
  
  // Domicilio
  checkDeliveryCoverage,
  calculateDistance,
  isBranchOpen,
  timeToMinutes,
};