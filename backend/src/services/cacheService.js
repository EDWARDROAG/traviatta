/**
 * ======================================================
 * ARCHIVO: cacheService.js
 * UBICACIÓN: menu-qr-system/backend/src/services/cacheService.js
 * FASE: F5
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 18:30
 *
 * 🎯 PROPÓSITO:
 * Servicio centralizado para gestión de caché distribuida
 * utilizando Redis. Proporciona una capa de abstracción
 * para operaciones de caché con soporte de TTL, invalida-
 * ción por patrones, caché de respuestas de API, y
 * almacenamiento de sesiones.
 *
 * 📦 DEPENDENCIAS:
 * - ../config/redis: Cliente Redis configurado
 * - ../utils/logger: Logging estructurado
 *
 * 🔗 RELACIONES:
 * - Importa de: ../config/redis, ../utils/logger
 * - Es importado por: services/menuService.js,
 *   middleware/cache.js, services/orderService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 18:30
 *    ✅ Creación inicial del archivo
 *    ✅ Operaciones básicas de caché (get, set, del)
 *    ✅ Caché de respuestas de API con TTL
 *    ✅ Invalidez por patrones (wildcard)
 *    ✅ Caché de tags para invalidación selectiva
 *    ✅ Prevención de tormenta de caché (dog-pile)
 *    ✅ Estadísticas de hit/miss rate
 * ======================================================
 */

const redis = require('../config/redis');
const logger = require('../utils/logger');

// ======================================================
// CONSTANTES
// ======================================================

const DEFAULT_TTL = {
  API_RESPONSE: 300,      // 5 minutos para respuestas de API
  MENU: 300,              // 5 minutos para menús
  PRODUCT: 600,           // 10 minutos para productos individuales
  LIST: 1800,             // 30 minutos para listas
  SESSION: 604800,        // 7 días para sesiones
  STATIC: 86400,          // 24 horas para contenido estático
};

const CACHE_PREFIXES = {
  API: 'api:',
  MENU: 'menu:',
  PRODUCT: 'product:',
  CATEGORY: 'category:',
  BRANCH: 'branch:',
  SESSION: 'session:',
  TAG: 'tag:',
  STATS: 'stats:',
};

// Estadísticas de caché
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

// ======================================================
// OPERACIONES BÁSICAS
// ======================================================

/**
 * Obtiene un valor del caché
 * @param {string} key - Clave del caché
 * @returns {Promise<any>} Valor deserializado o null
 */
const get = async (key) => {
  try {
    const startTime = Date.now();
    const value = await redis.get(key);
    const duration = Date.now() - startTime;
    
    if (value !== null) {
      cacheStats.hits++;
      logger.debug(`Cache HIT: ${key} (${duration}ms)`);
      return value;
    } else {
      cacheStats.misses++;
      logger.debug(`Cache MISS: ${key} (${duration}ms)`);
      return null;
    }
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error.message);
    cacheStats.misses++;
    return null;
  }
};

/**
 * Guarda un valor en el caché
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a guardar
 * @param {number} ttlSeconds - Tiempo de vida en segundos
 * @returns {Promise<boolean>} True si se guardó correctamente
 */
const set = async (key, value, ttlSeconds = DEFAULT_TTL.API_RESPONSE) => {
  try {
    const startTime = Date.now();
    const result = await redis.set(key, value, ttlSeconds);
    const duration = Date.now() - startTime;
    
    if (result) {
      cacheStats.sets++;
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s, ${duration}ms)`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Elimina una o múltiples claves del caché
 * @param {string|string[]} keys - Clave(s) a eliminar
 * @returns {Promise<number>} Número de claves eliminadas
 */
const del = async (keys) => {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    if (keyArray.length === 0) return 0;
    
    const result = await redis.del(keyArray);
    cacheStats.deletes += result;
    
    logger.debug(`Cache DEL: ${keyArray.length} keys, removed ${result}`);
    return result;
  } catch (error) {
    logger.error(`Cache del error:`, error.message);
    return 0;
  }
};

/**
 * Verifica si una clave existe
 * @param {string} key - Clave a verificar
 * @returns {Promise<boolean>}
 */
const exists = async (key) => {
  try {
    return await redis.exists(key);
  } catch (error) {
    logger.error(`Cache exists error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Obtiene el TTL restante de una clave
 * @param {string} key - Clave a verificar
 * @returns {Promise<number>} TTL en segundos
 */
const ttl = async (key) => {
  try {
    return await redis.ttl(key);
  } catch (error) {
    logger.error(`Cache ttl error for key ${key}:`, error.message);
    return -2;
  }
};

// ======================================================
// CACHÉ DE RESPUESTAS DE API
// ======================================================

/**
 * Genera clave para caché de API
 * @param {string} reqPath - Ruta de la solicitud
 * @param {Object} reqQuery - Query parameters
 * @param {Object} reqParams - Parámetros de ruta
 * @returns {string} Clave generada
 */
const generateApiCacheKey = (reqPath, reqQuery = {}, reqParams = {}) => {
  const queryString = Object.keys(reqQuery).sort().map(k => `${k}=${reqQuery[k]}`).join('&');
  const paramsString = Object.keys(reqParams).sort().map(k => `${k}=${reqParams[k]}`).join('&');
  const cacheKey = `${CACHE_PREFIXES.API}${reqPath}`;
  
  if (queryString) {
    return `${cacheKey}?${queryString}`;
  }
  if (paramsString) {
    return `${cacheKey}|${paramsString}`;
  }
  return cacheKey;
};

/**
 * Obtiene respuesta cacheada de API
 * @param {string} reqPath - Ruta de la solicitud
 * @param {Object} reqQuery - Query parameters
 * @param {Object} reqParams - Parámetros de ruta
 * @returns {Promise<Object|null>} Respuesta cacheada
 */
const getCachedApiResponse = async (reqPath, reqQuery = {}, reqParams = {}) => {
  const key = generateApiCacheKey(reqPath, reqQuery, reqParams);
  const cached = await get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  return null;
};

/**
 * Guarda respuesta de API en caché
 * @param {string} reqPath - Ruta de la solicitud
 * @param {Object} response - Respuesta a guardar
 * @param {Object} reqQuery - Query parameters
 * @param {Object} reqParams - Parámetros de ruta
 * @param {number} ttlSeconds - TTL específico (opcional)
 * @returns {Promise<boolean>}
 */
const setCachedApiResponse = async (reqPath, response, reqQuery = {}, reqParams = {}, ttlSeconds = null) => {
  const key = generateApiCacheKey(reqPath, reqQuery, reqParams);
  const ttl = ttlSeconds || DEFAULT_TTL.API_RESPONSE;
  
  return await set(key, JSON.stringify(response), ttl);
};

/**
 * Invalida caché de API por patrón
 * @param {string} pattern - Patrón de búsqueda (ej: 'api:/menu/*')
 * @returns {Promise<number>} Número de claves eliminadas
 */
const invalidateApiCache = async (pattern) => {
  const fullPattern = `${CACHE_PREFIXES.API}${pattern}`;
  return await invalidateByPattern(fullPattern);
};

// ======================================================
// CACHÉ CON TAGS (Invalidación por categoría)
// ======================================================

/**
 * Guarda un valor en caché con tags asociados
 * @param {string} key - Clave principal
 * @param {any} value - Valor a guardar
 * @param {Array<string>} tags - Tags para invalidación
 * @param {number} ttlSeconds - TTL en segundos
 * @returns {Promise<boolean>}
 */
const setWithTags = async (key, value, tags = [], ttlSeconds = DEFAULT_TTL.API_RESPONSE) => {
  const result = await set(key, value, ttlSeconds);
  
  if (result && tags.length > 0) {
    // Guardar relación tag -> clave
    for (const tag of tags) {
      const tagKey = `${CACHE_PREFIXES.TAG}${tag}`;
      await redis.sadd(tagKey, key);
      await redis.expire(tagKey, ttlSeconds + 300); // TTL extendido
    }
  }
  
  return result;
};

/**
 * Invalida todas las claves asociadas a un tag
 * @param {string} tag - Tag a invalidar
 * @returns {Promise<number>} Número de claves eliminadas
 */
const invalidateByTag = async (tag) => {
  const tagKey = `${CACHE_PREFIXES.TAG}${tag}`;
  const keys = await redis.smembers(tagKey);
  
  if (keys && keys.length > 0) {
    await del(keys);
    await del(tagKey);
    logger.info(`Cache invalidated ${keys.length} keys by tag: ${tag}`);
    return keys.length;
  }
  
  return 0;
};

/**
 * Invalida múltiples tags
 * @param {Array<string>} tags - Lista de tags
 * @returns {Promise<number>} Total de claves eliminadas
 */
const invalidateByTags = async (tags) => {
  let total = 0;
  for (const tag of tags) {
    total += await invalidateByTag(tag);
  }
  return total;
};

// ======================================================
// INVALIDACIÓN POR PATRÓN (SCAN)
// ======================================================

/**
 * Invalida claves que coinciden con un patrón
 * @param {string} pattern - Patrón (ej: 'menu:branch:*')
 * @returns {Promise<number>} Número de claves eliminadas
 */
const invalidateByPattern = async (pattern) => {
  try {
    let cursor = '0';
    let deletedCount = 0;
    
    do {
      const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply.cursor;
      const keys = reply.keys;
      
      if (keys && keys.length > 0) {
        deletedCount += await del(keys);
      }
    } while (cursor !== '0');
    
    if (deletedCount > 0) {
      logger.info(`Cache invalidated ${deletedCount} keys by pattern: ${pattern}`);
    }
    
    return deletedCount;
  } catch (error) {
    logger.error(`Error invalidating pattern ${pattern}:`, error.message);
    return 0;
  }
};

// ======================================================
// PREVENCIÓN DE DOG-PILE EFFECT (Mutex)
// ======================================================

/**
 * Intenta adquirir un lock para regenerar caché
 * @param {string} key - Clave del lock
 * @param {number} ttlSeconds - Tiempo de vida del lock
 * @returns {Promise<boolean>} True si se adquirió el lock
 */
const acquireLock = async (key, ttlSeconds = 10) => {
  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, Date.now().toString(), ttlSeconds, 'NX');
  return result === 'OK';
};

/**
 * Libera un lock
 * @param {string} key - Clave del lock
 * @returns {Promise<boolean>}
 */
const releaseLock = async (key) => {
  const lockKey = `lock:${key}`;
  const result = await del(lockKey);
  return result > 0;
};

/**
 * Obtiene o regenera caché con protección contra dog-pile
 * @param {string} key - Clave del caché
 * @param {Function} fetchFunction - Función para regenerar datos
 * @param {number} ttlSeconds - TTL del caché
 * @returns {Promise<any>} Datos cacheados o regenerados
 */
const getOrSetWithMutex = async (key, fetchFunction, ttlSeconds = DEFAULT_TTL.API_RESPONSE) => {
  // Intentar obtener del caché
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Intentar adquirir lock
  const lockAcquired = await acquireLock(key);
  
  if (lockAcquired) {
    try {
      // Regenerar datos
      const freshData = await fetchFunction();
      await set(key, JSON.stringify(freshData), ttlSeconds);
      return freshData;
    } finally {
      await releaseLock(key);
    }
  } else {
    // Esperar a que otro proceso genere el caché
    let retries = 0;
    while (retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const retryCached = await get(key);
      if (retryCached !== null) {
        return retryCached;
      }
      retries++;
    }
    
    // Timeout, generar directamente
    const freshData = await fetchFunction();
    await set(key, JSON.stringify(freshData), ttlSeconds);
    return freshData;
  }
};

// ======================================================
// CACHÉ ESPECÍFICO POR DOMINIO
// ======================================================

/**
 * Obtiene menú cacheado
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object|null>}
 */
const getCachedMenu = async (branchId) => {
  const key = `${CACHE_PREFIXES.MENU}${branchId}`;
  const cached = await get(key);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Guarda menú en caché
 * @param {string} branchId - ID de la sede
 * @param {Object} menuData - Datos del menú
 * @param {number} ttlSeconds - TTL específico
 * @returns {Promise<boolean>}
 */
const setCachedMenu = async (branchId, menuData, ttlSeconds = DEFAULT_TTL.MENU) => {
  const key = `${CACHE_PREFIXES.MENU}${branchId}`;
  return await set(key, JSON.stringify(menuData), ttlSeconds);
};

/**
 * Invalida caché de menú por sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<number>}
 */
const invalidateMenuCache = async (branchId) => {
  const pattern = `${CACHE_PREFIXES.MENU}${branchId}`;
  return await invalidateByPattern(pattern);
};

/**
 * Invalida caché de menú por restaurante (todas las sedes)
 * @param {string} tenantId - ID del restaurante
 * @returns {Promise<number>}
 */
const invalidateAllMenusByTenant = async (tenantId) => {
  const pattern = `${CACHE_PREFIXES.MENU}*`;
  // Nota: Esto debería escanear y filtrar por tenant_id
  // Implementación simplificada
  return await invalidateByPattern(pattern);
};

// ======================================================
// ESTADÍSTICAS Y MONITOREO
// ======================================================

/**
 * Obtiene estadísticas de caché
 * @returns {Object} Estadísticas
 */
const getCacheStats = () => {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : 0;
  
  return {
    ...cacheStats,
    total_requests: total,
    hit_rate: `${hitRate}%`,
  };
};

/**
 * Reinicia estadísticas de caché
 */
const resetCacheStats = () => {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };
  logger.info('Cache stats reset');
};

/**
 * Limpia todo el caché (uso administrativo)
 * @returns {Promise<boolean>}
 */
const flushAll = async () => {
  try {
    await redis.flushAll();
    resetCacheStats();
    logger.warn('Cache FLUSH ALL executed');
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error.message);
    return false;
  }
};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  // Constantes
  DEFAULT_TTL,
  CACHE_PREFIXES,
  
  // Operaciones básicas
  get,
  set,
  del,
  exists,
  ttl,
  
  // Caché de API
  generateApiCacheKey,
  getCachedApiResponse,
  setCachedApiResponse,
  invalidateApiCache,
  
  // Tags
  setWithTags,
  invalidateByTag,
  invalidateByTags,
  
  // Patrones
  invalidateByPattern,
  
  // Mutex (dog-pile prevention)
  acquireLock,
  releaseLock,
  getOrSetWithMutex,
  
  // Caché específico por dominio
  getCachedMenu,
  setCachedMenu,
  invalidateMenuCache,
  invalidateAllMenusByTenant,
  
  // Estadísticas
  getCacheStats,
  resetCacheStats,
  flushAll,
};