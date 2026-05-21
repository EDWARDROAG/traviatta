/**
 * ======================================================
 * ARCHIVO: redis.js
 * UBICACIÓN: menu-qr-system/backend/src/config/redis.js
 * FASE: F0
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-15 11:30
 *
 * 🎯 PROPÓSITO:
 * Configurar el cliente Redis para caché distribuida,
 * almacenamiento de sesiones JWT, rate limiting y
 * colas temporales. Soporta conexión con autenticación
 * y reintentos automáticos.
 *
 * 📦 DEPENDENCIAS:
 * - redis: Cliente Redis oficial v4
 * - dotenv: Variables de entorno
 *
 * 🔗 RELACIONES:
 * - Importa de: dotenv
 * - Es importado por: services/cacheService.js,
 *   middleware/rateLimit.js, services/queueService.js
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-15 11:30
 *    ✅ Creación inicial del archivo
 *    ✅ Configuración de cliente Redis con URL
 *    ✅ Manejo de eventos (connect, error, ready)
 *    ✅ Funciones de utilidad (get, set, del, exists)
 *    ✅ TTL automático para keys
 *    ✅ Health check y cierre graceful
 * ======================================================
 */

const redis = require('redis');
require('dotenv').config();

// ======================================================
// CONFIGURACIÓN DEL CLIENTE
// ======================================================

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6380',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Máximo de reintentos alcanzado');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 10000,
  },
  pingInterval: 30000,
};

// ======================================================
// CREACIÓN DEL CLIENTE PRINCIPAL
// ======================================================

const redisClient = redis.createClient(redisConfig);

// ======================================================
// EVENTOS DEL CLIENTE
// ======================================================

redisClient.on('connect', () => {
  console.log('🔄 Redis: Conectando al servidor...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis: Conexión establecida y lista para usar');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

redisClient.on('reconnecting', () => {
  console.warn('⚠️ Redis: Reconectando...');
});

redisClient.on('end', () => {
  console.warn('⚠️ Redis: Conexión cerrada');
});

// ======================================================
// FUNCIONES DE UTILIDAD PARA CACHÉ
// ======================================================

/**
 * Obtiene un valor del caché
 * @param {string} key - Clave del caché
 * @returns {Promise<any>} Valor deserializado o null
 */
const get = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`❌ Redis get error (key: ${key}):`, error.message);
    return null;
  }
};

/**
 * Guarda un valor en el caché con TTL opcional
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a guardar
 * @param {number} ttlSeconds - Tiempo de vida en segundos (opcional)
 * @returns {Promise<boolean>} True si se guardó correctamente
 */
const set = async (key, value, ttlSeconds = null) => {
  try {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`❌ Redis set error (key: ${key}):`, error.message);
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
    return await redisClient.del(keyArray);
  } catch (error) {
    console.error(`❌ Redis del error:`, error.message);
    return 0;
  }
};

/**
 * Verifica si una clave existe en el caché
 * @param {string} key - Clave a verificar
 * @returns {Promise<boolean>} True si existe
 */
const exists = async (key) => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`❌ Redis exists error (key: ${key}):`, error.message);
    return false;
  }
};

/**
 * Incrementa un contador atómicamente
 * @param {string} key - Clave del contador
 * @param {number} increment - Valor a incrementar (default 1)
 * @param {number} ttlSeconds - TTL opcional para la clave
 * @returns {Promise<number>} Nuevo valor del contador
 */
const incr = async (key, increment = 1, ttlSeconds = null) => {
  try {
    let newValue;
    
    if (increment === 1) {
      newValue = await redisClient.incr(key);
    } else {
      newValue = await redisClient.incrBy(key, increment);
    }
    
    if (ttlSeconds && newValue === increment) {
      await redisClient.expire(key, ttlSeconds);
    }
    
    return newValue;
  } catch (error) {
    console.error(`❌ Redis incr error (key: ${key}):`, error.message);
    return 0;
  }
};

/**
 * Obtiene el TTL restante de una clave
 * @param {string} key - Clave a verificar
 * @returns {Promise<number>} TTL en segundos (-1 si no expira, -2 si no existe)
 */
const ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error(`❌ Redis ttl error (key: ${key}):`, error.message);
    return -2;
  }
};

/**
 * Limpia todas las claves del caché (usar con precaución)
 * @returns {Promise<boolean>} True si se limpió correctamente
 */
const flushAll = async () => {
  try {
    await redisClient.flushAll();
    console.log('🗑️ Redis: Caché completamente limpiado');
    return true;
  } catch (error) {
    console.error('❌ Redis flushAll error:', error.message);
    return false;
  }
};

// ======================================================
// FUNCIONES ESPECIALIZADAS POR DOMINIO
// ======================================================

/**
 * Obtiene el menú cacheado para una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<Object|null>} Menú cacheado o null
 */
const getCachedMenu = async (branchId) => {
  return get(`menu:branch:${branchId}`);
};

/**
 * Cachea el menú de una sede
 * @param {string} branchId - ID de la sede
 * @param {Object} menuData - Datos del menú
 * @param {number} ttlSeconds - TTL en segundos (default 300 = 5 min)
 * @returns {Promise<boolean>}
 */
const setCachedMenu = async (branchId, menuData, ttlSeconds = 300) => {
  return set(`menu:branch:${branchId}`, menuData, ttlSeconds);
};

/**
 * Invalida el caché del menú para una sede
 * @param {string} branchId - ID de la sede
 * @returns {Promise<boolean>}
 */
const invalidateMenuCache = async (branchId) => {
  return del(`menu:branch:${branchId}`);
};

/**
 * Obtiene el contador de rate limit para una IP/tenant
 * @param {string} identifier - Identificador (IP, tenant slug)
 * @param {number} windowSeconds - Ventana de tiempo en segundos
 * @returns {Promise<number>} Número de peticiones en la ventana
 */
const getRateLimitCount = async (identifier, windowSeconds = 60) => {
  const key = `ratelimit:${identifier}`;
  return await incr(key, 1, windowSeconds);
};

/**
 * Guarda una sesión de usuario
 * @param {string} token - Token JWT
 * @param {Object} userData - Datos del usuario
 * @param {number} ttlSeconds - TTL (default 7 días)
 * @returns {Promise<boolean>}
 */
const setSession = async (token, userData, ttlSeconds = 604800) => {
  return set(`session:${token}`, userData, ttlSeconds);
};

/**
 * Obtiene una sesión de usuario
 * @param {string} token - Token JWT
 * @returns {Promise<Object|null>}
 */
const getSession = async (token) => {
  return get(`session:${token}`);
};

/**
 * Elimina una sesión de usuario (logout)
 * @param {string} token - Token JWT
 * @returns {Promise<boolean>}
 */
const deleteSession = async (token) => {
  return del(`session:${token}`);
};

// ======================================================
// HEALTH CHECK
// ======================================================

/**
 * Verifica el estado de la conexión Redis
 * @returns {Promise<Object>} Estado de la conexión
 */
const healthCheck = async () => {
  const startTime = Date.now();
  
  try {
    await redisClient.ping();
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency: `${latency}ms`,
      status: 'connected',
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      status: 'disconnected',
    };
  }
};

// ======================================================
// CIERRE GRACIOSO
// ======================================================

/**
 * Cierra la conexión a Redis
 */
const closeConnection = async () => {
  console.log('🔄 Redis: Cerrando conexión...');
  try {
    await redisClient.quit();
    console.log('✅ Redis: Conexión cerrada');
  } catch (error) {
    console.error('❌ Redis: Error al cerrar conexión:', error.message);
  }
};

process.on('SIGTERM', async () => {
  await closeConnection();
});

process.on('SIGINT', async () => {
  await closeConnection();
});

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  client: redisClient,
  
  get,
  set,
  del,
  exists,
  incr,
  ttl,
  flushAll,
  
  getCachedMenu,
  setCachedMenu,
  invalidateMenuCache,
  getRateLimitCount,
  setSession,
  getSession,
  deleteSession,
  
  healthCheck,
  closeConnection,
};