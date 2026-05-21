/**
 * ======================================================
 * ARCHIVO: BranchModule.js
 * UBICACIÓN: menu-qr-system/backend/src/models/BranchModule.js
 * FASE: F3
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 16:00
 *
 * 🎯 PROPÓSITO:
 * Modelo de datos para la gestión de módulos activables
 * por sede. Permite al dueño del restaurante activar/
 * desactivar funcionalidades específicas como desayunos,
 * almuerzos, comida rápida, bar, domicilios y mesas.
 * Cada módulo puede tener su propia configuración y
 * horarios específicos.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/database: Conexión a PostgreSQL
 * - uuid: Generación de IDs únicos
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/database, uuid
 * - Es importado por: services/branchService.js,
 *   services/menuService.js,
 *   controllers/admin/branchController.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 16:00
 *    ✅ Creación inicial del archivo
 *    ✅ Definición del modelo BranchModule
 *    ✅ Módulos: breakfast, lunch, fastfood, bar, delivery, tables
 *    ✅ Configuración específica por módulo
 *    ✅ Horarios por módulo
 *    ✅ Métodos CRUD completos
 *    ✅ Verificación de disponibilidad por hora
 * ======================================================
 */

const { writeQuery, readQuery, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ======================================================
// CONSTANTES
// ======================================================

const MODULE_NAMES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  FASTFOOD: 'fastfood',
  BAR: 'bar',
  DELIVERY: 'delivery',
  TABLES: 'tables',
};

const MODULE_DISPLAY_NAMES = {
  [MODULE_NAMES.BREAKFAST]: 'Desayunos',
  [MODULE_NAMES.LUNCH]: 'Almuerzos',
  [MODULE_NAMES.FASTFOOD]: 'Comida Rápida',
  [MODULE_NAMES.BAR]: 'Bar',
  [MODULE_NAMES.DELIVERY]: 'Domicilios',
  [MODULE_NAMES.TABLES]: 'Servicio en Mesa',
};

const MODULE_ICONS = {
  [MODULE_NAMES.BREAKFAST]: '🌅',
  [MODULE_NAMES.LUNCH]: '🍽️',
  [MODULE_NAMES.FASTFOOD]: '🍔',
  [MODULE_NAMES.BAR]: '🍻',
  [MODULE_NAMES.DELIVERY]: '🚚',
  [MODULE_NAMES.TABLES]: '🪑',
};

const DEFAULT_MODULE_SETTINGS = {
  [MODULE_NAMES.BREAKFAST]: {
    end_time: '10:30',
    has_combos: true,
  },
  [MODULE_NAMES.LUNCH]: {
    start_time: '11:00',
    end_time: '15:00',
    has_soup_option: true,
    has_drink_option: true,
  },
  [MODULE_NAMES.FASTFOOD]: {
    start_time: '12:00',
    end_time: '22:00',
    allow_customization: true,
  },
  [MODULE_NAMES.BAR]: {
    start_time: '18:00',
    end_time: '02:00',
    happy_hour_enabled: false,
    happy_hour_start: '19:00',
    happy_hour_end: '21:00',
    happy_hour_discount: 20,
  },
  [MODULE_NAMES.DELIVERY]: {
    enabled: true,
    estimated_time: '30-45',
    min_amount: 15000,
    cost: 3000,
    free_delivery_min_amount: 30000,
    max_distance_km: 10,
  },
  [MODULE_NAMES.TABLES]: {
    enabled: true,
    allow_reservations: true,
    max_reservation_time_minutes: 120,
  },
};

// ======================================================
// VALIDACIONES
// ======================================================

/**
 * Valida los datos de un módulo
 * @param {Object} data - Datos del módulo
 * @returns {Object} { valid: boolean, errors: Array }
 */
const validateBranchModule = (data) => {
  const errors = [];
  
  if (!data.branch_id) {
    errors.push('El ID de la sede es requerido');
  }
  
  if (!data.module_name || !Object.values(MODULE_NAMES).includes(data.module_name)) {
    errors.push(`Nombre de módulo inválido. Opciones: ${Object.values(MODULE_NAMES).join(', ')}`);
  }
  
  if (data.schedule) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of days) {
      if (data.schedule[day]) {
        const { open, close } = data.schedule[day];
        if (open && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(open)) {
          errors.push(`Formato de hora inválido para ${day}.open (HH:MM)`);
        }
        if (close && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(close)) {
          errors.push(`Formato de hora inválido para ${day}.close (HH:MM)`);
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

/**
 * Verifica si un módulo está disponible según horario
 * @param {Object} branchModule - Módulo a verificar
 * @param {Date} now - Fecha actual (opcional)
 * @returns {boolean}
 */
const isModuleAvailable = (branchModule, now = new Date()) => {
  if (!branchModule.is_enabled) return false;
  
  const schedule = branchModule.schedule;
  if (!schedule) return true;
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDay = days[now.getDay()];
  const todaySchedule = schedule[currentDay];
  
  if (!todaySchedule || todaySchedule.closed) return false;
  if (!todaySchedule.open || !todaySchedule.close) return true;
  
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
  const [closeHour, closeMinute] = todaySchedule.close.split(':').map(Number);
  const openTimeMinutes = openHour * 60 + openMinute;
  const closeTimeMinutes = closeHour * 60 + closeMinute;
  
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes <= closeTimeMinutes;
  }
  
  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
};

/**
 * Obtiene los módulos disponibles según la hora actual
 * @param {Array} modules - Lista de módulos
 * @param {Date} now - Fecha actual
 * @returns {Array} Módulos disponibles
 */
const getAvailableModules = (modules, now = new Date()) => {
  return modules.filter(module => isModuleAvailable(module, now));
};

/**
 * Obtiene la configuración por defecto para un módulo
 * @param {string} moduleName - Nombre del módulo
 * @returns {Object} Configuración por defecto
 */
const getDefaultSettings = (moduleName) => {
  return DEFAULT_MODULE_SETTINGS[moduleName] || {};
};

// ======================================================
// MODELO BRANCH_MODULE - CRUD
// ======================================================

/**
 * Crea una nueva configuración de módulo para una sede
 * @param {Object} data - Datos del módulo
 * @returns {Promise<Object>} Módulo creado
 */
const create = async (data) => {
  const validation = validateBranchModule(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const id = uuidv4();
  
  const defaultSettings = getDefaultSettings(data.module_name);
  const settings = { ...defaultSettings, ...(data.settings || {}) };
  
  let schedule = data.schedule;
  if (!schedule) {
    const defaultSchedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of days) {
      defaultSchedule[day] = { open: null, close: null, closed: false };
    }
    schedule = defaultSchedule;
  }
  
  const query = `
    INSERT INTO branch_modules (
      id, branch_id, module_name, is_enabled, schedule, settings, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    ON CONFLICT (branch_id, module_name) DO UPDATE SET
      is_enabled = EXCLUDED.is_enabled,
      schedule = EXCLUDED.schedule,
      settings = EXCLUDED.settings,
      updated_at = NOW()
    RETURNING *
  `;
  
  const params = [
    id,
    data.branch_id,
    data.module_name,
    data.is_enabled !== undefined ? data.is_enabled : true,
    schedule,
    settings,
  ];
  
  const result = await writeQuery(query, params);
  return result.rows[0];
};

/**
 * Busca un módulo por ID
 * @param {string} id - ID del módulo
 * @returns {Promise<Object|null>} Módulo encontrado o null
 */
const findById = async (id) => {
  const query = `
    SELECT bm.*, br.name as branch_name, br.tenant_id
    FROM branch_modules bm
    LEFT JOIN branches br ON bm.branch_id = br.id
    WHERE bm.id = $1
  `;
  const result = await readQuery(query, [id]);
  return result.rows[0] || null;
};

/**
 * Busca un módulo por sede y nombre
 * @param {string} branchId - ID de la sede
 * @param {string} moduleName - Nombre del módulo
 * @returns {Promise<Object|null>} Módulo encontrado o null
 */
const findByBranchAndModule = async (branchId, moduleName) => {
  const query = `
    SELECT * FROM branch_modules 
    WHERE branch_id = $1 AND module_name = $2
  `;
  const result = await readQuery(query, [branchId, moduleName]);
  return result.rows[0] || null;
};

/**
 * Busca todos los módulos de una sede
 * @param {string} branchId - ID de la sede
 * @param {Object} options - Opciones (solo activos)
 * @returns {Promise<Array>} Lista de módulos
 */
const findByBranch = async (branchId, options = {}) => {
  let query = 'SELECT * FROM branch_modules WHERE branch_id = $1';
  const params = [branchId];
  
  if (options.onlyEnabled === true) {
    query += ' AND is_enabled = true';
  }
  
  query += ' ORDER BY module_name ASC';
  
  const result = await readQuery(query, params);
  return result.rows;
};

/**
 * Busca módulos disponibles según la hora actual
 * @param {string} branchId - ID de la sede
 * @param {Date} now - Fecha actual (opcional)
 * @returns {Promise<Array>} Módulos disponibles
 */
const findAvailableByBranch = async (branchId, now = new Date()) => {
  const modules = await findByBranch(branchId, { onlyEnabled: true });
  return getAvailableModules(modules, now);
};

/**
 * Actualiza un módulo
 * @param {string} id - ID del módulo
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Módulo actualizado
 */
const update = async (id, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error('Módulo no encontrado');
  }
  
  const updates = [];
  const params = [id];
  let paramIndex = 2;
  
  if (data.is_enabled !== undefined) {
    updates.push(`is_enabled = $${paramIndex}`);
    params.push(data.is_enabled);
    paramIndex++;
  }
  
  if (data.schedule) {
    const newSchedule = { ...existing.schedule, ...data.schedule };
    updates.push(`schedule = $${paramIndex}`);
    params.push(newSchedule);
    paramIndex++;
  }
  
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
    UPDATE branch_modules 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await writeQuery(query, params);
  return result.rows[0] || null;
};

/**
 * Habilita o deshabilita un módulo
 * @param {string} branchId - ID de la sede
 * @param {string} moduleName - Nombre del módulo
 * @param {boolean} isEnabled - Estado a establecer
 * @returns {Promise<Object|null>} Módulo actualizado
 */
const setEnabled = async (branchId, moduleName, isEnabled) => {
  const existing = await findByBranchAndModule(branchId, moduleName);
  
  if (existing) {
    return update(existing.id, { is_enabled: isEnabled });
  } else {
    return create({
      branch_id: branchId,
      module_name: moduleName,
      is_enabled: isEnabled,
    });
  }
};

/**
 * Elimina un módulo (raro de usar, normalmente se deshabilita)
 * @param {string} id - ID del módulo
 * @returns {Promise<boolean>}
 */
const deleteModule = async (id) => {
  const query = 'DELETE FROM branch_modules WHERE id = $1 RETURNING id';
  const result = await writeQuery(query, [id]);
  return result.rows.length > 0;
};

/**
 * Inicializa todos los módulos para una sede nueva
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Array>} Módulos creados
 */
const initializeModulesForBranch = async (branchId) => {
  const modules = [];
  
  for (const moduleName of Object.values(MODULE_NAMES)) {
    const module = await create({
      branch_id: branchId,
      module_name: moduleName,
      is_enabled: moduleName === MODULE_NAMES.DELIVERY,
    });
    modules.push(module);
  }
  
  return modules;
};

// ======================================================
// FUNCIONES DE CONFIGURACIÓN ESPECÍFICAS POR MÓDULO
// ======================================================

/**
 * Obtiene la configuración de horario de happy hour para bar
 * @param {Object} branchModule - Módulo de bar
 * @returns {Object} Configuración de happy hour
 */
const getHappyHourConfig = (branchModule) => {
  if (branchModule.module_name !== MODULE_NAMES.BAR) {
    return null;
  }
  
  const settings = branchModule.settings || {};
  return {
    enabled: settings.happy_hour_enabled || false,
    start: settings.happy_hour_start || '19:00',
    end: settings.happy_hour_end || '21:00',
    discount: settings.happy_hour_discount || 20,
  };
};

/**
 * Verifica si actualmente es happy hour
 * @param {Object} branchModule - Módulo de bar
 * @returns {boolean}
 */
const isHappyHour = (branchModule) => {
  const config = getHappyHourConfig(branchModule);
  if (!config || !config.enabled) return false;
  
  const now = new Date();
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = config.start.split(':').map(Number);
  const [endHour, endMinute] = config.end.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
};

/**
 * Obtiene la configuración de domicilio
 * @param {Object} branchModule - Módulo de delivery
 * @returns {Object} Configuración de domicilio
 */
const getDeliveryConfig = (branchModule) => {
  if (branchModule.module_name !== MODULE_NAMES.DELIVERY) {
    return null;
  }
  
  const settings = branchModule.settings || {};
  return {
    enabled: branchModule.is_enabled,
    estimated_time: settings.estimated_time || '30-45',
    min_amount: settings.min_amount || 15000,
    cost: settings.cost || 3000,
    free_delivery_min_amount: settings.free_delivery_min_amount || 30000,
    max_distance_km: settings.max_distance_km || 10,
  };
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  MODULE_NAMES,
  MODULE_DISPLAY_NAMES,
  MODULE_ICONS,
  DEFAULT_MODULE_SETTINGS,
  
  validateBranchModule,
  isModuleAvailable,
  getAvailableModules,
  getDefaultSettings,
  
  create,
  findById,
  findByBranchAndModule,
  findByBranch,
  findAvailableByBranch,
  update,
  setEnabled,
  deleteModule,
  initializeModulesForBranch,
  
  getHappyHourConfig,
  isHappyHour,
  getDeliveryConfig,
};